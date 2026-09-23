"use client";

import { useEffect } from "react";
import { sonar } from "@/lib/sonido";

/**
 * El "tic" de todos los botones, puesto una sola vez para toda la app.
 *
 * Escuchar en el documento y no botón por botón tiene dos ventajas: ningún
 * botón nuevo se queda mudo porque alguien olvidó conectarlo, y hay un único
 * lugar donde cambiarlo. Un botón que no deba sonar lleva `data-mudo`.
 *
 * Se usa `pointerdown` y no `click`: el sonido llega en el instante en que el
 * dedo toca, no cuando se levanta. Esa diferencia de 100 ms es la que hace
 * que un botón se sienta físico.
 */
export default function SonidoGlobal() {
  useEffect(() => {
    const alTocar = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const el = (e.target as Element | null)?.closest("button, a, summary, [role=button]");
      if (!el || el.closest("[data-mudo]")) return;
      if (el instanceof HTMLButtonElement && el.disabled) return;
      sonar("toque");
    };
    document.addEventListener("pointerdown", alTocar, { passive: true });
    return () => document.removeEventListener("pointerdown", alTocar);
  }, []);
  return null;
}
