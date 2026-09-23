// Piezas pequeñas que comparten los minijuegos.

/** Copia desordenada (Fisher-Yates). */
export function mezclar<T>(items: readonly T[]): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Comparte un texto: en el celular abre el menú de compartir (WhatsApp,
 * etc.); en el computador lo copia. Devuelve qué pasó para avisarlo.
 */
export async function compartirTexto(texto: string): Promise<"compartido" | "copiado" | "cancelado" | "error"> {
  try {
    if (typeof navigator.share === "function") {
      await navigator.share({ text: texto });
      return "compartido";
    }
  } catch (e) {
    if ((e as { name?: string }).name === "AbortError") return "cancelado";
    // Si el menú falla, se intenta copiar.
  }
  try {
    await navigator.clipboard.writeText(texto);
    return "copiado";
  } catch {
    return "error";
  }
}

/**
 * Hace temblar un elemento (clase .temblor de globals.css). Se toca el DOM
 * directo a propósito: es un efecto de 300 ms y no vale un render de React.
 * Con "reducir movimiento" la clase no anima (lo decide el CSS).
 */
export function temblar(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("temblor");
  void el.offsetWidth; // reinicia la animación si ya estaba
  el.classList.add("temblor");
}
