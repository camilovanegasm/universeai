"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import PuntiPixel from "@/components/PuntiPixel";
import PlanetaPixel from "@/components/PlanetaPixel";
import CampoEstelar from "@/components/CampoEstelar";
import PreguntasFrecuentes from "@/components/PreguntasFrecuentes";
import PieDePagina from "@/components/PieDePagina";
import SelectorIdioma from "@/components/SelectorIdioma";
import BotonSonido from "@/components/BotonSonido";
import BotonMusica from "@/components/BotonMusica";
import { Maqueta, type TipoMaqueta } from "@/components/ComoFunciona";
import { textoTema } from "@/lib/temas";
import { useCatalogo } from "@/lib/contenido";
import { RANGOS } from "@/lib/rangos";

const COLORES = ["#00ff41", "#00f5ff", "#b400ff", "#ff006e", "#ffe600"];

// Cifras del producto, no de la audiencia. Son verificables contando los
// archivos del proyecto, y no hay que inventarse usuarios que todavía no hay.

type Textos = {
  eyebrow: string;
  lema: string;
  intro: string;
  empezar: string;
  entrar: string;
  continuar: string;
  cifras: string[];
  universoEyebrow: string;
  universoTitulo: string;
  universoTexto: string;
  dentroEyebrow: string;
  dentroTitulo: string;
  bloques: { titulo: string; texto: string }[];
  manual: string;
  cierre: string;
};

// Etiquetas en fuente pixel sin tildes: Press Start 2P no las trae.
const TX: Record<Idioma, Textos> = {
  es: {
    eyebrow: "// unidad punti · en línea",
    lema: "Aprende inteligencia artificial jugando",
    intro: "Siete mundos, lecciones de pocos minutos y un robot que te explica sin jerga. Gratis, desde el celular, sin instalar nada.",
    empezar: "EMPEZAR GRATIS",
    entrar: "ENTRAR",
    continuar: "CONTINUAR EL VIAJE",
    cifras: ["mundos", "lecciones", "tipos de ejercicio", "pesos al mes"],
    universoEyebrow: "// el universo",
    universoTitulo: "Siete mundos por recorrer",
    universoTexto: "Cada mundo es un tema con nombre propio. Se recorren en el orden que quieras — aquí nada se desbloquea a la fuerza.",
    dentroEyebrow: "// por dentro",
    dentroTitulo: "Así se aprende aquí",
    bloques: [
      {
        titulo: "Lecciones que se leen de una sentada",
        texto: "Punti explica una idea a la vez, en palabras normales, y el texto llega tecleado como una transmisión. Nada de muros de párrafos ni de clases de una hora.",
      },
      {
        titulo: "Se practica ahí mismo, no después",
        texto: "Cinco tipos de ejercicio distintos justo después de cada explicación. Si fallas, pierdes una gasolina y sigues; si te atascas, Punti te da una pista.",
      },
      {
        titulo: "Un progreso que se siente",
        texto: "La gasolina se gasta y se recarga cada día. La racha cuenta los días seguidos que vienes. Y los rangos marcan hasta dónde has llegado de verdad.",
      },
    ],
    manual: "VER EL MANUAL COMPLETO",
    cierre: "Eso es todo lo que hay que saber. El primer mundo está esperando, y no cuesta nada averiguar si te gusta.",
  },
  en: {
    eyebrow: "// punti unit · online",
    lema: "Learn artificial intelligence by playing",
    intro: "Seven worlds, lessons that take a few minutes, and a robot that explains things without jargon. Free, on your phone, nothing to install.",
    empezar: "START FOR FREE",
    entrar: "SIGN IN",
    continuar: "CONTINUE THE JOURNEY",
    cifras: ["worlds", "lessons", "exercise types", "dollars a month"],
    universoEyebrow: "// the universe",
    universoTitulo: "Seven worlds to explore",
    universoTexto: "Every world is a topic with its own name. Explore them in any order you like — nothing here is locked behind anything else.",
    dentroEyebrow: "// inside",
    dentroTitulo: "How you learn here",
    bloques: [
      {
        titulo: "Lessons you can read in one sitting",
        texto: "Punti explains one idea at a time, in plain words, and the text arrives typed out like a transmission. No walls of paragraphs, no hour-long classes.",
      },
      {
        titulo: "You practice right there, not later",
        texto: "Five different kinds of exercise right after each explanation. Miss one and you lose a fuel cell and keep going; get stuck and Punti gives you a hint.",
      },
      {
        titulo: "Progress you can feel",
        texto: "Fuel gets used up and refills every day. Your streak counts how many days in a row you show up. And ranks show how far you've really come.",
      },
    ],
    manual: "SEE THE FULL MANUAL",
    cierre: "That's all there is to know. The first world is waiting, and it costs nothing to find out if you like it.",
  },
};

const COLORES_CIFRAS = ["#00ff41", "#00f5ff", "#b400ff", "#ffe600"];

const BLOQUES_MAQUETA: { maqueta: TipoMaqueta; color: string }[] = [
  { maqueta: "consola", color: "#00f5ff" },
  { maqueta: "ejercicio", color: "#b400ff" },
  { maqueta: "racha", color: "#ff006e" },
];

export default function Home() {
  const { usuario, cargando } = useAuth();
  const idioma = useIdioma();
  // Los mundos salen de Firebase si ya se importaron; mientras llegan (y en
  // el servidor) se muestran los del código, así la portada no espera.
  const { temas: TEMAS, conLeccion } = useCatalogo();
  const VALORES_CIFRAS = [
    String(TEMAS.length),
    String(TEMAS.reduce((n, t) => n + t.subtemas.length, 0)),
    "5",
    "0",
  ];
  const t = TX[idioma];
  const dentro = !cargando && usuario;

  return (
    <div className="flex flex-1 flex-col">
      {/* ───────────────────────── portada ───────────────────────── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-20">
        <CampoEstelar className="absolute inset-0 -z-10" />

        {/* La música vive solo aquí, en la portada, y arranca apagada. */}
        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6">
          <BotonMusica />
          <BotonSonido />
          <SelectorIdioma />
        </div>

        <div className="entra entra-1">
          <PuntiPixel estado="online" ancho={224} />
        </div>

        <p className="entra entra-2 mt-6 font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.34em] text-[var(--matrix)]">
          {t.eyebrow}
        </p>

        <h1 className="titulo-portada entra entra-3 mt-3 font-[family-name:var(--font-pixel)] text-[26px] leading-[1.35] text-white sm:text-[46px]">
          PUNTI
        </h1>

        <p className="entra entra-4 mx-auto mt-5 max-w-[34ch] font-[family-name:var(--font-display)] text-[19px] font-black leading-[1.35] text-white sm:max-w-[40ch] sm:text-[26px]">
          {t.lema}
        </p>

        <p className="entra entra-5 mx-auto mt-4 max-w-[48ch] text-[15px] leading-[1.65] text-[var(--muted)] sm:text-[16px]">
          {t.intro}
        </p>

        <div className="entra entra-6 mt-9 flex w-full max-w-[380px] flex-col gap-3 sm:w-auto sm:flex-row">
          {dentro ? (
            <Link href="/inicio" className="boton-pixel boton-pixel-lleno">
              {t.continuar}
            </Link>
          ) : (
            <>
              <Link href="/registro" className="boton-pixel boton-pixel-lleno">
                {t.empezar}
              </Link>
              <Link href="/login" className="boton-pixel">
                {t.entrar}
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ───────────────── cifras: lo que hay, sin inventar ───────────────── */}
      <section className="border-y-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.45)]">
        <ul className="mx-auto grid w-full max-w-[1120px] grid-cols-2 gap-6 px-4 py-9 sm:grid-cols-4 sm:px-6">
          {VALORES_CIFRAS.map((n, k) => (
            <li key={k} className="text-center">
              <p className="font-[family-name:var(--font-pixel)] text-[22px] sm:text-[30px]" style={{ color: COLORES_CIFRAS[k] }}>
                {n}
              </p>
              <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.14em] text-[var(--muted)]">
                {t.cifras[k]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────────────── los mundos ───────────────────────── */}
      <section className="mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-6">
        <p className="text-center font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.3em] text-[var(--matrix)]">
          {t.universoEyebrow}
        </p>
        <h2 className="mx-auto mt-2 max-w-[20ch] text-center font-[family-name:var(--font-pixel)] text-[16px] leading-[1.5] text-white sm:text-[22px]">
          {t.universoTitulo}
        </h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-center text-[15px] leading-[1.65] text-[var(--muted)]">
          {t.universoTexto}
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {TEMAS.map((tema, i) => {
            const color = COLORES[i % COLORES.length];
            const rango = RANGOS[tema.rango];
            const tx = textoTema(tema, idioma);
            const listas = tema.subtemas.filter((s) => conLeccion.has(s.id)).length;
            return (
              <li
                key={tema.id}
                className="tarjeta-mundo-mini flex flex-col items-center border-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.55)] p-3 text-center"
                style={{ ["--pc" as string]: color, ["--retraso" as string]: `${i * 70}ms` } as React.CSSProperties}
              >
                <PlanetaPixel id={tema.id} color={color} ancho={92} apagado={listas === 0} />
                <p className="mt-2 font-[family-name:var(--font-pixel)] text-[8px] leading-[1.6]" style={{ color }}>
                  {String(tema.numero).padStart(2, "0")} · {textoPixel(tx.nombre)}
                </p>
                <p className="mt-1.5 font-[family-name:var(--font-terminal)] text-[16px] leading-[1.25] text-[var(--muted)]">
                  {tx.titulo}
                </p>
                <p
                  className="mt-2 font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.12em]"
                  style={{ color: rango.color }}
                >
                  {idioma === "en" ? rango.etiquetaEn : rango.etiqueta}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ──────────────── qué vas a encontrar adentro ──────────────── */}
      <section className="mx-auto w-full max-w-[1120px] px-4 pb-4 sm:px-6">
        <p className="text-center font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.3em] text-[var(--cyan)]">
          {t.dentroEyebrow}
        </p>
        <h2 className="mx-auto mt-2 max-w-[22ch] text-center font-[family-name:var(--font-pixel)] text-[16px] leading-[1.5] text-white sm:text-[22px]">
          {t.dentroTitulo}
        </h2>

        <div className="mt-12 flex flex-col gap-14">
          {BLOQUES_MAQUETA.map((b, i) => (
            <div
              key={b.maqueta}
              className={`flex flex-col items-center gap-8 lg:flex-row lg:gap-14 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
            >
              <div className="w-full lg:w-1/2">
                <div className="border-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.5)] p-6">
                  <Maqueta tipo={b.maqueta} idioma={idioma} />
                </div>
              </div>
              <div className="w-full text-center lg:w-1/2 lg:text-left">
                <span className="inline-block h-1 w-12" style={{ background: b.color }} />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-[20px] font-black leading-[1.3] text-white sm:text-[25px]">
                  {t.bloques[i].titulo}
                </h3>
                <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-[1.7] text-[var(--muted)] lg:mx-0">
                  {t.bloques[i].texto}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/como-funciona" className="boton-pixel inline-block">
            {t.manual}
          </Link>
        </div>
      </section>

      {/* ───────────────────────── preguntas ───────────────────────── */}
      <section className="mx-auto w-full max-w-[1120px] px-4 pb-20 sm:px-6">
        <PreguntasFrecuentes />

        {!dentro && (
          <div className="mt-14 text-center">
            <p className="mx-auto max-w-[44ch] text-[15px] leading-[1.65] text-[var(--muted)]">{t.cierre}</p>
            <Link href="/registro" className="boton-pixel boton-pixel-lleno mt-6 inline-block">
              {t.empezar}
            </Link>
          </div>
        )}
      </section>

      <PieDePagina />
    </div>
  );
}
