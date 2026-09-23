"use client";

import { useEffect, useRef, useState } from "react";
import type { Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import { claveDelDia, colorear, numeroDelDia, palabraDelDia, type Color } from "@/lib/juegos/palabras";
import { compartirTexto, temblar } from "@/lib/juegos/utiles";
import { guardarJson, leerJson } from "@/lib/juegos/records";
import type { FinJuego } from "@/components/juegos/MarcoJuego";

/**
 * Palabra IA del día: un Wordle con palabras de IA. Una palabra por día (la
 * misma para todos en cada idioma), 6 intentos, y un resultado de cuadritos
 * para compartir. Los intentos del día se guardan en el navegador, así que
 * recargar la página no regala otra partida.
 */

const INTENTOS = 6;

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    pista: "Pista",
    letras: "letras",
    faltan: "Faltan letras",
    enviar: "ENVIAR",
    borrar: "Borrar",
    yaJugaste: "Ya jugaste la palabra de hoy.",
    manana: "Vuelve mañana por una nueva.",
    compartir: "COMPARTIR RESULTADO",
    copiado: "Copiado. Pégalo donde quieras.",
    compartido: "¡Listo!",
    error: "No se pudo compartir.",
    era: "La palabra era",
    tablero: "Tablero de la palabra del día",
  },
  en: {
    pista: "Hint",
    letras: "letters",
    faltan: "Not enough letters",
    enviar: "ENTER",
    borrar: "Delete",
    yaJugaste: "You already played today's word.",
    manana: "Come back tomorrow for a new one.",
    compartir: "SHARE RESULT",
    copiado: "Copied. Paste it anywhere.",
    compartido: "Done!",
    error: "Couldn't share.",
    era: "The word was",
    tablero: "Word of the day board",
  },
};

const TECLAS: Record<Idioma, string[]> = {
  es: ["QWERTYUIOP", "ASDFGHJKLÑ", "ZXCVBNM"],
  en: ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"],
};

const COLOR_CELDA: Record<Color, string> = {
  verde: "border-[var(--matrix)] bg-[var(--matrix)] text-[#05050f]",
  amarillo: "border-[var(--gold)] bg-[var(--gold)] text-[#05050f]",
  gris: "border-[#2b3350] bg-[#2b3350] text-[#c9d6e8]",
};
const EMOJI: Record<Color, string> = { verde: "🟩", amarillo: "🟨", gris: "⬛" };

type Guardado = { intentos: string[] };

export function textoParaCompartir(idioma: Idioma, numero: number, intentos: string[], palabra: string): string {
  const gano = intentos[intentos.length - 1] === palabra;
  const filas = intentos.map((x) => colorear(x, palabra).map((c) => EMOJI[c]).join("")).join("\n");
  const titulo = idioma === "es" ? "Punti · Palabra IA" : "Punti · AI Word";
  return `${titulo} #${numero} · ${gano ? intentos.length : "X"}/${INTENTOS}\n${filas}\npunti.space`;
}

export default function PalabraDelDia({ idioma, alTerminar }: { idioma: Idioma; alTerminar: (fin: FinJuego) => void }) {
  const t = TX[idioma];
  const [numero] = useState(() => numeroDelDia());
  const dia = palabraDelDia(idioma, numero);
  const palabra = dia.palabra;
  const clave = claveDelDia(idioma, numero);

  const [intentos, setIntentos] = useState<string[]>(() => leerJson<Guardado>(clave)?.intentos ?? []);
  const [actual, setActual] = useState("");
  const [aviso, setAviso] = useState("");
  const [yaTerminada] = useState(() => {
    const previos = leerJson<Guardado>(clave)?.intentos ?? [];
    return previos.includes(palabra) || previos.length >= INTENTOS;
  });
  const filaRef = useRef<HTMLDivElement>(null);

  const gano = intentos.includes(palabra);
  const termino = gano || intentos.length >= INTENTOS;

  // Estado de cada letra para el teclado: el mejor color que ha tenido.
  const estadoLetra: Record<string, Color> = {};
  for (const x of intentos) {
    colorear(x, palabra).forEach((c, i) => {
      const l = x[i];
      const previo = estadoLetra[l];
      if (c === "verde" || (c === "amarillo" && previo !== "verde") || !previo) estadoLetra[l] = c;
    });
  }

  const enviarRef = useRef<() => void>(() => {});
  const teclaRef = useRef<(l: string) => void>(() => {});
  const borrarRef = useRef<() => void>(() => {});

  useEffect(() => {
    teclaRef.current = (l: string) => {
      if (termino) return;
      setAviso("");
      setActual((a) => (a.length < palabra.length ? a + l : a));
      sonar("toque");
    };
    borrarRef.current = () => {
      if (termino) return;
      setActual((a) => a.slice(0, -1));
    };
    enviarRef.current = () => {
      if (termino) return;
      if (actual.length !== palabra.length) {
        setAviso(t.faltan);
        sonar("error");
        temblar(filaRef.current);
        return;
      }
      const nuevos = [...intentos, actual];
      setIntentos(nuevos);
      setActual("");
      guardarJson(clave, { intentos: nuevos } satisfies Guardado);
      const acerto = actual === palabra;
      if (acerto || nuevos.length >= INTENTOS) {
        sonar(acerto ? "completa" : "sinGasolina");
        // Deja ver cómo se voltean las letras antes de pasar al resultado.
        setTimeout(
          () =>
            alTerminar({
              gano: acerto,
              puntos: acerto ? INTENTOS + 1 - nuevos.length : 0,
              resumen: `${acerto ? nuevos.length : "X"}/${INTENTOS}`,
              nota: `${acerto ? "" : `${t.era} ${dia.escrita ?? palabra}. `}${dia.explica}`,
              compartir: textoParaCompartir(idioma, numero, nuevos, palabra),
            }),
          1500,
        );
      } else {
        sonar("pantalla");
      }
    };
  });

  // Teclado físico.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") {
        e.preventDefault();
        enviarRef.current();
      } else if (e.key === "Backspace") {
        borrarRef.current();
      } else {
        const l = e.key.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
        if (/^[A-Z]$/.test(l) || (idioma === "es" && e.key.toUpperCase() === "Ñ")) teclaRef.current(e.key.toUpperCase() === "Ñ" ? "Ñ" : l);
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [idioma]);

  async function compartir() {
    const r = await compartirTexto(textoParaCompartir(idioma, numero, intentos, palabra));
    if (r !== "cancelado") setAviso(t[r]);
  }

  const n = palabra.length;
  // Celdas más chicas si la palabra es larga: 8 letras caben en 320 px.
  const lado = n >= 8 ? "h-9 w-9 text-[13px]" : n >= 7 ? "h-10 w-10 text-[14px]" : "h-12 w-12 text-[16px]";

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <p className="w-full border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] px-3 py-2 text-[14.5px] leading-[1.45] text-white">
        <span className="font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em] text-[var(--gold)]">
          {t.pista} · {n} {t.letras}:
        </span>{" "}
        {dia.pista}
      </p>

      <div role="grid" aria-label={t.tablero} className="flex flex-col gap-1.5">
        {Array.from({ length: INTENTOS }, (_, fila) => {
          const hecho = intentos[fila];
          const colores = hecho ? colorear(hecho, palabra) : null;
          const texto = hecho ?? (fila === intentos.length ? actual : "");
          return (
            <div key={fila} role="row" ref={fila === intentos.length ? filaRef : undefined} className="flex gap-1.5">
              {Array.from({ length: n }, (_, i) => {
                const l = texto[i] ?? "";
                return (
                  <span
                    key={i}
                    role="gridcell"
                    className={`grid place-items-center border-2 font-[family-name:var(--font-pixel)] ${lado} ${
                      colores ? `celda-gira ${COLOR_CELDA[colores[i]]}` : l ? "border-[var(--cyan)] text-white" : "border-[#2b3350] text-white"
                    }`}
                    style={colores ? { animationDelay: `${i * 90}ms` } : undefined}
                  >
                    {l}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <p aria-live="polite" className="min-h-[22px] font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.1em] text-[var(--pink)]">
        {aviso}
      </p>

      {yaTerminada ? (
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <p className="text-[15px] text-white">
            {t.yaJugaste} {t.manana}
          </p>
          {!gano && (
            <p className="text-[14px] text-[var(--muted)]">
              {t.era} <b className="text-white">{dia.escrita ?? palabra}</b>.
            </p>
          )}
          <p className="text-[14px] leading-[1.5] text-[var(--muted)]">{dia.explica}</p>
          <button onClick={compartir} className="boton-pixel boton-pixel-oro">
            {t.compartir}
          </button>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-1.5" aria-hidden={termino}>
          {TECLAS[idioma].map((fila, f) => (
            <div key={fila} className="flex w-full justify-center gap-1">
              {f === 2 && (
                <button onClick={() => enviarRef.current()} className="h-12 min-w-[52px] border-2 border-[var(--matrix)] px-1.5 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--matrix)]">
                  {t.enviar}
                </button>
              )}
              {fila.split("").map((l) => {
                const e = estadoLetra[l];
                return (
                  <button
                    key={l}
                    onClick={() => teclaRef.current(l)}
                    className={`h-12 min-w-0 flex-1 max-w-[38px] border-2 font-[family-name:var(--font-pixel)] text-[11px] ${
                      e ? COLOR_CELDA[e] : "border-[var(--color-panel-border)] bg-[#0b0b1d] text-white"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
              {f === 2 && (
                <button onClick={() => borrarRef.current()} aria-label={t.borrar} className="h-12 min-w-[46px] border-2 border-[var(--color-panel-border)] px-1.5 font-[family-name:var(--font-pixel)] text-[11px] text-white">
                  ⌫
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
