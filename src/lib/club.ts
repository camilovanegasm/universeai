// Punti Club del lado del estudiante: la lista de espera.
//
// Cada persona se anota una sola vez (el documento se llama como su uid) y
// con su propio correo: lo comprueban las reglas de Firestore (listaEspera).
// Solo el admin puede ver la lista completa.
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Idioma } from "./i18n";

export type PlanClub = "mensual" | "anual" | "fundador";
export type MonedaClub = "COP" | "USD";

export type Anotacion = { plan: PlanClub; moneda: MonedaClub };

export async function miAnotacion(uid: string): Promise<Anotacion | null> {
  const snap = await getDoc(doc(db, "listaEspera", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return { plan: d.plan as PlanClub, moneda: d.moneda as MonedaClub };
}

export async function anotarme(uid: string, email: string, plan: PlanClub, moneda: MonedaClub, idioma: Idioma) {
  await setDoc(doc(db, "listaEspera", uid), { email, plan, moneda, idioma, creadoEn: serverTimestamp() });
}

export async function salirDeLaLista(uid: string) {
  await deleteDoc(doc(db, "listaEspera", uid));
}
