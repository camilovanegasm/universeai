"use client";

import { ViewTransition } from "react";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { TEMAS, textoSubtema, textoTema } from "@/lib/temas";
import { LECCIONES } from "@/lib/lecciones";
import { obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import PlanetaPixel from "@/components/PlanetaPixel";
import RutaTema, { type SubtemaEnPlaneta } from "@/components/RutaTema";

// Mismos colores y mismo orden que la pantalla de mundos, para que el planeta
// al que entraste sea del color de la tarjeta que tocaste.
const COLORES = ["#00ff41", "#00f5ff", "#b400ff", "#ff006e", "#ffe600"];

// Etiquetas en fuente pixel sin tildes: Press Start 2P no las trae.
const TX: Record<Idioma, Record<string, string>> = {
  es: {
    noEncontrado: "No encontramos ese mundo.",
    volver: "MUNDOS",
    volverLargo: "VOLVER A LOS MUNDOS",
    completados: "completados",
    de: "de",
  },
  en: {
    noEncontrado: "We couldn't find that world.",
    volver: "WORLDS",
    volverLargo: "BACK TO THE WORLDS",
    completados: "completed",
    de: "of",
  },
};

export default function TemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const idioma = useIdioma();
  const t = TX[idioma];
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  const indice = TEMAS.findIndex((x) => x.id === id);
  const tema = indice === -1 ? undefined : TEMAS[indice];
  const color = COLORES[(indice === -1 ? 0 : indice) % COLORES.length];

  useEffect(() => {
    if (!cargando && !usuario) router.push("/login");
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
      (tema?.subtemas ?? []).map((s) => {
        const tx = textoSubtema(s, idioma);
        return {
          id: s.id,
          numero: s.numero,
          titulo: tx.titulo,
          descripcion: tx.descripcion,
          completado: Boolean(perfil?.progreso?.[s.id]?.completada),
          disponible: Boolean(LECCIONES[s.id]),
        };
      }),
    [tema, perfil, idioma],
  );

  if (cargando || !usuario) {
    return <Cargando />;
  }

  if (!tema) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <PuntiPixel estado="error" ancho={112} />
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">{t.noEncontrado}</p>
        <Link href="/inicio" className="boton-pixel">
          {t.volverLargo}
        </Link>
      </div>
    );
  }

  const txTema = textoTema(tema, idioma);
  const hechas = subtemas.filter((s) => s.completado).length;
  const completo = hechas === subtemas.length && subtemas.length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)] px-4 py-3">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
          {/* Antes decía "volver a la galaxia", pero la galaxia ya no existe:
              ahora se vuelve a la pantalla de mundos. */}
          <Link
            href="/inicio"
            transitionTypes={["atras"]}
            aria-label={t.volverLargo}
            className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--matrix)] hover:text-[var(--matrix)]"
          >
            ← {t.volver}
          </Link>
          <ViewTransition name={`planeta-${tema.id}`} share="viaje-planeta" default="none">
            <PlanetaPixel id={tema.id} color={color} ancho={52} flotando={false} className="shrink-0" />
          </ViewTransition>
          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-pixel)] text-[9px] leading-[1.6]" style={{ color }}>
              {String(tema.numero).padStart(2, "0")} · {textoPixel(txTema.nombre)}
            </p>
            <h1 className="truncate font-[family-name:var(--font-display)] text-[17px] font-black leading-tight text-white sm:text-xl">
              {txTema.titulo}
            </h1>
            <p className="font-[family-name:var(--font-terminal)] text-[15px] tracking-[0.1em] text-[var(--muted)]">
              {hechas} {t.de} {subtemas.length} {t.completados}
            </p>
          </div>
          <PuntiPixel estado={completo ? "hype" : "online"} recorte="cabeza" ancho={44} flotando={false} className="shrink-0" />
        </div>
      </header>

      <RutaTema
        color={color}
        subtemas={subtemas}
        idioma={idioma}
        onAbrir={(subtemaId) => router.push(`/leccion/${tema.id}/${subtemaId}`, { transitionTypes: ["adelante"] })}
      />
    </div>
  );
}
