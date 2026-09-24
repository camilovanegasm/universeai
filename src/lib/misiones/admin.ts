// Lo que usa el admin para las misiones: importar, borrador, publicar,
// versiones y restaurar. Las reglas de Firestore solo dejan escribir esto al
// admin (y leer las versiones). Ninguna pantalla pública importa este archivo.
//
// DÓNDE VIVE CADA COSA EN FIREBASE
//   borradores/mision-{id}              la misión como la está editando el admin
//   borradores/misiones                 la lista de borradores (para no leer toda la colección)
//   misiones/{id}                       la misión publicada: lo que juegan los pilotos
//   misiones/{id}/versiones/{n}         cada publicación, para poder volver atrás
//   contenido/misiones                  el índice público: qué misiones hay en cada mundo
//
// Nada llega a los pilotos hasta PUBLICAR. Publicar vuelve a pasar el revisor:
// un paquete con errores no se publica aunque alguien lo intente.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revisarPaquete, type ResultadoRevision } from "./revisar.mjs";
import { olvidarCache, type ResumenMision } from "./cargar";
import type { PaqueteMision } from "./tipos";

export type { ResumenMision };

export type EntradaBorrador = ResumenMision & { actualizado: number };

export type InfoPublicada = { version: number; publicadoEn: Date | null; club: boolean; firma: string };

export type Version = { numero: number; publicadoEn: Date | null; paquete: PaqueteMision };

/** Tamaño máximo de un paquete (Firestore acepta 1 MB por documento; se deja margen). */
export const MAX_BYTES = 400_000;

/** JSON con las claves ordenadas: sirve para saber si dos paquetes son iguales. */
export function firmaPaquete(p: unknown): string {
  return JSON.stringify(p, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]])) : v,
  );
}

export function resumen(p: PaqueteMision): ResumenMision {
  return {
    id: p.id,
    mundo: p.mundo,
    capitulo: p.capitulo,
    numero: p.numero,
    titulo: p.titulo,
    resumen: p.resumen,
    minutos: p.minutos,
  };
}

const aFecha = (t: unknown) => ((t as Timestamp | undefined)?.toDate?.() ?? null);
const ordenar = <T extends ResumenMision>(l: T[]) =>
  [...l].sort((a, b) => a.mundo.localeCompare(b.mundo) || a.capitulo - b.capitulo || a.numero - b.numero);

/* ------------------------------------------------------------ revisar */

/**
 * Lee un texto pegado o un archivo y lo revisa. No escribe nada.
 * Devuelve el paquete solo si no tiene errores.
 */
export function revisarTexto(texto: string): ResultadoRevision & { paquete: PaqueteMision | null } {
  if (new Blob([texto]).size > MAX_BYTES) {
    return { errores: [`el paquete pesa más de ${MAX_BYTES / 1000} KB`], avisos: [], resumen: null, paquete: null };
  }
  let valor: unknown;
  try {
    valor = JSON.parse(texto);
  } catch (e) {
    return { errores: [`no es JSON válido: ${(e as Error).message}`], avisos: [], resumen: null, paquete: null };
  }
  const r = revisarPaquete(valor);
  return { ...r, paquete: r.errores.length ? null : (valor as PaqueteMision) };
}

/* ------------------------------------------------------------ borradores */

export async function listarBorradores(): Promise<EntradaBorrador[]> {
  const snap = await getDoc(doc(db, "borradores", "misiones"));
  return ordenar((snap.exists() ? (snap.data().lista as EntradaBorrador[] | undefined) : undefined) ?? []);
}

export async function leerBorrador(id: string): Promise<PaqueteMision | null> {
  const snap = await getDoc(doc(db, "borradores", `mision-${id}`));
  return snap.exists() ? ((snap.data().paquete as PaqueteMision | undefined) ?? null) : null;
}

/** Guarda el borrador (y lo anota en la lista). No toca lo publicado. */
export async function guardarBorrador(p: PaqueteMision): Promise<void> {
  const lista = (await listarBorradores()).filter((x) => x.id !== p.id);
  const lote = writeBatch(db);
  lote.set(doc(db, "borradores", `mision-${p.id}`), { paquete: p, actualizadoEn: serverTimestamp() });
  lote.set(doc(db, "borradores", "misiones"), { lista: ordenar([...lista, { ...resumen(p), actualizado: Date.now() }]) });
  await lote.commit();
}

/* ------------------------------------------------------------ publicado */

export async function infoPublicada(id: string): Promise<InfoPublicada | null> {
  const snap = await getDoc(doc(db, "misiones", id));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    version: (d.version as number) ?? 0,
    publicadoEn: aFecha(d.publicadoEn),
    club: d.club === true,
    firma: firmaPaquete(d.paquete),
  };
}

async function leerIndice(): Promise<ResumenMision[]> {
  const snap = await getDoc(doc(db, "contenido", "misiones"));
  return (snap.exists() ? (snap.data().lista as ResumenMision[] | undefined) : undefined) ?? [];
}

/**
 * Publica el borrador: la misión pública, una versión nueva y el índice, en
 * una sola escritura (o todo o nada). `club` marca las misiones de los mundos
 * del Club: las reglas solo dejan leerlas a miembros y al admin.
 */
export async function publicar(id: string, club: boolean): Promise<number> {
  const paquete = await leerBorrador(id);
  if (!paquete) throw new Error("No hay borrador de esta misión.");
  const { errores } = revisarPaquete(paquete);
  if (errores.length) throw new Error(`El borrador tiene ${errores.length} errores: corrígelos antes de publicar.`);

  const [actual, indice] = await Promise.all([infoPublicada(id), leerIndice()]);
  const version = (actual?.version ?? 0) + 1;
  const lote = writeBatch(db);
  lote.set(doc(db, "misiones", id), { paquete, mundo: paquete.mundo, club, version, publicadoEn: serverTimestamp() });
  lote.set(doc(db, "misiones", id, "versiones", String(version).padStart(4, "0")), {
    paquete,
    numero: version,
    publicadoEn: serverTimestamp(),
  });
  lote.set(doc(db, "contenido", "misiones"), { lista: ordenar([...indice.filter((x) => x.id !== id), resumen(paquete)]) });
  await lote.commit();
  olvidarCache(id);
  return version;
}

/** Las últimas versiones publicadas, de la más nueva a la más vieja. */
export async function listarVersiones(id: string, cuantas = 20): Promise<Version[]> {
  const snap = await getDocs(query(collection(db, "misiones", id, "versiones"), orderBy("numero", "desc"), limit(cuantas)));
  return snap.docs.map((d) => ({
    numero: d.data().numero as number,
    publicadoEn: aFecha(d.data().publicadoEn),
    paquete: d.data().paquete as PaqueteMision,
  }));
}

/**
 * Trae una versión vieja al borrador. No publica: el admin la revisa en la
 * vista previa y decide si la publica (lo que crea una versión nueva, así el
 * historial nunca se reescribe).
 */
export async function restaurarVersion(v: Version): Promise<void> {
  await guardarBorrador(v.paquete);
}

/** Saca la misión del índice: deja de aparecer en su mundo. No borra nada. */
export async function ocultar(id: string): Promise<void> {
  const indice = await leerIndice();
  await setDoc(doc(db, "contenido", "misiones"), { lista: indice.filter((x) => x.id !== id) });
  olvidarCache(id);
}
