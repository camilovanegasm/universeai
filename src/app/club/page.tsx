"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useCatalogo } from "@/lib/contenido";
import { textoTema } from "@/lib/temas";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";
import { textoPrecio } from "@/lib/ajustes";
import { anotarme, miAnotacion, salirDeLaLista, type Anotacion, type MonedaClub, type PlanClub } from "@/lib/club";
import { obtenerPerfil } from "@/lib/userProfile";
import PuntiPixel from "@/components/PuntiPixel";
import SelectorIdioma from "@/components/SelectorIdioma";

/**
 * Punti Club: la página que explica qué es gratis y qué da el Club.
 *
 * La promesa va primero: aprender IA es gratis, siempre. El Club vende ir más
 * rápido, más profundo y poder demostrarlo. Los precios y si la venta está
 * abierta salen de Admin → Ajustes (contenido/ajustes.club). Mientras la venta
 * no abra, el botón anota a la persona en la lista de espera.
 *
 * Las etiquetas en fuente pixel van sin tildes: Press Start 2P no las trae.
 */

type Celda = { gratis: string | boolean; club: string | boolean; pronto?: boolean };
type Fila = { texto: string; ayuda?: string } & Celda;
type Seccion = { titulo: string; filas: Fila[] };

const TX = {
  es: {
    eyebrow: "// PUNTI CLUB",
    titulo: "Aprender IA es gratis. Siempre.",
    sub: "El Club es para ir más rápido, llegar más profundo y poder demostrarlo. Lo esencial, incluida la ética y la seguridad, nunca se cobra.",
    mensual: "MENSUAL",
    anual: "ANUAL",
    gratis: "GRATIS",
    club: "CLUB",
    paraSiempre: "para siempre",
    alMes: "al mes",
    alAnio: "al año",
    ahorras: "Ahorras",
    empiezaGratis: "EMPIEZA GRATIS",
    irAMundos: "IR A MIS MUNDOS",
    fundadorTitulo: "Miembro Fundador",
    fundadorTexto: (cupos: number, precio: string) =>
      `Los primeros ${cupos} miembros pagan ${precio} el primer año y se quedan con la insignia de Fundador para siempre.`,
    comparar: "Compara",
    pronto: "PRONTO",
    siempreGratis: "Siempre gratis",
    listaTitulo: "Anótate a la lista de espera",
    listaTexto: "El Club abre pronto. Anótate y te escribimos primero, con el precio que elijas guardado para ti.",
    plan: "Plan",
    moneda: "Moneda",
    planes: { fundador: "Fundador", anual: "Anual", mensual: "Mensual" } as Record<PlanClub, string>,
    anotarme: "ANOTARME",
    anotando: "ANOTANDO...",
    necesitasCuenta: "Para anotarte necesitas una cuenta gratis.",
    crearCuenta: "CREAR CUENTA",
    entrar: "Ya tengo cuenta",
    yaEstas: (plan: string) => `Ya estás en la lista, con el plan ${plan}. Te escribimos apenas abra el Club.`,
    salir: "Salir de la lista",
    error: "No se pudo guardar. Revisa tu conexión e intenta de nuevo.",
    eresMiembro: "Ya eres miembro del Club. Gracias por apoyar a Punti.",
    preguntas: "Preguntas",
    faq: [
      ["¿Qué pasa con lo gratis?", "Sigue gratis. Todo lo esencial de la IA, incluida la ética y la seguridad, se queda gratis para siempre. El Club no le quita nada a nadie."],
      ["¿Por qué cobrar algo?", "Para pagar los servidores, mantener las lecciones al día cada semana y crear más mundos."],
      ["¿Cuándo abre?", "Pronto. Si te anotas, te escribimos primero."],
      ["¿Puedo cancelar?", "Sí, cuando quieras. Tu progreso, tu XP y tus rangos se quedan contigo."],
    ],
    secciones: (mundosClub: string): Seccion[] => [
      {
        titulo: "Aprender",
        filas: [
          { texto: "Todos los mundos básicos", ayuda: "Qué es la IA, prompts, modelos, marcas, trabajo, imagen y video, agentes, IA en tu día a día", gratis: true, club: true },
          { texto: "Ética y seguridad", ayuda: "Sesgos, privacidad, deepfakes y estafas", gratis: "Siempre gratis", club: true },
          { texto: "Mundos del Club", ayuda: mundosClub, gratis: false, club: true },
          { texto: "Novedades de la semana", gratis: true, club: "Antes que nadie", pronto: true },
        ],
      },
      {
        titulo: "Jugar",
        filas: [
          { texto: "Gasolina", gratis: "5 al día", club: "Ilimitada" },
          { texto: "Pistas de Punti", gratis: "Cuestan gasolina", club: "Gratis" },
          { texto: "XP, 10 rangos y racha", gratis: true, club: true },
          { texto: "Reparar tu racha", gratis: false, club: true, pronto: true },
        ],
      },
      {
        titulo: "Demostrarlo",
        filas: [
          { texto: "Certificado por mundo", ayuda: "Con enlace para compartir en LinkedIn", gratis: false, club: true, pronto: true },
          { texto: "Retos de proyecto revisados", gratis: false, club: true, pronto: true },
        ],
      },
      {
        titulo: "Comunidad",
        filas: [
          { texto: "Comunidad en Discord", gratis: true, club: "Canal del Club", pronto: true },
          { texto: "Sesión en vivo cada mes", gratis: false, club: true, pronto: true },
        ],
      },
    ],
  },
  en: {
    eyebrow: "// PUNTI CLUB",
    titulo: "Learning AI is free. Always.",
    sub: "The Club is for going faster, going deeper and being able to prove it. The essentials, including ethics and safety, are never paywalled.",
    mensual: "MONTHLY",
    anual: "YEARLY",
    gratis: "FREE",
    club: "CLUB",
    paraSiempre: "forever",
    alMes: "per month",
    alAnio: "per year",
    ahorras: "You save",
    empiezaGratis: "START FREE",
    irAMundos: "GO TO MY WORLDS",
    fundadorTitulo: "Founding Member",
    fundadorTexto: (cupos: number, precio: string) =>
      `The first ${cupos} members pay ${precio} for the first year and keep the Founder badge forever.`,
    comparar: "Compare",
    pronto: "SOON",
    siempreGratis: "Always free",
    listaTitulo: "Join the waitlist",
    listaTexto: "The Club opens soon. Join and we'll email you first, with the price you picked saved for you.",
    plan: "Plan",
    moneda: "Currency",
    planes: { fundador: "Founder", anual: "Yearly", mensual: "Monthly" } as Record<PlanClub, string>,
    anotarme: "JOIN THE LIST",
    anotando: "JOINING...",
    necesitasCuenta: "You need a free account to join.",
    crearCuenta: "CREATE ACCOUNT",
    entrar: "I already have an account",
    yaEstas: (plan: string) => `You're on the list with the ${plan} plan. We'll email you as soon as the Club opens.`,
    salir: "Leave the list",
    error: "Couldn't save that. Check your connection and try again.",
    eresMiembro: "You're already a Club member. Thanks for supporting Punti.",
    preguntas: "Questions",
    faq: [
      ["What about the free stuff?", "It stays free. Everything essential about AI, including ethics and safety, is free forever. The Club takes nothing away from anyone."],
      ["Why charge at all?", "To pay for servers, keep lessons up to date every week and build more worlds."],
      ["When does it open?", "Soon. Join the list and we'll email you first."],
      ["Can I cancel?", "Yes, anytime. Your progress, XP and ranks stay with you."],
    ],
    secciones: (mundosClub: string): Seccion[] => [
      {
        titulo: "Learn",
        filas: [
          { texto: "All core worlds", ayuda: "What AI is, prompts, models, brands, work, images and video, agents, AI in daily life", gratis: true, club: true },
          { texto: "Ethics and safety", ayuda: "Bias, privacy, deepfakes and scams", gratis: "Always free", club: true },
          { texto: "Club worlds", ayuda: mundosClub, gratis: false, club: true },
          { texto: "This week's news", gratis: true, club: "Before everyone", pronto: true },
        ],
      },
      {
        titulo: "Play",
        filas: [
          { texto: "Fuel", gratis: "5 a day", club: "Unlimited" },
          { texto: "Hints from Punti", gratis: "Cost fuel", club: "Free" },
          { texto: "XP, 10 ranks and streak", gratis: true, club: true },
          { texto: "Streak repair", gratis: false, club: true, pronto: true },
        ],
      },
      {
        titulo: "Prove it",
        filas: [
          { texto: "Certificate per world", ayuda: "With a link to share on LinkedIn", gratis: false, club: true, pronto: true },
          { texto: "Reviewed project challenges", gratis: false, club: true, pronto: true },
        ],
      },
      {
        titulo: "Community",
        filas: [
          { texto: "Discord community", gratis: true, club: "Club channel", pronto: true },
          { texto: "Monthly live session", gratis: false, club: true, pronto: true },
        ],
      },
    ],
  },
} satisfies Record<Idioma, unknown>;

function Marca({ valor, color }: { valor: string | boolean; color: string }) {
  if (valor === true)
    return (
      <span aria-label="sí" className="inline-flex h-7 w-7 items-center justify-center border-2 font-[family-name:var(--font-pixel)] text-[11px]" style={{ borderColor: color, color }}>
        ✓
      </span>
    );
  if (valor === false)
    return (
      <span aria-label="no" className="text-[var(--muted)]">
        —
      </span>
    );
  return <span className="font-[family-name:var(--font-ui)] text-[15px] font-bold" style={{ color }}>{valor}</span>;
}

export default function ClubPage() {
  const idioma = useIdioma();
  const t = TX[idioma];
  const { usuario, cargando } = useAuth();
  const catalogo = useCatalogo();
  const c = catalogo.ajustes.club;

  const [periodo, setPeriodo] = useState<"mes" | "anio">("anio");
  const [moneda, setMoneda] = useState<MonedaClub>(idioma === "en" ? "USD" : "COP");
  const [plan, setPlan] = useState<PlanClub>("fundador");
  const [anotacion, setAnotacion] = useState<Anotacion | null | undefined>(undefined);
  const [premium, setPremium] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    let vigente = true;
    Promise.all([miAnotacion(usuario.uid).catch(() => null), obtenerPerfil(usuario.uid)]).then(([a, p]) => {
      if (!vigente) return;
      setAnotacion(a);
      setPremium(p?.premium === true);
    });
    return () => {
      vigente = false;
    };
  }, [usuario]);

  const precioMes = moneda === "COP" ? c.precioCopMes : c.precioUsdMes;
  const precioAnio = moneda === "COP" ? c.precioCopAnio : c.precioUsdAnio;
  const precioFundador = moneda === "COP" ? c.precioFundadorCop : c.precioFundadorUsd;
  const ahorro = Math.round((1 - precioAnio / (precioMes * 12)) * 100);

  const mundosClub = catalogo.temas.filter((m) => m.club).map((m) => textoTema(m, idioma).nombre).join(", ");
  const secciones = t.secciones(mundosClub || (idioma === "en" ? "Advanced worlds" : "Mundos avanzados"));

  async function anotar() {
    if (!usuario?.email) return;
    setGuardando(true);
    setError(false);
    try {
      await anotarme(usuario.uid, usuario.email, plan, moneda, idioma);
      setAnotacion({ plan, moneda });
    } catch {
      setError(true);
    } finally {
      setGuardando(false);
    }
  }

  async function salir() {
    if (!usuario) return;
    setGuardando(true);
    try {
      await salirDeLaLista(usuario.uid);
      setAnotacion(null);
    } catch {
      setError(true);
    } finally {
      setGuardando(false);
    }
  }

  const botonToggle = (activo: boolean) =>
    `border-2 px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] transition-colors ${
      activo ? "border-[var(--gold)] bg-[var(--gold)] text-[#05050f]" : "border-[var(--color-panel-border)] text-[var(--muted)] hover:border-[var(--gold)]"
    }`;

  return (
    <main className="mx-auto flex w-full max-w-[920px] flex-1 flex-col gap-10 px-4 py-6 sm:px-6 sm:py-10">
      {/* ─────────────── promesa ─────────────── */}
      <header className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.3em] text-[var(--gold)]">{t.eyebrow}</p>
          <SelectorIdioma />
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <PuntiPixel estado="hype" ancho={132} />
          <div className="flex flex-col gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-[26px] font-black leading-tight text-white [text-wrap:balance] sm:text-[34px]">
              {t.titulo}
            </h1>
            <p className="max-w-[58ch] text-[16px] leading-[1.6] text-[var(--muted)]">{t.sub}</p>
          </div>
        </div>
      </header>

      {premium && (
        <p role="status" className="border-2 border-[var(--gold)] bg-[rgba(255,230,0,0.08)] p-4 text-center font-[family-name:var(--font-ui)] text-[17px] font-bold text-[var(--gold)]">
          {t.eresMiembro}
        </p>
      )}

      {/* ─────────────── precios ─────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => setPeriodo("mes")} className={botonToggle(periodo === "mes")} aria-pressed={periodo === "mes"}>
            {t.mensual}
          </button>
          <button type="button" onClick={() => setPeriodo("anio")} className={botonToggle(periodo === "anio")} aria-pressed={periodo === "anio"}>
            {t.anual}
          </button>
          <span className="mx-2 h-6 w-px bg-[var(--color-panel-border)]" aria-hidden="true" />
          {(["COP", "USD"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMoneda(m)} className={botonToggle(moneda === m)} aria-pressed={moneda === m}>
              {m}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4 border-2 border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.85)] p-5">
            <p className="font-[family-name:var(--font-pixel)] text-[11px] text-[var(--matrix)]">{t.gratis}</p>
            <p className="font-[family-name:var(--font-display)] text-[30px] font-black text-white">
              0 <span className="font-[family-name:var(--font-terminal)] text-[19px] font-normal text-[var(--muted)]">{t.paraSiempre}</span>
            </p>
            <Link href={usuario ? "/inicio" : "/registro"} className="boton-pixel mt-auto">
              {usuario ? t.irAMundos : t.empiezaGratis}
            </Link>
          </div>

          <div className="flex flex-col gap-4 border-2 border-[var(--gold)] bg-[rgba(40,34,6,0.55)] p-5 shadow-[0_0_28px_rgba(255,230,0,0.18)]">
            <p className="font-[family-name:var(--font-pixel)] text-[11px] text-[var(--gold)]">{t.club}</p>
            <p className="font-[family-name:var(--font-display)] text-[30px] font-black text-white [font-variant-numeric:tabular-nums]">
              {textoPrecio(periodo === "mes" ? precioMes : precioAnio, moneda)}{" "}
              <span className="font-[family-name:var(--font-terminal)] text-[19px] font-normal text-[var(--muted)]">{periodo === "mes" ? t.alMes : t.alAnio}</span>
            </p>
            {periodo === "anio" && ahorro > 0 && (
              <p className="font-[family-name:var(--font-terminal)] text-[17px] tracking-[0.06em] text-[var(--gold)]">
                {t.ahorras} {ahorro}%
              </p>
            )}
            {/* Estilo en línea: .boton-pixel está fuera de las capas de Tailwind y
                ganaría sobre las clases de color. */}
            <a href="#lista" className="boton-pixel mt-auto" style={{ borderColor: "var(--gold)", background: "var(--gold)", color: "#05050f" }}>
              {t.anotarme}
            </a>
          </div>
        </div>

        {c.cuposFundador > 0 && (
          <div className="flex flex-col gap-1 border-2 border-dashed border-[var(--gold)] p-4 text-center">
            <p className="font-[family-name:var(--font-pixel)] text-[10px] leading-[1.7] text-[var(--gold)]">{t.fundadorTitulo.toUpperCase()}</p>
            <p className="text-[15px] leading-[1.6] text-white">{t.fundadorTexto(c.cuposFundador, textoPrecio(precioFundador, moneda))}</p>
          </div>
        )}
      </section>

      {/* ─────────────── comparación ─────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-[22px] font-black text-white">{t.comparar}</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-1/2" />
                <th className="py-2 text-center font-[family-name:var(--font-pixel)] text-[9px] text-[var(--matrix)]">{t.gratis}</th>
                <th className="bg-[rgba(255,230,0,0.06)] py-2 text-center font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">{t.club}</th>
              </tr>
            </thead>
            {secciones.map((s) => (
              <tbody key={s.titulo}>
                <tr>
                  <th colSpan={3} className="pb-2 pt-6 font-[family-name:var(--font-terminal)] text-[15px] font-normal uppercase tracking-[0.2em] text-[var(--muted)]">
                    {s.titulo}
                  </th>
                </tr>
                {s.filas.map((f) => (
                  <tr key={f.texto} className="border-t border-[var(--color-panel-border)]">
                    <td className="py-3 pr-3">
                      <span className="font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">{f.texto}</span>
                      {f.pronto && (
                        <span className="ml-2 border border-[var(--cyan)] px-1.5 font-[family-name:var(--font-terminal)] text-[13px] tracking-[0.1em] text-[var(--cyan)]">{t.pronto}</span>
                      )}
                      {f.ayuda && <span className="mt-0.5 block text-[13px] leading-[1.4] text-[var(--muted)]">{f.ayuda}</span>}
                    </td>
                    <td className="py-3 text-center">
                      <Marca valor={f.gratis} color="var(--matrix)" />
                    </td>
                    <td className="bg-[rgba(255,230,0,0.06)] py-3 text-center">
                      <Marca valor={f.club} color="var(--gold)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      {/* ─────────────── lista de espera ─────────────── */}
      {!premium && (
        <section id="lista" className="flex scroll-mt-6 flex-col gap-4 border-2 border-[var(--gold)] bg-[rgba(13,13,34,0.9)] p-5 sm:p-7">
          <h2 className="font-[family-name:var(--font-display)] text-[22px] font-black text-white">{t.listaTitulo}</h2>
          <p className="max-w-[60ch] text-[15px] leading-[1.6] text-[var(--muted)]">{t.listaTexto}</p>

          {cargando || (usuario && anotacion === undefined) ? (
            <div className="esqueleto h-12" aria-hidden="true" />
          ) : !usuario ? (
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-[15px] text-white">{t.necesitasCuenta}</p>
              <Link href="/registro" className="boton-pixel boton-pixel-lleno">
                {t.crearCuenta}
              </Link>
              <Link href="/login" className="text-[14px] text-[var(--cyan)] underline underline-offset-4">
                {t.entrar}
              </Link>
            </div>
          ) : anotacion ? (
            <div className="flex flex-wrap items-center gap-4">
              <p role="status" className="text-[16px] font-bold text-[var(--matrix)]">
                {t.yaEstas(t.planes[anotacion.plan])}
              </p>
              <button type="button" onClick={salir} disabled={guardando} className="text-[14px] text-[var(--muted)] underline underline-offset-4 hover:text-[var(--pink)]">
                {t.salir}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <fieldset className="flex flex-wrap items-center gap-2">
                <legend className="mb-2 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.2em] text-[var(--muted)]">{t.plan}</legend>
                {(["fundador", "anual", "mensual"] as const)
                  .filter((p) => p !== "fundador" || c.cuposFundador > 0)
                  .map((p) => (
                    <button key={p} type="button" onClick={() => setPlan(p)} className={botonToggle(plan === p)} aria-pressed={plan === p}>
                      {t.planes[p].toUpperCase()} ·{" "}
                      {textoPrecio(p === "fundador" ? precioFundador : p === "anual" ? precioAnio : precioMes, moneda)}
                    </button>
                  ))}
              </fieldset>
              <button type="button" onClick={anotar} disabled={guardando || !usuario.email} className="boton-pixel boton-pixel-lleno self-start">
                {guardando ? t.anotando : t.anotarme}
              </button>
              {error && (
                <p role="alert" className="text-[14px] text-[var(--pink)]">
                  {t.error}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ─────────────── preguntas ─────────────── */}
      <section className="flex flex-col gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-[22px] font-black text-white">{t.preguntas}</h2>
        {t.faq.map(([p, r]) => (
          <details key={p} className="border-2 border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.7)] p-4">
            <summary className="cursor-pointer font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">{p}</summary>
            <p className="mt-2 text-[15px] leading-[1.6] text-[var(--muted)]">{r}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
