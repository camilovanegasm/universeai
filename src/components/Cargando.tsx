"use client";

import { useEffect, useState } from "react";
import PuntiPixel from "@/components/PuntiPixel";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";

/**
 * La pantalla de carga, una sola para toda la app.
 *
 * No aparece durante los primeros 250 ms. Casi todas las cargas terminan
 * antes, y un cargador que aparece y desaparece en un parpadeo se siente peor
 * que esperar un instante con la pantalla quieta. Si la carga sí se demora,
 * Punti aparece con una frase que cambia cada par de segundos, para que la
 * espera no se sienta congelada.
 */

const FRASES: Record<Idioma, string[]> = {
  es: ["Calibrando propulsores", "Alineando planetas", "Cargando gasolina", "Despertando a Punti", "Contando estrellas"],
  en: ["Calibrating thrusters", "Aligning planets", "Loading fuel", "Waking Punti up", "Counting stars"],
};

export default function Cargando({ retraso = 250 }: { retraso?: number }) {
  const idioma = useIdioma();
  const [visible, setVisible] = useState(retraso === 0);
  // La primera frase sale al azar: si alguien recarga seguido, no ve siempre la misma.
  const [frase, setFrase] = useState(() => Math.floor(Math.random() * FRASES.es.length));

  useEffect(() => {
    if (retraso === 0) return;
    const id = setTimeout(() => setVisible(true), retraso);
    return () => clearTimeout(id);
  }, [retraso]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setFrase((f) => (f + 1) % FRASES.es.length), 2200);
    return () => clearInterval(id);
  }, [visible]);

  return (
    <div role="status" aria-live="polite" className="flex flex-1 flex-col items-center justify-center gap-5 px-6">
      {visible && (
        <div className="cargando-entra flex flex-col items-center gap-5">
          <PuntiPixel estado="loading" ancho={112} />
          {/* La barra de progreso es infinita a propósito: no sabemos cuánto
              falta, y una barra que se llena y se detiene al 90% miente. */}
          <div className="cargando-barra h-2.5 w-44 border-2 border-[var(--color-panel-border)] p-px" aria-hidden="true">
            <i className="block h-full w-1/3 bg-[var(--matrix)] shadow-[0_0_8px_var(--matrix)]" />
          </div>
          <p key={frase} className="cargando-frase font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.18em] text-[var(--matrix)]">
            {FRASES[idioma][frase]}
            <span className="cargando-puntos" aria-hidden="true" />
          </p>
        </div>
      )}
      {!visible && <span className="sr-only">{idioma === "en" ? "Loading" : "Cargando"}</span>}
    </div>
  );
}
