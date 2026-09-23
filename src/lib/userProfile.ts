// Maneja el "perfil" de cada usuario dentro de Firestore: XP, gasolina, racha y progreso.
// El campo se llama `corazones` por compatibilidad con las cuentas que ya existen;
// en toda la interfaz se llama gasolina.
// Cada usuario tiene un documento en la colección "usuarios", identificado por su ID de Firebase Auth.
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, type Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import { cargarCatalogo } from "./contenido";
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
  // Última fecha en la que completó una lección. La racha se cuenta con esta,
  // no con `ultimaActividad`: fallar un ejercicio o que el admin llene el
  // tanque también tocan `ultimaActividad`, y no deben contar como "jugó hoy".
  // Los perfiles viejos no la tienen; mientras falte se usa `ultimaActividad`.
  ultimaLeccion?: string;
  /** Id de la última lección completada; lo usan las reglas de Firestore. */
  ultimaLeccionId?: string;
  progreso: Record<string, ProgresoLeccion>;
  /** Idioma elegido en la bienvenida. Si falta, la persona todavía no lo eligió. */
  idioma?: Idioma;
  /** true cuando ya pasó por la bienvenida (idioma + manual). */
  bienvenidaVista?: boolean;
  /**
   * Cuándo subió de rango por última vez (hora del servidor). Desde ahí tiene
   * gasolina ilimitada por las horas que diga Ajustes (horasPremioRango).
   * Las reglas solo lo dejan escribir en la misma escritura en que el XP
   * cruza el umbral de un rango.
   */
  premioRangoDesde?: Timestamp;
  /**
   * Premium. Solo el admin lo puede escribir (lo impiden las reglas de
   * Firestore). Todavía no cambia nada en la app: qué incluye se decide con
   * la página de precios.
   */
  premium?: boolean;
};


// Crea el documento del perfil la primera vez que alguien se registra.
// Si el documento ya existe (por ejemplo, alguien que inicia sesión con Google más de una vez),
// no lo sobreescribe para no perder su progreso.
export async function crearPerfilSiNoExiste(usuario: User) {
  const referencia = doc(db, "usuarios", usuario.uid);
  const existente = await getDoc(referencia);

  if (existente.exists()) {
    return;
  }

  // El tanque inicial es el configurado en Ajustes (5 si no se ha cambiado).
  const { ajustes } = await cargarCatalogo();
  await setDoc(referencia, {
    // Recortados a lo que aceptan las reglas de Firestore.
    nombre: (usuario.displayName ?? "").slice(0, 80),
    email: (usuario.email ?? "").slice(0, 200),
    xp: 0,
    corazones: ajustes.juego.gasolinaMaxima,
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
