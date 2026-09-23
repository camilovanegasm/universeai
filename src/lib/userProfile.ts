// Maneja el "perfil" de cada usuario dentro de Firestore: XP, gasolina, racha y progreso.
// El campo se llama `corazones` por compatibilidad con las cuentas que ya existen;
// en toda la interfaz se llama gasolina.
// Cada usuario tiene un documento en la colección "usuarios", identificado por su ID de Firebase Auth.
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import type { Idioma } from "./i18n";

export type ProgresoLeccion = {
  completada: boolean;
  combustible: 1 | 2 | 3;
  xpGanado: number;
  tiempoSegundos: number;
};

export type PerfilUsuario = {
  nombre: string;
  email: string;
  xp: number;
  corazones: number;
  racha: number;
  // Última fecha (formato "YYYY-MM-DD") en la que el usuario completó una lección o falló un
  // ejercicio. Se usa para saber si hay que recargar la gasolina del día y si la racha sigue viva.
  ultimaActividad?: string;
  progreso: Record<string, ProgresoLeccion>;
  /** Idioma elegido en la bienvenida. Si falta, la persona todavía no lo eligió. */
  idioma?: Idioma;
  /** true cuando ya pasó por la bienvenida (idioma + manual). */
  bienvenidaVista?: boolean;
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

/**
 * Guarda el idioma apenas se elige, sin esperar a que termine el manual: si la
 * persona cierra la pestaña a mitad del manual, el idioma ya quedó guardado.
 */
export async function guardarIdioma(uid: string, idioma: Idioma) {
  await updateDoc(doc(db, "usuarios", uid), { idioma });
}

/** Marca la bienvenida como vista. Desde aquí /inicio deja de mandar a /bienvenida. */
export async function marcarBienvenidaVista(uid: string) {
  await updateDoc(doc(db, "usuarios", uid), { bienvenidaVista: true });
}
