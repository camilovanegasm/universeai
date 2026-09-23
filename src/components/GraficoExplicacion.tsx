import { Fragment, type ReactNode } from "react";
import type { Idioma } from "@/lib/i18n";
import type { Grafico } from "@/lib/lecciones";

// Los gráficos de la explicación no son adornos sueltos: cada uno es un "módulo"
// de la consola de Punti, con su propia cabecera, para que la lección se lea
// como un panel de datos y no como texto con una tablita al lado.

function Modulo({
  icono,
  titulo,
  children,
}: {
  icono: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.5)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-panel-border)] bg-[rgba(0,255,65,0.07)] px-3.5 py-2.5">
        <span className="text-[13px] leading-none text-[var(--matrix)]">{icono}</span>
        <span className="font-[family-name:var(--font-ui)] text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--matrix)]">
          {titulo}
        </span>
      </div>
      {children}
    </div>
  );
}

function Punto({ color }: { color: string }) {
  return (
    <span
      className="absolute left-0 top-[9px] h-1.5 w-1.5 rounded-full"
      style={{ background: color, boxShadow: `0 0 7px ${color}` }}
    />
  );
}

// Los títulos de los módulos son de la interfaz, no del contenido: el
// contenido de la lección ya llega en su idioma, pero estos dos rótulos no.
const TITULOS: Record<Idioma, { comparacion: string; pasos: string }> = {
  es: { comparacion: "Comparación", pasos: "Cómo funciona, paso a paso" },
  en: { comparacion: "Comparison", pasos: "How it works, step by step" },
};

export default function GraficoExplicacion({ grafico, idioma = "es" }: { grafico: Grafico; idioma?: Idioma }) {
  const t = TITULOS[idioma];
  if (grafico.tipo === "tabla") {
    // Comparación enfrentada: rosa el "antes", verde Matrix la IA.
    return (
      <Modulo icono="⇄" titulo={t.comparacion}>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">
          <div className="p-3.5">
            <p className="mb-3 font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-[0.09em] text-[var(--pink)]">
              {grafico.encabezados[0]}
            </p>
            <ul className="flex flex-col gap-2.5">
              {grafico.filas.map((fila, i) => (
                <li key={i} className="relative pl-4 text-sm leading-relaxed text-white">
                  <Punto color="var(--pink)" />
                  {fila[0]}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative grid place-items-center px-3.5 py-2 sm:px-2 sm:py-3.5">
            <span className="pointer-events-none absolute left-3.5 right-3.5 top-1/2 h-px bg-[var(--color-panel-border)] opacity-60 sm:left-1/2 sm:right-auto sm:top-3.5 sm:bottom-3.5 sm:h-auto sm:w-px" />
            <span className="relative grid h-7 w-7 place-items-center rounded-full border border-[var(--color-panel-border)] bg-[var(--background)] font-[family-name:var(--font-display)] text-[10px] font-black text-[var(--muted)]">
              VS
            </span>
          </div>

          <div className="p-3.5">
            <p className="mb-3 font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-[0.09em] text-[var(--matrix)]">
              {grafico.encabezados[1]}
            </p>
            <ul className="flex flex-col gap-2.5">
              {grafico.filas.map((fila, i) => (
                <li key={i} className="relative pl-4 text-sm leading-relaxed text-white">
                  <Punto color="var(--matrix)" />
                  {fila[1]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Modulo>
    );
  }

  // Flujo: tubería numerada. En celular se apila y las flechas giran.
  return (
    <Modulo icono="⟶" titulo={t.pasos}>
      <ol className="flex flex-col p-3.5 sm:flex-row sm:items-stretch">
        {grafico.pasos.map((paso, i) => (
          <Fragment key={paso}>
            <li className="flex flex-1 items-center gap-3 py-1.5 sm:flex-col sm:gap-2 sm:px-1 sm:py-0 sm:text-center">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[var(--matrix)] bg-[rgba(0,255,65,0.08)] font-[family-name:var(--font-display)] text-[13px] font-bold text-[var(--matrix)] shadow-[0_0_14px_rgba(0,255,65,0.25)]">
                {i + 1}
              </span>
              <span className="font-[family-name:var(--font-ui)] text-[12.5px] font-semibold leading-snug text-white">
                {paso}
              </span>
            </li>
            {i < grafico.pasos.length - 1 && (
              <span
                aria-hidden
                className="ml-[14px] grid rotate-90 place-items-center py-0.5 text-[15px] text-[var(--matrix)] opacity-50 sm:ml-0 sm:rotate-0 sm:px-1 sm:py-0"
              >
                ▶
              </span>
            )}
          </Fragment>
        ))}
      </ol>
    </Modulo>
  );
}
