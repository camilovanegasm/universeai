"use client";

import { useCallback, useEffect, useState } from "react";
import { firma } from "@/lib/contenidoAdmin";
import type { Texto } from "@/lib/contenido";

/* Piezas pequeñas que comparten las pantallas del editor de contenido. */

/**
 * Un texto en sus dos idiomas, lado a lado (uno encima del otro en el
 * teléfono). Si `marcarFaltas` está activo, el idioma que falte se marca en
 * rosa: así se ve de un vistazo qué impide publicar.
 */
export function CampoBilingue({
  id,
  etiqueta,
  valor,
  alCambiar,
  largo = false,
  marcarFaltas = false,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  valor: Texto;
  alCambiar: (v: Texto) => void;
  largo?: boolean;
  marcarFaltas?: boolean;
  ayuda?: string;
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-1.5">
      <legend className="mb-1.5 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.1em] text-[var(--muted)]">
        {etiqueta}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {(["es", "en"] as const).map((idioma) => {
          const falta = marcarFaltas && valor[idioma].trim() === "";
          const comun = {
            id: `${id}-${idioma}`,
            value: valor[idioma],
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              alCambiar({ ...valor, [idioma]: e.target.value }),
            "aria-label": `${etiqueta} (${idioma === "es" ? "español" : "inglés"})`,
            className: `campo-admin ${falta ? "campo-admin-falta" : ""}`,
          };
          return (
            <label key={idioma} className="relative flex min-w-0 flex-col">
              <span className="pointer-events-none absolute right-2 top-2 font-[family-name:var(--font-pixel)] text-[7px] text-[var(--muted)]">
                {idioma.toUpperCase()}
              </span>
              {largo ? <textarea rows={3} {...comun} /> : <input type="text" {...comun} />}
            </label>
          );
        })}
      </div>
      {ayuda && <p className="text-[13px] text-[var(--muted)]">{ayuda}</p>}
    </fieldset>
  );
}

/** Botoncito cuadrado para mover y borrar elementos de una lista. */
export function BotonIcono({
  children,
  etiqueta,
  onClick,
  disabled,
  peligro,
}: {
  children: React.ReactNode;
  etiqueta: string;
  onClick: () => void;
  disabled?: boolean;
  peligro?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      title={etiqueta}
      className={`grid h-8 w-8 shrink-0 place-items-center border-2 font-[family-name:var(--font-terminal)] text-[18px] leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        peligro
          ? "border-[var(--pink)]/50 text-[var(--pink)] hover:bg-[var(--pink)]/15"
          : "border-[var(--color-panel-border)] text-[var(--muted)] hover:border-[var(--matrix)] hover:text-[var(--matrix)]"
      }`}
    >
      {children}
    </button>
  );
}

/** Mover, subir y borrar dentro de una lista, sin mutarla. */
export function mover<T>(lista: T[], i: number, paso: -1 | 1): T[] {
  const j = i + paso;
  if (j < 0 || j >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[j]] = [copia[j], copia[i]];
  return copia;
}

export function quitar<T>(lista: T[], i: number): T[] {
  return lista.filter((_, k) => k !== i);
}

export function cambiar<T>(lista: T[], i: number, valor: T): T[] {
  return lista.map((x, k) => (k === i ? valor : x));
}

/**
 * Borrar con confirmación en el mismo lugar: el primer toque cambia el botón
 * a "¿Seguro?" y el segundo borra. Sin ventanas del navegador.
 */
export function BotonBorrar({ etiqueta, alBorrar }: { etiqueta: string; alBorrar: () => void }) {
  const [armado, setArmado] = useState(false);

  useEffect(() => {
    if (!armado) return;
    const reloj = setTimeout(() => setArmado(false), 3000);
    return () => clearTimeout(reloj);
  }, [armado]);

  if (!armado) {
    return (
      <BotonIcono etiqueta={etiqueta} onClick={() => setArmado(true)} peligro>
        ✕
      </BotonIcono>
    );
  }
  return (
    <button
      type="button"
      onClick={alBorrar}
      className="h-8 shrink-0 border-2 border-[var(--pink)] bg-[var(--pink)]/20 px-2 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.08em] text-[var(--pink)]"
    >
      ¿Borrar?
    </button>
  );
}

export type EstadoGuardado = "guardado" | "pendiente" | "guardando" | "error";

/**
 * Guarda el borrador solo, 1,2 s después del último cambio. Así no hay que
 * acordarse de guardar, y nada se pierde si se cierra la pestaña (si hay
 * algo sin guardar, el navegador pregunta antes de cerrar).
 *
 * `marcarGuardado` se llama al cargar, con lo que vino de Firebase: eso ya
 * está guardado y no hay que volver a escribirlo.
 */
export function useAutoguardado<T>(valor: T | null, guardar: (v: T) => Promise<void>) {
  const [guardada, setGuardada] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(false);
  const actual = valor === null ? null : firma(valor);

  useEffect(() => {
    if (valor === null || guardada === null || actual === guardada) return;
    const reloj = setTimeout(async () => {
      setGuardando(true);
      try {
        await guardar(valor);
        setGuardada(actual);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setGuardando(false);
      }
    }, 1200);
    return () => clearTimeout(reloj);
  }, [valor, actual, guardada, guardar]);

  const estado: EstadoGuardado = error
    ? "error"
    : guardando
      ? "guardando"
      : actual !== null && guardada !== null && actual !== guardada
        ? "pendiente"
        : "guardado";

  useEffect(() => {
    if (estado !== "pendiente" && estado !== "guardando") return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [estado]);

  const marcarGuardado = useCallback((v: T) => setGuardada(firma(v)), []);
  return { estado, marcarGuardado };
}

export function IndicadorGuardado({ estado }: { estado: EstadoGuardado }) {
  const texto = {
    guardado: "Borrador guardado",
    pendiente: "Cambios sin guardar…",
    guardando: "Guardando…",
    error: "No se pudo guardar. Revisa la conexión.",
  }[estado];
  const color = estado === "error" ? "var(--pink)" : estado === "guardado" ? "var(--muted)" : "var(--gold)";
  return (
    <span role="status" className="font-[family-name:var(--font-terminal)] text-[15px] tracking-[0.06em]" style={{ color }}>
      {estado === "guardado" ? "✓ " : ""}
      {texto}
    </span>
  );
}

/** Lista de lo que impide publicar. */
export function ListaProblemas({ problemas, titulo }: { problemas: string[]; titulo: string }) {
  if (problemas.length === 0) return null;
  return (
    <div role="alert" className="border-2 border-[var(--pink)] bg-[var(--pink)]/10 p-4">
      <p className="font-[family-name:var(--font-pixel)] text-[9px] leading-[1.6] text-[var(--pink)]">{titulo}</p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-[14px] text-white">
        {problemas.slice(0, 12).map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      {problemas.length > 12 && (
        <p className="mt-2 text-[13px] text-[var(--muted)]">…y {problemas.length - 12} más, marcados en rosa abajo.</p>
      )}
    </div>
  );
}
