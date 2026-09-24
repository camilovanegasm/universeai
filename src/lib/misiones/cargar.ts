// De dónde sale una misión.
//
// - Publicada en Firebase (`misiones/{id}`, campo `paquete`): manda esa. La
//   publica el admin desde ADMIN → MISIONES.
// - Si no está en Firebase (o Firebase no responde), se usa la semilla: los
//   paquetes guardados en contenido/misiones/, igual que temas.ts y
//   lecciones.ts son la semilla de las lecciones viejas.
//
// Qué misiones tiene cada mundo sale de `contenido/misiones` (el índice que
// escribe Publicar). Si todavía no hay índice, de la semilla.
//
// Eficiencia: cada misión y el índice se piden una sola vez por visita y se
// guardan en memoria; volver a abrirlos no gasta otra lectura.
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Idioma } from "@/lib/i18n";
import type { PaqueteMision, Texto } from "./tipos";
import { revisarPaquete } from "./revisar.mjs";
import eco03 from "../../../contenido/misiones/eco/03-la-tienda-de-dona-marta.json";

const SEMILLA: PaqueteMision[] = [eco03 as unknown as PaqueteMision];

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

const porId = new Map<string, Promise<PaqueteMision | null>>();
let indice: Promise<ResumenMision[]> | null = null;

const resumirSemilla = (p: PaqueteMision): ResumenMision => ({
  id: p.id,
  mundo: p.mundo,
  capitulo: p.capitulo,
  numero: p.numero,
  titulo: p.titulo,
  resumen: p.resumen,
  minutos: p.minutos,
});

/** Después de publicar u ocultar: la próxima lectura va a Firebase otra vez. */
export function olvidarCache(id?: string) {
  if (id) porId.delete(id);
  indice = null;
}

/** Las misiones de un mundo, en orden de capítulo y número. */
export async function misionesDelMundo(mundo: string): Promise<ResumenMision[]> {
  if (!indice) {
    indice = getDoc(doc(db, "contenido", "misiones"))
      .then((snap) => (snap.exists() ? ((snap.data().lista as ResumenMision[] | undefined) ?? null) : null))
      .catch(() => null)
      .then((lista) => lista ?? SEMILLA.map(resumirSemilla));
  }
  const lista = await indice;
  return lista.filter((m) => m.mundo === mundo).sort((a, b) => a.capitulo - b.capitulo || a.numero - b.numero);
}

/** Los paquetes de la semilla (para importarlos desde el admin). */
export function paquetesSemilla(): PaqueteMision[] {
  return SEMILLA;
}

/**
 * La misión lista para jugar, o null si no existe. Un paquete que no pasa el
 * revisor no se juega: mejor "no encontrada" que una misión rota.
 */
export function cargarMision(id: string): Promise<PaqueteMision | null> {
  const guardada = porId.get(id);
  if (guardada) return guardada;
  const pedido = getDoc(doc(db, "misiones", id))
    .then((snap) => (snap.exists() ? (snap.data().paquete as unknown) : null))
    .catch(() => null)
    .then((deFirebase) => {
      const paquete = deFirebase ?? SEMILLA.find((m) => m.id === id) ?? null;
      if (!paquete) return null;
      const { errores } = revisarPaquete(paquete);
      if (errores.length) {
        console.error(`La misión ${id} tiene errores y no se puede jugar:`, errores);
        return null;
      }
      return paquete as PaqueteMision;
    });
  porId.set(id, pedido);
  return pedido;
}

/** Un texto bilingüe en el idioma del piloto. */
export const tx = (t: Texto | undefined, idioma: Idioma) => (t ? t[idioma] : "");
