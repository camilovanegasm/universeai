"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCatalogo } from "@/lib/contenido";
import { textoTema } from "@/lib/temas";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import { obtenerPerfil } from "@/lib/userProfile";
import { gasolinaEfectiva, gasolinaIlimitada, gasolinaMaxima, recargasRestantes } from "@/lib/progreso";
import { JUEGOS } from "@/lib/juegos/catalogo";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import BarraGasolina from "@/components/BarraGasolina";

/** Todos los minijuegos, con cuánta gasolina se puede recargar hoy. */

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    volver: "MUNDOS",
    titulo: "Minijuegos",
    intro: "Juega un rato y recarga gasolina. Cada juego te enseña algo de su mundo.",
    recargas: "Recargas de hoy",
    de: "de",
    todos: "Todos los mundos",
    diario: "Cada día",
    jugar: "JUGAR",
    ilimitada: "Tienes gasolina ilimitada. Juega por el récord.",
    gasolina: "Gasolina",
  },
  en: {
    volver: "WORLDS",
    titulo: "Minigames",
    intro: "Play for a bit and refill your fuel. Each game teaches you something from its world.",
    recargas: "Today's refills",
    de: "of",
    todos: "All worlds",
    diario: "Daily",
    jugar: "PLAY",
    ilimitada: "You have unlimited fuel. Play for your best score.",
    gasolina: "Fuel",
  },
};

export default function JuegosPage() {
  const router = useRouter();
  const idioma = useIdioma();
  const t = TX[idioma];
  const { usuario, cargando } = useAuth();
  const catalogo = useCatalogo();
  const [info, setInfo] = useState<{ gasolina: number; restantes: number; ilimitada: boolean } | null>(null);

  useEffect(() => {
    if (!cargando && !usuario) router.push("/login");
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario || !catalogo.listo) return;
    let vigente = true;
    obtenerPerfil(usuario.uid).then((p) => {
      if (vigente)
        setInfo({
          gasolina: p ? gasolinaEfectiva(p) : 0,
          restantes: recargasRestantes(p),
          ilimitada: gasolinaIlimitada(p).activa,
        });
    });
    return () => {
      vigente = false;
    };
  }, [usuario, catalogo.listo]);

  if (cargando || !usuario || !catalogo.listo || !info) return <Cargando />;

  const tope = catalogo.ajustes.juego.recargasJuegoDia;

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col px-4 pb-24 pt-5 sm:px-6">
      <div className="flex items-center gap-3">
        <Link
          href="/inicio"
          transitionTypes={["atras"]}
          className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--matrix)] hover:text-[var(--matrix)]"
        >
          ← {t.volver}
        </Link>
        <span className="flex-1" />
        {info.ilimitada ? (
          <span className="border-2 border-[var(--gold)] px-1.5 font-[family-name:var(--font-terminal)] text-[15px] text-[var(--gold)]">∞</span>
        ) : (
          <BarraGasolina gasolina={info.gasolina} maximo={gasolinaMaxima()} etiqueta={`${t.gasolina}: ${info.gasolina} / ${gasolinaMaxima()}`} />
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <PuntiPixel estado="hype" ancho={80} />
        <div>
          <h1 className="font-[family-name:var(--font-pixel)] text-[18px] leading-[1.4] text-white sm:text-[24px]">{textoPixel(t.titulo)}</h1>
          <p className="mt-2 max-w-[52ch] text-[15px] text-[var(--muted)]">{t.intro}</p>
        </div>
      </div>

      <p className="mt-5 font-[family-name:var(--font-terminal)] text-[18px] uppercase tracking-[0.12em] text-[var(--gold)]">
        {info.ilimitada ? t.ilimitada : `⛽ ${t.recargas}: ${info.restantes} ${t.de} ${tope}`}
      </p>

      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {JUEGOS.map((j) => {
          const tema = j.mundo ? catalogo.temas.find((x) => x.id === j.mundo) : undefined;
          const etiqueta = tema ? textoTema(tema, idioma).nombre : j.diario ? t.diario : t.todos;
          return (
            <li key={j.id}>
              <Link
                href={`/juego/${j.id}?volver=/juegos`}
                transitionTypes={["adelante"]}
                className="tarjeta-juego flex h-full flex-col gap-3 border-2 bg-[rgba(10,10,30,0.88)] p-4 transition-transform"
                style={{ borderColor: j.color }}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-[family-name:var(--font-pixel)] text-[12px] leading-[1.5]" style={{ color: j.color }}>
                    {textoPixel(j.nombre[idioma])}
                  </span>
                  <span className="shrink-0 border-2 border-[var(--color-panel-border)] px-1.5 py-0.5 font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.1em] text-[var(--muted)]">
                    {etiqueta}
                  </span>
                </span>
                <span className="flex-1 text-[14.5px] leading-[1.5] text-white">{j.gancho[idioma]}</span>
                <span className="self-start font-[family-name:var(--font-pixel)] text-[9px]" style={{ color: j.color }}>
                  ▸ {t.jugar}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
