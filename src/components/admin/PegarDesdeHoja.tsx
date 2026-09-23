"use client";

import { useMemo, useState } from "react";
import { leerHoja, type LeccionLeida, type MundoLeido } from "@/lib/importarHoja";
import { guardarBorradorLeccion } from "@/lib/contenidoAdmin";
import type { TemaC } from "@/lib/contenido";

/**
 * "Pegar desde la hoja": copias filas de la hoja Punti-Contenido (Google
 * Sheets), las pegas aquí y se convierten en borradores de lección.
 *
 * - Nada se publica: quedan como borrador para revisarlas con la vista previa.
 * - Si la lección ya existe en un mundo, se reemplaza su borrador y se
 *   actualizan su título y descripción con los de la hoja.
 * - Si no existe, se elige a qué mundo agregarla.
 */
export default function PegarDesdeHoja({
  temas,
  alImportar,
}: {
  temas: TemaC[];
  /** Devuelve el catálogo con los títulos y lecciones nuevas; el padre lo guarda. */
  alImportar: (temas: TemaC[], ids: string[]) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [leidas, setLeidas] = useState<LeccionLeida[] | null>(null);
  const [generales, setGenerales] = useState<string[]>([]);
  // Mundos que trae la hoja (filas MUNDO) y que todavía no existen.
  const [mundosNuevos, setMundosNuevos] = useState<MundoLeido[]>([]);
  const [elegidas, setElegidas] = useState<Record<string, boolean>>({});
  const [mundoDe, setMundoDe] = useState<Record<string, string>>({});
  const [trabajando, setTrabajando] = useState(false);
  const [resultado, setResultado] = useState<{ bien: number; mal: string[] } | null>(null);

  // Dónde está hoy cada lección en el catálogo (borrador).
  const ubicacion = useMemo(() => {
    const m = new Map<string, { mundo: number; numero: number }>();
    temas.forEach((t, i) => t.subtemas.forEach((s, j) => m.set(s.id, { mundo: i, numero: j + 1 })));
    return m;
  }, [temas]);

  function leer() {
    const r = leerHoja(texto);
    setLeidas(r.lecciones);
    setGenerales(r.avisosGenerales);
    setElegidas(Object.fromEntries(r.lecciones.map((l) => [l.id, true])));
    const existentes = new Set(temas.map((t) => t.id));
    const nuevos = r.mundos.filter((m) => !existentes.has(m.id));
    setMundosNuevos(nuevos);
    // Si la hoja dice a qué mundo va cada lección nueva, queda preseleccionado.
    const validos = new Set([...existentes, ...nuevos.map((m) => m.id)]);
    setMundoDe(
      Object.fromEntries(
        r.lecciones.filter((l) => !ubicacion.has(l.id) && l.mundo && validos.has(l.mundo)).map((l) => [l.id, l.mundo as string]),
      ),
    );
    setResultado(null);
  }

  const aCrear = (leidas ?? []).filter((l) => elegidas[l.id]);
  const sinMundo = aCrear.filter((l) => !ubicacion.has(l.id) && !mundoDe[l.id]);

  async function crear() {
    if (!leidas || aCrear.length === 0 || sinMundo.length) return;
    setTrabajando(true);
    const mal: string[] = [];
    const bien: string[] = [];
    for (const l of aCrear) {
      try {
        await guardarBorradorLeccion(l.leccion);
        bien.push(l.id);
      } catch {
        mal.push(l.id);
      }
    }
    // Catálogo: títulos de la hoja y lecciones nuevas en el mundo elegido.
    const siguiente = [
      ...temas.map((t) => ({ ...t, subtemas: t.subtemas.map((s) => ({ ...s })) })),
      ...mundosNuevos.map((m) => ({ ...m, subtemas: [] as TemaC["subtemas"] })),
    ];
    for (const l of aCrear.filter((x) => bien.includes(x.id))) {
      const tieneTitulos = l.titulo.es && l.titulo.en;
      const u = ubicacion.get(l.id);
      if (u) {
        const s = siguiente[u.mundo].subtemas[u.numero - 1];
        if (tieneTitulos) {
          s.titulo = l.titulo;
          if (l.descripcion.es && l.descripcion.en) s.descripcion = l.descripcion;
        }
      } else {
        const m = siguiente.find((t) => t.id === mundoDe[l.id]);
        m?.subtemas.push({ id: l.id, titulo: l.titulo, descripcion: l.descripcion, tieneLeccion: false });
      }
    }
    alImportar(siguiente, bien);
    setResultado({ bien: bien.length, mal });
    setTrabajando(false);
    if (mal.length === 0) {
      setTexto("");
      setLeidas(null);
      setMundosNuevos([]);
    }
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} className="btn-admin w-fit">
        PEGAR DESDE LA HOJA
      </button>
    );
  }

  return (
    <section className="flex flex-col gap-4 border-2 border-[var(--matrix)] bg-[rgba(13,13,34,0.9)] p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="font-[family-name:var(--font-pixel)] text-[10px] leading-[1.7] text-[var(--matrix)]">PEGAR DESDE LA HOJA</h2>
          <p className="max-w-[70ch] text-[14px] text-[var(--muted)]">
            En la hoja Punti-Contenido selecciona las filas de una o varias lecciones (con o sin el encabezado), cópialas y pégalas aquí. Se crean como <b className="text-white">borradores</b>: después las revisas con la vista previa y las publicas.
          </p>
        </div>
        <button onClick={() => setAbierto(false)} className="btn-admin">
          CERRAR
        </button>
      </div>

      <label htmlFor="pegar-hoja" className="sr-only">
        Filas copiadas de la hoja
      </label>
      <textarea
        id="pegar-hoja"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setLeidas(null);
        }}
        rows={6}
        placeholder="Pega aquí las filas copiadas de Google Sheets"
        className="campo-admin font-mono text-[12px]"
      />
      <button onClick={leer} disabled={!texto.trim()} className="btn-admin w-fit">
        LEER FILAS
      </button>

      {generales.length > 0 && (
        <ul className="list-disc pl-5 text-[13px] text-[var(--gold)]">
          {generales.slice(0, 8).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}

      {leidas && mundosNuevos.length > 0 && (
        <p className="text-[14px] text-[var(--cyan)]">
          Se van a crear {mundosNuevos.length} mundo{mundosNuevos.length === 1 ? "" : "s"} nuevo{mundosNuevos.length === 1 ? "" : "s"}:{" "}
          {mundosNuevos.map((m) => m.nombre.es).join(", ")}. Quedan al final de la lista; los puedes reordenar con las flechas.
        </p>
      )}

      {leidas && leidas.length > 0 && (
        <>
          <ol className="flex flex-col gap-2">
            {leidas.map((l) => {
              const u = ubicacion.get(l.id);
              return (
                <li key={l.id} className="flex flex-col gap-2 border-2 border-[var(--color-panel-border)] bg-black/25 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      id={`elegir-${l.id}`}
                      type="checkbox"
                      checked={!!elegidas[l.id]}
                      onChange={(e) => setElegidas((x) => ({ ...x, [l.id]: e.target.checked }))}
                      className="h-5 w-5 accent-[var(--matrix)]"
                    />
                    <label htmlFor={`elegir-${l.id}`} className="min-w-0 flex-1">
                      <span className="block font-[family-name:var(--font-ui)] text-[15px] font-bold text-white">
                        {l.titulo.es || l.id}
                      </span>
                      <span className="font-[family-name:var(--font-terminal)] text-[14px] tracking-[0.06em] text-[var(--muted)]">
                        {l.id} · {l.leccion.explicacion.length} pantallas · {l.leccion.ejercicios.length} ejercicios ·{" "}
                        {u ? `${temas[u.mundo].nombre.es}, lección ${u.numero}` : "lección nueva"}
                      </span>
                    </label>
                    <span
                      className="font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.08em]"
                      style={{ color: l.faltas.length ? "var(--gold)" : "var(--matrix)" }}
                    >
                      {l.faltas.length ? `${l.faltas.length} por completar` : "Lista para publicar"}
                    </span>
                  </div>
                  {!u && elegidas[l.id] && (
                    <label className="flex flex-wrap items-center gap-2 text-[14px] text-[var(--muted)]">
                      Agregarla al mundo:
                      <select
                        id={`mundo-${l.id}`}
                        value={mundoDe[l.id] ?? ""}
                        onChange={(e) => setMundoDe((x) => ({ ...x, [l.id]: e.target.value }))}
                        className="campo-admin w-fit"
                      >
                        <option value="">Elige un mundo…</option>
                        {temas.map((t, i) => (
                          <option key={t.id} value={t.id}>
                            {String(i + 1).padStart(2, "0")} · {t.nombre.es}
                          </option>
                        ))}
                        {mundosNuevos.map((m) => (
                          <option key={m.id} value={m.id}>
                            Nuevo · {m.nombre.es}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {(l.avisos.length > 0 || l.faltas.length > 0) && (
                    <details className="text-[13px]">
                      <summary className="cursor-pointer text-[var(--muted)]">Ver detalles</summary>
                      <ul className="mt-1 list-disc pl-5">
                        {l.avisos.map((a) => (
                          <li key={a} className="text-[var(--gold)]">{a}</li>
                        ))}
                        {l.faltas.map((a) => (
                          <li key={a} className="text-white">{a}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              );
            })}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={crear} disabled={trabajando || aCrear.length === 0 || sinMundo.length > 0} className="btn-admin btn-admin-lleno">
              {trabajando ? "GUARDANDO…" : `CREAR ${aCrear.length} BORRADOR${aCrear.length === 1 ? "" : "ES"}`}
            </button>
            {sinMundo.length > 0 && (
              <span className="text-[13px] text-[var(--gold)]">Elige el mundo de las lecciones nuevas.</span>
            )}
          </div>
        </>
      )}

      {resultado && (
        <p role="status" className="text-[14px]" style={{ color: resultado.mal.length ? "var(--pink)" : "var(--matrix)" }}>
          {resultado.bien} borrador{resultado.bien === 1 ? "" : "es"} creado{resultado.bien === 1 ? "" : "s"}.
          {resultado.mal.length > 0 && ` No se pudieron guardar: ${resultado.mal.join(", ")}.`} Revísalos con EDITAR LECCION y publícalos.
        </p>
      )}
    </section>
  );
}
