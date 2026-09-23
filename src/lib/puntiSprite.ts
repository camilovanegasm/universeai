/**
 * Punti en pixel art — dirección "Sólido arcade".
 *
 * Punti no es una imagen: se arma con rectángulos sobre una rejilla de 32 x 36.
 * Cada celda guarda un ROL (contorno, cuerpo, visor, ojo...), no un color, y la
 * paleta decide qué color le toca a cada rol. Cambiar el aspecto de Punti es
 * cambiar seis colores; cambiar su cara es mover un rectángulo.
 *
 * Este archivo no sabe nada de React a propósito: así se puede probar solo.
 */

export type EstadoPunti =
  | "boot"      // arrancando
  | "online"    // reposo
  | "leyendo"   // mirando un panel, procesando contenido
  | "loading"   // guardando o pidiendo algo
  | "levelup"   // subió de nivel
  | "hype"      // celebración grande
  | "battery"   // sin gasolina
  | "error"     // algo falló
  | "info";     // dato, pista o aviso

export const DESCRIPCION_PUNTI: Record<EstadoPunti, string> = {
  boot: "Punti arrancando",
  online: "Punti en línea",
  leyendo: "Punti leyendo",
  loading: "Punti procesando",
  levelup: "Punti celebrando una subida de nivel",
  hype: "Punti en celebración épica",
  battery: "Punti sin gasolina",
  error: "Punti avisando de un error",
  info: "Punti dando un dato",
};

/* ---------------------------------------------------------------- rejilla */

export const ANCHO = 32;
export const ALTO = 36;

type Rol =
  | "BORDE" | "CUERPO" | "VISOR" | "DETALLE"
  | "OJO" | "BRILLO" | "ACC1" | "ACC2" | "ALERTA";

type Rejilla = (Rol | null)[][];

const nueva = (): Rejilla =>
  Array.from({ length: ALTO }, () => new Array<Rol | null>(ANCHO).fill(null));

function pt(g: Rejilla, x: number, y: number, r: Rol | null) {
  if (y >= 0 && y < ALTO && x >= 0 && x < ANCHO) g[y][x] = r;
}

function caja(g: Rejilla, x: number, y: number, w: number, h: number, r: Rol | null) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) pt(g, x + i, y + j, r);
}

/** Rectángulo con las esquinas cortadas en diagonal: el redondeo del pixel art. */
function rcaja(
  g: Rejilla, x: number, y: number, w: number, h: number,
  rad: number, relleno: Rol, borde?: Rol,
) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = Math.min(i, w - 1 - i), dy = Math.min(j, h - 1 - j);
    if (dx + dy < rad) continue;
    const enBorde = i === 0 || j === 0 || i === w - 1 || j === h - 1 || dx + dy === rad;
    pt(g, x + i, y + j, enBorde && borde ? borde : relleno);
  }
}

/**
 * Suelda las costuras. Donde el brazo toca el torso, los dos pintan su propio
 * contorno y queda una línea oscura entre ellos: la figura se lee como piezas
 * sueltas en vez de un cuerpo. Un pixel de contorno con cuerpo a lado y lado
 * no es un borde, es una costura.
 *
 * Se rellena con el verde oscuro y no con el claro: relleno del todo, el brazo
 * y el torso se funden en una sola barra verde y se pierden los brazos. El
 * tono intermedio los une y a la vez los sigue separando.
 */
function soldar(g: Rejilla) {
  for (let y = 0; y < ALTO; y++) {
    for (let x = 1; x < ANCHO - 1; x++) {
      if (g[y][x] !== "BORDE") continue;
      if (g[y][x - 1] === "CUERPO" && g[y][x + 1] === "CUERPO") g[y][x] = "DETALLE";
    }
  }
}

/* ----------------------------------------------------------------- sprite */

export function construirPunti(estado: EstadoPunti): Rejilla {
  const g = nueva();
  const hype = estado === "hype";
  const nivel = estado === "levelup";
  const baja = estado === "battery";
  const carga = estado === "loading";
  const arranca = estado === "boot";
  const lee = estado === "leyendo";
  const falla = estado === "error";
  const avisa = estado === "info";
  const brazosArriba = hype || nivel;

  // tabla y toberas
  rcaja(g, 5, 31, 22, 3, 1, "VISOR", "ACC1");
  caja(g, 8, 32, 16, 1, "ACC2");
  if (!baja) { caja(g, 9, 34, 2, 1, "ACC1"); caja(g, 21, 34, 2, 1, "ACC1"); }
  if (brazosArriba) { caja(g, 12, 34, 2, 1, "ACC1"); caja(g, 18, 34, 2, 1, "ACC1"); }

  // piernas y botas. Sin redondear, porque a este tamaño el chaflán se las
  // come, y con un hueco de dos pixeles entre botas: pegadas se leían como
  // una sola barra verde.
  caja(g, 11, 26, 3, 2, "CUERPO"); caja(g, 18, 26, 3, 2, "CUERPO");
  rcaja(g, 9, 28, 6, 3, 0, "CUERPO", "BORDE");
  rcaja(g, 17, 28, 6, 3, 0, "CUERPO", "BORDE");

  // torso, panel de pecho y parches
  rcaja(g, 8, 18, 16, 9, 2, "CUERPO", "BORDE");
  rcaja(g, 11, 20, 10, 5, 1, "VISOR", "BORDE");
  caja(g, 12, 21, 3, 3, "ACC1"); pt(g, 13, 22, "VISOR");   // NASA
  caja(g, 17, 21, 3, 3, "ACC2"); pt(g, 18, 22, "VISOR");   // SpX
  caja(g, 11, 17, 10, 1, "ACC1");                          // cuello

  // Los brazos van DESPUÉS del torso a propósito. Dibujados antes, el
  // torso les comía el borde y cada brazo se leía como una pieza suelta
  // flotando al lado del cuerpo.
  // brazos: al celebrar suben y la mano queda ARRIBA del brazo
  if (brazosArriba) {
    rcaja(g, 4, 14, 5, 7, 1, "CUERPO", "BORDE");
    rcaja(g, 23, 14, 5, 7, 1, "CUERPO", "BORDE");
    rcaja(g, 2, 11, 5, 3, 1, "CUERPO", "BORDE");
    rcaja(g, 25, 11, 5, 3, 1, "CUERPO", "BORDE");
  } else if (avisa) {
    rcaja(g, 4, 18, 5, 7, 1, "CUERPO", "BORDE");
    rcaja(g, 4, 24, 5, 3, 1, "CUERPO", "BORDE");
    rcaja(g, 23, 14, 5, 7, 1, "CUERPO", "BORDE");   // este sube: está señalando
    rcaja(g, 25, 11, 5, 3, 1, "CUERPO", "BORDE");
  } else {
    rcaja(g, 4, 18, 5, 7, 1, "CUERPO", "BORDE");
    rcaja(g, 23, 18, 5, 7, 1, "CUERPO", "BORDE");
    rcaja(g, 4, 24, 5, 3, 1, "CUERPO", "BORDE");
    rcaja(g, 23, 24, 5, 3, 1, "CUERPO", "BORDE");
  }

  soldar(g);

  // casco, visor y muesca
  rcaja(g, 5, 1, 22, 16, 4, "CUERPO", "BORDE");
  rcaja(g, 8, 4, 16, 11, 3, "VISOR", "BORDE");
  caja(g, 14, 5, 4, 1, "DETALLE");

  // orejeras
  caja(g, 4, 6, 1, 3, "ACC1");  caja(g, 27, 6, 1, 3, "ACC1");
  caja(g, 4, 10, 1, 2, "ACC2"); caja(g, 27, 10, 1, 2, "ACC2");

  // ojos
  if (carga) {
    caja(g, 11, 9, 4, 1, "OJO"); caja(g, 17, 9, 4, 1, "OJO");
  } else if (arranca) {
    caja(g, 12, 9, 2, 2, "DETALLE"); caja(g, 18, 9, 2, 2, "DETALLE");
  } else if (baja) {
    caja(g, 11, 9, 4, 2, "OJO");  caja(g, 17, 9, 4, 2, "OJO");
    caja(g, 11, 8, 4, 1, "BORDE"); caja(g, 17, 8, 4, 1, "BORDE");
  } else if (lee) {
    // mirando abajo: párpado arriba y pupila pegada al borde inferior
    caja(g, 11, 8, 4, 1, "BORDE"); caja(g, 17, 8, 4, 1, "BORDE");
    caja(g, 11, 9, 4, 2, "OJO");   caja(g, 17, 9, 4, 2, "OJO");
    pt(g, 11, 9, "BRILLO");        pt(g, 17, 9, "BRILLO");
  } else if (falla) {
    [11, 17].forEach((x) => {
      pt(g, x, 8, "ALERTA");     pt(g, x + 3, 8, "ALERTA");
      pt(g, x + 1, 9, "ALERTA"); pt(g, x + 2, 9, "ALERTA");
      pt(g, x, 10, "ALERTA");    pt(g, x + 3, 10, "ALERTA");
    });
  } else if (nivel) {
    [11, 17].forEach((x) => {
      pt(g, x, 9, "OJO"); pt(g, x + 1, 8, "OJO");
      pt(g, x + 2, 8, "OJO"); pt(g, x + 3, 9, "OJO");
    });
  } else {
    const y0 = hype ? 7 : 8, h = hype ? 4 : 3;
    caja(g, 11, y0, 4, h, "OJO"); caja(g, 17, y0, 4, h, "OJO");
    pt(g, 11, y0, "BRILLO");      pt(g, 17, y0, "BRILLO");
  }

  // boca
  if (hype || nivel) {
    caja(g, 13, 12, 6, 2, "OJO");
  } else if (baja) {
    pt(g, 12, 13, "OJO"); caja(g, 13, 12, 6, 1, "OJO"); pt(g, 19, 13, "OJO");
  } else if (falla) {
    // boca recta: con las equis y además zigzag, la cara era una mancha rosa
    caja(g, 13, 13, 6, 1, "ALERTA");
  } else if (carga || arranca || avisa || lee) {
    caja(g, 14, 13, 4, 1, "OJO");
  } else {
    pt(g, 12, 12, "OJO"); caja(g, 13, 13, 6, 1, "OJO"); pt(g, 19, 12, "OJO");
  }

  // añadidos propios de cada estado, encima de todo
  if (lee) {
    rcaja(g, 11, 20, 10, 7, 1, "VISOR", "ACC2");
    caja(g, 13, 22, 6, 1, "ACC2"); caja(g, 13, 24, 4, 1, "ACC2");
  }
  if (avisa) {
    caja(g, 29, 4, 2, 4, "ALERTA"); caja(g, 29, 9, 2, 1, "ALERTA");
  }
  if (arranca) {
    // riel en tono medio y relleno en claro: con el color del contorno
    // la barra desaparecía sobre el visor
    caja(g, 11, 12, 10, 1, "DETALLE"); caja(g, 11, 12, 4, 1, "OJO");
  }
  if (nivel) {
    // chispas POR FUERA del casco, que ocupa de x5 a x26
    pt(g, 3, 4, "ALERTA");  pt(g, 2, 7, "ALERTA");  pt(g, 4, 10, "ALERTA");
    pt(g, 28, 4, "ALERTA"); pt(g, 29, 7, "ALERTA"); pt(g, 27, 10, "ALERTA");
  }
  return g;
}

/* ---------------------------------------------------------------- paleta */

export const PALETA: Record<Rol, string> = {
  BORDE: "#04170b",
  CUERPO: "#00e63a",
  VISOR: "#06170c",
  DETALLE: "#00a82a",
  OJO: "#c9ffd8",
  BRILLO: "#ffffff",
  ACC1: "#b400ff",
  ACC2: "#00f5ff",
  ALERTA: "#ff2d6f",
};

/* --------------------------------------------------------------- recortes */

export type RecortePunti = "cuerpo" | "busto" | "cabeza";

export const RECORTES: Record<RecortePunti, { x: number; y: number; w: number; h: number }> = {
  cuerpo: { x: 0, y: 0, w: ANCHO, h: ALTO },   // portada, bienvenida, mapa de mundos
  busto:  { x: 3, y: 0, w: 26, h: 20 },        // la lección, cuando habla
  cabeza: { x: 5, y: 1, w: 22, h: 16 },        // avatar del perfil, barra superior
};

/* ---------------------------------------------------------------- dibujo */

/** Pinta a Punti en un canvas ya dimensionado a (recorte * escala). */
export function dibujarPunti(
  ctx: CanvasRenderingContext2D,
  estado: EstadoPunti,
  escala: number,
  recorte: RecortePunti = "cuerpo",
) {
  const r = RECORTES[recorte];
  const g = construirPunti(estado);
  ctx.clearRect(0, 0, r.w * escala, r.h * escala);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const fila = g[y + r.y];
    const rol = fila ? fila[x + r.x] : null;
    if (!rol) continue;
    ctx.fillStyle = PALETA[rol];
    ctx.fillRect(x * escala, y * escala, escala, escala);
  }
}
