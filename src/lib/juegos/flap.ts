// Punti Flap: la física del juego y la IA que aprende a jugarlo.
//
// Todo aquí es lógica pura, sin React ni canvas, igual que puntiSprite.ts:
// se puede probar sola. El dibujo está en components/juegos/PuntiFlap.tsx.
//
// La IA del "modo IA" usa neuroevolución, la misma idea del proyecto
// FlappyLearning (github.com/xviniette/FlappyLearning, licencia MIT), escrita
// de nuevo aquí: una población de Puntis con un cerebro pequeño (una red
// neuronal de 4 entradas, 6 neuronas y 1 salida) juega a la vez; los que
// llegan más lejos pasan su cerebro, con pequeños cambios, a la siguiente
// generación.

/** Tamaño del mundo, en pixeles lógicos (el canvas se amplía sin difuminar). */
export const MUNDO = { ancho: 160, alto: 240, suelo: 226 };

const GRAVEDAD = 0.24;
const IMPULSO = -4.1;
const VEL_MAX = 6;
const PORTAL_ANCHO = 22;
const SEPARACION = 92; // distancia horizontal entre portales
export const PUNTI_X = 40;
export const PUNTI_R = { w: 14, h: 11 }; // caja de choque (más chica que el dibujo: se siente justo)
/** Portales para ganar. */
export const META = 10;

export type Portal = { x: number; hueco: number; alto: number; pasado: boolean };

export type Mundo = {
  portales: Portal[];
  velocidad: number;
  cuadros: number;
  semilla: number;
};

export type Piloto = { y: number; vy: number; vivo: boolean; puntos: number; cuadros: number };

/** Números aleatorios repetibles: toda la población ve los mismos portales. */
function aleatorio(m: Mundo): number {
  m.semilla = (m.semilla * 1664525 + 1013904223) >>> 0;
  return m.semilla / 4294967296;
}

function nuevoPortal(m: Mundo, x: number, n: number): Portal {
  // El hueco se achica un poco con cada portal, hasta un mínimo.
  const alto = Math.max(56, 70 - n * 1.2);
  const margen = 26;
  const hueco = margen + aleatorio(m) * (MUNDO.suelo - margen * 2 - alto);
  return { x, hueco, alto, pasado: false };
}

export function crearMundo(semilla = Math.floor(Math.random() * 1e9)): Mundo {
  const m: Mundo = { portales: [], velocidad: 1.25, cuadros: 0, semilla };
  for (let i = 0; i < 3; i++) m.portales.push(nuevoPortal(m, MUNDO.ancho + 30 + i * SEPARACION, i));
  return m;
}

export function crearPiloto(): Piloto {
  return { y: MUNDO.alto / 2 - 20, vy: 0, vivo: true, puntos: 0, cuadros: 0 };
}

export function impulsar(p: Piloto) {
  if (p.vivo) p.vy = IMPULSO;
}

/** El portal que el piloto tiene enfrente (el primero que todavía no dejó atrás). */
export function portalSiguiente(m: Mundo): Portal {
  return m.portales.find((q) => q.x + PORTAL_ANCHO > PUNTI_X - PUNTI_R.w / 2) ?? m.portales[0];
}

function choca(p: Piloto, m: Mundo): boolean {
  const arriba = p.y - PUNTI_R.h / 2;
  const abajo = p.y + PUNTI_R.h / 2;
  if (abajo >= MUNDO.suelo) return true;
  const izq = PUNTI_X - PUNTI_R.w / 2;
  const der = PUNTI_X + PUNTI_R.w / 2;
  for (const q of m.portales) {
    if (der > q.x && izq < q.x + PORTAL_ANCHO && (arriba < q.hueco || abajo > q.hueco + q.alto)) return true;
  }
  return false;
}

/**
 * Avanza un cuadro (1/60 s). Mueve los portales una vez y a todos los pilotos.
 * Devuelve cuántos pilotos pasaron un portal en este cuadro (para el sonido).
 */
export function avanzar(m: Mundo, pilotos: Piloto[]): number {
  m.cuadros++;
  let pasaron = 0;
  for (const q of m.portales) q.x -= m.velocidad;
  // El portal que sale por la izquierda vuelve a entrar por la derecha.
  if (m.portales[0].x + PORTAL_ANCHO < 0) {
    m.portales.shift();
    const ultimo = m.portales[m.portales.length - 1];
    m.portales.push(nuevoPortal(m, ultimo.x + SEPARACION, Math.floor(m.cuadros / 80)));
  }
  for (const p of pilotos) {
    if (!p.vivo) continue;
    p.vy = Math.min(p.vy + GRAVEDAD, VEL_MAX);
    p.y += p.vy;
    p.cuadros++;
    // El techo frena, no mata: chocar contra el borde de la pantalla se
    // siente injusto. Lo que mata son los portales y el suelo.
    if (p.y - PUNTI_R.h / 2 < 0) {
      p.y = PUNTI_R.h / 2;
      p.vy = 0;
    }
    if (choca(p, m)) p.vivo = false;
  }
  // Un portal cuenta cuando queda del todo detrás de Punti. Se lo anotan
  // los que siguen vivos, y el juego acelera un poquito.
  for (const q of m.portales) {
    if (!q.pasado && q.x + PORTAL_ANCHO < PUNTI_X - PUNTI_R.w / 2) {
      q.pasado = true;
      m.velocidad = Math.min(m.velocidad + 0.035, 2.2);
      for (const p of pilotos) if (p.vivo) {
        p.puntos++;
        pasaron++;
      }
    }
  }
  return pasaron;
}

/* ------------------------------------------------------ la IA que aprende */

const ENTRADAS = 4;
const OCULTAS = 6;
/** Cuántos pesos tiene un cerebro: entradas→ocultas (+ sesgo) y ocultas→salida (+ sesgo). */
export const TAMANO_CEREBRO = (ENTRADAS + 1) * OCULTAS + (OCULTAS + 1);

export type Cerebro = Float32Array;

function gauss(): number {
  // Box-Muller: números alrededor de 0, casi todos entre -2 y 2.
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function cerebroAlAzar(): Cerebro {
  const c = new Float32Array(TAMANO_CEREBRO);
  for (let i = 0; i < c.length; i++) c[i] = gauss();
  return c;
}

/** Lo que "ve" el piloto: su altura, dónde está el hueco, qué tan cerca y su velocidad. */
function sentidos(p: Piloto, m: Mundo): number[] {
  const q = portalSiguiente(m);
  return [
    p.y / MUNDO.alto,
    (q.hueco + q.alto / 2 - p.y) / MUNDO.alto,
    (q.x - PUNTI_X) / MUNDO.ancho,
    p.vy / VEL_MAX,
  ];
}

/** ¿Se impulsa en este cuadro? */
export function decide(c: Cerebro, p: Piloto, m: Mundo): boolean {
  const x = sentidos(p, m);
  let k = 0;
  let salida = 0;
  const ocultas: number[] = [];
  for (let h = 0; h < OCULTAS; h++) {
    let s = 0;
    for (let i = 0; i < ENTRADAS; i++) s += x[i] * c[k++];
    s += c[k++]; // sesgo
    ocultas.push(Math.tanh(s));
  }
  for (let h = 0; h < OCULTAS; h++) salida += ocultas[h] * c[k++];
  salida += c[k++];
  return salida > 0;
}

/** Qué tan bien le fue: sobrevivir cuenta, pasar portales cuenta mucho más. */
export function aptitud(p: Piloto): number {
  return p.cuadros + p.puntos * 200;
}

function mutar(c: Cerebro, tasa = 0.12, fuerza = 0.5): Cerebro {
  const hijo = new Float32Array(c);
  for (let i = 0; i < hijo.length; i++) if (Math.random() < tasa) hijo[i] += gauss() * fuerza;
  return hijo;
}

function cruzar(a: Cerebro, b: Cerebro): Cerebro {
  const hijo = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) hijo[i] = Math.random() < 0.5 ? a[i] : b[i];
  return hijo;
}

/**
 * La siguiente generación: los 4 mejores pasan tal cual, el resto nace de
 * mezclar a dos de los mejores con pequeños cambios al azar, y unos pocos
 * cerebros nuevos del todo para no quedarse estancados.
 */
export function siguienteGeneracion(cerebros: Cerebro[], pilotos: Piloto[]): Cerebro[] {
  const orden = cerebros
    .map((c, i) => ({ c, a: aptitud(pilotos[i]) }))
    .sort((x, y) => y.a - x.a)
    .map((x) => x.c);
  const total = cerebros.length;
  const padres = orden.slice(0, Math.max(2, Math.round(total * 0.2)));
  const nueva: Cerebro[] = orden.slice(0, 4).map((c) => new Float32Array(c));
  while (nueva.length < total - 3) {
    const a = padres[Math.floor(Math.random() * padres.length)];
    const b = padres[Math.floor(Math.random() * padres.length)];
    nueva.push(mutar(cruzar(a, b)));
  }
  while (nueva.length < total) nueva.push(cerebroAlAzar());
  return nueva;
}
