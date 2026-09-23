"use client";

import { useSyncExternalStore } from "react";

/**
 * El chip de sonido de Punti.
 *
 * Ningún sonido es un archivo: se sintetizan en el momento con osciladores de
 * onda cuadrada y triangular, como los chips de consola de los 80. Cambiar un
 * sonido es cambiar un número.
 *
 * Reglas (aprobadas):
 *   - Corto y bajo: casi todo dura menos de medio segundo.
 *   - Silencio a un toque, y recordado entre visitas.
 *   - Arranca callado: nada suena hasta que la persona toca algo. El
 *     navegador lo exige de todos modos, y aquí se respeta en vez de pelearlo.
 *   - Música solo en la portada, apagada por defecto.
 *
 * Variantes elegidas en el tablero de sonidos (2026-09-23):
 *   toque B · acierto A · error B · pista A · nivel B · completa B ·
 *   sin gasolina B · pantalla A · arranque B · voz B
 */

/* ------------------------------------------------------- preferencias */

const CLAVE_SILENCIO = "punti-silencio";
const CLAVE_MUSICA = "punti-musica";
const oyentes = new Set<() => void>();

function leerBandera(clave: string, porDefecto: boolean): boolean {
  try {
    const v = localStorage.getItem(clave);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    // almacenamiento bloqueado: se usa el valor por defecto
  }
  return porDefecto;
}

function guardarBandera(clave: string, valor: boolean) {
  try {
    localStorage.setItem(clave, valor ? "1" : "0");
  } catch {
    // sin almacenamiento, vale solo para esta visita
  }
  oyentes.forEach((f) => f());
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  const alCambiar = (e: StorageEvent) => {
    if (e.key === CLAVE_SILENCIO || e.key === CLAVE_MUSICA) avisar();
  };
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", alCambiar);
  };
}

export const estaEnSilencio = () => leerBandera(CLAVE_SILENCIO, false);
export const musicaEncendida = () => leerBandera(CLAVE_MUSICA, false);

export function useSilencio(): boolean {
  return useSyncExternalStore(suscribir, estaEnSilencio, () => false);
}

export function useMusica(): boolean {
  return useSyncExternalStore(suscribir, musicaEncendida, () => false);
}

// Cuántas pantallas con música están abiertas ahora (en la práctica, la
// portada). El motor no sabe en qué página está; así se entera.
let pantallasConMusica = 0;

/** La portada se anota al montar y se borra al desmontar. */
export function registrarPantallaConMusica() {
  pantallasConMusica += 1;
  return () => {
    pantallasConMusica -= 1;
  };
}

export function cambiarSilencio(silencio: boolean) {
  guardarBandera(CLAVE_SILENCIO, silencio);
  if (maestro && ctx) maestro.gain.setTargetAtTime(silencio ? 0 : VOLUMEN, ctx.currentTime, 0.02);
  if (silencio) detenerMusica();
  // Al volver el sonido, la música vuelve si estaba encendida y se está en la
  // portada. Sin esto el botón decía "Música: sí" y no sonaba nada.
  else if (musicaEncendida() && pantallasConMusica > 0) iniciarMusica();
}

export function cambiarMusica(encendida: boolean) {
  guardarBandera(CLAVE_MUSICA, encendida);
  if (encendida) iniciarMusica();
  else detenerMusica();
}

/* -------------------------------------------------------------- motor */

const VOLUMEN = 0.55;
let ctx: AudioContext | null = null;
let maestro: GainNode | null = null;

/**
 * Crea el contexto de audio la primera vez que se necesita. Nunca antes:
 * crearlo al cargar la página, sin un toque de por medio, lo deja suspendido
 * y el navegador avisa en consola.
 */
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    // Compresor al final: evita que dos sonidos juntos se saturen y crujan.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    maestro = ctx.createGain();
    maestro.gain.value = estaEnSilencio() ? 0 : VOLUMEN;
    maestro.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

type OpcionesNota = { tipo?: OscillatorType; vol?: number; hasta?: number; ataque?: number; vibrato?: number; destino?: AudioNode };

function nota(f: number, t: number, dur: number, o: OpcionesNota = {}) {
  const c = audio();
  if (!c || !maestro) return;
  const { tipo = "square", vol = 0.18, hasta, ataque = 0.004, vibrato = 0, destino = maestro } = o;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(f, t);
  if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  if (vibrato) {
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = 7;
    lg.gain.value = vibrato;
    lfo.connect(lg);
    lg.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(destino);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

type OpcionesRuido = { vol?: number; desde?: number; hasta?: number; filtro?: BiquadFilterType; destino?: AudioNode };

let bufferRuido: AudioBuffer | null = null;

function ruido(t: number, dur: number, o: OpcionesRuido = {}) {
  const c = audio();
  if (!c || !maestro) return;
  const { vol = 0.12, desde = 800, hasta = 4000, filtro = "bandpass", destino = maestro } = o;
  // Un solo segundo de ruido, reutilizado: generarlo en cada golpe de la
  // música gastaría memoria para nada.
  if (!bufferRuido) {
    bufferRuido = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = bufferRuido.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = bufferRuido;
  const fil = c.createBiquadFilter();
  fil.type = filtro;
  fil.Q.value = 1.2;
  fil.frequency.setValueAtTime(desde, t);
  fil.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fil);
  fil.connect(g);
  g.connect(destino);
  src.start(t);
  src.stop(t + dur);
}

const N = {
  C5: 523.25, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77,
  C6: 1046.5, E6: 1318.51, G6: 1567.98, C7: 2093,
};

/* ---------------------------------------------------------- catálogo */

const SONIDOS = {
  /** Cualquier botón. Casi no se oye: confirma que el toque llegó. */
  toque(t: number) {
    nota(900, t, 0.025, { tipo: "triangle", vol: 0.12 });
  },
  /** Respuesta correcta: la moneda. */
  acierto(t: number) {
    nota(N.B5, t, 0.07, { vol: 0.16 });
    nota(N.E6, t + 0.07, 0.22, { vol: 0.16 });
  },
  /** Respuesta incorrecta: zumbido de alerta. Avisa sin regañar. */
  error(t: number) {
    nota(196, t, 0.11, { vol: 0.13 });
    nota(165, t + 0.12, 0.17, { vol: 0.13 });
    ruido(t, 0.05, { vol: 0.05, desde: 300, hasta: 200 });
  },
  /** Pedirle una pista a Punti: destello. */
  pista(t: number) {
    [N.E6, N.G6, N.C7, N.G6].forEach((f, i) => nota(f, t + i * 0.05, 0.09, { tipo: "triangle", vol: 0.14 }));
  },
  /** Subir de rango: ascenso. */
  nivel(t: number) {
    nota(N.C5, t, 0.38, { vol: 0.12, hasta: N.C6 });
    nota(N.E6, t + 0.38, 0.12, { tipo: "triangle", vol: 0.2 });
    nota(N.G6, t + 0.5, 0.4, { tipo: "triangle", vol: 0.2, vibrato: 9 });
  },
  /** Lección completada: victoria. El único sonido largo de la app. */
  completa(t: number) {
    [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6].forEach((f, i) => nota(f, t + i * 0.09, 0.1, { tipo: "triangle", vol: 0.2 }));
    nota(N.E6, t + 0.6, 0.7, { vol: 0.12, vibrato: 7 });
    nota(N.C6, t + 0.6, 0.7, { tipo: "triangle", vol: 0.12 });
    ruido(t + 0.6, 0.3, { vol: 0.04, desde: 3000, hasta: 9000, filtro: "highpass" });
  },
  /** Se acabó la gasolina: el motor tose y se apaga. */
  sinGasolina(t: number) {
    [0, 0.14, 0.3].forEach((d, i) => nota(180 - i * 30, t + d, 0.1, { vol: 0.12 }));
    nota(110, t + 0.46, 0.4, { vol: 0.1, hasta: 40 });
  },
  /** Cambio de pantalla: soplido. */
  pantalla(t: number) {
    ruido(t, 0.18, { vol: 0.07, desde: 600, hasta: 3200 });
  },
  /** Arranque: sistema encendiendo. */
  arranque(t: number) {
    [N.C5, N.C5, N.G5].forEach((f, i) => nota(f, t + i * 0.1, 0.07, { vol: 0.12 }));
    nota(N.C6, t + 0.32, 0.35, { tipo: "triangle", vol: 0.2 });
  },
  /** Minijuegos: impulso del hoverboard. Cortísimo, porque se repite mucho. */
  aleteo(t: number) {
    nota(420, t, 0.06, { tipo: "triangle", vol: 0.1, hasta: 760 });
  },
  /** Minijuegos: combo que sube. */
  combo(t: number) {
    [N.C6, N.E6, N.G6].forEach((f, i) => nota(f, t + i * 0.04, 0.06, { vol: 0.12 }));
  },
  /** Minijuegos: choque. */
  choque(t: number) {
    ruido(t, 0.25, { vol: 0.12, desde: 1800, hasta: 120 });
    nota(140, t, 0.3, { vol: 0.12, hasta: 50 });
  },
  /** Una letra de la voz de Punti: robot. */
  voz(t: number) {
    const tonos = [392, 440, 523, 587];
    nota(tonos[Math.floor(Math.random() * tonos.length)], t, 0.035, { vol: 0.05 });
  },
} as const;

export type Sonido = keyof typeof SONIDOS;

// Cuántos milisegundos deben pasar antes de repetir el mismo sonido. Sin esto,
// dos toques rápidos o dos eventos seguidos suenan encimados y crujen.
const ENFRIAMIENTO: Partial<Record<Sonido, number>> = { toque: 40, voz: 30, pantalla: 120, aleteo: 60 };
const ultimaVez: Partial<Record<Sonido, number>> = {};

/** Toca un sonido. Si hay silencio, no crea ni un nodo de audio. */
export function sonar(sonido: Sonido) {
  if (estaEnSilencio()) return;
  const ahora = performance.now();
  const espera = ENFRIAMIENTO[sonido] ?? 0;
  if (espera && ahora - (ultimaVez[sonido] ?? -Infinity) < espera) return;
  ultimaVez[sonido] = ahora;
  const c = audio();
  if (!c) return;
  SONIDOS[sonido](c.currentTime + 0.01);
}

/* ------------------------------------------------------------- música */

/*
 * Loop chiptune para la portada. 110 pulsos por minuto, cuatro acordes
 * (La menor · Fa · Do · Sol), bajo en triangular, arpegio muy bajito en
 * cuadrada y un platillo de ruido en los contratiempos.
 *
 * Se programa con "mirada adelante": cada 25 ms se agendan las notas de los
 * próximos 120 ms en el reloj del audio. Así el ritmo no depende de que el
 * navegador esté libre justo en el instante de cada nota — el reloj de
 * setInterval tiembla, el del audio no.
 */
const PULSO = 60 / 110;
const SEMICORCHEA = PULSO / 4;
const ACORDES = [
  { bajo: 110.0, arpegio: [440.0, 523.25, 659.25, 880.0] },   // La menor
  { bajo: 87.31, arpegio: [349.23, 440.0, 523.25, 698.46] },  // Fa
  { bajo: 130.81, arpegio: [392.0, 523.25, 659.25, 783.99] }, // Do
  { bajo: 98.0, arpegio: [392.0, 493.88, 587.33, 783.99] },   // Sol
];
const PATRON_ARPEGIO = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 2, 1];

let relojMusica: ReturnType<typeof setInterval> | null = null;
let busMusica: GainNode | null = null;
let siguienteNota = 0;
let pasoMusica = 0;

export function iniciarMusica() {
  if (relojMusica || estaEnSilencio()) return;
  const c = audio();
  if (!c || !maestro) return;
  busMusica = c.createGain();
  // Entra en un segundo, no de golpe.
  busMusica.gain.setValueAtTime(0.0001, c.currentTime);
  busMusica.gain.linearRampToValueAtTime(0.5, c.currentTime + 1);
  busMusica.connect(maestro);
  siguienteNota = c.currentTime + 0.1;
  pasoMusica = 0;
  const bus = busMusica;

  relojMusica = setInterval(() => {
    const cc = ctx;
    if (!cc) return;
    while (siguienteNota < cc.currentTime + 0.12) {
      const compas = Math.floor(pasoMusica / 16) % ACORDES.length;
      const enCompas = pasoMusica % 16;
      const acorde = ACORDES[compas];
      const t = siguienteNota;

      nota(acorde.arpegio[PATRON_ARPEGIO[enCompas]], t, SEMICORCHEA * 0.9, { vol: 0.035, destino: bus });
      if (enCompas % 4 === 0) nota(acorde.bajo, t, PULSO * 0.9, { tipo: "triangle", vol: 0.16, destino: bus });
      if (enCompas % 4 === 2) ruido(t, 0.04, { vol: 0.02, desde: 7000, hasta: 9000, filtro: "highpass", destino: bus });

      siguienteNota += SEMICORCHEA;
      pasoMusica += 1;
    }
  }, 25);
}

export function detenerMusica() {
  if (relojMusica) clearInterval(relojMusica);
  relojMusica = null;
  const bus = busMusica;
  busMusica = null;
  if (bus && ctx) {
    // Se apaga en medio segundo en vez de cortarse en seco.
    bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.15);
    setTimeout(() => bus.disconnect(), 800);
  }
}
