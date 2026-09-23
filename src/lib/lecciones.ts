// Contenido educativo de cada lección: la explicación de Punti (lectura, con gráficos)
// seguida de los 5 tipos de ejercicio.
//
// CADA LECCIÓN SE ESCRIBE DOS VECES, COMPLETA: una en español y otra en inglés.
// No se traduce frase por frase a propósito: así es como se traduce contenido de
// verdad — alguien toma la lección entera y la reescribe —, y evita que una pista
// en inglés termine pegada a un ejercicio en español. Cada versión tiene sus
// propias respuestas correctas y su propio orden, así que las dos se califican
// por separado sin mezclarse.
//
// Por ahora solo existe la lección del Nivel 1.
import type { EstadoPunti } from "@/lib/puntiSprite";
import type { Idioma } from "@/lib/i18n";

export type GraficoTabla = {
  tipo: "tabla";
  encabezados: [string, string];
  filas: [string, string][];
};

export type GraficoFlujo = {
  tipo: "flujo";
  pasos: string[];
};

export type Grafico = GraficoTabla | GraficoFlujo;

export type PantallaExplicacion = {
  texto: string;
  estadoPunti: EstadoPunti;
  grafico?: Grafico;
};

export type EjercicioOpcionMultiple = {
  tipo: "opcion-multiple";
  pregunta: string;
  opciones: string[];
  correcta: number;
  pista: string;
};

export type EjercicioVerdaderoFalso = {
  tipo: "verdadero-falso";
  enunciado: string;
  correcta: boolean;
  pista: string;
};

export type EjercicioCompletarFrase = {
  tipo: "completar-frase";
  antes: string;
  despues: string;
  opciones: string[];
  correcta: number;
  pista: string;
};

export type EjercicioOrdenarPasos = {
  tipo: "ordenar-pasos";
  instruccion: string;
  pasos: string[]; // en el orden correcto
  pista: string;
};

export type EjercicioEscribirPrompt = {
  tipo: "escribir-prompt";
  instruccion: string;
  pista: string;
};

export type Ejercicio =
  | EjercicioOpcionMultiple
  | EjercicioVerdaderoFalso
  | EjercicioCompletarFrase
  | EjercicioOrdenarPasos
  | EjercicioEscribirPrompt;

export type Leccion = {
  id: string;
  explicacion: PantallaExplicacion[];
  ejercicios: Ejercicio[];
  tiempoObjetivoSegundos: number;
  tarea: string;
};

const DEFINICION_ES: Leccion = {
    id: "definicion",
    tiempoObjetivoSegundos: 180,
    tarea:
      "Esta semana, escríbele a una IA (como ChatGPT o Gemini) 3 prompts distintos pidiendo ayuda con algo real de tu día a día: el trabajo, el estudio, o algo que simplemente te dé curiosidad. Anota qué tan buena fue cada respuesta.",
    explicacion: [
      {
        texto:
          "Hola, astronauta. Soy Punti, y este universo lo armé yo, planeta por planeta, para que aprendas IA sin marearte. Antes de despegar, hablemos claro: ¿qué rayos ES la Inteligencia Artificial?",
        estadoPunti: "boot",
      },
      {
        texto:
          "Nada de robots que quieren dominar el mundo. La IA es simplemente un programa que APRENDE viendo montones de ejemplos, en vez de que un humano le programe cada paso a mano.",
        estadoPunti: "online",
        grafico: {
          tipo: "tabla",
          encabezados: ["Programación tradicional", "Inteligencia Artificial"],
          filas: [
            ["Un humano escribe reglas paso a paso", "El programa aprende viendo miles de ejemplos"],
            ["Si algo cambia, hay que reescribir el código", "Se ajusta solo al ver más datos"],
          ],
        },
      },
      {
        texto:
          "Herramientas como ChatGPT leyeron muchísimo texto y aprendieron patrones del lenguaje. Por eso pueden responder preguntas, escribir código o inventar un poema sobre tacos. Así es como arman una respuesta:",
        estadoPunti: "loading",
        grafico: {
          tipo: "flujo",
          pasos: [
            "Recibes una pregunta (prompt)",
            "La IA analiza el texto y busca patrones",
            "Genera una respuesta palabra por palabra",
            "Ves la respuesta en pantalla",
          ],
        },
      },
      {
        texto:
          "Y la forma en que tú le hablas a una IA se llama 'prompt'. Mientras más claro seas pidiendo lo que quieres, mejor te responde. Vamos a practicar todo esto. ¿Listo? Nivel iniciado.",
        estadoPunti: "hype",
      },
    ],
    ejercicios: [
      {
        tipo: "opcion-multiple",
        pregunta: "¿Qué es la Inteligencia Artificial?",
        opciones: [
          "Un robot humanoide que piensa exactamente como una persona",
          "Programas de computadora que aprenden a partir de datos para hacer tareas que normalmente requieren inteligencia humana",
          "Una app que solo funciona con internet súper rápido",
          "Un tipo de videojuego",
        ],
        correcta: 1,
        pista:
          "Piensa en la tabla que vimos: la IA no sigue reglas fijas, aprende viendo ejemplos.",
      },
      {
        tipo: "verdadero-falso",
        enunciado:
          "La Inteligencia Artificial puede aprender de ejemplos, en vez de que un programador le diga paso a paso qué hacer.",
        correcta: true,
        pista: "Es justo la diferencia que marcamos entre programación tradicional e IA.",
      },
      {
        tipo: "completar-frase",
        antes: "ChatGPT es un ejemplo de IA que puede entender y generar",
        despues: ".",
        opciones: ["texto", "electricidad", "gasolina"],
        correcta: 0,
        pista: "ChatGPT trabaja con lenguaje: palabras, oraciones, conversaciones.",
      },
      {
        tipo: "ordenar-pasos",
        instruccion: "Ordena cómo una IA como ChatGPT genera una respuesta:",
        pasos: [
          "Recibes una pregunta (prompt)",
          "La IA analiza el texto y busca patrones que aprendió",
          "La IA genera una respuesta palabra por palabra",
          "Ves la respuesta en pantalla",
        ],
        pista: "Es el mismo orden del diagrama que te mostré antes de empezar.",
      },
      {
        tipo: "escribir-prompt",
        instruccion:
          "Escribe una instrucción (prompt) pidiéndole a una IA que te explique qué es la fotosíntesis como si tuvieras 10 años.",
        pista:
          "Sé específico: dile a quién va dirigido (un niño de 10 años) y qué tono quieres (simple, con ejemplos).",
      },
    ],
};

const DEFINICION_EN: Leccion = {
  id: "definicion",
  tiempoObjetivoSegundos: 180,
  tarea:
    "This week, write 3 different prompts to an AI (like ChatGPT or Gemini) asking for help with something real in your day-to-day: work, study, or something you're simply curious about. Note down how good each answer was.",
  explicacion: [
    {
      texto:
        "Hello, astronaut. I'm Punti, and I built this universe myself, planet by planet, so you can learn AI without getting dizzy. Before we take off, let's be clear: what on earth IS Artificial Intelligence?",
      estadoPunti: "boot",
    },
    {
      texto:
        "Forget robots that want to take over the world. AI is simply a program that LEARNS by looking at tons of examples, instead of a human programming every step by hand.",
      estadoPunti: "online",
      grafico: {
        tipo: "tabla",
        encabezados: ["Traditional programming", "Artificial Intelligence"],
        filas: [
          ["A human writes the rules step by step", "The program learns by seeing thousands of examples"],
          ["If something changes, the code has to be rewritten", "It adjusts on its own as it sees more data"],
        ],
      },
    },
    {
      texto:
        "Tools like ChatGPT read an enormous amount of text and learned the patterns of language. That's why they can answer questions, write code or make up a poem about tacos. Here's how they put an answer together:",
      estadoPunti: "loading",
      grafico: {
        tipo: "flujo",
        pasos: [
          "You send a question (a prompt)",
          "The AI analyzes the text and looks for patterns",
          "It generates an answer word by word",
          "You see the answer on screen",
        ],
      },
    },
    {
      texto:
        "And the way you talk to an AI is called a 'prompt'. The clearer you are about what you want, the better it answers. Let's practice all of this. Ready? Level started.",
      estadoPunti: "hype",
    },
  ],
  ejercicios: [
    {
      tipo: "opcion-multiple",
      pregunta: "What is Artificial Intelligence?",
      opciones: [
        "A humanoid robot that thinks exactly like a person",
        "Computer programs that learn from data to do tasks that normally require human intelligence",
        "An app that only works with super-fast internet",
        "A kind of video game",
      ],
      correcta: 1,
      pista: "Think about the table we saw: AI doesn't follow fixed rules, it learns by looking at examples.",
    },
    {
      tipo: "verdadero-falso",
      enunciado:
        "Artificial Intelligence can learn from examples, instead of a programmer telling it step by step what to do.",
      correcta: true,
      pista: "That's exactly the difference we pointed out between traditional programming and AI.",
    },
    {
      tipo: "completar-frase",
      antes: "ChatGPT is an example of AI that can understand and generate",
      despues: ".",
      opciones: ["text", "electricity", "gasoline"],
      correcta: 0,
      pista: "ChatGPT works with language: words, sentences, conversations.",
    },
    {
      tipo: "ordenar-pasos",
      instruccion: "Put in order how an AI like ChatGPT generates an answer:",
      pasos: [
        "You send a question (a prompt)",
        "The AI analyzes the text and looks for patterns it learned",
        "The AI generates an answer word by word",
        "You see the answer on screen",
      ],
      pista: "It's the same order as the diagram I showed you before we started.",
    },
    {
      tipo: "escribir-prompt",
      instruccion:
        "Write an instruction (a prompt) asking an AI to explain what photosynthesis is as if you were 10 years old.",
      pista: "Be specific: tell it who it's for (a 10-year-old) and what tone you want (simple, with examples).",
    },
  ],
};

/**
 * Todas las lecciones, cada una en sus dos idiomas. Las dos versiones son
 * obligatorias: una lección no se publica a medias.
 */
export const LECCIONES: Record<string, Record<Idioma, Leccion>> = {
  definicion: { es: DEFINICION_ES, en: DEFINICION_EN },
};

export function obtenerLeccion(id: string, idioma: Idioma): Leccion | undefined {
  return LECCIONES[id]?.[idioma];
}
