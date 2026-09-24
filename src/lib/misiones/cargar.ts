// De dónde sale una misión.
//
// - Publicada en Firebase (`misiones/{id}`, campo `paquete`): manda esa. La
//   publica el admin desde "Importar misión" (fase C1.2).
// - Si no está en Firebase (o Firebase no responde), se usa la semilla: los
//   paquetes guardados en contenido/misiones/, igual que temas.ts y
//   lecciones.ts son la semilla de las lecciones viejas.
//
// Eficiencia: cada misión se pide una sola vez por visita y se guarda en
// memoria; volver a abrirla no gasta otra lectura.
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Idioma } from "@/lib/i18n";
import type { PaqueteMision, Texto } from "./tipos";
import { revisarPaquete } from "./revisar.mjs";
import eco03 from "../../../contenido/misiones/eco/03-la-tienda-de-dona-marta.json";

const SEMILLA: PaqueteMision[] = [eco03 as unknown as PaqueteMision];

const porId = new Map<string, Promise<PaqueteMision | null>>();

/** Las misiones de un mundo que trae la semilla, en orden. */
export function misionesSemilla(mundo: string): PaqueteMision[] {
  return SEMILLA.filter((m) => m.mundo === mundo).sort((a, b) => a.capitulo - b.capitulo || a.numero - b.numero);
}

/**
 * La misión lista para jugar, o null si no existe. Un paquete que no pasa el
 * revisor no se juega: mejor "en construcción" que una misión rota.
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
