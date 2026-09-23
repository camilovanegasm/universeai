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
export type Subtema = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
};

export type Tema = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  abierto: boolean;
  subtemas: Subtema[];
};

export const TEMAS: Tema[] = [
  {
    id: "que-es-la-ia",
    numero: 1,
    titulo: "Qué es la IA",
    descripcion: "Los conceptos básicos, sin tecnicismos.",
    abierto: true,
    subtemas: [
      { id: "definicion", numero: 1, titulo: "Qué es la IA", descripcion: "La idea central, sin jerga." },
      { id: "origenes", numero: 2, titulo: "Orígenes de la IA", descripcion: "De Turing a los primeros programas 'inteligentes'." },
      { id: "historia", numero: 3, titulo: "Breve historia", descripcion: "De la ciencia ficción a tu celular." },
      { id: "tipos-de-ia", numero: 4, titulo: "Tipos de IA", descripcion: "De la que reconoce fotos a la que conversa contigo." },
      { id: "mitos-y-verdades", numero: 5, titulo: "Mitos y verdades", descripcion: "Separando la realidad de la ciencia ficción." },
    ],
  },
  {
    id: "modelos-de-lenguaje",
    numero: 2,
    titulo: "Modelos de lenguaje",
    descripcion: "Cómo 'piensan' herramientas como ChatGPT.",
    abierto: true,
    subtemas: [
      { id: "que-es-un-llm", numero: 1, titulo: "Qué es un modelo de lenguaje (LLM)", descripcion: "La base de ChatGPT y similares." },
      { id: "como-entrenan-una-ia", numero: 2, titulo: "Cómo entrenan a una IA", descripcion: "De dónde sale lo que 'sabe'." },
      { id: "limitaciones-y-alucinaciones", numero: 3, titulo: "Limitaciones", descripcion: "Por qué a veces 'alucina' o se equivoca." },
      {
        id: "modelos-recientes",
        numero: 4,
        titulo: "Los modelos más recientes",
        descripcion: "Contenido vivo: se actualiza cada semana con las novedades del mundo de la IA.",
      },
    ],
  },
  {
    id: "prompts",
    numero: 3,
    titulo: "Prompts",
    descripcion: "El arte de pedirle bien las cosas a la IA.",
    abierto: true,
    subtemas: [
      { id: "anatomia-de-un-prompt", numero: 1, titulo: "Anatomía de un buen prompt", descripcion: "Las piezas de una buena instrucción." },
      { id: "errores-comunes", numero: 2, titulo: "Errores comunes", descripcion: "Lo que casi todos hacen mal al empezar." },
      { id: "prompts-avanzados", numero: 3, titulo: "Prompts avanzados", descripcion: "Roles, ejemplos y trucos de nivel superior." },
      { id: "pide-ayuda-a-la-ia", numero: 4, titulo: "Pide ayuda a la IA con tu prompt", descripcion: "Meta-prompting: que la IA te ayude a mejorar lo que le pides." },
    ],
  },
  {
    id: "herramientas-de-ia",
    numero: 4,
    titulo: "Herramientas de IA para el trabajo",
    descripcion: "Aplícalo en tu día a día.",
    abierto: true,
    subtemas: [
      { id: "ia-para-escribir", numero: 1, titulo: "IA para escribir y organizar", descripcion: "Documentos, correos, notas." },
      { id: "ia-para-analizar-datos", numero: 2, titulo: "IA para analizar datos", descripcion: "Hojas de cálculo y reportes." },
      { id: "ia-para-reuniones", numero: 3, titulo: "IA para reuniones y productividad", descripcion: "Resúmenes, tareas, seguimiento." },
    ],
  },
  {
    id: "imagenes-y-video",
    numero: 5,
    titulo: "Crear imágenes y video con IA",
    descripcion: "De la idea a lo visual.",
    abierto: true,
    subtemas: [
      { id: "generadores-de-imagenes", numero: 1, titulo: "Generadores de imágenes", descripcion: "Cómo funcionan por dentro." },
      { id: "tu-primer-prompt-visual", numero: 2, titulo: "Tu primer prompt visual", descripcion: "De la idea a la imagen." },
      { id: "video-con-ia", numero: 3, titulo: "Video con IA", descripcion: "Qué se puede hacer hoy." },
      {
        id: "estructura-de-video-completo",
        numero: 4,
        titulo: "Estructura de un video completo (1 minuto)",
        descripcion: "Cómo organizar todas las tomas y prompts de un video corto de principio a fin (con plantilla descargable).",
      },
    ],
  },
  {
    id: "etica-y-seguridad",
    numero: 6,
    titulo: "Ética y seguridad",
    descripcion: "Usa la IA de forma responsable.",
    abierto: true,
    subtemas: [
      { id: "sesgos", numero: 1, titulo: "Sesgos", descripcion: "Por qué la IA no es neutral." },
      { id: "privacidad", numero: 2, titulo: "Privacidad", descripcion: "Qué no compartir con una IA." },
      { id: "derechos-de-autor", numero: 3, titulo: "Derechos de autor", descripcion: "De quién es el contenido generado." },
    ],
  },
  {
    id: "automatizaciones",
    numero: 7,
    titulo: "Automatizaciones",
    descripcion: "Haz que la IA trabaje por ti.",
    abierto: true,
    subtemas: [
      { id: "que-es-automatizar", numero: 1, titulo: "Qué es automatizar con IA", descripcion: "La idea básica." },
      { id: "tu-primer-flujo", numero: 2, titulo: "Tu primer flujo automático", descripcion: "Un ejemplo simple de principio a fin." },
      { id: "herramientas-sin-codigo", numero: 3, titulo: "Herramientas sin código", descripcion: "Automatizar sin programar." },
    ],
  },
];
