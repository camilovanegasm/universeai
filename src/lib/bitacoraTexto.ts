// La Bitácora completa como un archivo de texto (.txt), para que el piloto se
// la lleve: "Descargar mi Bitácora" (fase C2).
//
// Es texto plano en UTF-8, pensado para leerse en cualquier editor o en el
// celular: secciones con título (Conceptos, Mis prompts, Mis notas, Fichas),
// fechas y sangría. Nada se interpreta como HTML: es un .txt.
import type { Idioma } from "./i18n";
import type { Entrada, EntradaConcepto, EntradaFicha, EntradaNota, EntradaPrompt } from "./bitacora";

const T: Record<Idioma, Record<string, string>> = {
  es: {
    bitacora: "Bitácora de",
    exportada: "Descargada el",
    conceptos: "Conceptos",
    prompts: "Mis prompts",
    notas: "Mis notas",
    fichas: "Fichas",
    vacio: "(Todavía nada aquí.)",
    tu: "Tú",
    punti: "Punti",
    paso: "Pasó",
    sinPasar: "Sin pasar",
    piezas: "Piezas",
    xp: "XP",
    combustible: "Combustible",
    transmisiones: "Transmisiones",
    sinFecha: "sin fecha",
  },
  en: {
    bitacora: "Logbook of",
    exportada: "Downloaded on",
    conceptos: "Concepts",
    prompts: "My prompts",
    notas: "My notes",
    fichas: "Cards",
    vacio: "(Nothing here yet.)",
    tu: "You",
    punti: "Punti",
    paso: "Passed",
    sinPasar: "Not passed",
    piezas: "Pieces",
    xp: "XP",
    combustible: "Fuel",
    transmisiones: "Transmissions",
    sinFecha: "no date",
  },
};

/** "24 sep 2026" / "Sep 24, 2026": la misma fecha que se ve en la Bitácora. */
export function fechaCorta(d: Date | null | undefined, idioma: Idioma): string {
  return d ? d.toLocaleDateString(idioma === "en" ? "en-US" : "es-CO", { day: "numeric", month: "short", year: "numeric" }) : "";
}

const RAYA = "=".repeat(44);
const LINEA = "-".repeat(44);

/** Mete sangría a cada línea de un texto (los prompts y notas pueden tener varias). */
const sangrar = (texto: string, espacios = "    ") =>
  texto
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => (l.trim() ? espacios + l.trimEnd() : ""))
    .join("\n");

/** Arma todo el archivo. `hoy` se pasa para poder probarlo con una fecha fija. */
export function bitacoraComoTexto(entradas: Entrada[], idioma: Idioma, piloto: string, hoy = new Date()): string {
  const t = T[idioma];
  const f = (e: Pick<Entrada, "fecha">) => fechaCorta(e.fecha?.toDate?.(), idioma) || t.sinFecha;
  const de = <K extends Entrada["tipo"]>(tipo: K) => entradas.filter((e) => e.tipo === tipo) as Extract<Entrada, { tipo: K }>[];

  const partes: string[] = [];
  partes.push(`${t.bitacora} ${piloto}`.toUpperCase(), `punti.space · ${t.exportada} ${fechaCorta(hoy, idioma)}`, RAYA);

  const seccion = (titulo: string, items: string[]) => {
    partes.push("", `${titulo.toUpperCase()} (${items.length})`, LINEA);
    partes.push(items.length ? items.join("\n\n") : t.vacio);
  };

  seccion(
    t.conceptos,
    de("concepto").map((e: EntradaConcepto) =>
      [
        `■ ${e.titulo?.[idioma] || e.concepto}  ·  ${f(e)}`,
        e.frase ? `  ${t.tu}:\n${sangrar(e.frase)}` : "",
        e.definicion?.[idioma] ? `  ${t.punti}:\n${sangrar(e.definicion[idioma])}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  );

  seccion(
    t.prompts,
    de("prompt").map((e: EntradaPrompt) =>
      [
        `■ ${e.etiqueta?.[idioma] || "Prompt"}  ·  [${e.aprobado ? t.paso : t.sinPasar}]  ·  ${f(e)}`,
        e.piezas ? `  ${t.piezas}: ${e.piezas}` : "",
        sangrar(e.texto),
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  );

  seccion(
    t.notas,
    de("nota").map((e: EntradaNota) => `■ ${f(e)}\n${sangrar(e.texto)}`),
  );

  seccion(
    t.fichas,
    de("ficha").map((e: EntradaFicha) =>
      [
        `■ ${e.titulo?.[idioma] || e.mision}  ·  ${f(e)}`,
        `  ${t.xp}: +${e.xp}  ·  ${t.combustible}: ${e.combustible}/3  ·  ${t.transmisiones}: ${e.transmisiones}`,
      ].join("\n"),
    ),
  );

  partes.push("", RAYA, "punti.space");
  return partes.join("\n") + "\n";
}
