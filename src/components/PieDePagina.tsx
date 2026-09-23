"use client";

import Link from "next/link";
import PuntiPixel from "@/components/PuntiPixel";
import SelectorIdioma from "@/components/SelectorIdioma";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";

/**
 * Pie de página. Existe por una razón que no es decorativa: una página que
 * termina de golpe en un botón se siente a medio hacer. El pie es lo que dice
 * "esto es un producto, no una maqueta".
 */

const TX: Record<Idioma, { lema: string; hecho: string; columnas: { titulo: string; enlaces: { t: string; h: string }[] }[] }> = {
  es: {
    lema: "Un universo para aprender inteligencia artificial sin jerga, sin instalar nada y sin pagar.",
    hecho: "Hecho en Colombia",
    columnas: [
      { titulo: "El universo", enlaces: [{ t: "Los mundos", h: "/inicio" }, { t: "Cómo funciona", h: "/como-funciona" }] },
      { titulo: "Tu cuenta", enlaces: [{ t: "Crear cuenta gratis", h: "/registro" }, { t: "Entrar", h: "/login" }] },
    ],
  },
  en: {
    lema: "A universe for learning artificial intelligence with no jargon, nothing to install and nothing to pay.",
    hecho: "Made in Colombia",
    columnas: [
      { titulo: "The universe", enlaces: [{ t: "The worlds", h: "/inicio" }, { t: "How it works", h: "/como-funciona" }] },
      { titulo: "Your account", enlaces: [{ t: "Create a free account", h: "/registro" }, { t: "Sign in", h: "/login" }] },
    ],
  },
};

export default function PieDePagina() {
  const t = TX[useIdioma()];

  return (
    <footer className="border-t-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.6)]">
      <div className="mx-auto grid w-full max-w-[1120px] gap-8 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
        <div>
          <div className="flex items-center gap-3">
            <PuntiPixel estado="online" recorte="cabeza" ancho={44} flotando={false} />
            <span className="font-[family-name:var(--font-pixel)] text-[13px] text-white">PUNTI</span>
          </div>
          <p className="mt-4 max-w-[34ch] text-[14px] leading-[1.6] text-[var(--muted)]">{t.lema}</p>
        </div>

        {t.columnas.map((c) => (
          <div key={c.titulo}>
            <p className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.2em] text-[var(--matrix)]">
              {c.titulo}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {c.enlaces.map((e) => (
                <li key={e.h}>
                  <Link
                    href={e.h}
                    className="text-[14.5px] text-[var(--muted)] underline-offset-4 transition-colors hover:text-white hover:underline"
                  >
                    {e.t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-panel-border)]">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3 px-4 py-5 font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.1em] text-[#5a6a5a] sm:px-6">
          <span>{t.hecho}</span>
          <SelectorIdioma />
          <span>© 2026 Punti · punti.space</span>
        </div>
      </div>
    </footer>
  );
}
