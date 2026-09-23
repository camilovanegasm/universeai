"use client";

import Link from "next/link";
import type { EstadoPunti } from "@/lib/puntiSprite";
import PuntiPixel from "@/components/PuntiPixel";
import CampoEstelar from "@/components/CampoEstelar";
import SelectorIdioma from "@/components/SelectorIdioma";
import BotonSonido from "@/components/BotonSonido";

/**
 * El marco común de las pantallas de cuenta (entrar y crear cuenta).
 *
 * Punti no es decoración aquí: refleja lo que está pasando. En línea mientras
 * la persona escribe, cargando mientras se envía, y error si algo falla. Así
 * el estado se lee de un vistazo, antes de leer ningún mensaje.
 */
export default function MarcoCuenta({
  estado,
  titulo,
  subtitulo,
  children,
}: {
  estado: EstadoPunti;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <CampoEstelar className="absolute inset-0 -z-10" />

      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="font-[family-name:var(--font-pixel)] text-[11px] text-white">
          PUNTI
        </Link>
        <div className="flex items-center gap-2">
          <BotonSonido />
          <SelectorIdioma />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
        <div className="entra entra-1 w-full max-w-[400px] border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] p-6 sm:p-8">
          <div className="flex justify-center">
            <PuntiPixel estado={estado} ancho={96} />
          </div>
          <h1 className="mt-4 text-center font-[family-name:var(--font-display)] text-[22px] font-black leading-[1.25] text-white">
            {titulo}
          </h1>
          <p className="mt-2 text-center font-[family-name:var(--font-terminal)] text-[18px] tracking-[0.04em] text-[var(--cyan)]">
            {subtitulo}
          </p>
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Campo de texto con el estilo de la casa. */
export function CampoCuenta(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border-2 border-[var(--color-panel-border)] bg-black/40 px-4 py-3 text-[15px] text-white placeholder-[var(--muted)] outline-none transition-colors focus:border-[var(--matrix)]"
    />
  );
}

/** Aviso de error. `role="alert"` hace que un lector de pantalla lo lea solo. */
export function AvisoCuenta({ texto }: { texto: string }) {
  return (
    <p role="alert" className="border-2 border-[var(--pink)] bg-[rgba(255,0,110,0.1)] px-4 py-3 text-[14px] leading-[1.5] text-[var(--pink)]">
      {texto}
    </p>
  );
}

export function SeparadorCuenta({ texto }: { texto: string }) {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="h-[2px] flex-1 bg-[var(--color-panel-border)]" />
      <span className="font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">{texto}</span>
      <div className="h-[2px] flex-1 bg-[var(--color-panel-border)]" />
    </div>
  );
}
