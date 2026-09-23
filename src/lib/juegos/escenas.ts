// Escenas de "Caza el glitch". Cada escena se dibuja en pixel art sobre una
// rejilla de 96 x 72 (sin imágenes que descargar) y trae 3 errores típicos de
// las imágenes hechas con IA, cada uno con su zona para tocar y su
// explicación. Los dibujos son funciones puras sobre un canvas, como
// puntiSprite.ts.
import type { Texto } from "../i18n";

export const LIENZO = { ancho: 96, alto: 72 };

export type Glitch = { x: number; y: number; w: number; h: number; texto: Texto };
export type Escena = {
  id: string;
  nombre: Texto;
  glitches: Glitch[];
  dibujar: (c: CanvasRenderingContext2D) => void;
};

type Ctx = CanvasRenderingContext2D;

function r(c: Ctx, x: number, y: number, w: number, h: number, color: string) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

/** "Letras" que no son letras: bloques de 2-3 px que parecen texto de lejos. */
function garabatos(c: Ctx, x: number, y: number, ancho: number, filas: number, color: string, semilla: number) {
  let s = semilla;
  const azar = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let f = 0; f < filas; f++) {
    let cx = x;
    const fin = x + ancho - (f === filas - 1 ? Math.floor(ancho / 3) : 0);
    while (cx < fin - 2) {
      const w = 1 + Math.floor(azar() * 3);
      const alto = azar() > 0.3 ? 3 : 2;
      r(c, cx, y + f * 5 + (3 - alto), w, alto, color);
      if (azar() > 0.6) r(c, cx + w, y + f * 5, 1, 1, color);
      cx += w + (azar() > 0.75 ? 3 : 1);
    }
  }
}

/* ------------------------------------------------------------ parque */

function parque(c: Ctx) {
  // Cielo en franjas, sol arriba a la izquierda.
  r(c, 0, 0, 96, 20, "#16305c");
  r(c, 0, 20, 96, 20, "#1d3b6e");
  r(c, 0, 40, 96, 12, "#26508a");
  r(c, 9, 5, 8, 10, "#ffe600");
  r(c, 8, 6, 10, 8, "#ffe600");
  r(c, 12, 1, 2, 2, "#ffe600");
  r(c, 12, 17, 2, 2, "#ffe600");
  r(c, 3, 9, 2, 2, "#ffe600");
  r(c, 21, 9, 2, 2, "#ffe600");
  // Nubes y un pájaro.
  r(c, 52, 8, 16, 4, "#c9d6e8");
  r(c, 56, 6, 8, 2, "#c9d6e8");
  r(c, 30, 12, 2, 1, "#0b1030");
  r(c, 32, 13, 1, 1, "#0b1030");
  r(c, 33, 12, 2, 1, "#0b1030");
  // Pasto con flores.
  r(c, 0, 52, 96, 20, "#1f7a3a");
  for (let x = 2; x < 96; x += 7) r(c, x, 58 + (x % 3) * 4, 3, 1, "#186a31");
  [[20, 64], [62, 60], [70, 67], [88, 63], [8, 69]].forEach(([x, y]) => r(c, x, y, 1, 1, "#ff006e"));
  // Árbol con su sombra bien puesta: hacia la derecha, lejos del sol.
  r(c, 84, 52, 12, 3, "#145a28");
  r(c, 80, 34, 4, 18, "#6b4226");
  r(c, 72, 20, 20, 15, "#2e9e4f");
  r(c, 75, 16, 14, 5, "#2e9e4f");
  r(c, 74, 24, 3, 3, "#39b85e");
  r(c, 84, 19, 3, 2, "#39b85e");
  // Letrero con texto sin sentido (error 3).
  r(c, 12, 40, 2, 12, "#6b4226");
  r(c, 4, 31, 20, 10, "#6b4226");
  r(c, 5, 32, 18, 8, "#e8dcc0");
  garabatos(c, 6, 33, 16, 2, "#3b2412", 7);
  // Sombra de la persona hacia el sol (error 2).
  r(c, 25, 52, 16, 3, "#145a28");
  // Persona saludando.
  r(c, 40, 44, 3, 8, "#2b3f8f");
  r(c, 44, 44, 3, 8, "#2b3f8f");
  r(c, 39, 51, 4, 1, "#1a1a24");
  r(c, 44, 51, 4, 1, "#1a1a24");
  r(c, 38, 32, 11, 12, "#ff006e");
  r(c, 39, 23, 9, 9, "#d9a066");
  r(c, 39, 22, 9, 3, "#3b2412");
  r(c, 41, 27, 1, 1, "#1a1a24");
  r(c, 45, 27, 1, 1, "#1a1a24");
  r(c, 42, 29, 3, 1, "#8a4a2a");
  r(c, 35, 33, 3, 9, "#d9a066");
  // Brazo arriba y mano con 6 dedos (error 1).
  r(c, 48, 22, 2, 11, "#d9a066");
  r(c, 44, 18, 12, 5, "#d9a066");
  [44, 46, 48, 50, 52].forEach((x) => r(c, x, 13, 1, 5, "#d9a066"));
  r(c, 54, 15, 2, 3, "#d9a066");
}

/* ------------------------------------------------------------ café */

function cafe(c: Ctx) {
  r(c, 0, 0, 96, 48, "#3a2a4a");
  for (let x = 0; x < 96; x += 12) r(c, x, 0, 1, 48, "#34253f");
  r(c, 0, 48, 96, 24, "#5a3a22");
  for (let y = 52; y < 72; y += 5) r(c, 0, y, 96, 1, "#4a2f1b");
  // Ventana.
  r(c, 5, 7, 26, 22, "#e8f4e8");
  r(c, 7, 9, 22, 18, "#26508a");
  r(c, 17, 9, 2, 18, "#e8f4e8");
  r(c, 10, 13, 6, 2, "#c9d6e8");
  // Lámpara.
  r(c, 44, 0, 1, 8, "#8090a0");
  r(c, 40, 8, 9, 4, "#ffe600");
  r(c, 42, 12, 5, 1, "#fff4a0");
  // Menú con letras que no son letras (error 1).
  r(c, 61, 5, 30, 20, "#6b4226");
  r(c, 62, 6, 28, 18, "#1a1a1a");
  r(c, 66, 8, 20, 2, "#e8f4e8");
  garabatos(c, 64, 12, 24, 2, "#c9d6e8", 42);
  // Mesa (bien apoyada) con taza y plato.
  r(c, 26, 40, 32, 3, "#8a5a32");
  r(c, 29, 43, 3, 5, "#6b4226");
  r(c, 52, 43, 3, 5, "#6b4226");
  r(c, 33, 39, 10, 1, "#c9d6e8");
  r(c, 35, 35, 6, 4, "#e8f4e8");
  r(c, 41, 36, 2, 2, "#e8f4e8");
  r(c, 36, 33, 1, 1, "#8090a0");
  r(c, 38, 32, 1, 1, "#8090a0");
  // Silla.
  r(c, 60, 34, 2, 14, "#6b4226");
  r(c, 60, 42, 10, 2, "#6b4226");
  r(c, 68, 44, 2, 4, "#6b4226");
  // Taza flotando en el aire, sin nada debajo (error 2).
  r(c, 15, 34, 6, 5, "#e8f4e8");
  r(c, 21, 35, 2, 2, "#e8f4e8");
  r(c, 16, 32, 1, 1, "#8090a0");
  // Gato con 5 patas (error 3).
  r(c, 66, 54, 15, 6, "#e08a2e");
  r(c, 78, 49, 7, 6, "#e08a2e");
  r(c, 78, 47, 2, 2, "#e08a2e");
  r(c, 83, 47, 2, 2, "#e08a2e");
  r(c, 80, 51, 1, 1, "#1a1a24");
  r(c, 83, 51, 1, 1, "#1a1a24");
  r(c, 63, 50, 2, 6, "#e08a2e");
  r(c, 69, 57, 3, 1, "#b86a1e");
  [67, 70, 73, 76, 79].forEach((x) => r(c, x, 60, 1, 4, "#e08a2e"));
}

/* ------------------------------------------------------------ calle */

function calle(c: Ctx) {
  r(c, 0, 0, 96, 58, "#0b1030");
  [[10, 4], [26, 9], [58, 5], [70, 13], [90, 20], [34, 2], [48, 16]].forEach(([x, y]) => r(c, x, y, 1, 1, "#c9d6e8"));
  // Luna.
  r(c, 79, 5, 8, 8, "#e8f4e8");
  r(c, 84, 5, 3, 4, "#0b1030");
  // Edificios con ventanas encendidas.
  r(c, 3, 18, 28, 40, "#1d2240");
  for (let y = 22; y < 54; y += 7) for (let x = 6; x < 29; x += 6) r(c, x, y, 3, 4, (x + y) % 3 ? "#ffe600" : "#2b3350");
  r(c, 62, 24, 30, 34, "#22284a");
  for (let y = 28; y < 54; y += 7) for (let x = 65; x < 90; x += 6) r(c, x, y, 3, 4, (x * y) % 5 ? "#ffe600" : "#2b3350");
  // Ventana flotando en el cielo, fuera de todo edificio (error 1).
  r(c, 40, 9, 5, 6, "#1d2240");
  r(c, 41, 10, 3, 4, "#ffe600");
  // Calle.
  r(c, 0, 58, 96, 14, "#1a1a24");
  for (let x = 2; x < 96; x += 12) r(c, x, 65, 6, 1, "#8090a0");
  // Poste con luz amarilla.
  r(c, 50, 30, 2, 28, "#6d7b92");
  r(c, 47, 28, 8, 3, "#ffe600");
  r(c, 48, 31, 6, 1, "#fff4a0");
  // Charco que refleja una luz rosada y no amarilla (error 3).
  r(c, 44, 66, 18, 5, "#26345e");
  r(c, 50, 66, 2, 3, "#6d7b92");
  r(c, 47, 69, 8, 2, "#ff006e");
  // Carro con tres ruedas del mismo lado (error 2).
  r(c, 12, 50, 32, 7, "#00a0c0");
  r(c, 18, 45, 17, 5, "#00a0c0");
  r(c, 20, 46, 6, 3, "#9fe8ff");
  r(c, 28, 46, 5, 3, "#9fe8ff");
  r(c, 42, 52, 2, 2, "#ffe600");
  [14, 25, 36].forEach((x) => {
    r(c, x, 55, 6, 5, "#0a0a12");
    r(c, x + 2, 57, 2, 1, "#6d7b92");
  });
}

export const ESCENAS: Escena[] = [
  {
    id: "parque",
    nombre: { es: "Foto en el parque", en: "Photo in the park" },
    dibujar: parque,
    glitches: [
      {
        x: 42, y: 11, w: 16, h: 13,
        texto: { es: "Mano con 6 dedos. A las IA de imagen todavía se les enredan a veces las manos.", en: "A hand with 6 fingers. AI image tools still get hands tangled up sometimes." },
      },
      {
        x: 23, y: 50, w: 20, h: 7,
        texto: { es: "La sombra va hacia el sol. En una foto real va al lado contrario de la luz, como la del árbol.", en: "The shadow points toward the sun. In a real photo it falls away from the light, like the tree's." },
      },
      {
        x: 3, y: 30, w: 22, h: 12,
        texto: { es: "Letras que no son letras. A muchas IA de imagen les cuesta escribir texto que se pueda leer.", en: "Letters that aren't letters. Many AI image tools struggle to write readable text." },
      },
    ],
  },
  {
    id: "cafe",
    nombre: { es: "Un café tranquilo", en: "A quiet café" },
    dibujar: cafe,
    glitches: [
      {
        x: 60, y: 4, w: 32, h: 22,
        texto: { es: "El menú dice cosas que no son palabras. El texto es de lo que más delata una imagen de IA.", en: "The menu says things that aren't words. Text is one of the biggest giveaways of an AI image." },
      },
      {
        x: 13, y: 30, w: 12, h: 11,
        texto: { es: "Una taza flotando en el aire. La IA imita cómo se ven las cosas, pero no entiende la física.", en: "A cup floating in mid-air. AI copies how things look, but it doesn't understand physics." },
      },
      {
        x: 64, y: 56, w: 19, h: 10,
        texto: { es: "El gato tiene 5 patas. Contar dedos, patas y orejas es un truco clásico para detectar imágenes de IA.", en: "The cat has 5 legs. Counting fingers, legs and ears is a classic trick for spotting AI images." },
      },
    ],
  },
  {
    id: "calle",
    nombre: { es: "Calle de noche", en: "Street at night" },
    dibujar: calle,
    glitches: [
      {
        x: 38, y: 7, w: 9, h: 10,
        texto: { es: "Una ventana flotando en el cielo, fuera del edificio. Cosas que aparecen donde no tienen sentido.", en: "A window floating in the sky, outside any building. Things that show up where they make no sense." },
      },
      {
        x: 12, y: 53, w: 32, h: 9,
        texto: { es: "Tres ruedas del mismo lado del carro. La IA a veces duplica partes.", en: "Three wheels on one side of the car. AI sometimes duplicates parts." },
      },
      {
        x: 43, y: 64, w: 20, h: 8,
        texto: { es: "El reflejo del charco es rosado y la luz del poste es amarilla: no coinciden.", en: "The puddle's reflection is pink but the lamp is yellow: they don't match." },
      },
    ],
  },
];
