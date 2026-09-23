// Palabras de "Palabra IA del día". Cada idioma tiene su propia lista (no es
// una traducción: en inglés la palabra de hoy puede ser otra). Las palabras
// van en mayúsculas y sin tildes, para que el teclado sea simple; la forma
// con tilde va en `escrita`, que es la que se muestra al final.
//
// Neutral entre marcas (voz de Punti): ninguna palabra es el nombre de una
// empresa o de un producto.
import type { Idioma } from "../i18n";
import { leerJson } from "./records";

export type PalabraDia = { palabra: string; escrita?: string; pista: string; explica: string };

export const PALABRAS: Record<Idioma, PalabraDia[]> = {
  es: [
    { palabra: "PROMPT", pista: "Lo que le escribes a la IA para pedirle algo", explica: "Un prompt es la instrucción que le das a una IA. Mientras más claro y específico, mejor la respuesta." },
    { palabra: "TOKEN", pista: "El pedacito de texto que lee un modelo de lenguaje", explica: "Los modelos leen el texto en pedacitos llamados tokens: a veces una palabra entera, a veces media." },
    { palabra: "DATOS", pista: "Con esto se entrena una IA", explica: "Una IA aprende de datos: textos, fotos, sonidos. Si los datos vienen mal, lo aprendido también." },
    { palabra: "SESGO", pista: "Cuando la IA trata distinto a unas personas que a otras sin razón", explica: "Un sesgo aparece cuando los datos de entrenamiento no representan bien a todo el mundo." },
    { palabra: "MODELO", pista: "El 'cerebro' que queda después de entrenar una IA", explica: "Un modelo es el programa que resulta de entrenar con muchísimos datos. Es lo que responde cuando le escribes." },
    { palabra: "AGENTE", pista: "IA que no solo responde: también hace tareas por ti", explica: "Un agente puede usar herramientas, como el navegador o tus apps, para cumplir una tarea de varios pasos." },
    { palabra: "CHATBOT", pista: "Programa con el que conversas escribiendo", explica: "Un chatbot es un programa que conversa contigo. Los de hoy usan modelos de lenguaje por dentro." },
    { palabra: "NEURONA", pista: "La pieza más pequeña de una red neuronal", explica: "Una neurona artificial hace una cuenta sencilla. Juntando millones de ellas sale una red neuronal." },
    { palabra: "PIXEL", escrita: "PÍXEL", pista: "Cada puntico de color de una imagen", explica: "Las IA de imagen crean una foto decidiendo el color de miles de píxeles." },
    { palabra: "ROBOT", pista: "Máquina que actúa en el mundo físico", explica: "No toda IA es un robot, y no todo robot tiene IA. Un chatbot, por ejemplo, no tiene cuerpo." },
    { palabra: "ALUCINA", pista: "Lo que hace la IA cuando inventa algo con total seguridad", explica: "Cuando un modelo 'alucina', inventa datos que suenan ciertos. Por eso lo importante siempre se verifica." },
    { palabra: "DEEPFAKE", pista: "Video o audio falso hecho con IA", explica: "Un deepfake imita la cara o la voz de una persona real. Desconfía de los pedidos urgentes de plata." },
    { palabra: "CONTEXTO", pista: "Todo lo que la IA tiene en cuenta en una conversación", explica: "El contexto es lo que el modelo 've' en ese momento: tu mensaje, lo que hablaron antes y los archivos que subes." },
    { palabra: "IMAGEN", pista: "Lo que sale cuando describes una escena en un generador", explica: "Un generador de imágenes convierte una descripción en un dibujo o una foto." },
    { palabra: "ESTAFA", pista: "Lo que buscas en el juego de Brújula", explica: "Las estafas con IA usan voces clonadas y videos falsos. Antes de pagar, verifica por otro canal." },
    { palabra: "FUENTE", pista: "De dónde sale un dato", explica: "Antes de creerle a una IA, pídele la fuente y revísala tú." },
    { palabra: "PATRON", escrita: "PATRÓN", pista: "Lo que la IA encuentra en los datos: algo que se repite", explica: "La IA aprende patrones, cosas que se repiten en los datos, y los usa para predecir." },
    { palabra: "ENTRENAR", pista: "Lo que se hace con una IA antes de poder usarla", explica: "Entrenar es mostrarle a un modelo muchísimos ejemplos para que ajuste sus números." },
    { palabra: "PRIVADO", pista: "Así deben quedarse tus claves y tus datos sensibles", explica: "No pegues contraseñas ni datos privados en un chat de IA." },
    { palabra: "CODIGO", escrita: "CÓDIGO", pista: "Instrucciones para programas, que la IA también sabe escribir", explica: "Hoy una IA puede escribir código, pero siempre hay que probar que funcione." },
    { palabra: "VIDEO", pista: "Ahora también se genera a partir de un texto", explica: "Los generadores de video crean clips cortos a partir de una descripción o de una foto." },
    { palabra: "MEMORIA", pista: "Lo que algunos asistentes guardan de ti entre conversaciones", explica: "Algunos asistentes tienen memoria: recuerdan datos tuyos de un chat a otro. Casi siempre puedes revisarla o borrarla." },
    { palabra: "ETICA", escrita: "ÉTICA", pista: "La brújula de la IA", explica: "La ética pregunta si algo se debe hacer, no solo si se puede." },
    { palabra: "VOZ", pista: "Hoy se puede clonar con unos pocos segundos de audio", explica: "Con muestras cortas, una IA puede imitar una voz. Por eso conviene tener una palabra clave en familia." },
  ],
  en: [
    { palabra: "PROMPT", pista: "What you type to ask an AI for something", explica: "A prompt is the instruction you give an AI. The clearer and more specific, the better the answer." },
    { palabra: "TOKEN", pista: "The little chunk of text a language model reads", explica: "Models read text in chunks called tokens: sometimes a whole word, sometimes half of one." },
    { palabra: "DATA", pista: "What an AI is trained on", explica: "An AI learns from data: text, photos, sounds. Bad data means bad learning." },
    { palabra: "BIAS", pista: "When an AI treats some people differently for no good reason", explica: "Bias shows up when the training data doesn't represent everyone well." },
    { palabra: "MODEL", pista: "The 'brain' left over after training an AI", explica: "A model is the program that comes out of training on huge amounts of data. It's what answers when you type." },
    { palabra: "AGENT", pista: "An AI that doesn't just answer: it does tasks for you", explica: "An agent can use tools, like a browser or your apps, to finish a task with several steps." },
    { palabra: "CHATBOT", pista: "A program you talk to by typing", explica: "A chatbot is a program that chats with you. Today's ones run on language models." },
    { palabra: "NEURON", pista: "The smallest piece of a neural network", explica: "An artificial neuron does one simple calculation. Put millions together and you get a neural network." },
    { palabra: "PIXEL", pista: "Each little dot of color in an image", explica: "AI image tools make a picture by deciding the color of thousands of pixels." },
    { palabra: "ROBOT", pista: "A machine that acts in the physical world", explica: "Not every AI is a robot, and not every robot has AI. A chatbot, for example, has no body." },
    { palabra: "DEEPFAKE", pista: "A fake video or audio made with AI", explica: "A deepfake copies a real person's face or voice. Be wary of urgent requests for money." },
    { palabra: "CONTEXT", pista: "Everything the AI takes into account in a conversation", explica: "Context is what the model 'sees' right now: your message, what you talked about before and any files you upload." },
    { palabra: "IMAGE", pista: "What you get when you describe a scene to a generator", explica: "An image generator turns a description into a drawing or a photo." },
    { palabra: "SCAM", pista: "What you hunt in the Compass world game", explica: "AI scams use cloned voices and fake videos. Before paying, check through another channel." },
    { palabra: "SOURCE", pista: "Where a fact comes from", explica: "Before you trust an AI, ask for the source and check it yourself." },
    { palabra: "PATTERN", pista: "What AI finds in data: something that repeats", explica: "AI learns patterns, things that repeat in the data, and uses them to predict." },
    { palabra: "TRAINING", pista: "What an AI goes through before you can use it", explica: "Training means showing a model tons of examples so it adjusts its numbers." },
    { palabra: "PRIVACY", pista: "What your passwords and personal data need", explica: "Don't paste passwords or private data into an AI chat." },
    { palabra: "CODE", pista: "Instructions for programs, which AI can write too", explica: "AI can write code now, but you always have to test that it works." },
    { palabra: "VIDEO", pista: "It can now be generated from text", explica: "Video generators make short clips from a description or a photo." },
    { palabra: "MEMORY", pista: "What some assistants keep about you between chats", explica: "Some assistants have memory: they remember things about you from one chat to the next. You can usually review or delete it." },
    { palabra: "ETHICS", pista: "The compass of AI", explica: "Ethics asks whether something should be done, not just whether it can." },
    { palabra: "VOICE", pista: "It can be cloned from a few seconds of audio", explica: "With short samples, an AI can imitate a voice. A family code word is a good idea." },
  ],
};

/** Día 1 de la palabra del día. */
const INICIO = Date.UTC(2026, 8, 24);

/** Número de la palabra de hoy (#1, #2…), según el día UTC. */
export function numeroDelDia(fecha = new Date()): number {
  const hoy = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  return Math.max(1, Math.floor((hoy - INICIO) / 86_400_000) + 1);
}

/**
 * La palabra de un día. El orden se salta de 7 en 7 (y 7 no divide el largo
 * de las listas), así dos días seguidos no traen palabras del mismo tema.
 */
export function palabraDelDia(idioma: Idioma, numero = numeroDelDia()): PalabraDia {
  const lista = PALABRAS[idioma];
  return lista[((numero - 1) * 7) % lista.length];
}

export type Color = "verde" | "amarillo" | "gris";

/**
 * Colorea un intento como Wordle, con letras repetidas bien contadas: si la
 * palabra tiene una sola A y el intento dos, solo una se pinta.
 */
export function colorear(intento: string, palabra: string): Color[] {
  const res: Color[] = Array(intento.length).fill("gris");
  const quedan: Record<string, number> = {};
  for (let i = 0; i < palabra.length; i++) {
    if (intento[i] === palabra[i]) res[i] = "verde";
    else quedan[palabra[i]] = (quedan[palabra[i]] ?? 0) + 1;
  }
  for (let i = 0; i < intento.length; i++) {
    if (res[i] === "verde") continue;
    const l = intento[i];
    if (quedan[l]) {
      res[i] = "amarillo";
      quedan[l]--;
    }
  }
  return res;
}

/** Dónde se guardan en el navegador los intentos del día. */
export function claveDelDia(idioma: Idioma, numero = numeroDelDia()): string {
  return `punti-palabra-${idioma}-${numero}`;
}

/** ¿Ya terminó la palabra de hoy en este navegador? */
export function palabraTerminadaHoy(idioma: Idioma): boolean {
  const intentos = leerJson<{ intentos: string[] }>(claveDelDia(idioma))?.intentos ?? [];
  return intentos.includes(palabraDelDia(idioma).palabra) || intentos.length >= 6;
}
