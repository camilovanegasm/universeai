// Lógica de juego: cuánto combustible/XP se gana por lección, cuándo se resetean los
// gasolina del día, y cuándo la racha sube, se mantiene o se rompe.
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { PerfilUsuario } from "./userProfile";
import { ajustesVigentes } from "./ajustes";

// Los números del juego (tanque, costos, XP) se cambian desde el admin, en
// Ajustes. Aquí se leen de `ajustesVigentes()`; ver ajustes.ts.
//
// El campo de la gasolina en Firestore se sigue llamando `corazones` a
// propósito: renombrarlo obligaría a migrar los datos de quienes ya tienen
// cuenta, y el nombre guardado no lo ve nadie.

/** Tanque lleno (y recarga diaria), según los ajustes vigentes. */
export function gasolinaMaxima(): number {
  return ajustesVigentes().juego.gasolinaMaxima;
}

export type ResultadoLeccion = {
  errores: number;
  tiempoSegundos: number;
  // Si la lección no define un tiempo objetivo, no hay bono de velocidad posible.
  tiempoObjetivoSegundos?: number;
};

// El día se identifica con la fecha en UTC ("YYYY-MM-DD"), no con la hora local del usuario.
// Es una simplificación válida para el MVP: la racha y la recarga de gasolina cambian a la
// medianoche UTC en vez de a la medianoche de cada usuario.
export function fechaDeHoy(): string {
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
  const j = ajustesVigentes().juego;
  const combustible = calcularCombustible(resultado.errores);
  const rapido =
    resultado.tiempoObjetivoSegundos != null &&
    resultado.tiempoSegundos <= resultado.tiempoObjetivoSegundos;
  const porNota = { 3: j.xpPerfecta, 2: j.xpBuena, 1: j.xpBasica }[combustible];
  const xp = porNota + (rapido ? j.bonoVelocidad : 0);
  return { combustible, xp, rapido };
}

// Gasolina "de verdad" en este momento: si la última actividad no fue hoy, ya se
// recargó al tope aunque Firestore todavía tenga guardado el número de ayer.
export function gasolinaEfectiva(perfil: PerfilUsuario): number {
  const maxima = gasolinaMaxima();
  if (perfil.ultimaActividad !== fechaDeHoy()) {
    return maxima;
  }
  // Si el admin bajó el tanque, nadie se queda con más de lo que cabe.
  return Math.min(perfil.corazones, maxima);
}

// Racha "de verdad": si pasó más de un día completo sin actividad, ya se rompió aunque
// Firestore todavía tenga guardado el número anterior.
export function rachaEfectiva(perfil: PerfilUsuario): number {
  const hoy = fechaDeHoy();
  const ultima = perfil.ultimaLeccion ?? perfil.ultimaActividad;
  if (!ultima) return 0;
  if (ultima === hoy || esDiaAnterior(ultima, hoy)) {
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
// actualiza la racha y aplica la recarga diaria de gasolina si corresponde.
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
      racha: proximaRacha(datos.ultimaLeccion ?? datos.ultimaActividad, hoy, datos.racha ?? 0),
      corazones: gasolinaEfectiva(datos),
      ultimaActividad: hoy,
      ultimaLeccion: hoy,
      // Le dice a las reglas de Firestore qué lección cambió (ver firestore.rules).
      ultimaLeccionId: idLeccion,
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

/**
 * Descuenta gasolina y devuelve cuánta queda. Devolverla evita que la
 * pantalla tenga que volver a leer el perfil después (una lectura menos
 * por cada error o pista).
 */
async function descontarGasolina(uid: string, cantidad: number): Promise<number> {
  const referencia = doc(db, "usuarios", uid);
  const hoy = fechaDeHoy();

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(referencia);
    if (!snap.exists()) return 0;
    const datos = snap.data() as PerfilUsuario;
    const queda = Math.max(0, gasolinaEfectiva(datos) - cantidad);
    tx.update(referencia, { corazones: queda, ultimaActividad: hoy });
    return queda;
  });
}

/** Fallar un ejercicio. Devuelve la gasolina que queda. */
export function gastarGasolina(uid: string): Promise<number> {
  return descontarGasolina(uid, ajustesVigentes().juego.costoError);
}

/** Ver una pista. Devuelve la gasolina que queda. */
export function pagarPista(uid: string): Promise<number> {
  return descontarGasolina(uid, ajustesVigentes().juego.costoPista);
}
