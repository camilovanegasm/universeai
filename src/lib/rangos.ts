import { ajustesVigentes } from "./ajustes";
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
 * El escalafón: los 10 rangos de la PERSONA, de Cadete a Leyenda cósmica.
 *
 * No es lo mismo que el rango de un mundo (arriba), que dice su dificultad.
 * Los nombres coinciden a propósito: un mundo "Capitán" es el que se
 * recomienda a quien ya llegó a Capitán.
 *
 * Se sube por XP. Como las lecciones se pueden repetir, los rangos altos
 * premian la constancia: con una pasada por toda la escuela se llega más o
 * menos a Piloto o Capitán; lo demás es práctica.
 */
export type Escalon = {
  id: string;
  /** 1 a 10. Decide el diseño de la insignia. */
  n: number;
  titulo: string;
  tituloEn: string;
  color: string;
};

export const ESCALAFON: Escalon[] = [
  { id: "cadete", n: 1, titulo: "Cadete", tituloEn: "Cadet", color: "#9aa3b8" },
  { id: "explorador", n: 2, titulo: "Explorador espacial", tituloEn: "Space Explorer", color: "#00ff41" },
  { id: "navegante", n: 3, titulo: "Navegante", tituloEn: "Navigator", color: "#c6ff00" },
  { id: "piloto", n: 4, titulo: "Piloto", tituloEn: "Pilot", color: "#ffe600" },
  { id: "capitan", n: 5, titulo: "Capitán de estación", tituloEn: "Station Captain", color: "#00f5ff" },
  { id: "comandante", n: 6, titulo: "Comandante", tituloEn: "Commander", color: "#4d8dff" },
  { id: "almirante", n: 7, titulo: "Almirante", tituloEn: "Admiral", color: "#ff8a00" },
  { id: "arquitecto", n: 8, titulo: "Arquitecto de galaxias", tituloEn: "Galaxy Architect", color: "#b400ff" },
  { id: "guardian", n: 9, titulo: "Guardián estelar", tituloEn: "Star Guardian", color: "#ff006e" },
  { id: "leyenda", n: 10, titulo: "Leyenda cósmica", tituloEn: "Cosmic Legend", color: "#ffcc33" },
];

/** Clave en los ajustes del XP que pide cada rango (el 1 empieza en 0). */
export type ClaveXpRango =
  | "xpRango2" | "xpRango3" | "xpRango4" | "xpRango5" | "xpRango6"
  | "xpRango7" | "xpRango8" | "xpRango9" | "xpRango10";

export const clavesXpRango = (): ClaveXpRango[] =>
  ESCALAFON.slice(1).map((e) => `xpRango${e.n}` as ClaveXpRango);

/** Desde cuánto XP empieza cada rango. Se cambia en el admin (Ajustes). */
export function xpDeEscalon(e: Escalon): number {
  if (e.n === 1) return 0;
  return ajustesVigentes().juego[`xpRango${e.n}` as ClaveXpRango];
}

export function escalonPorId(id: string | null | undefined): Escalon | null {
  return ESCALAFON.find((e) => e.id === id) ?? null;
}

/** El rango actual, el siguiente, y cuánto falta, para una XP dada. */
export function rangoPorXp(xp: number): {
  actual: Escalon;
  siguiente: Escalon | null;
  /** 0 a 1: qué tanto del camino al siguiente rango está recorrido. */
  avance: number;
  faltan: number;
} {
  let actual = ESCALAFON[0];
  for (const e of ESCALAFON) if (xp >= xpDeEscalon(e)) actual = e;
  const siguiente = ESCALAFON[actual.n] ?? null;
  if (!siguiente) return { actual, siguiente: null, avance: 1, faltan: 0 };
  const desde = xpDeEscalon(actual);
  const hasta = xpDeEscalon(siguiente);
  return {
    actual,
    siguiente,
    avance: Math.max(0, Math.min(1, (xp - desde) / Math.max(1, hasta - desde))),
    faltan: Math.max(0, hasta - xp),
  };
}
