"use client";

// La Ficha de misión: el resumen visual al terminar (pedido de Cami).
// Se arma con lo que hizo el piloto: su mejor prompt, sus intentos, su frase.
// El paquete solo dice qué contar (campo `ficha`); ver FORMATO-PAQUETE.md, sección 3.
import type { Idioma } from "@/lib/i18n";
import { textoPixel } from "@/lib/i18n";
import type { BloqueDe, PaqueteMision, Pieza } from "@/lib/misiones/tipos";
import { resaltarClaves } from "@/lib/misiones/laboratorio";
import type { Escalon } from "@/lib/rangos";
import PuntiPixel from "@/components/PuntiPixel";
import type { RegistroMision } from "./tipos";

const T: Record<Idioma, Record<string, string>> = {
  es: {
    ficha: "Ficha de misión",
    completada: "Completada",
    piloto: "Piloto",
    xp: "XP ganado",
    combustible: "Combustible",
    transmisiones: "Transmisiones",
    piezas: "Piezas en tu prompt",
    aprendiste: "Lo que aprendiste",
    hiciste: "Lo que hiciste",
    mejor: "Tu mejor prompt",
    colores: "En color, las palabras que le dieron contexto a la IA.",
    palabras: "Con tus palabras",
    habilidad: "Habilidad",
    vista: "Vista",
    practicada: "Practicada",
    dominada: "Dominada",
    nivel: "Pasa a Dominada cuando la uses bien en el Repaso del día, en días distintos.",
    intento: "intento",
    intentosTxt: "intentos",
    nuevoRango: "Subiste de rango",
  },
  en: {
    ficha: "Mission card",
    completada: "Completed",
    piloto: "Pilot",
    xp: "XP earned",
    combustible: "Thrust",
    transmisiones: "Transmissions",
    piezas: "Pieces in your prompt",
    aprendiste: "What you learned",
    hiciste: "What you did",
    mejor: "Your best prompt",
    colores: "In color, the words that gave the AI context.",
    palabras: "In your own words",
    habilidad: "Skill",
    vista: "Seen",
    practicada: "Practiced",
    dominada: "Mastered",
    nivel: "It becomes Mastered when you use it well in your Daily Review, on different days.",
    intento: "try",
    intentosTxt: "tries",
    nuevoRango: "Rank up",
  },
};

const MESES: Record<Idioma, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

function Clave({ children }: { children: string }) {
  return <span className="block font-[family-name:var(--font-pixel)] text-[8px] leading-[1.8] tracking-[0.06em] text-[var(--matrix)]">{textoPixel(children)}</span>;
}

export default function FichaMision({
  paquete,
  idioma,
  registro,
  piloto,
  xp,
  combustible,
  rangoNuevo,
  mundoNombre,
}: {
  /** Nombre visible del mundo (Eco), para el código de la ficha. */
  mundoNombre?: string;
  paquete: PaqueteMision;
  idioma: Idioma;
  registro: RegistroMision;
  piloto: string;
  xp: number;
  combustible: 1 | 2 | 3;
  rangoNuevo: Escalon | null;
}) {
  const t = T[idioma];
  const f = paquete.ficha;
  const hoy = new Date();
  const fecha = `${hoy.getDate()} ${MESES[idioma][hoy.getMonth()]} ${hoy.getFullYear()}`;
  const codigo = textoPixel(`${(mundoNombre || paquete.mundo).slice(0, 3)}-${paquete.capitulo}.${String(paquete.numero).padStart(2, "0")}`);

  const labs = paquete.bloques.filter((b): b is BloqueDe<"laboratorio"> => b.tipo === "laboratorio");
  const transmisiones = Object.values(registro.labs).reduce((a, l) => a + l.intentos, 0);

  // Las piezas: se encienden las que el piloto usó, según el laboratorio que
  // las revisa (el que tiene checks con los mismos ids).
  const bloquePiezas = paquete.bloques.find((b): b is BloqueDe<"piezas"> => b.tipo === "piezas" && b.id === f.piezas);
  const piezas: Pieza[] = bloquePiezas?.piezas ?? [];
  const usada = (id: string) =>
    labs.some((l) => l.checks.some((c) => c.id === id) && registro.labs[l.id]?.checks[id] === true);
  const usadas = piezas.filter((p) => usada(p.id)).length;

  // El mejor prompt: el primer laboratorio de la lista que el piloto aprobó; si
  // no aprobó ninguno, el último que intentó.
  const orden = f.mejorPrompt ?? labs.map((l) => l.id).reverse();
  const idMejor = orden.find((id) => registro.labs[id]?.aprobado) ?? orden.find((id) => registro.labs[id]);
  const mejor = idMejor ? registro.labs[idMejor] : undefined;
  const todosLosChecks = labs.flatMap((l) => l.checks);
  const colorDe = (id: string | null) => (id ? (piezas.find((p) => p.id === id)?.color ?? "#00f5ff") : null);

  return (
    <article
      aria-label={t.ficha}
      className="relative grid gap-4 border-2 border-[var(--matrix)] p-4 sm:p-5"
      style={{
        background:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 4px), linear-gradient(160deg, #0f1a2e 0%, #0b0c1d 45%, #160a2a 100%)",
        boxShadow: "0 0 0 4px #050510, 0 0 0 6px rgba(0,255,65,0.2), 0 0 30px rgba(0,255,65,0.13)",
      }}
    >
      <header className="flex items-start justify-between gap-3 border-b border-dashed border-[rgba(0,255,65,0.35)] pb-3">
        <div className="min-w-0">
          <Clave>{`${t.ficha} · ${codigo}`}</Clave>
          <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-[20px] font-black leading-tight text-white">{paquete.titulo[idioma]}</h2>
          <p className="font-[family-name:var(--font-terminal)] text-[19px] text-[var(--cyan)]">
            {t.piloto} {piloto} · {fecha}
          </p>
        </div>
        <span
          className="mt-1 shrink-0 rotate-[8deg] border-2 border-[var(--gold)] px-1.5 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--gold)]"
          style={{ boxShadow: "inset 0 0 0 2px #050510, inset 0 0 0 3px rgba(255,230,0,0.4)" }}
        >
          {textoPixel(t.completada)}
        </span>
      </header>

      <div className="grid items-center gap-4 min-[421px]:grid-cols-[auto_minmax(0,1fr)]">
        <div className="justify-self-center">
          <PuntiPixel estado="levelup" ancho={96} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Dato valor={String(xp)} etiqueta={t.xp} />
          <Dato
            valor={
              <span className="flex gap-1" role="img" aria-label={`${combustible} / 3`}>
                {[0, 1, 2].map((k) => (
                  <i key={k} className="block h-[22px] w-[14px]" style={{ background: k < combustible ? "var(--matrix)" : "#1b1e3d", boxShadow: k < combustible ? "0 0 6px rgba(0,255,65,0.45)" : "none" }} />
                ))}
              </span>
            }
            etiqueta={`${t.combustible} ${combustible}/3`}
          />
          <Dato valor={String(transmisiones)} etiqueta={t.transmisiones} />
          {piezas.length > 0 && <Dato valor={`${usadas}/${piezas.length}`} etiqueta={t.piezas} />}
        </div>
      </div>

      {rangoNuevo && (
        <p className="border-2 px-3 py-2 text-center font-[family-name:var(--font-pixel)] text-[9px] leading-[1.7]" style={{ borderColor: rangoNuevo.color, color: rangoNuevo.color }}>
          ★ {textoPixel(t.nuevoRango)} · {textoPixel(idioma === "en" ? rangoNuevo.tituloEn : rangoNuevo.titulo)} ★
        </p>
      )}

      <section className="grid gap-2">
        <Clave>{t.aprendiste}</Clave>
        <h3 className="font-[family-name:var(--font-display)] text-[17px] font-bold text-white">{f.concepto.titulo[idioma]}</h3>
        <p className="text-[14px] leading-[1.55] text-[var(--muted)]">{f.concepto.resumen[idioma]}</p>
        {piezas.length > 0 && (
          <div className="grid grid-cols-1 gap-1.5 min-[421px]:grid-cols-2">
            {piezas.map((p) => {
              const on = usada(p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 border px-2.5 py-1.5 font-[family-name:var(--font-ui)] text-[15px] font-bold"
                  style={{ borderColor: on ? p.color : "#262a52", color: on ? "white" : "#636898", background: on ? `${p.color}1a` : "transparent" }}
                >
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0" style={{ background: on ? p.color : "#262a52", boxShadow: on ? `0 0 6px ${p.color}` : "none" }} />
                  {p.titulo[idioma]}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-2">
        <Clave>{t.hiciste}</Clave>
        <ul className="grid gap-1.5">
          {f.logros.map((l) => {
            const lab = registro.labs[l.bloque];
            const ok = !registro.conAyuda.includes(l.bloque) && (lab ? lab.aprobado : true);
            const extra = lab ? ` (${lab.intentos} ${lab.intentos === 1 ? t.intento : t.intentosTxt})` : "";
            return (
              <li key={l.bloque} className="grid grid-cols-[20px_minmax(0,1fr)] gap-2 text-[14px]" style={{ color: ok ? "white" : "#636898" }}>
                <span aria-hidden="true" className="font-bold" style={{ color: ok ? "var(--matrix)" : "#636898" }}>
                  {ok ? "✓" : "·"}
                </span>
                {l.texto[idioma]}
                {extra}
              </li>
            );
          })}
        </ul>
      </section>

      {mejor && (
        <section className="grid gap-2">
          <Clave>{t.mejor}</Clave>
          <blockquote className="whitespace-pre-wrap break-words border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2.5 font-[family-name:var(--font-terminal)] text-[20px] leading-[1.25] text-[#b9ffcb]">
            {resaltarClaves(mejor.prompt, todosLosChecks, idioma).map((tr, i) => {
              const c = colorDe(tr.pieza);
              return c ? (
                <mark key={i} style={{ background: `${c}38`, color: "white", borderBottom: `2px solid ${c}` }}>
                  {tr.texto}
                </mark>
              ) : (
                <span key={i}>{tr.texto}</span>
              );
            })}
          </blockquote>
          <p className="text-[12px] text-[#636898]">{t.colores}</p>
        </section>
      )}

      {registro.frase && (
        <section className="grid gap-2">
          <Clave>{t.palabras}</Clave>
          <blockquote className="break-words border-l-[3px] border-[var(--gold)] pl-3 text-[16px] italic text-white">“{registro.frase}”</blockquote>
        </section>
      )}

      <section className="grid gap-2 border border-[rgba(180,0,255,0.45)] bg-[rgba(180,0,255,0.07)] p-3">
        <span className="block font-[family-name:var(--font-pixel)] text-[8px] leading-[1.8] text-[#d88bff]">{textoPixel(t.habilidad)}</span>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-[family-name:var(--font-ui)] text-[18px] font-bold text-white">{f.habilidad.titulo[idioma]}</span>
          <span className="flex gap-1">
            {[t.vista, t.practicada, t.dominada].map((n, k) => (
              <span
                key={n}
                className="border px-1.5 py-1 font-[family-name:var(--font-ui)] text-[11px] font-bold uppercase tracking-[0.08em]"
                style={k <= 1 ? { borderColor: "#d88bff", color: "#f0d6ff", background: "rgba(180,0,255,0.2)" } : { borderColor: "#3a2b5c", color: "#636898" }}
              >
                {n}
              </span>
            ))}
          </span>
        </div>
        <p className="text-[12px] text-[#636898]">{t.nivel}</p>
      </section>
    </article>
  );
}

function Dato({ valor, etiqueta }: { valor: React.ReactNode; etiqueta: string }) {
  return (
    <div className="border border-[#262a52] bg-[rgba(5,5,16,0.8)] px-2.5 py-2">
      <div className="flex min-h-8 items-center font-[family-name:var(--font-terminal)] text-[32px] leading-none text-[var(--gold)] tabular-nums">{valor}</div>
      <div className="font-[family-name:var(--font-ui)] text-[13px] font-semibold leading-tight text-[var(--muted)]">{etiqueta}</div>
    </div>
  );
}
