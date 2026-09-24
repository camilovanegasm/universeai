// Lo que cada bloque de una misión recibe de la página que lo muestra.
import type { Idioma } from "@/lib/i18n";
import type { Bloque, Dicho, Pieza } from "@/lib/misiones/tipos";

/** Lo que el piloto hizo en un laboratorio (para la Bitácora y la Ficha). */
export type RegistroLab = {
  prompt: string;
  checks: Record<string, boolean>;
  aprobado: boolean;
  intentos: number;
};

export type RegistroMision = {
  labs: Record<string, RegistroLab>;
  /** La frase del piloto en la nota a la bitácora. */
  frase: string;
  /** Bloques terminados por agotar intentos (no cuentan como logro). */
  conAyuda: string[];
};

export type PropsBloque<B extends Bloque = Bloque> = {
  bloque: B;
  idioma: Idioma;
  /** Todas las piezas de la misión, por id (colores y títulos compartidos). */
  piezas: Record<string, Pieza>;
  registro: RegistroMision;
  /** Nombre del piloto, para la bitácora. */
  piloto: string;
  /** Punti dice algo arriba. */
  decir: (d: Dicho) => void;
  /** El bloque quedó completo: se habilita Continuar. `conAyuda` si fue por agotar intentos. */
  completar: (conAyuda?: boolean) => void;
  /** Un error en un ejercicio cerrado: cuenta para la nota y gasta gasolina. */
  fallar: () => void;
  guardarLab: (id: string, r: RegistroLab) => void;
  guardarFrase: (frase: string) => void;
};
