import { ALTO_INSIGNIA, ANCHO_INSIGNIA, dibujarInsignia } from "@/lib/insigniaSprite";
import type { Escalon } from "@/lib/rangos";

type Props = {
  escalon: Escalon;
  /** Ancho en pantalla. El dibujo es de 40 × 32 pixeles y se amplía sin difuminarse. */
  ancho?: number;
  /** Texto para lectores de pantalla. Sin él, la insignia es decorativa. */
  etiqueta?: string;
  /** Apagada: para los rangos que la persona todavía no alcanza. */
  apagada?: boolean;
  className?: string;
};

/**
 * La insignia en pixel art de un rango del escalafón. Es un SVG de rectángulos
 * (ver insigniaSprite.ts), así que se ve igual en el servidor y en el
 * navegador. La Leyenda cósmica además brilla (se apaga con
 * prefers-reduced-motion en globals.css).
 */
export default function InsigniaRango({ escalon, ancho = 80, etiqueta, apagada = false, className = "" }: Props) {
  const tiras = dibujarInsignia(escalon.n, escalon.color);
  return (
    <svg
      viewBox={`0 0 ${ANCHO_INSIGNIA} ${ALTO_INSIGNIA}`}
      width={ancho}
      height={Math.round((ancho * ALTO_INSIGNIA) / ANCHO_INSIGNIA)}
      shapeRendering="crispEdges"
      role={etiqueta ? "img" : undefined}
      aria-label={etiqueta}
      aria-hidden={etiqueta ? undefined : true}
      className={`insignia-rango ${escalon.n >= 10 && !apagada ? "insignia-leyenda" : ""} ${apagada ? "insignia-apagada" : ""} ${className}`}
      style={{ ["--ic" as string]: escalon.color } as React.CSSProperties}
    >
      {tiras.map((t) => (
        <rect key={`${t.x}-${t.y}`} x={t.x} y={t.y} width={t.w} height={1} fill={t.color} />
      ))}
    </svg>
  );
}
