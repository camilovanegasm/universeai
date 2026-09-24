// POST /api/laboratorio — el Laboratorio en vivo (fase C1.3).
//
// El navegador manda SOLO: qué misión, qué bloque, el prompt del piloto, el
// idioma y si es la vista previa del admin. Todo lo demás (las instrucciones
// para la IA, la rúbrica) lo carga el servidor desde la misión publicada: nadie
// puede cambiarlo para usar la IA de Punti en otra cosa.
//
// Topes (números en Admin → Ajustes → LABORATORIO):
//   - por piloto al día (más para el Club) y total de la app al día;
//   - los cuenta Firestore y los hacen cumplir sus reglas (labValido y
//     laboratorio/{dia} en firestore.rules): ni el navegador ni el servidor
//     pueden saltárselos ni reiniciarlos.
//   - además, el límite de gasto del espacio de trabajo "Punti" en Anthropic.
//
// Si algo no deja usar la IA (tope, sin llave, Anthropic no responde), la
// respuesta dice `modo: "simulado"` y la app sigue con la revisión de práctica.
// Nadie se queda atascado.
import { NextResponse } from "next/server";
import type { Idioma } from "@/lib/i18n";
import type { BloqueDe, PaqueteMision } from "@/lib/misiones/tipos";
import { revisarPaquete } from "@/lib/misiones/revisar.mjs";
import { conSesion, ErrorFirestore, uidDelToken, type Documento } from "@/lib/servidor/firestoreRest";
import { revisarEnVivo } from "@/lib/servidor/anthropic";
import eco03 from "../../../../contenido/misiones/eco/03-la-tienda-de-dona-marta.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SEMILLA: PaqueteMision[] = [eco03 as unknown as PaqueteMision];
const MAX_PROMPT = 600;
const POR_DEFECTO = { labUsosPiloto: 15, labUsosClub: 40, labUsosDia: 2000 };

type Motivo = "sin-llave" | "apagado" | "tope-piloto" | "tope-global" | "ocupado" | "ia-no-responde" | "sin-mision";

const simulado = (motivo: Motivo, restantes: number | null = null) =>
  NextResponse.json({ modo: "simulado", motivo, restantes }, { headers: { "Cache-Control": "no-store" } });
const rechazo = (estado: number, error: string) =>
  NextResponse.json({ error }, { status: estado, headers: { "Cache-Control": "no-store" } });

/** Quita caracteres de control (menos saltos de línea y tabulaciones). */
const limpiar = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

const hoyUTC = () => new Date().toISOString().slice(0, 10);

export async function POST(pedido: Request) {
  // ---------- 1. Quién pide y qué pide
  const token = (pedido.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const uid = uidDelToken(token);
  if (!uid) return rechazo(401, "sesion");
  if (Number(pedido.headers.get("content-length") ?? 0) > 8_000) return rechazo(413, "muy-grande");

  let cuerpo: { misionId?: unknown; bloqueId?: unknown; prompt?: unknown; idioma?: unknown; vista?: unknown };
  try {
    // Se mide el texto real (un pedido sin content-length también se frena).
    const crudo = await pedido.text();
    if (crudo.length > 8_000) return rechazo(413, "muy-grande");
    cuerpo = JSON.parse(crudo);
  } catch {
    return rechazo(400, "json");
  }
  const misionId = typeof cuerpo.misionId === "string" && /^[a-z0-9-]{1,80}$/.test(cuerpo.misionId) ? cuerpo.misionId : null;
  const bloqueId = typeof cuerpo.bloqueId === "string" && /^b\d{2}$/.test(cuerpo.bloqueId) ? cuerpo.bloqueId : null;
  const idioma: Idioma = cuerpo.idioma === "en" ? "en" : "es";
  const vista = cuerpo.vista === true;
  const prompt = typeof cuerpo.prompt === "string" ? limpiar(cuerpo.prompt) : "";
  if (!misionId || !bloqueId || prompt.length < 12 || prompt.length > MAX_PROMPT) return rechazo(400, "datos");

  if (!process.env.ANTHROPIC_API_KEY) return simulado("sin-llave");
  const fs = conSesion(token);

  try {
    // ---------- 2. El perfil (esto también comprueba que el token sea válido)
    const perfilRuta = `usuarios/${uid}`;
    const [perfil, ajustes] = await Promise.all([fs.leer(perfilRuta), fs.leer("contenido/ajustes")]);
    if (!perfil.existe) return rechazo(401, "sesion");
    const juego = (ajustes.datos.juego ?? {}) as Record<string, unknown>;
    const numero = (k: keyof typeof POR_DEFECTO) =>
      typeof juego[k] === "number" && Number.isFinite(juego[k]) ? (juego[k] as number) : POR_DEFECTO[k];
    const topeDia = numero("labUsosDia");
    if (topeDia <= 0) return simulado("apagado");
    const topePiloto = perfil.datos.premium === true ? numero("labUsosClub") : numero("labUsosPiloto");

    // ---------- 3. La misión y el bloque (del servidor, nunca del navegador)
    // Las reglas deciden quién lee qué: el borrador solo el admin; una misión
    // del Club solo sus miembros. Si no la deja leer, no hay IA para esa misión.
    let paquete: unknown = null;
    try {
      paquete = vista
        ? ((await fs.leer(`borradores/mision-${misionId}`)).datos.paquete ?? null)
        : ((await fs.leer(`misiones/${misionId}`)).datos.paquete ?? SEMILLA.find((m) => m.id === misionId) ?? null);
    } catch (e) {
      if (e instanceof ErrorFirestore && e.estado === 403) return simulado("sin-mision");
      throw e;
    }
    if (!paquete || revisarPaquete(paquete).errores.length) return simulado("sin-mision");
    const bloque = (paquete as PaqueteMision).bloques.find(
      (b): b is BloqueDe<"laboratorio"> => b.id === bloqueId && b.tipo === "laboratorio",
    );
    if (!bloque) return simulado("sin-mision");

    // ---------- 4. Contar el uso (antes de gastar en la IA)
    let restantes = 0;
    let contado = false;
    for (let intento = 0; intento < 2 && !contado; intento++) {
      const dia = hoyUTC();
      const globalRuta = `laboratorio/${dia}`;
      const [yo, global]: [Documento, Documento] = await Promise.all([
        intento === 0 ? Promise.resolve(perfil) : fs.leer(perfilRuta),
        fs.leer(globalRuta),
      ]);
      const usosGlobal = typeof global.datos.usos === "number" ? global.datos.usos : 0;
      if (usosGlobal >= topeDia) return simulado("tope-global");
      const mismoDia = yo.datos.labDia === dia;
      const n = mismoDia && typeof yo.datos.labUsos === "number" ? yo.datos.labUsos + 1 : 1;
      if (n > topePiloto) return simulado("tope-piloto", 0);
      try {
        // El perfil, con condición (nadie más lo toca). El contador de la app
        // sube con un incremento de Firestore: muchos pilotos a la vez no chocan
        // y las reglas igual comprueban que suba de a 1 y no pase del tope.
        await fs.escribir([
          { ruta: perfilRuta, datos: { labUsos: n, labDia: dia }, leido: yo },
          { ruta: globalRuta, sumar: ["usos"] },
        ]);
        contado = true;
        restantes = topePiloto - n;
      } catch (e) {
        // 409/400: el perfil cambió en el medio → se intenta una vez más.
        // 403: las reglas dijeron que no (un tope) → modo práctica.
        // 401: la sesión venció → lo maneja el catch de afuera.
        if (e instanceof ErrorFirestore && e.estado === 403)
          return usosGlobal + 1 >= topeDia ? simulado("tope-global") : simulado("tope-piloto", 0);
        if (e instanceof ErrorFirestore && e.estado === 401) throw e;
      }
    }
    if (!contado) return simulado("ocupado");

    // ---------- 5. La IA
    try {
      const r = await revisarEnVivo(bloque, prompt, idioma);
      const cumplidos = Object.values(r.checks).filter(Boolean).length;
      const aprobado = cumplidos >= bloque.aprobar;
      return NextResponse.json(
        {
          modo: "vivo",
          salida: r.salida,
          checks: r.checks,
          punti: { estado: aprobado ? (cumplidos === bloque.checks.length ? "hype" : "levelup") : "battery", texto: r.punti },
          aprobado,
          restantes,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch {
      // El uso ya se contó: el tope protege igual si Anthropic falla en bucle.
      return simulado("ia-no-responde", restantes);
    }
  } catch (e) {
    if (e instanceof ErrorFirestore && (e.estado === 401 || e.estado === 403)) return rechazo(401, "sesion");
    return simulado("ocupado");
  }
}
