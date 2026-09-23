"use client";

import { useEffect, useMemo, useState } from "react";
import MarcoAdmin from "@/components/admin/MarcoAdmin";
import { ESCALAFON, type ClaveXpRango } from "@/lib/rangos";
import { BotonBorrar, BotonIcono, CampoBilingue, ListaProblemas, cambiar, mover, quitar } from "@/components/admin/Campos";
import PuntiPixel from "@/components/PuntiPixel";
import { PREGUNTAS_CODIGO } from "@/components/PreguntasFrecuentes";
import {
  firma,
  guardarAnuncio,
  guardarClub,
  guardarFaq,
  leerListaEspera,
  guardarJuego,
  leerAjustesAdmin,
  vacio,
  validarFaq,
} from "@/lib/contenidoAdmin";
import {
  AJUSTES_POR_DEFECTO,
  calcularXpMaximo,
  textoPrecio,
  validarClub,
  validarJuego,
  type Ajustes,
  type AjustesClub,
  type AjustesJuego,
  type Anuncio,
  type TonoAnuncio,
} from "@/lib/ajustes";
import type { PreguntaFaq } from "@/lib/contenido";

/**
 * Ajustes: lo que cambia cómo se juega y lo que dice la app, sin tocar código.
 *   - Reglas del juego: tanque, costos, XP y rangos.
 *   - Anuncio: el aviso de arriba en la pantalla de mundos.
 *   - Preguntas frecuentes de la portada.
 *
 * Cada bloque se guarda con su propio botón y aplica de inmediato (no hay
 * borrador): son pocos datos, y así se sabe exactamente cuándo cambió algo.
 */

type Aviso = { texto: string; malo?: boolean } | null;

export default function AjustesAdmin() {
  const [original, setOriginal] = useState<{ ajustes: Ajustes; faq: PreguntaFaq[] | null } | null>(null);
  const [juego, setJuego] = useState<AjustesJuego | null>(null);
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [club, setClub] = useState<AjustesClub | null>(null);
  const [faq, setFaq] = useState<PreguntaFaq[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso>(null);

  useEffect(() => {
    let vigente = true;
    leerAjustesAdmin()
      .then((datos) => {
        if (!vigente) return;
        setOriginal(datos);
        setJuego(datos.ajustes.juego);
        setAnuncio(datos.ajustes.anuncio);
        setClub(datos.ajustes.club);
        setFaq(datos.faq ?? PREGUNTAS_CODIGO);
      })
      .catch((e) => {
        if (!vigente) return;
        setError(
          (e as { code?: string }).code === "permission-denied"
            ? "Firebase no dejó leer los ajustes. Publica las reglas nuevas (firestore.rules) en la consola de Firebase."
            : "No se pudieron cargar los ajustes. Revisa la conexión.",
        );
      });
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const reloj = setTimeout(() => setAviso(null), 3500);
    return () => clearTimeout(reloj);
  }, [aviso]);

  return (
    <MarcoAdmin ancho={960}>
      <main className="mx-auto flex w-full max-w-[960px] flex-col gap-8 px-4 pb-24 pt-6 sm:px-6">
        {error ? (
          <div className="flex flex-col items-center gap-4 border-2 border-[var(--pink)] px-6 py-10 text-center">
            <PuntiPixel estado="error" ancho={96} />
            <p className="max-w-[56ch] text-[15px] text-[var(--muted)]">{error}</p>
          </div>
        ) : !original || !juego || !anuncio || !club || !faq ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="esqueleto h-[160px]" />
            ))}
          </div>
        ) : (
          <>
            <BloqueJuego
              juego={juego}
              original={original.ajustes.juego}
              alCambiar={setJuego}
              alGuardado={(j) => {
                setOriginal((o) => (o ? { ...o, ajustes: { ...o.ajustes, juego: j } } : o));
                setJuego(j);
              }}
              avisar={setAviso}
            />
            <BloqueClub
              club={club}
              original={original.ajustes.club}
              alCambiar={setClub}
              alGuardado={(c) => setOriginal((o) => (o ? { ...o, ajustes: { ...o.ajustes, club: c } } : o))}
              avisar={setAviso}
            />
            <BloqueAnuncio
              anuncio={anuncio}
              original={original.ajustes.anuncio}
              alCambiar={setAnuncio}
              alGuardado={(a) => setOriginal((o) => (o ? { ...o, ajustes: { ...o.ajustes, anuncio: a } } : o))}
              avisar={setAviso}
            />
            <BloqueFaq
              faq={faq}
              original={original.faq}
              alCambiar={setFaq}
              alGuardado={(f) => setOriginal((o) => (o ? { ...o, faq: f } : o))}
              avisar={setAviso}
            />
          </>
        )}
      </main>

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

/* =============================================================== piezas */

function Bloque({
  titulo,
  ayuda,
  pie,
  children,
}: {
  titulo: string;
  ayuda: string;
  pie: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-2 border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.82)]">
      <div className="border-b-2 border-[var(--color-panel-border)] px-4 py-3">
        <h2 className="font-[family-name:var(--font-pixel)] text-[11px] leading-[1.7] text-white">{titulo}</h2>
        <p className="text-[14px] text-[var(--muted)]">{ayuda}</p>
      </div>
      <div className="flex flex-col gap-5 p-4">{children}</div>
      <div className="flex flex-wrap items-center gap-3 border-t-2 border-[var(--color-panel-border)] px-4 py-3">{pie}</div>
    </section>
  );
}

function EstadoCambios({ cambiado }: { cambiado: boolean }) {
  return (
    <span className="font-[family-name:var(--font-terminal)] text-[15px] tracking-[0.06em]" style={{ color: cambiado ? "var(--gold)" : "var(--muted)" }}>
      {cambiado ? "Cambios sin guardar" : "✓ Guardado"}
    </span>
  );
}

function Numero({
  id,
  etiqueta,
  ayuda,
  valor,
  paso = 1,
  alCambiar,
}: {
  id: string;
  etiqueta: string;
  ayuda?: string;
  valor: number;
  paso?: number;
  alCambiar: (v: number) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">{etiqueta}</span>
      <input
        id={id}
        type="number"
        min={0}
        step={paso}
        value={Number.isFinite(valor) ? valor : ""}
        onChange={(e) => alCambiar(e.target.value === "" ? NaN : Number(e.target.value))}
        className="campo-admin w-32 tabular-nums"
      />
      {ayuda && <span className="text-[13px] text-[var(--muted)]">{ayuda}</span>}
    </label>
  );
}

/* ------------------------------------------------------ juego */

function BloqueJuego({
  juego,
  original,
  alCambiar,
  alGuardado,
  avisar,
}: {
  juego: AjustesJuego;
  original: AjustesJuego;
  alCambiar: (j: AjustesJuego) => void;
  alGuardado: (j: AjustesJuego) => void;
  avisar: (a: Aviso) => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [intento, setIntento] = useState(false);
  const problemas = validarJuego(juego);
  const cambiado = firma(juego) !== firma(original);
  const campo = (clave: keyof AjustesJuego) => (v: number) => alCambiar({ ...juego, [clave]: v });

  async function guardar() {
    setIntento(true);
    if (problemas.length) return;
    setGuardando(true);
    try {
      const final = await guardarJuego(juego);
      alGuardado(final);
      setIntento(false);
      avisar({ texto: "Reglas del juego guardadas. Ya aplican para todos." });
    } catch {
      avisar({ texto: "No se pudieron guardar. Intenta de nuevo.", malo: true });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Bloque
      titulo="REGLAS DEL JUEGO"
      ayuda="Aplican de inmediato para todos, también en las reglas de seguridad de Firebase."
      pie={
        <>
          <EstadoCambios cambiado={cambiado} />
          <span className="flex-1" />
          <button onClick={() => alCambiar(AJUSTES_POR_DEFECTO.juego)} className="btn-admin">
            VALORES DE SIEMPRE
          </button>
          <button onClick={guardar} disabled={!cambiado || guardando} className="btn-admin btn-admin-lleno">
            {guardando ? "GUARDANDO…" : "GUARDAR REGLAS"}
          </button>
        </>
      }
    >
      {intento && <ListaProblemas problemas={problemas} titulo="REVISA ESTO" />}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">GASOLINA</legend>
        <div className="flex flex-wrap gap-5">
          <Numero id="gasolinaMaxima" etiqueta="Tanque lleno" ayuda="También es la recarga de cada día." valor={juego.gasolinaMaxima} alCambiar={campo("gasolinaMaxima")} />
          <Numero id="costoError" etiqueta="Costo de fallar" ayuda="En pasos de 0,5." paso={0.5} valor={juego.costoError} alCambiar={campo("costoError")} />
          <Numero id="costoPista" etiqueta="Costo de una pista" ayuda="0 = gratis." paso={0.5} valor={juego.costoPista} alCambiar={campo("costoPista")} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">XP POR LECCION</legend>
        <div className="flex flex-wrap gap-5">
          <Numero id="xpPerfecta" etiqueta="Sin errores" valor={juego.xpPerfecta} alCambiar={campo("xpPerfecta")} />
          <Numero id="xpBuena" etiqueta="1 o 2 errores" valor={juego.xpBuena} alCambiar={campo("xpBuena")} />
          <Numero id="xpBasica" etiqueta="3 errores o más" valor={juego.xpBasica} alCambiar={campo("xpBasica")} />
          <Numero id="bonoVelocidad" etiqueta="Bono de velocidad" ayuda="Si termina antes del tiempo de la lección." valor={juego.bonoVelocidad} alCambiar={campo("bonoVelocidad")} />
        </div>
        {problemas.length === 0 && (
          <p className="text-[14px] text-[var(--muted)]">
            Una lección perfecta y rápida da <b className="text-white">{calcularXpMaximo(juego)} XP</b>. Es lo máximo que Firebase acepta de una vez.
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">RANGOS</legend>
        <div className="flex flex-wrap gap-5">
          {ESCALAFON.slice(1).map((e) => {
            const clave = `xpRango${e.n}` as ClaveXpRango;
            return (
              <Numero key={clave} id={clave} etiqueta={`${e.n}. ${e.titulo}`} valor={juego[clave]} alCambiar={campo(clave)} />
            );
          })}
        </div>
        <p className="text-[13px] text-[var(--muted)]">
          XP desde el que empieza cada rango; el 1, Cadete, empieza en 0. Cada número tiene que ser mayor que el anterior. Como las lecciones se pueden repetir, los rangos altos premian la práctica.
        </p>
        <p className="text-[13px] text-[var(--muted)]">
          Si cambias el tanque, revisa también las preguntas frecuentes: una de ellas dice cuánta gasolina hay.
        </p>
      </fieldset>
    </Bloque>
  );
}

/* ------------------------------------------------------ club */

type Anotado = Awaited<ReturnType<typeof leerListaEspera>>[number];

function BloqueClub({
  club,
  original,
  alCambiar,
  alGuardado,
  avisar,
}: {
  club: AjustesClub;
  original: AjustesClub;
  alCambiar: (c: AjustesClub) => void;
  alGuardado: (c: AjustesClub) => void;
  avisar: (a: Aviso) => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [intento, setIntento] = useState(false);
  const [lista, setLista] = useState<Anotado[] | null>(null);
  const [errorLista, setErrorLista] = useState(false);
  const problemas = validarClub(club);
  const cambiado = firma(club) !== firma(original);
  const campo = (clave: Exclude<keyof AjustesClub, "ventasAbiertas">) => (v: number) => alCambiar({ ...club, [clave]: v });

  useEffect(() => {
    let vigente = true;
    leerListaEspera()
      .then((l) => vigente && setLista(l))
      .catch(() => vigente && setErrorLista(true));
    return () => {
      vigente = false;
    };
  }, []);

  const porPlan = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of lista ?? []) c[a.plan] = (c[a.plan] ?? 0) + 1;
    return c;
  }, [lista]);

  async function guardar() {
    setIntento(true);
    if (problemas.length) return;
    setGuardando(true);
    try {
      await guardarClub(club);
      alGuardado(club);
      setIntento(false);
      avisar({ texto: "Precios del Club guardados. Ya se ven en /club." });
    } catch {
      avisar({ texto: "No se pudieron guardar los precios.", malo: true });
    } finally {
      setGuardando(false);
    }
  }

  async function copiarCorreos() {
    if (!lista?.length) return;
    try {
      await navigator.clipboard.writeText(lista.map((a) => a.email).join(", "));
      avisar({ texto: `${lista.length} correos copiados.` });
    } catch {
      avisar({ texto: "No se pudieron copiar los correos.", malo: true });
    }
  }

  return (
    <Bloque
      titulo="PUNTI CLUB"
      ayuda="Precios que se muestran en /club y la lista de espera. Los miembros se marcan como premium en PILOTOS; los mundos del Club se eligen en CONTENIDO."
      pie={
        <>
          <EstadoCambios cambiado={cambiado} />
          <span className="flex-1" />
          <button onClick={() => alCambiar(AJUSTES_POR_DEFECTO.club)} className="btn-admin">
            VALORES RECOMENDADOS
          </button>
          <button onClick={guardar} disabled={!cambiado || guardando} className="btn-admin btn-admin-lleno">
            {guardando ? "GUARDANDO…" : "GUARDAR PRECIOS"}
          </button>
        </>
      }
    >
      {intento && <ListaProblemas problemas={problemas} titulo="REVISA ESTO" />}

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">PRECIOS</legend>
        <div className="flex flex-wrap gap-5">
          <Numero id="precioCopMes" etiqueta="COP al mes" valor={club.precioCopMes} paso={100} alCambiar={campo("precioCopMes")} />
          <Numero id="precioCopAnio" etiqueta="COP al año" valor={club.precioCopAnio} paso={100} alCambiar={campo("precioCopAnio")} />
          <Numero id="precioUsdMes" etiqueta="USD al mes" valor={club.precioUsdMes} paso={0.01} alCambiar={campo("precioUsdMes")} />
          <Numero id="precioUsdAnio" etiqueta="USD al año" valor={club.precioUsdAnio} paso={0.01} alCambiar={campo("precioUsdAnio")} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">FUNDADOR</legend>
        <div className="flex flex-wrap gap-5">
          <Numero id="precioFundadorCop" etiqueta="COP primer año" valor={club.precioFundadorCop} paso={100} alCambiar={campo("precioFundadorCop")} />
          <Numero id="precioFundadorUsd" etiqueta="USD primer año" valor={club.precioFundadorUsd} paso={0.01} alCambiar={campo("precioFundadorUsd")} />
          <Numero id="cuposFundador" etiqueta="Cupos" ayuda="0 = sin oferta Fundador." valor={club.cuposFundador} alCambiar={campo("cuposFundador")} />
        </div>
        {problemas.length === 0 && (
          <p className="text-[14px] text-[var(--muted)]">
            En /club se ve: <b className="text-white">{textoPrecio(club.precioCopMes, "COP")}</b> al mes o{" "}
            <b className="text-white">{textoPrecio(club.precioCopAnio, "COP")}</b> al año (
            {Math.round((1 - club.precioCopAnio / (club.precioCopMes * 12)) * 100)}% de ahorro).
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">LISTA DE ESPERA</legend>
        {errorLista ? (
          <p className="text-[14px] text-[var(--pink)]">No se pudo leer la lista. ¿Publicaste las reglas nuevas de Firebase?</p>
        ) : !lista ? (
          <div className="esqueleto h-10" aria-hidden="true" />
        ) : lista.length === 0 ? (
          <p className="text-[14px] text-[var(--muted)]">Todavía nadie se ha anotado.</p>
        ) : (
          <>
            <p className="text-[15px] text-white">
              <b>{lista.length}</b> anotados · Fundador {porPlan.fundador ?? 0} · Anual {porPlan.anual ?? 0} · Mensual {porPlan.mensual ?? 0}
            </p>
            <button onClick={copiarCorreos} className="btn-admin w-fit">
              COPIAR CORREOS
            </button>
            <div className="max-h-[260px] overflow-auto border-2 border-[var(--color-panel-border)]">
              <table className="w-full text-left text-[14px]">
                <tbody>
                  {lista.map((a) => (
                    <tr key={a.uid} className="border-b border-[var(--color-panel-border)]">
                      <td className="px-3 py-2 text-white">{a.email}</td>
                      <td className="px-3 py-2 text-[var(--muted)]">{a.plan}</td>
                      <td className="px-3 py-2 text-[var(--muted)]">{a.moneda}</td>
                      <td className="px-3 py-2 text-[var(--muted)] tabular-nums">{a.creadoEn?.toLocaleDateString("es-CO") ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </fieldset>
    </Bloque>
  );
}

/* ------------------------------------------------------ anuncio */

const TONOS: { id: TonoAnuncio; texto: string; color: string }[] = [
  { id: "info", texto: "Novedad", color: "#00f5ff" },
  { id: "alerta", texto: "Aviso importante", color: "#ffe600" },
  { id: "celebracion", texto: "Celebración", color: "#00ff41" },
];

function BloqueAnuncio({
  anuncio,
  original,
  alCambiar,
  alGuardado,
  avisar,
}: {
  anuncio: Anuncio;
  original: Anuncio;
  alCambiar: (a: Anuncio) => void;
  alGuardado: (a: Anuncio) => void;
  avisar: (a: Aviso) => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const cambiado = firma(anuncio) !== firma(original);
  const faltaTexto = anuncio.activo && (!anuncio.texto.es.trim() || !anuncio.texto.en.trim());
  const color = TONOS.find((t) => t.id === anuncio.tono)!.color;

  async function guardar() {
    if (faltaTexto) return;
    setGuardando(true);
    try {
      await guardarAnuncio(anuncio);
      alGuardado(anuncio);
      avisar({ texto: anuncio.activo ? "Anuncio publicado." : "Anuncio guardado (apagado)." });
    } catch {
      avisar({ texto: "No se pudo guardar el anuncio.", malo: true });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Bloque
      titulo="ANUNCIO"
      ayuda="Un aviso arriba de la pantalla de mundos: novedades, mantenimiento, celebraciones. Cada persona lo puede cerrar."
      pie={
        <>
          <EstadoCambios cambiado={cambiado} />
          <span className="flex-1" />
          <button onClick={guardar} disabled={!cambiado || guardando || faltaTexto} className="btn-admin btn-admin-lleno">
            {guardando ? "GUARDANDO…" : "GUARDAR ANUNCIO"}
          </button>
        </>
      }
    >
      <div className="flex flex-wrap items-end gap-5">
        <label className="flex items-center gap-3">
          <input
            id="anuncio-activo"
            type="checkbox"
            checked={anuncio.activo}
            onChange={(e) => alCambiar({ ...anuncio, activo: e.target.checked })}
            className="h-5 w-5 accent-[var(--matrix)]"
          />
          <span className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.1em] text-white">Mostrar anuncio</span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">Tipo</span>
          <select
            id="anuncio-tono"
            value={anuncio.tono}
            onChange={(e) => alCambiar({ ...anuncio, tono: e.target.value as TonoAnuncio })}
            className="campo-admin w-fit"
          >
            {TONOS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.texto}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CampoBilingue
        id="anuncio-texto"
        etiqueta="Texto del anuncio"
        valor={anuncio.texto}
        alCambiar={(texto) => alCambiar({ ...anuncio, texto })}
        marcarFaltas={faltaTexto}
        largo
      />
      {anuncio.texto.es.trim() && (
        <div>
          <p className="mb-1.5 font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.1em] text-[var(--muted)]">Así se ve</p>
          <div className="flex items-start gap-3 border-2 bg-[rgba(5,5,16,0.9)] px-4 py-3" style={{ borderColor: color, opacity: anuncio.activo ? 1 : 0.45 }}>
            <span className="mt-1 h-2.5 w-2.5 shrink-0" style={{ background: color }} aria-hidden="true" />
            <p className="flex-1 whitespace-pre-line text-[15px] leading-[1.55] text-white">{anuncio.texto.es}</p>
            <span className="font-[family-name:var(--font-terminal)] text-[20px] leading-none text-[var(--muted)]" aria-hidden="true">✕</span>
          </div>
        </div>
      )}
    </Bloque>
  );
}

/* ------------------------------------------------------ preguntas */

function BloqueFaq({
  faq,
  original,
  alCambiar,
  alGuardado,
  avisar,
}: {
  faq: PreguntaFaq[];
  original: PreguntaFaq[] | null;
  alCambiar: (f: PreguntaFaq[]) => void;
  alGuardado: (f: PreguntaFaq[]) => void;
  avisar: (a: Aviso) => void;
}) {
  const [guardando, setGuardando] = useState(false);
  const [intento, setIntento] = useState(false);
  const [abierta, setAbierta] = useState<number | null>(null);
  const problemas = useMemo(() => validarFaq(faq), [faq]);
  // Si aún no hay preguntas en Firebase, las del código cuentan como "sin guardar".
  const cambiado = original === null || firma(faq) !== firma(original);

  async function guardar() {
    setIntento(true);
    if (problemas.length) return;
    setGuardando(true);
    try {
      await guardarFaq(faq);
      alGuardado(faq);
      setIntento(false);
      avisar({ texto: "Preguntas frecuentes guardadas." });
    } catch {
      avisar({ texto: "No se pudieron guardar las preguntas.", malo: true });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Bloque
      titulo="PREGUNTAS FRECUENTES"
      ayuda={
        original === null
          ? "Estas son las de siempre, escritas en el código. Al guardar pasan a Firebase y desde ahí se editan aquí."
          : "Las que aparecen al final de la portada, en este orden."
      }
      pie={
        <>
          <EstadoCambios cambiado={cambiado} />
          <span className="flex-1" />
          <button onClick={guardar} disabled={!cambiado || guardando} className="btn-admin btn-admin-lleno">
            {guardando ? "GUARDANDO…" : "GUARDAR PREGUNTAS"}
          </button>
        </>
      }
    >
      {intento && <ListaProblemas problemas={problemas} titulo="REVISA ESTO" />}
      <ol className="flex flex-col gap-2">
        {faq.map((q, i) => {
          const esta = abierta === i;
          return (
            <li key={i} className="border-2 border-[var(--color-panel-border)] bg-black/25">
              <div className="flex items-center gap-2 p-2.5">
                <button onClick={() => setAbierta(esta ? null : i)} aria-expanded={esta} className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-[family-name:var(--font-ui)] text-[15px] font-bold text-white">
                    {i + 1}. {q.p.es || "Pregunta sin escribir"}
                  </span>
                </button>
                <BotonIcono etiqueta="Subir pregunta" onClick={() => alCambiar(mover(faq, i, -1))} disabled={i === 0}>↑</BotonIcono>
                <BotonIcono etiqueta="Bajar pregunta" onClick={() => alCambiar(mover(faq, i, 1))} disabled={i === faq.length - 1}>↓</BotonIcono>
                <BotonBorrar etiqueta={`Borrar pregunta ${i + 1}`} alBorrar={() => alCambiar(quitar(faq, i))} />
              </div>
              {esta && (
                <div className="flex flex-col gap-4 border-t-2 border-[var(--color-panel-border)] p-3">
                  <CampoBilingue id={`faq-${i}-p`} etiqueta="Pregunta" valor={q.p} alCambiar={(p) => alCambiar(cambiar(faq, i, { ...q, p }))} marcarFaltas={intento} />
                  <CampoBilingue id={`faq-${i}-r`} etiqueta="Respuesta" valor={q.r} alCambiar={(r) => alCambiar(cambiar(faq, i, { ...q, r }))} marcarFaltas={intento} largo />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        onClick={() => {
          alCambiar([...faq, { p: vacio(), r: vacio() }]);
          setAbierta(faq.length);
        }}
        className="btn-admin w-fit"
      >
        + AGREGAR PREGUNTA
      </button>
    </Bloque>
  );
}
