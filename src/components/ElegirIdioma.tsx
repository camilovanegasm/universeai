"use client";

import { useEffect, useState } from "react";
import { IDIOMAS, type Idioma } from "@/lib/i18n";
import type { EstadoPunti } from "@/lib/puntiSprite";
import PuntiPixel from "@/components/PuntiPixel";
import { sonar } from "@/lib/sonido";

/**
 * El selector de idioma de la bienvenida.
 *
 * Solo se encarga de verse y reaccionar. Qué se guarda y a dónde se va
 * después lo decide la página que lo usa — por eso se puede montar en una
 * vista previa sin cuenta y sin tocar la base de datos.
 */

const PREGUNTA = "¿En qué idioma viajamos? · Which language do we travel in?";
const ERROR = "No pude guardar tu elección. Intenta otra vez. · I couldn't save that. Try again.";

/** Texto que aparece letra por letra, como una transmisión. */
function Tecleado({ texto }: { texto: string }) {
  const [sinMovimiento] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [letras, setLetras] = useState(0);

  useEffect(() => {
    if (sinMovimiento) return;
    let n = 0;
    const id = setInterval(() => {
      n += 2;
      if (texto[n - 1] && texto[n - 1] !== " ") sonar("voz");
      if (n >= texto.length) {
        setLetras(texto.length);
        clearInterval(id);
      } else {
        setLetras(n);
      }
    }, 18);
    return () => clearInterval(id);
  }, [texto, sinMovimiento]);

  const completo = sinMovimiento || letras >= texto.length;
  return (
    <>
      {completo ? texto : texto.slice(0, letras)}
      {!completo && <span className="cursor-terminal" />}
    </>
  );
}

type Props = {
  /** El idioma ya elegido, si hay uno. */
  idioma: Idioma | null;
  guardando: boolean;
  fallo: boolean;
  onElegir: (idioma: Idioma) => void;
};

export default function ElegirIdioma({ idioma, guardando, fallo, onElegir }: Props) {
  const [asomado, setAsomado] = useState<Idioma | null>(null); // la tarjeta bajo el cursor

  // Punti reacciona a lo que la persona está a punto de elegir, no solo a lo
  // que ya eligió: al pasar por una tarjeta ya le habla en ese idioma.
  const estadoPunti: EstadoPunti = fallo ? "error" : idioma ? "hype" : asomado ? "info" : "online";
  const burbuja = fallo ? ERROR : idioma ? IDIOMAS[idioma].saludo : asomado ? IDIOMAS[asomado].saludo : PREGUNTA;

  return (
    <div className="flex flex-col items-center">
      <p className="entra entra-1 font-[family-name:var(--font-terminal)] text-[18px] uppercase tracking-[0.3em] text-[var(--matrix)]">
        {"// punti · arranque"}
      </p>

      {/* El `key` hace que cada texto nuevo se vuelva a teclear desde cero en
          vez de cambiar de golpe. */}
      <div className="entra entra-2 relative mt-6 w-full max-w-[420px]">
        <div
          className={`border-2 bg-[rgba(10,10,30,0.92)] px-5 py-4 text-center font-[family-name:var(--font-terminal)] text-[20px] leading-[1.3] text-white ${
            fallo ? "border-[var(--pink)]" : "border-[var(--matrix)]"
          }`}
          aria-live="polite"
        >
          <Tecleado key={burbuja} texto={burbuja} />
        </div>
        <span
          className={`burbuja-cola ${fallo ? "border-t-[var(--pink)]" : "border-t-[var(--matrix)]"}`}
          aria-hidden="true"
        />
      </div>

      <div className="entra entra-3 mt-4">
        <PuntiPixel estado={estadoPunti} ancho={192} />
      </div>

      <div className="entra entra-4 mt-8 grid w-full max-w-[520px] grid-cols-1 gap-3 sm:grid-cols-2">
        {(["es", "en"] as const).map((cod) => {
          const d = IDIOMAS[cod];
          const elegido = idioma === cod;
          const descartado = idioma !== null && !elegido;
          return (
            <button
              key={cod}
              type="button"
              onClick={() => onElegir(cod)}
              onPointerEnter={() => setAsomado(cod)}
              onPointerLeave={() => setAsomado((v) => (v === cod ? null : v))}
              onFocus={() => setAsomado(cod)}
              onBlur={() => setAsomado((v) => (v === cod ? null : v))}
              disabled={guardando}
              aria-pressed={elegido}
              className={`tarjeta-idioma flex flex-col items-center gap-2 border-2 px-5 py-6 text-center ${
                elegido ? "tarjeta-idioma-elegida" : ""
              } ${descartado ? "tarjeta-idioma-descartada" : ""}`}
            >
              <span className="font-[family-name:var(--font-pixel)] text-[26px] text-[var(--matrix)]">{d.codigo}</span>
              <span className="font-[family-name:var(--font-display)] text-[17px] font-black text-white">{d.nombre}</span>
              <span className="font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.06em] text-[var(--muted)]">
                {d.lema}
              </span>
            </button>
          );
        })}
      </div>

      <p className="entra entra-5 mt-6 max-w-[44ch] text-center text-[13.5px] leading-[1.6] text-[var(--muted)]">
        Puedes cambiarlo después. · You can change it later.
      </p>
    </div>
  );
}
