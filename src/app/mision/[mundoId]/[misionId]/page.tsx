"use client";

// Una misión del formato nuevo: bloques en orden, con Punti hablando arriba.
//
// Punti es el protagonista (decisión de Cami): cada bloque abre con lo que él
// dice, y él reacciona a lo que hace el piloto. Al final, la Ficha de misión.
//
// Economía (igual que las lecciones, para no abrir un hueco en las reglas de
// Firestore): XP y combustible salen de calcularXp según los errores y el
// tiempo, y el progreso se guarda con completarLeccion. Los errores en
// ejercicios cerrados gastan gasolina; transmitir en el Laboratorio, no.
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCatalogo } from "@/lib/contenido";
import { calcularXp, completarLeccion, gasolinaEfectiva, gasolinaIlimitada, gasolinaMaxima, gastarGasolina } from "@/lib/progreso";
import { obtenerPerfil } from "@/lib/userProfile";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import { rangoPorXp, type Escalon } from "@/lib/rangos";
import { cargarMision } from "@/lib/misiones/cargar";
import type { Dicho, PaqueteMision, Pieza } from "@/lib/misiones/tipos";
import { juegoDelMundo } from "@/lib/juegos/catalogo";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import BarraGasolina from "@/components/BarraGasolina";
import BotonSonido from "@/components/BotonSonido";
import TextoTecleado from "@/components/TextoTecleado";
import ConfirmarSalida from "@/components/ConfirmarSalida";
import BloqueMision, { BLOQUES_PASIVOS } from "@/components/mision/Bloques";
import FichaMision from "@/components/mision/FichaMision";
import type { RegistroLab, RegistroMision } from "@/components/mision/tipos";

type Fase = "cargando" | "jugando" | "sin-gasolina" | "guardando" | "ficha";

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    noEncontrada: "No encontramos esa misión.",
    volverMundo: "VOLVER AL MUNDO",
    salir: "SALIR",
    salirTitulo: "¿Salir de la misión?",
    salirTexto: "Tu avance en esta misión no se guarda. La gasolina que ya gastaste no vuelve.",
    seguir: "SEGUIR JUGANDO",
    punti: "PUNTI · TRANSMISIÓN",
    continuar: "CONTINUAR",
    despegar: "DESPEGAR",
    aterrizar: "ATERRIZAR",
    gasolina: "Gasolina",
    ilimitada: "Gasolina ilimitada",
    toca: "Toca el texto para verlo completo",
    sinGasTitulo: "Te quedaste sin gasolina",
    sinGasTexto: "Tu gasolina se recarga mañana. Vuelve entonces para seguir con esta misión.",
    recarga: "RECARGA JUGANDO",
    otraVez: "JUGAR LA MISION OTRA VEZ",
    noGuardo: "No pudimos guardar tu progreso. Revisa la conexión; la ficha sigue aquí.",
    guardando: "Guardando en la bitácora…",
  },
  en: {
    noEncontrada: "We couldn't find that mission.",
    volverMundo: "BACK TO THE WORLD",
    salir: "EXIT",
    salirTitulo: "Leave this mission?",
    salirTexto: "Your progress in this mission won't be saved. Fuel you already used doesn't come back.",
    seguir: "KEEP PLAYING",
    punti: "PUNTI · TRANSMISSION",
    continuar: "CONTINUE",
    despegar: "TAKE OFF",
    aterrizar: "LAND",
    gasolina: "Fuel",
    ilimitada: "Unlimited fuel",
    toca: "Tap the text to see all of it",
    sinGasTitulo: "You're out of fuel",
    sinGasTexto: "Your fuel refills tomorrow. Come back then to keep going with this mission.",
    recarga: "REFILL BY PLAYING",
    otraVez: "PLAY THE MISSION AGAIN",
    noGuardo: "We couldn't save your progress. Check your connection; your card is still here.",
    guardando: "Saving to the logbook…",
  },
};

const REGISTRO_VACIO: RegistroMision = { labs: {}, frase: "", conAyuda: [] };

export default function MisionPage({ params }: { params: Promise<{ mundoId: string; misionId: string }> }) {
  const { mundoId, misionId } = use(params);
  const router = useRouter();
  const idioma = useIdioma();
  const t = TX[idioma];
  const { usuario, cargando } = useAuth();
  const catalogo = useCatalogo();
  const volverAlMundo = `/tema/${mundoId}`;

  // undefined = cargando; null = no existe o no pasó el revisor.
  const [paquete, setPaquete] = useState<PaqueteMision | null | undefined>(undefined);
  const [fase, setFase] = useState<Fase>("cargando");
  const [indice, setIndice] = useState(0);
  const [completos, setCompletos] = useState<string[]>([]);
  const [registro, setRegistro] = useState<RegistroMision>(REGISTRO_VACIO);
  const [errores, setErrores] = useState(0);
  const [gasolina, setGasolina] = useState(0);
  const [ilimitada, setIlimitada] = useState(false);
  const [piloto, setPiloto] = useState("");
  // Lo último que dijo Punti y en qué bloque. Al pasar de bloque vuelve solo a
  // lo que abre el bloque nuevo (sin un efecto que lo reescriba).
  const [reaccion, setReaccion] = useState<{ clave: string; d: Dicho } | null>(null);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [resultado, setResultado] = useState<{ xp: number; combustible: 1 | 2 | 3; rangoNuevo: Escalon | null; guardado: boolean } | null>(null);
  const xpInicial = useRef(0);
  const inicio = useRef(0);
  // Para no gastar gasolina dos veces si el piloto toca rápido.
  const gastando = useRef(false);
  // La página se desplaza dentro de este contenedor, no la ventana.
  const scrollRef = useRef<HTMLDivElement>(null);
  const arriba = () => scrollRef.current?.scrollTo({ top: 0 });

  useEffect(() => {
    if (!cargando && !usuario) router.push("/login");
  }, [cargando, usuario, router]);

  useEffect(() => {
    let vigente = true;
    cargarMision(misionId).then((p) => {
      if (vigente) setPaquete(p && p.mundo === mundoId ? p : null);
    });
    return () => {
      vigente = false;
    };
  }, [misionId, mundoId]);

  const hayPaquete = Boolean(paquete);
  // Se depende del uid y no del objeto usuario: si el objeto cambiara (por
  // ejemplo, al refrescar la sesión) no hay que recargar el perfil, porque eso
  // devolvería al piloto al primer bloque en medio de la misión.
  const uid = usuario?.uid;
  useEffect(() => {
    if (!uid || !hayPaquete) return;
    obtenerPerfil(uid).then((perfil) => {
      setGasolina(perfil ? gasolinaEfectiva(perfil) : 0);
      setIlimitada(gasolinaIlimitada(perfil).activa);
      setPiloto((perfil?.nombre || "").split(" ")[0] || (idioma === "en" ? "Pilot" : "Piloto"));
      xpInicial.current = perfil?.xp ?? 0;
      inicio.current = Date.now();
      setFase("jugando");
    });
    // El idioma solo decide el nombre de respaldo; no hace falta recargar el perfil si cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, hayPaquete]);

  // Todas las piezas de la misión por id: colores y títulos compartidos entre bloques.
  const piezas = useMemo<Record<string, Pieza>>(() => {
    const todas: Record<string, Pieza> = {};
    paquete?.bloques.forEach((b) => {
      if (b.tipo === "piezas") b.piezas.forEach((p) => (todas[p.id] = p));
    });
    return todas;
  }, [paquete]);

  const bloque = paquete?.bloques[indice];

  // Cada bloque abre con lo que dice Punti; después habla por lo que hace el piloto.
  const claveActual = fase === "ficha" ? "ficha" : (bloque?.id ?? "");
  const dicho: Dicho | null = reaccion?.clave === claveActual ? reaccion.d : (bloque?.punti ?? null);
  const decir = useCallback((d: Dicho) => setReaccion({ clave: claveActual, d }), [claveActual]);
  const completar = useCallback(
    (conAyuda?: boolean) => {
      if (!bloque) return;
      const id = bloque.id;
      setCompletos((c) => (c.includes(id) ? c : [...c, id]));
      if (conAyuda) setRegistro((r) => (r.conAyuda.includes(id) ? r : { ...r, conAyuda: [...r.conAyuda, id] }));
    },
    [bloque],
  );
  const guardarLab = useCallback((id: string, r: RegistroLab) => setRegistro((reg) => ({ ...reg, labs: { ...reg.labs, [id]: r } })), []);
  const guardarFrase = useCallback((frase: string) => setRegistro((reg) => ({ ...reg, frase })), []);

  const fallar = useCallback(() => {
    setErrores((e) => e + 1);
    if (!usuario || ilimitada || gastando.current) return;
    gastando.current = true;
    gastarGasolina(usuario.uid)
      .then((queda) => {
        setGasolina(queda);
        if (queda <= 0) {
          setTimeout(() => sonar("sinGasolina"), 380);
          setFase("sin-gasolina");
        }
      })
      .catch(() => {
        // Sin conexión: el error cuenta para la nota; la gasolina se ajusta en la próxima escritura.
      })
      .finally(() => {
        gastando.current = false;
      });
  }, [usuario, ilimitada]);

  if (cargando || !usuario || !catalogo.listo || paquete === undefined) return <Cargando />;

  if (!paquete) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <PuntiPixel estado="error" ancho={112} />
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">{t.noEncontrada}</p>
        <Link href={volverAlMundo} transitionTypes={["atras"]} className="boton-pixel">
          {t.volverMundo}
        </Link>
      </div>
    );
  }

  if (fase === "cargando" || !bloque) return <Cargando />;

  async function terminar() {
    if (!usuario || !paquete) return;
    setFase("guardando");
    const datos = {
      errores,
      tiempoSegundos: Math.round((Date.now() - inicio.current) / 1000),
      tiempoObjetivoSegundos: paquete.minutos * 60,
    };
    const { xp, combustible } = calcularXp(datos);
    let guardado = true;
    try {
      await completarLeccion(usuario.uid, paquete.id, datos);
    } catch {
      guardado = false;
    }
    const antes = rangoPorXp(xpInicial.current).actual;
    const despues = rangoPorXp(xpInicial.current + xp).actual;
    const rangoNuevo = guardado && antes.id !== despues.id ? despues : null;
    sonar("completa");
    if (rangoNuevo) setTimeout(() => sonar("nivel"), 1500);
    setResultado({ xp: guardado ? xp : 0, combustible, rangoNuevo, guardado });
    setReaccion({
      clave: "ficha",
      d: {
      estado: "levelup",
      texto: {
        es: `Aterrizamos, ${piloto}. Esta es tu ficha de la misión: lo que aprendiste y lo que hiciste.`,
        en: `We've landed, ${piloto}. Here's your mission card: what you learned and what you did.`,
      },
      },
    });
    setFase("ficha");
    arriba();
  }

  function reiniciar() {
    setIndice(0);
    setCompletos([]);
    setRegistro(REGISTRO_VACIO);
    setErrores(0);
    setResultado(null);
    inicio.current = Date.now();
    setFase("jugando");
    arriba();
  }

  const etiquetaGasolina = ilimitada ? t.ilimitada : `${t.gasolina}: ${gasolina} / ${gasolinaMaxima()}`;
  const juego = catalogo.ajustes.juego.gasolinaPorJuego > 0 && catalogo.ajustes.juego.recargasJuegoDia > 0 ? juegoDelMundo(mundoId) : null;

  if (fase === "sin-gasolina") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <PuntiPixel estado="battery" ancho={144} />
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-black text-white">{t.sinGasTitulo}</h2>
        <BarraGasolina gasolina={0} maximo={gasolinaMaxima()} etiqueta={`${t.gasolina}: 0 / ${gasolinaMaxima()}`} alto={20} />
        <p className="max-w-md text-[15px] leading-[1.6] text-[var(--muted)]">{t.sinGasTexto}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {juego && (
            <Link href={`/juego/${juego.id}?volver=/mision/${mundoId}/${misionId}`} transitionTypes={["adelante"]} className="boton-pixel boton-pixel-oro">
              ⛽ {t.recarga}
            </Link>
          )}
          <Link href={volverAlMundo} transitionTypes={["atras"]} className="boton-pixel">
            {t.volverMundo}
          </Link>
        </div>
      </div>
    );
  }

  const listo = BLOQUES_PASIVOS.has(bloque.tipo) || completos.includes(bloque.id);
  const ultimo = indice === paquete.bloques.length - 1;
  const textoBoton = fase === "guardando" ? t.guardando : indice === 0 ? t.despegar : ultimo ? t.aterrizar : t.continuar;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)] px-4 py-3">
        {fase !== "ficha" ? (
          <button
            type="button"
            onClick={() => setConfirmarSalida(true)}
            className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink)]"
          >
            {t.salir}
          </button>
        ) : (
          <Link
            href={volverAlMundo}
            transitionTypes={["atras"]}
            className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--matrix)] hover:text-[var(--matrix)]"
          >
            ← {textoPixel(t.volverMundo)}
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">
            {paquete.titulo[idioma]}
          </p>
          <div className="mt-1.5 flex gap-1" aria-hidden="true">
            {paquete.bloques.map((b, k) => (
              <span
                key={b.id}
                className={`h-1.5 flex-1 ${
                  fase === "ficha" || k < indice
                    ? "bg-[var(--matrix)] shadow-[0_0_8px_rgba(0,255,65,0.5)]"
                    : k === indice
                      ? "bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]"
                      : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
        <BarraGasolina gasolina={ilimitada ? gasolinaMaxima() : gasolina} maximo={gasolinaMaxima()} etiqueta={etiquetaGasolina} alto={14} />
        <BotonSonido className="shrink-0" />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-8 pt-5">
        <div className="mx-auto grid w-full max-w-xl gap-4">
          {/* Punti habla: siempre arriba, en todos los bloques */}
          <div className="consola-leccion" aria-live="polite">
            <span className="consola-esquina consola-esquina-tl" />
            <span className="consola-esquina consola-esquina-br" />
            <div className="flex items-start gap-3 p-3.5">
              <PuntiPixel estado={dicho?.estado ?? "online"} recorte="busto" ancho={78} />
              <div className="min-w-0 flex-1">
                <p className="font-[family-name:var(--font-pixel)] text-[8px] leading-[1.8] text-[var(--matrix)]">{t.punti}</p>
                <p className="font-[family-name:var(--font-terminal)] text-[21px] leading-[1.18] text-[#d9ffe3]">
                  {dicho && <TextoTecleado key={`${idioma}-${dicho.texto[idioma]}`} texto={dicho.texto[idioma]} />}
                </p>
              </div>
            </div>
          </div>

          {fase === "ficha" && resultado ? (
            <>
              {!resultado.guardado && <p className="border-2 border-[var(--pink)] px-3 py-2 text-[14px] text-[var(--pink)]">{t.noGuardo}</p>}
              <FichaMision
                paquete={paquete}
                idioma={idioma}
                registro={registro}
                piloto={piloto}
                xp={resultado.xp}
                combustible={resultado.combustible}
                rangoNuevo={resultado.rangoNuevo}
                mundoNombre={(() => {
                  const tema = catalogo.temas.find((x) => x.id === mundoId);
                  return tema ? (idioma === "en" ? tema.en.nombre : tema.nombre) : undefined;
                })()}
              />
              <div className="flex flex-wrap gap-3">
                <Link href={volverAlMundo} transitionTypes={["atras"]} className="boton-pixel boton-pixel-lleno">
                  {t.volverMundo}
                </Link>
                <button type="button" onClick={reiniciar} className="boton-pixel" style={{ borderColor: "var(--cyan)", color: "var(--cyan)", background: "transparent" }}>
                  {t.otraVez}
                </button>
              </div>
            </>
          ) : (
            <>
              {bloque.titulo && (
                <h2 className="font-[family-name:var(--font-display)] text-[20px] font-black leading-tight text-white">{bloque.titulo[idioma]}</h2>
              )}
              <BloqueMision
                key={`${bloque.id}-${idioma}`}
                bloque={bloque}
                idioma={idioma}
                piezas={piezas}
                registro={registro}
                piloto={piloto}
                decir={decir}
                completar={completar}
                fallar={fallar}
                guardarLab={guardarLab}
                guardarFrase={guardarFrase}
              />
            </>
          )}
        </div>
      </div>

      {fase !== "ficha" && (
        <footer className="border-t-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.96)] px-4 py-3.5">
          <div className="mx-auto flex w-full max-w-xl">
            <button
              type="button"
              disabled={!listo || fase === "guardando"}
              onClick={() => {
                sonar("pantalla");
                if (ultimo) void terminar();
                else {
                  setIndice((i) => i + 1);
                  arriba();
                }
              }}
              className={`boton-pixel w-full disabled:cursor-not-allowed disabled:opacity-40 ${ultimo ? "boton-pixel-oro" : "boton-pixel-lleno"}`}
            >
              {textoBoton}
            </button>
          </div>
        </footer>
      )}

      {confirmarSalida && (
        <ConfirmarSalida
          titulo={t.salirTitulo}
          texto={t.salirTexto}
          seguir={t.seguir}
          salir={t.salir}
          alSeguir={() => setConfirmarSalida(false)}
          alSalir={() => router.push(volverAlMundo, { transitionTypes: ["atras"] })}
        />
      )}
    </div>
  );
}
