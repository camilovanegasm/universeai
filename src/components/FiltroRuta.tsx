"use client";

import type { Idioma } from "@/lib/i18n";
import type { Rango } from "@/lib/rangos";

/**
 * El filtro de mundos: una ruta con un cohete. Cada parada es un nivel de
 * dificultad (fácil, intermedio, avanzado) y el cohete viaja a la que se
 * elige; la ruta recorrida se llena con el color de esa parada.
 *
 * Es un grupo de radios accesible: se usa con el dedo, con el mouse o con
 * las flechas del teclado. La animación se apaga con prefers-reduced-motion
 * (ver .ruta-cohete en globals.css).
 */

export type FiltroMundos = "todos" | Rango;

type Parada = { id: FiltroMundos; nombre: Record<Idioma, string>; nivel: Record<Idioma, string>; color: string };

// Nombres en fuente pixel sin tildes: Press Start 2P no las trae.
const PARADAS: Parada[] = [
  { id: "todos", nombre: { es: "TODOS", en: "ALL" }, nivel: { es: "Mundos", en: "Worlds" }, color: "#e8ecf5" },
  { id: "explorador", nombre: { es: "EXPLORADOR", en: "EXPLORER" }, nivel: { es: "Fácil", en: "Easy" }, color: "#00ff41" },
  { id: "capitan", nombre: { es: "CAPITAN", en: "CAPTAIN" }, nivel: { es: "Intermedio", en: "Intermediate" }, color: "#00f5ff" },
  { id: "arquitecto", nombre: { es: "ARQUITECTO", en: "ARCHITECT" }, nivel: { es: "Avanzado", en: "Advanced" }, color: "#b400ff" },
];

// El cohete mirando a la derecha. W casco · C ventana · R aletas · N punta · F llama
const COHETE = [
  "....RR..........",
  "....RWWWWWWW....",
  "FF..WWWWWWWWWW..",
  "FFFWWWWCCWWWWWWN",
  "FFFWWWWCCWWWWWWN",
  "FF..WWWWWWWWWW..",
  "....RWWWWWWW....",
  "....RR..........",
];
const TONO: Record<string, string> = { W: "#e8ecf5", C: "#00f5ff", R: "#ff006e", N: "#ff006e", F: "#ffe600" };

function Cohete() {
  const tiras: { x: number; y: number; w: number; c: string; llama: boolean }[] = [];
  COHETE.forEach((fila, y) => {
    let x = 0;
    while (x < fila.length) {
      const c = fila[x];
      if (c === ".") {
        x++;
        continue;
      }
      let w = 1;
      while (fila[x + w] === c) w++;
      tiras.push({ x, y, w, c: TONO[c], llama: c === "F" });
      x += w;
    }
  });
  return (
    <svg viewBox="0 0 16 8" width={56} height={28} shapeRendering="crispEdges" aria-hidden="true" className="block">
      {tiras.map((t) => (
        <rect key={`${t.x}-${t.y}`} x={t.x} y={t.y} width={t.w} height={1} fill={t.c} className={t.llama ? "ruta-llama" : undefined} />
      ))}
    </svg>
  );
}

export default function FiltroRuta({
  valor,
  alCambiar,
  conteos,
  idioma,
}: {
  valor: FiltroMundos;
  alCambiar: (v: FiltroMundos) => void;
  conteos: Record<FiltroMundos, number>;
  idioma: Idioma;
}) {
  const i = Math.max(0, PARADAS.findIndex((p) => p.id === valor));
  const actual = PARADAS[i];
  const pos = (i / (PARADAS.length - 1)) * 100;
  const en = idioma === "en";

  function teclas(e: React.KeyboardEvent) {
    const paso = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!paso) return;
    e.preventDefault();
    const siguiente = PARADAS[(i + paso + PARADAS.length) % PARADAS.length];
    alCambiar(siguiente.id);
    (e.currentTarget.parentElement?.querySelector(`[data-parada="${siguiente.id}"]`) as HTMLElement | null)?.focus();
  }

  return (
    <div className="border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.72)] px-4 pb-4 pt-3 sm:px-6">
      <p className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {en ? "Choose your route" : "Elige tu ruta"}
      </p>

      {/* Pista: la línea base, lo recorrido (con rayas, como una barra de
          velocidad) y el cohete. Va del centro de la primera columna al de la
          última (12,5 % a cada lado), así cada parada cae justo en su botón. */}
      <div className="relative mx-[12.5%] mt-9 h-2">
        <div className="absolute inset-0 bg-[#1b1d3a]" />
        <div
          className="ruta-recorrido absolute inset-y-0 left-0"
          style={{
            width: `${pos}%`,
            backgroundImage: `repeating-linear-gradient(-55deg, ${actual.color} 0 6px, transparent 6px 10px)`,
            boxShadow: `0 0 12px ${actual.color}80`,
          }}
        />
        <div className="ruta-cohete absolute -top-[34px]" style={{ left: `${pos}%` }}>
          <div className="-translate-x-1/2">
            <Cohete />
          </div>
        </div>
      </div>

      <div role="radiogroup" aria-label={en ? "Filter worlds by difficulty" : "Filtrar mundos por dificultad"} className="relative mt-[-11px] grid grid-cols-4">
        {PARADAS.map((p, k) => {
          const activa = k === i;
          const pasada = k <= i;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={activa}
              tabIndex={activa ? 0 : -1}
              data-parada={p.id}
              onClick={() => alCambiar(p.id)}
              onKeyDown={teclas}
              className="group flex flex-col items-center gap-1.5 px-1 pt-0 text-center focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className="block h-[14px] w-[14px] border-2 transition-transform group-hover:scale-125 group-focus-visible:scale-125"
                style={{
                  borderColor: p.color,
                  background: pasada ? p.color : "#0a0a1e",
                  boxShadow: activa ? `0 0 12px ${p.color}` : undefined,
                }}
              />
              <span
                className="mt-1 font-[family-name:var(--font-pixel)] text-[7px] leading-[1.5] sm:text-[9px]"
                style={{ color: activa ? p.color : "#8a93ad" }}
              >
                {p.nombre[idioma]}
              </span>
              <span className="font-[family-name:var(--font-terminal)] text-[13px] leading-[1.1] text-[var(--muted)] sm:text-[15px]">
                {p.nivel[idioma]} · {conteos[p.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
