// La Ficha de misión como imagen (fase C2): un PNG de 1080 x 1350, el tamaño
// vertical de Instagram, para que el piloto la comparta o la guarde.
//
// Se dibuja en un <canvas> a mano, sin librerías, para que no pese: este
// archivo solo se descarga cuando alguien toca "Guardar imagen" (se importa
// con import() desde el botón). Estilo de la app: fondo del espacio, verdes y
// cian de neón, Punti en pixel art con escala entera (nítido, sin suavizar),
// y las mismas fuentes de la app, leídas de las variables que pone next/font.
//
// Todo lo que viene del piloto se pinta como texto con fillText: nunca se
// interpreta como HTML. Si falta un dato (por ejemplo, una ficha vieja sin
// concepto), esa parte de la imagen simplemente no aparece.
import type { Idioma } from "./i18n";
import { textoPixel } from "./i18n";
import { ALTO, ANCHO, dibujarPunti } from "./puntiSprite";

export type PiezaFicha = { titulo: string; color?: string; usada: boolean };

export type DatosFichaImagen = {
  idioma: Idioma;
  titulo: string;
  piloto?: string;
  /** Código corto de la misión (ECO-1.01), si se conoce. */
  codigo?: string;
  xp?: number;
  combustible?: 1 | 2 | 3;
  transmisiones?: number;
  concepto?: { titulo?: string; frase?: string; definicion?: string };
  mejorPrompt?: string;
  piezas?: PiezaFicha[];
  fecha?: Date | null;
};

/* ------------------------------------------------------------ medidas */

const W = 1080;
const H = 1350;
/** Marco exterior y margen del contenido. */
const MARCO = 36;
const X0 = 88;
const ANCHO_UTIL = W - X0 * 2;
/** Donde empieza el pie ("punti.space"): el contenido nunca pasa de aquí. */
const PIE = H - MARCO - 92;

const C = {
  fondo: "#050510",
  matrix: "#00ff41",
  cyan: "#00f5ff",
  oro: "#ffe600",
  rosa: "#ff006e",
  morado: "#b400ff",
  lila: "#d88bff",
  muted: "#8090a0",
  apagado: "#636898",
  borde: "#262a52",
  terminal: "#b9ffcb",
  claro: "#d9ffe3",
};

const TXT: Record<Idioma, Record<string, string>> = {
  es: {
    ficha: "Ficha de misión",
    completada: "Completada",
    piloto: "Piloto",
    xp: "XP ganado",
    combustible: "Combustible",
    transmisiones: "Transmisiones",
    piezas: "Piezas usadas",
    aprendiste: "Lo que aprendiste",
    tu: "Tú",
    punti: "Punti",
    mejor: "Tu mejor prompt",
    lema: "Aprende IA jugando",
  },
  en: {
    ficha: "Mission card",
    completada: "Completed",
    piloto: "Pilot",
    xp: "XP earned",
    combustible: "Thrust",
    transmisiones: "Transmissions",
    piezas: "Pieces used",
    aprendiste: "What you learned",
    tu: "You",
    punti: "Punti",
    mejor: "Your best prompt",
    lema: "Learn AI by playing",
  },
};

const MESES: Record<Idioma, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

/* ------------------------------------------------------------ fuentes */

type Fuentes = { display: string; terminal: string; ui: string; pixel: string; sans: string };

/**
 * Las fuentes de la app. next/font pone en <html> variables como
 * --font-orbitron con el nombre real de la familia ("'Orbitron', 'Orbitron Fallback'").
 * Se leen de ahí; si alguna falta, se usa una genérica del sistema.
 */
function leerFuentes(): Fuentes {
  let css: CSSStyleDeclaration | null = null;
  try {
    css = getComputedStyle(document.documentElement);
  } catch {
    /* sin estilos: quedan las genéricas */
  }
  const leer = (variable: string, generica: string) => {
    const v = css?.getPropertyValue(variable).trim();
    return v ? `${v}, ${generica}` : generica;
  };
  return {
    display: leer("--font-orbitron", "sans-serif"),
    terminal: leer("--font-vt323", "monospace"),
    ui: leer("--font-rajdhani", "sans-serif"),
    pixel: leer("--font-press-start", "monospace"),
    sans: leer("--font-inter", "sans-serif"),
  };
}

/**
 * El canvas no espera a las fuentes: si se dibuja antes de que lleguen, sale
 * con la letra del sistema. Se piden y se espera un máximo de 3 segundos; si
 * no llegan (sin conexión), la imagen sale igual con las de respaldo.
 */
async function cargarFuentes(especificaciones: string[]) {
  if (typeof document === "undefined" || !document.fonts) return;
  const todas = Promise.all(especificaciones.map((f) => document.fonts.load(f).catch(() => []))).then(() => document.fonts.ready);
  await Promise.race([todas, new Promise((r) => setTimeout(r, 3000))]).catch(() => undefined);
}

/* ---------------------------------------------------------- texto */

/** Quita caracteres de control y espacios repetidos (el texto es de una línea). */
const unaLinea = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();

/**
 * Parte un texto en líneas que caben en `ancho` con la fuente que tenga el
 * contexto. Respeta los saltos de línea del piloto, corta las palabras
 * larguísimas (un enlace, "aaaaaa…") por letras, y si pasa de `maxLineas`
 * la última línea termina en "…". Nunca devuelve una línea más ancha que `ancho`.
 */
export function envolverTexto(ctx: CanvasRenderingContext2D, texto: string, ancho: number, maxLineas: number): string[] {
  if (maxLineas <= 0) return [];
  const mide = (s: string) => ctx.measureText(s).width;
  const lineas: string[] = [];
  const parrafos = texto
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, " ")
    .split("\n")
    .map((p) => p.replace(/\s+/g, " ").trim());
  // Sin líneas en blanco de más: en una imagen solo gastan espacio.
  const limpios = parrafos.filter((p, i) => p || (i > 0 && parrafos[i - 1]));
  while (limpios.length && !limpios[limpios.length - 1]) limpios.pop();

  let cortado = false;
  fuera: for (const p of limpios) {
    if (!p) {
      if (lineas.length >= maxLineas) {
        cortado = true;
        break;
      }
      lineas.push("");
      continue;
    }
    let actual = "";
    for (const palabra of p.split(" ")) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (mide(prueba) <= ancho) {
        actual = prueba;
        continue;
      }
      if (actual) {
        if (lineas.length >= maxLineas) {
          cortado = true;
          break fuera;
        }
        lineas.push(actual);
        actual = "";
      }
      // La palabra sola no cabe: se parte por letras.
      let resto = palabra;
      while (mide(resto) > ancho) {
        let n = resto.length - 1;
        while (n > 1 && mide(resto.slice(0, n)) > ancho) n--;
        if (lineas.length >= maxLineas) {
          cortado = true;
          break fuera;
        }
        lineas.push(resto.slice(0, n));
        resto = resto.slice(n);
      }
      actual = resto;
    }
    if (actual) {
      if (lineas.length >= maxLineas) {
        cortado = true;
        break;
      }
      lineas.push(actual);
    }
  }
  if (cortado && lineas.length) {
    let ultima = lineas[lineas.length - 1].trimEnd();
    while (ultima && mide(`${ultima}…`) > ancho) ultima = ultima.slice(0, -1).trimEnd();
    lineas[lineas.length - 1] = `${ultima}…`;
  }
  return lineas;
}

/** Una sola línea que nunca se sale: si no cabe, termina en "…". */
function recortar(ctx: CanvasRenderingContext2D, texto: string, ancho: number) {
  return envolverTexto(ctx, unaLinea(texto), ancho, 1)[0] ?? "";
}

/**
 * Deja en el contexto la fuente más grande (entre `max` y `min`) con la que
 * el texto cabe en `ancho`, y devuelve el texto (recortado con "…" si ni
 * con la mínima cabe). Sirve cuando llega la fuente de respaldo, que es más ancha.
 */
function ajustar(ctx: CanvasRenderingContext2D, texto: string, ancho: number, fuente: (tam: number) => string, max: number, min: number) {
  for (let tam = max; tam >= min; tam--) {
    ctx.font = fuente(tam);
    if (ctx.measureText(texto).width <= ancho) return texto;
  }
  return recortar(ctx, texto, ancho);
}

/* ---------------------------------------------------------- dibujo */

/** Números al azar pero siempre los mismos para la misma misión (las estrellas no bailan). */
function azar(semilla: string) {
  let h = 2166136261;
  for (let i = 0; i < semilla.length; i++) h = Math.imul(h ^ semilla.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function fondo(ctx: CanvasRenderingContext2D, semilla: string) {
  ctx.fillStyle = C.fondo;
  ctx.fillRect(0, 0, W, H);
  // El mismo degradado de la tarjeta de la app: azul noche arriba, morado abajo.
  const g = ctx.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, "#0f1a2e");
  g.addColorStop(0.45, "#0b0c1d");
  g.addColorStop(1, "#160a2a");
  ctx.fillStyle = g;
  ctx.fillRect(MARCO, MARCO, W - MARCO * 2, H - MARCO * 2);

  // Estrellas: cuadritos de 2 a 6 px, muy tenues para no pelear con el texto.
  const r = azar(semilla);
  const colores = ["#ffffff", C.cyan, C.lila, C.matrix];
  for (let i = 0; i < 140; i++) {
    const x = Math.floor(r() * W);
    const y = Math.floor(r() * H);
    const t = r() < 0.85 ? 2 : r() < 0.7 ? 4 : 6;
    ctx.globalAlpha = 0.12 + r() * 0.35;
    ctx.fillStyle = colores[Math.floor(r() * colores.length)];
    ctx.fillRect(x, y, t, t);
    if (t === 6) {
      // Las grandes llevan cruz de destello, como en la galaxia de la app.
      ctx.globalAlpha *= 0.6;
      ctx.fillRect(x - 4, y + 2, 14, 2);
      ctx.fillRect(x + 2, y - 4, 2, 14);
    }
  }
  ctx.globalAlpha = 1;

  // Líneas de barrido (scanlines) muy suaves.
  ctx.fillStyle = "rgba(255,255,255,0.018)";
  for (let y = MARCO; y < H - MARCO; y += 4) ctx.fillRect(MARCO, y, W - MARCO * 2, 1);
}

function marco(ctx: CanvasRenderingContext2D) {
  // Doble borde: verde de neón con un halo, y otro fino por dentro.
  ctx.save();
  ctx.shadowColor = "rgba(0,255,65,0.45)";
  ctx.shadowBlur = 24;
  ctx.strokeStyle = C.matrix;
  ctx.lineWidth = 4;
  ctx.strokeRect(MARCO + 2, MARCO + 2, W - MARCO * 2 - 4, H - MARCO * 2 - 4);
  ctx.restore();
  ctx.strokeStyle = "rgba(0,255,65,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(MARCO + 14, MARCO + 14, W - MARCO * 2 - 28, H - MARCO * 2 - 28);
  // Esquinas en pixel, en cian.
  ctx.fillStyle = C.cyan;
  const e = 28;
  const g = 6;
  for (const [x, y, sx, sy] of [
    [MARCO, MARCO, 1, 1],
    [W - MARCO, MARCO, -1, 1],
    [MARCO, H - MARCO, 1, -1],
    [W - MARCO, H - MARCO, -1, -1],
  ]) {
    ctx.fillRect(sx > 0 ? x : x - e, sy > 0 ? y : y - g, e, g);
    ctx.fillRect(sx > 0 ? x : x - g, sy > 0 ? y : y - e, g, e);
  }
}

/** Punti con escala entera, en un canvas aparte y copiado sin suavizar. */
function punti(ctx: CanvasRenderingContext2D, x: number, y: number, escala: number) {
  const aparte = document.createElement("canvas");
  aparte.width = ANCHO * escala;
  aparte.height = ALTO * escala;
  const c2 = aparte.getContext("2d");
  if (!c2) return;
  dibujarPunti(c2, "levelup", escala);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(aparte, Math.round(x), Math.round(y));
}

function lineaPunteada(ctx: CanvasRenderingContext2D, y: number, color: string) {
  ctx.fillStyle = color;
  for (let x = X0; x < X0 + ANCHO_UTIL; x += 16) ctx.fillRect(x, y, 8, 2);
}

/** Etiqueta pequeña en fuente pixel (sin tildes: esa fuente no las trae). */
function etiqueta(ctx: CanvasRenderingContext2D, f: Fuentes, texto: string, x: number, y: number, color: string, tam = 18, anchoMax = ANCHO_UTIL) {
  ctx.font = `${tam}px ${f.pixel}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(recortar(ctx, textoPixel(texto), anchoMax), x, y);
}

/* ---------------------------------------------------------- armado */

type Bloque = { alto: number; dibujar: (y: number) => void };
type Limites = { frase: number; definicion: number; prompt: number };

function fechaTexto(d: Date, idioma: Idioma) {
  return `${d.getDate()} ${MESES[idioma][d.getMonth()]} ${d.getFullYear()}`;
}

/** Punti en el encabezado: escala 5 (160 x 180 px). */
const ESCALA_CABECERA = 5;
const COLUMNA_PUNTI = ANCHO * ESCALA_CABECERA + 24;

/** Sello de "completada", girado como un sello de tinta, centrado en (cx, cy). */
function sello(ctx: CanvasRenderingContext2D, f: Fuentes, texto: string, cx: number, cy: number) {
  ctx.save();
  ctx.font = `16px ${f.pixel}`;
  const ancho = Math.ceil(ctx.measureText(texto).width) + 36;
  ctx.translate(cx, cy);
  ctx.rotate((8 * Math.PI) / 180);
  ctx.fillStyle = "rgba(5,5,16,0.85)";
  ctx.fillRect(-ancho / 2, -30, ancho, 60);
  ctx.strokeStyle = C.oro;
  ctx.lineWidth = 4;
  ctx.strokeRect(-ancho / 2, -30, ancho, 60);
  ctx.strokeStyle = "rgba(255,230,0,0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-ancho / 2 + 8, -22, ancho - 16, 44);
  ctx.fillStyle = C.oro;
  ctx.textBaseline = "middle";
  ctx.fillText(texto, -ancho / 2 + 18, 2);
  ctx.restore();
}

/**
 * El encabezado: etiqueta, título de la misión, piloto y fecha. `conPunti`
 * pone a Punti a la derecha (cuando la ficha viene llena); si no, Punti va
 * grande más abajo y aquí solo queda el sello.
 */
function armarCabecera(ctx: CanvasRenderingContext2D, f: Fuentes, d: DatosFichaImagen, conPunti: boolean): Bloque {
  const t = TXT[d.idioma];
  ctx.font = `16px ${f.pixel}`;
  const textoSello = textoPixel(t.completada);
  const anchoSello = Math.ceil(ctx.measureText(textoSello).width) + 36;
  // El texto nunca llega a la columna de la derecha (Punti y el sello).
  const anchoTexto = ANCHO_UTIL - (conPunti ? Math.max(COLUMNA_PUNTI, anchoSello + 28) : anchoSello + 40);

  ctx.font = `900 58px ${f.display}`;
  const lt = envolverTexto(ctx, unaLinea(d.titulo || ""), anchoTexto, 2);
  // Si el piloto no tiene nombre, la app le dice "Piloto": no se repite ("Piloto Piloto").
  const nombre = unaLinea(d.piloto ?? "");
  const conNombre = nombre && nombre.toLowerCase() !== t.piloto.toLowerCase() ? `${t.piloto} ${nombre}` : t.piloto;
  const partes = [d.piloto !== undefined ? conNombre : "", d.fecha ? fechaTexto(d.fecha, d.idioma) : ""].filter(Boolean);
  const altoTexto = 44 + Math.max(1, lt.length) * 66 + 4 + (partes.length ? 48 : 0);
  const altoPunti = conPunti ? ALTO * ESCALA_CABECERA + 28 : 0;
  const alto = Math.max(altoTexto, altoPunti) + 14 + 2;

  return {
    alto,
    dibujar: (y0) => {
      let y = y0;
      ctx.save();
      ctx.shadowColor = "rgba(0,255,65,0.6)";
      ctx.shadowBlur = 10;
      etiqueta(ctx, f, d.codigo ? `${t.ficha} · ${d.codigo}` : t.ficha, X0, y, C.matrix, 20, anchoTexto);
      ctx.restore();
      y += 44;
      ctx.font = `900 58px ${f.display}`;
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";
      lt.forEach((l, i) => ctx.fillText(l, X0, y + i * 66));
      y += Math.max(1, lt.length) * 66 + 4;
      if (partes.length) {
        ctx.font = `42px ${f.terminal}`;
        ctx.fillStyle = C.cyan;
        ctx.fillText(recortar(ctx, partes.join(" · "), anchoTexto), X0, y);
      }
      const xDerecha = X0 + ANCHO_UTIL;
      if (conPunti) {
        const xp = xDerecha - ANCHO * ESCALA_CABECERA - 4;
        halo(ctx, xp + (ANCHO * ESCALA_CABECERA) / 2, y0 + 80, 120);
        punti(ctx, xp, y0 - 24, ESCALA_CABECERA);
        sello(ctx, f, textoSello, xDerecha - anchoSello / 2 - 4, y0 + altoPunti - 18);
      } else {
        sello(ctx, f, textoSello, xDerecha - anchoSello / 2 - 6, y0 + 40);
      }
      lineaPunteada(ctx, y0 + alto - 2, "rgba(0,255,65,0.4)");
    },
  };
}

/** Resplandor verde detrás de Punti. */
function halo(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, r);
  g.addColorStop(0, "rgba(0,255,65,0.2)");
  g.addColorStop(1, "rgba(0,255,65,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

/** Los números de la misión en una fila de casillas de HUD. */
function armarNumeros(ctx: CanvasRenderingContext2D, f: Fuentes, d: DatosFichaImagen): Bloque | null {
  const t = TXT[d.idioma];
  const datos: { valor: string; etiqueta: string; barras?: number }[] = [];
  if (typeof d.xp === "number") datos.push({ valor: `+${d.xp}`, etiqueta: t.xp });
  if (d.combustible) datos.push({ valor: "", etiqueta: `${t.combustible} ${d.combustible}/3`, barras: d.combustible });
  if (typeof d.transmisiones === "number") datos.push({ valor: String(d.transmisiones), etiqueta: t.transmisiones });
  const piezas = d.piezas ?? [];
  const usadas = piezas.filter((p) => p.usada).length;
  if (piezas.length) datos.push({ valor: piezas.some((p) => !p.usada) ? `${usadas}/${piezas.length}` : String(usadas), etiqueta: t.piezas });
  if (!datos.length) return null;

  const gap = 18;
  const alto = 116;
  const ancho = Math.floor((ANCHO_UTIL - gap * (datos.length - 1)) / datos.length);
  return {
    alto,
    dibujar: (y) => {
      datos.forEach((dato, i) => {
        const x = X0 + i * (ancho + gap);
        ctx.fillStyle = "rgba(5,5,16,0.82)";
        ctx.fillRect(x, y, ancho, alto);
        ctx.strokeStyle = C.borde;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, ancho - 2, alto - 2);
        // Esquinita dorada, detalle de HUD.
        ctx.fillStyle = C.oro;
        ctx.fillRect(x, y, 12, 4);
        ctx.fillRect(x, y, 4, 12);
        if (dato.barras) {
          for (let k = 0; k < 3; k++) {
            const on = k < dato.barras;
            ctx.save();
            if (on) {
              ctx.shadowColor = "rgba(0,255,65,0.55)";
              ctx.shadowBlur = 12;
            }
            ctx.fillStyle = on ? C.matrix : "#1b1e3d";
            ctx.fillRect(x + 20 + k * 30, y + 18, 20, 44);
            ctx.restore();
          }
        } else {
          ctx.font = `64px ${f.terminal}`;
          ctx.fillStyle = C.oro;
          ctx.textBaseline = "top";
          ctx.fillText(recortar(ctx, dato.valor, ancho - 36), x + 20, y + 10);
        }
        const etiquetaDato = ajustar(ctx, dato.etiqueta, ancho - 34, (n) => `600 ${n}px ${f.ui}`, 24, 17);
        ctx.fillStyle = C.muted;
        ctx.textBaseline = "top";
        ctx.fillText(etiquetaDato, x + 20, y + 74);
      });
    },
  };
}

/** Punti grande, para las fichas con poco texto: ocupa el hueco, centrado. */
function armarPuntiGrande(ctx: CanvasRenderingContext2D, espacio: number): Bloque {
  const escala = Math.max(5, Math.min(11, Math.floor((espacio - 40) / ALTO)));
  const alto = Math.max(espacio, ALTO * escala + 40);
  return {
    alto,
    dibujar: (y) => {
      const cx = X0 + ANCHO_UTIL / 2;
      const cy = y + alto / 2;
      halo(ctx, cx, cy, ALTO * escala * 0.7);
      punti(ctx, cx - (ANCHO * escala) / 2, cy - (ALTO * escala) / 2, escala);
    },
  };
}

/**
 * Arma los bloques del cuerpo con unos topes de líneas. Cada bloque sabe su
 * alto antes de dibujarse, así se puede probar si todo cabe y, si no, bajar
 * los topes (primero la frase y la definición, luego el prompt) sin que nada
 * se salga.
 */
function armarCuerpo(ctx: CanvasRenderingContext2D, f: Fuentes, d: DatosFichaImagen, lim: Limites): Bloque[] {
  const t = TXT[d.idioma];
  const bloques: Bloque[] = [];

  /* --- Lo que aprendiste --- */
  const k = d.concepto;
  const tituloConcepto = k?.titulo ? unaLinea(k.titulo) : "";
  const frase = k?.frase?.trim() ?? "";
  const definicion = k?.definicion?.trim() ?? "";
  if (tituloConcepto || frase || definicion) {
    ctx.font = `700 40px ${f.display}`;
    const lt = tituloConcepto ? envolverTexto(ctx, tituloConcepto, ANCHO_UTIL, 2) : [];
    // La sangría se mide con las palabras "Tú" y "Punti" en la fuente real.
    ctx.font = `700 24px ${f.ui}`;
    const sangria = Math.max(112, Math.ceil(Math.max(ctx.measureText(t.tu.toUpperCase()).width, ctx.measureText(t.punti.toUpperCase()).width)) + 44);
    ctx.font = `34px ${f.terminal}`;
    const lf = frase ? envolverTexto(ctx, `“${frase}”`, ANCHO_UTIL - sangria, lim.frase) : [];
    ctx.font = `24px ${f.sans}`;
    const ld = definicion ? envolverTexto(ctx, definicion, ANCHO_UTIL - sangria, lim.definicion) : [];
    const altoT = lt.length * 48;
    const altoF = lf.length * 36;
    const altoD = ld.length * 33;
    const alto = 34 + (lt.length ? altoT + 12 : 0) + altoF + (lf.length && ld.length ? 16 : 0) + altoD;
    bloques.push({
      alto,
      dibujar: (y) => {
        etiqueta(ctx, f, t.aprendiste, X0, y, C.matrix);
        let yy = y + 34;
        ctx.textBaseline = "top";
        if (lt.length) {
          ctx.font = `700 40px ${f.display}`;
          ctx.fillStyle = "#ffffff";
          lt.forEach((l, i) => ctx.fillText(l, X0, yy + i * 48));
          yy += altoT + 12;
        }
        if (lf.length) {
          // Barra dorada a la izquierda, como la cita de la ficha en la app.
          ctx.fillStyle = C.oro;
          ctx.fillRect(X0, yy + 2, 4, altoF - 4);
          ctx.font = `700 24px ${f.ui}`;
          ctx.fillText(recortar(ctx, t.tu.toUpperCase(), sangria - 30), X0 + 18, yy + 5);
          ctx.font = `34px ${f.terminal}`;
          ctx.fillStyle = C.claro;
          lf.forEach((l, i) => ctx.fillText(l, X0 + sangria, yy + i * 36));
          yy += altoF + 16;
        }
        if (ld.length) {
          ctx.fillStyle = C.matrix;
          ctx.fillRect(X0, yy + 2, 4, altoD - 6);
          ctx.font = `700 24px ${f.ui}`;
          ctx.fillText(recortar(ctx, t.punti.toUpperCase(), sangria - 30), X0 + 18, yy + 2);
          ctx.font = `24px ${f.sans}`;
          ctx.fillStyle = "#a9b6c4";
          ld.forEach((l, i) => ctx.fillText(l, X0 + sangria, yy + i * 33));
        }
      },
    });
  }

  /* --- Tu mejor prompt --- */
  const prompt = d.mejorPrompt?.trim() ?? "";
  if (prompt && lim.prompt > 0) {
    ctx.font = `32px ${f.terminal}`;
    const pad = 18;
    const lp = envolverTexto(ctx, prompt, ANCHO_UTIL - pad * 2 - 6, lim.prompt);
    const altoCaja = lp.length * 33 + pad * 2;
    bloques.push({
      alto: 32 + altoCaja,
      dibujar: (y) => {
        etiqueta(ctx, f, t.mejor, X0, y, C.cyan);
        const yc = y + 32;
        ctx.fillStyle = "rgba(3,10,6,0.92)";
        ctx.fillRect(X0, yc, ANCHO_UTIL, altoCaja);
        ctx.strokeStyle = "rgba(0,255,65,0.35)";
        ctx.lineWidth = 2;
        ctx.strokeRect(X0 + 1, yc + 1, ANCHO_UTIL - 2, altoCaja - 2);
        ctx.fillStyle = C.matrix;
        ctx.fillRect(X0, yc, 6, altoCaja);
        ctx.font = `32px ${f.terminal}`;
        ctx.fillStyle = C.terminal;
        ctx.textBaseline = "top";
        lp.forEach((l, i) => ctx.fillText(l, X0 + pad + 6, yc + pad + i * 33));
      },
    });
  }

  /* --- Las piezas --- */
  const piezas = (d.piezas ?? []).filter((p) => unaLinea(p.titulo));
  if (piezas.length) {
    ctx.font = `700 24px ${f.ui}`;
    const altoChip = 44;
    const gap = 12;
    // Se reparten en filas; máximo 2 filas (las piezas son 4 a 6 en la práctica).
    const chips: { x: number; fila: number; w: number; texto: string; p: PiezaFicha }[] = [];
    let x = X0;
    let fila = 0;
    for (const p of piezas) {
      const texto = recortar(ctx, p.titulo, ANCHO_UTIL - 60);
      const w = Math.ceil(ctx.measureText(texto).width) + 56;
      if (x > X0 && x + w > X0 + ANCHO_UTIL) {
        x = X0;
        fila++;
      }
      if (fila > 1) break;
      chips.push({ x, fila, w, texto, p });
      x += w + gap;
    }
    const filas = (chips[chips.length - 1]?.fila ?? 0) + 1;
    bloques.push({
      alto: filas * altoChip + (filas - 1) * gap,
      dibujar: (y) => {
        for (const c of chips) {
          const yc = y + c.fila * (altoChip + gap);
          const color = c.p.color || C.cyan;
          const on = c.p.usada;
          if (on) {
            ctx.fillStyle = hexAlfa(color, 0.12);
            ctx.fillRect(c.x, yc, c.w, altoChip);
          }
          ctx.strokeStyle = on ? color : C.borde;
          ctx.lineWidth = 2;
          ctx.strokeRect(c.x + 1, yc + 1, c.w - 2, altoChip - 2);
          ctx.fillStyle = on ? color : C.borde;
          ctx.fillRect(c.x + 16, yc + altoChip / 2 - 6, 12, 12);
          ctx.font = `700 24px ${f.ui}`;
          ctx.fillStyle = on ? "#ffffff" : C.apagado;
          ctx.textBaseline = "middle";
          ctx.fillText(c.texto, c.x + 40, yc + altoChip / 2 + 1);
        }
        ctx.textBaseline = "top";
      },
    });
  }
  return bloques;
}

/** "#00f5ff" + 0.12 → "rgba(0,245,255,0.12)". Colores raros caen a cian. */
function hexAlfa(hex: string, a: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0x00f5ff;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const alto = (bs: Bloque[], hueco: number) => bs.reduce((a, b) => a + b.alto, 0) + hueco * Math.max(0, bs.length - 1);

/**
 * Dibuja la Ficha y la devuelve como PNG. Se llama solo desde el navegador
 * (después de un toque del piloto).
 */
export async function crearFichaImagen(d: DatosFichaImagen): Promise<Blob> {
  const f = leerFuentes();
  const t = TXT[d.idioma];
  await cargarFuentes([
    `900 58px ${f.display}`,
    `700 40px ${f.display}`,
    `34px ${f.terminal}`,
    `600 24px ${f.ui}`,
    `700 24px ${f.ui}`,
    `18px ${f.pixel}`,
    `24px ${f.sans}`,
  ]);

  const lienzo = document.createElement("canvas");
  lienzo.width = W;
  lienzo.height = H;
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.imageSmoothingEnabled = false;
  ctx.textBaseline = "top";

  fondo(ctx, d.titulo || "punti");
  marco(ctx);

  /* --- Se decide el armado antes de pintar nada --- */
  const Y0 = 84;
  const hueco = 28;
  const limite = PIE - 16;
  const numeros = armarNumeros(ctx, f, d);
  const intentos: Limites[] = [
    { frase: 3, definicion: 3, prompt: 8 },
    { frase: 2, definicion: 3, prompt: 8 },
    { frase: 2, definicion: 2, prompt: 8 },
    { frase: 2, definicion: 2, prompt: 7 },
    { frase: 2, definicion: 2, prompt: 6 },
    { frase: 2, definicion: 2, prompt: 5 },
    { frase: 1, definicion: 2, prompt: 5 },
    { frase: 1, definicion: 2, prompt: 4 },
    { frase: 1, definicion: 1, prompt: 3 },
  ];
  let cabecera = armarCabecera(ctx, f, d, true);
  let cuerpo: Bloque[] = [];
  for (const lim of intentos) {
    cuerpo = [...(numeros ? [numeros] : []), ...armarCuerpo(ctx, f, d, lim)];
    if (Y0 + cabecera.alto + hueco + alto(cuerpo, hueco) <= limite) break;
  }
  // Si aun así no cabe (textos imposibles), se sueltan bloques del final
  // antes que dejar que algo se monte sobre el pie.
  while (cuerpo.length > 1 && Y0 + cabecera.alto + hueco + alto(cuerpo, hueco) > limite) cuerpo.pop();

  // Poco texto (una ficha vieja sin concepto ni prompt): Punti pasa del
  // encabezado a ocupar el hueco, en grande.
  const sobra = limite - (Y0 + cabecera.alto + hueco + alto(cuerpo, hueco));
  if (sobra > 300) {
    cabecera = armarCabecera(ctx, f, d, false);
    const libre = limite - (Y0 + cabecera.alto + hueco + alto(cuerpo, hueco)) - hueco;
    cuerpo.splice(numeros ? 1 : 0, 0, armarPuntiGrande(ctx, libre));
  }

  // Lo que sobre de espacio se reparte entre los bloques (hasta 14 px cada
  // uno), para que el cuerpo respire en vez de dejar un hueco al final.
  const resto = limite - (Y0 + cabecera.alto + hueco + alto(cuerpo, hueco));
  const extra = Math.max(0, Math.min(14, Math.floor(resto / (cuerpo.length + 1))));

  /* --- Ahora sí, a pintar --- */
  let y = Y0;
  ctx.save();
  cabecera.dibujar(y);
  ctx.restore();
  y += cabecera.alto + hueco + extra;
  for (const b of cuerpo) {
    ctx.save();
    b.dibujar(y);
    ctx.restore();
    y += b.alto + hueco + extra;
  }

  /* --- Pie: punti.space --- */
  const yPie = PIE + 12;
  lineaPunteada(ctx, yPie, "rgba(0,245,255,0.3)");
  // Cabecita de Punti junto a la marca.
  const cab = document.createElement("canvas");
  cab.width = 22 * 3;
  cab.height = 16 * 3;
  const cc = cab.getContext("2d");
  if (cc) {
    dibujarPunti(cc, "online", 3, "cabeza");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(cab, X0, yPie + 20);
  }
  ctx.save();
  ctx.shadowColor = "rgba(0,255,65,0.6)";
  ctx.shadowBlur = 12;
  // La marca va en minúsculas, tal cual se escribe la dirección.
  ctx.font = `26px ${f.pixel}`;
  ctx.fillStyle = C.matrix;
  ctx.textBaseline = "top";
  ctx.fillText("punti.space", X0 + 84, yPie + 32);
  ctx.restore();
  ctx.font = `36px ${f.terminal}`;
  ctx.fillStyle = C.muted;
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.fillText(t.lema, X0 + ANCHO_UTIL, yPie + 30);
  ctx.textAlign = "left";

  return new Promise<Blob>((ok, mal) => {
    lienzo.toBlob((b) => (b ? ok(b) : mal(new Error("png"))), "image/png");
  });
}
