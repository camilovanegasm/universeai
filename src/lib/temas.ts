// Ruta de aprendizaje completa (ver CLAUDE.md sección 1), en dos niveles:
// Tema (los 7 "planetas" del mapa principal) → Subtemas (el mini-mapa dentro
// de cada tema). Esto le da a la plataforma espacio para crecer con el tiempo
// sin tener que rediseñar la navegación cada vez que se agrega contenido.
//
// Decisión de producto: el contenido NO es acumulativo como en Duolingo, así
// que no hay candado secuencial ni en temas ni en subtemas. Todos los temas
// están abiertos; dentro de cada uno, un subtema muestra "en construcción"
// simplemente si todavía no tiene lección en `src/lib/lecciones.ts` — nunca
// porque falte completar el anterior.
import type { Rango } from "@/lib/rangos";

export type Subtema = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  en: { titulo: string; descripcion: string };
};

export type Tema = {
  id: string;
  numero: number;
  /** Nombre propio del mundo: lo que se ve grande en la tarjeta. */
  nombre: string;
  /** Qué enseña el mundo: el subtítulo. */
  titulo: string;
  rango: Rango;
  descripcion: string;
  en: { nombre: string; titulo: string; descripcion: string };
  abierto: boolean;
  subtemas: Subtema[];
};

export const TEMAS: Tema[] = [
  {
    id: "que-es-la-ia",
    numero: 1,
    nombre: "Origen",
    rango: "explorador",
    titulo: "Qué es la IA",
    descripcion: "Los conceptos básicos, sin tecnicismos.",
    en: { nombre: "Origin", titulo: "What AI is", descripcion: "The basics, no technical jargon." },
    abierto: true,
    subtemas: [
      { id: "definicion", numero: 1, titulo: "Qué es la IA", descripcion: "La idea central, sin jerga.", en: { titulo: "What AI is", descripcion: "The core idea, no jargon." } },
      { id: "origenes", numero: 2, titulo: "Orígenes de la IA", descripcion: "De Turing a los primeros programas 'inteligentes'.", en: { titulo: "The origins of AI", descripcion: "From Turing to the first 'intelligent' programs." } },
      { id: "historia", numero: 3, titulo: "Breve historia", descripcion: "De la ciencia ficción a tu celular.", en: { titulo: "A brief history", descripcion: "From science fiction to your phone." } },
      { id: "tipos-de-ia", numero: 4, titulo: "Tipos de IA", descripcion: "De la que reconoce fotos a la que conversa contigo.", en: { titulo: "Types of AI", descripcion: "From the kind that recognizes photos to the kind that talks with you." } },
      { id: "mitos-y-verdades", numero: 5, titulo: "Mitos y verdades", descripcion: "Separando la realidad de la ciencia ficción.", en: { titulo: "Myths and facts", descripcion: "Separating reality from science fiction." } },
    ],
  },
  {
    id: "modelos-de-lenguaje",
    numero: 2,
    nombre: "Lexia",
    rango: "explorador",
    titulo: "Modelos de lenguaje",
    descripcion: "Cómo 'piensan' herramientas como ChatGPT.",
    en: { nombre: "Lexia", titulo: "Language models", descripcion: "How tools like ChatGPT 'think'." },
    abierto: true,
    subtemas: [
      { id: "que-es-un-llm", numero: 1, titulo: "Qué es un modelo de lenguaje (LLM)", descripcion: "La base de ChatGPT y similares.", en: { titulo: "What a language model (LLM) is", descripcion: "The foundation of ChatGPT and the like." } },
      { id: "como-entrenan-una-ia", numero: 2, titulo: "Cómo entrenan a una IA", descripcion: "De dónde sale lo que 'sabe'.", en: { titulo: "How an AI gets trained", descripcion: "Where what it 'knows' comes from." } },
      { id: "limitaciones-y-alucinaciones", numero: 3, titulo: "Limitaciones", descripcion: "Por qué a veces 'alucina' o se equivoca.", en: { titulo: "Limitations", descripcion: "Why it sometimes 'hallucinates' or gets things wrong." } },
      {
        id: "modelos-recientes",
        numero: 4,
        titulo: "Los modelos más recientes",
        descripcion: "Contenido vivo: se actualiza cada semana con las novedades del mundo de la IA.",
        en: { titulo: "The latest models", descripcion: "Living content: updated every week with what's new in AI." },
      },
    ],
  },
  {
    id: "prompts",
    numero: 3,
    nombre: "Eco",
    rango: "explorador",
    titulo: "Prompts",
    descripcion: "El arte de pedirle bien las cosas a la IA.",
    en: { nombre: "Echo", titulo: "Prompts", descripcion: "The art of asking AI the right way." },
    abierto: true,
    subtemas: [
      { id: "anatomia-de-un-prompt", numero: 1, titulo: "Anatomía de un buen prompt", descripcion: "Las piezas de una buena instrucción.", en: { titulo: "Anatomy of a good prompt", descripcion: "The pieces of a good instruction." } },
      { id: "errores-comunes", numero: 2, titulo: "Errores comunes", descripcion: "Lo que casi todos hacen mal al empezar.", en: { titulo: "Common mistakes", descripcion: "What almost everyone gets wrong at first." } },
      { id: "prompts-avanzados", numero: 3, titulo: "Prompts avanzados", descripcion: "Roles, ejemplos y trucos de nivel superior.", en: { titulo: "Advanced prompts", descripcion: "Roles, examples and next-level tricks." } },
      { id: "pide-ayuda-a-la-ia", numero: 4, titulo: "Pide ayuda a la IA con tu prompt", descripcion: "Meta-prompting: que la IA te ayude a mejorar lo que le pides.", en: { titulo: "Ask AI to help with your prompt", descripcion: "Meta-prompting: let AI help you improve what you ask for." } },
    ],
  },
  {
    id: "herramientas-de-ia",
    numero: 4,
    nombre: "Forja",
    rango: "capitan",
    titulo: "Herramientas de IA para el trabajo",
    descripcion: "Aplícalo en tu día a día.",
    en: { nombre: "Forge", titulo: "AI tools for work", descripcion: "Put it to use in your day-to-day." },
    abierto: true,
    subtemas: [
      { id: "ia-para-escribir", numero: 1, titulo: "IA para escribir y organizar", descripcion: "Documentos, correos, notas.", en: { titulo: "AI for writing and organizing", descripcion: "Documents, emails, notes." } },
      { id: "ia-para-analizar-datos", numero: 2, titulo: "IA para analizar datos", descripcion: "Hojas de cálculo y reportes.", en: { titulo: "AI for analyzing data", descripcion: "Spreadsheets and reports." } },
      { id: "ia-para-reuniones", numero: 3, titulo: "IA para reuniones y productividad", descripcion: "Resúmenes, tareas, seguimiento.", en: { titulo: "AI for meetings and productivity", descripcion: "Summaries, tasks, follow-ups." } },
    ],
  },
  {
    id: "imagenes-y-video",
    numero: 5,
    nombre: "Prisma",
    rango: "capitan",
    titulo: "Crear imágenes y video con IA",
    descripcion: "De la idea a lo visual.",
    en: { nombre: "Prism", titulo: "Creating images and video with AI", descripcion: "From idea to visuals." },
    abierto: true,
    subtemas: [
      { id: "generadores-de-imagenes", numero: 1, titulo: "Generadores de imágenes", descripcion: "Cómo funcionan por dentro.", en: { titulo: "Image generators", descripcion: "How they work inside." } },
      { id: "tu-primer-prompt-visual", numero: 2, titulo: "Tu primer prompt visual", descripcion: "De la idea a la imagen.", en: { titulo: "Your first visual prompt", descripcion: "From idea to image." } },
      { id: "video-con-ia", numero: 3, titulo: "Video con IA", descripcion: "Qué se puede hacer hoy.", en: { titulo: "Video with AI", descripcion: "What's possible today." } },
      {
        id: "estructura-de-video-completo",
        numero: 4,
        titulo: "Estructura de un video completo (1 minuto)",
        descripcion: "Cómo organizar todas las tomas y prompts de un video corto de principio a fin (con plantilla descargable).",
        en: { titulo: "Structure of a full video (1 minute)", descripcion: "How to organize every shot and prompt of a short video from start to finish (with a downloadable template)." },
      },
    ],
  },
  {
    id: "etica-y-seguridad",
    numero: 6,
    nombre: "Brújula",
    rango: "capitan",
    titulo: "Ética y seguridad",
    descripcion: "Usa la IA de forma responsable.",
    en: { nombre: "Compass", titulo: "Ethics and safety", descripcion: "Use AI responsibly." },
    abierto: true,
    subtemas: [
      { id: "sesgos", numero: 1, titulo: "Sesgos", descripcion: "Por qué la IA no es neutral.", en: { titulo: "Bias", descripcion: "Why AI isn't neutral." } },
      { id: "privacidad", numero: 2, titulo: "Privacidad", descripcion: "Qué no compartir con una IA.", en: { titulo: "Privacy", descripcion: "What not to share with an AI." } },
      { id: "derechos-de-autor", numero: 3, titulo: "Derechos de autor", descripcion: "De quién es el contenido generado.", en: { titulo: "Copyright", descripcion: "Who owns generated content." } },
    ],
  },
  {
    id: "automatizaciones",
    numero: 7,
    nombre: "Autómata",
    rango: "arquitecto",
    titulo: "Automatizaciones",
    descripcion: "Haz que la IA trabaje por ti.",
    en: { nombre: "Automaton", titulo: "Automations", descripcion: "Make AI work for you." },
    abierto: true,
    subtemas: [
      { id: "que-es-automatizar", numero: 1, titulo: "Qué es automatizar con IA", descripcion: "La idea básica.", en: { titulo: "What automating with AI means", descripcion: "The basic idea." } },
      { id: "tu-primer-flujo", numero: 2, titulo: "Tu primer flujo automático", descripcion: "Un ejemplo simple de principio a fin.", en: { titulo: "Your first automated flow", descripcion: "A simple example from start to finish." } },
      { id: "herramientas-sin-codigo", numero: 3, titulo: "Herramientas sin código", descripcion: "Automatizar sin programar.", en: { titulo: "No-code tools", descripcion: "Automate without programming." } },
    ],
  },
];

/* ------------------------------------------------------------------ idioma */

import type { Idioma } from "@/lib/i18n";

/** Nombre, título y descripción de un mundo en el idioma pedido. */
export function textoTema(t: Tema, idioma: Idioma) {
  return idioma === "en"
    ? t.en
    : { nombre: t.nombre, titulo: t.titulo, descripcion: t.descripcion };
}

/** Título y descripción de un subtema en el idioma pedido. */
export function textoSubtema(s: Subtema, idioma: Idioma) {
  return idioma === "en" ? s.en : { titulo: s.titulo, descripcion: s.descripcion };
}
