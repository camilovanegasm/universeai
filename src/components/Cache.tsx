import Image from "next/image";

// Los 10 estados de Cache tienen un propósito narrativo definido en la hoja de
// personaje; solo estos 6 ya tienen arte exportado (public/cache/*.png).
export type EstadoCache = "boot" | "online" | "loading" | "levelup" | "battery" | "hype";

const DESCRIPCION: Record<EstadoCache, string> = {
  boot: "Cache iniciando sesión",
  online: "Cache saludando",
  loading: "Cache procesando",
  levelup: "Cache celebrando una subida de nivel",
  battery: "Cache con batería baja",
  hype: "Cache en celebración épica",
};

type Props = {
  estado: EstadoCache;
  tamano?: number;
  flotando?: boolean;
  className?: string;
};

export default function Cache({ estado, tamano = 140, flotando = true, className = "" }: Props) {
  return (
    <Image
      src={`/cache/cache-${estado}.png`}
      alt={DESCRIPCION[estado]}
      width={tamano}
      height={tamano}
      className={`${flotando ? "cache-flotando" : ""} ${className}`}
      priority
    />
  );
}
