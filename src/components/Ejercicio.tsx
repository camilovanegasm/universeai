"use client";

import { useState } from "react";
import type { Ejercicio as TipoEjercicio } from "@/lib/lecciones";
import { fraseAleatoria } from "@/lib/frasesFeedback";
import type { Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import { textoCosto } from "@/lib/ajustes";

type Props = {
  ejercicio: TipoEjercicio;
  gasolinaDisponible: number;
  /** Lo que cuesta la pista (se cambia en el admin). */
  costoPista?: number;
  onResultado: (correcto: boolean) => void;
  onUsarPista: () => Promise<void>;
  idioma?: Idioma;
};

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    verdadero: "Verdadero",
    falso: "Falso",
    placeholder: "Escribe tu prompt aquí...",
    corto: "Escribe un poco más de detalle antes de enviar.",
    enviar: "ENVIAR",
    pista: "Pedirle una pista a Punti",
    etiquetaPista: "Pista",
  },
  en: {
    verdadero: "True",
    falso: "False",
    placeholder: "Write your prompt here...",
    corto: "Add a bit more detail before you send it.",
    enviar: "SEND",
    pista: "Ask Punti for a hint",
    etiquetaPista: "Hint",
  },
};

function mezclar<T>(items: T[]): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const ESTILO_OPCION = {
  base: "w-full border-2 px-4 py-3 text-left font-[family-name:var(--font-ui)] font-semibold transition-colors",
  neutral: "border-[var(--color-panel-border)] bg-black/20 text-white hover:border-[var(--matrix)]",
  correcta: "border-[var(--matrix)] bg-[var(--matrix)]/15 text-[var(--matrix)]",
  incorrecta: "border-[var(--pink)] bg-[var(--pink)]/15 text-[var(--pink)]",
  // Una opción que ya se probó y estaba mal: queda marcada y apagada para
  // que el segundo intento sea entre las que quedan.
  descartada: "border-[var(--pink)]/40 bg-transparent text-[var(--pink)]/50 line-through cursor-not-allowed",
};

export default function Ejercicio({ ejercicio, gasolinaDisponible, costoPista = 0.5, onResultado, onUsarPista, idioma = "es" }: Props) {
  const t = TX[idioma];
  const [seleccion, setSeleccion] = useState<number | boolean | null>(null);
  const [comprobado, setComprobado] = useState(false);
  const [ordenElegido, setOrdenElegido] = useState<string[]>([]);
  const [pasosMezclados] = useState(() =>
    ejercicio.tipo === "ordenar-pasos" ? mezclar(ejercicio.pasos) : []
  );
  // Las opciones también salen en orden aleatorio: así la correcta no queda
  // siempre en el mismo lugar y nadie aprende la posición en vez del tema.
  // Se mezclan los índices, no los textos, para no tocar la lógica de
  // "correcta" ni de las opciones descartadas.
  const [ordenOpciones] = useState(() =>
    ejercicio.tipo === "opcion-multiple" || ejercicio.tipo === "completar-frase"
      ? mezclar(ejercicio.opciones.map((_, i) => i))
      : []
  );
  const [texto, setTexto] = useState("");
  const [avisoTextoCorto, setAvisoTextoCorto] = useState(false);
  const [pistaRevelada, setPistaRevelada] = useState(false);
  const [pidiendoPista, setPidiendoPista] = useState(false);
  const [feedback, setFeedback] = useState<{ texto: string; correcto: boolean } | null>(null);
  // Respuestas que ya se probaron y estaban mal (índices o verdadero/falso).
  const [descartadas, setDescartadas] = useState<(number | boolean)[]>([]);

  function estiloDe(esEstaLaCorrecta: boolean, esLaElegida: boolean, valor: number | boolean) {
    if (descartadas.includes(valor)) return `${ESTILO_OPCION.base} ${ESTILO_OPCION.descartada}`;
    if (!comprobado || !esLaElegida) return `${ESTILO_OPCION.base} ${ESTILO_OPCION.neutral}`;
    return `${ESTILO_OPCION.base} ${esEstaLaCorrecta ? ESTILO_OPCION.correcta : ESTILO_OPCION.incorrecta}`;
  }

  function comprobar(esCorrecto: boolean, valor?: number | boolean) {
    sonar(esCorrecto ? "acierto" : "error");
    setComprobado(true);
    setFeedback({ texto: fraseAleatoria(esCorrecto, idioma), correcto: esCorrecto });
    if (esCorrecto) {
      setTimeout(() => onResultado(true), 1300);
      return;
    }
    setTimeout(() => {
      onResultado(false);
      // Antes el ejercicio se quedaba bloqueado después de fallar: la lección
      // no avanza (hay que acertar), pero los botones seguían apagados.
      // Ahora se abre un segundo intento, con la opción fallada tachada.
      if (valor !== undefined) setDescartadas((d) => [...d, valor]);
      setOrdenElegido([]);
      setSeleccion(null);
      setFeedback(null);
      setComprobado(false);
    }, 1900);
  }

  async function pedirPista() {
    if (pistaRevelada || pidiendoPista || gasolinaDisponible < costoPista) return;
    setPidiendoPista(true);
    await onUsarPista();
    setPistaRevelada(true);
    setPidiendoPista(false);
  }

  let contenido: React.ReactNode;

  if (ejercicio.tipo === "opcion-multiple") {
    contenido = (
      <div className="flex flex-col gap-3">
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">
          {ejercicio.pregunta}
        </p>
        {ordenOpciones.map((indice) => (
          <button
            key={indice}
            disabled={comprobado || descartadas.includes(indice)}
            onClick={() => {
              setSeleccion(indice);
              comprobar(indice === ejercicio.correcta, indice);
            }}
            className={estiloDe(indice === ejercicio.correcta, seleccion === indice, indice)}
          >
            {ejercicio.opciones[indice]}
          </button>
        ))}
      </div>
    );
  } else if (ejercicio.tipo === "verdadero-falso") {
    contenido = (
      <div className="flex flex-col gap-3">
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">
          {ejercicio.enunciado}
        </p>
        <div className="flex gap-3">
          {[true, false].map((valor) => (
            <button
              key={String(valor)}
              disabled={comprobado || descartadas.includes(valor)}
              onClick={() => {
                setSeleccion(valor);
                comprobar(valor === ejercicio.correcta, valor);
              }}
              className={estiloDe(valor === ejercicio.correcta, seleccion === valor, valor)}
            >
              {valor ? t.verdadero : t.falso}
            </button>
          ))}
        </div>
      </div>
    );
  } else if (ejercicio.tipo === "completar-frase") {
    contenido = (
      <div className="flex flex-col gap-3">
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">
          {ejercicio.antes} <span className="text-[var(--matrix)]">____</span>
          {/* Google Sheets borra el espacio inicial de "de esos datos.": si lo que
              sigue empieza por letra o número, el espacio se pone aquí. */}
          {/^[\p{L}\p{N}]/u.test(ejercicio.despues.trim()) ? " " : ""}
          {ejercicio.despues.trim()}
        </p>
        {ordenOpciones.map((indice) => (
          <button
            key={indice}
            disabled={comprobado || descartadas.includes(indice)}
            onClick={() => {
              setSeleccion(indice);
              comprobar(indice === ejercicio.correcta, indice);
            }}
            className={estiloDe(indice === ejercicio.correcta, seleccion === indice, indice)}
          >
            {ejercicio.opciones[indice]}
          </button>
        ))}
      </div>
    );
  } else if (ejercicio.tipo === "ordenar-pasos") {
    const pasosCorrectos = ejercicio.pasos;
    const disponibles = pasosMezclados.filter((paso) => !ordenElegido.includes(paso));

    const elegirPaso = (paso: string) => {
      if (comprobado) return;
      const nuevoOrden = [...ordenElegido, paso];
      setOrdenElegido(nuevoOrden);
      if (nuevoOrden.length === pasosCorrectos.length) {
        const correcto = nuevoOrden.every((p, i) => p === pasosCorrectos[i]);
        comprobar(correcto);
      }
    };

    contenido = (
      <div className="flex flex-col gap-4">
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">
          {ejercicio.instruccion}
        </p>
        <ol className="flex flex-col gap-2">
          {ordenElegido.map((paso, indice) => (
            <li
              key={paso}
              className={`${ESTILO_OPCION.base} ${
                comprobado
                  ? paso === pasosCorrectos[indice]
                    ? ESTILO_OPCION.correcta
                    : ESTILO_OPCION.incorrecta
                  : "border-[var(--matrix)] bg-[var(--matrix)]/10 text-white"
              }`}
            >
              {indice + 1}. {paso}
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2">
          {disponibles.map((paso) => (
            <button
              key={paso}
              onClick={() => elegirPaso(paso)}
              className={`${ESTILO_OPCION.base} ${ESTILO_OPCION.neutral}`}
            >
              {paso}
            </button>
          ))}
        </div>
      </div>
    );
  } else {
    // escribir-prompt
    contenido = (
      <div className="flex flex-col gap-3">
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">
          {ejercicio.instruccion}
        </p>
        <textarea
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAvisoTextoCorto(false);
          }}
          disabled={comprobado}
          rows={3}
          placeholder={t.placeholder}
          className="border-2 border-[var(--color-panel-border)] bg-black/20 px-4 py-3 text-white placeholder-[var(--muted)] outline-none focus:border-[var(--matrix)]"
        />
        {avisoTextoCorto && (
          <p className="text-sm text-[var(--gold)]">
            {t.corto}
          </p>
        )}
        {!comprobado && (
          <button
            onClick={() => {
              if (texto.trim().length < 10) {
                setAvisoTextoCorto(true);
                return;
              }
              comprobar(true);
            }}
            className="boton-pixel boton-pixel-lleno self-start"
          >
            {t.enviar}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {contenido}
      {feedback && (
        <p
          className={`text-center font-[family-name:var(--font-terminal)] text-2xl font-bold uppercase tracking-wide ${
            feedback.correcto ? "text-[var(--matrix)]" : "text-[var(--pink)]"
          }`}
          style={{
            textShadow: feedback.correcto
              ? "0 0 10px #00ff41, 0 0 22px #00ff41"
              : "0 0 10px #ff006e, 0 0 22px #ff006e",
          }}
        >
          {feedback.texto}
        </p>
      )}
      <div className="border-t border-[var(--color-panel-border)] pt-3">
        {pistaRevelada ? (
          <p className="font-[family-name:var(--font-terminal)] text-[18px] leading-[1.35] text-[var(--gold)]">
            <span className="mr-2 border border-[var(--gold)] px-1.5 text-[14px] uppercase tracking-[0.12em]">{t.etiquetaPista}</span>
            {ejercicio.pista}
          </p>
        ) : (
          <button
            onClick={pedirPista}
            disabled={pidiendoPista || gasolinaDisponible < costoPista}
            className="font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wide text-[var(--muted)] hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.pista} · {textoCosto(costoPista, idioma)}
          </button>
        )}
      </div>
    </div>
  );
}
