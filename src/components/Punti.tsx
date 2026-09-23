import Image from "next/image";
import { type EstadoPunti, DESCRIPCION_PUNTI } from "@/lib/puntiSprite";

export type { EstadoPunti };

/**
 * La versión ilustrada de Punti (PNG), para la portada y los momentos grandes,
 * donde hay espacio para el detalle. Dentro del juego se usa <PuntiPixel />.
 *
 * Hay 9 estados y solo 6 PNG exportados, así que los tres nuevos caen al PNG
 * más cercano en vez de romperse.
 */
const ARCHIVO: Record<EstadoPunti, string> = {
  boot: "boot",
  online: "online",
  leyendo: "loading",
  loading: "loading",
  levelup: "levelup",
  hype: "hype",
  battery: "battery",
  error: "battery",
  info: "online",
};

type Props = {
  estado: EstadoPunti;
  tamano?: number;
  flotando?: boolean;
  className?: string;
};

export default function Punti({ estado, tamano = 140, flotando = true, className = "" }: Props) {
  return (
    <Image
      src={`/punti/punti-${ARCHIVO[estado]}.png`}
      alt={DESCRIPCION_PUNTI[estado]}
      width={tamano}
      height={tamano}
      className={`${flotando ? "punti-flotando" : ""} ${className}`}
      priority
    />
  );
}
