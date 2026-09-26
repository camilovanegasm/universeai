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
// La semilla NO viaja dentro de la app: son archivos fijos que se generan al
// publicar el sitio (/semilla con el índice y /semilla/<id> con cada misión).
// Así el celular baja solo lo que va a usar, no las 240 misiones de una vez.
//
// Eficiencia: cada misión y el índice se piden una sola vez por visita y se
// guardan en memoria; volver a abrirlos no gasta otra lectura.
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Idioma } from "@/lib/i18n";
import type { PaqueteMision, Texto } from "./tipos";
import { revisarPaquete } from "./revisar.mjs";
import type { ResumenMision } from "./resumen";

export type { ResumenMision };

const porId = new Map<string, Promise<PaqueteMision | null>>();
let indice: Promise<ResumenMision[]> | null = null;

// ---------- La semilla, pedida a los archivos fijos /semilla

const ID_VALIDO = /^[a-z0-9-]{1,80}$/;
const semillaPorId = new Map<string, Promise<unknown | null>>();
let indiceSemillaPedido: Promise<ResumenMision[]> | null = null;

/** Baja un JSON del mismo sitio; si falla (sin internet, 404), da null. */
const bajarJson = (ruta: string): Promise<unknown | null> =>
  fetch(ruta, { headers: { Accept: "application/json" } })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

/**
 * La lista corta de las misiones de la semilla. Si no se pudo bajar, da una
 * lista vacía y la olvida, para volver a intentarlo la próxima vez.
 */
export function indiceSemilla(): Promise<ResumenMision[]> {
  if (!indiceSemillaPedido) {
    const pedido = bajarJson("/semilla").then((datos) => {
      if (Array.isArray(datos)) return datos as ResumenMision[];
      if (indiceSemillaPedido === pedido) indiceSemillaPedido = null;
      return [];
    });
    indiceSemillaPedido = pedido;
  }
  return indiceSemillaPedido;
}

/**
 * El paquete de una misión de la semilla tal como está en el archivo (sin
 * revisar), o null si no existe. Si falló la conexión se olvida el intento.
 */
export function paqueteSemilla(id: string): Promise<unknown | null> {
  if (!ID_VALIDO.test(id)) return Promise.resolve(null);
  const guardado = semillaPorId.get(id);
  if (guardado) return guardado;
  const pedido = bajarJson(`/semilla/${id}`).then((datos) => {
    if (datos === null) semillaPorId.delete(id);
    return datos;
  });
  semillaPorId.set(id, pedido);
  return pedido;
}

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
      .then((lista) => lista ?? indiceSemilla());
  }
  const pedido = indice;
  const lista = await pedido;
  // Lista vacía = no hubo ni Firebase ni semilla (sin conexión): se reintenta después.
  if (!lista.length && indice === pedido) indice = null;
  return lista.filter((m) => m.mundo === mundo).sort((a, b) => a.capitulo - b.capitulo || a.numero - b.numero);
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
    .then((deFirebase) => deFirebase ?? paqueteSemilla(id))
    .then((paquete) => {
      if (!paquete) {
        // No encontrada (o sin conexión): se olvida para reintentar al volver.
        if (porId.get(id) === pedido) porId.delete(id);
        return null;
      }
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
