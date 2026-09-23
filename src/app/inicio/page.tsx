"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import { corazonesEfectivos, rachaEfectiva } from "@/lib/progreso";
import { TEMAS } from "@/lib/temas";
import { LECCIONES } from "@/lib/lecciones";
import MapaGalaxia, { type TemaEnMapa } from "@/components/MapaGalaxia";

export default function InicioPage() {
  const router = useRouter();
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

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

  // Cada tema se convierte en un planeta. El avance se deriva del progreso
  // guardado: no se guarda un "estado" aparte que se pueda desincronizar.
  const temasDelMapa = useMemo<TemaEnMapa[]>(
    () =>
      TEMAS.map((tema) => ({
        id: tema.id,
        numero: tema.numero,
        titulo: tema.titulo,
        descripcion: tema.descripcion,
        total: tema.subtemas.length,
        hechas: tema.subtemas.filter((s) => perfil?.progreso?.[s.id]?.completada).length,
        disponibles: tema.subtemas.filter((s) => Boolean(LECCIONES[s.id])).length,
      })),
    [perfil]
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

  const corazones = perfil ? corazonesEfectivos(perfil) : 0;
  const racha = perfil ? rachaEfectiva(perfil) : 0;
  const totalSubtemas = TEMAS.reduce((suma, t) => suma + t.subtemas.length, 0);
  const totalHechas = temasDelMapa.reduce((suma, t) => suma + t.hechas, 0);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-[var(--color-panel-border)] bg-gradient-to-b from-[rgba(5,5,16,0.94)] to-[rgba(5,5,16,0.6)] px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="min-w-0 flex-1">
          <p className="hidden font-[family-name:var(--font-terminal)] text-xs uppercase tracking-[0.24em] text-[var(--matrix)] sm:block">
            {"// El universo de Punti"}
          </p>
          <h1 className="truncate font-[family-name:var(--font-display)] text-base font-black text-white sm:text-xl">
            {perfil?.nombre ? `Elige tu mundo, ${perfil.nombre}` : "Elige tu mundo"}
          </h1>
          <p className="font-[family-name:var(--font-terminal)] text-xs text-[var(--muted)] sm:mt-0.5">
            <span className="text-[var(--matrix)]">{totalHechas}</span>/{totalSubtemas} subtemas
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 font-[family-name:var(--font-ui)] text-sm font-bold text-white sm:gap-3">
          <span title="XP" className="text-[var(--gold)]">⭐ {perfil?.xp ?? 0}</span>
          <span title="Corazones">❤️ {corazones}</span>
          <span title="Racha">🔥 {racha}</span>
          <button
            onClick={() => signOut(auth)}
            aria-label="Cerrar sesión"
            className="rounded-lg border border-white/20 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/10 sm:px-3"
          >
            Salir
          </button>
        </div>
      </header>

      <MapaGalaxia temas={temasDelMapa} onEntrar={(id) => router.push(`/tema/${id}`)} />

      <p className="hidden border-t border-[var(--color-panel-border)] px-6 py-2 font-[family-name:var(--font-terminal)] text-[11px] tracking-[0.14em] text-[#4b5a4b] sm:block">
        ARRASTRA PARA MOVERTE · RUEDA O PELLIZCA PARA ACERCAR · CLIC EN UN PLANETA
      </p>
    </div>
  );
}
