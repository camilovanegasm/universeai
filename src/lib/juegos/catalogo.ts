// Los minijuegos de Punti: qué juegos hay, a qué mundo pertenecen y qué dicen.
//
// Cada juego tiene una mecánica distinta, inspirada en juegos web que
// enganchan (ver DOCUMENTACION.md, "Minijuegos"). Ganar uno recarga gasolina,
// con el tope diario de Admin → Ajustes → MINIJUEGOS. Los juegos no dan XP:
// el XP y los rangos salen solo de las lecciones.
import type { Texto } from "../i18n";

export type IdJuego = "punti-flap" | "caza-la-estafa" | "caza-el-glitch" | "palabra-del-dia";

export type InfoJuego = {
  id: IdJuego;
  /** Mundo al que pertenece (id del tema). null = juego de todos los mundos. */
  mundo: string | null;
  color: string;
  nombre: Texto;
  /** Una línea: lo que se hace. */
  gancho: Texto;
  /** Cómo se juega, en pasos cortos. */
  reglas: Record<"es" | "en", string[]>;
  /** Qué se aprende jugando. */
  aprendes: Texto;
  /** Se juega una vez al día (la palabra del día). */
  diario?: boolean;
};

export const JUEGOS: InfoJuego[] = [
  {
    id: "punti-flap",
    mundo: "que-es-la-ia",
    color: "#00ff41",
    nombre: { es: "Punti Flap", en: "Punti Flap" },
    gancho: {
      es: "Vuela entre los portales sin chocar. Después mira a una IA aprender a hacerlo sola.",
      en: "Fly through the portals without crashing. Then watch an AI learn to do it on its own.",
    },
    reglas: {
      es: [
        "Toca la pantalla (o la barra espaciadora) para impulsarte.",
        "Pasa 10 portales para ganar.",
        "Cada portal va un poquito más rápido.",
      ],
      en: [
        "Tap the screen (or press the space bar) to boost.",
        "Get through 10 portals to win.",
        "Each portal is a little faster than the last.",
      ],
    },
    aprendes: {
      es: "Cómo aprende una máquina: probando, fallando y quedándose con lo que funcionó.",
      en: "How a machine learns: trying, failing and keeping what worked.",
    },
  },
  {
    id: "caza-la-estafa",
    mundo: "etica-y-seguridad",
    color: "#ff006e",
    nombre: { es: "Caza la estafa", en: "Scam Hunter" },
    gancho: {
      es: "Te llegan mensajes cada vez más rápido. Toca las señales de estafa antes de que se acabe el tiempo.",
      en: "Messages keep coming, faster and faster. Tap the scam red flags before time runs out.",
    },
    reglas: {
      es: [
        "Toca cada frase sospechosa del mensaje.",
        "Si el mensaje es normal, toca NO VEO NADA RARO.",
        "Aciertos seguidos suben el combo. Tocar una frase normal lo reinicia.",
      ],
      en: [
        "Tap every suspicious line in the message.",
        "If the message is normal, tap LOOKS FINE TO ME.",
        "Hits in a row raise your combo. Tapping a normal line resets it.",
      ],
    },
    aprendes: {
      es: "A reconocer estafas con voces clonadas, videos falsos y mensajes urgentes.",
      en: "To spot scams with cloned voices, fake videos and urgent messages.",
    },
  },
  {
    id: "caza-el-glitch",
    mundo: "imagenes-y-video",
    color: "#00f5ff",
    nombre: { es: "Caza el glitch", en: "Glitch Hunt" },
    gancho: {
      es: "Estas escenas las 'hizo una IA' y tienen errores escondidos. Encuéntralos contra reloj.",
      en: "An 'AI made' these scenes and hid mistakes in them. Find them before time runs out.",
    },
    reglas: {
      es: [
        "Cada escena tiene 3 errores típicos de las imágenes hechas con IA.",
        "Toca donde veas algo raro.",
        "Tocar donde no hay nada te quita 2 segundos.",
      ],
      en: [
        "Each scene has 3 classic AI-image mistakes.",
        "Tap wherever something looks off.",
        "Tapping where there's nothing costs you 2 seconds.",
      ],
    },
    aprendes: {
      es: "Las pistas que delatan una imagen hecha con IA, y por qué no basta con mirarla.",
      en: "The clues that give away an AI image, and why looking isn't enough.",
    },
  },
  {
    id: "palabra-del-dia",
    mundo: null,
    color: "#ffe600",
    nombre: { es: "Palabra IA del día", en: "AI Word of the Day" },
    gancho: {
      es: "Adivina la palabra de IA de hoy en 6 intentos y comparte tu resultado.",
      en: "Guess today's AI word in 6 tries and share your result.",
    },
    reglas: {
      es: [
        "Escribe una palabra del largo indicado.",
        "Verde: letra en su lugar. Amarillo: está, pero en otro lugar. Gris: no está.",
        "Hay una palabra nueva cada día, la misma para todos.",
      ],
      en: [
        "Type a word of the given length.",
        "Green: right letter, right spot. Yellow: it's in the word, somewhere else. Gray: not in the word.",
        "There's a new word every day, the same for everyone.",
      ],
    },
    aprendes: {
      es: "Una palabra de IA al día, con su explicación.",
      en: "One AI word a day, with its explanation.",
    },
    diario: true,
  },
];

export function buscarJuego(id: string): InfoJuego | undefined {
  return JUEGOS.find((j) => j.id === id);
}

/** El juego de un mundo, si tiene. */
export function juegoDelMundo(temaId: string): InfoJuego | undefined {
  return JUEGOS.find((j) => j.mundo === temaId);
}

/**
 * A dónde volver al terminar. Solo se aceptan rutas internas de la app
 * (lección, mundo o la lista de juegos): así nadie puede armar un enlace de
 * Punti que, al terminar el juego, mande a otro sitio.
 */
export function rutaDeVuelta(valor: string | null): string | null {
  if (!valor) return null;
  return /^\/(leccion\/[a-z0-9-]{1,60}\/[a-z0-9-]{1,60}|tema\/[a-z0-9-]{1,60}|juegos|inicio)$/.test(valor) ? valor : null;
}
