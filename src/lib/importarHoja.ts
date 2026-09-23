// Convierte filas copiadas de la hoja "Punti-Contenido" (Google Sheets) en
// lecciones listas para guardar como borrador.
//
// Cómo llega el texto: al copiar celdas en Google Sheets y pegarlas, llegan
// separadas por tabulaciones (TSV). Si una celda tiene saltos de línea o
// comillas, Sheets la encierra entre comillas dobles. Este archivo entiende
// ese formato y el formato de columnas de la hoja (pestaña Instrucciones).
//
// No toca Firebase ni la pantalla: recibe texto y devuelve datos. Así se puede
// probar solo.
import type { EjercicioB, GraficoB, LeccionB, PantallaB, Texto } from "./contenido";
import type { EstadoPunti } from "./puntiSprite";
import { validarLeccion } from "./contenidoAdmin";

export const COLUMNAS_HOJA = [
  "ID lección", "Bloque", "#", "Tipo / Punti", "Texto ES", "Texto EN", "Texto 2 ES", "Texto 2 EN",
  "Opción 1 ES", "Opción 1 EN", "Opción 2 ES", "Opción 2 EN", "Opción 3 ES", "Opción 3 EN",
  "Opción 4 ES", "Opción 4 EN", "Opción 5 ES", "Opción 5 EN", "Opción 6 ES", "Opción 6 EN",
  "Correcta", "Pista ES", "Pista EN", "Tiempo (s)", "Estado", "Notas",
] as const;

type Columna = (typeof COLUMNAS_HOJA)[number];
type Fila = Record<Columna, string> & { _linea: number };

const ESTADOS_PUNTI: EstadoPunti[] = ["online", "boot", "leyendo", "loading", "info", "hype", "levelup", "error", "battery"];
type TipoEjercicio = EjercicioB["tipo"];

/** Tope de lo que se acepta pegar: una hoja entera cabe de sobra. */
export const MAXIMO_CARACTERES = 800_000;

/* ---------------------------------------------------------------- lectura */

/** Parte texto separado por tabulaciones respetando celdas entre comillas. */
export function partirTSV(texto: string): string[][] {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = "";
  let enComillas = false;
  const t = texto.replace(/\r\n?/g, "\n");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (enComillas) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          celda += '"';
          i++;
        } else enComillas = false;
      } else celda += c;
    } else if (c === '"' && celda === "") {
      enComillas = true;
    } else if (c === "\t") {
      fila.push(celda);
      celda = "";
    } else if (c === "\n") {
      fila.push(celda);
      filas.push(fila);
      fila = [];
      celda = "";
    } else celda += c;
  }
  if (celda !== "" || fila.length) {
    fila.push(celda);
    filas.push(fila);
  }
  return filas.filter((f) => f.some((x) => x.trim() !== ""));
}

function aFilas(tabla: string[][]): { filas: Fila[]; avisos: string[] } {
  const avisos: string[] = [];
  let orden: number[] = COLUMNAS_HOJA.map((_, i) => i);
  let inicio = 0;
  // Si pegaron el encabezado, se usa para ubicar cada columna por su nombre.
  const encabezado = tabla[0]?.map((x) => x.trim());
  if (encabezado && encabezado.includes("ID lección") && encabezado.includes("Bloque")) {
    orden = COLUMNAS_HOJA.map((nombre) => encabezado.indexOf(nombre));
    const faltan = COLUMNAS_HOJA.filter((_, i) => orden[i] === -1);
    if (faltan.length) avisos.push(`Faltan columnas en el encabezado: ${faltan.join(", ")}.`);
    inicio = 1;
  }
  const filas: Fila[] = [];
  for (let r = inicio; r < tabla.length; r++) {
    const f = { _linea: r + 1 } as Fila;
    COLUMNAS_HOJA.forEach((nombre, i) => {
      f[nombre] = orden[i] >= 0 ? (tabla[r][orden[i]] ?? "").trim() : "";
    });
    if (f["ID lección"] || f["Bloque"]) filas.push(f);
  }
  return { filas, avisos };
}

/* --------------------------------------------------------------- armado */

const t = (es: string, en: string): Texto => ({ es, en });

function opciones(f: Fila): Texto[] {
  const lista: Texto[] = [];
  for (let n = 1; n <= 6; n++) {
    const es = f[`Opción ${n} ES` as Columna];
    const en = f[`Opción ${n} EN` as Columna];
    if (es || en) lista.push(t(es, en));
  }
  return lista;
}

/** "2" → 1 (la hoja cuenta desde 1; la app desde 0). */
function indiceCorrecta(valor: string): number {
  const n = Number(valor);
  return Number.isInteger(n) ? n - 1 : -1;
}

/** Sheets puede convertir "verdadero" en VERDADERO o TRUE. */
function booleano(valor: string): boolean | null {
  const v = valor.trim().toLowerCase();
  if (["verdadero", "true", "v", "sí", "si"].includes(v)) return true;
  if (["falso", "false", "f", "no"].includes(v)) return false;
  return null;
}

export type LeccionLeida = {
  id: string;
  titulo: Texto;
  descripcion: Texto;
  leccion: LeccionB;
  /** Problemas de formato de la hoja (filas raras, valores desconocidos). */
  avisos: string[];
  /** Lo que impide publicar (las mismas reglas del editor). */
  faltas: string[];
};

export type ResultadoLectura = {
  lecciones: LeccionLeida[];
  avisosGenerales: string[];
};

export function leerHoja(texto: string): ResultadoLectura {
  if (texto.length > MAXIMO_CARACTERES) {
    return { lecciones: [], avisosGenerales: ["El texto pegado es demasiado largo. Pega una pestaña o unas lecciones a la vez."] };
  }
  const { filas, avisos: avisosGenerales } = aFilas(partirTSV(texto));
  if (filas.length === 0) {
    return { lecciones: [], avisosGenerales: [...avisosGenerales, "No se encontró ninguna fila. Copia las filas desde la hoja (con o sin el encabezado) y pégalas aquí."] };
  }

  // Agrupar por lección, respetando el orden en que aparecen.
  const grupos = new Map<string, Fila[]>();
  for (const f of filas) {
    const id = f["ID lección"];
    if (!id) {
      avisosGenerales.push(`Fila ${f._linea}: no tiene ID de lección; se ignoró.`);
      continue;
    }
    if (!/^[a-z0-9-]{1,60}$/.test(id)) {
      avisosGenerales.push(`Fila ${f._linea}: el ID "${id}" no es válido (solo minúsculas, números y guiones).`);
      continue;
    }
    if (!grupos.has(id)) grupos.set(id, []);
    grupos.get(id)!.push(f);
  }

  const lecciones: LeccionLeida[] = [];
  for (const [id, grupo] of grupos) {
    const avisos: string[] = [];
    let titulo = t("", "");
    let descripcion = t("", "");
    let tiempo = 180;
    let tarea = t("", "");
    const explicacion: PantallaB[] = [];
    const porNumero = new Map<string, PantallaB>();
    const ejercicios: EjercicioB[] = [];
    let ultimaTabla: Extract<GraficoB, { tipo: "tabla" }> | null = null;

    for (const f of grupo) {
      const bloque = f["Bloque"].toUpperCase();
      const donde = `Fila ${f._linea}`;
      switch (bloque) {
        case "LECCION": {
          titulo = t(f["Texto ES"], f["Texto EN"]);
          descripcion = t(f["Texto 2 ES"], f["Texto 2 EN"]);
          const s = Number(f["Tiempo (s)"]);
          if (f["Tiempo (s)"] && (!Number.isFinite(s) || s <= 0)) avisos.push(`${donde}: tiempo "${f["Tiempo (s)"]}" no es un número; se usó 180.`);
          else if (s > 0) tiempo = Math.round(s);
          break;
        }
        case "PLAN":
          break; // guía para escribir; no va a la app
        case "PANTALLA": {
          const estado = (f["Tipo / Punti"] || "online") as EstadoPunti;
          if (!ESTADOS_PUNTI.includes(estado)) avisos.push(`${donde}: estado de Punti "${f["Tipo / Punti"]}" no existe; se usó "online".`);
          const p: PantallaB = { texto: t(f["Texto ES"], f["Texto EN"]), estadoPunti: ESTADOS_PUNTI.includes(estado) ? estado : "online" };
          explicacion.push(p);
          porNumero.set(f["#"] || String(explicacion.length), p);
          ultimaTabla = null;
          break;
        }
        case "GRAFICO_TABLA":
        case "GRAFICO_FLUJO": {
          const p = porNumero.get(f["#"]) ?? explicacion[explicacion.length - 1];
          if (!p) {
            avisos.push(`${donde}: gráfico sin pantalla antes; se ignoró.`);
            break;
          }
          const ops = opciones(f);
          if (bloque === "GRAFICO_FLUJO") {
            p.grafico = { tipo: "flujo", pasos: ops };
            ultimaTabla = null;
          } else {
            ultimaTabla = { tipo: "tabla", encabezados: { a: ops[0] ?? t("", ""), b: ops[1] ?? t("", "") }, filas: [] };
            p.grafico = ultimaTabla;
          }
          break;
        }
        case "FILA": {
          if (!ultimaTabla) {
            avisos.push(`${donde}: FILA sin GRAFICO_TABLA antes; se ignoró.`);
            break;
          }
          const ops = opciones(f);
          ultimaTabla.filas.push({ a: ops[0] ?? t("", ""), b: ops[1] ?? t("", "") });
          break;
        }
        case "EJERCICIO": {
          const tipo = f["Tipo / Punti"] as TipoEjercicio;
          const pista = t(f["Pista ES"], f["Pista EN"]);
          const texto = t(f["Texto ES"], f["Texto EN"]);
          if (tipo === "opcion-multiple") {
            ejercicios.push({ tipo, pregunta: texto, opciones: opciones(f), correcta: indiceCorrecta(f["Correcta"]), pista });
          } else if (tipo === "verdadero-falso") {
            const b = booleano(f["Correcta"]);
            if (b === null) avisos.push(`${donde}: "Correcta" debe ser verdadero o falso; se usó verdadero.`);
            ejercicios.push({ tipo, enunciado: texto, correcta: b ?? true, pista });
          } else if (tipo === "completar-frase") {
            ejercicios.push({ tipo, antes: texto, despues: t(f["Texto 2 ES"], f["Texto 2 EN"]), opciones: opciones(f), correcta: indiceCorrecta(f["Correcta"]), pista });
          } else if (tipo === "ordenar-pasos") {
            ejercicios.push({ tipo, instruccion: texto, pasos: opciones(f), pista });
          } else if (tipo === "escribir-prompt") {
            ejercicios.push({ tipo, instruccion: texto, pista });
          } else {
            avisos.push(`${donde}: tipo de ejercicio "${f["Tipo / Punti"]}" no existe; se ignoró.`);
          }
          break;
        }
        case "TAREA":
          tarea = t(f["Texto ES"], f["Texto EN"]);
          break;
        default:
          avisos.push(`${donde}: bloque "${f["Bloque"]}" desconocido; se ignoró.`);
      }
    }

    const leccion: LeccionB = { id, tiempoObjetivoSegundos: tiempo, tarea, explicacion, ejercicios };
    lecciones.push({ id, titulo, descripcion, leccion, avisos, faltas: validarLeccion(leccion) });
  }
  return { lecciones, avisosGenerales };
}
