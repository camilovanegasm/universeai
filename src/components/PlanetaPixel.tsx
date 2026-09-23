"use client";

import { useEffect, useRef } from "react";
import { dibujarMundo } from "@/lib/planetaSprite";

type Props = {
  /** El `id` del tema: es la semilla, así que el mismo id da el mismo mundo. */
  id: string;
  color: string;
  /** Ancho final en pantalla. El dibujo interno siempre es de 76 px. */
  ancho?: number;
  apagado?: boolean;
  flotando?: boolean;
  className?: string;
};

// Pixeles reales del dibujo. Se amplía por CSS con image-rendering: pixelated,
// que es lo que mantiene el borde duro en vez de difuminarlo.
const LADO = 76;

export default function PlanetaPixel({
  id, color, ancho = 168, apagado = false, flotando = true, className = "",
}: Props) {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    dibujarMundo(ctx, LADO, id, color);
  }, [id, color]);

  return (
    <canvas
      ref={lienzo}
      width={LADO}
      height={LADO}
      aria-hidden="true"
      className={`planeta-pixel block ${apagado ? "planeta-apagado" : ""} ${flotando ? "" : "planeta-quieto"} ${className}`}
      style={{ width: ancho, height: ancho, ["--pc" as string]: color } as React.CSSProperties}
    />
  );
}
