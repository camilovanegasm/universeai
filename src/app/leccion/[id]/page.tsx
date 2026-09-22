"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { NIVELES } from "@/lib/niveles";
import Cache from "@/components/Cache";

// Página temporal: la lección real (los 5 tipos de ejercicio) se construye en la fase 1.4.
// Por ahora solo confirma que el mapa de niveles navega bien al nivel correcto.
export default function LeccionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { usuario, cargando } = useAuth();
  const nivel = NIVELES.find((n) => n.id === id);

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login");
    }
  }, [cargando, usuario, router]);

  if (cargando || !usuario) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-[family-name:var(--font-terminal)] text-xl text-[var(--matrix)]">
          Cargando...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <Cache estado="loading" tamano={130} />
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--matrix)]">
          {nivel ? nivel.titulo : "Nivel no encontrado"}
        </h1>
        <p className="mx-auto mt-2 max-w-md font-[family-name:var(--font-ui)] text-[var(--muted)]">
          La lección de este nivel todavía está en construcción. Llegará en el
          siguiente paso (Fase 1.4), con los 5 tipos de ejercicio.
        </p>
      </div>
      <Link href="/inicio" className="boton-matrix rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wide">
        Volver al mapa
      </Link>
    </div>
  );
}
