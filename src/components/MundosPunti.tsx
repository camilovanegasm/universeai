"use client";

import { ViewTransition } from "react";

import PlanetaPixel from "@/components/PlanetaPixel";
import { RANGOS, type Rango } from "@/lib/rangos";
import { textoPixel, type Idioma } from "@/lib/i18n";

export type MundoEnLista = {
  id: string;
  numero: number;
  nombre: string;       // nombre propio del mundo: ORIGEN, LEXIA...
  titulo: string;       // qué enseña
  descripcion: string;
  rango: Rango;
  total: number;        // subtemas del tema
  hechas: number;       // subtemas completados
  disponibles: number;  // subtemas que ya tienen lección escrita
};

/**
 * Antes esto era un mapa galáctico que se arrastraba y se acercaba con los
 * dedos. Funcionaba en un monitor y se rompía en un celular: apuntarle a un
 * planeta que se mueve es una interacción de escritorio disfrazada de app.
 * Ahora cada mundo es una tarjeta: se toca y se entra.
 */

// Un color por mundo, rotando la paleta de la marca.
const COLORES = ["#00ff41", "#00f5ff", "#b400ff", "#ff006e", "#ffe600"];

type Props = {
  mundos: MundoEnLista[];
  onEntrar: (id: string) => void;
  idioma?: Idioma;
};

// Etiquetas en fuente pixel sin tildes: Press Start 2P no las trae.
const TX: Record<Idioma, Record<string, string>> = {
  es: { obra: "En obra", completo: "Completo", curso: "En curso", nuevo: "Sin abrir",
        vistazo: "ECHAR UN VISTAZO", continuar: "CONTINUAR", aterrizar: "ATERRIZAR" },
  en: { obra: "Coming soon", completo: "Complete", curso: "In progress", nuevo: "Not started",
        vistazo: "TAKE A LOOK", continuar: "CONTINUE", aterrizar: "LAND" },
};

export default function MundosPunti({ mundos, onEntrar, idioma = "es" }: Props) {
  const t = TX[idioma];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mundos.map((m, i) => {
        const color = COLORES[i % COLORES.length];
        const enObra = m.disponibles === 0;
        const completo = m.total > 0 && m.hechas >= m.total;
        const porcentaje = m.total > 0 ? Math.round((m.hechas / m.total) * 100) : 0;
        const rango = RANGOS[m.rango];

        const insignia = enObra
          ? { texto: t.obra, clase: "border-[var(--color-panel-border)] text-[var(--muted)]" }
          : completo
            ? { texto: t.completo, clase: "border-[rgba(0,255,65,0.45)] bg-[rgba(0,255,65,0.1)] text-[var(--matrix)]" }
            : m.hechas > 0
              ? { texto: t.curso, clase: "border-[rgba(255,230,0,0.45)] bg-[rgba(255,230,0,0.1)] text-[var(--gold)]" }
              : { texto: t.nuevo, clase: "border-[rgba(0,245,255,0.4)] bg-[rgba(0,245,255,0.09)] text-[var(--cyan)]" };

        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onEntrar(m.id)}
            className="mundo-tarjeta group flex flex-col border-2 border-[var(--color-panel-border)] p-4 text-left transition-transform duration-150 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)]"
            style={{ ["--pc" as string]: color } as React.CSSProperties}
          >
            <div className="relative z-10 flex items-start justify-between gap-2">
              <span className="font-[family-name:var(--font-pixel)] text-[9px] leading-[1.6] text-[var(--pc)]">
                {String(m.numero).padStart(2, "0")} · {textoPixel(m.nombre)}
              </span>
              <span
                className={`shrink-0 border px-2 py-0.5 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.13em] ${insignia.clase}`}
              >
                {insignia.texto}
              </span>
            </div>

            <div className="relative z-10 flex h-[184px] items-center justify-center">
              {/* Mismo nombre que el planeta de la cabecera del mundo: el
                  navegador los reconoce como el mismo objeto y lo hace volar
                  de la tarjeta a su lugar. */}
              <ViewTransition name={`planeta-${m.id}`} share="viaje-planeta" default="none">
                <PlanetaPixel id={m.id} color={color} apagado={enObra} />
              </ViewTransition>
            </div>

            <h2 className="relative z-10 font-[family-name:var(--font-display)] text-[17px] font-black leading-[1.3] tracking-[-0.01em] text-white">
              {m.titulo}
            </h2>
            <p className="relative z-10 mt-1.5 min-h-[2.7em] font-[family-name:var(--font-terminal)] text-[18px] leading-[1.35] text-[var(--muted)]">
              {m.descripcion}
            </p>

            <div className="relative z-10 mt-auto pt-3">
              <div className="mundo-barra flex gap-px border-2 bg-[#0a0a1e] p-px">
                {Array.from({ length: Math.max(m.total, 1) }, (_, k) => (
                  <i
                    key={k}
                    className={`block h-2 flex-1 ${k < m.hechas ? "bg-[var(--pc)] shadow-[0_0_6px_var(--pc)]" : "bg-[#191940]"}`}
                  />
                ))}
              </div>

              {/* Rango a la izquierda y avance a la derecha, como en la
                  referencia: el rango dice para quién es, el porcentaje dice
                  dónde vas. Los dos en una sola línea para no crecer. */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className="flex items-center gap-1.5 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em]"
                  style={{ color: rango.color }}
                  title={idioma === "en" ? rango.tituloEn : rango.titulo}
                >
                  <i className="block h-2.5 w-2.5 shrink-0" style={{ background: rango.color }} />
                  {idioma === "en" ? rango.etiquetaEn : rango.etiqueta}
                </span>
                <span className="font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.1em] text-[var(--muted)]">
                  {m.hechas}/{m.total} · <b className="font-normal text-[var(--pc)]">{porcentaje}%</b>
                </span>
              </div>

              <span className="mundo-cta mt-3 block w-full border-2 px-2 py-2.5 text-center font-[family-name:var(--font-pixel)] text-[9px]">
                {enObra ? t.vistazo : m.hechas > 0 ? t.continuar : t.aterrizar}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
