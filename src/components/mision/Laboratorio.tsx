"use client";

// El Laboratorio: el piloto escribe un prompt, lo "transmite" y ve qué pasa.
//
// Hoy en MODO SIMULADO (palabras clave y respuestas de ejemplo del paquete).
// La fase C1.3 lo conecta a la IA en vivo desde el servidor; este modo queda
// de respaldo para cuando se alcance el tope de gasto o no haya conexión.
//
// Transmitir NO gasta gasolina: el Laboratorio es para practicar y equivocarse.
// Después de `maxIntentos` se deja seguir aunque no pase, para que nadie se
// quede atascado (y en la ficha ese logro no se marca).
import { useEffect, useRef, useState } from "react";
import type { Idioma } from "@/lib/i18n";
import { textoPixel } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import type { BloqueDe } from "@/lib/misiones/tipos";
import { MAX_PROMPT, revisarSimulado } from "@/lib/misiones/laboratorio";
import { Etiqueta, Salida, Tarjeta } from "./Base";
import type { PropsBloque } from "./tipos";

const T: Record<Idioma, Record<string, string>> = {
  es: {
    laboratorio: "Laboratorio",
    simulado: "Revisión de práctica",
    tuPrompt: "Tu prompt",
    placeholder: "Escribe aquí tu prompt…",
    transmitir: "Transmitir",
    transmitiendo: "Transmitiendo…",
    respondio: "La IA respondió",
    ejemplo: "(ejemplo)",
    privacidad: "No pegues datos personales: nombres completos, teléfonos, cédulas ni contraseñas.",
    vacio: "La antena no captó nada. Escribe un pedido completo, como si le hablaras a alguien que no te conoce.",
    intentos: "Intento",
    de: "de",
  },
  en: {
    laboratorio: "Lab",
    simulado: "Practice review",
    tuPrompt: "Your prompt",
    placeholder: "Write your prompt here…",
    transmitir: "Transmit",
    transmitiendo: "Transmitting…",
    respondio: "The AI replied",
    ejemplo: "(example)",
    privacidad: "Don't paste personal data: full names, phone numbers, ID numbers or passwords.",
    vacio: "The antenna picked up nothing. Write a full request, as if you were talking to someone who doesn't know you.",
    intentos: "Try",
    de: "of",
  },
};

export default function Laboratorio({ bloque, idioma, registro, decir, completar, guardarLab }: PropsBloque<BloqueDe<"laboratorio">>) {
  const t = T[idioma];
  const previo = registro.labs[bloque.id];
  const anterior = Object.values(registro.labs).at(-1)?.prompt ?? "";
  const [prompt, setPrompt] = useState(previo?.prompt ?? (bloque.inicial === "anterior" ? anterior : ""));
  const [intentos, setIntentos] = useState(previo?.intentos ?? 0);
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [respuesta, setRespuesta] = useState<{ texto: string; cartel: boolean } | null>(null);
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (reloj.current) clearTimeout(reloj.current);
  }, []);

  // La lista se marca mientras escribe: le muestra qué piezas ya puso.
  const checks = revisarSimulado(bloque.checks, prompt, idioma);
  const cumplidos = Object.values(checks).filter(Boolean).length;

  function transmitir() {
    const limpio = prompt.trim();
    if (limpio.length < 12) {
      sonar("error");
      decir({ estado: "error", texto: { es: T.es.vacio, en: T.en.vacio } });
      return;
    }
    setTransmitiendo(true);
    sonar("toque");
    decir({ estado: "loading", texto: { es: T.es.transmitiendo, en: T.en.transmitiendo } });
    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reloj.current = setTimeout(() => {
      const revision = revisarSimulado(bloque.checks, limpio, idioma);
      const ok = Object.values(revision).filter(Boolean).length;
      const aprobado = ok >= bloque.aprobar;
      const n = intentos + 1;
      const r = aprobado ? bloque.simulado.bueno : bloque.simulado.debil;
      setIntentos(n);
      setTransmitiendo(false);
      setRespuesta({ texto: r.salida[idioma], cartel: aprobado && bloque.simulado.bueno.salidaTipo === "cartel" });
      guardarLab(bloque.id, { prompt: limpio, checks: revision, aprobado, intentos: n });
      decir(r.punti);
      if (aprobado) {
        sonar("acierto");
        completar();
      } else {
        sonar("error");
        if (n >= bloque.maxIntentos) completar(true);
      }
    }, sinMovimiento ? 0 : 900);
  }

  return (
    <div className="grid gap-3">
      <Tarjeta borde="rgba(0,245,255,0.45)">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Etiqueta color="var(--cyan)">{t.laboratorio}</Etiqueta>
          <span className="font-[family-name:var(--font-ui)] text-[12px] font-semibold text-[var(--muted)]">{t.simulado}</span>
        </div>
        <p className="text-[15px] leading-[1.6] text-white">{bloque.reto[idioma]}</p>

        <label htmlFor={`lab-${bloque.id}`} className="sr-only">
          {t.tuPrompt}
        </label>
        <textarea
          id={`lab-${bloque.id}`}
          value={prompt}
          maxLength={MAX_PROMPT}
          rows={5}
          disabled={transmitiendo}
          placeholder={t.placeholder}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full resize-y border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2.5 font-[family-name:var(--font-terminal)] text-[20px] leading-[1.2] text-[#d9ffe3] placeholder:text-[#3f6b4c]"
        />
        <div className="flex items-center justify-between gap-2 font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">
          <span>{t.privacidad}</span>
          <span className="shrink-0 tabular-nums">
            {prompt.length} / {MAX_PROMPT}
          </span>
        </div>

        <ul className="grid gap-1.5" aria-label={`${cumplidos} / ${bloque.checks.length}`}>
          {bloque.checks.map((c) => {
            const ok = checks[c.id];
            return (
              <li key={c.id} className="flex items-center gap-2 font-[family-name:var(--font-ui)] text-[16px] font-semibold" style={{ color: ok ? "white" : "var(--muted)" }}>
                <span aria-hidden="true" className="h-4 w-4 shrink-0 border-2" style={{ borderColor: ok ? "var(--matrix)" : "var(--muted)", background: ok ? "var(--matrix)" : "transparent" }} />
                {c.texto[idioma]}
              </li>
            );
          })}
        </ul>

        {respuesta && (
          <div className="grid gap-2 border border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.6)] p-3">
            <Etiqueta>{`${t.respondio} ${t.ejemplo}`}</Etiqueta>
            <Salida texto={respuesta.texto} cartel={respuesta.cartel} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={transmitir} disabled={transmitiendo} className="boton-pixel boton-pixel-lleno disabled:opacity-60">
            {textoPixel(transmitiendo ? t.transmitiendo : t.transmitir)}
          </button>
          {intentos > 0 && (
            <span className="font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">
              {t.intentos} {intentos} {t.de} {bloque.maxIntentos}
            </span>
          )}
        </div>
      </Tarjeta>
    </div>
  );
}
