"use client";

import { useEffect, useRef } from "react";
import PuntiPixel from "@/components/PuntiPixel";

/**
 * Confirmación para salir de una lección o misión. Es un panel de la app, no
 * un confirm() del navegador: se ve como el resto y no congela la página.
 * Escape o tocar fuera = seguir jugando (lo que no pierde nada).
 */
export default function ConfirmarSalida({
  titulo,
  texto,
  seguir,
  salir,
  alSeguir,
  alSalir,
}: {
  titulo: string;
  texto: string;
  seguir: string;
  salir: string;
  alSeguir: () => void;
  alSalir: () => void;
}) {
  const seguirRef = useRef<HTMLButtonElement>(null);

  // El foco va a "seguir jugando" una sola vez, al abrir.
  useEffect(() => {
    seguirRef.current?.focus();
  }, []);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") alSeguir();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [alSeguir]);

  return (
    <div
      className="cargando-entra fixed inset-0 z-40 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) alSeguir();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="salir-titulo"
        className="flex w-full max-w-sm flex-col items-center gap-4 border-2 border-[var(--pink)] bg-[#0a0a1e] p-6 text-center"
      >
        <PuntiPixel estado="battery" ancho={80} />
        <h2 id="salir-titulo" className="font-[family-name:var(--font-display)] text-xl font-black text-white">
          {titulo}
        </h2>
        <p className="text-[15px] text-[var(--muted)]">{texto}</p>
        <div className="flex w-full flex-col gap-2">
          <button ref={seguirRef} onClick={alSeguir} className="boton-pixel boton-pixel-lleno">
            {seguir}
          </button>
          <button
            onClick={alSalir}
            className="px-3 py-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--pink)] hover:underline"
          >
            {salir}
          </button>
        </div>
      </div>
    </div>
  );
}
