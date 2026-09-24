"use client";

// Los bloques de una misión, uno por tipo. La ficha de cada uno (para qué
// sirve, sus campos, cómo habla Punti) está en contenido/misiones/FORMATO-PAQUETE.md.
//
// Todos los textos se muestran como texto: nada de HTML que venga del
// paquete (práctica obligatoria de seguridad). Los enlaces de Fuente y Debate
// solo se aceptan si empiezan por https:// (lo revisa revisar.mjs).
import { useState } from "react";
import type { Idioma } from "@/lib/i18n";
import { textoPixel } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import type { BloqueDe, GraficoMision, Texto } from "@/lib/misiones/tipos";
import type { Grafico } from "@/lib/lecciones";
import GraficoExplicacion from "@/components/GraficoExplicacion";
import Laboratorio from "./Laboratorio";
import { Etiqueta, Prompt, Salida, Tarjeta } from "./Base";
import type { PropsBloque } from "./tipos";

const T: Record<Idioma, Record<string, string>> = {
  es: {
    antes: "Antes",
    despues: "Después · con contexto",
    iaRespondio: "La IA respondió",
    mostrar: "Mostrar qué cambió",
    pieza: "Pieza",
    promptDe: "El prompt de Punti",
    guardar: "Guardar en mi bitácora",
    bitacora: "Bitácora de",
    frase: "Con tus palabras, en una o dos frases",
    fraseCorta: "Escribe al menos una frase completa. Es para ti, no para mí.",
    concepto: "Concepto",
    tu: "Tú",
    misPrompts: "Mis prompts",
    votar: "Mi postura",
    fuente: "Fuente",
    abrir: "Abrir la fuente",
    revisado: "Revisado el",
    vivo: "Pantalla viva: estos datos cambian rápido",
    pegar: "Pega aquí lo que te respondió (opcional)",
  },
  en: {
    antes: "Before",
    despues: "After · with context",
    iaRespondio: "The AI replied",
    mostrar: "Show what changed",
    pieza: "Piece",
    promptDe: "Punti's prompt",
    guardar: "Save to my logbook",
    bitacora: "Logbook of",
    frase: "In your own words, one or two sentences",
    fraseCorta: "Write at least one full sentence. It's for you, not for me.",
    concepto: "Concept",
    tu: "You",
    misPrompts: "My prompts",
    votar: "My stance",
    fuente: "Source",
    abrir: "Open the source",
    revisado: "Checked on",
    vivo: "Live screen: this data changes fast",
    pegar: "Paste what it replied here (optional)",
  },
};

const tx = (t: Texto | undefined, idioma: Idioma) => (t ? t[idioma] : "");

function aGrafico(g: GraficoMision, idioma: Idioma): Grafico {
  if (g.tipo === "tabla") {
    return {
      tipo: "tabla",
      encabezados: [g.encabezados.a[idioma], g.encabezados.b[idioma]],
      filas: g.filas.map((f) => [f.a[idioma], f.b[idioma]] as [string, string]),
    };
  }
  return { tipo: "flujo", pasos: g.pasos.map((p) => p[idioma]) };
}

/* ------------------------------------------------------------ inicio */

function Inicio({ bloque, idioma }: PropsBloque<BloqueDe<"inicio">>) {
  return <p className="text-[15px] leading-[1.6] text-[var(--muted)]">{tx(bloque.texto, idioma)}</p>;
}

/* ------------------------------------------------------- transmisión */

function Transmision({ bloque, idioma }: PropsBloque<BloqueDe<"transmision">>) {
  return (
    <div className="grid gap-4">
      <p className="font-[family-name:var(--font-terminal)] text-[21px] leading-snug text-[var(--cyan)]">{tx(bloque.texto, idioma)}</p>
      {bloque.grafico && <GraficoExplicacion grafico={aGrafico(bloque.grafico, idioma)} idioma={idioma} />}
    </div>
  );
}

/* ---------------------------------------------------- antes / después */

function AntesDespues({ bloque, idioma, piezas, decir, completar }: PropsBloque<BloqueDe<"antes-despues">>) {
  const t = T[idioma];
  const [visto, setVisto] = useState(false);
  const usadas = [...new Set(bloque.despues.partes.map((p) => p.pieza))];

  return (
    <div className="grid gap-4">
      <Tarjeta>
        <Etiqueta color="var(--pink)">{t.antes}</Etiqueta>
        <Prompt>{tx(bloque.antes.prompt, idioma)}</Prompt>
        <Etiqueta>{t.iaRespondio}</Etiqueta>
        <Salida texto={tx(bloque.antes.salida, idioma)} />
      </Tarjeta>

      <Tarjeta>
        <Etiqueta color="var(--matrix)">{t.despues}</Etiqueta>
        <Prompt>
          {bloque.despues.partes.map((p, i) => {
            const color = piezas[p.pieza]?.color ?? "var(--cyan)";
            return (
              <mark
                key={i}
                className="text-inherit transition-colors duration-200"
                style={{
                  color: "inherit",
                  borderBottom: `2px solid ${color}`,
                  background: visto ? `${color}38` : "transparent",
                }}
              >
                {tx(p.texto, idioma)}
              </mark>
            );
          })}
        </Prompt>
        <Etiqueta>{t.iaRespondio}</Etiqueta>
        <Salida texto={tx(bloque.despues.salida, idioma)} cartel={bloque.despues.salidaTipo === "cartel"} />
        {visto && (
          <div className="flex flex-wrap gap-1.5">
            {usadas.map((id) => (
              <span
                key={id}
                className="border px-2 py-0.5 font-[family-name:var(--font-ui)] text-[13px] font-bold"
                style={{ borderColor: piezas[id]?.color, color: piezas[id]?.color }}
              >
                {tx(piezas[id]?.titulo, idioma) || id}
              </span>
            ))}
          </div>
        )}
      </Tarjeta>

      {!visto && (
        <button
          type="button"
          className="boton-pixel"
          style={{ borderColor: "var(--cyan)", color: "var(--cyan)", background: "transparent" }}
          onClick={() => {
            setVisto(true);
            sonar("acierto");
            decir(bloque.revelar);
            completar();
          }}
        >
          {textoPixel(t.mostrar)}
        </button>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- piezas */

function Piezas({ bloque, idioma, decir, completar }: PropsBloque<BloqueDe<"piezas">>) {
  const t = T[idioma];
  const [vistas, setVistas] = useState<string[]>([]);
  return (
    <div className="grid grid-cols-1 gap-2.5 min-[421px]:grid-cols-2">
      {bloque.piezas.map((p, k) => {
        const vista = vistas.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            className="grid content-start gap-1 border-2 bg-[rgba(10,10,30,0.88)] p-3 text-left transition-colors"
            style={{ borderColor: vista ? p.color : "var(--color-panel-border)" }}
            onClick={() => {
              sonar("toque");
              decir({ estado: "info", texto: p.ejemplo });
              const nuevas = vista ? vistas : [...vistas, p.id];
              setVistas(nuevas);
              if (nuevas.length === bloque.piezas.length) completar();
            }}
          >
            <span className="font-[family-name:var(--font-pixel)] text-[8px]" style={{ color: p.color }}>
              {textoPixel(`${t.pieza} ${k + 1}`)}
            </span>
            <span className="font-[family-name:var(--font-ui)] text-[17px] font-bold leading-tight text-white">{tx(p.titulo, idioma)}</span>
            <span className="text-[13px] leading-snug text-[var(--muted)]">{tx(p.descripcion, idioma)}</span>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------- clasificar */

function Clasificar({ bloque, idioma, piezas, decir, completar, fallar }: PropsBloque<BloqueDe<"clasificar">>) {
  const grupos = bloque.grupos.map((g) =>
    typeof g === "string" ? { id: g, titulo: piezas[g]?.titulo ?? { es: g, en: g } } : g,
  );
  const [bien, setBien] = useState<Record<number, string>>({});
  const [mal, setMal] = useState<Record<number, string[]>>({});

  function elegir(i: number, grupo: string) {
    if (bien[i]) return;
    const item = bloque.items[i];
    if (grupo === item.grupo) {
      const nuevos = { ...bien, [i]: grupo };
      setBien(nuevos);
      sonar("acierto");
      if (Object.keys(nuevos).length === bloque.items.length) {
        decir(bloque.bien);
        completar();
      } else {
        decir({ estado: "hype", texto: { es: "Eso es.", en: "That's it." } });
      }
    } else {
      setMal({ ...mal, [i]: [...(mal[i] ?? []), grupo] });
      sonar("error");
      fallar();
      decir(bloque.malPorGrupo?.[item.grupo] ?? bloque.malPorGrupo?.[grupo] ?? bloque.mal);
    }
  }

  return (
    <div className="grid gap-2.5">
      {bloque.items.map((item, i) => (
        <Tarjeta key={i} borde={bien[i] ? "var(--matrix)" : undefined}>
          <p className="font-medium text-white">{tx(item.texto, idioma)}</p>
          <div className="flex flex-wrap gap-1.5">
            {grupos.map((g) => {
              const esBien = bien[i] === g.id;
              const esMal = mal[i]?.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  disabled={Boolean(bien[i])}
                  onClick={() => elegir(i, g.id)}
                  className="border px-2.5 py-1.5 font-[family-name:var(--font-ui)] text-[13px] font-bold transition-colors disabled:cursor-default"
                  style={{
                    borderColor: esBien ? "var(--matrix)" : esMal ? "var(--pink)" : "var(--color-panel-border)",
                    color: esBien ? "var(--matrix)" : esMal ? "var(--pink)" : "var(--muted)",
                    background: esBien ? "rgba(0,255,65,0.1)" : "transparent",
                  }}
                >
                  {tx(g.titulo, idioma)}
                </button>
              );
            })}
          </div>
        </Tarjeta>
      ))}
    </div>
  );
}

/* ------------------------------------------------ Punti se equivocó */

function PuntiSeEquivoco({ bloque, idioma, decir, completar, fallar }: PropsBloque<BloqueDe<"punti-se-equivoco">>) {
  const t = T[idioma];
  const [sel, setSel] = useState<number[]>([]);
  const [listo, setListo] = useState(false);

  function tocar(k: number) {
    if (listo) return;
    sonar("toque");
    const nueva = sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k];
    setSel(nueva);
    if (nueva.length < bloque.malos.length) return;
    const acerto = bloque.malos.every((m) => nueva.includes(m));
    if (acerto) {
      setListo(true);
      sonar("acierto");
      decir(bloque.explicacion);
      completar();
    } else {
      sonar("error");
      fallar();
      decir(bloque.mal);
      setSel([]);
    }
  }

  return (
    <Tarjeta>
      <Etiqueta>{t.promptDe}</Etiqueta>
      <div className="flex flex-wrap gap-1.5">
        {bloque.trozos.map((tr, k) => {
          const elegido = sel.includes(k);
          const malo = listo && bloque.malos.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => tocar(k)}
              aria-pressed={elegido}
              className="border bg-[#030a06] px-2 py-1.5 text-left font-[family-name:var(--font-terminal)] text-[20px] leading-[1.15]"
              style={{
                borderStyle: elegido || malo ? "solid" : "dashed",
                borderColor: malo ? "var(--matrix)" : elegido ? "var(--gold)" : "rgba(0,255,65,0.3)",
                color: malo ? "var(--matrix)" : elegido ? "var(--gold)" : "#b9ffcb",
              }}
            >
              {tx(tr, idioma)}
            </button>
          );
        })}
      </div>
    </Tarjeta>
  );
}

/* ------------------------------------------------- nota a la bitácora */

function NotaBitacora({ bloque, idioma, registro, piloto, decir, completar, guardarFrase }: PropsBloque<BloqueDe<"nota-bitacora">>) {
  const t = T[idioma];
  const [frase, setFrase] = useState(registro.frase);
  const [guardada, setGuardada] = useState(Boolean(registro.frase));
  const prompt = bloque.guardaPrompt ? registro.labs[bloque.guardaPrompt]?.prompt : "";

  return (
    <Tarjeta borde="rgba(255,230,0,0.4)">
      <Etiqueta color="var(--gold)">{`${t.bitacora} ${piloto}`}</Etiqueta>
      <label htmlFor={`frase-${bloque.id}`} className="font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">
        {tx(bloque.pregunta, idioma)}
      </label>
      <textarea
        id={`frase-${bloque.id}`}
        value={frase}
        disabled={guardada}
        maxLength={280}
        rows={3}
        placeholder={t.frase}
        onChange={(e) => setFrase(e.target.value)}
        className="w-full resize-y border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2.5 font-[family-name:var(--font-terminal)] text-[20px] leading-[1.2] text-[#d9ffe3] placeholder:text-[#3f6b4c] disabled:opacity-70"
      />
      {!guardada ? (
        <button
          type="button"
          className="boton-pixel boton-pixel-oro"
          onClick={() => {
            const limpia = frase.trim();
            if (limpia.length < 10) {
              decir({ estado: "info", texto: { es: T.es.fraseCorta, en: T.en.fraseCorta } });
              return;
            }
            setGuardada(true);
            guardarFrase(limpia);
            sonar("acierto");
            decir(bloque.bien);
            completar();
          }}
        >
          {textoPixel(t.guardar)}
        </button>
      ) : (
        <div className="grid gap-2.5">
          <div className="grid gap-1.5 border border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.8)] p-3">
            <Etiqueta color="var(--gold)">{`${t.concepto} · ${bloque.concepto}`}</Etiqueta>
            <p className="text-[14px] text-[var(--muted)]">Punti: {tx(bloque.definicion, idioma)}</p>
            <p className="text-[14px] italic text-white">
              {t.tu}: {frase.trim()}
            </p>
          </div>
          {prompt && (
            <div className="grid gap-1.5 border border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.8)] p-3">
              <Etiqueta color="var(--gold)">{`${t.misPrompts} · ${tx(bloque.etiqueta, idioma)}`}</Etiqueta>
              <p className="whitespace-pre-wrap break-words text-[14px] italic text-white">{prompt}</p>
            </div>
          )}
        </div>
      )}
    </Tarjeta>
  );
}

/* -------------------------------------------------- punto de control */

function PuntoControl({ bloque, idioma, decir, completar, fallar }: PropsBloque<BloqueDe<"punto-control">>) {
  const [bien, setBien] = useState<Record<number, number>>({});
  const [mal, setMal] = useState<Record<number, number[]>>({});

  return (
    <div className="grid gap-3">
      {bloque.preguntas.map((q, i) => (
        <Tarjeta key={i}>
          <p className="font-medium text-white">{tx(q.pregunta, idioma)}</p>
          <div className="grid gap-2">
            {q.opciones.map((op, k) => {
              const esBien = bien[i] === k;
              const esMal = mal[i]?.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  disabled={bien[i] !== undefined}
                  onClick={() => {
                    if (k === q.correcta) {
                      const nuevos = { ...bien, [i]: k };
                      setBien(nuevos);
                      sonar("acierto");
                      decir(q.bien);
                      if (Object.keys(nuevos).length === bloque.preguntas.length) completar();
                    } else {
                      setMal({ ...mal, [i]: [...(mal[i] ?? []), k] });
                      sonar("error");
                      fallar();
                      decir(q.mal);
                    }
                  }}
                  className={`border-2 px-3.5 py-3 text-left text-[15px] transition-colors disabled:cursor-default ${
                    esMal ? "line-through decoration-[var(--pink)]" : ""
                  }`}
                  style={{
                    borderColor: esBien ? "var(--matrix)" : esMal ? "var(--pink)" : "var(--color-panel-border)",
                    background: esBien ? "rgba(0,255,65,0.08)" : esMal ? "rgba(255,0,110,0.08)" : "rgba(10,10,30,0.88)",
                    color: "white",
                  }}
                >
                  {tx(op, idioma)}
                </button>
              );
            })}
          </div>
        </Tarjeta>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- caso */

function Caso({ bloque, idioma, decir, completar }: PropsBloque<BloqueDe<"caso">>) {
  const [vistas, setVistas] = useState<number[]>([]);
  const [listo, setListo] = useState(false);
  return (
    <div className="grid gap-3">
      <Tarjeta>
        <p className="text-[15px] leading-[1.6] text-white">{tx(bloque.escena, idioma)}</p>
      </Tarjeta>
      {bloque.opciones.map((o, k) => {
        const vista = vistas.includes(k);
        return (
          <div key={k} className="grid gap-2">
            <button
              type="button"
              disabled={listo}
              onClick={() => {
                if (!vista) setVistas([...vistas, k]);
                if (o.buena) {
                  setListo(true);
                  sonar("acierto");
                  decir(bloque.leccion);
                  completar();
                } else {
                  sonar("toque");
                  decir({ estado: "info", texto: o.consecuencia });
                }
              }}
              className="border-2 px-3.5 py-3 text-left text-[15px] text-white transition-colors disabled:cursor-default"
              style={{
                borderColor: vista ? (o.buena ? "var(--matrix)" : "var(--pink)") : "var(--color-panel-border)",
                background: "rgba(10,10,30,0.88)",
              }}
            >
              {tx(o.texto, idioma)}
            </button>
            {vista && <p className="border-l-2 border-[var(--color-panel-border)] pl-3 text-[14px] text-[var(--muted)]">{tx(o.consecuencia, idioma)}</p>}
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- debate */

function Debate({ bloque, idioma, decir, completar }: PropsBloque<BloqueDe<"debate">>) {
  const t = T[idioma];
  const [voto, setVoto] = useState<number | null>(null);
  return (
    <div className="grid gap-3">
      <p className="font-[family-name:var(--font-ui)] text-[18px] font-bold text-white">{tx(bloque.pregunta, idioma)}</p>
      {bloque.posturas.map((p, k) => (
        <Tarjeta key={k} borde={voto === k ? "var(--cyan)" : undefined}>
          <p className="font-[family-name:var(--font-ui)] text-[17px] font-bold text-white">{tx(p.titulo, idioma)}</p>
          <p className="text-[14px] leading-[1.55] text-[var(--muted)]">{tx(p.argumento, idioma)}</p>
          {/^https:\/\//.test(p.fuente) && (
            <a href={p.fuente} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--cyan)] underline">
              {t.fuente}
            </a>
          )}
          <button
            type="button"
            disabled={voto !== null}
            onClick={() => {
              setVoto(k);
              sonar("acierto");
              decir(bloque.cierre);
              completar();
            }}
            className="boton-pixel justify-self-start disabled:opacity-60"
          >
            {textoPixel(t.votar)}
          </button>
        </Tarjeta>
      ))}
    </div>
  );
}

/* ------------------------------------------------------ reto en tu IA */

function RetoIa({ bloque, idioma, completar }: PropsBloque<BloqueDe<"reto-ia">>) {
  const t = T[idioma];
  const [hechos, setHechos] = useState<number[]>([]);
  const [pegado, setPegado] = useState("");
  return (
    <Tarjeta>
      <p className="text-[15px] leading-[1.6] text-white">{tx(bloque.instruccion, idioma)}</p>
      <ul className="grid gap-1.5">
        {bloque.checks.map((c, k) => {
          const hecho = hechos.includes(k);
          return (
            <li key={k}>
              <button
                type="button"
                aria-pressed={hecho}
                onClick={() => {
                  const nuevos = hecho ? hechos.filter((x) => x !== k) : [...hechos, k];
                  setHechos(nuevos);
                  sonar("toque");
                  if (nuevos.length === bloque.checks.length) completar();
                }}
                className="flex w-full items-start gap-2 text-left font-[family-name:var(--font-ui)] text-[16px] font-semibold"
                style={{ color: hecho ? "white" : "var(--muted)" }}
              >
                <span aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 border-2" style={{ borderColor: hecho ? "var(--matrix)" : "var(--muted)", background: hecho ? "var(--matrix)" : "transparent" }} />
                {tx(c, idioma)}
              </button>
            </li>
          );
        })}
      </ul>
      {bloque.pegar && (
        <textarea
          value={pegado}
          maxLength={2000}
          rows={3}
          onChange={(e) => setPegado(e.target.value)}
          placeholder={t.pegar}
          className="w-full resize-y border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2 text-[14px] text-[#d9ffe3]"
        />
      )}
    </Tarjeta>
  );
}

/* ----------------------------------------------------------- fuente */

function Fuente({ bloque, idioma }: PropsBloque<BloqueDe<"fuente">>) {
  const t = T[idioma];
  const valida = /^https:\/\//.test(bloque.url);
  return (
    <Tarjeta borde="var(--cyan)">
      <Etiqueta color="var(--cyan)">{`${t.fuente} · ${bloque.fecha}`}</Etiqueta>
      <p className="text-[15px] leading-[1.6] text-white">{tx(bloque.porQue, idioma)}</p>
      {valida && (
        <a href={bloque.url} target="_blank" rel="noopener noreferrer" className="boton-pixel justify-self-start" style={{ borderColor: "var(--cyan)", color: "var(--cyan)" }}>
          {textoPixel(t.abrir)}
        </a>
      )}
    </Tarjeta>
  );
}

/* ---------------------------------------------------- pantalla viva */

function PantallaViva({ bloque, idioma }: PropsBloque<BloqueDe<"pantalla-viva">>) {
  const t = T[idioma];
  return (
    <Tarjeta borde="var(--gold)">
      <Etiqueta color="var(--gold)">{t.vivo}</Etiqueta>
      <p className="font-[family-name:var(--font-terminal)] text-[20px] leading-snug text-[var(--cyan)]">{tx(bloque.texto, idioma)}</p>
      {bloque.tabla && <GraficoExplicacion grafico={aGrafico(bloque.tabla, idioma)} idioma={idioma} />}
      <p className="text-[12px] text-[var(--muted)]">
        {t.revisado} {bloque.revisado}
      </p>
    </Tarjeta>
  );
}

/* ------------------------------------------------------ despachador */

/** Bloques que no piden nada: Continuar queda activo apenas se abren. */
export const BLOQUES_PASIVOS = new Set(["inicio", "transmision", "fuente", "pantalla-viva"]);

export default function BloqueMision(props: PropsBloque) {
  const { bloque } = props;
  switch (bloque.tipo) {
    case "inicio": return <Inicio {...props} bloque={bloque} />;
    case "transmision": return <Transmision {...props} bloque={bloque} />;
    case "antes-despues": return <AntesDespues {...props} bloque={bloque} />;
    case "piezas": return <Piezas {...props} bloque={bloque} />;
    case "clasificar": return <Clasificar {...props} bloque={bloque} />;
    case "laboratorio": return <Laboratorio {...props} bloque={bloque} />;
    case "punti-se-equivoco": return <PuntiSeEquivoco {...props} bloque={bloque} />;
    case "nota-bitacora": return <NotaBitacora {...props} bloque={bloque} />;
    case "punto-control": return <PuntoControl {...props} bloque={bloque} />;
    case "caso": return <Caso {...props} bloque={bloque} />;
    case "debate": return <Debate {...props} bloque={bloque} />;
    case "reto-ia": return <RetoIa {...props} bloque={bloque} />;
    case "fuente": return <Fuente {...props} bloque={bloque} />;
    case "pantalla-viva": return <PantallaViva {...props} bloque={bloque} />;
  }
}
