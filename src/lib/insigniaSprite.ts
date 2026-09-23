// Dibujo en pixel art de las insignias del escalafón (los 10 rangos de la
// persona, ver rangos.ts). No usa canvas: devuelve "tiras" de pixeles del
// mismo color para pintarlas como <rect> en un SVG. Así la insignia se ve
// igual en el servidor y en el navegador, y escala sin difuminarse.
//
// Cómo crece la insignia con el rango:
//   1-3  escudo con 1, 2 o 3 galones (chevrons)
//   4-6  escudo con 1, 2 o 3 estrellas
//   7-8  + alas plateadas
//   9    + corona dorada
//   10   alas doradas, corona y destellos alrededor

export const ANCHO_INSIGNIA = 40;
export const ALTO_INSIGNIA = 32;

export type Tira = { x: number; y: number; w: number; color: string };

/* ------------------------------------------------------------ colores */

function hexARgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mezcla un color con otro: t = 0 deja el original, t = 1 da el otro. */
function mezclar(hex: string, con: string, t: number): string {
  const a = hexARgb(hex);
  const b = hexARgb(con);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/* ------------------------------------------------------------ dibujos */

// Cada letra es un tono. "." es transparente.
//   O borde oscuro · L luz · M color del rango · D sombra
const ESCUDO = [
  "..OOOOOOOOOOOOOOOO..",
  ".OLLLLLLLLLLLLLLLLO.",
  "OLLMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  "OLMMMMMMMMMMMMMMMMDO",
  ".OLMMMMMMMMMMMMMMDO.",
  "..OLMMMMMMMMMMMMDO..",
  "...OLMMMMMMMMMMDO...",
  "....OLMMMMMMMMDO....",
  ".....OLMMMMMMDO.....",
  "......OLMMMMDO......",
  ".......OLMMDO.......",
  "........OMDO........",
  ".........OO.........",
];

//   W blanco · w gris claro (sombra del emblema)
const GALON = [
  "...WW...",
  "..WWWW..",
  ".WW..WW.",
  "WW....WW",
  "w......w",
];

const ESTRELLA = [
  "...W...",
  "..WWW..",
  "WWWWWWW",
  ".WWWWW.",
  "..WWW..",
  ".WW.WW.",
  ".w...w.",
];

//   A ala · a sombra del ala
const ALA_IZQ = [
  ".........A",
  "......AAAA",
  "...AAAAAAA",
  "AAAAAAAAAa",
  "..AAAAAAaa",
  "AAAAAAAAa.",
  "..AAAAAaa.",
  ".AAAAAaa..",
  "...AAaa...",
  ".....a....",
];

//   G oro · g joya
const CORONA = [
  "G....GG....G",
  "GG..GGGG..GG",
  "GGGGGGGGGGGG",
  "GgGGgGGgGGgG",
  "GGGGGGGGGGGG",
];

const DESTELLO = [".W.", "WWW", ".W."];

/* ------------------------------------------------------------ armado */

export function dibujarInsignia(n: number, color: string): Tira[] {
  const px: (string | null)[][] = Array.from({ length: ALTO_INSIGNIA }, () => Array(ANCHO_INSIGNIA).fill(null));

  const tonos: Record<string, string> = {
    O: mezclar(color, "#05050f", 0.72),
    L: mezclar(color, "#ffffff", 0.45),
    M: color,
    D: mezclar(color, "#05050f", 0.35),
    W: "#ffffff",
    w: "#c9d2e3",
    S: mezclar(color, "#05050f", 0.6),
    A: n >= 10 ? "#ffe600" : "#e3e9f5",
    a: n >= 10 ? "#b38f00" : "#8e9ab3",
    G: "#ffe600",
    g: n >= 10 ? "#ff006e" : "#00f5ff",
  };

  const pegar = (dibujo: string[], x0: number, y0: number, espejo = false) => {
    dibujo.forEach((fila, y) => {
      const f = espejo ? fila.split("").reverse().join("") : fila;
      f.split("").forEach((c, x) => {
        if (c === ".") return;
        const X = x0 + x;
        const Y = y0 + y;
        if (X < 0 || X >= ANCHO_INSIGNIA || Y < 0 || Y >= ALTO_INSIGNIA) return;
        // La Leyenda cósmica tiene el escudo tornasol: de cian arriba a
        // magenta abajo, pasando por violeta.
        if (n >= 10 && (c === "M" || c === "L" || c === "D")) {
          const t = (Y - 6) / 20;
          const base = t < 0.5 ? mezclar("#00f5ff", "#b400ff", t * 2) : mezclar("#b400ff", "#ff006e", (t - 0.5) * 2);
          px[Y][X] = c === "M" ? base : c === "L" ? mezclar(base, "#ffffff", 0.45) : mezclar(base, "#05050f", 0.35);
          return;
        }
        px[Y][X] = tonos[c];
      });
    });
  };

  // Los emblemas (galones y estrellas) llevan una sombra de un pixel abajo a
  // la derecha: sin ella se pierden sobre los escudos amarillos o lima.
  const emblema = (dibujo: string[], x0: number, y0: number) => {
    const sombra = dibujo.map((f) => f.replace(/[^.]/g, "S"));
    pegar(sombra, x0 + 1, y0 + 1);
    pegar(dibujo, x0, y0);
  };

  const conAlas = n >= 7;
  const conCorona = n >= 9;
  // El escudo baja cuando hay corona, para dejarle espacio arriba.
  const ey = conCorona ? 6 : 4;
  const ex = 10;

  if (conAlas) {
    pegar(ALA_IZQ, 0, ey + 2);
    pegar(ALA_IZQ, 30, ey + 2, true);
  }
  pegar(ESCUDO, ex, ey);
  pegar(["WW", "W."], ex + 2, ey + 2);

  if (n <= 3) {
    const filas = n === 1 ? [6] : n === 2 ? [4, 9] : [2, 6, 10];
    for (const f of filas) emblema(GALON, ex + 6, ey + f);
  } else {
    const estrellas = ((n - 4) % 3) + 1; // 4→1, 5→2, 6→3, 7→1, 8→2, 9→3, 10→3
    const cuantas = n >= 9 ? 3 : estrellas;
    if (cuantas === 1) emblema(ESTRELLA, ex + 6, ey + 6);
    if (cuantas === 2) {
      emblema(ESTRELLA, ex + 2, ey + 5);
      emblema(ESTRELLA, ex + 11, ey + 5);
    }
    if (cuantas === 3) {
      emblema(ESTRELLA, ex + 2, ey + 3);
      emblema(ESTRELLA, ex + 11, ey + 3);
      emblema(ESTRELLA, ex + 6, ey + 10);
    }
  }

  if (conCorona) pegar(CORONA, 14, 0);
  if (n >= 10) {
    pegar(DESTELLO, 2, 1);
    pegar(DESTELLO, 35, 1);
    pegar(DESTELLO, 4, 27);
    pegar(DESTELLO, 33, 27);
  }

  // Juntar pixeles seguidos del mismo color en una sola tira: menos <rect>.
  const tiras: Tira[] = [];
  for (let y = 0; y < ALTO_INSIGNIA; y++) {
    let x = 0;
    while (x < ANCHO_INSIGNIA) {
      const c = px[y][x];
      if (!c) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < ANCHO_INSIGNIA && px[y][x + w] === c) w++;
      tiras.push({ x, y, w, color: c });
      x += w;
    }
  }
  return tiras;
}
