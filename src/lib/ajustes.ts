// Los números del juego y los mensajes que el admin puede cambiar sin tocar
// código: cuánta gasolina hay, cuánto cuesta fallar o pedir una pista, cuánto
// XP da cada lección, desde cuánto XP se sube de rango, y el anuncio de /inicio.
//
// Se guardan en Firebase en `contenido/ajustes` y los carga `contenido.ts` junto
// con el catálogo. Mientras no existan (o si Firebase no responde) se usan los
// valores de abajo, que son los que el juego tuvo siempre.
//
// IMPORTANTE: las reglas de Firestore leen este mismo documento para saber
// cuánta gasolina y cuánto XP aceptar. Si se agrega un número que limita lo que
// el usuario puede guardar, hay que usarlo también en firestore.rules.
import type { Texto } from "./i18n";

export type AjustesJuego = {
  /** Tanque lleno. También es la recarga diaria. */
  gasolinaMaxima: number;
  /** Lo que cuesta fallar un ejercicio. */
  costoError: number;
  /** Lo que cuesta ver una pista. */
  costoPista: number;
  /** XP de una lección sin errores. */
  xpPerfecta: number;
  /** XP con 1 o 2 errores. */
  xpBuena: number;
  /** XP con 3 errores o más. */
  xpBasica: number;
  /** XP extra si termina antes del tiempo objetivo. */
  bonoVelocidad: number;
  /**
   * XP desde el que empieza cada rango del escalafón (ver rangos.ts).
   * El rango 1, Cadete, empieza en 0.
   */
  xpRango2: number;
  xpRango3: number;
  xpRango4: number;
  xpRango5: number;
  xpRango6: number;
  xpRango7: number;
  xpRango8: number;
  xpRango9: number;
  xpRango10: number;
  /**
   * Lo máximo que una lección puede sumar de una vez. Se calcula al guardar
   * (la mejor nota + el bono) y lo usan las reglas de Firestore.
   */
  xpMaximo: number;
};

export type TonoAnuncio = "info" | "alerta" | "celebracion";

export type Anuncio = {
  activo: boolean;
  tono: TonoAnuncio;
  texto: Texto;
};

export type Ajustes = { juego: AjustesJuego; anuncio: Anuncio };

export const AJUSTES_POR_DEFECTO: Ajustes = {
  juego: {
    gasolinaMaxima: 5,
    costoError: 1,
    costoPista: 0.5,
    xpPerfecta: 15,
    xpBuena: 10,
    xpBasica: 5,
    bonoVelocidad: 5,
    // Una pasada completa por la escuela da unos 400-500 XP (Piloto o
    // Capitán). Los rangos altos se ganan repitiendo y practicando.
    xpRango2: 40,
    xpRango3: 120,
    xpRango4: 250,
    xpRango5: 450,
    xpRango6: 700,
    xpRango7: 1000,
    xpRango8: 1400,
    xpRango9: 1900,
    xpRango10: 2600,
    xpMaximo: 20,
  },
  anuncio: { activo: false, tono: "info", texto: { es: "", en: "" } },
};

/** La mejor nota posible de una lección: lo que las reglas dejan sumar. */
export function calcularXpMaximo(j: AjustesJuego): number {
  return Math.max(j.xpPerfecta, j.xpBuena, j.xpBasica) + j.bonoVelocidad;
}

/**
 * Mezcla lo que vino de Firebase con los valores por defecto: si falta un
 * campo o viene con un tipo raro, se usa el de siempre. Así un documento a
 * medias nunca rompe el juego.
 */
export function normalizarAjustes(datos: unknown): Ajustes {
  const d = (datos ?? {}) as Partial<{ juego: Partial<AjustesJuego>; anuncio: Partial<Anuncio> }>;
  const juego = { ...AJUSTES_POR_DEFECTO.juego };
  for (const clave of Object.keys(juego) as (keyof AjustesJuego)[]) {
    const v = d.juego?.[clave];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) juego[clave] = v;
  }
  const a = d.anuncio;
  const anuncio: Anuncio = {
    activo: a?.activo === true,
    tono: a?.tono === "alerta" || a?.tono === "celebracion" ? a.tono : "info",
    texto: {
      es: typeof a?.texto?.es === "string" ? a.texto.es : "",
      en: typeof a?.texto?.en === "string" ? a.texto.en : "",
    },
  };
  return { juego, anuncio };
}

/**
 * Validación del formulario del admin. Devuelve los problemas en palabras;
 * vacío = se puede guardar.
 */
export function validarJuego(j: AjustesJuego): string[] {
  const p: string[] = [];
  const entero = (v: number) => Number.isInteger(v);
  const mitades = (v: number) => Number.isInteger(v * 2);
  if (!entero(j.gasolinaMaxima) || j.gasolinaMaxima < 1 || j.gasolinaMaxima > 20)
    p.push("Gasolina máxima: un número entero entre 1 y 20");
  if (!mitades(j.costoError) || j.costoError <= 0 || j.costoError > j.gasolinaMaxima)
    p.push("Costo de fallar: mayor que 0, en pasos de 0,5 y no más que el tanque");
  if (!mitades(j.costoPista) || j.costoPista < 0 || j.costoPista > j.gasolinaMaxima)
    p.push("Costo de la pista: 0 o más, en pasos de 0,5 y no más que el tanque");
  for (const [clave, nombre] of [
    ["xpPerfecta", "XP sin errores"],
    ["xpBuena", "XP con 1 o 2 errores"],
    ["xpBasica", "XP con 3 errores o más"],
    ["bonoVelocidad", "Bono de velocidad"],
  ] as const) {
    if (!entero(j[clave]) || j[clave] < 0 || j[clave] > 100) p.push(`${nombre}: un número entero entre 0 y 100`);
  }
  if (!(j.xpPerfecta >= j.xpBuena && j.xpBuena >= j.xpBasica))
    p.push("El XP tiene que ir de mayor a menor: sin errores ≥ 1-2 errores ≥ 3 o más");
  let anterior = 0;
  for (let n = 2; n <= 10; n++) {
    const v = j[`xpRango${n}` as keyof AjustesJuego];
    if (!entero(v) || v <= anterior) {
      p.push(`XP del rango ${n}: un número entero mayor que el del rango ${n - 1}`);
      break;
    }
    anterior = v;
  }
  return p;
}

/* ------------------------------------------------ valor vigente */

// El valor que está usando la app en este momento. Lo actualiza contenido.ts
// cuando llegan los ajustes de Firebase. Las funciones del juego (progreso.ts,
// rangos.ts) lo leen de aquí para no tener que recibirlo como parámetro.
let vigentes: Ajustes = AJUSTES_POR_DEFECTO;

export function ajustesVigentes(): Ajustes {
  return vigentes;
}

export function fijarAjustes(a: Ajustes) {
  vigentes = a;
}

/** "media gasolina", "1 gasolina", "gratis"… para los textos de la app. */
export function textoCosto(costo: number, idioma: "es" | "en"): string {
  if (costo === 0) return idioma === "es" ? "gratis" : "free";
  if (costo === 0.5) return idioma === "es" ? "cuesta media gasolina" : "costs half a fuel";
  const n = String(costo).replace(".", idioma === "es" ? "," : ".");
  if (idioma === "es") return `cuesta ${n} ${costo === 1 ? "gasolina" : "gasolinas"}`;
  return `costs ${n} fuel`;
}
