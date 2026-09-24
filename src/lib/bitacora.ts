// La Bitácora de [nombre del piloto] (fase C2): el cuaderno de cada piloto.
//
// Vive en usuarios/{uid}/bitacora/{id}. Solo el dueño la lee y la escribe
// (ni el admin lee la de otros); las reglas de Firestore revisan la forma
// exacta y los largos de cada entrada (ver `bitacoraValida` en firestore.rules).
//
// Cuatro tipos, con ids fijos para que repetir una misión ACTUALICE en vez de
// duplicar:
//   concepto-{concepto}          lo que el piloto escribió con sus palabras
//   prompt-{mision}-{bloque}     su prompt en cada Laboratorio
//   ficha-{mision}               la Ficha de misión (lo que aprendió e hizo)
//   nota-{n}                     notas libres (máximo 200)
//
// Todo se muestra como texto (nunca como HTML).
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Idioma, Texto } from "./i18n";

export const MAX_NOTAS = 200;
/** Lo que se lee de una vez: de sobra para un piloto real y nunca una pantalla pesada. */
const MAX_LEER = 500;
export const LARGO = { frase: 280, definicion: 400, prompt: 600, etiqueta: 80, piezas: 400, titulo: 120, nota: 1200 };

type Base = { fecha: Timestamp | null };
export type EntradaConcepto = Base & {
  tipo: "concepto";
  concepto: string;
  titulo: Texto;
  definicion: Texto;
  frase: string;
  mision: string;
  mundo: string;
};
export type EntradaPrompt = Base & {
  tipo: "prompt";
  texto: string;
  etiqueta: Texto;
  /** Las piezas que tenía, en el idioma en que lo escribió ("Quién eres · Para quién es"). */
  piezas: string;
  aprobado: boolean;
  idioma: Idioma;
  mision: string;
  mundo: string;
};
export type EntradaFicha = Base & {
  tipo: "ficha";
  titulo: Texto;
  xp: number;
  combustible: 1 | 2 | 3;
  transmisiones: number;
  conAyuda: number;
  mision: string;
  mundo: string;
};
export type EntradaNota = Base & { tipo: "nota"; texto: string };
export type Entrada = (EntradaConcepto | EntradaPrompt | EntradaFicha | EntradaNota) & { id: string };

const ID = /^[a-z0-9-]{1,80}$/;
const corta = (s: string, n: number) => s.trim().slice(0, n);
const texto = (t: Texto, n: number): Texto => ({ es: corta(t.es ?? "", n), en: corta(t.en ?? "", n) });
const ref = (uid: string, id: string) => doc(db, "usuarios", uid, "bitacora", id);

/** Guarda (o actualiza) lo que el piloto escribió sobre un concepto. */
export async function guardarConcepto(
  uid: string,
  e: { concepto: string; titulo: Texto; definicion: Texto; frase: string; mision: string; mundo: string },
) {
  if (!ID.test(e.concepto) || !ID.test(e.mision) || !ID.test(e.mundo)) return;
  await setDoc(ref(uid, `concepto-${e.concepto}`), {
    tipo: "concepto",
    concepto: e.concepto,
    titulo: texto(e.titulo, LARGO.titulo),
    definicion: texto(e.definicion, LARGO.definicion),
    frase: corta(e.frase, LARGO.frase),
    mision: e.mision,
    mundo: e.mundo,
    fecha: serverTimestamp(),
  });
}

type PromptLab = { bloque: string; texto: string; etiqueta: Texto; piezas: string[]; aprobado: boolean; idioma: Idioma };

/**
 * Al aterrizar: los prompts de cada Laboratorio y la Ficha de misión, en una
 * sola escritura (o todo o nada). No se llama en la vista previa del admin.
 */
export async function guardarAterrizaje(
  uid: string,
  m: {
    mision: string;
    mundo: string;
    titulo: Texto;
    prompts: PromptLab[];
    ficha: { xp: number; combustible: 1 | 2 | 3; transmisiones: number; conAyuda: number };
  },
) {
  if (!ID.test(m.mision) || !ID.test(m.mundo)) return;
  const lote = writeBatch(db);
  for (const p of m.prompts) {
    const t = corta(p.texto, LARGO.prompt);
    if (!t || !/^b\d{2}$/.test(p.bloque)) continue;
    lote.set(ref(uid, `prompt-${m.mision}-${p.bloque}`), {
      tipo: "prompt",
      texto: t,
      etiqueta: texto(p.etiqueta, LARGO.etiqueta),
      piezas: corta(p.piezas.join(" · "), LARGO.piezas),
      aprobado: p.aprobado,
      idioma: p.idioma,
      mision: m.mision,
      mundo: m.mundo,
      fecha: serverTimestamp(),
    });
  }
  lote.set(ref(uid, `ficha-${m.mision}`), {
    tipo: "ficha",
    titulo: texto(m.titulo, LARGO.titulo),
    xp: Math.max(0, Math.min(100, Math.round(m.ficha.xp))),
    combustible: m.ficha.combustible,
    transmisiones: Math.max(0, Math.min(50, Math.round(m.ficha.transmisiones))),
    conAyuda: Math.max(0, Math.min(30, Math.round(m.ficha.conAyuda))),
    mision: m.mision,
    mundo: m.mundo,
    fecha: serverTimestamp(),
  });
  await lote.commit();
}

/** Toda la Bitácora del piloto, lo más nuevo primero. */
export async function leerBitacora(uid: string): Promise<Entrada[]> {
  const snap = await getDocs(query(collection(db, "usuarios", uid, "bitacora"), orderBy("fecha", "desc"), limit(MAX_LEER)));
  const lista = snap.docs.map((d) => ({ id: d.id, ...(d.data({ serverTimestamps: "estimate" }) as Omit<Entrada, "id">) }) as Entrada);
  return lista.sort((a, b) => (b.fecha?.toMillis() ?? 0) - (a.fecha?.toMillis() ?? 0));
}

/** El primer número de nota libre que no se usa (null si ya hay 200). */
export function siguienteNota(entradas: Entrada[]): string | null {
  const usados = new Set(entradas.filter((e) => e.tipo === "nota").map((e) => e.id));
  for (let n = 0; n < MAX_NOTAS; n++) if (!usados.has(`nota-${n}`)) return `nota-${n}`;
  return null;
}

/** Crea o cambia una nota libre. */
export async function guardarNota(uid: string, id: string, textoNota: string) {
  if (!/^nota-\d{1,3}$/.test(id)) throw new Error("id");
  const t = corta(textoNota, LARGO.nota);
  if (!t) throw new Error("vacia");
  await setDoc(ref(uid, id), { tipo: "nota", texto: t, fecha: serverTimestamp() });
}

/** Borra una entrada (el piloto puede borrar cualquiera de su Bitácora). */
export async function borrarEntrada(uid: string, id: string) {
  await deleteDoc(ref(uid, id));
}
