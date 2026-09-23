// Todo lo que usa el panel de administración (/admin).
//
// Ojo: esconder el panel en la interfaz NO es la seguridad. La seguridad son
// las reglas de Firestore (firestore.rules): aunque alguien abra /admin o
// copie este código, Firebase rechaza leer la lista de usuarios o cambiar la
// gasolina y el premium de otro si no es el admin. Aquí solo se evita mostrar
// una pantalla que no le va a funcionar.
import { collection, doc, getDocs, serverTimestamp, updateDoc, type Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import { fechaDeHoy, GASOLINA_MAXIMA, gasolinaEfectiva, rachaEfectiva } from "./progreso";
import type { PerfilUsuario } from "./userProfile";

/** Tiene que coincidir con el correo de `esAdmin()` en firestore.rules. */
export const CORREO_ADMIN = "camilovanegasm@gmail.com";

export function esAdmin(usuario: User | null): boolean {
  return !!usuario && usuario.email === CORREO_ADMIN && usuario.emailVerified;
}

export type UsuarioAdmin = {
  uid: string;
  nombre: string;
  email: string;
  xp: number;
  gasolina: number;
  racha: number;
  lecciones: number;
  idioma: string;
  premium: boolean;
  /** Completó al menos una lección hoy. */
  activoHoy: boolean;
  ultimaLeccion: string | null;
  creadoEn: Date | null;
};

type Documento = PerfilUsuario & { creadoEn?: Timestamp };

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const hoy = fechaDeHoy();
  const snap = await getDocs(collection(db, "usuarios"));
  return snap.docs.map((d) => {
    const p = d.data() as Documento;
    return {
      uid: d.id,
      nombre: p.nombre || "",
      email: p.email || "",
      xp: p.xp ?? 0,
      gasolina: gasolinaEfectiva(p),
      racha: rachaEfectiva(p),
      lecciones: Object.values(p.progreso ?? {}).filter((l) => l?.completada).length,
      idioma: p.idioma ?? "—",
      premium: p.premium === true,
      activoHoy: (p.ultimaLeccion ?? p.ultimaActividad) === hoy,
      ultimaLeccion: p.ultimaLeccion ?? p.ultimaActividad ?? null,
      creadoEn: p.creadoEn?.toDate?.() ?? null,
    };
  });
}

/**
 * Llena el tanque. Se guarda también la fecha de hoy: si no, la app
 * pensaría que la gasolina guardada es de otro día y la ignoraría.
 */
export async function llenarTanque(uid: string) {
  await updateDoc(doc(db, "usuarios", uid), {
    corazones: GASOLINA_MAXIMA,
    ultimaActividad: fechaDeHoy(),
  });
}

export async function cambiarPremium(uid: string, premium: boolean) {
  await updateDoc(doc(db, "usuarios", uid), {
    premium,
    premiumCambiadoEn: serverTimestamp(),
  });
}
