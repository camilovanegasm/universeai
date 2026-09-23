"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PuntiPixel from "@/components/PuntiPixel";
import PlanetaPixel from "@/components/PlanetaPixel";
import { RANGOS } from "@/lib/rangos";
import type { EstadoPunti } from "@/lib/puntiSprite";
import type { Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";

/**
 * El manual de vuelo: cinco pantallas completas, una por paso.
 *
 * Vive como componente y no como página a propósito, porque se muestra en dos
 * lugares: en /como-funciona, para quien quiera repasarlo, y en /bienvenida,
 * la primera vez que alguien entra. Un solo texto, dos sitios.
 *
 * Cada paso no solo se explica: se enseña. Debajo del texto va una maqueta
 * pequeña de aquello de lo que se habla. Leer "ganas puntos" no es lo mismo
 * que ver los puntos.
 *
 * Los textos están escritos dos veces, en español y en inglés, uno al lado del
 * otro. Así, quien cambie uno ve el gemelo que tiene que cambiar también.
 */

export type TipoMaqueta = "mundos" | "consola" | "ejercicio" | "rangos" | "racha";

type Paso = {
  n: string;
  estado: EstadoPunti;
  titulo: Record<Idioma, string>;
  texto: Record<Idioma, string>;
  color: string;
  maqueta: TipoMaqueta;
};

const PASOS: Paso[] = [
  {
    n: "01",
    estado: "online",
    titulo: { es: "Eliges un mundo", en: "Pick a world" },
    texto: {
      es: "Cada mundo es un tema, y cada uno tiene nombre propio. Entras al que te interese, cuando te interese: aquí nada se desbloquea a la fuerza.",
      en: "Every world is a topic, and each one has its own name. Land on whichever one interests you, whenever you like: nothing here is locked behind anything else.",
    },
    color: "#00ff41",
    maqueta: "mundos",
  },
  {
    n: "02",
    estado: "leyendo",
    titulo: { es: "Punti te explica", en: "Punti explains it" },
    texto: {
      es: "Una idea a la vez, con palabras normales y un ejemplo. Sin jerga y sin clases de una hora. Lo que se demora en leerse es lo que se demora en entenderse.",
      en: "One idea at a time, in plain words and with an example. No jargon, no hour-long classes. If it takes a minute to read, it takes a minute to understand.",
    },
    color: "#00f5ff",
    maqueta: "consola",
  },
  {
    n: "03",
    estado: "info",
    titulo: { es: "Lo practicas ahí mismo", en: "You practice right away" },
    texto: {
      es: "Después de cada explicación vienen ejercicios cortos. Si fallas, pierdes una gasolina y sigues. Y si te quedas atascado, puedes pedirle una pista a Punti: te cuesta media gasolina.",
      en: "Short exercises come right after each explanation. Miss one and you lose one fuel cell, then keep going. And if you get stuck, you can ask Punti for a hint: it costs half a fuel cell.",
    },
    color: "#b400ff",
    maqueta: "ejercicio",
  },
  {
    n: "04",
    estado: "levelup",
    titulo: { es: "Subes de rango", en: "You rank up" },
    texto: {
      es: "Terminar da XP, y terminar rápido y sin errores da más. Con eso pasas de explorador a capitán, y de capitán a arquitecto.",
      en: "Finishing earns XP, and finishing fast with no mistakes earns more. That's how you go from explorer to captain, and from captain to architect.",
    },
    color: "#ffe600",
    maqueta: "rangos",
  },
  {
    n: "05",
    estado: "hype",
    titulo: { es: "Vuelves mañana", en: "Come back tomorrow" },
    texto: {
      es: "La gasolina se recarga sola cada día. La racha cuenta los días seguidos que vienes — es el único número que no se puede recuperar, y por eso es el que importa.",
      en: "Your fuel refills on its own every day. Your streak counts how many days in a row you show up — it's the one number you can't get back, and that's why it matters.",
    },
    color: "#ff006e",
    maqueta: "racha",
  },
];

// Etiquetas en fuente pixel: sin tildes, porque Press Start 2P no trae
// mayúsculas acentuadas (ver la nota en globals.css).
const ETIQUETAS: Record<Idioma, { volver: string; saltar: string; siguiente: string; empezar: string; listo: string; paso: string }> = {
  es: { volver: "VOLVER", saltar: "Saltar", siguiente: "SIGUIENTE", empezar: "EMPEZAR", listo: "LISTO", paso: "PASO" },
  en: { volver: "BACK", saltar: "Skip", siguiente: "NEXT", empezar: "START", listo: "DONE", paso: "STEP" },
};

/* ---------------------------------------------------------- maquetas */

export function Maqueta({ tipo, idioma = "es" }: { tipo: TipoMaqueta; idioma?: Idioma }) {
  const en = idioma === "en";

  if (tipo === "mundos") {
    return (
      <div className="flex items-end justify-center gap-3">
        {[
          { id: "que-es-la-ia", n: en ? "01 · ORIGIN" : "01 · ORIGEN", c: "#00ff41" },
          { id: "modelos-de-lenguaje", n: "02 · LEXIA", c: "#00f5ff" },
          { id: "prompts", n: en ? "03 · ECHO" : "03 · ECO", c: "#b400ff" },
        ].map((m) => (
          <div key={m.id} className="border-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.55)] p-2 text-center">
            <PlanetaPixel id={m.id} color={m.c} ancho={80} />
            <p className="mt-1 font-[family-name:var(--font-pixel)] text-[7px]" style={{ color: m.c }}>
              {m.n}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (tipo === "consola") {
    return (
      <div className="mx-auto max-w-[380px] border-2 border-[rgba(0,245,255,0.35)] bg-[rgba(16,16,40,0.7)] p-4 text-left">
        <p className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.2em] text-[var(--cyan)]">
          {en ? "// transmission 01" : "// transmisión 01"}
        </p>
        <p className="mt-2 font-[family-name:var(--font-terminal)] text-[19px] leading-[1.3] text-white">
          {en
            ? "An artificial intelligence doesn't think: it finds patterns in mountains of examples"
            : "Una inteligencia artificial no piensa: encuentra patrones en montañas de ejemplos"}
          <span className="cursor-terminal" />
        </p>
        <div className="mt-3 flex gap-1">
          {[0, 1, 2, 3].map((k) => (
            <i key={k} className={`block h-1 flex-1 ${k === 0 ? "bg-[var(--cyan)]" : "bg-[#222250]"}`} />
          ))}
        </div>
      </div>
    );
  }

  if (tipo === "ejercicio") {
    return (
      <div className="mx-auto flex max-w-[380px] flex-col gap-2 text-left">
        <p className="font-[family-name:var(--font-ui)] text-[15px] font-bold text-white">
          {en ? "What does an AI do when it “learns”?" : "¿Qué hace una IA cuando “aprende”?"}
        </p>
        <span className="flex items-center gap-2 border-2 border-[rgba(0,255,65,0.5)] bg-[rgba(0,255,65,0.1)] px-3 py-2.5 text-[14px] text-white">
          <i className="block h-3 w-3 bg-[var(--matrix)]" />
          {en ? "It finds patterns in examples" : "Encuentra patrones en ejemplos"}
        </span>
        <span className="flex items-center gap-2 border-2 border-[var(--color-panel-border)] px-3 py-2.5 text-[14px] text-[var(--muted)]">
          <i className="block h-3 w-3 border-2 border-[#333366]" />
          {en ? "It memorizes every answer" : "Memoriza todas las respuestas"}
        </span>
      </div>
    );
  }

  if (tipo === "rangos") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {(["explorador", "capitan", "arquitecto"] as const).map((r, k) => (
          <div key={r} className="flex items-center gap-2">
            {k > 0 && <span className="text-[var(--muted)]">→</span>}
            <span
              className="flex items-center gap-1.5 border-2 px-3 py-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em]"
              style={{ color: RANGOS[r].color, borderColor: RANGOS[r].color }}
            >
              <i className="block h-2.5 w-2.5" style={{ background: RANGOS[r].color }} />
              {en ? RANGOS[r].etiquetaEn : RANGOS[r].etiqueta}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <div className="text-center">
        <span className="flex gap-[3px]">
          {[0, 1, 2, 3, 4].map((k) => (
            <i key={k} className="block h-5 w-[11px] bg-[var(--gold)] shadow-[0_0_7px_rgba(255,230,0,0.75)]" />
          ))}
        </span>
        <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {en ? "Full tank" : "Gasolina llena"}
        </p>
      </div>
      <div className="text-center">
        <p className="font-[family-name:var(--font-pixel)] text-[20px] text-[var(--pink)]">6D</p>
        <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.14em] text-[var(--muted)]">
          {en ? "Streak" : "Racha"}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- manual */

type Props = {
  alTerminar?: () => void;
  idioma?: Idioma;
};

export default function ComoFunciona({ alTerminar, idioma = "es" }: Props) {
  const [i, setI] = useState(0);
  const ultimo = i === PASOS.length - 1;
  const et = ETIQUETAS[idioma];

  // El sonido va aquí y no dentro de setI: React ejecuta dos veces las
  // funciones de actualización en desarrollo, y sonaría doble.
  const ir = useCallback(
    (n: number) => {
      const destino = Math.max(0, Math.min(PASOS.length - 1, n));
      if (destino === i) return;
      sonar("pantalla");
      setI(destino);
    },
    [i],
  );

  // Flechas del teclado: en una secuencia de pantallas la gente las intenta.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ir(i + 1);
      if (e.key === "ArrowLeft") ir(i - 1);
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [ir, i]);

  // Deslizar con el dedo. Solo cuenta si el gesto es claramente horizontal,
  // para no robarle el scroll vertical a la página.
  const inicio = useRef<{ x: number; y: number } | null>(null);
  const alTocar = (e: React.PointerEvent) => {
    inicio.current = { x: e.clientX, y: e.clientY };
  };
  const alSoltar = (e: React.PointerEvent) => {
    const p = inicio.current;
    inicio.current = null;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    ir(i + (dx < 0 ? 1 : -1));
  };

  const paso = PASOS[i];

  return (
    <div
      className="flex min-h-[520px] flex-col"
      onPointerDown={alTocar}
      onPointerUp={alSoltar}
      style={{ ["--pc" as string]: paso.color } as React.CSSProperties}
    >
      {/* Progreso por segmentos: cuántos pasos hay y en cuál vas. */}
      <div className="flex gap-1.5" role="group" aria-label={`${et.paso} ${i + 1} / ${PASOS.length}`}>
        {PASOS.map((p, k) => (
          <button
            key={p.n}
            type="button"
            onClick={() => ir(k)}
            aria-label={`${et.paso} ${k + 1}: ${p.titulo[idioma]}`}
            aria-current={k === i ? "step" : undefined}
            className="h-1.5 flex-1 transition-colors"
            style={{ background: k <= i ? p.color : "#222250" }}
          />
        ))}
      </div>

      {/* key fuerza el remonte al cambiar de paso: así la entrada se repite
          sola sin tener que reiniciar nada a mano. */}
      <div key={i} className="slide-paso flex flex-1 flex-col items-center justify-center py-8 text-center">
        <PuntiPixel estado={paso.estado} ancho={192} />

        <p className="mt-5 font-[family-name:var(--font-pixel)] text-[10px] tracking-[0.1em]" style={{ color: paso.color }}>
          {et.paso} {paso.n} / 05
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-[22px] font-black leading-[1.25] text-white sm:text-[30px]">
          {paso.titulo[idioma]}
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-[1.65] text-[var(--muted)] sm:text-[16px]">
          {paso.texto[idioma]}
        </p>

        <div className="mt-8 w-full">
          <Maqueta tipo={paso.maqueta} idioma={idioma} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t-2 border-[var(--color-panel-border)] pt-5">
        <button
          type="button"
          onClick={() => ir(i - 1)}
          disabled={i === 0}
          className="border-2 border-[var(--color-panel-border)] px-4 py-2.5 font-[family-name:var(--font-pixel)] text-[9px] text-white transition-colors hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {et.volver}
        </button>

        {alTerminar && !ultimo && (
          <button
            type="button"
            onClick={alTerminar}
            className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors hover:text-white"
          >
            {et.saltar}
          </button>
        )}

        <button
          type="button"
          onClick={() => (ultimo ? alTerminar?.() : ir(i + 1))}
          className="border-2 px-5 py-2.5 font-[family-name:var(--font-pixel)] text-[9px] transition-colors"
          style={{
            borderColor: paso.color,
            color: ultimo ? "#05050f" : paso.color,
            background: ultimo ? paso.color : "transparent",
          }}
        >
          {ultimo ? (alTerminar ? et.empezar : et.listo) : et.siguiente}
        </button>
      </div>
    </div>
  );
}
