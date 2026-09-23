"use client";

import Link from "next/link";
import PuntiPixel from "@/components/PuntiPixel";
import SelectorIdioma from "@/components/SelectorIdioma";
import PieDePagina from "@/components/PieDePagina";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";

/**
 * Plantilla de las páginas legales (/privacidad y /terminos): título, fecha
 * de actualización y secciones de texto, en español e inglés. El contenido
 * vive en cada página; aquí solo se dibuja.
 */

export type SeccionLegal = { titulo: string; parrafos: string[] };
export type TextoLegal = { titulo: string; actualizado: string; intro: string; secciones: SeccionLegal[] };

export default function PaginaLegal({ textos }: { textos: Record<Idioma, TextoLegal> }) {
  const idioma = useIdioma();
  const t = textos[idioma];

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2" aria-label="Punti">
            <PuntiPixel estado="online" recorte="cabeza" ancho={40} flotando={false} />
            <span className="font-[family-name:var(--font-pixel)] text-[12px] text-white">PUNTI</span>
          </Link>
          <SelectorIdioma />
        </div>

        <h1 className="mt-8 font-[family-name:var(--font-display)] text-[28px] font-black leading-tight text-white [text-wrap:balance] sm:text-[34px]">
          {t.titulo}
        </h1>
        <p className="mt-2 font-[family-name:var(--font-terminal)] text-[17px] tracking-[0.08em] text-[var(--muted)]">{t.actualizado}</p>
        <p className="mt-6 max-w-[65ch] text-[16px] leading-[1.7] text-white">{t.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {t.secciones.map((s, i) => (
            <section key={s.titulo} aria-labelledby={`sec-${i}`}>
              <h2 id={`sec-${i}`} className="font-[family-name:var(--font-display)] text-[19px] font-black text-[var(--matrix)]">
                {s.titulo}
              </h2>
              <div className="mt-3 flex max-w-[65ch] flex-col gap-3">
                {s.parrafos.map((p) => (
                  <p key={p} className="text-[15.5px] leading-[1.7] text-[var(--muted)]">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <PieDePagina />
    </div>
  );
}
