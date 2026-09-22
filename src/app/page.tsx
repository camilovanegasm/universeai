"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { usuario, cargando } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 py-16 text-center dark:bg-black">
      <div>
        <h1 className="text-5xl font-extrabold text-zinc-900 dark:text-zinc-50">
          UniverseAI
        </h1>
        <p className="mt-4 max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          Aprende Inteligencia Artificial gratis, en lecciones cortas y
          divertidas. A tu ritmo, desde cero.
        </p>
      </div>

      {!cargando && usuario ? (
        <Link
          href="/inicio"
          className="rounded-2xl bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700"
        >
          Continuar aprendiendo
        </Link>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/registro"
            className="rounded-2xl bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/login"
            className="rounded-2xl border-2 border-zinc-200 bg-white px-8 py-3 font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}
