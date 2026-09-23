// Récord personal de cada minijuego. Vive en el navegador (localStorage): no
// da ninguna ventaja en el juego, así que no hace falta gastar lecturas ni
// escrituras de Firebase en él. Si el navegador bloquea el almacenamiento,
// el récord vale solo para esta visita.

const memoria = new Map<string, number>();

function clave(id: string) {
  return `punti-record-${id}`;
}

export function leerRecord(id: string): number {
  try {
    const v = Number(localStorage.getItem(clave(id)));
    if (Number.isFinite(v) && v > 0) return v;
  } catch {
    // sin almacenamiento
  }
  return memoria.get(id) ?? 0;
}

/** Guarda el puntaje si supera el récord. Devuelve true si es récord nuevo. */
export function guardarRecord(id: string, puntos: number): boolean {
  if (puntos <= leerRecord(id)) return false;
  memoria.set(id, puntos);
  try {
    localStorage.setItem(clave(id), String(puntos));
  } catch {
    // sin almacenamiento
  }
  return true;
}

/** Lee y escribe un JSON pequeño del navegador sin romperse si está bloqueado. */
export function leerJson<T>(k: string): T | null {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export function guardarJson(k: string, valor: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(valor));
  } catch {
    // sin almacenamiento
  }
}
