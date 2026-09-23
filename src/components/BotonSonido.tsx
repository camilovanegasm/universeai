"use client";

import { useSilencio, cambiarSilencio, sonar } from "@/lib/sonido";
import { useIdioma } from "@/lib/useIdioma";

/**
 * Silenciar o activar el sonido. El altavoz está dibujado en pixel con
 * rectángulos, igual que Punti, para que no desentone con un ícono de otra
 * familia.
 */
export default function BotonSonido({ className = "" }: { className?: string }) {
  const silencio = useSilencio();
  const en = useIdioma() === "en";
  const etiqueta = silencio ? (en ? "Turn sound on" : "Activar sonido") : en ? "Mute sound" : "Silenciar sonido";

  return (
    <button
      type="button"
      data-mudo
      aria-pressed={silencio}
      aria-label={etiqueta}
      title={etiqueta}
      onClick={() => {
        const nuevo = !silencio;
        cambiarSilencio(nuevo);
        // Al activar, un toque de confirmación: si no suena nada, la persona
        // no sabe si el botón funcionó.
        if (!nuevo) sonar("toque");
      }}
      className={`grid h-[34px] w-[34px] place-items-center border-2 transition-colors ${
        silencio
          ? "border-[var(--color-panel-border)] text-[var(--muted)] hover:text-white"
          : "border-[var(--color-panel-border)] text-[var(--matrix)] hover:border-[var(--matrix)]"
      } ${className}`}
    >
      <svg width="18" height="16" viewBox="0 0 9 8" shapeRendering="crispEdges" aria-hidden="true" fill="currentColor">
        <rect x="0" y="3" width="2" height="2" />
        <rect x="2" y="2" width="1" height="4" />
        <rect x="3" y="1" width="1" height="6" />
        <rect x="4" y="0" width="1" height="8" />
        {silencio ? (
          <>
            <rect x="6" y="2" width="1" height="1" />
            <rect x="8" y="2" width="1" height="1" />
            <rect x="7" y="3" width="1" height="2" />
            <rect x="6" y="5" width="1" height="1" />
            <rect x="8" y="5" width="1" height="1" />
          </>
        ) : (
          <>
            <rect x="6" y="3" width="1" height="2" />
            <rect x="7" y="1" width="1" height="1" />
            <rect x="8" y="2" width="1" height="4" />
            <rect x="7" y="6" width="1" height="1" />
          </>
        )}
      </svg>
    </button>
  );
}
