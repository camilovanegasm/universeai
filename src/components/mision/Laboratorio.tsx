"use client";

// El Laboratorio: el piloto escribe un prompt, lo transmite y ve qué pasa.
//
// EN VIVO (fase C1.3): el prompt va al servidor (/api/laboratorio), que lo
// manda a Claude Haiku con las instrucciones del ejercicio y lo califica con la
// rúbrica de la misión. Punti responde con lo que dijo la IA.
//
// REVISIÓN DE PRÁCTICA (respaldo): palabras clave y respuestas de ejemplo del
// paquete. Entra sola si se acabaron las transmisiones en vivo del día, si el
// admin apagó el Laboratorio, si no hay conexión o si la IA no responde.
// Mientras el piloto escribe, la lista se marca con esta revisión local como
// pista; al transmitir en vivo manda lo que dijo la IA.
//
// Transmitir NO gasta gasolina: el Laboratorio es para practicar y equivocarse.
// Después de `maxIntentos` se deja seguir aunque no pase, para que nadie se
// quede atascado (y en la ficha ese logro no se marca).
import { useEffect, useRef, useState } from "react";
import type { Idioma } from "@/lib/i18n";
import { textoPixel } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import type { BloqueDe, Dicho } from "@/lib/misiones/tipos";
import { MAX_PROMPT, revisarSimulado } from "@/lib/misiones/laboratorio";
import { transmitirVivo } from "@/lib/misiones/laboratorioVivo";
import { Etiqueta, Salida, Tarjeta } from "./Base";
import type { PropsBloque } from "./tipos";

const T: Record<Idioma, Record<string, string>> = {
  es: {
    laboratorio: "Laboratorio",
    vivo: "IA en vivo",
    quedan: "quedan hoy",
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
    topePiloto: "Usaste tus transmisiones en vivo de hoy. Sigo con la revisión de práctica; mañana la antena vuelve a estar libre.",
    respaldo: "La antena en vivo está descansando. Sigo con la revisión de práctica, que también cuenta.",
  },
  en: {
    laboratorio: "Lab",
    vivo: "Live AI",
    quedan: "left today",
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
    topePiloto: "You used today's live transmissions. I'll keep going with the practice review; tomorrow the antenna is free again.",
    respaldo: "The live antenna is resting. I'll keep going with the practice review, which counts too.",
  },
};

type Resultado = { checks: Record<string, boolean>; aprobado: boolean; salida: string; cartel: boolean; dicho: Dicho };

export default function Laboratorio({ bloque, idioma, misionId, vista, registro, decir, completar, guardarLab }: PropsBloque<BloqueDe<"laboratorio">>) {
  const t = T[idioma];
  const previo = registro.labs[bloque.id];
  const anterior = Object.values(registro.labs).at(-1)?.prompt ?? "";
  const [prompt, setPrompt] = useState(previo?.prompt ?? (bloque.inicial === "anterior" ? anterior : ""));
  const [intentos, setIntentos] = useState(previo?.intentos ?? 0);
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [respuesta, setRespuesta] = useState<{ texto: string; cartel: boolean; vivo: boolean } | null>(null);
  /** Lo que marcó la IA, atado al prompt que calificó (si lo edita, vuelve la pista local). */
  const [marcaVivo, setMarcaVivo] = useState<{ prompt: string; checks: Record<string, boolean> } | null>(null);
  const [modo, setModo] = useState<"vivo" | "simulado">("vivo");
  const [restantes, setRestantes] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const pista = revisarSimulado(bloque.checks, prompt, idioma);
  const checks = marcaVivo && marcaVivo.prompt === prompt.trim() ? marcaVivo.checks : pista;
  const cumplidos = Object.values(checks).filter(Boolean).length;

  function simular(limpio: string): Resultado {
    const revision = revisarSimulado(bloque.checks, limpio, idioma);
    const aprobado = Object.values(revision).filter(Boolean).length >= bloque.aprobar;
    const r = aprobado ? bloque.simulado.bueno : bloque.simulado.debil;
    return {
      checks: revision,
      aprobado,
      salida: r.salida[idioma],
      cartel: aprobado && bloque.simulado.bueno.salidaTipo === "cartel",
      dicho: r.punti,
    };
  }

  async function transmitir() {
    const limpio = prompt.trim();
    if (limpio.length < 12) {
      sonar("error");
      decir({ estado: "error", texto: { es: T.es.vacio, en: T.en.vacio } });
      return;
    }
    setTransmitiendo(true);
    sonar("toque");
    decir({ estado: "loading", texto: { es: T.es.transmitiendo, en: T.en.transmitiendo } });

    const r = await transmitirVivo({ misionId, bloqueId: bloque.id, prompt: limpio, idioma, vista });
    if (!montado.current) return;

    let res: Resultado;
    let enVivo = false;
    if (r.modo === "vivo") {
      enVivo = true;
      res = {
        checks: r.checks,
        aprobado: r.aprobado,
        salida: r.salida,
        cartel: false,
        dicho: { estado: r.punti.estado, texto: { es: r.punti.texto, en: r.punti.texto } },
      };
      setModo("vivo");
      setRestantes(r.restantes);
      setAviso(null);
    } else {
      res = simular(limpio);
      setModo("simulado");
      if (r.restantes !== null) setRestantes(r.restantes);
      setAviso(r.motivo === "tope-piloto" ? t.topePiloto : t.respaldo);
    }

    const n = intentos + 1;
    setIntentos(n);
    setTransmitiendo(false);
    setMarcaVivo(enVivo ? { prompt: limpio, checks: res.checks } : null);
    setRespuesta({ texto: res.salida, cartel: res.cartel, vivo: enVivo });
    guardarLab(bloque.id, { prompt: limpio, checks: res.checks, aprobado: res.aprobado, intentos: n });
    decir(res.dicho);
    if (res.aprobado) {
      sonar("acierto");
      completar();
    } else {
      sonar("error");
      if (n >= bloque.maxIntentos) completar(true);
    }
  }

  const insignia =
    modo === "vivo" ? (restantes !== null ? `${t.vivo} · ${restantes} ${t.quedan}` : t.vivo) : t.simulado;

  return (
    <div className="grid gap-3">
      <Tarjeta borde="rgba(0,245,255,0.45)">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Etiqueta color="var(--cyan)">{t.laboratorio}</Etiqueta>
          <span
            className="font-[family-name:var(--font-ui)] text-[12px] font-semibold"
            style={{ color: modo === "vivo" ? "var(--matrix)" : "var(--muted)" }}
          >
            {insignia}
          </span>
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
            <Etiqueta>{respuesta.vivo ? t.respondio : `${t.respondio} ${t.ejemplo}`}</Etiqueta>
            <Salida texto={respuesta.texto} cartel={respuesta.cartel} />
          </div>
        )}

        {aviso && (
          <p role="status" className="font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">
            {aviso}
          </p>
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
