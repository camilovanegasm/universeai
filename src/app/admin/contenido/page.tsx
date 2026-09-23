"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MarcoAdmin from "@/components/admin/MarcoAdmin";
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
import PlanetaPixel from "@/components/PlanetaPixel";
import PegarDesdeHoja from "@/components/admin/PegarDesdeHoja";
import {
  firma,
  guardarBorradorCatalogo,
  idLibre,
  importarDesdeCodigo,
  leerPanorama,
  publicarCatalogo,
  publicarTodo,
  vacio,
  validarCatalogo,
  type PanoramaContenido,
} from "@/lib/contenidoAdmin";
import type { TemaC } from "@/lib/contenido";
import { RANGOS, type Rango } from "@/lib/rangos";

/**
 * Contenido: los mundos, su orden, sus textos y las lecciones de cada uno.
 * Desde aquí se entra al editor de cada lección.
 *
 * Todo lo que se cambia aquí se guarda solo como borrador. Los estudiantes
 * no ven nada hasta que se toca "PUBLICAR MUNDOS".
 */

const COLORES = ["#00ff41", "#00f5ff", "#b400ff", "#ff006e", "#ffe600"];

const ESTADO_LECCION = {
  "sin-leccion": { texto: "Sin lección", color: "#6d7b92" },
  borrador: { texto: "Borrador", color: "var(--gold)" },
  cambios: { texto: "Cambios sin publicar", color: "var(--gold)" },
  publicada: { texto: "Publicada", color: "var(--matrix)" },
} as const;

export default function ContenidoAdmin() {
  const [panorama, setPanorama] = useState<PanoramaContenido | null>(null);
  const [temas, setTemas] = useState<TemaC[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState<"importar" | "publicar" | "todo" | null>(null);
  const [confirmarTodo, setConfirmarTodo] = useState(false);
  const [problemas, setProblemas] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [nuevoMundo, setNuevoMundo] = useState("");

  const { estado, marcarGuardado } = useAutoguardado(temas, guardarBorradorCatalogo);

  const cargar = useCallback(async () => {
    try {
      const p = await leerPanorama();
      setPanorama(p);
      setTemas(p.borrador);
      marcarGuardado(p.borrador);
      setError(null);
    } catch (e) {
      setError(
        (e as { code?: string }).code === "permission-denied"
          ? "Firebase no dejó leer el contenido. Publica las reglas nuevas (firestore.rules) en la consola de Firebase."
          : "No se pudo cargar el contenido. Revisa la conexión.",
      );
    }
  }, [marcarGuardado]);

  useEffect(() => {
    let vigente = true;
    leerPanorama()
      .then((p) => {
        if (!vigente) return;
        setPanorama(p);
        setTemas(p.borrador);
        marcarGuardado(p.borrador);
      })
      .catch(() => {
        if (vigente) void cargar();
      });
    return () => {
      vigente = false;
    };
  }, [cargar, marcarGuardado]);

  useEffect(() => {
    if (!aviso) return;
    const reloj = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(reloj);
  }, [aviso]);

  const hayCambios = useMemo(() => {
    if (!temas || !panorama) return false;
    // tieneLeccion no cuenta como cambio: lo maneja "publicar lección".
    const sinMarca = (x: TemaC[]) =>
      x.map((m) => ({ ...m, subtemas: m.subtemas.map((s) => ({ ...s, tieneLeccion: false })) }));
    return firma(sinMarca(temas)) !== firma(sinMarca(panorama.publicado));
  }, [temas, panorama]);

  const idsUsados = useMemo(
    () => new Set((temas ?? []).flatMap((m) => [m.id, ...m.subtemas.map((s) => s.id)])),
    [temas],
  );

  async function importar() {
    setTrabajando("importar");
    try {
      await importarDesdeCodigo();
      await cargar();
      setAviso("Contenido importado. Desde ahora se edita aquí.");
    } catch {
      setAviso("No se pudo importar. ¿Publicaste las reglas nuevas?");
    } finally {
      setTrabajando(null);
    }
  }

  async function publicar() {
    if (!temas) return;
    const p = validarCatalogo(temas);
    setProblemas(p);
    if (p.length) return;
    setTrabajando("publicar");
    try {
      const final = await publicarCatalogo(temas);
      setTemas(final);
      marcarGuardado(final);
      setPanorama((x) => (x ? { ...x, publicado: final, borrador: final } : x));
      setAviso("Mundos publicados. Ya los ve todo el mundo.");
    } catch {
      setAviso("No se pudo publicar. Intenta de nuevo.");
    } finally {
      setTrabajando(null);
    }
  }

  async function publicarTodoAhora() {
    if (!temas) return;
    setConfirmarTodo(false);
    const p = validarCatalogo(temas);
    setProblemas(p);
    if (p.length) return;
    setTrabajando("todo");
    try {
      const r = await publicarTodo(temas);
      setTemas(r.temas);
      marcarGuardado(r.temas);
      await cargar();
      setProblemas(r.incompletas.map((x) => `${x.id}: ${x.problemas[0]}`));
      setAviso(
        r.incompletas.length
          ? `${r.publicadas.length} lecciones publicadas. ${r.incompletas.length} quedaron sin publicar porque les falta algo (mira la lista).`
          : `Listo: ${r.publicadas.length} lecciones y los mundos publicados.`,
      );
    } catch {
      setAviso("No se pudo publicar todo. Intenta de nuevo.");
    } finally {
      setTrabajando(null);
    }
  }

  function cambiarMundo(i: number, m: TemaC) {
    setTemas((x) => (x ? cambiar(x, i, m) : x));
  }

  function agregarMundo() {
    const nombre = nuevoMundo.trim();
    if (!nombre || !temas) return;
    const id = idLibre(nombre, idsUsados);
    setTemas([
      ...temas,
      { id, nombre: { es: nombre, en: "" }, titulo: vacio(), descripcion: vacio(), rango: "explorador", subtemas: [] },
    ]);
    setNuevoMundo("");
    setAbierto(id);
  }

  const acciones = panorama?.importado ? (
    <>
      <IndicadorGuardado estado={estado} />
      <button
        onClick={publicar}
        disabled={!hayCambios || trabajando !== null || estado !== "guardado"}
        className="btn-admin btn-admin-lleno"
      >
        {trabajando === "publicar" ? "PUBLICANDO…" : "PUBLICAR MUNDOS"}
      </button>
      {confirmarTodo ? (
        <>
          <button onClick={publicarTodoAhora} className="btn-admin btn-admin-lleno">
            SÍ, PUBLICAR TODO
          </button>
          <button onClick={() => setConfirmarTodo(false)} className="btn-admin">
            CANCELAR
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirmarTodo(true)}
          disabled={trabajando !== null || estado !== "guardado"}
          className="btn-admin"
          title="Publica todas las lecciones en borrador que estén completas y los mundos"
        >
          {trabajando === "todo" ? "PUBLICANDO TODO…" : "PUBLICAR TODO"}
        </button>
      )}
    </>
  ) : null;

  return (
    <MarcoAdmin acciones={acciones}>
      <main className="mx-auto flex w-full max-w-[1040px] flex-col gap-5 px-4 pb-24 pt-6 sm:px-6">
        {error ? (
          <Aviso estado="error" texto={error}>
            <button onClick={cargar} className="btn-admin">
              REINTENTAR
            </button>
          </Aviso>
        ) : !panorama || !temas ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="esqueleto h-[76px]" />
            ))}
          </div>
        ) : !panorama.importado ? (
          <Aviso
            estado="info"
            texto="El contenido todavía vive en el código. Impórtalo a Firebase una sola vez y desde ahí se edita aquí, sin tocar código. Se copian los 7 mundos, sus lecciones y la lección que ya está escrita, tal como están hoy."
          >
            <button onClick={importar} disabled={trabajando !== null} className="btn-admin btn-admin-lleno">
              {trabajando === "importar" ? "IMPORTANDO…" : "IMPORTAR A FIREBASE"}
            </button>
          </Aviso>
        ) : (
          <>
            <p className="max-w-[70ch] text-[14px] text-[var(--muted)]">
              Todo se guarda solo como borrador. Los estudiantes no ven los cambios de mundos hasta que tocas{" "}
              <b className="text-white">PUBLICAR MUNDOS</b>. Cada lección se publica desde su propio editor, o todas juntas con <b className="text-white">PUBLICAR TODO</b> (solo las que estén completas).
            </p>
            {hayCambios && (
              <p className="font-[family-name:var(--font-terminal)] text-[15px] tracking-[0.06em] text-[var(--gold)]">
                Hay cambios en los mundos que todavía no se publican.
              </p>
            )}
            <ListaProblemas problemas={problemas} titulo="FALTA ESTO PARA PUBLICAR" />

            <PegarDesdeHoja
              temas={temas}
              alImportar={(nuevos, ids) => {
                // El catálogo se guarda solo (autoguardado) como borrador.
                setTemas(nuevos);
                setPanorama((x) =>
                  x
                    ? {
                        ...x,
                        lecciones: {
                          ...x.lecciones,
                          ...Object.fromEntries(
                            ids.map((id) => [id, x.lecciones[id] === "publicada" || x.lecciones[id] === "cambios" ? "cambios" : "borrador"]),
                          ),
                        },
                      }
                    : x,
                );
              }}
            />

            <ol className="flex flex-col gap-3">
              {temas.map((m, i) => {
                const color = COLORES[i % COLORES.length];
                const estaAbierto = abierto === m.id;
                const publicadas = m.subtemas.filter((s) => panorama.lecciones[s.id] === "publicada" || panorama.lecciones[s.id] === "cambios").length;
                return (
                  <li key={m.id} className="border-2 bg-[rgba(13,13,34,0.8)]" style={{ borderColor: estaAbierto ? color : "var(--color-panel-border)" }}>
                    {/* cabecera del mundo */}
                    <div className="flex flex-wrap items-center gap-3 p-3">
                      <button
                        onClick={() => setAbierto(estaAbierto ? null : m.id)}
                        aria-expanded={estaAbierto}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <PlanetaPixel id={m.id} color={color} ancho={44} flotando={false} className="shrink-0" />
                        <span className="min-w-0">
                          <span className="block font-[family-name:var(--font-pixel)] text-[9px] leading-[1.7]" style={{ color }}>
                            {String(i + 1).padStart(2, "0")} · {(m.nombre.es || "SIN NOMBRE").toUpperCase()}
                          </span>
                          <span className="block truncate font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">
                            {m.titulo.es || "Sin título"}
                          </span>
                          <span className="block font-[family-name:var(--font-terminal)] text-[14px] tracking-[0.08em] text-[var(--muted)]">
                            {m.subtemas.length} LECCIONES · {publicadas} PUBLICADAS · {RANGOS[m.rango].etiqueta.toUpperCase()}
                          </span>
                        </span>
                        <span className="ml-auto font-[family-name:var(--font-terminal)] text-[18px] text-[var(--muted)]" aria-hidden="true">
                          {estaAbierto ? "▴" : "▾"}
                        </span>
                      </button>
                      <div className="flex gap-1.5">
                        <BotonIcono etiqueta="Subir mundo" onClick={() => setTemas(mover(temas, i, -1))} disabled={i === 0}>
                          ↑
                        </BotonIcono>
                        <BotonIcono etiqueta="Bajar mundo" onClick={() => setTemas(mover(temas, i, 1))} disabled={i === temas.length - 1}>
                          ↓
                        </BotonIcono>
                        <BotonBorrar etiqueta={`Borrar el mundo ${m.nombre.es}`} alBorrar={() => setTemas(quitar(temas, i))} />
                      </div>
                    </div>

                    {estaAbierto && (
                      <div className="flex flex-col gap-5 border-t-2 border-[var(--color-panel-border)] p-4">
                        <CampoBilingue id={`${m.id}-nombre`} etiqueta="Nombre del mundo" valor={m.nombre} alCambiar={(v) => cambiarMundo(i, { ...m, nombre: v })} marcarFaltas={problemas.length > 0} ayuda="El nombre propio: Origen, Lexia…" />
                        <CampoBilingue id={`${m.id}-titulo`} etiqueta="Qué enseña (título)" valor={m.titulo} alCambiar={(v) => cambiarMundo(i, { ...m, titulo: v })} marcarFaltas={problemas.length > 0} />
                        <CampoBilingue id={`${m.id}-desc`} etiqueta="Descripción" valor={m.descripcion} alCambiar={(v) => cambiarMundo(i, { ...m, descripcion: v })} marcarFaltas={problemas.length > 0} largo />
                        <label className="flex flex-col gap-1.5">
                          <span className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">Rango (dificultad)</span>
                          <select
                            id={`${m.id}-rango`}
                            value={m.rango}
                            onChange={(e) => cambiarMundo(i, { ...m, rango: e.target.value as Rango })}
                            className="campo-admin w-fit"
                          >
                            {(Object.keys(RANGOS) as Rango[]).map((r) => (
                              <option key={r} value={r}>
                                {RANGOS[r].titulo}
                              </option>
                            ))}
                          </select>
                        </label>

                        <Lecciones
                          mundo={m}
                          estados={panorama.lecciones}
                          idsUsados={idsUsados}
                          marcarFaltas={problemas.length > 0}
                          guardado={estado === "guardado"}
                          alCambiar={(subtemas) => cambiarMundo(i, { ...m, subtemas })}
                        />
                        <p className="text-[13px] text-[var(--muted)]">
                          id permanente del mundo: <code className="text-white">{m.id}</code>
                        </p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                agregarMundo();
              }}
              className="flex flex-wrap items-center gap-2 border-2 border-dashed border-[var(--color-panel-border)] p-3"
            >
              <label htmlFor="nuevo-mundo" className="sr-only">
                Nombre del mundo nuevo
              </label>
              <input
                id="nuevo-mundo"
                value={nuevoMundo}
                onChange={(e) => setNuevoMundo(e.target.value)}
                placeholder="Nombre del mundo nuevo (en español)"
                className="campo-admin min-w-0 flex-1 basis-[220px]"
              />
              <button type="submit" disabled={!nuevoMundo.trim()} className="btn-admin">
                + AGREGAR MUNDO
              </button>
            </form>
          </>
        )}
      </main>

      {aviso && (
        <p role="status" className="cargando-entra fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-30 mx-auto w-fit max-w-[calc(100%-32px)] border-2 border-[var(--matrix)] bg-[#05050f] px-4 py-3 font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.06em] text-[var(--matrix)]">
          {aviso}
        </p>
      )}
    </MarcoAdmin>
  );
}

/** Las lecciones de un mundo: orden, títulos y acceso al editor. */
function Lecciones({
  mundo,
  estados,
  idsUsados,
  marcarFaltas,
  guardado,
  alCambiar,
}: {
  mundo: TemaC;
  /** El editor de la lección lee el borrador guardado: se entra cuando ya se guardó. */
  guardado: boolean;
  estados: PanoramaContenido["lecciones"];
  idsUsados: Set<string>;
  marcarFaltas: boolean;
  alCambiar: (s: TemaC["subtemas"]) => void;
}) {
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const lista = mundo.subtemas;

  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-[family-name:var(--font-pixel)] text-[9px] text-white">LECCIONES</h3>
      <ol className="flex flex-col gap-2">
        {lista.map((s, j) => {
          const est = ESTADO_LECCION[estados[s.id] ?? "sin-leccion"];
          const abierta = editando === s.id;
          return (
            <li key={s.id} className="border-2 border-[var(--color-panel-border)] bg-black/25">
              <div className="flex flex-wrap items-center gap-2 p-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-[var(--color-panel-border)] font-[family-name:var(--font-pixel)] text-[10px] text-white">
                  {j + 1}
                </span>
                <button onClick={() => setEditando(abierta ? null : s.id)} aria-expanded={abierta} className="min-w-0 flex-1 basis-[160px] text-left">
                  <span className="block truncate font-[family-name:var(--font-ui)] text-[15px] font-bold text-white">
                    {s.titulo.es || "Sin título"}
                  </span>
                  <span className="font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.08em]" style={{ color: est.color }}>
                    {est.texto}
                  </span>
                  <span className="ml-2 font-[family-name:var(--font-terminal)] text-[14px] text-[var(--muted)]">
                    {abierta ? "▴ títulos" : "▾ títulos"}
                  </span>
                </button>
                <div className="flex flex-wrap items-center gap-1.5">
                  {guardado ? (
                    <Link href={`/admin/contenido/${s.id}`} transitionTypes={["adelante"]} className="btn-admin">
                      {estados[s.id] === "sin-leccion" || !estados[s.id] ? "ESCRIBIR LECCION" : "EDITAR LECCION"}
                    </Link>
                  ) : (
                    <span className="btn-admin opacity-40">GUARDANDO…</span>
                  )}
                  <BotonIcono etiqueta="Subir lección" onClick={() => alCambiar(mover(lista, j, -1))} disabled={j === 0}>
                    ↑
                  </BotonIcono>
                  <BotonIcono etiqueta="Bajar lección" onClick={() => alCambiar(mover(lista, j, 1))} disabled={j === lista.length - 1}>
                    ↓
                  </BotonIcono>
                  <BotonBorrar etiqueta={`Quitar la lección ${s.titulo.es}`} alBorrar={() => alCambiar(quitar(lista, j))} />
                </div>
              </div>
              {abierta && (
                <div className="flex flex-col gap-4 border-t-2 border-[var(--color-panel-border)] p-3">
                  <CampoBilingue id={`${s.id}-titulo`} etiqueta="Título de la lección" valor={s.titulo} alCambiar={(v) => alCambiar(cambiar(lista, j, { ...s, titulo: v }))} marcarFaltas={marcarFaltas} />
                  <CampoBilingue id={`${s.id}-desc`} etiqueta="Descripción corta" valor={s.descripcion} alCambiar={(v) => alCambiar(cambiar(lista, j, { ...s, descripcion: v }))} marcarFaltas={marcarFaltas} />
                  <p className="text-[13px] text-[var(--muted)]">
                    id permanente: <code className="text-white">{s.id}</code> — el progreso de los estudiantes se guarda con este id, por eso no cambia aunque cambie el título.
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const titulo = nueva.trim();
          if (!titulo) return;
          const id = idLibre(titulo, idsUsados);
          alCambiar([...lista, { id, titulo: { es: titulo, en: "" }, descripcion: vacio(), tieneLeccion: false }]);
          setNueva("");
          setEditando(id);
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <label htmlFor={`nueva-${mundo.id}`} className="sr-only">
          Título de la lección nueva
        </label>
        <input
          id={`nueva-${mundo.id}`}
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Título de la lección nueva (en español)"
          className="campo-admin min-w-0 flex-1 basis-[220px]"
        />
        <button type="submit" disabled={!nueva.trim()} className="btn-admin">
          + AGREGAR LECCION
        </button>
      </form>
    </section>
  );
}

function Aviso({ estado, texto, children }: { estado: "info" | "error"; texto: string; children?: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center gap-4 border-2 px-6 py-10 text-center"
      style={{ borderColor: estado === "error" ? "var(--pink)" : "var(--color-panel-border)" }}
    >
      <PuntiPixel estado={estado} ancho={96} />
      <p className="max-w-[56ch] text-[15px] text-[var(--muted)]">{texto}</p>
      {children}
    </div>
  );
}
