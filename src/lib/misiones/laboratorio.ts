// El Laboratorio: revisar el prompt que escribe el piloto.
//
// Hoy funciona en MODO SIMULADO: busca las palabras clave de cada check y
// muestra la respuesta de ejemplo del paquete. En la fase C1.3 se conecta a
// la IA en vivo (Claude Haiku 4.5, desde el servidor), y este modo queda de
// respaldo para cuando se alcance el tope de gasto o no haya conexión.
import type { Idioma } from "@/lib/i18n";
import type { CheckLaboratorio } from "./tipos";

export const MAX_PROMPT = 600;

/** Minúsculas y sin tildes, igual que las claves del paquete. */
export function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Qué checks cumple el prompt, según las palabras clave del idioma. */
export function revisarSimulado(checks: CheckLaboratorio[], prompt: string, idioma: Idioma): Record<string, boolean> {
  const texto = normalizar(prompt);
  return Object.fromEntries(checks.map((c) => [c.id, c.claves[idioma].some((k) => texto.includes(k))]));
}

export type Tramo = { texto: string; pieza: string | null };

/**
 * Parte el prompt en tramos para pintar en color las palabras que le dieron
 * contexto (la Ficha de misión lo usa en "Tu mejor prompt").
 */
export function resaltarClaves(prompt: string, checks: CheckLaboratorio[], idioma: Idioma): Tramo[] {
  // Mapa de cada letra normalizada a su posición en el texto original.
  const mapa: number[] = [];
  let plano = "";
  for (let i = 0; i < prompt.length; i++) {
    const n = normalizar(prompt[i]);
    for (const c of n) {
      plano += c;
      mapa.push(i);
    }
  }
  const color: (string | null)[] = new Array(prompt.length).fill(null);
  for (const c of checks) {
    for (const clave of c.claves[idioma]) {
      const k = clave.trim();
      if (!k) continue;
      let desde = 0;
      let at: number;
      while ((at = plano.indexOf(k, desde)) !== -1) {
        for (let q = at; q < at + k.length; q++) if (color[mapa[q]] == null) color[mapa[q]] = c.id;
        desde = at + k.length;
      }
    }
  }
  const tramos: Tramo[] = [];
  for (let i = 0; i < prompt.length; i++) {
    const ultimo = tramos[tramos.length - 1];
    if (ultimo && ultimo.pieza === color[i]) ultimo.texto += prompt[i];
    else tramos.push({ texto: prompt[i], pieza: color[i] });
  }
  return tramos;
}
