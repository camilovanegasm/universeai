// Tipos del revisor de paquetes (revisar.mjs).
export type ResultadoRevision = {
  errores: string[];
  avisos: string[];
  resumen: { bloques: number; xp: number; labs: number } | null;
};
export function revisarPaquete(paquete: unknown): ResultadoRevision;
