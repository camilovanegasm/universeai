"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { textoSubtema } from "@/lib/temas";
import { aLeccion, cargarLeccion, useCatalogo, type LeccionB } from "@/lib/contenido";
import {
  calcularXp,
  completarLeccion,
  gasolinaEfectiva,
  pagarPista,
  gastarGasolina,
  gasolinaMaxima,
} from "@/lib/progreso";
import { obtenerPerfil } from "@/lib/userProfile";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";
import type { EstadoPunti } from "@/lib/puntiSprite";
import { sonar } from "@/lib/sonido";
import { rangoPorXp, type Escalon } from "@/lib/rangos";
import InsigniaRango from "@/components/InsigniaRango";
import BotonSonido from "@/components/BotonSonido";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import BarraGasolina from "@/components/BarraGasolina";
import Ejercicio from "@/components/Ejercicio";
import GraficoExplicacion from "@/components/GraficoExplicacion";

type Fase = "cargando" | "explicacion" | "ejercicios" | "sin-gasolina" | "resultado";

// Etiquetas en fuente pixel sin tildes: Press Start 2P no las trae.
const TX: Record<Idioma, Record<string, string>> = {
  es: {
    noEncontrado: "No encontramos esa lección.",
    volverMundos: "VOLVER A LOS MUNDOS",
    volverMundo: "VOLVER AL MUNDO",
    enObra: "Esta lección todavía está en construcción. Vuelve pronto.",
    salir: "SALIR",
    salirTitulo: "¿Salir de la lección?",
    salirTexto: "Tu avance en esta lección no se guarda. La gasolina que ya gastaste no vuelve.",
    seguir: "SEGUIR JUGANDO",
    transmision: "TRANSMISIÓN · PUNTI",
    pantalla: "PANTALLA",
    de: "DE",
    fin: "FIN DE LA TRANSMISIÓN",
    siguiente: "SIGUIENTE",
    empezar: "EMPEZAR EJERCICIOS",
    gasolina: "Gasolina",
    sinGasTitulo: "Te quedaste sin gasolina",
    sinGasTexto: "Tu gasolina se recarga mañana. Vuelve entonces para seguir con esta lección.",
    completada: "¡Lección completada!",
    combustible: "Combustible",
    tarea: "Tu tarea",
    ejercicio: "Ejercicio",
    nuevoRango: "NUEVO RANGO",
    clubTitulo: "Esta lección es del Club",
    clubTexto: "Está en un mundo de Punti Club. Todo lo esencial de la IA sigue gratis en los demás mundos.",
    clubBoton: "VER PUNTI CLUB",
    ilimitada: "Gasolina ilimitada · Club",
  },
  en: {
    noEncontrado: "We couldn't find that lesson.",
    volverMundos: "BACK TO THE WORLDS",
    volverMundo: "BACK TO THE WORLD",
    enObra: "This lesson is still under construction. Come back soon.",
    salir: "EXIT",
    salirTitulo: "Leave this lesson?",
    salirTexto: "Your progress in this lesson won't be saved. Fuel you already used doesn't come back.",
    seguir: "KEEP PLAYING",
    transmision: "TRANSMISSION · PUNTI",
    pantalla: "SCREEN",
    de: "OF",
    fin: "END OF TRANSMISSION",
    siguiente: "NEXT",
    empezar: "START EXERCISES",
    gasolina: "Fuel",
    sinGasTitulo: "You're out of fuel",
    sinGasTexto: "Your fuel refills tomorrow. Come back then to keep going with this lesson.",
    completada: "Lesson complete!",
    // "Fuel" ya es la gasolina; la nota de la lección se llama distinto en
    // inglés para no confundir las dos cosas.
    combustible: "Thrust",
    tarea: "Your mission",
    ejercicio: "Exercise",
    nuevoRango: "NEW RANK",
    clubTitulo: "This lesson is for the Club",
    clubTexto: "It's in a Punti Club world. Everything essential about AI is still free in the other worlds.",
    clubBoton: "SEE PUNTI CLUB",
    ilimitada: "Unlimited fuel · Club",
  },
};

export default function LeccionPage({
  params,
}: {
  params: Promise<{ temaId: string; subtemaId: string }>;
}) {
  const { temaId, subtemaId } = use(params);
  const router = useRouter();
  const idioma = useIdioma();
  const t = TX[idioma];
  const { usuario, cargando } = useAuth();

  const catalogo = useCatalogo();
  const tema = catalogo.temas.find((x) => x.id === temaId);
  const subtema = tema?.subtemas.find((s) => s.id === subtemaId);
  // La lección llega de Firebase (o del código, si aún no se importó).
  // undefined = todavía cargando; null = no existe (en construcción).
  const [leccionB, setLeccionB] = useState<LeccionB | null | undefined>(undefined);
  useEffect(() => {
    let vigente = true;
    cargarLeccion(subtemaId).then((l) => {
      if (vigente) setLeccionB(l);
    });
    return () => {
      vigente = false;
    };
  }, [subtemaId]);
  const leccion = useMemo(() => (leccionB ? aLeccion(leccionB, idioma) : undefined), [leccionB, idioma]);
  const volverAlTema = `/tema/${temaId}`;

  const [fase, setFase] = useState<Fase>("cargando");
  const [indiceExplicacion, setIndiceExplicacion] = useState(0);
  const [indiceEjercicio, setIndiceEjercicio] = useState(0);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const [errores, setErrores] = useState(0);
  const [gasolina, setGasolina] = useState(0);
  // Miembro del Club: gasolina ilimitada y pistas gratis. null = aún no se sabe.
  const [premium, setPremium] = useState<boolean | null>(null);
  const [estadoPunti, setEstadoPunti] = useState<EstadoPunti>("online");
  const [resultado, setResultado] = useState<{ xp: number; combustible: 1 | 2 | 3; rangoNuevo: Escalon | null } | null>(null);
  const xpInicial = useRef(0);
  const inicioEjerciciosRef = useRef<number>(0);
  const relojPunti = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!cargando && !usuario) router.push("/login");
  }, [cargando, usuario, router]);

  const hayLeccion = Boolean(leccion);
  useEffect(() => {
    if (!usuario || !hayLeccion) return;
    obtenerPerfil(usuario.uid).then((perfil) => {
      setGasolina(perfil ? gasolinaEfectiva(perfil) : 0);
      setPremium(perfil?.premium === true);
      xpInicial.current = perfil?.xp ?? 0;
      setFase("explicacion");
    });
  }, [usuario, hayLeccion]);

  // Si la lección es de un mundo del Club y no llegó, hay que saber si la
  // persona es miembro para mostrar la explicación del Club.
  const esMundoClub = catalogo.temas.find((x) => x.id === temaId)?.club === true;
  useEffect(() => {
    if (!usuario || !esMundoClub || leccionB !== null) return;
    let vigente = true;
    obtenerPerfil(usuario.uid).then((p) => {
      if (vigente) setPremium(p?.premium === true);
    });
    return () => {
      vigente = false;
    };
  }, [usuario, esMundoClub, leccionB]);

  useEffect(() => () => {
    if (relojPunti.current) clearTimeout(relojPunti.current);
  }, []);

  /** Punti reacciona un momento y vuelve a su estado de reposo. */
  function reaccionar(estado: EstadoPunti, ms = 1500) {
    if (relojPunti.current) clearTimeout(relojPunti.current);
    setEstadoPunti(estado);
    relojPunti.current = setTimeout(() => setEstadoPunti("online"), ms);
  }

  // En un mundo del Club, la lección de Firebase solo llega si la persona es
  // miembro (lo deciden las reglas). Si no llega, se explica el Club en vez
  // de decir "en construcción".
  const esClub = tema?.club === true;

  if (cargando || !usuario || !catalogo.listo || leccionB === undefined || (esClub && leccionB === null && premium === null)) {
    return <Cargando />;
  }

  if (esClub && premium !== true && !leccionB) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <PuntiPixel estado="info" ancho={128} />
        <h2 className="font-[family-name:var(--font-display)] text-xl font-black text-[var(--gold)]">{t.clubTitulo}</h2>
        <p className="max-w-md text-[15px] leading-[1.6] text-[var(--muted)]">{t.clubTexto}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/club" className="boton-pixel" style={{ borderColor: "var(--gold)", background: "var(--gold)", color: "#05050f" }}>
            {t.clubBoton}
          </Link>
          <Link href={volverAlTema} transitionTypes={["atras"]} className="boton-pixel">
            {t.volverMundo}
          </Link>
        </div>
      </div>
    );
  }

  if (!tema || !subtema) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <PuntiPixel estado="error" ancho={112} />
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">{t.noEncontrado}</p>
        <Link href="/inicio" transitionTypes={["atras"]} className="boton-pixel">
          {t.volverMundos}
        </Link>
      </div>
    );
  }

  const txSubtema = textoSubtema(subtema, idioma);

  if (!leccion) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <PuntiPixel estado="loading" ancho={128} />
        <h2 className="font-[family-name:var(--font-display)] text-xl font-black text-white">{txSubtema.titulo}</h2>
        <p className="max-w-md text-[15px] leading-[1.6] text-[var(--muted)]">{t.enObra}</p>
        <Link href={volverAlTema} transitionTypes={["atras"]} className="boton-pixel">
          {t.volverMundo}
        </Link>
      </div>
    );
  }

  const etiquetaGasolina = premium ? t.ilimitada : `${t.gasolina}: ${gasolina} / ${gasolinaMaxima()}`;

  function siguienteExplicacion() {
    if (!leccion) return;
    sonar("pantalla");
    if (indiceExplicacion + 1 < leccion.explicacion.length) {
      setIndiceExplicacion((i) => i + 1);
    } else {
      inicioEjerciciosRef.current = Date.now();
      setFase("ejercicios");
    }
  }

  async function manejarResultadoEjercicio(correcto: boolean) {
    if (correcto) {
      reaccionar("levelup");
      avanzarEjercicio();
      return;
    }

    setErrores((e) => e + 1);
    if (!usuario) return;
    if (premium) {
      // Club: fallar no gasta gasolina.
      reaccionar("error");
      return;
    }
    // gastarGasolina devuelve lo que queda: no hace falta releer el perfil.
    const gasolinaRestante = await gastarGasolina(usuario.uid);
    setGasolina(gasolinaRestante);

    if (gasolinaRestante <= 0) {
      // "Sin batería" queda reservado para quedarse de verdad sin gasolina.
      if (relojPunti.current) clearTimeout(relojPunti.current);
      // Espera a que termine el zumbido del error, para no encimar los dos.
      setTimeout(() => sonar("sinGasolina"), 380);
      setEstadoPunti("battery");
      setFase("sin-gasolina");
      return;
    }

    // Fallar un ejercicio es un error, no quedarse sin batería: antes Punti
    // usaba el mismo estado para las dos cosas y no se distinguían.
    reaccionar("error");
    // Se queda en el mismo ejercicio para que la persona lo intente de nuevo.
  }

  async function usarPista() {
    if (!usuario) return;
    sonar("pista");
    reaccionar("info", 2200);
    if (premium) return; // Club: las pistas son gratis.
    setGasolina(await pagarPista(usuario.uid));
  }

  function avanzarEjercicio() {
    if (!leccion) return;
    if (indiceEjercicio + 1 < leccion.ejercicios.length) {
      setIndiceEjercicio((i) => i + 1);
    } else {
      terminarLeccion();
    }
  }

  async function terminarLeccion() {
    if (!usuario || !leccion) return;
    const tiempoSegundos = Math.round((Date.now() - inicioEjerciciosRef.current) / 1000);
    const datosResultado = {
      errores,
      tiempoSegundos,
      tiempoObjetivoSegundos: leccion.tiempoObjetivoSegundos,
    };
    const { xp, combustible } = calcularXp(datosResultado);
    await completarLeccion(usuario.uid, leccion.id, datosResultado);
    if (relojPunti.current) clearTimeout(relojPunti.current);

    // ¿Esta lección lo hizo subir de rango? Se compara el rango de antes con el
    // de después, a partir de la XP que tenía al abrir la lección.
    const antes = rangoPorXp(xpInicial.current).actual;
    const despues = rangoPorXp(xpInicial.current + xp).actual;
    const rangoNuevo = antes.id !== despues.id ? despues : null;

    sonar("completa");
    // El ascenso va después de la victoria, no encima: dos fanfarrias a la
    // vez se tapan y ninguna se entiende.
    if (rangoNuevo) setTimeout(() => sonar("nivel"), 1500);

    setResultado({ xp, combustible, rangoNuevo });
    setEstadoPunti(combustible === 3 ? "hype" : "levelup");
    setFase("resultado");
  }

  if (fase === "cargando") {
    return <Cargando />;
  }

  if (fase === "explicacion") {
    const pantalla = leccion.explicacion[indiceExplicacion];
    const total = leccion.explicacion.length;
    const ultima = indiceExplicacion + 1 === total;

    return (
      <div className="flex flex-1 flex-col">
        {/* HUD: salir, progreso por segmentos y gasolina */}
        <header className="flex items-center gap-3 border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)] px-4 py-3">
          <Link
            href={volverAlTema}
            transitionTypes={["atras"]}
            className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink)]"
          >
            {t.salir}
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">
              {txSubtema.titulo}
            </p>
            <div className="mt-1.5 flex gap-1">
              {leccion.explicacion.map((_, indice) => (
                <span
                  key={indice}
                  className={
                    indice < indiceExplicacion
                      ? "h-1.5 flex-1 bg-[var(--matrix)] shadow-[0_0_8px_rgba(0,255,65,0.5)]"
                      : indice === indiceExplicacion
                        ? "h-1.5 flex-1 bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]"
                        : "h-1.5 flex-1 bg-white/10"
                  }
                />
              ))}
            </div>
          </div>

          <BarraGasolina gasolina={premium ? gasolinaMaxima() : gasolina} maximo={gasolinaMaxima()} etiqueta={etiquetaGasolina} alto={14} />
          <BotonSonido className="shrink-0" />
        </header>

        {/* Consola de transmisión */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5">
          <div className="consola-leccion mx-auto w-full max-w-3xl">
            <span className="consola-esquina consola-esquina-tl" />
            <span className="consola-esquina consola-esquina-tr" />
            <span className="consola-esquina consola-esquina-bl" />
            <span className="consola-esquina consola-esquina-br" />

            <div className="flex items-center gap-2.5 border-b border-[var(--color-panel-border)] px-4 py-2.5 font-[family-name:var(--font-terminal)] text-base tracking-wider text-[var(--matrix)]">
              <span className="punto-transmision h-[7px] w-[7px] bg-[var(--matrix)] shadow-[0_0_9px_var(--matrix)]" />
              <span>{t.transmision}</span>
              <span className="ml-auto text-[15px] tracking-[0.14em] text-[var(--muted)]">
                {String(indiceExplicacion + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
              <div className="shrink-0 text-center">
                <PuntiPixel estado={pantalla.estadoPunti} ancho={104} recorte="busto" />
              </div>
              <p className="min-w-0 flex-1 text-center font-[family-name:var(--font-terminal)] text-xl leading-snug text-[var(--cyan)] sm:text-left sm:text-[25px]">
                <TextoTecleado key={`${idioma}-${indiceExplicacion}`} texto={pantalla.texto} />
              </p>
            </div>

            {pantalla.grafico && (
              <div className="px-4 pb-5 sm:px-5">
                <GraficoExplicacion grafico={pantalla.grafico} idioma={idioma} />
              </div>
            )}
          </div>
        </div>

        {/* Pie con el avance y el botón */}
        <footer className="border-t-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.96)] px-4 py-3.5">
          <div className="mx-auto flex w-full max-w-3xl flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-center font-[family-name:var(--font-terminal)] text-base tracking-[0.12em] text-[var(--muted)] sm:text-left">
              {ultima ? t.fin : `${t.pantalla} ${indiceExplicacion + 1} ${t.de} ${total}`}
            </p>
            <button
              onClick={siguienteExplicacion}
              className={`boton-pixel sm:ml-auto ${ultima ? "boton-pixel-oro" : "boton-pixel-lleno"}`}
            >
              {ultima ? t.empezar : t.siguiente}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  if (fase === "sin-gasolina") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <PuntiPixel estado="battery" ancho={144} />
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-black text-white">{t.sinGasTitulo}</h2>
        <BarraGasolina gasolina={0} maximo={gasolinaMaxima()} etiqueta={`${t.gasolina}: 0 / ${gasolinaMaxima()}`} alto={20} />
        <p className="max-w-md text-[15px] leading-[1.6] text-[var(--muted)]">{t.sinGasTexto}</p>
        <Link href={volverAlTema} transitionTypes={["atras"]} className="boton-pixel">
          {t.volverMundo}
        </Link>
      </div>
    );
  }

  if (fase === "resultado" && resultado) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
        <PuntiPixel estado={estadoPunti} ancho={176} />
        <h2 className="font-[family-name:var(--font-pixel)] text-[16px] leading-[1.5] text-[var(--matrix)] sm:text-[20px]">
          {t.completada}
        </h2>

        {resultado.rangoNuevo && (
          <div
            className="rango-nuevo border-2 px-5 py-3 text-center"
            style={{ borderColor: resultado.rangoNuevo.color, color: resultado.rangoNuevo.color }}
          >
            <p className="font-[family-name:var(--font-pixel)] text-[9px]">{t.nuevoRango}</p>
            <InsigniaRango escalon={resultado.rangoNuevo} ancho={120} className="mx-auto mt-3" />
            <p className="mt-2 font-[family-name:var(--font-display)] text-[19px] font-black">
              {idioma === "en" ? resultado.rangoNuevo.tituloEn : resultado.rangoNuevo.titulo}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="text-center">
            <span className="flex justify-center gap-1" role="img" aria-label={`${t.combustible}: ${resultado.combustible} / 3`}>
              {[0, 1, 2].map((k) => (
                <i
                  key={k}
                  className={`block h-6 w-4 ${
                    k < resultado.combustible ? "bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)]" : "bg-white/10"
                  }`}
                />
              ))}
            </span>
            <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {t.combustible}
            </p>
          </div>
          <div className="text-center">
            <p className="font-[family-name:var(--font-pixel)] text-[22px] text-[var(--gold)]">+{resultado.xp}</p>
            <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.14em] text-[var(--muted)]">
              XP
            </p>
          </div>
        </div>

        <div className="w-full max-w-md border-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.6)] p-5 text-left">
          <p className="mb-2 font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.16em] text-[var(--matrix)]">
            {"// "}
            {t.tarea}
          </p>
          <p className="text-[14.5px] leading-[1.6] text-white">{leccion.tarea}</p>
        </div>

        <Link href={volverAlTema} transitionTypes={["atras"]} className="boton-pixel boton-pixel-lleno">
          {t.volverMundo}
        </Link>
      </div>
    );
  }

  // fase === "ejercicios"
  const ejercicioActual = leccion.ejercicios[indiceEjercicio];
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="mb-6 flex w-full max-w-md items-center justify-between gap-3">
        {/* Antes no había forma de salir del quiz sin cerrar la pestaña. */}
        <button
          onClick={() => setConfirmarSalida(true)}
          className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink)]"
        >
          {t.salir}
        </button>
        <BarraGasolina gasolina={premium ? gasolinaMaxima() : gasolina} maximo={gasolinaMaxima()} etiqueta={etiquetaGasolina} />
        <span className="ml-auto flex items-center gap-3">
          <span className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {t.ejercicio} {indiceEjercicio + 1} / {leccion.ejercicios.length}
          </span>
          <BotonSonido />
        </span>
      </div>
      <div className="mb-5">
        <PuntiPixel estado={estadoPunti} ancho={96} />
      </div>
      <div className="w-full max-w-md border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] p-5 sm:p-6">
        <Ejercicio
          key={`${idioma}-${indiceEjercicio}`}
          ejercicio={ejercicioActual}
          gasolinaDisponible={premium ? gasolinaMaxima() : gasolina}
          costoPista={premium ? 0 : catalogo.ajustes.juego.costoPista}
          onResultado={manejarResultadoEjercicio}
          onUsarPista={usarPista}
          idioma={idioma}
        />
      </div>
      {confirmarSalida && (
        <ConfirmarSalida
          titulo={t.salirTitulo}
          texto={t.salirTexto}
          seguir={t.seguir}
          salir={t.salir}
          alSeguir={() => setConfirmarSalida(false)}
          alSalir={() => router.push(volverAlTema, { transitionTypes: ["atras"] })}
        />
      )}
    </div>
  );
}

/**
 * Confirmación para salir del quiz. Es un panel de la app, no un
 * confirm() del navegador: se ve como el resto y no congela la página.
 * Escape o tocar fuera = seguir jugando (lo que no pierde nada).
 */
function ConfirmarSalida({
  titulo,
  texto,
  seguir,
  salir,
  alSeguir,
  alSalir,
}: {
  titulo: string;
  texto: string;
  seguir: string;
  salir: string;
  alSeguir: () => void;
  alSalir: () => void;
}) {
  const seguirRef = useRef<HTMLButtonElement>(null);

  // El foco va a "seguir jugando" una sola vez, al abrir.
  useEffect(() => {
    seguirRef.current?.focus();
  }, []);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") alSeguir();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [alSeguir]);

  return (
    <div
      className="cargando-entra fixed inset-0 z-40 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) alSeguir();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="salir-titulo"
        className="flex w-full max-w-sm flex-col items-center gap-4 border-2 border-[var(--pink)] bg-[#0a0a1e] p-6 text-center"
      >
        <PuntiPixel estado="battery" ancho={80} />
        <h2 id="salir-titulo" className="font-[family-name:var(--font-display)] text-xl font-black text-white">
          {titulo}
        </h2>
        <p className="text-[15px] text-[var(--muted)]">{texto}</p>
        <div className="flex w-full flex-col gap-2">
          <button ref={seguirRef} onClick={alSeguir} className="boton-pixel boton-pixel-lleno">
            {seguir}
          </button>
          <button
            onClick={alSalir}
            className="px-3 py-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--pink)] hover:underline"
          >
            {salir}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Escribe el texto letra por letra, como una transmisión entrante.
 * Se monta de nuevo en cada pantalla (por el `key`), así no hace falta
 * reiniciar el contador a mano. Si la persona pidió menos movimiento,
 * muestra el texto completo de una vez.
 */
function TextoTecleado({ texto }: { texto: string }) {
  const [sinMovimiento] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [letras, setLetras] = useState(0);

  useEffect(() => {
    if (sinMovimiento) return;
    let cuantas = 0;
    const id = setInterval(() => {
      cuantas += 2;
      if (texto[cuantas - 1] && texto[cuantas - 1] !== " ") sonar("voz");
      if (cuantas >= texto.length) {
        setLetras(texto.length);
        clearInterval(id);
      } else {
        setLetras(cuantas);
      }
    }, 12);
    return () => clearInterval(id);
  }, [texto, sinMovimiento]);

  const completo = sinMovimiento || letras >= texto.length;

  return (
    <>
      {completo ? texto : texto.slice(0, letras)}
      {!completo && <span className="cursor-terminal" />}
    </>
  );
}
