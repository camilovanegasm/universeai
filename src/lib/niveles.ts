// Ruta de aprendizaje completa (ver CLAUDE.md sección 1). En el MVP solo el Nivel 1
// tiene contenido real; el resto aparece bloqueado como "Próximamente".
export type Nivel = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  disponible: boolean;
};

export const NIVELES: Nivel[] = [
  {
    id: "que-es-la-ia",
    numero: 1,
    titulo: "Qué es la IA",
    descripcion: "Los conceptos básicos, sin tecnicismos.",
    disponible: true,
  },
  {
    id: "modelos-de-lenguaje",
    numero: 2,
    titulo: "Modelos de lenguaje",
    descripcion: "Cómo 'piensan' herramientas como ChatGPT.",
    disponible: false,
  },
  {
    id: "prompts",
    numero: 3,
    titulo: "Prompts",
    descripcion: "El arte de pedirle bien las cosas a la IA.",
    disponible: false,
  },
  {
    id: "herramientas-de-ia",
    numero: 4,
    titulo: "Herramientas de IA para el trabajo",
    descripcion: "Aplícalo en tu día a día.",
    disponible: false,
  },
  {
    id: "imagenes-y-video",
    numero: 5,
    titulo: "Crear imágenes y video con IA",
    descripcion: "De la idea a lo visual.",
    disponible: false,
  },
  {
    id: "etica-y-seguridad",
    numero: 6,
    titulo: "Ética y seguridad",
    descripcion: "Usa la IA de forma responsable.",
    disponible: false,
  },
  {
    id: "automatizaciones",
    numero: 7,
    titulo: "Automatizaciones",
    descripcion: "Haz que la IA trabaje por ti.",
    disponible: false,
  },
];
