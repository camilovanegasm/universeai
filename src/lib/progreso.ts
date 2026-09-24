// Lógica de juego: cuánto combustible/XP se gana por lección, cuándo se resetean los
// gasolina del día, y cuándo la racha sube, se mantiene o se rompe.
import { doc, runTransaction, serverTimestamp, type Transaction } from "firebase/firestore";
import { db } from "./firebase";
import { perfilPorConfirmar, type PerfilUsuario } from "./userProfile";
import { ajustesVigentes } from "./ajustes";
import { rangoPorXp } from "./rangos";

/** Toda escritura del perfil pasa por aquí: al terminar, la próxima pantalla lee el perfil confirmado. */
function transaccion<T>(f: (tx: Transaction) => Promise<T>): Promise<T> {
  return runTransaction(db, f).finally(perfilPorConfirmar);
}

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

/**
 * La fecha a guardar: hoy, salvo que la guardada sea más nueva (otro
 * dispositivo con el reloj un poco adelantado cerca de la medianoche). Las
 * reglas de Firestore no dejan que una fecha vuelva atrás, así que escribir
 * la del reloj de este teléfono haría fallar la escritura entera.
 */
function fechaQueAvanza(hoy: string, guardada: string | undefined): string {
  return guardada && guardada > hoy ? guardada : hoy;
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

/**
 * Gasolina ilimitada: los miembros del Club siempre, y cualquiera durante las
 * horas del premio después de subir de rango. `hasta` es cuándo se acaba el
 * premio (null si es del Club o si no hay premio activo).
 */
export function gasolinaIlimitada(perfil: PerfilUsuario | null, ahora = Date.now()): { activa: boolean; club: boolean; hasta: Date | null } {
  if (!perfil) return { activa: false, club: false, hasta: null };
  if (perfil.premium === true) return { activa: true, club: true, hasta: null };
  const horas = ajustesVigentes().juego.horasPremioRango;
  const desde = perfil.premioRangoDesde?.toMillis?.();
  if (!desde || horas <= 0) return { activa: false, club: false, hasta: null };
  const fin = desde + horas * 3600_000;
  return fin > ahora ? { activa: true, club: false, hasta: new Date(fin) } : { activa: false, club: false, hasta: null };
}

/** "5:12" (horas:minutos): lo que le queda al premio. Corto para que quepa en la cabecera del celular. */
export function textoRestante(hasta: Date, ahora = Date.now()): string {
  const min = Math.max(0, Math.ceil((hasta.getTime() - ahora) / 60000));
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
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

  const guardar = (conPremio: boolean) => transaccion(async (tx) => {
    const snap = await tx.get(referencia);
    if (!snap.exists()) throw new Error("El perfil del usuario no existe.");
    const datos = snap.data() as PerfilUsuario;

    // ¿Esta lección lo hace subir de rango? Si hay premio, arranca ahora
    // (hora del servidor; las reglas comprueban que el XP cruzó un umbral).
    const xpAntes = datos.xp ?? 0;
    const sube = rangoPorXp(xpAntes).actual.id !== rangoPorXp(xpAntes + xp).actual.id;
    const premio = conPremio && sube && ajustesVigentes().juego.horasPremioRango > 0 ? { premioRangoDesde: serverTimestamp() } : {};

    tx.update(referencia, {
      ...premio,
      xp: xpAntes + xp,
      racha: proximaRacha(
        datos.ultimaLeccion ?? datos.ultimaActividad,
        fechaQueAvanza(hoy, datos.ultimaLeccion),
        datos.racha ?? 0,
      ),
      corazones: gasolinaEfectiva(datos),
      ultimaActividad: fechaQueAvanza(hoy, datos.ultimaActividad),
      ultimaLeccion: fechaQueAvanza(hoy, datos.ultimaLeccion),
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

  try {
    await guardar(true);
  } catch (e) {
    // Si las reglas rechazan el premio (por ejemplo, el admin acaba de cambiar
    // los umbrales de XP), la lección se guarda igual, sin premio: completar
    // una lección nunca se pierde por el premio.
    if ((e as { code?: string }).code !== "permission-denied") throw e;
    await guardar(false);
  }
}

/**
 * Descuenta gasolina y devuelve cuánta queda. Devolverla evita que la
 * pantalla tenga que volver a leer el perfil después (una lectura menos
 * por cada error o pista).
 */
async function descontarGasolina(uid: string, cantidad: number): Promise<number> {
  const referencia = doc(db, "usuarios", uid);
  const hoy = fechaDeHoy();

  return transaccion(async (tx) => {
    const snap = await tx.get(referencia);
    if (!snap.exists()) return 0;
    const datos = snap.data() as PerfilUsuario;
    const queda = Math.max(0, gasolinaEfectiva(datos) - cantidad);
    tx.update(referencia, { corazones: queda, ultimaActividad: fechaQueAvanza(hoy, datos.ultimaActividad) });
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

/* ---------------------------------------------- recarga con minijuegos */

/** Cuántas recargas con minijuegos le quedan hoy. */
export function recargasRestantes(perfil: PerfilUsuario | null): number {
  const max = ajustesVigentes().juego.recargasJuegoDia;
  if (!perfil) return max;
  const usadas = perfil.recargaJuegoDia === fechaDeHoy() ? (perfil.recargasJuego ?? 0) : 0;
  return Math.max(0, max - usadas);
}

export type EstadoRecarga =
  | "recargada" // se sumó gasolina
  | "lleno" // el tanque ya estaba lleno (no gasta una recarga)
  | "ilimitada" // Club o premio de rango: no le hace falta
  | "tope" // ya usó las recargas de hoy
  | "espera" // la anterior fue hace muy poco
  | "apagado" // el admin dejó los juegos sin recarga
  | "error"; // Firebase no respondió o rechazó la escritura

export type ResultadoRecarga = { estado: EstadoRecarga; gasolina: number; restantes: number };

/**
 * Suma la gasolina de un minijuego ganado. Todo pasa en una transacción y las
 * reglas de Firestore vuelven a comprobar cada límite con el reloj del
 * servidor (tope diario, tiempo entre recargas, no pasar del tanque). Lo de
 * aquí solo evita intentar escrituras que las reglas van a rechazar.
 * Devuelve la gasolina que queda, para no releer el perfil.
 */
export async function recargarConJuego(uid: string): Promise<ResultadoRecarga> {
  const j = ajustesVigentes().juego;
  const referencia = doc(db, "usuarios", uid);
  const hoy = fechaDeHoy();
  try {
    return await transaccion(async (tx): Promise<ResultadoRecarga> => {
      const snap = await tx.get(referencia);
      if (!snap.exists()) return { estado: "error", gasolina: 0, restantes: 0 };
      const datos = snap.data() as PerfilUsuario;
      const actual = gasolinaEfectiva(datos);
      const restantes = recargasRestantes(datos);
      const base = { gasolina: actual, restantes };
      if (gasolinaIlimitada(datos).activa) return { estado: "ilimitada", ...base };
      if (j.gasolinaPorJuego <= 0 || j.recargasJuegoDia <= 0) return { estado: "apagado", ...base };
      // Día nuevo o tanque lleno: la recarga no hace falta y no se gasta.
      if (datos.ultimaActividad !== hoy || actual >= j.gasolinaMaxima) return { estado: "lleno", ...base };
      if (restantes <= 0) return { estado: "tope", ...base };
      const ultima = datos.ultimaRecargaJuego?.toMillis?.();
      if (ultima && Date.now() - ultima < j.segundosEntreRecargas * 1000) return { estado: "espera", ...base };

      const nueva = Math.min(actual + j.gasolinaPorJuego, j.gasolinaMaxima);
      const mismoDia = datos.recargaJuegoDia === hoy;
      tx.update(referencia, {
        corazones: nueva,
        recargasJuego: mismoDia ? (datos.recargasJuego ?? 0) + 1 : 1,
        recargaJuegoDia: hoy,
        ultimaRecargaJuego: serverTimestamp(),
      });
      return { estado: "recargada", gasolina: nueva, restantes: restantes - 1 };
    });
  } catch {
    // Reglas que dicen que no (por ejemplo, el reloj del teléfono está
    // corrido) o sin conexión: el juego no se rompe, solo no recarga.
    return { estado: "error", gasolina: 0, restantes: 0 };
  }
}
