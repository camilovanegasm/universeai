"use client";

import { ViewTransition } from "react";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { esAdmin } from "@/lib/admin";
import { textoSubtema, textoTema } from "@/lib/temas";
import { useCatalogo } from "@/lib/contenido";
import { obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import PlanetaPixel from "@/components/PlanetaPixel";
import RutaTema, { type SubtemaEnPlaneta } from "@/components/RutaTema";
import { juegoDelMundo } from "@/lib/juegos/catalogo";
import { misionesDelMundo, type ResumenMision } from "@/lib/misiones/cargar";

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
    clubTitulo: "Mundo del Club",
    clubTexto: "Sus lecciones son para miembros de Punti Club. Mira qué incluye y anótate.",
    clubBoton: "VER PUNTI CLUB",
    minijuego: "MINIJUEGO",
    misiones: "MISIONES · VISTA PREVIA DEL ADMIN",
    misionesTexto: "Formato nuevo. Solo tú las ves mientras el mundo se rehace.",
    recarga: "Gana y recarga gasolina",
    jugar: "JUGAR",
  },
  en: {
    noEncontrado: "We couldn't find that world.",
    volver: "WORLDS",
    volverLargo: "BACK TO THE WORLDS",
    completados: "completed",
    de: "of",
    clubTitulo: "Club world",
    clubTexto: "Its lessons are for Punti Club members. See what's included and join.",
    clubBoton: "SEE PUNTI CLUB",
    minijuego: "MINIGAME",
    misiones: "MISSIONS · ADMIN PREVIEW",
    misionesTexto: "New format. Only you can see them while this world is rebuilt.",
    recarga: "Win to refill your fuel",
    jugar: "PLAY",
  },
};

export default function TemaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const idioma = useIdioma();
  const t = TX[idioma];
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [misiones, setMisiones] = useState<ResumenMision[]>([]);

  const catalogo = useCatalogo();
  const indice = catalogo.temas.findIndex((x) => x.id === id);
  const tema = indice === -1 ? undefined : catalogo.temas[indice];
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

  // Formato nuevo (fase C1): solo el admin ve las misiones hasta que el mundo
  // esté rehecho. Una lectura del índice por visita (queda en memoria).
  const soyAdmin = esAdmin(usuario);
  useEffect(() => {
    if (!soyAdmin) return;
    let vigente = true;
    misionesDelMundo(id).then((m) => {
      if (vigente) setMisiones(m);
    });
    return () => {
      vigente = false;
    };
  }, [id, soyAdmin]);

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
          disponible: catalogo.conLeccion.has(s.id),
        };
      }),
    [tema, perfil, idioma, catalogo],
  );

  if (cargando || !usuario || !catalogo.listo) {
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
  // Mundo del Club y la persona no es miembro: la ruta se ve, pero cada
  // lección lleva a /club. Las reglas de Firestore igual bloquean la lección.
  const bloqueado = tema.club === true && perfil?.premium !== true && !esAdmin(usuario);
  const hechas = subtemas.filter((s) => s.completado).length;
  const juego = juegoDelMundo(tema.id);
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

      {bloqueado && (
        <div className="mx-auto mt-4 flex w-full max-w-2xl flex-wrap items-center gap-3 border-2 border-[var(--gold)] bg-[rgba(40,34,6,0.55)] px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-pixel)] text-[9px] leading-[1.7] text-[var(--gold)]">{t.clubTitulo.toUpperCase()}</p>
            <p className="text-[14px] leading-[1.5] text-white">{t.clubTexto}</p>
          </div>
          <Link href="/club" className="boton-pixel" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
            {t.clubBoton}
          </Link>
        </div>
      )}

      {juego && (
        <Link
          href={`/juego/${juego.id}`}
          transitionTypes={["adelante"]}
          className="tarjeta-juego mx-auto mt-4 flex w-[calc(100%-2rem)] max-w-2xl items-center gap-3 border-2 bg-[rgba(10,10,30,0.88)] px-4 py-3 transition-transform"
          style={{ borderColor: juego.color }}
        >
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center border-2 font-[family-name:var(--font-pixel)] text-[14px]" style={{ borderColor: juego.color, color: juego.color }}>
            ▸
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-[family-name:var(--font-pixel)] text-[9px] leading-[1.7]" style={{ color: juego.color }}>
              {t.minijuego} · {textoPixel(juego.nombre[idioma])}
            </span>
            <span className="block text-[14px] text-white">⛽ {t.recarga}</span>
          </span>
          <span className="font-[family-name:var(--font-pixel)] text-[9px]" style={{ color: juego.color }}>{t.jugar}</span>
        </Link>
      )}

      {misiones.length > 0 && (
        <section className="mx-auto mt-4 w-[calc(100%-2rem)] max-w-2xl border-2 border-dashed border-[var(--cyan)] bg-[rgba(0,245,255,0.05)] px-4 py-3">
          <p className="font-[family-name:var(--font-pixel)] text-[8px] leading-[1.8] text-[var(--cyan)]">{textoPixel(t.misiones)}</p>
          <p className="text-[13px] text-[var(--muted)]">{t.misionesTexto}</p>
          <ul className="mt-2 grid gap-2">
            {misiones.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/mision/${tema.id}/${m.id}`}
                  transitionTypes={["adelante"]}
                  className="flex items-center gap-3 border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] px-3 py-2.5 transition-colors hover:border-[var(--cyan)]"
                >
                  <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[var(--cyan)]">
                    {m.capitulo}.{String(m.numero).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">{m.titulo[idioma]}</span>
                    <span className="block text-[13px] text-[var(--muted)]">{m.resumen[idioma]}</span>
                  </span>
                  <span className="font-[family-name:var(--font-terminal)] text-[15px] text-[var(--muted)]">{m.minutos} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RutaTema
        color={color}
        subtemas={subtemas}
        idioma={idioma}
        onAbrir={(subtemaId) =>
          router.push(bloqueado ? "/club" : `/leccion/${tema.id}/${subtemaId}`, { transitionTypes: ["adelante"] })
        }
      />
    </div>
  );
}
