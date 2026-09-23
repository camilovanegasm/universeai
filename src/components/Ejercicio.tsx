"use client";

import { useState } from "react";
import type { Ejercicio as TipoEjercicio } from "@/lib/lecciones";
import { fraseAleatoria } from "@/lib/frasesFeedback";

type Props = {
  ejercicio: TipoEjercicio;
  corazonesDisponibles: number;
  onResultado: (correcto: boolean) => void;
  onUsarPista: () => Promise<void>;
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
  base: "w-full rounded-xl border-2 px-4 py-3 text-left font-[family-name:var(--font-ui)] font-semibold transition-colors",
  neutral: "border-[var(--color-panel-border)] bg-black/20 text-white hover:border-[var(--matrix)]",
  correcta: "border-[var(--matrix)] bg-[var(--matrix)]/15 text-[var(--matrix)]",
  incorrecta: "border-[var(--pink)] bg-[var(--pink)]/15 text-[var(--pink)]",
};

export default function Ejercicio({ ejercicio, corazonesDisponibles, onResultado, onUsarPista }: Props) {
  const [seleccion, setSeleccion] = useState<number | boolean | null>(null);
  const [comprobado, setComprobado] = useState(false);
  const [ordenElegido, setOrdenElegido] = useState<string[]>([]);
  const [pasosMezclados] = useState(() =>
    ejercicio.tipo === "ordenar-pasos" ? mezclar(ejercicio.pasos) : []
  );
  const [texto, setTexto] = useState("");
  const [avisoTextoCorto, setAvisoTextoCorto] = useState(false);
  const [pistaRevelada, setPistaRevelada] = useState(false);
  const [pidiendoPista, setPidiendoPista] = useState(false);
  const [feedback, setFeedback] = useState<{ texto: string; correcto: boolean } | null>(null);

  function estiloDe(esEstaLaCorrecta: boolean, esLaElegida: boolean) {
    if (!comprobado || !esLaElegida) return `${ESTILO_OPCION.base} ${ESTILO_OPCION.neutral}`;
    return `${ESTILO_OPCION.base} ${esEstaLaCorrecta ? ESTILO_OPCION.correcta : ESTILO_OPCION.incorrecta}`;
  }

  function comprobar(esCorrecto: boolean) {
    setComprobado(true);
    setFeedback({ texto: fraseAleatoria(esCorrecto), correcto: esCorrecto });
    setTimeout(() => onResultado(esCorrecto), esCorrecto ? 1300 : 1900);
  }

  async function pedirPista() {
    if (pistaRevelada || pidiendoPista || corazonesDisponibles < 0.5) return;
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
        {ejercicio.opciones.map((opcion, indice) => (
          <button
            key={opcion}
            disabled={comprobado}
            onClick={() => {
              setSeleccion(indice);
              comprobar(indice === ejercicio.correcta);
            }}
            className={estiloDe(indice === ejercicio.correcta, seleccion === indice)}
          >
            {opcion}
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
              disabled={comprobado}
              onClick={() => {
                setSeleccion(valor);
                comprobar(valor === ejercicio.correcta);
              }}
              className={estiloDe(valor === ejercicio.correcta, seleccion === valor)}
            >
              {valor ? "Verdadero" : "Falso"}
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
          {ejercicio.despues}
        </p>
        {ejercicio.opciones.map((opcion, indice) => (
          <button
            key={opcion}
            disabled={comprobado}
            onClick={() => {
              setSeleccion(indice);
              comprobar(indice === ejercicio.correcta);
            }}
            className={estiloDe(indice === ejercicio.correcta, seleccion === indice)}
          >
            {opcion}
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
          placeholder="Escribe tu prompt aquí..."
          className="rounded-xl border-2 border-[var(--color-panel-border)] bg-black/20 px-4 py-3 text-white placeholder-[var(--muted)] outline-none focus:border-[var(--matrix)]"
        />
        {avisoTextoCorto && (
          <p className="text-sm text-[var(--gold)]">
            Escribe un poco más de detalle antes de enviar.
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
            className="boton-matrix self-start rounded-xl px-5 py-2.5 font-[family-name:var(--font-ui)] font-bold uppercase tracking-wide"
          >
            Enviar
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
          <p className="font-[family-name:var(--font-terminal)] text-base text-[var(--gold)]">
            💡 {ejercicio.pista}
          </p>
        ) : (
          <button
            onClick={pedirPista}
            disabled={pidiendoPista || corazonesDisponibles < 0.5}
            className="font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wide text-[var(--muted)] hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            💡 Ver pista (cuesta medio corazón)
          </button>
        )}
      </div>
    </div>
  );
}
