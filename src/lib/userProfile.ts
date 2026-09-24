// Maneja el "perfil" de cada usuario dentro de Firestore: XP, gasolina, racha y progreso.
// El campo se llama `corazones` por compatibilidad con las cuentas que ya existen;
// en toda la interfaz se llama gasolina.
// Cada usuario tiene un documento en la colección "usuarios", identificado por su ID de Firebase Auth.
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc, type Timestamp } from "firebase/firestore";
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
   * Recargas de gasolina ganadas con minijuegos. `recargaJuegoDia` es el día
   * ("YYYY-MM-DD", UTC) al que corresponde el contador; al cambiar de día el
   * contador vuelve a 1. `ultimaRecargaJuego` es la hora del servidor de la
   * última recarga. Las reglas de Firestore validan los tres campos juntos.
   */
  recargasJuego?: number;
  recargaJuegoDia?: string;
  ultimaRecargaJuego?: Timestamp;
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

/* ------------------------------------------------ el perfil, en vivo
 *
 * Antes cada pantalla pedía el perfil a Firebase al abrirse (una espera de red
 * en cada cambio de pantalla). Ahora hay UNA escucha en vivo por sesión: la
 * primera pantalla espera la respuesta; las siguientes lo tienen al instante,
 * y siempre al día (Firebase avisa cada cambio, también los de otro celular o
 * del admin).
 *
 * Después de guardar progreso (transacciones de progreso.ts) se marca "por
 * confirmar": la próxima pantalla pide la versión del servidor, así nunca
 * muestra el XP o la gasolina de antes de la lección.
 */
type Vivo = {
  uid: string;
  datos: PerfilUsuario | null;
  listo: boolean;
  porConfirmar: boolean;
  esperando: ((p: PerfilUsuario | null) => void)[];
  cancelar: () => void;
};
let vivo: Vivo | null = null;

function leerDelServidor(uid: string): Promise<PerfilUsuario | null> {
  return getDoc(doc(db, "usuarios", uid)).then((s) => (s.exists() ? (s.data() as PerfilUsuario) : null));
}

function escuchar(uid: string) {
  soltarPerfil();
  const v: Vivo = { uid, datos: null, listo: false, porConfirmar: false, esperando: [], cancelar: () => {} };
  vivo = v;
  v.cancelar = onSnapshot(
    doc(db, "usuarios", uid),
    (snap) => {
      // Las horas del servidor que aún no llegan se estiman (no quedan en null).
      v.datos = snap.exists() ? (snap.data({ serverTimestamps: "estimate" }) as PerfilUsuario) : null;
      if (snap.metadata.fromCache && !v.listo) return; // la primera vez, se espera al servidor
      v.listo = true;
      const cola = v.esperando.splice(0);
      cola.forEach((f) => f(v.datos));
    },
    () => {
      // Sin permiso o sin red: quien esperaba lo pide de la forma de siempre.
      const cola = v.esperando.splice(0);
      if (vivo === v) vivo = null;
      cola.forEach((f) => leerDelServidor(uid).then(f, () => f(null)));
    },
  );
}

/** Empieza a escuchar el perfil apenas se sabe quién es (lo llama AuthContext). */
export function precargarPerfil(uid: string) {
  if (vivo?.uid !== uid) escuchar(uid);
}

/** Deja de escuchar (al cerrar sesión o cambiar de cuenta). */
export function soltarPerfil() {
  if (!vivo) return;
  vivo.cancelar();
  vivo = null;
}

/** Tras guardar progreso: la próxima lectura confirma con el servidor. */
export function perfilPorConfirmar() {
  if (vivo) vivo.porConfirmar = true;
}

export async function obtenerPerfil(uid: string): Promise<PerfilUsuario | null> {
  if (vivo?.uid !== uid) escuchar(uid);
  const v = vivo!;
  if (v.porConfirmar) {
    v.porConfirmar = false;
    const datos = await leerDelServidor(uid);
    v.datos = datos;
    return datos;
  }
  if (v.listo) return v.datos;
  return new Promise((resolver) => v.esperando.push(resolver));
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
