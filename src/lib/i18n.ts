/**
 * Idiomas de Punti. Por ahora dos: español e inglés.
 *
 * La regla del producto es "replicar el contenido": no es una traducción
 * automática encima de la app, es el mismo viaje escrito dos veces. Por eso
 * cada texto vive junto a su gemelo en el componente que lo usa, en vez de un
 * archivo gigante de claves donde nadie sabe qué va con qué.
 */

export type Idioma = "es" | "en";

export const IDIOMAS: Record<Idioma, { nombre: string; codigo: string; lema: string; saludo: string }> = {
  es: {
    nombre: "Español",
    codigo: "ES",
    lema: "Todo el viaje en español",
    saludo: "¡Hola, viajero! Entonces vamos en español.",
  },
  en: {
    nombre: "English",
    codigo: "EN",
    lema: "The whole journey in English",
    saludo: "Hello, traveler! English it is.",
  },
};

export const IDIOMA_POR_DEFECTO: Idioma = "es";

/** Normaliza lo que venga de la base de datos: cualquier cosa rara cae a español. */
export function idiomaValido(valor: unknown): Idioma {
  return valor === "en" ? "en" : "es";
}

/**
 * Prepara un texto para la fuente pixel (Press Start 2P): mayúsculas y sin
 * tildes. Esa fuente no trae mayúsculas acentuadas, y si un texto lleva
 * Á, É, Í, Ó, Ú o Ñ el navegador cambia de fuente solo en esa letra —
 * "BRÚJULA" sale con la Ú en otra tipografía y a otra altura. Los juegos de
 * la época tampoco las tenían.
 */
export function textoPixel(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

/** Un texto escrito en los dos idiomas, uno al lado del otro. */
export type Texto = Record<Idioma, string>;
