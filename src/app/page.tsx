"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import Punti from "@/components/Punti";

export default function Home() {
  const { usuario, cargando } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Punti estado="boot" tamano={150} />

      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-black tracking-wide text-[var(--matrix)] [text-shadow:0_0_30px_rgba(0,255,65,0.4)] sm:text-5xl">
          PUNTI
        </h1>
        <p className="mx-auto mt-4 max-w-md font-[family-name:var(--font-ui)] text-lg font-medium text-[var(--muted)]">
          Un universo construido por Punti para que aprendas Inteligencia
          Artificial gratis, viajando de planeta en planeta.
        </p>
      </div>

      {!cargando && usuario ? (
        <Link
          href="/inicio"
          className="boton-matrix rounded-xl px-8 py-3 font-[family-name:var(--font-ui)] text-lg font-bold uppercase tracking-wide transition-transform hover:scale-105"
        >
          Continuar el viaje
        </Link>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/registro"
            className="boton-matrix rounded-xl px-8 py-3 font-[family-name:var(--font-ui)] text-lg font-bold uppercase tracking-wide transition-transform hover:scale-105"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/login"
            className="tarjeta-espacial rounded-xl px-8 py-3 font-[family-name:var(--font-ui)] text-lg font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/5"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}
