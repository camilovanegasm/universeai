// El navegador pide la revisión en vivo al servidor (/api/laboratorio).
// Manda el token de la sesión: así el servidor sabe quién es y Firestore
// aplica las reglas. Nunca manda la rúbrica ni las instrucciones de la IA:
// esas las carga el servidor.
import { auth } from "@/lib/firebase";
import type { Idioma } from "@/lib/i18n";
import type { EstadoPunti } from "@/lib/puntiSprite";

export type RespuestaVivo =
  | {
      modo: "vivo";
      salida: string;
      checks: Record<string, boolean>;
      punti: { estado: EstadoPunti; texto: string };
      aprobado: boolean;
      restantes: number;
    }
  | { modo: "simulado"; motivo: string; restantes: number | null };

const ESTADOS: EstadoPunti[] = ["boot", "online", "leyendo", "loading", "levelup", "hype", "battery", "error", "info"];

export async function transmitirVivo(datos: {
  misionId: string;
  bloqueId: string;
  prompt: string;
  idioma: Idioma;
  vista: boolean;
}): Promise<RespuestaVivo> {
  const usuario = auth.currentUser;
  if (!usuario) return { modo: "simulado", motivo: "sin-sesion", restantes: null };
  try {
    const token = await usuario.getIdToken();
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), 30_000);
    const r = await fetch("/api/laboratorio", {
      method: "POST",
      signal: control.signal,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    }).finally(() => clearTimeout(reloj));
    if (!r.ok) return { modo: "simulado", motivo: `http-${r.status}`, restantes: null };
    const j = (await r.json()) as RespuestaVivo;
    // Lo que llega se muestra como texto; igual se revisa la forma.
    if (j.modo === "vivo" && typeof j.salida === "string" && typeof j.punti?.texto === "string") {
      return { ...j, punti: { estado: ESTADOS.includes(j.punti.estado) ? j.punti.estado : "info", texto: j.punti.texto } };
    }
    if (j.modo === "simulado") return j;
    return { modo: "simulado", motivo: "forma", restantes: null };
  } catch {
    return { modo: "simulado", motivo: "red", restantes: null };
  }
}
