// La ficha corta de una misión: lo que se muestra en la ruta de su mundo.
// Vive aparte (sin Firebase ni misiones adentro) para que la usen tanto el
// navegador como el servidor que arma el índice de la semilla.
import type { PaqueteMision, Texto } from "./tipos";

/** Lo que se muestra de una misión en la ruta de su mundo. */
export type ResumenMision = {
  id: string;
  mundo: string;
  capitulo: number;
  numero: number;
  titulo: Texto;
  resumen: Texto;
  minutos: number;
};

export const resumirMision = (p: PaqueteMision): ResumenMision => ({
  id: p.id,
  mundo: p.mundo,
  capitulo: p.capitulo,
  numero: p.numero,
  titulo: p.titulo,
  resumen: p.resumen,
  minutos: p.minutos,
});
