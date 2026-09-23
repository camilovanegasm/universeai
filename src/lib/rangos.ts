/**
 * Los tres rangos de dificultad, con nombre propio.
 *
 * Se usan dos formas de cada nombre a propósito: el `titulo` completo, que es
 * el que se ve en el perfil y en la ficha del mundo, y la `etiqueta` corta,
 * que es la que cabe en la insignia de una tarjeta. "Capitán de estación" no
 * entra en un chip de 90px sin partirse en dos renglones.
 */

export type Rango = "explorador" | "capitan" | "arquitecto";

export const RANGOS: Record<
  Rango,
  { titulo: string; etiqueta: string; tituloEn: string; etiquetaEn: string; color: string; orden: number }
> = {
  explorador: {
    titulo: "Explorador espacial",
    etiqueta: "Explorador",
    tituloEn: "Space Explorer",
    etiquetaEn: "Explorer",
    color: "#00ff41",
    orden: 1,
  },
  capitan: {
    titulo: "Capitán de estación",
    etiqueta: "Capitán",
    tituloEn: "Station Captain",
    etiquetaEn: "Captain",
    color: "#00f5ff",
    orden: 2,
  },
  arquitecto: {
    titulo: "Arquitecto de galaxias",
    etiqueta: "Arquitecto",
    tituloEn: "Galaxy Architect",
    etiquetaEn: "Architect",
    color: "#b400ff",
    orden: 3,
  },
};

/* ------------------------------------------------------ rango de la persona */

/**
 * XP mínima para cada rango de la PERSONA (no del mundo).
 *
 * Por qué estos números: una lección perfecta da 20 XP (15 + 5 de bono), y una
 * normal unas 10-15. Con los 26 subtemas escritos hay unos 300-400 XP en total.
 * Capitán llega hacia la cuarta parte del universo, Arquitecto cerca del final.
 *
 * DECISIÓN ABIERTA: también podría subirse de rango por mundos completados en
 * vez de por XP. Se eligió XP porque premia la constancia y no solo el avance.
 */
export const XP_RANGO: Record<Rango, number> = {
  explorador: 0,
  capitan: 100,
  arquitecto: 300,
};

const ORDEN: Rango[] = ["explorador", "capitan", "arquitecto"];

/** El rango actual, el siguiente, y cuánto falta, para una XP dada. */
export function rangoPorXp(xp: number): {
  actual: Rango;
  siguiente: Rango | null;
  /** 0 a 1: qué tanto del camino al siguiente rango está recorrido. */
  avance: number;
  faltan: number;
} {
  let actual: Rango = "explorador";
  for (const r of ORDEN) if (xp >= XP_RANGO[r]) actual = r;
  const i = ORDEN.indexOf(actual);
  const siguiente = ORDEN[i + 1] ?? null;
  if (!siguiente) return { actual, siguiente: null, avance: 1, faltan: 0 };
  const desde = XP_RANGO[actual];
  const hasta = XP_RANGO[siguiente];
  return {
    actual,
    siguiente,
    avance: Math.max(0, Math.min(1, (xp - desde) / (hasta - desde))),
    faltan: Math.max(0, hasta - xp),
  };
}
