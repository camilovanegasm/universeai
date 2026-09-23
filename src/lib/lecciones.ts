// Contenido educativo de cada lección: la explicación de Punti (lectura, con gráficos)
// seguida de los 5 tipos de ejercicio. Por ahora solo existe la lección del Nivel 1.
import type { EstadoPunti } from "@/components/Punti";

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

export const LECCIONES: Record<string, Leccion> = {
  definicion: {
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
  },
};
