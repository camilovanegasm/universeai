"use client";

import { useEffect, useRef } from "react";
import {
  dibujarPunti, RECORTES, DESCRIPCION_PUNTI,
  type EstadoPunti, type RecortePunti,
} from "@/lib/puntiSprite";

type Props = {
  estado: EstadoPunti;
  /** Ancho deseado en px. Se redondea a un múltiplo entero de la rejilla. */
  ancho?: number;
  recorte?: RecortePunti;
  flotando?: boolean;
  className?: string;
};

export default function PuntiPixel({
  estado, ancho = 140, recorte = "cuerpo", flotando = true, className = "",
}: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  const r = RECORTES[recorte];

  // La escala tiene que ser entera. Si se amplía por 2.7 en vez de por 3, el
  // navegador reparte los pixeles de forma desigual y el sprite queda sucio:
  // unas filas de 3px y otras de 2px. Por eso el ancho real puede quedar un
  // poco por encima o por debajo del que se pidió.
  const escala = Math.max(1, Math.round(ancho / r.w));
  const w = r.w * escala;
  const h = r.h * escala;

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    dibujarPunti(ctx, estado, escala, recorte);
  }, [estado, escala, recorte]);

  return (
    <canvas
      ref={lienzo}
      width={w}
      height={h}
      role="img"
      aria-label={DESCRIPCION_PUNTI[estado]}
      className={`punti-pixel block ${flotando ? "punti-flotando" : ""} ${className}`}
      style={{ width: w, height: h }}
    />
  );
}
