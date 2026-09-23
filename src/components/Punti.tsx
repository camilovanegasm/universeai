import Image from "next/image";

// Los 10 estados de Punti tienen un propósito narrativo definido en la hoja de
// personaje; solo estos 6 ya tienen arte exportado (public/punti/*.png).
export type EstadoPunti = "boot" | "online" | "loading" | "levelup" | "battery" | "hype";

const DESCRIPCION: Record<EstadoPunti, string> = {
  boot: "Punti iniciando sesión",
  online: "Punti saludando",
  loading: "Punti procesando",
  levelup: "Punti celebrando una subida de nivel",
  battery: "Punti con batería baja",
  hype: "Punti en celebración épica",
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
      src={`/punti/punti-${estado}.png`}
      alt={DESCRIPCION[estado]}
      width={tamano}
      height={tamano}
      className={`${flotando ? "punti-flotando" : ""} ${className}`}
      priority
    />
  );
}
