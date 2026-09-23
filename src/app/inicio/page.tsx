"use client";

import { startTransition, useEffect, useMemo, useState, ViewTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { guardarIdioma, obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import { gasolinaEfectiva, gasolinaIlimitada, rachaEfectiva, gasolinaMaxima, textoRestante } from "@/lib/progreso";
import FiltroRuta, { type FiltroMundos } from "@/components/FiltroRuta";
import { textoTema } from "@/lib/temas";
import { useCatalogo } from "@/lib/contenido";
import AnuncioGlobal from "@/components/AnuncioGlobal";
import { useIdioma, cambiarIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";
import MundosPunti, { type MundoEnLista } from "@/components/MundosPunti";
import PuntiPixel from "@/components/PuntiPixel";
import PreguntasFrecuentes from "@/components/PreguntasFrecuentes";
import SelectorIdioma from "@/components/SelectorIdioma";
import BarraGasolina from "@/components/BarraGasolina";
import BotonSonido from "@/components/BotonSonido";
import Cargando from "@/components/Cargando";
import EsqueletoMundos from "@/components/EsqueletoMundos";

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    perfil: "Mi perfil",
    hola: "Hola",
    elige: "Elige tu mundo",
    lecciones: "lecciones",
    gasolina: "Gasolina",
    de: "de",
    racha: "Racha",
    salir: "Salir",
    cerrar: "Cerrar sesión",
    eyebrow: "// El universo de Punti",
    intro:
      "{n} mundos, cada uno con sus lecciones. Entra al que quieras, en el orden que quieras: aquí nada se desbloquea a la fuerza. Si no sabes por dónde empezar, elige una ruta.",
    ninguno: "No hay mundos en esta ruta todavía.",
    ilimitada: "Gasolina ilimitada",
    primera: "¿Primera vez por aquí?",
    primeraTexto: "Punti te explica en cinco pasos cómo funciona el universo, la gasolina y los rangos.",
    manual: "VER MANUAL",
    juegos: "MINIJUEGOS",
    juegosTexto: "Recarga gasolina jugando. Uno nuevo cada día: la Palabra IA.",
  },
  en: {
    perfil: "My profile",
    hola: "Hi",
    elige: "Pick your world",
    lecciones: "lessons",
    gasolina: "Fuel",
    de: "of",
    racha: "Streak",
    salir: "Sign out",
    cerrar: "Sign out",
    eyebrow: "// Punti's universe",
    intro:
      "{n} worlds, each with its own lessons. Jump into whichever you like, in any order: nothing here is locked. Not sure where to start? Pick a route.",
    ninguno: "No worlds on this route yet.",
    ilimitada: "Unlimited fuel",
    primera: "First time here?",
    primeraTexto: "Punti walks you through the universe, fuel and ranks in five steps.",
    manual: "SEE MANUAL",
    juegos: "MINIGAMES",
    juegosTexto: "Refill your fuel by playing. A new one every day: the AI Word.",
  },
};

export default function InicioPage() {
  const router = useRouter();
  const idioma = useIdioma();
  const catalogo = useCatalogo();
  const t = TX[idioma];
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  // Se espera al perfil antes de pintar los mundos. Si no, se ve un instante
  // la pantalla con 0 de avance y luego salta, o se ve /inicio justo antes de
  // mandar a la bienvenida.
  const [perfilListo, setPerfilListo] = useState(false);
  const [filtro, setFiltro] = useState<FiltroMundos>("todos");
  // Reloj de minuto en minuto: solo para el tiempo que le queda al premio de
  // gasolina ilimitada.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const reloj = setInterval(() => setAhora(Date.now()), 60_000);
    return () => clearInterval(reloj);
  }, []);

  useEffect(() => {
    if (!cargando && !usuario) router.push("/login");
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario) return;
    let vigente = true;
    obtenerPerfil(usuario.uid).then((datos) => {
      if (!vigente) return;
      // Todo el que entra converge aquí — correo, Google, o una cuenta vieja
      // sin idioma —, así que este es el único lugar donde hace falta revisar
      // si ya pasó por la bienvenida.
      if (datos && !datos.bienvenidaVista) {
        router.replace("/bienvenida");
        return;
      }
      // El perfil manda sobre el navegador: es lo único que viaja de un
      // celular a otro. Si alguien eligió inglés en el computador, el celular
      // también tiene que abrir en inglés.
      if (datos?.idioma) cambiarIdioma(datos.idioma);
      // Dentro de una transición: así el navegador anima el paso del
      // esqueleto al contenido en vez de cambiarlo de golpe.
      startTransition(() => {
        setPerfil(datos);
        setPerfilListo(true);
      });
    });
    return () => {
      vigente = false;
    };
  }, [usuario, router]);

  // El avance se deriva del progreso guardado: no se guarda un "estado" aparte
  // que se pueda desincronizar.
  const mundos = useMemo<MundoEnLista[]>(
    () =>
      catalogo.temas.map((tema) => {
        const tx = textoTema(tema, idioma);
        return {
          id: tema.id,
          numero: tema.numero,
          nombre: tx.nombre,
          titulo: tx.titulo,
          descripcion: tx.descripcion,
          rango: tema.rango,
          club: tema.club === true,
          total: tema.subtemas.length,
          hechas: tema.subtemas.filter((s) => perfil?.progreso?.[s.id]?.completada).length,
          disponibles: tema.subtemas.filter((s) => catalogo.conLeccion.has(s.id)).length,
        };
      }),
    [perfil, idioma, catalogo],
  );

  if (cargando || !usuario) return <Cargando />;

  // El esqueleto espera también al catálogo: si no, se verían un instante los
  // mundos del código y después saltarían a los de Firebase.
  if (!perfilListo || !catalogo.listo) {
    return (
      <ViewTransition exit="esqueleto-sale" default="none">
        <EsqueletoMundos />
      </ViewTransition>
    );
  }

  const gasolina = perfil ? gasolinaEfectiva(perfil) : 0;
  const sinLimite = gasolinaIlimitada(perfil, ahora);
  const conteos: Record<FiltroMundos, number> = {
    todos: mundos.length,
    explorador: mundos.filter((m) => m.rango === "explorador").length,
    capitan: mundos.filter((m) => m.rango === "capitan").length,
    arquitecto: mundos.filter((m) => m.rango === "arquitecto").length,
  };
  const visibles = filtro === "todos" ? mundos : mundos.filter((m) => m.rango === filtro);
  const racha = perfil ? rachaEfectiva(perfil) : 0;
  const totalSubtemas = catalogo.temas.reduce((suma, x) => suma + x.subtemas.length, 0);
  const totalHechas = mundos.reduce((suma, x) => suma + x.hechas, 0);

  return (
    <ViewTransition enter="contenido-entra" default="none">
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3 px-4 py-2.5 sm:px-6">
          {/* El avatar lleva al perfil: es donde se busca de forma natural. */}
          <Link
            href="/perfil"
            transitionTypes={["adelante"]}
            aria-label={t.perfil}
            title={t.perfil}
            className="shrink-0 border-2 border-transparent p-0.5 transition-colors hover:border-[var(--matrix)] focus-visible:border-[var(--matrix)]"
          >
            <PuntiPixel estado="online" recorte="cabeza" ancho={44} flotando={false} />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-[family-name:var(--font-pixel)] text-[11px] leading-tight text-white sm:text-[13px]">
              {perfil?.nombre ? `${t.hola}, ${perfil.nombre}` : t.elige}
            </h1>
            <p className="mt-1 font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.1em] text-[var(--muted)]">
              <span className="text-[var(--matrix)]">{totalHechas}</span>/{totalSubtemas} {t.lecciones}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Gasolina. La barra dice de un vistazo cuánto queda, que un
                número no logra. */}
            <div className="flex items-center gap-1.5" title={`${t.gasolina}: ${gasolina} ${t.de} ${gasolinaMaxima()}`}>
              <span className="hidden font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.14em] text-[var(--muted)] sm:inline">
                {t.gasolina}
              </span>
              {sinLimite.activa ? (
                <span
                  className="border-2 border-[var(--gold)] bg-[rgba(255,230,0,0.1)] px-1.5 py-0.5 font-[family-name:var(--font-terminal)] text-[15px] tracking-[0.06em] text-[var(--gold)]"
                  title={t.ilimitada}
                  aria-label={t.ilimitada}
                >
                  ∞ {sinLimite.club ? "CLUB" : sinLimite.hasta ? textoRestante(sinLimite.hasta, ahora) : ""}
                </span>
              ) : (
                <BarraGasolina
                  gasolina={gasolina}
                  maximo={gasolinaMaxima()}
                  etiqueta={`${t.gasolina}: ${gasolina} ${t.de} ${gasolinaMaxima()}`}
                />
              )}
            </div>

            <span className="font-[family-name:var(--font-pixel)] text-[10px] text-[var(--cyan)]" title="XP">
              {perfil?.xp ?? 0} XP
            </span>
            <span className="font-[family-name:var(--font-pixel)] text-[10px] text-[var(--pink)]" title={t.racha}>
              {racha}D
            </span>

            <BotonSonido className="hidden sm:grid" />
            <SelectorIdioma className="hidden sm:inline-flex" alCambiar={(i) => guardarIdioma(usuario.uid, i).catch(() => {})} />

            <button
              onClick={() => signOut(auth)}
              aria-label={t.cerrar}
              className="border-2 border-[var(--color-panel-border)] px-2 py-1.5 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.12em] text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
              {t.salir}
            </button>
          </div>
        </div>
      </header>
      <AnuncioGlobal idioma={idioma} />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-16 pt-7 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <p className="font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.3em] text-[var(--matrix)]">
            {t.eyebrow}
          </p>
          {/* En celular el selector no cabe en la cabecera: vive aquí. */}
          <span className="flex items-center gap-2 sm:hidden">
            <BotonSonido />
            <SelectorIdioma alCambiar={(i) => guardarIdioma(usuario.uid, i).catch(() => {})} />
          </span>
        </div>
        <h2 className="mt-2 font-[family-name:var(--font-pixel)] text-[18px] leading-[1.4] text-white sm:text-[26px]">
          {t.elige}
        </h2>
        <p className="mt-3 max-w-[58ch] text-[15px] text-[var(--muted)]">{t.intro.replace("{n}", String(mundos.length))}</p>

        <Link
          href="/juegos"
          transitionTypes={["adelante"]}
          className="tarjeta-juego mt-5 flex max-w-xl items-center gap-3 border-2 border-[var(--gold)] bg-[rgba(40,34,6,0.45)] px-4 py-3 transition-transform"
        >
          <PuntiPixel estado="hype" recorte="cabeza" ancho={44} flotando={false} className="shrink-0" />
          <span className="min-w-0 flex-1">
            <span className="block font-[family-name:var(--font-pixel)] text-[10px] leading-[1.7] text-[var(--gold)]">{t.juegos}</span>
            <span className="block text-[14px] leading-[1.45] text-white">{t.juegosTexto}</span>
          </span>
          <span aria-hidden="true" className="font-[family-name:var(--font-pixel)] text-[12px] text-[var(--gold)]">▸</span>
        </Link>

        <div className="mt-6">
          <FiltroRuta valor={filtro} alCambiar={setFiltro} conteos={conteos} idioma={idioma} />
        </div>

        <div className="mt-6">
          {visibles.length === 0 && <p className="text-[15px] text-[var(--muted)]">{t.ninguno}</p>}
          <MundosPunti mundos={visibles} idioma={idioma} onEntrar={(id) => router.push(`/tema/${id}`, { transitionTypes: ["adelante"] })} />
        </div>

        {/* El mismo recorrido que ve quien se registra por primera vez, aquí
            disponible para repasar cuando haga falta. */}
        <Link
          href="/como-funciona"
          transitionTypes={["adelante"]}
          className="mt-12 flex flex-wrap items-center gap-4 border-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.55)] p-5 transition-colors hover:border-[var(--matrix)]"
        >
          <PuntiPixel estado="info" ancho={64} recorte="busto" flotando={false} />
          <span className="min-w-0 flex-1">
            <span className="block font-[family-name:var(--font-display)] text-[16px] font-black text-white">{t.primera}</span>
            <span className="mt-1 block text-[14.5px] leading-[1.6] text-[var(--muted)]">{t.primeraTexto}</span>
          </span>
          <span className="border-2 border-[var(--matrix)] px-4 py-2.5 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--matrix)]">
            {t.manual}
          </span>
        </Link>

        <PreguntasFrecuentes />
      </main>
    </div>
    </ViewTransition>
  );
}
