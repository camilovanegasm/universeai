"use client";

import { useEffect, useRef } from "react";
import PuntiPixel from "@/components/PuntiPixel";
import { textoPixel, type Idioma } from "@/lib/i18n";

/**
 * El mundo por dentro: una ruta de estaciones, de arriba hacia abajo.
 *
 * Reemplaza al globo girable. El globo escondía detrás de la esfera la mitad
 * de las lecciones y había que girarlo a ciegas para encontrar la siguiente.
 * Aquí se ven todas a la vez, en el orden en que se hacen, y la siguiente
 * está marcada: Punti espera al lado y un pulso la señala.
 *
 * Las estaciones zigzaguean a izquierda y derecha para que se lea como un
 * camino y no como una lista. El tramo ya recorrido va en color sólido; el
 * que falta, punteado.
 */

export type SubtemaEnPlaneta = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  completado: boolean;
  disponible: boolean;
};

type Props = {
  color: string;
  subtemas: SubtemaEnPlaneta[];
  onAbrir: (subtemaId: string) => void;
  idioma?: Idioma;
};

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    completado: "Completado",
    disponible: "Disponible",
    enObra: "En construcción",
    aqui: "Sigue aquí",
    empieza: "Empieza aquí",
    conquistado: "Mundo conquistado",
    ruta: "Ruta de lecciones del mundo",
  },
  en: {
    completado: "Completed",
    disponible: "Available",
    enObra: "Under construction",
    aqui: "Continue here",
    empieza: "Start here",
    conquistado: "World conquered",
    ruta: "Lesson route for this world",
  },
};

// Medidas de la ruta, en píxeles. Caben en un teléfono de 360 px con margen.
const ANCHO = 320;
const FILA = 196; // estación + título de dos líneas + la etiqueta de la siguiente
const LADO = 64; // lado de cada estación
const ARRIBA = 60; // espacio para la etiqueta "sigue aquí" de la primera
// Zigzag: cuánto se corre cada estación del centro.
const DESVIO = [0, 72, 92, 40, -40, -92, -72];

function posicion(i: number) {
  return { x: ANCHO / 2 + DESVIO[i % DESVIO.length], y: ARRIBA + i * FILA + LADO / 2 };
}

// Curva suave entre dos estaciones: sale hacia abajo y llega desde arriba.
function tramo(a: { x: number; y: number }, b: { x: number; y: number }) {
  const m = (b.y - a.y) / 2;
  return `M${a.x} ${a.y} C${a.x} ${a.y + m} ${b.x} ${b.y - m} ${b.x} ${b.y}`;
}

// Visto en pixeles: el ✓ de la fuente pixel no existe y el de respaldo
// sale delgado y borroso a este tamaño.
function Visto() {
  return (
    <svg width="28" height="28" viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" d="M6 0h1v2H6zM5 1h1v2H5zM4 2h1v2H4zM3 3h1v2H3zM2 4h1v2H2zM1 3h1v2H1zM0 2h1v2H0z" />
    </svg>
  );
}

export default function RutaTema({ color, subtemas, onAbrir, idioma = "es" }: Props) {
  const t = TX[idioma];
  const actualRef = useRef<HTMLButtonElement>(null);

  // La siguiente estación: la primera sin completar que ya tenga lección.
  let actual = subtemas.findIndex((s) => !s.completado && s.disponible);
  if (actual === -1) actual = subtemas.findIndex((s) => !s.completado);
  const completo = subtemas.length > 0 && subtemas.every((s) => s.completado);
  const hechas = subtemas.filter((s) => s.completado).length;

  const puntos = subtemas.map((_, i) => posicion(i));
  const alto = ARRIBA + subtemas.length * FILA + 24;

  // Al llegar, la estación que toca queda a la vista (en un mundo largo
  // podría estar más abajo del borde de la pantalla).
  useEffect(() => {
    const el = actualRef.current;
    if (!el) return;
    const caja = el.getBoundingClientRect();
    if (caja.top >= 0 && caja.bottom <= window.innerHeight) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reducido ? "auto" : "smooth" });
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-10 pt-6">
      <nav aria-label={t.ruta} className="relative mx-auto" style={{ width: ANCHO, maxWidth: "100%", height: alto }}>
        {/* el camino */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={ANCHO}
          height={alto}
          viewBox={`0 0 ${ANCHO} ${alto}`}
          aria-hidden="true"
        >
          {puntos.slice(1).map((p, i) => {
            const recorrido = i < hechas;
            return (
              <path
                key={i}
                d={tramo(puntos[i], p)}
                fill="none"
                stroke={recorrido ? color : "#2b3350"}
                strokeWidth={recorrido ? 6 : 4}
                strokeDasharray={recorrido ? undefined : "6 8"}
                strokeLinecap="butt"
                opacity={recorrido ? 0.55 : 1}
              />
            );
          })}
        </svg>

        <ol className="absolute inset-0">
          {subtemas.map((s, i) => {
            const { x, y } = puntos[i];
            const esActual = i === actual;
            const estado = s.completado ? t.completado : s.disponible ? t.disponible : t.enObra;
            // Punti se para del lado donde hay más espacio.
            const puntiALaIzquierda = x > ANCHO / 2;
            const izqEtiqueta = Math.min(Math.max(x - 80, 0), ANCHO - 160);

            return (
              <li
                key={s.id}
                className="estacion-entra"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {esActual && (
                  <span
                    className="estacion-chip absolute whitespace-nowrap border-2 px-2 py-1 font-[family-name:var(--font-pixel)] text-[8px]"
                    style={{
                      left: x,
                      top: y - LADO / 2 - 36,
                      color,
                      borderColor: color,
                      background: "#05050f",
                    }}
                  >
                    {textoPixel(hechas === 0 ? t.empieza : t.aqui)}
                  </span>
                )}

                <button
                  ref={esActual ? actualRef : undefined}
                  onClick={() => onAbrir(s.id)}
                  aria-label={`${s.numero}. ${s.titulo} · ${estado}`}
                  aria-current={esActual ? "step" : undefined}
                  className={`estacion absolute grid place-items-center border-4 font-[family-name:var(--font-pixel)] text-[16px] ${
                    esActual ? "estacion-actual" : ""
                  }`}
                  style={
                    {
                      left: x - LADO / 2,
                      top: y - LADO / 2,
                      width: LADO,
                      height: LADO,
                      "--estacion": s.completado || s.disponible ? color : "#2b3350",
                      ...(s.completado
                        ? { background: color, borderColor: color, color: "#05050f" }
                        : s.disponible
                          ? { background: "#0b0b1d", borderColor: color, color }
                          : { background: "#0b0b1d", borderColor: "#2b3350", color: "#4b5670" }),
                    } as React.CSSProperties
                  }
                >
                  {s.completado ? <Visto /> : s.numero}
                </button>

                {esActual && (
                  <span
                    className="pointer-events-none absolute"
                    style={{
                      left: puntiALaIzquierda ? x - LADO / 2 - 76 : x + LADO / 2 + 12,
                      top: y - 36,
                    }}
                  >
                    <PuntiPixel estado="online" ancho={64} />
                  </span>
                )}

                {/* placa oscura: el camino pasa por detrás del título sin tacharlo */}
                <span
                  className="pointer-events-none absolute flex justify-center"
                  style={{ left: izqEtiqueta, top: y + LADO / 2 + 12, width: 160 }}
                >
                <span className="bg-[#07071a]/90 px-2 py-1 text-center">
                  <span
                    className={`block font-[family-name:var(--font-ui)] text-[14px] font-bold leading-tight ${
                      s.completado || s.disponible ? "text-white" : "text-[#6d7b92]"
                    }`}
                  >
                    {s.titulo}
                  </span>
                  <span className="mt-0.5 block font-[family-name:var(--font-terminal)] text-[13px] uppercase tracking-[0.1em] text-[var(--muted)]">
                    {estado}
                  </span>
                </span>
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {completo && (
        <p
          className="mx-auto mt-2 w-fit border-2 border-[var(--gold)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]"
        >
          ★ {textoPixel(t.conquistado)}
        </p>
      )}
    </div>
  );
}
