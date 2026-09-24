// Los tipos del paquete de misión (formato "punti-mision@1").
//
// El paquete es el archivo en que Claude entrega cada misión, con sus dos
// idiomas adentro. La explicación de cada campo y la ficha de cada bloque
// están en contenido/misiones/FORMATO-PAQUETE.md: si este archivo y ese
// documento no coinciden, hay que arreglar los dos a la vez.
//
// Las reglas que un paquete tiene que cumplir para entrar a la app viven en
// revisar.mjs (las usan la app, el admin y `npm run validar:misiones`).
import type { Texto } from "@/lib/i18n";
import type { EstadoPunti } from "@/lib/puntiSprite";

export type { Texto };

/** Lo que dice Punti al abrir un bloque, al acertar o al fallar. */
export type Dicho = { estado: EstadoPunti; texto: Texto };

type Base = {
  id: string;
  xp: number;
  punti: Dicho;
  titulo?: Texto;
  /** Datos que envejecen: el Radar IA lo revisa cada lunes. */
  vivo?: boolean;
};

export type Pieza = { id: string; color: string; titulo: Texto; descripcion: Texto; ejemplo: Texto };

export type CheckLaboratorio = {
  id: string;
  texto: Texto;
  /** La instrucción que recibe la IA que revisa (dice qué cuenta y qué no). */
  rubrica: string;
  /** Palabras para el modo simulado, en minúsculas y sin tildes. */
  claves: { es: string[]; en: string[] };
};

export type SalidaSimulada = { salida: Texto; salidaTipo?: "texto" | "cartel"; punti: Dicho };

export type GraficoMision =
  | { tipo: "tabla"; encabezados: { a: Texto; b: Texto }; filas: { a: Texto; b: Texto }[] }
  | { tipo: "flujo"; pasos: Texto[] };

export type Bloque =
  | (Base & { tipo: "inicio"; texto: Texto })
  | (Base & { tipo: "transmision"; texto: Texto; grafico?: GraficoMision })
  | (Base & {
      tipo: "antes-despues";
      antes: { prompt: Texto; salida: Texto };
      despues: { partes: { pieza: string; texto: Texto }[]; salida: Texto; salidaTipo: "texto" | "cartel" };
      revelar: Dicho;
    })
  | (Base & { tipo: "piezas"; piezas: Pieza[] })
  | (Base & {
      tipo: "clasificar";
      grupos: (string | { id: string; titulo: Texto })[];
      items: { grupo: string; texto: Texto }[];
      bien: Dicho;
      mal: Dicho;
      malPorGrupo?: Record<string, Dicho>;
    })
  | (Base & {
      tipo: "laboratorio";
      reto: Texto;
      inicial: "vacio" | "anterior";
      aprobar: number;
      maxIntentos: number;
      checks: CheckLaboratorio[];
      sistema: Texto;
      simulado: { bueno: SalidaSimulada & { salidaTipo: "texto" | "cartel" }; debil: SalidaSimulada };
    })
  | (Base & { tipo: "punti-se-equivoco"; trozos: Texto[]; malos: number[]; explicacion: Dicho; mal: Dicho })
  | (Base & {
      tipo: "nota-bitacora";
      concepto: string;
      definicion: Texto;
      pregunta: Texto;
      bien: Dicho;
      guardaPrompt?: string;
      etiqueta?: Texto;
    })
  | (Base & {
      tipo: "punto-control";
      preguntas: { pregunta: Texto; opciones: Texto[]; correcta: number; bien: Dicho; mal: Dicho }[];
    })
  | (Base & {
      tipo: "caso";
      escena: Texto;
      opciones: { texto: Texto; consecuencia: Texto; buena: boolean }[];
      leccion: Dicho;
    })
  | (Base & {
      tipo: "debate";
      pregunta: Texto;
      posturas: { titulo: Texto; argumento: Texto; fuente: string }[];
      cierre: Dicho;
    })
  | (Base & { tipo: "reto-ia"; instruccion: Texto; checks: Texto[]; pegar?: boolean })
  | (Base & { tipo: "fuente"; url: string; fecha: string; porQue: Texto })
  | (Base & { tipo: "pantalla-viva"; texto: Texto; revisado: string; tabla?: GraficoMision });

export type TipoBloque = Bloque["tipo"];
export type BloqueDe<T extends TipoBloque> = Extract<Bloque, { tipo: T }>;

export type PaqueteMision = {
  formato: "punti-mision@1";
  id: string;
  mundo: string;
  capitulo: number;
  numero: number;
  receta: "concepto" | "habilidad" | "criterio" | "construccion" | "mercado" | "futuro";
  largo: "rapida" | "normal" | "proyecto";
  minutos: number;
  conceptos: string[];
  usaConceptos?: string[];
  titulo: Texto;
  resumen: Texto;
  siguiente?: string;
  fuentes: { titulo: string; url: string; fecha: string }[];
  actualizado: string;
  estado: "borrador" | "revision" | "aprobado";
  bloques: Bloque[];
  ficha: {
    concepto: { titulo: Texto; resumen: Texto };
    piezas?: string;
    mejorPrompt?: string[];
    logros: { bloque: string; texto: Texto }[];
    habilidad: { id: string; titulo: Texto };
  };
};
