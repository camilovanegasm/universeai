"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import { ESTAFAS, SEGUROS, type Mensaje } from "@/lib/juegos/estafas";
import { mezclar, temblar } from "@/lib/juegos/utiles";
import type { FinJuego } from "@/components/juegos/MarcoJuego";

/**
 * Caza la estafa: llegan mensajes como en un chat, cada uno con menos
 * tiempo que el anterior. Se tocan las frases sospechosas; si el mensaje es
 * normal, se dice que no hay nada raro. Después de cada mensaje, Punti
 * muestra qué señales había y por qué.
 */

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    mensaje: "MENSAJE",
    de: "DE",
    nada: "NO VEO NADA RARO",
    listo: "LISTO",
    siguiente: "SIGUIENTE",
    terminar: "VER RESULTADO",
    combo: "COMBO",
    normal: "Era un mensaje normal: sin prisa, sin pedir plata ni claves.",
    normalMal: "Este era normal. Desconfiar está bien, pero no todo es estafa.",
    encontraste: "Encontraste",
    senales: "señales",
    teFalto: "Se te pasó",
    tiempo: "Tiempo para este mensaje",
    toca: "Toca las frases sospechosas",
  },
  en: {
    mensaje: "MESSAGE",
    de: "OF",
    nada: "LOOKS FINE TO ME",
    listo: "DONE",
    siguiente: "NEXT",
    terminar: "SEE RESULT",
    combo: "COMBO",
    normal: "That one was normal: no rush, no asking for money or passwords.",
    normalMal: "This one was normal. Being careful is good, but not everything is a scam.",
    encontraste: "You found",
    senales: "red flags",
    teFalto: "You missed",
    tiempo: "Time for this message",
    toca: "Tap the suspicious lines",
  },
};

/** Mensajes por partida: 4 estafas y 2 normales. */
const N_ESTAFAS = 4;
const N_SEGUROS = 2;
/** Segundos del primer mensaje; cada uno trae 1,5 s menos, hasta 9. */
const TIEMPO_INICIAL = 16;

type Ronda = { mensaje: Mensaje; seguro: boolean; segundos: number };

function armarRonda(): Ronda[] {
  const estafas = mezclar(ESTAFAS).slice(0, N_ESTAFAS);
  const seguros = mezclar(SEGUROS).slice(0, N_SEGUROS);
  // El primero siempre es una estafa: así se entiende de qué va el juego.
  const resto = mezclar([...estafas.slice(1).map((m) => ({ m, s: false })), ...seguros.map((m) => ({ m, s: true }))]);
  return [{ m: estafas[0], s: false }, ...resto].map((x, i) => ({
    mensaje: x.m,
    seguro: x.s,
    segundos: Math.max(9, TIEMPO_INICIAL - i * 1.5),
  }));
}

function multiplicador(combo: number) {
  return combo >= 6 ? 3 : combo >= 3 ? 2 : 1;
}

export default function CazaEstafa({ idioma, alTerminar }: { idioma: Idioma; alTerminar: (fin: FinJuego) => void }) {
  const t = TX[idioma];
  const [ronda] = useState(armarRonda);
  const totalSenales = useMemo(
    () => ronda.reduce((n, r) => n + r.mensaje.frases.filter((f) => f.senal).length, 0),
    [ronda],
  );

  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<"mensaje" | "revision">("mensaje");
  const [halladas, setHalladas] = useState<Set<number>>(new Set());
  const [fallidas, setFallidas] = useState<Set<number>>(new Set());
  const [combo, setCombo] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [totales, setTotales] = useState({ halladas: 0, errores: 0 });

  const panel = useRef<HTMLDivElement>(null);
  const siguienteRef = useRef<HTMLButtonElement>(null);
  const actual = ronda[indice];
  const senalesAqui = actual.mensaje.frases.filter((f) => f.senal).length;

  // Cierra el mensaje: suma lo encontrado y pasa a la revisión.
  const cerrarRef = useRef<() => void>(() => {});
  useEffect(() => {
    cerrarRef.current = () => {
      if (fase !== "mensaje") return;
      const errores = fallidas.size;
      if (actual.seguro && errores === 0) {
        setPuntos((p) => p + 150);
        sonar("acierto");
      }
      setTotales((x) => ({ halladas: x.halladas + halladas.size, errores: x.errores + errores }));
      setFase("revision");
    };
  });

  // El reloj de cada mensaje. La barra que se vacía es una animación CSS;
  // aquí solo se agenda el final, sin renders por cuadro.
  useEffect(() => {
    if (fase !== "mensaje") return;
    const id = setTimeout(() => cerrarRef.current(), actual.segundos * 1000);
    return () => clearTimeout(id);
  }, [fase, indice, actual.segundos]);

  useEffect(() => {
    if (fase === "revision") siguienteRef.current?.focus();
  }, [fase]);

  function tocar(i: number) {
    if (fase !== "mensaje" || halladas.has(i) || fallidas.has(i)) return;
    const frase = actual.mensaje.frases[i];
    if (frase.senal) {
      const nuevoCombo = combo + 1;
      const nuevas = new Set(halladas).add(i);
      setHalladas(nuevas);
      setCombo(nuevoCombo);
      setPuntos((p) => p + 100 * multiplicador(nuevoCombo));
      sonar(multiplicador(nuevoCombo) > multiplicador(combo) ? "combo" : "acierto");
      // Encontró todas: el mensaje se cierra solo, un instante después.
      if (nuevas.size === senalesAqui) setTimeout(() => cerrarRef.current(), 450);
    } else {
      setFallidas(new Set(fallidas).add(i));
      setCombo(0);
      sonar("error");
      temblar(panel.current);
    }
  }

  function siguiente() {
    sonar("pantalla");
    if (indice + 1 >= ronda.length) {
      const errores = totales.errores;
      const gano = totales.halladas / totalSenales >= 0.7 && errores <= 3;
      alTerminar({ gano, puntos, resumen: `${totales.halladas}/${totalSenales}` });
      return;
    }
    setIndice((i) => i + 1);
    setHalladas(new Set());
    setFallidas(new Set());
    setFase("mensaje");
  }

  const ultima = indice + 1 >= ronda.length;

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-2 whitespace-nowrap font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <span>
          {t.mensaje} {indice + 1} {t.de} {ronda.length}
        </span>
        <span className="font-[family-name:var(--font-pixel)] text-[11px] text-[var(--gold)]">{puntos}</span>
      </div>

      {/* Reloj del mensaje: se vacía con una animación CSS. */}
      <div className="h-2 w-full bg-white/10" role="presentation" aria-label={t.tiempo}>
        {fase === "mensaje" && (
          <div
            key={`${indice}`}
            className="barra-tiempo h-full bg-[var(--pink)] shadow-[0_0_8px_var(--pink)]"
            style={{ animationDuration: `${actual.segundos}s` }}
          />
        )}
      </div>

      <div ref={panel} className="border-2 border-[var(--color-panel-border)] bg-[#0a0a1e]">
        <div className="flex items-center gap-2 border-b-2 border-[var(--color-panel-border)] px-3 py-2">
          <span aria-hidden="true" className="grid h-8 w-8 place-items-center bg-[#1b2a3a] font-[family-name:var(--font-pixel)] text-[10px] text-[var(--cyan)]">
            {actual.mensaje.de[idioma].slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 truncate font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">{actual.mensaje.de[idioma]}</span>
          {combo >= 3 && fase === "mensaje" && (
            <span key={combo} className="juego-aviso ml-auto border-2 border-[var(--gold)] px-1.5 py-0.5 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--gold)]">
              {t.combo} x{multiplicador(combo)}
            </span>
          )}
        </div>

        <ul className="flex flex-col gap-2 p-3">
          {actual.mensaje.frases.map((f, i) => {
            const hallada = halladas.has(i);
            const fallida = fallidas.has(i);
            const perdida = fase === "revision" && f.senal && !hallada;
            const estilo = hallada
              ? "border-[var(--matrix)] bg-[rgba(0,255,65,0.12)] text-white"
              : fallida
                ? "border-[var(--pink)] bg-[rgba(255,0,110,0.12)] text-[var(--muted)] line-through"
                : perdida
                  ? "border-[var(--gold)] bg-[rgba(255,230,0,0.08)] text-white"
                  : "border-transparent bg-[#16233a] text-white hover:border-[var(--cyan)]";
            return (
              <li key={i} className="flex flex-col gap-1">
                <button
                  onClick={() => tocar(i)}
                  disabled={fase !== "mensaje"}
                  aria-pressed={hallada}
                  className={`w-fit max-w-full border-2 px-3 py-2 text-left text-[15.5px] leading-[1.4] transition-colors ${estilo} ${hallada ? "frase-hallada" : ""}`}
                >
                  {f.t[idioma]}
                  {hallada && <span aria-hidden="true" className="ml-2 text-[var(--matrix)]">✓</span>}
                </button>
                {fase === "revision" && f.senal && (
                  <p className={`pl-3 text-[13.5px] leading-[1.45] ${hallada ? "text-[var(--matrix)]" : "text-[var(--gold)]"}`}>
                    {hallada ? "✓ " : `${t.teFalto}: `}
                    {f.senal[idioma]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {fase === "mensaje" ? (
        <>
          <p className="text-center font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em] text-[var(--muted)]">{t.toca}</p>
          <button onClick={() => cerrarRef.current()} className="boton-pixel">
            {halladas.size > 0 ? t.listo : t.nada}
          </button>
        </>
      ) : (
        <>
          <p aria-live="polite" className="border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] p-3 text-[14.5px] leading-[1.5] text-white">
            {actual.seguro
              ? fallidas.size === 0
                ? t.normal
                : t.normalMal
              : `${t.encontraste} ${halladas.size} ${t.de.toLowerCase()} ${senalesAqui} ${t.senales}.`}
          </p>
          <button ref={siguienteRef} onClick={siguiente} className="boton-pixel boton-pixel-lleno">
            {ultima ? t.terminar : t.siguiente}
          </button>
        </>
      )}
    </div>
  );
}
