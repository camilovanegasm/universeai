"use client";

// La Bitácora de [nombre del piloto] (fase C2): el cuaderno de cada piloto.
//
// Cuatro secciones:
//  - Conceptos: lo que escribió con sus palabras en cada misión (y la
//    definición de Punti al lado, para comparar).
//  - Mis prompts: sus prompts del Laboratorio, con las piezas que tenían y un
//    botón para copiarlos y usarlos en su IA de verdad.
//  - Mis notas: notas libres (crear, editar, borrar; máximo 200).
//  - Fichas: las Fichas de misión, con acceso para volver a jugarlas.
//
// Los datos vienen de src/lib/bitacora.ts. Todo se muestra como texto. Borrar
// pide un segundo toque (no hay confirm() del navegador).
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { obtenerPerfil } from "@/lib/userProfile";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import {
  borrarEntrada,
  guardarNota,
  LARGO,
  leerBitacora,
  MAX_NOTAS,
  siguienteNota,
  type Entrada,
  type EntradaConcepto,
  type EntradaFicha,
  type EntradaNota,
  type EntradaPrompt,
} from "@/lib/bitacora";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import TextoTecleado from "@/components/TextoTecleado";

type Seccion = "conceptos" | "prompts" | "notas" | "fichas";

const T: Record<Idioma, Record<string, string>> = {
  es: {
    bitacora: "Bitácora de",
    volver: "Mundos",
    conceptos: "Conceptos",
    prompts: "Mis prompts",
    notas: "Mis notas",
    fichas: "Fichas",
    punti: "Punti",
    tu: "Tú",
    copiar: "Copiar",
    copiado: "¡Copiado!",
    borrar: "Borrar",
    seguro: "¿Borrar? Toca otra vez",
    editar: "Editar",
    guardar: "Guardar nota",
    cancelar: "Cancelar",
    nuevaNota: "Nueva nota",
    placeholderNota: "Escribe lo que quieras recordar: una idea, un prompt que te funcionó, una duda…",
    tope: "Llegaste a 200 notas. Borra alguna para escribir otra.",
    paso: "Pasó",
    sinTerminar: "Sin pasar",
    piezas: "Piezas",
    jugarOtraVez: "Jugar otra vez",
    xp: "XP",
    combustible: "Combustible",
    transmisiones: "Transmisiones",
    errorCargar: "No pude abrir tu Bitácora. Revisa tu conexión e intenta de nuevo.",
    errorGuardar: "No se pudo guardar. Revisa tu conexión.",
    reintentar: "Reintentar",
    vacioConceptos: "Aquí van los conceptos que expliques con tus palabras en cada misión.",
    vacioPrompts: "Aquí quedan los prompts que transmitas en el Laboratorio, listos para copiar.",
    vacioNotas: "Tus notas libres. Escribe la primera arriba.",
    vacioFichas: "Cada misión que completes deja aquí su ficha.",
    saludoVacio: "Tu bitácora está en blanco, piloto. Cada misión que completes la va llenando.",
    saludo: "Todo lo que aprendiste y escribiste, en un solo lugar. Vuelve cuando quieras.",
  },
  en: {
    bitacora: "Logbook of",
    volver: "Worlds",
    conceptos: "Concepts",
    prompts: "My prompts",
    notas: "My notes",
    fichas: "Cards",
    punti: "Punti",
    tu: "You",
    copiar: "Copy",
    copiado: "Copied!",
    borrar: "Delete",
    seguro: "Delete? Tap again",
    editar: "Edit",
    guardar: "Save note",
    cancelar: "Cancel",
    nuevaNota: "New note",
    placeholderNota: "Write what you want to remember: an idea, a prompt that worked, a question…",
    tope: "You reached 200 notes. Delete one to write another.",
    paso: "Passed",
    sinTerminar: "Not passed",
    piezas: "Pieces",
    jugarOtraVez: "Play again",
    xp: "XP",
    combustible: "Fuel",
    transmisiones: "Transmissions",
    errorCargar: "I couldn't open your Logbook. Check your connection and try again.",
    errorGuardar: "It couldn't be saved. Check your connection.",
    reintentar: "Try again",
    vacioConceptos: "The concepts you explain in your own words in each mission go here.",
    vacioPrompts: "The prompts you transmit in the Lab stay here, ready to copy.",
    vacioNotas: "Your free notes. Write the first one above.",
    vacioFichas: "Every mission you complete leaves its card here.",
    saludoVacio: "Your logbook is blank, pilot. Every mission you complete fills it up.",
    saludo: "Everything you learned and wrote, in one place. Come back anytime.",
  },
};

const COLOR: Record<Seccion, string> = {
  conceptos: "var(--gold)",
  prompts: "var(--cyan)",
  notas: "var(--matrix)",
  fichas: "var(--pink)",
};

function fecha(e: Entrada, idioma: Idioma) {
  const d = e.fecha?.toDate?.();
  return d ? d.toLocaleDateString(idioma === "en" ? "en-US" : "es-CO", { day: "numeric", month: "short", year: "numeric" }) : "";
}

export default function BitacoraPage() {
  const router = useRouter();
  const idioma = useIdioma();
  const t = T[idioma];
  const { usuario, cargando } = useAuth();
  const [entradas, setEntradas] = useState<Entrada[] | null>(null);
  const [fallo, setFallo] = useState(false);
  const [piloto, setPiloto] = useState("");
  const [seccion, setSeccion] = useState<Seccion>("conceptos");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/login");
  }, [cargando, usuario, router]);

  const uid = usuario?.uid;
  useEffect(() => {
    if (!uid) return;
    let vigente = true;
    Promise.all([leerBitacora(uid), obtenerPerfil(uid).catch(() => null)])
      .then(([lista, perfil]) => {
        if (!vigente) return;
        setEntradas(lista);
        setFallo(false);
        setPiloto((perfil?.nombre || "").split(" ")[0] || (idioma === "en" ? "Pilot" : "Piloto"));
      })
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
    };
    // El idioma solo decide el nombre de respaldo: no hace falta volver a leer al cambiarlo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, intento]);

  const grupos = useMemo(() => {
    const l = entradas ?? [];
    return {
      conceptos: l.filter((e): e is EntradaConcepto & { id: string } => e.tipo === "concepto"),
      prompts: l.filter((e): e is EntradaPrompt & { id: string } => e.tipo === "prompt"),
      notas: l.filter((e): e is EntradaNota & { id: string } => e.tipo === "nota"),
      fichas: l.filter((e): e is EntradaFicha & { id: string } => e.tipo === "ficha"),
    };
  }, [entradas]);

  const quitar = useCallback((id: string) => setEntradas((l) => (l ? l.filter((e) => e.id !== id) : l)), []);
  const poner = useCallback((e: Entrada) => setEntradas((l) => [e, ...(l ?? []).filter((x) => x.id !== e.id)]), []);

  if (fallo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <PuntiPixel estado="error" ancho={112} />
        <p className="max-w-[40ch] text-[15px] text-[var(--muted)]">{t.errorCargar}</p>
        <button type="button" onClick={() => setIntento((n) => n + 1)} className="boton-pixel">
          {textoPixel(t.reintentar)}
        </button>
      </div>
    );
  }
  if (cargando || !usuario || !entradas) return <Cargando />;

  const vacia = entradas.length === 0;
  const secciones: Seccion[] = ["conceptos", "prompts", "notas", "fichas"];

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[860px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/inicio"
            transitionTypes={["atras"]}
            className="shrink-0 border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--matrix)] hover:text-[var(--matrix)]"
          >
            ← {textoPixel(t.volver)}
          </Link>
          <h1 className="min-w-0 truncate font-[family-name:var(--font-display)] text-[19px] font-black text-white">
            {t.bitacora} {piloto}
          </h1>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[860px] gap-4 px-4 pb-28 pt-5 sm:px-6">
        <div className="consola-leccion">
          <span className="consola-esquina consola-esquina-tl" />
          <span className="consola-esquina consola-esquina-br" />
          <div className="flex items-start gap-3 p-3.5">
            <PuntiPixel estado={vacia ? "info" : "leyendo"} recorte="busto" ancho={70} />
            <p className="min-w-0 flex-1 font-[family-name:var(--font-terminal)] text-[20px] leading-[1.18] text-[#d9ffe3]">
              <TextoTecleado key={`${idioma}-${vacia}`} texto={vacia ? t.saludoVacio : t.saludo} />
            </p>
          </div>
        </div>

        <div role="tablist" aria-label={`${t.bitacora} ${piloto}`} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {secciones.map((s) => {
            const activa = s === seccion;
            return (
              <button
                key={s}
                id={`pestana-${s}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`panel-${s}`}
                onClick={() => {
                  sonar("toque");
                  setSeccion(s);
                }}
                className="flex items-center justify-between gap-2 border-2 px-3 py-2.5 text-left font-[family-name:var(--font-ui)] text-[15px] font-bold transition-colors"
                style={{
                  borderColor: activa ? COLOR[s] : "var(--color-panel-border)",
                  color: activa ? "white" : "var(--muted)",
                  background: activa ? "rgba(255,255,255,0.05)" : "transparent",
                }}
              >
                <span>{t[s]}</span>
                <span className="font-[family-name:var(--font-terminal)] text-[18px] tabular-nums" style={{ color: COLOR[s] }}>
                  {grupos[s].length}
                </span>
              </button>
            );
          })}
        </div>

        <section id={`panel-${seccion}`} role="tabpanel" aria-labelledby={`pestana-${seccion}`} className="grid gap-3">
          {seccion === "conceptos" && <Conceptos lista={grupos.conceptos} idioma={idioma} t={t} />}
          {seccion === "prompts" && <Prompts lista={grupos.prompts} idioma={idioma} t={t} uid={usuario.uid} quitar={quitar} />}
          {seccion === "notas" && (
            <Notas lista={grupos.notas} todas={entradas} idioma={idioma} t={t} uid={usuario.uid} quitar={quitar} poner={poner} />
          )}
          {seccion === "fichas" && <Fichas lista={grupos.fichas} idioma={idioma} t={t} />}
        </section>
      </main>
    </div>
  );
}

type Txt = Record<string, string>;

function Vacio({ texto }: { texto: string }) {
  return <p className="border-2 border-dashed border-[var(--color-panel-border)] px-4 py-6 text-center text-[15px] text-[var(--muted)]">{texto}</p>;
}

function Tarjeta({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <article className="grid gap-2.5 border-2 bg-[rgba(10,10,30,0.88)] p-4" style={{ borderColor: color }}>
      {children}
    </article>
  );
}

function Pie({ izquierda, children }: { izquierda: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">{izquierda}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/** Botón de borrar con segundo toque para confirmar. */
function Borrar({ t, alBorrar }: { t: Txt; alBorrar: () => Promise<void> }) {
  const [seguro, setSeguro] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    if (!seguro) return;
    const reloj = setTimeout(() => setSeguro(false), 4000);
    return () => clearTimeout(reloj);
  }, [seguro]);
  return (
    <button
      type="button"
      disabled={ocupado}
      onClick={async () => {
        if (!seguro) {
          setSeguro(true);
          return;
        }
        setOcupado(true);
        try {
          await alBorrar();
        } catch {
          setOcupado(false);
          setSeguro(false);
        }
      }}
      className="px-2 py-1.5 font-[family-name:var(--font-ui)] text-[14px] font-semibold disabled:opacity-50"
      style={{ color: seguro ? "var(--pink)" : "var(--muted)" }}
    >
      {seguro ? t.seguro : t.borrar}
    </button>
  );
}

function Conceptos({ lista, idioma, t }: { lista: (EntradaConcepto & { id: string })[]; idioma: Idioma; t: Txt }) {
  if (!lista.length) return <Vacio texto={t.vacioConceptos} />;
  return lista.map((e) => (
    <Tarjeta key={e.id} color="rgba(255,230,0,0.45)">
      <h2 className="font-[family-name:var(--font-display)] text-[19px] font-black text-white">{e.titulo[idioma] || e.concepto}</h2>
      <p className="font-[family-name:var(--font-terminal)] text-[21px] leading-[1.2] text-[#d9ffe3]">
        <span className="text-[var(--gold)]">{t.tu}:</span> {e.frase}
      </p>
      <p className="text-[14px] leading-[1.55] text-[var(--muted)]">
        <span className="font-semibold text-[var(--matrix)]">{t.punti}:</span> {e.definicion[idioma]}
      </p>
      <Pie izquierda={fecha(e, idioma)} />
    </Tarjeta>
  ));
}

function Prompts({
  lista,
  idioma,
  t,
  uid,
  quitar,
}: {
  lista: (EntradaPrompt & { id: string })[];
  idioma: Idioma;
  t: Txt;
  uid: string;
  quitar: (id: string) => void;
}) {
  const [copiado, setCopiado] = useState<string | null>(null);
  if (!lista.length) return <Vacio texto={t.vacioPrompts} />;
  return lista.map((e) => (
    <Tarjeta key={e.id} color="rgba(0,245,255,0.4)">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-[family-name:var(--font-ui)] text-[16px] font-bold uppercase tracking-[0.08em] text-[var(--cyan)]">{e.etiqueta[idioma]}</h2>
        <span
          className="border px-2 py-0.5 font-[family-name:var(--font-ui)] text-[12px] font-bold uppercase"
          style={{ borderColor: e.aprobado ? "var(--matrix)" : "var(--muted)", color: e.aprobado ? "var(--matrix)" : "var(--muted)" }}
        >
          {e.aprobado ? t.paso : t.sinTerminar}
        </span>
      </div>
      <p className="whitespace-pre-wrap break-words border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2.5 font-[family-name:var(--font-terminal)] text-[19px] leading-[1.2] text-[#d9ffe3]">
        {e.texto}
      </p>
      {e.piezas && (
        <p className="text-[14px] text-[var(--muted)]">
          <span className="font-semibold text-white">{t.piezas}:</span> {e.piezas}
        </p>
      )}
      <Pie izquierda={fecha(e, idioma)}>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(e.texto);
              sonar("acierto");
              setCopiado(e.id);
              setTimeout(() => setCopiado((c) => (c === e.id ? null : c)), 2000);
            } catch {
              /* el navegador no dejó copiar: el texto sigue ahí para seleccionarlo */
            }
          }}
          className="boton-pixel"
          style={{ borderColor: "var(--cyan)", color: "var(--cyan)", background: "transparent" }}
        >
          {textoPixel(copiado === e.id ? t.copiado : t.copiar)}
        </button>
        <Borrar
          t={t}
          alBorrar={async () => {
            await borrarEntrada(uid, e.id);
            quitar(e.id);
          }}
        />
      </Pie>
    </Tarjeta>
  ));
}

function Notas({
  lista,
  todas,
  idioma,
  t,
  uid,
  quitar,
  poner,
}: {
  lista: (EntradaNota & { id: string })[];
  todas: Entrada[];
  idioma: Idioma;
  t: Txt;
  uid: string;
  quitar: (id: string) => void;
  poner: (e: Entrada) => void;
}) {
  const [nueva, setNueva] = useState("");
  const [editando, setEditando] = useState<{ id: string; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState(false);
  const libre = siguienteNota(todas);

  async function guardar(id: string, texto: string, alTerminar: () => void) {
    const limpio = texto.trim();
    if (!limpio) return;
    setOcupado(true);
    setError(false);
    try {
      await guardarNota(uid, id, limpio);
      sonar("acierto");
      poner({ id, tipo: "nota", texto: limpio.slice(0, LARGO.nota), fecha: null });
      alTerminar();
    } catch {
      setError(true);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <div className="grid gap-2.5 border-2 border-[rgba(0,255,65,0.4)] bg-[rgba(10,10,30,0.88)] p-4">
        <label htmlFor="nota-nueva" className="font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">
          {t.nuevaNota}
        </label>
        {libre ? (
          <>
            <textarea
              id="nota-nueva"
              value={nueva}
              maxLength={LARGO.nota}
              rows={4}
              disabled={ocupado}
              placeholder={t.placeholderNota}
              onChange={(e) => setNueva(e.target.value)}
              className="w-full resize-y border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2.5 font-[family-name:var(--font-terminal)] text-[20px] leading-[1.2] text-[#d9ffe3] placeholder:text-[#3f6b4c]"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="font-[family-name:var(--font-terminal)] text-[16px] tabular-nums text-[var(--muted)]">
                {nueva.length} / {LARGO.nota} · {lista.length} / {MAX_NOTAS}
              </span>
              <button
                type="button"
                disabled={ocupado || !nueva.trim()}
                onClick={() => guardar(libre, nueva, () => setNueva(""))}
                className="boton-pixel boton-pixel-lleno disabled:opacity-50"
              >
                {textoPixel(t.guardar)}
              </button>
            </div>
          </>
        ) : (
          <p className="text-[14px] text-[var(--muted)]">{t.tope}</p>
        )}
        {error && (
          <p role="alert" className="text-[14px] text-[var(--pink)]">
            {t.errorGuardar}
          </p>
        )}
      </div>

      {!lista.length ? (
        <Vacio texto={t.vacioNotas} />
      ) : (
        lista.map((e) =>
          editando?.id === e.id ? (
            <Tarjeta key={e.id} color="var(--matrix)">
              <label htmlFor={`editar-${e.id}`} className="sr-only">
                {t.editar}
              </label>
              <textarea
                id={`editar-${e.id}`}
                value={editando.texto}
                maxLength={LARGO.nota}
                rows={4}
                disabled={ocupado}
                onChange={(ev) => setEditando({ id: e.id, texto: ev.target.value })}
                className="w-full resize-y border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2.5 font-[family-name:var(--font-terminal)] text-[20px] leading-[1.2] text-[#d9ffe3]"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setEditando(null)} className="px-2 py-1.5 font-[family-name:var(--font-ui)] text-[14px] font-semibold text-[var(--muted)]">
                  {t.cancelar}
                </button>
                <button
                  type="button"
                  disabled={ocupado || !editando.texto.trim()}
                  onClick={() => guardar(e.id, editando.texto, () => setEditando(null))}
                  className="boton-pixel boton-pixel-lleno disabled:opacity-50"
                >
                  {textoPixel(t.guardar)}
                </button>
              </div>
            </Tarjeta>
          ) : (
            <Tarjeta key={e.id} color="rgba(0,255,65,0.35)">
              <p className="whitespace-pre-wrap break-words font-[family-name:var(--font-terminal)] text-[20px] leading-[1.2] text-[#d9ffe3]">{e.texto}</p>
              <Pie izquierda={fecha(e, idioma)}>
                <button
                  type="button"
                  onClick={() => setEditando({ id: e.id, texto: e.texto })}
                  className="px-2 py-1.5 font-[family-name:var(--font-ui)] text-[14px] font-semibold text-[var(--cyan)]"
                >
                  {t.editar}
                </button>
                <Borrar
                  t={t}
                  alBorrar={async () => {
                    await borrarEntrada(uid, e.id);
                    quitar(e.id);
                  }}
                />
              </Pie>
            </Tarjeta>
          ),
        )
      )}
    </>
  );
}

function Fichas({ lista, idioma, t }: { lista: (EntradaFicha & { id: string })[]; idioma: Idioma; t: Txt }) {
  if (!lista.length) return <Vacio texto={t.vacioFichas} />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {lista.map((e) => (
        <Tarjeta key={e.id} color="rgba(255,0,110,0.45)">
          <h2 className="font-[family-name:var(--font-display)] text-[18px] font-black leading-tight text-white">{e.titulo[idioma]}</h2>
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              [t.xp, `+${e.xp}`],
              [t.combustible, "▮".repeat(e.combustible) + "▯".repeat(3 - e.combustible)],
              [t.transmisiones, String(e.transmisiones)],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-0.5 border border-[var(--color-panel-border)] px-1 py-2">
                <dt className="font-[family-name:var(--font-ui)] text-[11px] font-bold uppercase text-[var(--muted)]">{k}</dt>
                <dd className="font-[family-name:var(--font-terminal)] text-[22px] leading-none text-[var(--gold)]">{v}</dd>
              </div>
            ))}
          </dl>
          <Pie izquierda={fecha(e, idioma)}>
            <Link
              href={`/mision/${e.mundo}/${e.mision}`}
              transitionTypes={["adelante"]}
              className="font-[family-name:var(--font-ui)] text-[14px] font-semibold text-[var(--pink)] hover:text-white"
            >
              {t.jugarOtraVez} →
            </Link>
          </Pie>
        </Tarjeta>
      ))}
    </div>
  );
}
