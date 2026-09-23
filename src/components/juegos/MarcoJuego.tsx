"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCatalogo } from "@/lib/contenido";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import { obtenerPerfil } from "@/lib/userProfile";
import {
  gasolinaEfectiva, gasolinaIlimitada, gasolinaMaxima, recargarConJuego, recargasRestantes,
  type EstadoRecarga,
} from "@/lib/progreso";
import { rutaDeVuelta, type InfoJuego } from "@/lib/juegos/catalogo";
import { META } from "@/lib/juegos/flap";
import { palabraTerminadaHoy } from "@/lib/juegos/palabras";
import { guardarRecord, leerRecord } from "@/lib/juegos/records";
import { compartirTexto } from "@/lib/juegos/utiles";
import { sonar } from "@/lib/sonido";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import BarraGasolina from "@/components/BarraGasolina";
import BotonSonido from "@/components/BotonSonido";
import PuntiFlap from "@/components/juegos/PuntiFlap";
import CazaEstafa from "@/components/juegos/CazaEstafa";
import CazaGlitch from "@/components/juegos/CazaGlitch";
import PalabraDelDia from "@/components/juegos/PalabraDelDia";

/** Lo que cada juego le entrega al marco al terminar. */
export type FinJuego = {
  gano: boolean;
  puntos: number;
  /** "7/9", "4/6"… lo que se muestra grande en el resultado. */
  resumen?: string;
  /** Un dato para llevarse (lo que se aprendió). */
  nota?: string;
  /** Texto para compartir (la palabra del día). */
  compartir?: string;
};

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    salir: "SALIR",
    jugar: "JUGAR",
    otraVez: "OTRA VEZ",
    modoIa: "VER CÓMO APRENDE UNA IA",
    volver: "VOLVER",
    volverLeccion: "VOLVER A LA LECCIÓN",
    comoSeJuega: "Cómo se juega",
    aprendes: "Qué aprendes",
    record: "Tu récord",
    recordNuevo: "¡RECORD NUEVO!",
    gano: "¡GANASTE!",
    perdio: "CASI",
    puntos: "puntos",
    gasolina: "Gasolina",
    recargaLibre: "Gana y recargas {g} de gasolina. Te quedan {n} recargas hoy.",
    recargaUna: "Gana y recargas {g} de gasolina. Te queda 1 recarga hoy.",
    sinRecargas: "Ya usaste tus recargas de hoy. Puedes seguir jugando por el récord.",
    lleno: "Tu tanque está lleno: juega por el récord. La recarga te espera para cuando la necesites.",
    ilimitada: "Tienes gasolina ilimitada: juega por el récord.",
    apagado: "Juega por el récord.",
    r_recargada: "+{g} DE GASOLINA",
    r_lleno: "Tu tanque ya estaba lleno, así que esta vez no gastaste recarga.",
    r_ilimitada: "Tienes gasolina ilimitada: no te hacía falta.",
    r_tope: "Ya usaste las recargas de hoy. Mañana hay más.",
    r_espera: "Recargaste hace muy poco. Espera unos segundos y vuelve a ganar.",
    r_apagado: "",
    r_error: "No se pudo recargar ahora. Revisa tu conexión y vuelve a intentar.",
    quedan: "Recargas que te quedan hoy",
    perdioTexto: "Esta vez no. La próxima sale.",
    compartir: "COMPARTIR",
    copiado: "Copiado. Pégalo donde quieras.",
    compartido: "¡Listo!",
    error: "No se pudo compartir.",
    yaJugada: "Ya jugaste la palabra de hoy. Mañana hay una nueva.",
    verResultado: "VER TU RESULTADO",
  },
  en: {
    salir: "EXIT",
    jugar: "PLAY",
    otraVez: "PLAY AGAIN",
    modoIa: "WATCH AN AI LEARN",
    volver: "BACK",
    volverLeccion: "BACK TO THE LESSON",
    comoSeJuega: "How to play",
    aprendes: "What you learn",
    record: "Your best",
    recordNuevo: "NEW BEST!",
    gano: "YOU WIN!",
    perdio: "SO CLOSE",
    puntos: "points",
    gasolina: "Fuel",
    recargaLibre: "Win to refill {g} fuel. You have {n} refills left today.",
    recargaUna: "Win to refill {g} fuel. You have 1 refill left today.",
    sinRecargas: "You've used today's refills. Keep playing for your best score.",
    lleno: "Your tank is full: play for your best score. The refill will be here when you need it.",
    ilimitada: "You have unlimited fuel: play for your best score.",
    apagado: "Play for your best score.",
    r_recargada: "+{g} FUEL",
    r_lleno: "Your tank was already full, so this one didn't use a refill.",
    r_ilimitada: "You have unlimited fuel: you didn't need it.",
    r_tope: "You've used today's refills. More tomorrow.",
    r_espera: "You refilled a moment ago. Wait a few seconds and win again.",
    r_apagado: "",
    r_error: "Couldn't refill right now. Check your connection and try again.",
    quedan: "Refills left today",
    perdioTexto: "Not this time. You'll get it next time.",
    compartir: "SHARE",
    copiado: "Copied. Paste it anywhere.",
    compartido: "Done!",
    error: "Couldn't share.",
    yaJugada: "You already played today's word. There's a new one tomorrow.",
    verResultado: "SEE YOUR RESULT",
  },
};

function numero(g: number, idioma: Idioma) {
  return String(g).replace(".", idioma === "es" ? "," : ".");
}

type Fase = "intro" | "jugando" | "ia" | "fin";

export default function MarcoJuego({ juego }: { juego: InfoJuego }) {
  const idioma = useIdioma();
  const t = TX[idioma];
  const router = useRouter();
  const params = useSearchParams();
  const { usuario, cargando } = useAuth();
  const catalogo = useCatalogo();

  const [fase, setFase] = useState<Fase>("intro");
  const [partida, setPartida] = useState(0);
  const [perfilListo, setPerfilListo] = useState(false);
  const [gasolina, setGasolina] = useState(0);
  const [restantes, setRestantes] = useState(0);
  const [ilimitada, setIlimitada] = useState(false);
  const [record, setRecord] = useState(0);
  const [fin, setFin] = useState<FinJuego | null>(null);
  const [recordNuevo, setRecordNuevo] = useState(false);
  const [recarga, setRecarga] = useState<EstadoRecarga | "cargando" | null>(null);
  const [avisoCompartir, setAvisoCompartir] = useState("");
  const [yaJugada, setYaJugada] = useState(false);

  const volver = rutaDeVuelta(params.get("volver")) ?? (juego.mundo ? `/tema/${juego.mundo}` : "/juegos");
  const aLeccion = volver.startsWith("/leccion/");
  const j = catalogo.ajustes.juego;

  useEffect(() => {
    if (!cargando && !usuario) router.push("/login");
  }, [cargando, usuario, router]);

  // Una lectura del perfil al entrar; después, la recarga devuelve la
  // gasolina nueva y no hace falta volver a leer.
  useEffect(() => {
    if (!usuario || !catalogo.listo) return;
    let vigente = true;
    obtenerPerfil(usuario.uid).then((p) => {
      if (!vigente) return;
      setGasolina(p ? gasolinaEfectiva(p) : 0);
      setRestantes(recargasRestantes(p));
      setIlimitada(gasolinaIlimitada(p).activa);
      setRecord(leerRecord(juego.id));
      setYaJugada(juego.diario === true && palabraTerminadaHoy(idioma));
      setPerfilListo(true);
    });
    return () => {
      vigente = false;
    };
  }, [usuario, catalogo.listo, juego.id, juego.diario, idioma]);

  if (cargando || !usuario || !catalogo.listo || !perfilListo) return <Cargando />;

  const lleno = gasolina >= gasolinaMaxima();
  const apagado = j.gasolinaPorJuego <= 0 || j.recargasJuegoDia <= 0;
  const g = numero(j.gasolinaPorJuego, idioma);
  const estadoRecarga = yaJugada
    ? t.yaJugada
    : ilimitada
    ? t.ilimitada
    : apagado
      ? t.apagado
      : lleno
        ? t.lleno
        : restantes <= 0
          ? t.sinRecargas
          : (restantes === 1 ? t.recargaUna : t.recargaLibre).replace("{g}", g).replace("{n}", String(restantes));

  async function alTerminar(f: FinJuego) {
    setFin(f);
    const nuevo = guardarRecord(juego.id, f.puntos);
    setRecordNuevo(nuevo);
    if (nuevo) setRecord(f.puntos);
    setAvisoCompartir("");
    setFase("fin");
    if (!f.gano) {
      setRecarga(null);
      return;
    }
    setRecarga("cargando");
    const r = await recargarConJuego(usuario!.uid);
    setRecarga(r.estado);
    if (r.estado !== "error") {
      setGasolina(r.gasolina);
      setRestantes(r.restantes);
    }
    if (r.estado === "recargada") setTimeout(() => sonar("nivel"), 600);
  }

  function jugar() {
    sonar("arranque");
    setFin(null);
    setRecarga(null);
    setPartida((n) => n + 1);
    setFase("jugando");
  }

  async function compartir() {
    if (!fin?.compartir) return;
    const r = await compartirTexto(fin.compartir);
    if (r !== "cancelado") setAvisoCompartir(t[r]);
  }

  const color = juego.color;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)] px-4 py-3">
        <Link
          href={volver}
          transitionTypes={["atras"]}
          className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink)]"
        >
          {t.salir}
        </Link>
        <p className="min-w-0 flex-1 truncate font-[family-name:var(--font-pixel)] text-[10px] leading-[1.6]" style={{ color }}>
          {textoPixel(juego.nombre[idioma])}
        </p>
        {ilimitada ? (
          <span className="border-2 border-[var(--gold)] px-1.5 font-[family-name:var(--font-terminal)] text-[15px] text-[var(--gold)]">∞</span>
        ) : (
          <BarraGasolina gasolina={gasolina} maximo={gasolinaMaxima()} etiqueta={`${t.gasolina}: ${gasolina} / ${gasolinaMaxima()}`} alto={14} />
        )}
        <BotonSonido className="shrink-0" />
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-6">
        {fase === "intro" && (
          <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
            <PuntiPixel estado="info" ancho={112} />
            <h1 className="font-[family-name:var(--font-pixel)] text-[17px] leading-[1.5]" style={{ color }}>
              {textoPixel(juego.nombre[idioma])}
            </h1>
            <p className="text-[15.5px] leading-[1.55] text-white">{juego.gancho[idioma]}</p>

            <div className="w-full border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] p-4 text-left">
              <p className="mb-2 font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.14em] text-[var(--matrix)]">
                {"// "}
                {t.comoSeJuega}
              </p>
              <ol className="flex flex-col gap-1.5 text-[14.5px] leading-[1.5] text-white">
                {juego.reglas[idioma].map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-[family-name:var(--font-pixel)] text-[9px] leading-[2.2]" style={{ color }}>
                      {i + 1}
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ol>
              <p className="mb-1 mt-3 font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.14em] text-[var(--matrix)]">
                {"// "}
                {t.aprendes}
              </p>
              <p className="text-[14.5px] leading-[1.5] text-[var(--muted)]">{juego.aprendes[idioma]}</p>
            </div>

            <p className="flex items-center gap-2 text-[14px] leading-[1.5] text-[var(--gold)]">
              <span aria-hidden="true" className="font-[family-name:var(--font-pixel)] text-[10px]">⛽</span>
              {estadoRecarga}
            </p>
            {record > 0 && !juego.diario && (
              <p className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.12em] text-[var(--muted)]">
                {t.record}: <span className="text-white">{record}</span>
              </p>
            )}

            <button onClick={jugar} className="boton-pixel boton-pixel-lleno w-full max-w-xs">
              {yaJugada ? t.verResultado : t.jugar}
            </button>
            {juego.id === "punti-flap" && (
              <button onClick={() => setFase("ia")} className="boton-pixel w-full max-w-xs">
                {t.modoIa}
              </button>
            )}
          </div>
        )}

        {fase === "jugando" && (
          <div key={partida} className="flex w-full flex-col items-center">
            {juego.id === "punti-flap" && (
              <PuntiFlap modo="jugar" idioma={idioma} alTerminar={(n) => alTerminar({ gano: n >= META, puntos: n, resumen: `${n}` })} />
            )}
            {juego.id === "caza-la-estafa" && <CazaEstafa idioma={idioma} alTerminar={alTerminar} />}
            {juego.id === "caza-el-glitch" && <CazaGlitch idioma={idioma} alTerminar={alTerminar} />}
            {juego.id === "palabra-del-dia" && <PalabraDelDia idioma={idioma} alTerminar={alTerminar} />}
          </div>
        )}

        {fase === "ia" && (
          <div className="flex w-full flex-col items-center gap-4">
            <PuntiFlap modo="ia" idioma={idioma} />
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={jugar} className="boton-pixel boton-pixel-lleno">
                {t.jugar}
              </button>
              <Link href={volver} transitionTypes={["atras"]} className="boton-pixel">
                {aLeccion ? t.volverLeccion : t.volver}
              </Link>
            </div>
          </div>
        )}

        {fase === "fin" && fin && (
          <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
            <PuntiPixel estado={fin.gano ? "hype" : "error"} ancho={144} />
            <h2
              className="font-[family-name:var(--font-pixel)] text-[20px] leading-[1.5]"
              style={{ color: fin.gano ? "var(--matrix)" : "var(--pink)" }}
            >
              {fin.gano ? t.gano : t.perdio}
            </h2>

            <div className="flex items-end justify-center gap-6">
              {fin.resumen && (
                <p className="font-[family-name:var(--font-pixel)] text-[22px] text-white">{fin.resumen}</p>
              )}
              {!juego.diario && (
                <p className="text-center">
                  <span className="block font-[family-name:var(--font-pixel)] text-[18px] text-[var(--gold)]">{fin.puntos}</span>
                  <span className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.12em] text-[var(--muted)]">
                    {t.puntos}
                  </span>
                </p>
              )}
            </div>
            {recordNuevo && !juego.diario && (
              <p className="juego-aviso border-2 border-[var(--gold)] px-2 py-1 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">
                ★ {t.recordNuevo} ★
              </p>
            )}
            {!fin.gano && <p className="text-[15px] text-[var(--muted)]">{t.perdioTexto}</p>}

            {fin.gano && recarga && recarga !== "cargando" && recarga !== "apagado" && (
              <section
                aria-live="polite"
                className={`w-full border-2 p-4 ${recarga === "recargada" ? "rango-nuevo border-[var(--gold)] bg-[rgba(40,34,6,0.55)]" : "border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)]"}`}
              >
                {recarga === "recargada" ? (
                  <>
                    <p className="font-[family-name:var(--font-pixel)] text-[13px] leading-[1.6] text-[var(--gold)]">
                      ⛽ {t.r_recargada.replace("{g}", g)}
                    </p>
                    <div className="mt-3 flex justify-center">
                      <BarraGasolina gasolina={gasolina} maximo={gasolinaMaxima()} etiqueta={`${t.gasolina}: ${gasolina} / ${gasolinaMaxima()}`} alto={22} />
                    </div>
                    <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.1em] text-[var(--muted)]">
                      {t.quedan}: <span className="text-white">{restantes}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-[14.5px] leading-[1.5] text-white">{t[`r_${recarga}`]}</p>
                )}
              </section>
            )}

            {fin.nota && (
              <p className="w-full border-l-4 border-[var(--cyan)] bg-[rgba(10,10,30,0.88)] px-3 py-2 text-left text-[14.5px] leading-[1.5] text-white">
                {fin.nota}
              </p>
            )}

            <div className="flex w-full flex-col items-center gap-2.5">
              {fin.compartir && (
                <>
                  <button onClick={compartir} className="boton-pixel boton-pixel-oro w-full max-w-xs">
                    {t.compartir}
                  </button>
                  {avisoCompartir && <p className="text-[14px] text-[var(--muted)]">{avisoCompartir}</p>}
                </>
              )}
              {!juego.diario && (
                <button onClick={jugar} className="boton-pixel boton-pixel-lleno w-full max-w-xs">
                  {t.otraVez}
                </button>
              )}
              {juego.id === "punti-flap" && (
                <button onClick={() => setFase("ia")} className="boton-pixel w-full max-w-xs">
                  {t.modoIa}
                </button>
              )}
              <Link href={volver} transitionTypes={["atras"]} className="boton-pixel w-full max-w-xs text-center">
                {aLeccion ? t.volverLeccion : t.volver}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
