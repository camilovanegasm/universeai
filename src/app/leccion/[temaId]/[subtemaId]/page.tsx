"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { TEMAS } from "@/lib/temas";
import { LECCIONES } from "@/lib/lecciones";
import {
  calcularXp,
  completarLeccion,
  corazonesEfectivos,
  gastarMedioCorazon,
  restarCorazon,
} from "@/lib/progreso";
import { obtenerPerfil } from "@/lib/userProfile";
import Punti, { type EstadoPunti } from "@/components/Punti";
import Ejercicio from "@/components/Ejercicio";
import GraficoExplicacion from "@/components/GraficoExplicacion";

type Fase = "cargando" | "explicacion" | "ejercicios" | "sin-corazones" | "resultado";

export default function LeccionPage({
  params,
}: {
  params: Promise<{ temaId: string; subtemaId: string }>;
}) {
  const { temaId, subtemaId } = use(params);
  const router = useRouter();
  const { usuario, cargando } = useAuth();

  const tema = TEMAS.find((t) => t.id === temaId);
  const subtema = tema?.subtemas.find((s) => s.id === subtemaId);
  const leccion = LECCIONES[subtemaId];
  const volverAlTema = `/tema/${temaId}`;

  const [fase, setFase] = useState<Fase>("cargando");
  const [indiceExplicacion, setIndiceExplicacion] = useState(0);
  const [indiceEjercicio, setIndiceEjercicio] = useState(0);
  const [errores, setErrores] = useState(0);
  const [corazones, setCorazones] = useState(0);
  const [estadoPunti, setEstadoPunti] = useState<EstadoPunti>("online");
  const [resultado, setResultado] = useState<{ xp: number; combustible: 1 | 2 | 3 } | null>(null);
  const inicioEjerciciosRef = useRef<number>(0);

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login");
    }
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario || !leccion) return;
    obtenerPerfil(usuario.uid).then((perfil) => {
      setCorazones(perfil ? corazonesEfectivos(perfil) : 0);
      setFase("explicacion");
    });
  }, [usuario, leccion]);


  if (cargando || !usuario) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-[family-name:var(--font-terminal)] text-xl text-[var(--matrix)]">
          Cargando...
        </p>
      </div>
    );
  }

  if (!tema || !subtema) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-[family-name:var(--font-ui)] text-white">Subtema no encontrado.</p>
        <Link href="/inicio" className="boton-matrix rounded-xl px-6 py-2.5 text-sm font-bold uppercase">
          Volver al mapa
        </Link>
      </div>
    );
  }

  if (!leccion) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <Punti estado="loading" tamano={120} />
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
          {subtema.titulo}
        </h2>
        <p className="max-w-md font-[family-name:var(--font-ui)] text-[var(--muted)]">
          Este subtema todavía está en construcción. ¡Vuelve pronto!
        </p>
        <Link href={volverAlTema} className="boton-matrix rounded-xl px-6 py-2.5 text-sm font-bold uppercase">
          Volver a {tema.titulo}
        </Link>
      </div>
    );
  }

  function siguienteExplicacion() {
    if (indiceExplicacion + 1 < leccion.explicacion.length) {
      setIndiceExplicacion((i) => i + 1);
    } else {
      inicioEjerciciosRef.current = Date.now();
      setFase("ejercicios");
    }
  }

  async function manejarResultadoEjercicio(correcto: boolean) {
    if (correcto) {
      setEstadoPunti("levelup");
      setTimeout(() => setEstadoPunti("online"), 1500);
      avanzarEjercicio();
      return;
    }

    setErrores((e) => e + 1);
    if (!usuario) return;
    await restarCorazon(usuario.uid);
    const perfil = await obtenerPerfil(usuario.uid);
    const corazonesRestantes = perfil ? corazonesEfectivos(perfil) : 0;
    setCorazones(corazonesRestantes);

    if (corazonesRestantes <= 0) {
      setEstadoPunti("battery");
      setFase("sin-corazones");
      return;
    }

    setEstadoPunti("battery");
    setTimeout(() => setEstadoPunti("online"), 1500);
    // Se queda en el mismo ejercicio para que el usuario lo intente de nuevo.
  }

  async function usarPista() {
    if (!usuario) return;
    await gastarMedioCorazon(usuario.uid);
    const perfil = await obtenerPerfil(usuario.uid);
    setCorazones(perfil ? corazonesEfectivos(perfil) : 0);
  }

  function avanzarEjercicio() {
    if (indiceEjercicio + 1 < leccion.ejercicios.length) {
      setIndiceEjercicio((i) => i + 1);
    } else {
      terminarLeccion();
    }
  }

  async function terminarLeccion() {
    if (!usuario) return;
    const tiempoSegundos = Math.round((Date.now() - inicioEjerciciosRef.current) / 1000);
    const datosResultado = {
      errores,
      tiempoSegundos,
      tiempoObjetivoSegundos: leccion.tiempoObjetivoSegundos,
    };
    const { xp, combustible } = calcularXp(datosResultado);
    await completarLeccion(usuario.uid, leccion.id, datosResultado);
    setResultado({ xp, combustible });
    setEstadoPunti(combustible === 3 ? "hype" : "levelup");
    setFase("resultado");
  }

  if (fase === "cargando") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Punti estado="loading" tamano={100} />
      </div>
    );
  }

  if (fase === "explicacion") {
    const pantalla = leccion.explicacion[indiceExplicacion];
    const total = leccion.explicacion.length;
    const ultima = indiceExplicacion + 1 === total;

    return (
      <div className="flex flex-1 flex-col">
        {/* HUD: salir, progreso por segmentos y corazones */}
        <header className="flex items-center gap-3 border-b border-[var(--color-panel-border)] bg-gradient-to-b from-[rgba(5,5,16,0.94)] to-[rgba(5,5,16,0.6)] px-4 py-3">
          <Link
            href={volverAlTema}
            className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 font-[family-name:var(--font-ui)] text-[13px] font-semibold tracking-wide text-[var(--muted)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink)]"
          >
            ← Salir
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate font-[family-name:var(--font-ui)] text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
              {tema.titulo} · {subtema.titulo}
            </p>
            <div className="mt-1.5 flex gap-1.5">
              {leccion.explicacion.map((_, indice) => (
                <span
                  key={indice}
                  className={
                    indice < indiceExplicacion
                      ? "h-1 flex-1 rounded-full bg-[var(--matrix)] shadow-[0_0_8px_rgba(0,255,65,0.5)]"
                      : indice === indiceExplicacion
                        ? "h-1 flex-1 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]"
                        : "h-1 flex-1 rounded-full bg-white/10"
                  }
                />
              ))}
            </div>
          </div>

          <span className="shrink-0 font-[family-name:var(--font-ui)] text-[15px] font-bold text-white">
            ❤️ {corazones}
          </span>
        </header>

        {/* Consola de transmisión */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-6">
          <div className="consola-leccion mx-auto w-full max-w-3xl">
            <span className="consola-esquina consola-esquina-tl" />
            <span className="consola-esquina consola-esquina-tr" />
            <span className="consola-esquina consola-esquina-bl" />
            <span className="consola-esquina consola-esquina-br" />

            <div className="flex items-center gap-2.5 border-b border-[var(--color-panel-border)] px-4 py-2.5 font-[family-name:var(--font-terminal)] text-base tracking-wider text-[var(--matrix)]">
              <span className="punto-transmision h-[7px] w-[7px] rounded-full bg-[var(--matrix)] shadow-[0_0_9px_var(--matrix)]" />
              <span>TRANSMISIÓN · PUNTI</span>
              <span className="ml-auto text-[15px] tracking-[0.14em] text-[var(--muted)]">
                {String(indiceExplicacion + 1).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
              <div className="shrink-0 text-center">
                <Punti estado={pantalla.estadoPunti} tamano={104} />
                <p className="mt-1 font-[family-name:var(--font-terminal)] text-sm tracking-[0.16em] text-[var(--matrix)] opacity-70">
                  PUNTI
                </p>
              </div>
              <p className="min-w-0 flex-1 text-center font-[family-name:var(--font-terminal)] text-xl leading-snug text-[var(--cyan)] sm:text-left sm:text-[25px]">
                <TextoTecleado key={indiceExplicacion} texto={pantalla.texto} />
              </p>
            </div>

            {pantalla.grafico && (
              <div className="px-4 pb-5 sm:px-5">
                <GraficoExplicacion grafico={pantalla.grafico} />
              </div>
            )}
          </div>
        </div>

        {/* Pie con el avance y el botón */}
        <footer className="border-t border-[var(--color-panel-border)] bg-gradient-to-t from-[rgba(5,5,16,0.96)] to-[rgba(5,5,16,0.55)] px-4 py-3.5">
          <div className="mx-auto flex w-full max-w-3xl flex-col-reverse items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <p className="text-center font-[family-name:var(--font-terminal)] text-base tracking-[0.12em] text-[var(--muted)] sm:text-left">
              {ultima
                ? "FIN DE LA TRANSMISIÓN"
                : `PANTALLA ${indiceExplicacion + 1} DE ${total}`}
            </p>
            <button
              onClick={siguienteExplicacion}
              className={
                ultima
                  ? "rounded-xl border border-[var(--gold)] bg-[rgba(255,230,0,0.1)] px-6 py-3 font-[family-name:var(--font-ui)] text-sm font-bold uppercase tracking-wide text-[var(--gold)] transition-colors hover:bg-[rgba(255,230,0,0.2)] sm:ml-auto"
                  : "boton-matrix rounded-xl px-6 py-3 font-[family-name:var(--font-ui)] text-sm font-bold uppercase tracking-wide sm:ml-auto"
              }
            >
              {ultima ? "Empezar ejercicios" : "Siguiente"}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  if (fase === "sin-corazones") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <Punti estado="battery" tamano={130} />
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
          Te quedaste sin corazones
        </h2>
        <p className="max-w-md font-[family-name:var(--font-ui)] text-[var(--muted)]">
          Tus corazones se recargan mañana. Vuelve entonces para seguir con
          esta lección.
        </p>
        <Link href={volverAlTema} className="boton-matrix rounded-xl px-6 py-2.5 text-sm font-bold uppercase">
          Volver a {tema.titulo}
        </Link>
      </div>
    );
  }

  if (fase === "resultado" && resultado) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <Punti estado={estadoPunti} tamano={150} />
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--matrix)]">
          ¡Lección completada!
        </h2>
        <p className="font-[family-name:var(--font-ui)] text-lg text-white">
          Combustible: {"⛽".repeat(resultado.combustible)}
          {"·".repeat(3 - resultado.combustible)}
        </p>
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-[var(--gold)]">
          +{resultado.xp} XP
        </p>

        <div className="tarjeta-espacial w-full max-w-md rounded-2xl p-5 text-left">
          <p className="mb-2 font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wide text-[var(--matrix)]">
            🎯 Tu tarea
          </p>
          <p className="font-[family-name:var(--font-ui)] text-sm text-white">{leccion.tarea}</p>
        </div>

        <Link href={volverAlTema} className="boton-matrix rounded-xl px-6 py-2.5 text-sm font-bold uppercase">
          Volver a {tema.titulo}
        </Link>
      </div>
    );
  }

  // fase === "ejercicios"
  const ejercicioActual = leccion.ejercicios[indiceEjercicio];
  return (
    <div className="flex flex-1 flex-col items-center px-6 py-10">
      <div className="mb-8 flex w-full max-w-md items-center justify-between font-[family-name:var(--font-ui)] text-sm font-bold text-white">
        <span>❤️ {corazones}</span>
        <span className="text-[var(--muted)]">
          {indiceEjercicio + 1} / {leccion.ejercicios.length}
        </span>
      </div>
      <div className="mb-6">
        <Punti estado={estadoPunti} tamano={90} />
      </div>
      <div className="tarjeta-espacial w-full max-w-md rounded-2xl p-6">
        <Ejercicio
          key={indiceEjercicio}
          ejercicio={ejercicioActual}
          corazonesDisponibles={corazones}
          onResultado={manejarResultadoEjercicio}
          onUsarPista={usarPista}
        />
      </div>
    </div>
  );
}

/**
 * Escribe el texto letra por letra, como una transmisión entrante.
 * Se monta de nuevo en cada pantalla (por el `key`), así no hace falta
 * reiniciar el contador a mano. Si el usuario pidió menos movimiento,
 * muestra el texto completo de una vez.
 */
function TextoTecleado({ texto }: { texto: string }) {
  const [sinMovimiento] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [letras, setLetras] = useState(0);

  useEffect(() => {
    if (sinMovimiento) return;
    let cuantas = 0;
    const id = setInterval(() => {
      cuantas += 2;
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
