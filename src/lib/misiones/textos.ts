// Los textos de un paquete, para editarlos en el admin sin tocar el JSON.
//
// Recorre el paquete y encuentra cada texto bilingüe ({ es, en }). Cada uno
// sale con su ruta (para cambiarlo) y una etiqueta que dice dónde está
// ("b05 · laboratorio · reto"). Lo que no es texto para leer (ids, índices,
// colores, claves del modo simulado) no aparece: no se toca desde aquí.
import type { Texto } from "@/lib/i18n";
import type { PaqueteMision } from "./tipos";

export type Ruta = (string | number)[];

export type CampoTexto = {
  ruta: Ruta;
  /** Id del bloque, o "mision" / "ficha" para lo de afuera. */
  grupo: string;
  etiqueta: string;
  valor: Texto;
  /** Textos largos van en un cuadro más alto. */
  largo: boolean;
};

const esTexto = (x: unknown): x is Texto =>
  !!x && typeof x === "object" && !Array.isArray(x) && Object.keys(x).length === 2 &&
  typeof (x as Texto).es === "string" && typeof (x as Texto).en === "string";

// Nombres de campo en palabras de la gente.
const NOMBRES: Record<string, string> = {
  titulo: "título", resumen: "resumen", texto: "texto", punti: "Punti dice", reto: "reto", sistema: "instrucción para la IA",
  antes: "antes", despues: "después", prompt: "prompt", salida: "respuesta de la IA", partes: "parte", revelar: "Punti al revelar",
  piezas: "pieza", descripcion: "descripción", ejemplo: "ejemplo", items: "frase", bien: "Punti si acierta", mal: "Punti si falla",
  malPorGrupo: "Punti si falla en", checks: "check", simulado: "simulado", bueno: "bueno", debil: "débil", trozos: "trozo",
  explicacion: "Punti al ser atrapado", definicion: "definición", pregunta: "pregunta", etiqueta: "etiqueta", preguntas: "pregunta",
  opciones: "opción", escena: "escena", consecuencia: "consecuencia", leccion: "lección", posturas: "postura", argumento: "argumento",
  cierre: "cierre", instruccion: "instrucción", porQue: "por qué", concepto: "concepto", logros: "logro", habilidad: "habilidad",
  grafico: "gráfico", tabla: "tabla", encabezados: "encabezados", filas: "fila", pasos: "paso", grupos: "grupo",
};

function nombrar(ruta: Ruta): string {
  return ruta
    .map((r) => (typeof r === "number" ? String(r + 1) : (NOMBRES[r] ?? r)))
    .join(" · ");
}

export function textosDe(p: PaqueteMision): CampoTexto[] {
  const campos: CampoTexto[] = [];
  const visitar = (valor: unknown, ruta: Ruta) => {
    if (esTexto(valor)) {
      const [raiz, i, ...resto] = ruta;
      const enBloque = raiz === "bloques" && typeof i === "number";
      const b = enBloque ? p.bloques[i] : null;
      const grupo = b ? b.id : raiz === "ficha" ? "ficha" : "mision";
      const etiqueta = b ? `${b.tipo} · ${nombrar(resto)}` : nombrar(raiz === "ficha" ? ruta.slice(1) : ruta);
      const largo = valor.es.length > 70 || valor.en.length > 70 || valor.es.includes("\n");
      campos.push({ ruta, grupo, etiqueta, valor, largo });
      return;
    }
    if (Array.isArray(valor)) valor.forEach((v, k) => visitar(v, [...ruta, k]));
    else if (valor && typeof valor === "object") Object.entries(valor).forEach(([k, v]) => visitar(v, [...ruta, k]));
  };
  visitar(p, []);
  return campos;
}

/** Una copia del paquete con un texto cambiado (no modifica el original). */
export function conTexto(p: PaqueteMision, ruta: Ruta, valor: Texto): PaqueteMision {
  const copia = structuredClone(p) as unknown as Record<string | number, unknown>;
  let nodo = copia as Record<string | number, unknown>;
  for (const paso of ruta.slice(0, -1)) nodo = nodo[paso] as Record<string | number, unknown>;
  nodo[ruta[ruta.length - 1]] = { es: valor.es, en: valor.en };
  return copia as unknown as PaqueteMision;
}
