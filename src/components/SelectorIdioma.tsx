"use client";

import { useIdioma, cambiarIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";

/**
 * Interruptor ES / EN. Cambia el idioma en este navegador al instante; si la
 * página tiene cuenta, puede pasar `alCambiar` para guardarlo también en el
 * perfil.
 */
export default function SelectorIdioma({
  alCambiar,
  className = "",
}: {
  alCambiar?: (idioma: Idioma) => void;
  className?: string;
}) {
  const idioma = useIdioma();

  return (
    <div
      role="group"
      aria-label={idioma === "en" ? "Language" : "Idioma"}
      className={`inline-flex border-2 border-[var(--color-panel-border)] ${className}`}
    >
      {(["es", "en"] as const).map((cod) => {
        const activo = idioma === cod;
        return (
          <button
            key={cod}
            type="button"
            aria-pressed={activo}
            onClick={() => {
              if (activo) return;
              cambiarIdioma(cod);
              alCambiar?.(cod);
            }}
            className={`px-2.5 py-1.5 font-[family-name:var(--font-pixel)] text-[8px] transition-colors ${
              activo ? "bg-[var(--matrix)] text-[#05050f]" : "text-[var(--muted)] hover:text-white"
            }`}
          >
            {cod.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
