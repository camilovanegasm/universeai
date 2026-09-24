"use client";

import { useEffect, useState } from "react";
import { sonar } from "@/lib/sonido";

/**
 * Escribe el texto letra por letra, como una transmisión entrante.
 * Se monta de nuevo en cada pantalla (con un `key` distinto), así no hace
 * falta reiniciar el contador a mano. Si la persona pidió menos movimiento,
 * muestra el texto completo de una vez.
 *
 * La usan la lección (consola de Punti) y la misión (Punti arriba de cada
 * bloque). Antes vivía dentro de la página de la lección.
 */
export default function TextoTecleado({ texto, voz = true }: { texto: string; voz?: boolean }) {
  const [sinMovimiento] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [letras, setLetras] = useState(0);

  useEffect(() => {
    if (sinMovimiento) return;
    let cuantas = 0;
    const id = setInterval(() => {
      cuantas += 2;
      if (voz && texto[cuantas - 1] && texto[cuantas - 1] !== " ") sonar("voz");
      if (cuantas >= texto.length) {
        setLetras(texto.length);
        clearInterval(id);
      } else {
        setLetras(cuantas);
      }
    }, 12);
    return () => clearInterval(id);
  }, [texto, sinMovimiento, voz]);

  const completo = sinMovimiento || letras >= texto.length;

  return (
    <>
      {completo ? texto : texto.slice(0, letras)}
      {!completo && <span className="cursor-terminal" />}
    </>
  );
}
