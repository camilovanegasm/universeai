"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MarcoAdmin from "@/components/admin/MarcoAdmin";
import VistaPrevia from "@/components/admin/VistaPrevia";
import {
  BotonBorrar,
  BotonIcono,
  CampoBilingue,
  IndicadorGuardado,
  ListaProblemas,
  cambiar,
  mover,
  quitar,
  useAutoguardado,
} from "@/components/admin/Campos";
import PuntiPixel from "@/components/PuntiPixel";
import {
  ejercicioNuevo,
  firma,
  guardarBorradorLeccion,
  leccionNueva,
  leerLeccionParaEditar,
  leerPanorama,
  publicarLeccion,
  vacio,
  validarLeccion,
} from "@/lib/contenidoAdmin";
import type { EjercicioB, GraficoB, LeccionB, PantallaB, TemaC, Texto, TipoEjercicio } from "@/lib/contenido";
import type { EstadoPunti } from "@/lib/puntiSprite";

/**
 * El editor de una lección: la explicación de Punti (pantallas con texto,
 * estado de Punti y gráfico opcional), los ejercicios y la tarea.
 *
 * Todo se guarda solo como borrador. "PUBLICAR" revisa que no falte nada
 * (los dos idiomas, una respuesta correcta en cada pregunta…) y recién ahí
 * lo copia a la versión que ven los estudiantes.
 */

const ESTADOS_PUNTI: { id: EstadoPunti; texto: string }[] = [
  { id: "online", texto: "En línea (normal)" },
  { id: "boot", texto: "Arrancando (saludo)" },
  { id: "leyendo", texto: "Leyendo" },
  { id: "loading", texto: "Pensando / cargando" },
  { id: "info", texto: "Informativo" },
  { id: "hype", texto: "Emocionado" },
  { id: "levelup", texto: "Subió de nivel" },
  { id: "error", texto: "Error" },
  { id: "battery", texto: "Sin batería" },
];

const TIPOS: { id: TipoEjercicio; texto: string; ayuda: string }[] = [
  { id: "opcion-multiple", texto: "Opción múltiple", ayuda: "Una pregunta y varias respuestas; una es la correcta." },
  { id: "verdadero-falso", texto: "Verdadero o falso", ayuda: "Una afirmación; el estudiante dice si es cierta." },
  { id: "completar-frase", texto: "Completar la frase", ayuda: "Una frase con un espacio en blanco y opciones para llenarlo." },
  { id: "ordenar-pasos", texto: "Ordenar pasos", ayuda: "Escribe los pasos en el orden correcto; al estudiante le salen mezclados." },
  { id: "escribir-prompt", texto: "Escribir un prompt", ayuda: "El estudiante escribe su propio prompt. Se acepta cualquier respuesta de 10 letras o más." },
];

export default function EditorLeccion({ params }: { params: Promise<{ subtemaId: string }> }) {
  const { subtemaId } = use(params);
  const [leccion, setLeccion] = useState<LeccionB | null>(null);
  const [publicada, setPublicada] = useState<LeccionB | null>(null);
  const [ubicacion, setUbicacion] = useState<{ mundo: TemaC; numero: number; titulo: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [problemas, setProblemas] = useState<string[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; malo?: boolean } | null>(null);
  const [previa, setPrevia] = useState(false);

  const { estado, marcarGuardado } = useAutoguardado(leccion, guardarBorradorLeccion);

  useEffect(() => {
    let vigente = true;
    Promise.all([leerLeccionParaEditar(subtemaId), leerPanorama()])
      .then(([datos, panorama]) => {
        if (!vigente) return;
        const base = datos.leccion ?? leccionNueva(subtemaId);
        setLeccion(base);
        setPublicada(datos.publicada);
        // Una lección nueva no se guarda hasta el primer cambio: abrir el
        // editor por curiosidad no deja borradores vacíos.
        marcarGuardado(base);
        for (const mundo of panorama.borrador) {
          const j = mundo.subtemas.findIndex((s) => s.id === subtemaId);
          if (j !== -1) {
            setUbicacion({ mundo, numero: j + 1, titulo: mundo.subtemas[j].titulo.es });
            break;
          }
        }
      })
      .catch((e) => {
        if (!vigente) return;
        setError(
          (e as { code?: string }).code === "permission-denied"
            ? "Firebase no dejó leer la lección. Publica las reglas nuevas (firestore.rules) en la consola de Firebase."
            : "No se pudo cargar la lección. Revisa la conexión.",
        );
      });
    return () => {
      vigente = false;
    };
  }, [subtemaId, marcarGuardado]);

  useEffect(() => {
    if (!aviso) return;
    const reloj = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(reloj);
  }, [aviso]);

  const cambiarLeccion = useCallback((cambio: Partial<LeccionB>) => {
    setLeccion((l) => (l ? { ...l, ...cambio } : l));
  }, []);

  const estadoPublicacion = useMemo(() => {
    if (!leccion) return null;
    if (!publicada) return { texto: "Sin publicar", color: "#6d7b92" };
    if (firma(leccion) !== firma(publicada)) return { texto: "Cambios sin publicar", color: "var(--gold)" };
    return { texto: "Publicada", color: "var(--matrix)" };
  }, [leccion, publicada]);

  async function publicar() {
    if (!leccion) return;
    const p = validarLeccion(leccion);
    setProblemas(p);
    if (p.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPublicando(true);
    try {
      await publicarLeccion(leccion);
      setPublicada(leccion);
      marcarGuardado(leccion);
      setAviso({ texto: "Lección publicada. Ya la ven los estudiantes." });
    } catch {
      setAviso({ texto: "No se pudo publicar. Intenta de nuevo.", malo: true });
    } finally {
      setPublicando(false);
    }
  }

  const faltas = problemas.length > 0;
  const sinCambios = estadoPublicacion?.texto === "Publicada";

  const acciones = leccion ? (
    <>
      <IndicadorGuardado estado={estado} />
      <button onClick={() => setPrevia(true)} className="btn-admin">
        VISTA PREVIA
      </button>
      <button onClick={publicar} disabled={publicando || sinCambios || estado === "guardando"} className="btn-admin btn-admin-lleno">
        {publicando ? "PUBLICANDO…" : "PUBLICAR"}
      </button>
    </>
  ) : null;

  return (
    <MarcoAdmin acciones={acciones} ancho={960}>
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 pb-24 pt-5 sm:px-6">
        <Link href="/admin/contenido" transitionTypes={["atras"]} className="w-fit font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.08em] text-[var(--muted)] hover:text-[var(--matrix)]">
          ← TODO EL CONTENIDO
        </Link>

        {error ? (
          <div className="flex flex-col items-center gap-4 border-2 border-[var(--pink)] px-6 py-10 text-center">
            <PuntiPixel estado="error" ancho={96} />
            <p className="max-w-[56ch] text-[15px] text-[var(--muted)]">{error}</p>
          </div>
        ) : !leccion ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="esqueleto h-[120px]" />
            ))}
          </div>
        ) : (
          <>
            <div>
              <p className="font-[family-name:var(--font-pixel)] text-[9px] leading-[1.7] text-[var(--matrix)]">
                {ubicacion ? `${ubicacion.mundo.nombre.es.toUpperCase()} · LECCION ${ubicacion.numero}` : `LECCION ${subtemaId}`}
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-white">
                {ubicacion?.titulo || subtemaId}
              </h1>
              {estadoPublicacion && (
                <p className="font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.1em]" style={{ color: estadoPublicacion.color }}>
                  {estadoPublicacion.texto}
                </p>
              )}
              <p className="mt-2 max-w-[70ch] text-[14px] text-[var(--muted)]">
                Cada texto va en español (ES) y en inglés (EN). Se guarda solo; los estudiantes lo ven cuando tocas PUBLICAR. El título se cambia en la lista de contenido.
              </p>
            </div>

            <ListaProblemas problemas={problemas} titulo="FALTA ESTO PARA PUBLICAR" />

            {/* ---------------- explicación ---------------- */}
            <Seccion titulo="1. La explicación de Punti" ayuda="Las pantallas que Punti cuenta antes de los ejercicios, una por una.">
              <ol className="flex flex-col gap-4">
                {leccion.explicacion.map((p, i) => (
                  <li key={i}>
                    <Tarjeta
                      titulo={`Pantalla ${i + 1}`}
                      controles={
                        <>
                          <BotonIcono etiqueta="Subir pantalla" onClick={() => cambiarLeccion({ explicacion: mover(leccion.explicacion, i, -1) })} disabled={i === 0}>↑</BotonIcono>
                          <BotonIcono etiqueta="Bajar pantalla" onClick={() => cambiarLeccion({ explicacion: mover(leccion.explicacion, i, 1) })} disabled={i === leccion.explicacion.length - 1}>↓</BotonIcono>
                          <BotonBorrar etiqueta={`Borrar pantalla ${i + 1}`} alBorrar={() => cambiarLeccion({ explicacion: quitar(leccion.explicacion, i) })} />
                        </>
                      }
                    >
                      <EditorPantalla
                        id={`p${i}`}
                        pantalla={p}
                        marcarFaltas={faltas}
                        alCambiar={(v) => cambiarLeccion({ explicacion: cambiar(leccion.explicacion, i, v) })}
                      />
                    </Tarjeta>
                  </li>
                ))}
              </ol>
              <button
                onClick={() => cambiarLeccion({ explicacion: [...leccion.explicacion, { texto: vacio(), estadoPunti: "online" }] })}
                className="btn-admin w-fit"
              >
                + AGREGAR PANTALLA
              </button>
            </Seccion>

            {/* ---------------- ejercicios ---------------- */}
            <Seccion titulo="2. Los ejercicios" ayuda="Para pasar la lección hay que acertar todos. Fallar cuesta una gasolina y se reintenta.">
              <ol className="flex flex-col gap-4">
                {leccion.ejercicios.map((e, i) => (
                  <li key={i}>
                    <Tarjeta
                      titulo={`Ejercicio ${i + 1}`}
                      controles={
                        <>
                          <BotonIcono etiqueta="Subir ejercicio" onClick={() => cambiarLeccion({ ejercicios: mover(leccion.ejercicios, i, -1) })} disabled={i === 0}>↑</BotonIcono>
                          <BotonIcono etiqueta="Bajar ejercicio" onClick={() => cambiarLeccion({ ejercicios: mover(leccion.ejercicios, i, 1) })} disabled={i === leccion.ejercicios.length - 1}>↓</BotonIcono>
                          <BotonBorrar etiqueta={`Borrar ejercicio ${i + 1}`} alBorrar={() => cambiarLeccion({ ejercicios: quitar(leccion.ejercicios, i) })} />
                        </>
                      }
                    >
                      <EditorEjercicio
                        id={`e${i}`}
                        ejercicio={e}
                        marcarFaltas={faltas}
                        alCambiar={(v) => cambiarLeccion({ ejercicios: cambiar(leccion.ejercicios, i, v) })}
                      />
                    </Tarjeta>
                  </li>
                ))}
              </ol>
              <button onClick={() => cambiarLeccion({ ejercicios: [...leccion.ejercicios, ejercicioNuevo("opcion-multiple")] })} className="btn-admin w-fit">
                + AGREGAR EJERCICIO
              </button>
            </Seccion>

            {/* ---------------- cierre ---------------- */}
            <Seccion titulo="3. Cierre" ayuda="Lo que aparece al terminar la lección.">
              <Tarjeta titulo="Tarea y tiempo">
                <div className="flex flex-col gap-4">
                  <CampoBilingue
                    id="tarea"
                    etiqueta="Tarea para la semana"
                    valor={leccion.tarea}
                    alCambiar={(v) => cambiarLeccion({ tarea: v })}
                    marcarFaltas={faltas}
                    largo
                    ayuda="Algo concreto para practicar fuera de Punti."
                  />
                  <label className="flex flex-col gap-1.5">
                    <span className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">Tiempo objetivo (segundos)</span>
                    <input
                      id="tiempo"
                      type="number"
                      min={10}
                      step={10}
                      value={leccion.tiempoObjetivoSegundos}
                      onChange={(e) => cambiarLeccion({ tiempoObjetivoSegundos: Number(e.target.value) || 0 })}
                      className="campo-admin w-32"
                    />
                    <span className="text-[13px] text-[var(--muted)]">
                      Si terminan los ejercicios en menos de este tiempo, ganan 5 XP extra por velocidad.
                    </span>
                  </label>
                </div>
              </Tarjeta>
            </Seccion>
          </>
        )}
      </main>

      {previa && leccion && <VistaPrevia leccion={leccion} alCerrar={() => setPrevia(false)} />}

      {aviso && (
        <p
          role="status"
          className="cargando-entra fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-30 mx-auto w-fit max-w-[calc(100%-32px)] border-2 bg-[#05050f] px-4 py-3 font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.06em]"
          style={{ borderColor: aviso.malo ? "var(--pink)" : "var(--matrix)", color: aviso.malo ? "var(--pink)" : "var(--matrix)" }}
        >
          {aviso.texto}
        </p>
      )}
    </MarcoAdmin>
  );
}

/* ================================================================ piezas */

function Seccion({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-[family-name:var(--font-pixel)] text-[11px] leading-[1.7] text-white">{titulo.toUpperCase()}</h2>
        <p className="text-[14px] text-[var(--muted)]">{ayuda}</p>
      </div>
      {children}
    </section>
  );
}

function Tarjeta({ titulo, controles, children }: { titulo: string; controles?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-2 border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.82)]">
      <div className="flex items-center gap-2 border-b-2 border-[var(--color-panel-border)] px-3 py-2">
        <span className="flex-1 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em] text-[var(--matrix)]">{titulo}</span>
        {controles}
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

function Selector<T extends string>({
  id,
  etiqueta,
  valor,
  opciones,
  alCambiar,
}: {
  id: string;
  etiqueta: string;
  valor: T;
  opciones: { id: T; texto: string }[];
  alCambiar: (v: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">{etiqueta}</span>
      <select id={id} value={valor} onChange={(e) => alCambiar(e.target.value as T)} className="campo-admin w-fit max-w-full">
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ----------------------------------------------------- una pantalla */

function EditorPantalla({
  id,
  pantalla,
  marcarFaltas,
  alCambiar,
}: {
  id: string;
  pantalla: PantallaB;
  marcarFaltas: boolean;
  alCambiar: (p: PantallaB) => void;
}) {
  const tipoGrafico = pantalla.grafico?.tipo ?? "ninguno";

  function cambiarTipoGrafico(tipo: "ninguno" | "tabla" | "flujo") {
    const resto = { texto: pantalla.texto, estadoPunti: pantalla.estadoPunti };
    if (tipo === "ninguno") return alCambiar(resto);
    const grafico: GraficoB =
      tipo === "tabla"
        ? { tipo, encabezados: { a: vacio(), b: vacio() }, filas: [{ a: vacio(), b: vacio() }] }
        : { tipo, pasos: [vacio(), vacio(), vacio()] };
    alCambiar({ ...resto, grafico });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <PuntiPixel estado={pantalla.estadoPunti} ancho={64} flotando={false} />
        <Selector
          id={`${id}-punti`}
          etiqueta="Cómo se ve Punti"
          valor={pantalla.estadoPunti}
          opciones={ESTADOS_PUNTI}
          alCambiar={(v) => alCambiar({ ...pantalla, estadoPunti: v })}
        />
        <Selector
          id={`${id}-grafico`}
          etiqueta="Gráfico"
          valor={tipoGrafico}
          opciones={[
            { id: "ninguno", texto: "Sin gráfico" },
            { id: "tabla", texto: "Tabla de dos columnas" },
            { id: "flujo", texto: "Diagrama de pasos" },
          ]}
          alCambiar={cambiarTipoGrafico}
        />
      </div>
      <CampoBilingue id={`${id}-texto`} etiqueta="Lo que dice Punti" valor={pantalla.texto} alCambiar={(v) => alCambiar({ ...pantalla, texto: v })} marcarFaltas={marcarFaltas} largo />

      {pantalla.grafico?.tipo === "tabla" && (
        <EditorTabla
          id={`${id}-tabla`}
          grafico={pantalla.grafico}
          marcarFaltas={marcarFaltas}
          alCambiar={(g) => alCambiar({ ...pantalla, grafico: g })}
        />
      )}
      {pantalla.grafico?.tipo === "flujo" && (
        <ListaTextos
          id={`${id}-flujo`}
          etiqueta="Pasos del diagrama (en orden)"
          nombre="paso"
          items={pantalla.grafico.pasos}
          minimo={2}
          marcarFaltas={marcarFaltas}
          alCambiar={(pasos) => alCambiar({ ...pantalla, grafico: { tipo: "flujo", pasos } })}
        />
      )}
    </div>
  );
}

function EditorTabla({
  id,
  grafico,
  marcarFaltas,
  alCambiar,
}: {
  id: string;
  grafico: Extract<GraficoB, { tipo: "tabla" }>;
  marcarFaltas: boolean;
  alCambiar: (g: Extract<GraficoB, { tipo: "tabla" }>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-l-2 border-[var(--color-panel-border)] pl-3">
      <CampoBilingue id={`${id}-enc-a`} etiqueta="Encabezado columna 1" valor={grafico.encabezados.a} alCambiar={(v) => alCambiar({ ...grafico, encabezados: { ...grafico.encabezados, a: v } })} marcarFaltas={marcarFaltas} />
      <CampoBilingue id={`${id}-enc-b`} etiqueta="Encabezado columna 2" valor={grafico.encabezados.b} alCambiar={(v) => alCambiar({ ...grafico, encabezados: { ...grafico.encabezados, b: v } })} marcarFaltas={marcarFaltas} />
      {grafico.filas.map((f, j) => (
        <div key={j} className="flex flex-col gap-2 border-2 border-dashed border-[var(--color-panel-border)] p-2">
          <div className="flex items-center gap-2">
            <span className="flex-1 font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.1em] text-[var(--muted)]">Fila {j + 1}</span>
            <BotonIcono etiqueta="Subir fila" onClick={() => alCambiar({ ...grafico, filas: mover(grafico.filas, j, -1) })} disabled={j === 0}>↑</BotonIcono>
            <BotonIcono etiqueta="Bajar fila" onClick={() => alCambiar({ ...grafico, filas: mover(grafico.filas, j, 1) })} disabled={j === grafico.filas.length - 1}>↓</BotonIcono>
            <BotonBorrar etiqueta={`Borrar fila ${j + 1}`} alBorrar={() => alCambiar({ ...grafico, filas: quitar(grafico.filas, j) })} />
          </div>
          <CampoBilingue id={`${id}-f${j}-a`} etiqueta="Columna 1" valor={f.a} alCambiar={(v) => alCambiar({ ...grafico, filas: cambiar(grafico.filas, j, { ...f, a: v }) })} marcarFaltas={marcarFaltas} />
          <CampoBilingue id={`${id}-f${j}-b`} etiqueta="Columna 2" valor={f.b} alCambiar={(v) => alCambiar({ ...grafico, filas: cambiar(grafico.filas, j, { ...f, b: v }) })} marcarFaltas={marcarFaltas} />
        </div>
      ))}
      <button onClick={() => alCambiar({ ...grafico, filas: [...grafico.filas, { a: vacio(), b: vacio() }] })} className="btn-admin w-fit">
        + AGREGAR FILA
      </button>
    </div>
  );
}

/* ---------------------------------------------- lista de textos */

/**
 * Una lista de textos bilingües (opciones, pasos). Si `correcta` viene,
 * cada fila lleva un botón para marcar cuál es la respuesta correcta.
 */
function ListaTextos({
  id,
  etiqueta,
  nombre,
  items,
  minimo,
  marcarFaltas,
  alCambiar,
  correcta,
  alMarcarCorrecta,
}: {
  id: string;
  etiqueta: string;
  nombre: string;
  items: Texto[];
  minimo: number;
  marcarFaltas: boolean;
  alCambiar: (items: Texto[], correcta?: number) => void;
  correcta?: number;
  alMarcarCorrecta?: (i: number) => void;
}) {
  // Al mover o borrar, la respuesta correcta sigue a su opción.
  function moverItem(i: number, paso: -1 | 1) {
    const j = i + paso;
    if (j < 0 || j >= items.length) return;
    let c = correcta;
    if (c === i) c = j;
    else if (c === j) c = i;
    alCambiar(mover(items, i, paso), c);
  }
  function borrarItem(i: number) {
    let c = correcta;
    if (c !== undefined) c = c === i ? 0 : c > i ? c - 1 : c;
    alCambiar(quitar(items, i), c);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">{etiqueta}</p>
      {items.map((item, i) => {
        const esCorrecta = correcta === i;
        return (
          <div
            key={i}
            className="flex flex-col gap-2 border-2 p-2"
            style={{ borderColor: esCorrecta ? "var(--matrix)" : "var(--color-panel-border)", background: esCorrecta ? "rgba(0,255,65,0.06)" : "transparent" }}
          >
            <div className="flex flex-wrap items-center gap-2">
              {alMarcarCorrecta ? (
                <button
                  type="button"
                  onClick={() => alMarcarCorrecta(i)}
                  aria-pressed={esCorrecta}
                  className={`border-2 px-2 py-1 font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.08em] ${
                    esCorrecta ? "border-[var(--matrix)] bg-[var(--matrix)] text-[#05050f]" : "border-[var(--color-panel-border)] text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {esCorrecta ? "✓ Correcta" : "Marcar correcta"}
                </button>
              ) : (
                <span className="font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.1em] text-[var(--muted)]">
                  {nombre} {i + 1}
                </span>
              )}
              <span className="flex-1" />
              <BotonIcono etiqueta={`Subir ${nombre} ${i + 1}`} onClick={() => moverItem(i, -1)} disabled={i === 0}>↑</BotonIcono>
              <BotonIcono etiqueta={`Bajar ${nombre} ${i + 1}`} onClick={() => moverItem(i, 1)} disabled={i === items.length - 1}>↓</BotonIcono>
              {items.length > minimo && <BotonBorrar etiqueta={`Borrar ${nombre} ${i + 1}`} alBorrar={() => borrarItem(i)} />}
            </div>
            <CampoBilingue
              id={`${id}-${i}`}
              etiqueta={`${nombre} ${i + 1}`}
              valor={item}
              alCambiar={(v) => alCambiar(cambiar(items, i, v), correcta)}
              marcarFaltas={marcarFaltas}
            />
          </div>
        );
      })}
      <button type="button" onClick={() => alCambiar([...items, vacio()], correcta)} className="btn-admin w-fit">
        + AGREGAR {nombre.toUpperCase()}
      </button>
    </div>
  );
}

/* ------------------------------------------------------ un ejercicio */

function EditorEjercicio({
  id,
  ejercicio: e,
  marcarFaltas,
  alCambiar,
}: {
  id: string;
  ejercicio: EjercicioB;
  marcarFaltas: boolean;
  alCambiar: (e: EjercicioB) => void;
}) {
  const tipo = TIPOS.find((x) => x.id === e.tipo)!;

  function cambiarTipo(nuevo: TipoEjercicio) {
    if (nuevo === e.tipo) return;
    // Se conserva la pista; lo demás depende de cada tipo.
    alCambiar({ ...ejercicioNuevo(nuevo), pista: e.pista } as EjercicioB);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Selector id={`${id}-tipo`} etiqueta="Tipo de ejercicio" valor={e.tipo} opciones={TIPOS} alCambiar={cambiarTipo} />
        <p className="mt-1 text-[13px] text-[var(--muted)]">{tipo.ayuda} Cambiar el tipo borra lo escrito, menos la pista.</p>
      </div>

      {e.tipo === "opcion-multiple" && (
        <>
          <CampoBilingue id={`${id}-pregunta`} etiqueta="Pregunta" valor={e.pregunta} alCambiar={(v) => alCambiar({ ...e, pregunta: v })} marcarFaltas={marcarFaltas} largo />
          <ListaTextos
            id={`${id}-op`}
            etiqueta="Opciones (el estudiante las ve en este orden)"
            nombre="opción"
            items={e.opciones}
            minimo={2}
            marcarFaltas={marcarFaltas}
            correcta={e.correcta}
            alMarcarCorrecta={(c) => alCambiar({ ...e, correcta: c })}
            alCambiar={(opciones, correcta) => alCambiar({ ...e, opciones, correcta: correcta ?? e.correcta })}
          />
        </>
      )}

      {e.tipo === "verdadero-falso" && (
        <>
          <CampoBilingue id={`${id}-enunciado`} etiqueta="Afirmación" valor={e.enunciado} alCambiar={(v) => alCambiar({ ...e, enunciado: v })} marcarFaltas={marcarFaltas} largo />
          <div className="flex flex-col gap-1.5">
            <span className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">La respuesta correcta es</span>
            <div className="flex gap-2" role="group" aria-label="Respuesta correcta">
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => alCambiar({ ...e, correcta: v })}
                  aria-pressed={e.correcta === v}
                  className={`border-2 px-4 py-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.1em] ${
                    e.correcta === v ? "border-[var(--matrix)] bg-[var(--matrix)] text-[#05050f]" : "border-[var(--color-panel-border)] text-[var(--muted)]"
                  }`}
                >
                  {v ? "Verdadero" : "Falso"}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {e.tipo === "completar-frase" && (
        <>
          <p className="text-[13px] text-[var(--muted)]">
            La frase se arma así: <b className="text-white">[antes] ____ [después]</b>. Uno de los dos puede quedar vacío si el espacio va al principio o al final.
          </p>
          <CampoBilingue id={`${id}-antes`} etiqueta="Texto antes del espacio" valor={e.antes} alCambiar={(v) => alCambiar({ ...e, antes: v })} marcarFaltas={false} />
          <CampoBilingue id={`${id}-despues`} etiqueta="Texto después del espacio" valor={e.despues} alCambiar={(v) => alCambiar({ ...e, despues: v })} marcarFaltas={false} />
          <ListaTextos
            id={`${id}-op`}
            etiqueta="Opciones para llenar el espacio"
            nombre="opción"
            items={e.opciones}
            minimo={2}
            marcarFaltas={marcarFaltas}
            correcta={e.correcta}
            alMarcarCorrecta={(c) => alCambiar({ ...e, correcta: c })}
            alCambiar={(opciones, correcta) => alCambiar({ ...e, opciones, correcta: correcta ?? e.correcta })}
          />
        </>
      )}

      {e.tipo === "ordenar-pasos" && (
        <>
          <CampoBilingue id={`${id}-instr`} etiqueta="Instrucción" valor={e.instruccion} alCambiar={(v) => alCambiar({ ...e, instruccion: v })} marcarFaltas={marcarFaltas} largo />
          <ListaTextos
            id={`${id}-pasos`}
            etiqueta="Pasos EN EL ORDEN CORRECTO (al estudiante le salen mezclados)"
            nombre="paso"
            items={e.pasos}
            minimo={2}
            marcarFaltas={marcarFaltas}
            alCambiar={(pasos) => alCambiar({ ...e, pasos })}
          />
        </>
      )}

      {e.tipo === "escribir-prompt" && (
        <CampoBilingue id={`${id}-instr`} etiqueta="Instrucción" valor={e.instruccion} alCambiar={(v) => alCambiar({ ...e, instruccion: v })} marcarFaltas={marcarFaltas} largo />
      )}

      <CampoBilingue
        id={`${id}-pista`}
        etiqueta="Pista de Punti"
        valor={e.pista}
        alCambiar={(v) => alCambiar({ ...e, pista: v } as EjercicioB)}
        marcarFaltas={marcarFaltas}
        largo
        ayuda="Cuesta media gasolina verla. Que ayude sin regalar la respuesta."
      />
    </div>
  );
}
