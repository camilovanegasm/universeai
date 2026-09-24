"use client";

// ADMIN → MISIONES → una misión: revisar, jugar en vista previa, corregir
// textos, publicar y volver a una versión anterior.
//
// Los cambios de texto se guardan solos en el BORRADOR (1,2 s después del
// último cambio). Los pilotos siguen viendo lo publicado hasta tocar PUBLICAR.
import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MarcoAdmin from "@/components/admin/MarcoAdmin";
import { CampoBilingue, IndicadorGuardado, ListaProblemas, useAutoguardado } from "@/components/admin/Campos";
import { useCatalogo } from "@/lib/contenido";
import { revisarPaquete } from "@/lib/misiones/revisar.mjs";
import { conTexto, textosDe } from "@/lib/misiones/textos";
import {
  firmaPaquete,
  guardarBorrador,
  infoPublicada,
  leerBorrador,
  listarVersiones,
  ocultar,
  publicar,
  restaurarVersion,
  type InfoPublicada,
  type Version,
} from "@/lib/misiones/admin";
import type { PaqueteMision } from "@/lib/misiones/tipos";

const fecha = (d: Date | null) =>
  d ? d.toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function AdminMisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const catalogo = useCatalogo();
  const [paquete, setPaquete] = useState<PaqueteMision | null | undefined>(undefined);
  const [publicada, setPublicada] = useState<InfoPublicada | null>(null);
  const [versiones, setVersiones] = useState<Version[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; error?: boolean } | null>(null);
  const [armado, setArmado] = useState<string | null>(null);
  const [filtro, setFiltro] = useState("");

  const guardar = useCallback((p: PaqueteMision) => guardarBorrador(p), []);
  const { estado, marcarGuardado } = useAutoguardado(paquete ?? null, guardar);

  const cargarTodo = useCallback(async () => {
    const [b, info] = await Promise.all([leerBorrador(id), infoPublicada(id)]);
    setPaquete(b);
    if (b) marcarGuardado(b);
    setPublicada(info);
    setVersiones(info ? await listarVersiones(id).catch(() => []) : []);
  }, [id, marcarGuardado]);

  useEffect(() => {
    // Leer el borrador al abrir es sincronizar con Firebase (un sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargarTodo().catch(() => setPaquete(null));
  }, [cargarTodo]);

  // El botón que pide confirmación se desarma solo a los 3 segundos.
  useEffect(() => {
    if (!armado) return;
    const r = setTimeout(() => setArmado(null), 3000);
    return () => clearTimeout(r);
  }, [armado]);

  const revision = useMemo(() => (paquete ? revisarPaquete(paquete) : null), [paquete]);
  const campos = useMemo(() => (paquete ? textosDe(paquete) : []), [paquete]);
  const grupos = useMemo(() => {
    const m = new Map<string, typeof campos>();
    campos
      .filter((c) => !filtro || `${c.grupo} ${c.etiqueta} ${c.valor.es} ${c.valor.en}`.toLowerCase().includes(filtro.toLowerCase()))
      .forEach((c) => m.set(c.grupo, [...(m.get(c.grupo) ?? []), c]));
    return [...m.entries()];
  }, [campos, filtro]);

  if (paquete === undefined) {
    return (
      <MarcoAdmin>
        <p className="px-6 py-10 font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">Cargando…</p>
      </MarcoAdmin>
    );
  }
  if (!paquete) {
    return (
      <MarcoAdmin>
        <div className="grid gap-3 px-6 py-10">
          <p className="text-white">No hay borrador de esta misión.</p>
          <Link href="/admin/misiones" className="btn-admin justify-self-start">← MISIONES</Link>
        </div>
      </MarcoAdmin>
    );
  }

  const tema = catalogo.temas.find((t) => t.id === paquete.mundo);
  const club = tema?.club === true;
  const hayErrores = (revision?.errores.length ?? 0) > 0;
  const sinCambios = !!publicada && firmaPaquete(paquete) === publicada.firma;
  const guardadoListo = estado === "guardado";

  async function accion(clave: string, fn: () => Promise<string>) {
    if (armado !== clave) {
      setArmado(clave);
      return;
    }
    setArmado(null);
    setOcupado(true);
    setAviso(null);
    try {
      setAviso({ texto: await fn() });
      await cargarTodo();
    } catch (e) {
      setAviso({ texto: (e as Error).message || "No se pudo. Revisa la conexión.", error: true });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <MarcoAdmin
      acciones={
        <>
          <IndicadorGuardado estado={estado} />
          <Link href={`/admin/misiones/${id}/vista`} className="btn-admin">VISTA PREVIA</Link>
          <button
            type="button"
            className="btn-admin btn-admin-lleno"
            disabled={ocupado || hayErrores || sinCambios || !guardadoListo}
            title={hayErrores ? "Corrige los errores antes de publicar" : sinCambios ? "No hay cambios desde la última publicación" : undefined}
            onClick={() => accion("publicar", async () => `Publicada la versión ${await publicar(id, club)}.`)}
          >
            {armado === "publicar" ? "¿PUBLICAR YA?" : "PUBLICAR"}
          </button>
        </>
      }
    >
      <main className="mx-auto grid w-full max-w-[1040px] gap-6 px-4 py-6 sm:px-6">
        <header className="grid gap-1">
          <Link href="/admin/misiones" className="font-[family-name:var(--font-terminal)] text-[15px] text-[var(--muted)] hover:text-white">
            ← Misiones
          </Link>
          <p className="font-[family-name:var(--font-pixel)] text-[9px] text-[var(--cyan)]">
            {(tema?.nombre ?? paquete.mundo).toUpperCase()} · CAPITULO {paquete.capitulo} · MISION {paquete.numero}
            {club ? " · CLUB" : ""}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-xl font-black text-white">{paquete.titulo.es}</h1>
          <p className="text-[14px] text-[var(--muted)]">
            {publicada
              ? `Versión ${publicada.version} publicada el ${fecha(publicada.publicadoEn)} · ${sinCambios ? "El borrador es igual a lo publicado." : "El borrador tiene cambios sin publicar."}`
              : "Todavía no está publicada: los pilotos no la ven."}
          </p>
          {aviso && (
            <p role="status" className="text-[14px]" style={{ color: aviso.error ? "var(--pink)" : "var(--matrix)" }}>
              {aviso.texto}
            </p>
          )}
        </header>

        {revision && (
          <>
            <ListaProblemas titulo={`${revision.errores.length} ERRORES: NO SE PUEDE PUBLICAR`} problemas={revision.errores} />
            {revision.avisos.length > 0 && (
              <details className="border-2 border-[var(--gold)] bg-[rgba(255,230,0,0.06)] p-4">
                <summary className="cursor-pointer font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">
                  {revision.avisos.length} AVISOS DE ESTILO
                </summary>
                <ul className="mt-2 list-disc pl-5 text-[14px] text-white">
                  {revision.avisos.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </details>
            )}
          </>
        )}

        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-pixel)] text-[10px] text-[var(--matrix)]">TEXTOS · {campos.length}</h2>
              <p className="text-[13px] text-[var(--muted)]">Corrige aquí sin tocar el archivo. Se guarda solo en el borrador.</p>
            </div>
            <input
              type="search"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar un texto…"
              aria-label="Buscar un texto"
              className="campo-admin max-w-xs"
            />
          </div>
          {grupos.map(([grupo, lista]) => (
            <details key={grupo} open={!!filtro} className="border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.7)]">
              <summary className="cursor-pointer px-4 py-3 font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">
                {grupo === "mision" ? "La misión" : grupo === "ficha" ? "Ficha de misión" : `${grupo} · ${paquete.bloques.find((b) => b.id === grupo)?.tipo ?? ""}`}
                <span className="ml-2 font-[family-name:var(--font-terminal)] text-[14px] font-normal text-[var(--muted)]">{lista.length} textos</span>
              </summary>
              <div className="grid gap-4 border-t-2 border-[var(--color-panel-border)] p-4">
                {lista.map((c) => (
                  <CampoBilingue
                    key={c.ruta.join(".")}
                    id={c.ruta.join("-")}
                    etiqueta={c.etiqueta}
                    valor={c.valor}
                    largo={c.largo}
                    marcarFaltas
                    alCambiar={(v) => setPaquete((p) => (p ? conTexto(p, c.ruta, v) : p))}
                  />
                ))}
              </div>
            </details>
          ))}
        </section>

        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-[10px] text-[var(--matrix)]">VERSIONES PUBLICADAS</h2>
          {versiones.length === 0 ? (
            <p className="text-[14px] text-[var(--muted)]">Todavía no hay versiones. Cada vez que publiques se guarda una.</p>
          ) : (
            <ul className="grid gap-2">
              {versiones.map((v) => (
                <li key={v.numero} className="flex flex-wrap items-center gap-3 border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.7)] px-4 py-2.5">
                  <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[var(--cyan)]">V{v.numero}</span>
                  <span className="min-w-0 flex-1 text-[14px] text-white">
                    {fecha(v.publicadoEn)}
                    {v.numero === publicada?.version && <span className="ml-2 text-[var(--matrix)]">· la que ven los pilotos</span>}
                  </span>
                  <button
                    type="button"
                    className="btn-admin"
                    disabled={ocupado}
                    onClick={() =>
                      accion(`v${v.numero}`, async () => {
                        await restaurarVersion(v);
                        return `La versión ${v.numero} quedó en el borrador. Revísala y publícala si es la que quieres.`;
                      })
                    }
                  >
                    {armado === `v${v.numero}` ? "¿TRAER AL BORRADOR?" : "RESTAURAR"}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {publicada && (
            <button
              type="button"
              className="btn-admin justify-self-start border-[var(--pink)] text-[var(--pink)]"
              disabled={ocupado}
              onClick={() =>
                accion("ocultar", async () => {
                  await ocultar(id);
                  return "La misión ya no aparece en su mundo. Para mostrarla otra vez, publícala.";
                })
              }
            >
              {armado === "ocultar" ? "¿OCULTAR DEL MUNDO?" : "OCULTAR DEL MUNDO"}
            </button>
          )}
        </section>
      </main>
    </MarcoAdmin>
  );
}
