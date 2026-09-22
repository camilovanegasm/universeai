// Maneja el "perfil" de cada usuario dentro de Firestore: XP, corazones, racha y progreso.
// Cada usuario tiene un documento en la colección "usuarios", identificado por su ID de Firebase Auth.
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";

export type PerfilUsuario = {
  nombre: string;
  email: string;
  xp: number;
  corazones: number;
  racha: number;
  progreso: Record<string, unknown>;
};

const VIDAS_INICIALES = 5;

// Crea el documento del perfil la primera vez que alguien se registra.
// Si el documento ya existe (por ejemplo, alguien que inicia sesión con Google más de una vez),
// no lo sobreescribe para no perder su progreso.
export async function crearPerfilSiNoExiste(usuario: User) {
  const referencia = doc(db, "usuarios", usuario.uid);
  const existente = await getDoc(referencia);

  if (existente.exists()) {
    return;
  }

  await setDoc(referencia, {
    nombre: usuario.displayName ?? "",
    email: usuario.email ?? "",
    xp: 0,
    corazones: VIDAS_INICIALES,
    racha: 0,
    progreso: {},
    creadoEn: serverTimestamp(),
  });
}

export async function obtenerPerfil(uid: string): Promise<PerfilUsuario | null> {
  const referencia = doc(db, "usuarios", uid);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as PerfilUsuario;
}
