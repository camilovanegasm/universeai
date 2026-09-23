"use client";

import { useEffect, useMemo, useState } from "react";
import Ejercicio from "@/components/Ejercicio";
import GraficoExplicacion from "@/components/GraficoExplicacion";
import PuntiPixel from "@/components/PuntiPixel";
import { aLeccion, type LeccionB } from "@/lib/contenido";
import type { Idioma } from "@/lib/i18n";

/**
 * La lección tal como la va a ver el estudiante, jugable, en los dos
 * idiomas. No gasta gasolina ni guarda nada: es solo para revisar.
 */
export default function VistaPrevia({ leccion, alCerrar }: { leccion: LeccionB; alCerrar: () => void }) {
  const [idioma, setIdioma] = useState<Idioma>("es");
  const [paso, setPaso] = useState(0);
  const l = useMemo(() => aLeccion(leccion, idioma), [leccion, idioma]);
  const total = l.explicacion.length + l.ejercicios.length;
  const enExplicacion = paso < l.explicacion.length;
  const terminado = paso >= total;

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") alCerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [alCerrar]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Vista previa de la lección" className="cargando-entra fixed inset-0 z-50 flex flex-col bg-[#05050f]/97 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[var(--color-panel-border)] px-4 py-3">
        <span className="font-[family-name:var(--font-pixel)] text-[9px] text-[var(--gold)]">VISTA PREVIA</span>
        <span className="font-[family-name:var(--font-terminal)] text-[15px] tracking-[0.08em] text-[var(--muted)]">
          {terminado ? "FIN" : `${paso + 1} / ${total}`}
        </span>
        <div className="ml-auto flex gap-1" role="group" aria-label="Idioma">
          {(["es", "en"] as const).map((x) => (
            <button
              key={x}
              onClick={() => setIdioma(x)}
              aria-pressed={idioma === x}
              className={`border-2 px-2.5 py-1 font-[family-name:var(--font-pixel)] text-[8px] ${
                idioma === x ? "border-[var(--matrix)] text-[var(--matrix)]" : "border-[var(--color-panel-border)] text-[var(--muted)]"
              }`}
            >
              {x.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={alCerrar} className="btn-admin">
          CERRAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5">
          {terminado ? (
            <>
              <PuntiPixel estado="hype" ancho={112} />
              <p className="font-[family-name:var(--font-display)] text-xl font-black text-white">
                {idioma === "en" ? "Lesson complete!" : "¡Lección completada!"}
              </p>
              <div className="w-full border-2 border-[var(--color-panel-border)] p-4 text-[15px] text-[var(--muted)]">
                <p className="mb-1 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--gold)]">
                  {idioma === "en" ? "YOUR MISSION" : "TU TAREA"}
                </p>
                {l.tarea}
              </div>
              <button onClick={() => setPaso(0)} className="btn-admin">
                VOLVER A EMPEZAR
              </button>
            </>
          ) : enExplicacion ? (
            <>
              <PuntiPixel estado={l.explicacion[paso].estadoPunti} ancho={112} />
              <div className="w-full border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] p-5">
                <p className="whitespace-pre-line font-[family-name:var(--font-terminal)] text-[20px] leading-[1.35] text-white">
                  {l.explicacion[paso].texto}
                </p>
                {l.explicacion[paso].grafico && (
                  <div className="mt-4">
                    <GraficoExplicacion grafico={l.explicacion[paso].grafico!} idioma={idioma} />
                  </div>
                )}
              </div>
              <div className="flex w-full justify-between">
                <button onClick={() => setPaso((p) => Math.max(0, p - 1))} disabled={paso === 0} className="btn-admin disabled:opacity-30">
                  ← ATRAS
                </button>
                <button onClick={() => setPaso((p) => p + 1)} className="btn-admin btn-admin-lleno">
                  SIGUIENTE →
                </button>
              </div>
            </>
          ) : (
            <>
              <PuntiPixel estado="online" ancho={96} />
              <div className="w-full border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] p-5">
                <Ejercicio
                  key={`${idioma}-${paso}`}
                  ejercicio={l.ejercicios[paso - l.explicacion.length]}
                  gasolinaDisponible={5}
                  onResultado={(correcto) => {
                    if (correcto) setPaso((p) => p + 1);
                  }}
                  onUsarPista={async () => {}}
                  idioma={idioma}
                />
              </div>
              <div className="flex w-full justify-between">
                <button onClick={() => setPaso((p) => p - 1)} className="btn-admin">
                  ← ATRAS
                </button>
                <button onClick={() => setPaso((p) => p + 1)} className="btn-admin">
                  SALTAR →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
