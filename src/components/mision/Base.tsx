"use client";

// Piezas visuales que comparten los bloques de una misión.
import { textoPixel } from "@/lib/i18n";

/** Etiqueta pequeña en fuente pixel (sin tildes: esa fuente no las trae). */
export function Etiqueta({ children, color = "var(--muted)" }: { children: string; color?: string }) {
  return (
    <span className="block font-[family-name:var(--font-pixel)] text-[8px] leading-[1.8] tracking-[0.06em]" style={{ color }}>
      {textoPixel(children)}
    </span>
  );
}

/** Un prompt, en letra de terminal. */
export function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="whitespace-pre-wrap break-words border border-[rgba(0,255,65,0.3)] bg-[#030a06] px-3 py-2.5 font-[family-name:var(--font-terminal)] text-[20px] leading-[1.2] text-[#b9ffcb]">
      {children}
    </div>
  );
}

/** Lo que "respondió la IA": se ve como un papel, distinto a la interfaz de Punti. */
export function Salida({ texto, cartel = false }: { texto: string; cartel?: boolean }) {
  return (
    <div
      className={`whitespace-pre-line break-words border-l-4 border-[#c9c2ad] bg-[#f4f1e8] px-4 py-3 text-[15px] leading-[1.45] text-[#1b1b1b] ${
        cartel ? "text-center font-[family-name:var(--font-display)] font-black tracking-wide" : ""
      }`}
    >
      {texto}
    </div>
  );
}

export function Tarjeta({ children, borde }: { children: React.ReactNode; borde?: string }) {
  return (
    <div
      className="grid gap-2.5 border-2 bg-[rgba(10,10,30,0.88)] p-4"
      style={{ borderColor: borde ?? "var(--color-panel-border)" }}
    >
      {children}
    </div>
  );
}

