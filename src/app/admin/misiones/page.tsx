"use client";

// ADMIN → MISIONES: importar paquetes y ver el estado de cada misión.
//
// Importar solo guarda un BORRADOR: nada llega a los pilotos hasta que se
// abre la misión y se toca PUBLICAR. El revisor es el mismo de
// `npm run validar:misiones`: un paquete con errores no se puede importar.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import MarcoAdmin from "@/components/admin/MarcoAdmin";
import { ListaProblemas } from "@/components/admin/Campos";
import { paquetesSemilla } from "@/lib/misiones/cargar";
import {
  firmaPaquete,
  guardarBorrador,
  infoPublicada,
  leerBorrador,
  listarBorradores,
  revisarTexto,
  type EntradaBorrador,
  type InfoPublicada,
} from "@/lib/misiones/admin";
import type { PaqueteMision } from "@/lib/misiones/tipos";

type Fila = EntradaBorrador & { publicada: InfoPublicada | null; cambios: boolean };

export default function AdminMisionesPage() {
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const [texto, setTexto] = useState("");
  const [revision, setRevision] = useState<ReturnType<typeof revisarTexto> | null>(null);
  const [existe, setExiste] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const lista = await listarBorradores();
      const conEstado = await Promise.all(
        lista.map(async (b) => {
          const [publicada, borrador] = await Promise.all([infoPublicada(b.id), leerBorrador(b.id)]);
          return { ...b, publicada, cambios: !!publicada && !!borrador && firmaPaquete(borrador) !== publicada.firma };
        }),
      );
      setFilas(conEstado);
    } catch {
      setErrorCarga(true);
    }
  }, []);

  useEffect(() => {
    // Leer la lista al abrir es sincronizar con Firebase (un sistema externo).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void cargar();
  }, [cargar]);

  function revisar(contenido: string) {
    setAviso(null);
    const r = revisarTexto(contenido);
    setRevision(r);
    setExiste(!!r.paquete && !!filas?.some((f) => f.id === r.paquete!.id));
  }

  async function importar(p: PaqueteMision) {
    setGuardando(true);
    try {
      await guardarBorrador(p);
      setAviso(`Borrador de "${p.titulo.es}" guardado. Ábrelo para revisarlo, jugarlo y publicarlo.`);
      setTexto("");
      setRevision(null);
      await cargar();
    } catch {
      setAviso("No se pudo guardar. Revisa la conexión y que las reglas de Firestore estén publicadas.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <MarcoAdmin>
      <main className="mx-auto grid w-full max-w-[1040px] gap-8 px-4 py-6 sm:px-6">
        <section className="grid gap-3">
          <h1 className="font-[family-name:var(--font-display)] text-xl font-black text-white">Misiones</h1>
          <p className="max-w-[70ch] text-[14px] text-[var(--muted)]">
            Cada misión llega como un paquete (un archivo .json con los dos idiomas). Importarla la deja como borrador. Ábrela para
            jugarla en vista previa, corregir textos y publicarla.
          </p>

          {errorCarga && <p className="text-[14px] text-[var(--pink)]">No se pudo leer la lista. Revisa la conexión.</p>}
          {!filas && !errorCarga && <p className="font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">Cargando…</p>}
          {filas && filas.length === 0 && <p className="text-[14px] text-[var(--muted)]">Todavía no hay misiones importadas.</p>}
          {filas && filas.length > 0 && (
            <ul className="grid gap-2">
              {filas.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/admin/misiones/${f.id}`}
                    className="flex flex-wrap items-center gap-3 border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] px-4 py-3 transition-colors hover:border-[var(--matrix)]"
                  >
                    <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[var(--cyan)]">
                      {f.mundo.toUpperCase()} {f.capitulo}.{String(f.numero).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 font-[family-name:var(--font-ui)] text-[17px] font-bold text-white">{f.titulo.es}</span>
                    <Estado fila={f} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-3 border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.7)] p-4">
          <h2 className="font-[family-name:var(--font-pixel)] text-[10px] text-[var(--matrix)]">IMPORTAR UN PAQUETE</h2>
          <p className="text-[14px] text-[var(--muted)]">Pega el contenido del archivo .json o elígelo desde tu computador.</p>
          <input
            type="file"
            accept="application/json,.json"
            aria-label="Elegir archivo de misión"
            className="text-[14px] text-[var(--muted)] file:mr-3 file:border-2 file:border-[var(--color-panel-border)] file:bg-transparent file:px-3 file:py-1.5 file:font-[family-name:var(--font-terminal)] file:text-[15px] file:text-white"
            onChange={async (e) => {
              const archivo = e.target.files?.[0];
              if (!archivo) return;
              const contenido = await archivo.text();
              setTexto(contenido);
              revisar(contenido);
            }}
          />
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={6}
            spellCheck={false}
            placeholder='{ "formato": "punti-mision@1", … }'
            aria-label="Contenido del paquete"
            className="campo-admin font-mono text-[13px]"
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-admin" disabled={!texto.trim()} onClick={() => revisar(texto)}>
              REVISAR
            </button>
            {paquetesSemilla().map((p) => (
              <button key={p.id} type="button" className="btn-admin" onClick={() => { const c = JSON.stringify(p, null, 2); setTexto(c); revisar(c); }}>
                USAR SEMILLA: {p.titulo.es}
              </button>
            ))}
          </div>

          {revision && (
            <div className="grid gap-3">
              <ListaProblemas titulo={`${revision.errores.length} ERRORES: NO SE PUEDE IMPORTAR`} problemas={revision.errores} />
              {revision.avisos.length > 0 && (
                <div className="border-2 border-[var(--gold)] bg-[rgba(255,230,0,0.06)] p-4">
                  <p className="font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">{revision.avisos.length} AVISOS (SE PUEDE IMPORTAR)</p>
                  <ul className="mt-2 list-disc pl-5 text-[14px] text-white">
                    {revision.avisos.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </div>
              )}
              {revision.paquete && (
                <div className="flex flex-wrap items-center gap-3 border-2 border-[var(--matrix)] bg-[rgba(0,255,65,0.06)] p-4">
                  <p className="min-w-0 flex-1 text-[14px] text-white">
                    ✓ “{revision.paquete.titulo.es}” pasó el revisor: {revision.resumen?.bloques} bloques, {revision.resumen?.labs} laboratorios.
                    {existe && <span className="block text-[var(--gold)]">Ya hay un borrador con este id: se va a reemplazar (lo publicado no cambia).</span>}
                  </p>
                  <button type="button" className="btn-admin btn-admin-lleno" disabled={guardando} onClick={() => importar(revision.paquete!)}>
                    {guardando ? "GUARDANDO…" : existe ? "REEMPLAZAR BORRADOR" : "GUARDAR COMO BORRADOR"}
                  </button>
                </div>
              )}
            </div>
          )}
          {aviso && <p role="status" className="text-[14px] text-[var(--gold)]">{aviso}</p>}
        </section>
      </main>
    </MarcoAdmin>
  );
}

function Estado({ fila }: { fila: Fila }) {
  const [texto, color] = !fila.publicada
    ? ["SIN PUBLICAR", "var(--muted)"]
    : fila.cambios
      ? [`V${fila.publicada.version} · CAMBIOS SIN PUBLICAR`, "var(--gold)"]
      : [`PUBLICADA · V${fila.publicada.version}`, "var(--matrix)"];
  return (
    <span className="border px-2 py-0.5 font-[family-name:var(--font-terminal)] text-[14px] tracking-[0.08em]" style={{ borderColor: color, color }}>
      {texto}
    </span>
  );
}
