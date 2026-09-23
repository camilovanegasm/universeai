// Lógica de juego: cuánto combustible/XP se gana por lección, cuándo se resetean los
// corazones del día, y cuándo la racha sube, se mantiene o se rompe.
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { PerfilUsuario } from "./userProfile";

const CORAZONES_MAX = 5;
const XP_POR_COMBUSTIBLE: Record<1 | 2 | 3, number> = { 1: 5, 2: 10, 3: 15 };
const BONO_VELOCIDAD = 5;

export type ResultadoLeccion = {
  errores: number;
  tiempoSegundos: number;
  // Si la lección no define un tiempo objetivo, no hay bono de velocidad posible.
  tiempoObjetivoSegundos?: number;
};

// El día se identifica con la fecha en UTC ("YYYY-MM-DD"), no con la hora local del usuario.
// Es una simplificación válida para el MVP: la racha y el reset de corazones cambian a la
// medianoche UTC en vez de a la medianoche de cada usuario.
function fechaDeHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function esDiaAnterior(fecha: string, hoy: string): boolean {
  const ayer = new Date(hoy);
  ayer.setUTCDate(ayer.getUTCDate() - 1);
  return ayer.toISOString().slice(0, 10) === fecha;
}

function calcularCombustible(errores: number): 1 | 2 | 3 {
  if (errores <= 0) return 3;
  if (errores <= 2) return 2;
  return 1;
}

export function calcularXp(resultado: ResultadoLeccion) {
  const combustible = calcularCombustible(resultado.errores);
  const rapido =
    resultado.tiempoObjetivoSegundos != null &&
    resultado.tiempoSegundos <= resultado.tiempoObjetivoSegundos;
  const xp = XP_POR_COMBUSTIBLE[combustible] + (rapido ? BONO_VELOCIDAD : 0);
  return { combustible, xp, rapido };
}

// Corazones "de verdad" en este momento: si la última actividad no fue hoy, ya se resetearon
// a 5 aunque Firestore todavía tenga guardado el número de ayer.
export function corazonesEfectivos(perfil: PerfilUsuario): number {
  if (perfil.ultimaActividad !== fechaDeHoy()) {
    return CORAZONES_MAX;
  }
  return perfil.corazones;
}

// Racha "de verdad": si pasó más de un día completo sin actividad, ya se rompió aunque
// Firestore todavía tenga guardado el número anterior.
export function rachaEfectiva(perfil: PerfilUsuario): number {
  const hoy = fechaDeHoy();
  if (!perfil.ultimaActividad) return 0;
  if (perfil.ultimaActividad === hoy || esDiaAnterior(perfil.ultimaActividad, hoy)) {
    return perfil.racha;
  }
  return 0;
}

function proximaRacha(ultimaActividad: string | undefined, hoy: string, rachaGuardada: number): number {
  if (ultimaActividad === hoy) return rachaGuardada;
  if (ultimaActividad && esDiaAnterior(ultimaActividad, hoy)) return rachaGuardada + 1;
  return 1;
}

// Se llama cuando el usuario termina una lección: suma XP, guarda el combustible ganado,
// actualiza la racha y aplica el reset diario de corazones si corresponde.
export async function completarLeccion(uid: string, idLeccion: string, resultado: ResultadoLeccion) {
  const referencia = doc(db, "usuarios", uid);
  const { combustible, xp } = calcularXp(resultado);
  const hoy = fechaDeHoy();

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(referencia);
    if (!snap.exists()) throw new Error("El perfil del usuario no existe.");
    const datos = snap.data() as PerfilUsuario;

    tx.update(referencia, {
      xp: (datos.xp ?? 0) + xp,
      racha: proximaRacha(datos.ultimaActividad, hoy, datos.racha ?? 0),
      corazones: corazonesEfectivos(datos),
      ultimaActividad: hoy,
      [`progreso.${idLeccion}`]: {
        completada: true,
        combustible,
        xpGanado: xp,
        tiempoSegundos: resultado.tiempoSegundos,
        ultimaVez: serverTimestamp(),
      },
    });
  });
}

async function descontarCorazones(uid: string, cantidad: number) {
  const referencia = doc(db, "usuarios", uid);
  const hoy = fechaDeHoy();

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(referencia);
    if (!snap.exists()) return;
    const datos = snap.data() as PerfilUsuario;

    tx.update(referencia, {
      corazones: Math.max(0, corazonesEfectivos(datos) - cantidad),
      ultimaActividad: hoy,
    });
  });
}

// Se llama cuando el usuario falla un ejercicio dentro de una lección: resta un corazón
// completo (sin bajar de 0), aplicando primero el reset diario si es un día nuevo.
export async function restarCorazon(uid: string) {
  await descontarCorazones(uid, 1);
}

// Se llama cuando el usuario decide desbloquear la pista de un ejercicio: cuesta
// medio corazón en vez de uno completo.
export async function gastarMedioCorazon(uid: string) {
  await descontarCorazones(uid, 0.5);
}
