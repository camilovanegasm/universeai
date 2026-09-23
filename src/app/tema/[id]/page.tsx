"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { TEMAS } from "@/lib/temas";
import { LECCIONES } from "@/lib/lecciones";
import { obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import Punti from "@/components/Punti";
import PlanetaTema, { type SubtemaEnPlaneta } from "@/components/PlanetaTema";

// Mismos colores y mismo orden que el mapa galáctico, para que el planeta al
// que entraste sea del color del planeta que tocaste.
const COLORES = ["#00ff41", "#00f5ff", "#b400ff", "#ff006e", "#ffe600"];

export default function TemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  const indice = TEMAS.findIndex((t) => t.id === id);
  const tema = indice === -1 ? undefined : TEMAS[indice];
  const color = COLORES[(indice === -1 ? 0 : indice) % COLORES.length];

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login");
    }
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario) return;
    let vigente = true;
    obtenerPerfil(usuario.uid).then((datos) => {
      if (vigente) setPerfil(datos);
    });
    return () => {
      vigente = false;
    };
  }, [usuario]);

  const subtemas = useMemo<SubtemaEnPlaneta[]>(
    () =>
      (tema?.subtemas ?? []).map((s) => ({
        id: s.id,
        numero: s.numero,
        titulo: s.titulo,
        descripcion: s.descripcion,
        completado: Boolean(perfil?.progreso?.[s.id]?.completada),
        disponible: Boolean(LECCIONES[s.id]),
      })),
    [tema, perfil]
  );

  if (cargando || !usuario) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-[family-name:var(--font-terminal)] text-xl text-[var(--matrix)]">
          Cargando...
        </p>
      </div>
    );
  }

  if (!tema) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-[family-name:var(--font-ui)] text-white">Tema no encontrado.</p>
        <Link href="/inicio" className="boton-matrix rounded-xl px-6 py-2.5 text-sm font-bold uppercase">
          Volver a la galaxia
        </Link>
      </div>
    );
  }

  const hechas = subtemas.filter((s) => s.completado).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b border-[var(--color-panel-border)] bg-gradient-to-b from-[rgba(5,5,16,0.94)] to-[rgba(5,5,16,0.6)] px-4 py-3">
        <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-3">
          <Link
            href="/inicio"
            className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 font-[family-name:var(--font-terminal)] text-xs tracking-[0.1em] text-[var(--muted)] transition-colors hover:border-[var(--matrix)] hover:text-[var(--matrix)]"
          >
            ← VOLVER A LA GALAXIA
          </Link>
          <div className="min-w-0 flex-1">
            <h1
              className="truncate font-[family-name:var(--font-display)] text-lg font-black sm:text-xl"
              style={{ color }}
            >
              {tema.titulo}
            </h1>
            <p className="font-[family-name:var(--font-terminal)] text-xs tracking-[0.12em] text-[var(--muted)]">
              {hechas} DE {subtemas.length} SUBTEMAS COMPLETADOS
            </p>
          </div>
          <div className="shrink-0">
            <Punti estado={hechas === subtemas.length && subtemas.length > 0 ? "hype" : "online"} tamano={46} />
          </div>
        </div>
      </header>

      <PlanetaTema
        color={color}
        subtemas={subtemas}
        onAbrir={(subtemaId) => router.push(`/leccion/${tema.id}/${subtemaId}`)}
      />
    </div>
  );
}
