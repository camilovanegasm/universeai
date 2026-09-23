// El contenido de Punti (mundos, lecciones, ejercicios), leído desde Firebase.
//
// DE DÓNDE SALE EL CONTENIDO
// - Si en Firebase existe `contenido/catalogo`, Firebase manda: los mundos, su
//   orden y sus textos salen de ahí, y cada lección de `lecciones/{id}`.
// - Si no existe (antes de la primera importación desde el admin), la app usa
//   lo que está escrito en el código (`temas.ts` y `lecciones.ts`). También si
//   Firebase no responde: mejor mostrar la versión del código que nada.
//
// FORMATO BILINGÜE
// En Firebase cada texto se guarda con sus dos idiomas juntos ({ es, en }),
// porque así lo edita el admin: lado a lado. La app sigue recibiendo una
// lección por idioma, igual que antes (`aLeccion`), así que los componentes
// del quiz no cambiaron.
//
// Firebase no admite listas dentro de listas, por eso las filas de las tablas
// se guardan como { a, b } y no como pares [a, b].
import { doc, getDoc } from "firebase/firestore";
import { useSyncExternalStore } from "react";
import { db } from "./firebase";
import type { Idioma, Texto } from "./i18n";
import { AJUSTES_POR_DEFECTO, fijarAjustes, normalizarAjustes, type Ajustes } from "./ajustes";
import type { EstadoPunti } from "./puntiSprite";
import type { Rango } from "./rangos";
import { TEMAS, type Tema } from "./temas";
import { LECCIONES, type Ejercicio, type Grafico, type Leccion } from "./lecciones";

/* ------------------------------------------------------------ tipos */

export type { Texto };

export type ParTexto = { a: Texto; b: Texto };

export type GraficoB =
  | { tipo: "tabla"; encabezados: ParTexto; filas: ParTexto[] }
  | { tipo: "flujo"; pasos: Texto[] };

export type PantallaB = {
  texto: Texto;
  estadoPunti: EstadoPunti;
  grafico?: GraficoB;
};

export type EjercicioB =
  | { tipo: "opcion-multiple"; pregunta: Texto; opciones: Texto[]; correcta: number; pista: Texto }
  | { tipo: "verdadero-falso"; enunciado: Texto; correcta: boolean; pista: Texto }
  | { tipo: "completar-frase"; antes: Texto; despues: Texto; opciones: Texto[]; correcta: number; pista: Texto }
  | { tipo: "ordenar-pasos"; instruccion: Texto; pasos: Texto[]; pista: Texto }
  | { tipo: "escribir-prompt"; instruccion: Texto; pista: Texto };

export type TipoEjercicio = EjercicioB["tipo"];

export type LeccionB = {
  id: string;
  tiempoObjetivoSegundos: number;
  tarea: Texto;
  explicacion: PantallaB[];
  ejercicios: EjercicioB[];
};

export type SubtemaC = {
  id: string;
  titulo: Texto;
  descripcion: Texto;
  /** true cuando la lección está publicada. Lo escribe "Publicar lección". */
  tieneLeccion: boolean;
};

export type TemaC = {
  id: string;
  nombre: Texto;
  titulo: Texto;
  descripcion: Texto;
  rango: Rango;
  subtemas: SubtemaC[];
};

/** JSON con las claves ordenadas: Firebase devuelve los campos en otro orden. */
export function firma(valor: unknown): string {
  return JSON.stringify(valor, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]]))
      : v,
  );
}

/* ------------------------------------------------ conversiones */

const t = (es: string, en: string): Texto => ({ es, en });

function graficoABilingue(es: Grafico, en: Grafico): GraficoB {
  if (es.tipo === "tabla" && en.tipo === "tabla") {
    return {
      tipo: "tabla",
      encabezados: { a: t(es.encabezados[0], en.encabezados[0]), b: t(es.encabezados[1], en.encabezados[1]) },
      filas: es.filas.map((f, i) => ({ a: t(f[0], en.filas[i]?.[0] ?? ""), b: t(f[1], en.filas[i]?.[1] ?? "") })),
    };
  }
  const pasosEs = es.tipo === "flujo" ? es.pasos : [];
  const pasosEn = en.tipo === "flujo" ? en.pasos : [];
  return { tipo: "flujo", pasos: pasosEs.map((p, i) => t(p, pasosEn[i] ?? "")) };
}

function ejercicioABilingue(es: Ejercicio, en: Ejercicio): EjercicioB {
  const pista = t(es.pista, en.pista);
  switch (es.tipo) {
    case "opcion-multiple": {
      const e = en as typeof es;
      return { tipo: es.tipo, pregunta: t(es.pregunta, e.pregunta), opciones: es.opciones.map((o, i) => t(o, e.opciones[i] ?? "")), correcta: es.correcta, pista };
    }
    case "verdadero-falso": {
      const e = en as typeof es;
      return { tipo: es.tipo, enunciado: t(es.enunciado, e.enunciado), correcta: es.correcta, pista };
    }
    case "completar-frase": {
      const e = en as typeof es;
      return { tipo: es.tipo, antes: t(es.antes, e.antes), despues: t(es.despues, e.despues), opciones: es.opciones.map((o, i) => t(o, e.opciones[i] ?? "")), correcta: es.correcta, pista };
    }
    case "ordenar-pasos": {
      const e = en as typeof es;
      return { tipo: es.tipo, instruccion: t(es.instruccion, e.instruccion), pasos: es.pasos.map((p, i) => t(p, e.pasos[i] ?? "")), pista };
    }
    case "escribir-prompt": {
      const e = en as typeof es;
      return { tipo: es.tipo, instruccion: t(es.instruccion, e.instruccion), pista };
    }
  }
}

/** Junta las dos versiones escritas en el código en una sola bilingüe. */
export function leccionABilingue(par: Record<Idioma, Leccion>): LeccionB {
  const { es, en } = par;
  return {
    id: es.id,
    tiempoObjetivoSegundos: es.tiempoObjetivoSegundos,
    tarea: t(es.tarea, en.tarea),
    explicacion: es.explicacion.map((p, i) => {
      const q = en.explicacion[i] ?? p;
      return {
        texto: t(p.texto, q.texto),
        estadoPunti: p.estadoPunti,
        ...(p.grafico ? { grafico: graficoABilingue(p.grafico, q.grafico ?? p.grafico) } : {}),
      };
    }),
    ejercicios: es.ejercicios.map((e, i) => ejercicioABilingue(e, en.ejercicios[i] ?? e)),
  };
}

function graficoAIdioma(g: GraficoB, idioma: Idioma): Grafico {
  if (g.tipo === "tabla") {
    return {
      tipo: "tabla",
      encabezados: [g.encabezados.a[idioma], g.encabezados.b[idioma]],
      filas: g.filas.map((f) => [f.a[idioma], f.b[idioma]] as [string, string]),
    };
  }
  return { tipo: "flujo", pasos: g.pasos.map((p) => p[idioma]) };
}

function ejercicioAIdioma(e: EjercicioB, idioma: Idioma): Ejercicio {
  const pista = e.pista[idioma];
  switch (e.tipo) {
    case "opcion-multiple":
      return { tipo: e.tipo, pregunta: e.pregunta[idioma], opciones: e.opciones.map((o) => o[idioma]), correcta: e.correcta, pista };
    case "verdadero-falso":
      return { tipo: e.tipo, enunciado: e.enunciado[idioma], correcta: e.correcta, pista };
    case "completar-frase":
      return { tipo: e.tipo, antes: e.antes[idioma], despues: e.despues[idioma], opciones: e.opciones.map((o) => o[idioma]), correcta: e.correcta, pista };
    case "ordenar-pasos":
      return { tipo: e.tipo, instruccion: e.instruccion[idioma], pasos: e.pasos.map((p) => p[idioma]), pista };
    case "escribir-prompt":
      return { tipo: e.tipo, instruccion: e.instruccion[idioma], pista };
  }
}

/** La lección en un solo idioma, tal como la usa la pantalla del quiz. */
export function aLeccion(b: LeccionB, idioma: Idioma): Leccion {
  return {
    id: b.id,
    tiempoObjetivoSegundos: b.tiempoObjetivoSegundos,
    tarea: b.tarea[idioma],
    explicacion: b.explicacion.map((p) => ({
      texto: p.texto[idioma],
      estadoPunti: p.estadoPunti,
      ...(p.grafico ? { grafico: graficoAIdioma(p.grafico, idioma) } : {}),
    })),
    ejercicios: b.ejercicios.map((e) => ejercicioAIdioma(e, idioma)),
  };
}

/** El catálogo tal como está escrito en el código. */
export function catalogoDesdeCodigo(): TemaC[] {
  return TEMAS.map((tema) => ({
    id: tema.id,
    nombre: t(tema.nombre, tema.en.nombre),
    titulo: t(tema.titulo, tema.en.titulo),
    descripcion: t(tema.descripcion, tema.en.descripcion),
    rango: tema.rango,
    subtemas: tema.subtemas.map((s) => ({
      id: s.id,
      titulo: t(s.titulo, s.en.titulo),
      descripcion: t(s.descripcion, s.en.descripcion),
      tieneLeccion: Boolean(LECCIONES[s.id]),
    })),
  }));
}

/** Del formato de Firebase al que usan las pantallas (el mismo de temas.ts). */
export function aTemas(catalogo: TemaC[]): Tema[] {
  return catalogo.map((c, i) => ({
    id: c.id,
    numero: i + 1,
    nombre: c.nombre.es,
    titulo: c.titulo.es,
    descripcion: c.descripcion.es,
    rango: c.rango,
    en: { nombre: c.nombre.en, titulo: c.titulo.en, descripcion: c.descripcion.en },
    abierto: true,
    subtemas: c.subtemas.map((s, j) => ({
      id: s.id,
      numero: j + 1,
      titulo: s.titulo.es,
      descripcion: s.descripcion.es,
      en: { titulo: s.titulo.en, descripcion: s.descripcion.en },
    })),
  }));
}

/* ------------------------------------------ el catálogo en la app */

export type EstadoCatalogo = {
  temas: Tema[];
  /** ids de los subtemas que tienen lección publicada */
  conLeccion: ReadonlySet<string>;
  origen: "codigo" | "firebase";
  /** Números del juego y anuncio (ver ajustes.ts). */
  ajustes: Ajustes;
  /** false mientras se consulta Firebase por primera vez */
  listo: boolean;
};

function desdeCodigo(listo: boolean, ajustes: Ajustes = AJUSTES_POR_DEFECTO): EstadoCatalogo {
  return {
    temas: TEMAS,
    conLeccion: new Set(Object.keys(LECCIONES)),
    origen: "codigo",
    ajustes,
    listo,
  };
}

// Mientras carga (y en el servidor) se muestra la versión del código: la
// portada no espera a Firebase para pintarse.
const INICIAL = desdeCodigo(false);
let estado: EstadoCatalogo = INICIAL;
let pedido: Promise<EstadoCatalogo> | null = null;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((f) => f());
}

export function cargarCatalogo(): Promise<EstadoCatalogo> {
  if (pedido) return pedido;
  // Catálogo y ajustes se piden a la vez: un solo momento de espera.
  // Si los ajustes fallan, se juega con los de siempre; no se bloquea nada.
  pedido = Promise.all([
    getDoc(doc(db, "contenido", "catalogo")),
    getDoc(doc(db, "contenido", "ajustes"))
      .then((a) => normalizarAjustes(a.exists() ? a.data() : null))
      .catch(() => AJUSTES_POR_DEFECTO),
  ])
    .then(([snap, ajustes]) => {
      fijarAjustes(ajustes);
      const temas = snap.exists() ? (snap.data().temas as TemaC[] | undefined) : undefined;
      estado = temas
        ? {
            temas: aTemas(temas),
            conLeccion: new Set(temas.flatMap((x) => x.subtemas.filter((s) => s.tieneLeccion).map((s) => s.id))),
            origen: "firebase",
            ajustes,
            listo: true,
          }
        : desdeCodigo(true, ajustes);
      return estado;
    })
    .catch(() => {
      // Sin conexión con Firebase: se juega con lo del código y los ajustes
      // de siempre. Se permite reintentar en la próxima pantalla.
      estado = desdeCodigo(true);
      pedido = null;
      return estado;
    })
    .finally(avisar);
  return pedido;
}

/** Vuelve a pedir el catálogo (después de publicar desde el admin). */
export function recargarCatalogo() {
  pedido = null;
  return cargarCatalogo();
}

function suscribir(f: () => void) {
  oyentes.add(f);
  void cargarCatalogo();
  return () => {
    oyentes.delete(f);
  };
}

/** Los mundos y qué lecciones existen. Se actualiza solo cuando llega Firebase. */
export function useCatalogo(): EstadoCatalogo {
  return useSyncExternalStore(
    suscribir,
    () => estado,
    () => INICIAL,
  );
}

/* --------------------------------------------- una lección */

/**
 * La lección bilingüe publicada, o null si no existe (en construcción).
 * Si el contenido todavía no se importó a Firebase, sale del código.
 */
export async function cargarLeccion(id: string): Promise<LeccionB | null> {
  const catalogo = await cargarCatalogo();
  if (catalogo.origen === "codigo") {
    return LECCIONES[id] ? leccionABilingue(LECCIONES[id]) : null;
  }
  try {
    const snap = await getDoc(doc(db, "lecciones", id));
    return snap.exists() ? ((snap.data().leccion as LeccionB | undefined) ?? null) : null;
  } catch {
    // Sin conexión: si está en el código, al menos esa versión.
    return LECCIONES[id] ? leccionABilingue(LECCIONES[id]) : null;
  }
}

/* ------------------------------------------ preguntas frecuentes */

/** Una pregunta de la portada: p = pregunta, r = respuesta. */
export type PreguntaFaq = { p: Texto; r: Texto };

function esTexto(x: unknown): x is Texto {
  const t = x as Texto | undefined;
  return typeof t?.es === "string" && typeof t?.en === "string";
}

// Solo la portada las usa, así que se piden al montarla y no antes.
// null = todavía no llegan, o no hay en Firebase (se usan las del código).
let faq: PreguntaFaq[] | null = null;
let pedidoFaq: Promise<void> | null = null;
const oyentesFaq = new Set<() => void>();

function pedirFaq() {
  if (pedidoFaq) return pedidoFaq;
  pedidoFaq = getDoc(doc(db, "contenido", "faq"))
    .then((snap) => {
      const lista = snap.exists() ? (snap.data().preguntas as unknown) : null;
      const validas = Array.isArray(lista) ? lista.filter((q) => esTexto(q?.p) && esTexto(q?.r)) : [];
      faq = validas.length ? (validas as PreguntaFaq[]) : null;
    })
    .catch(() => {
      pedidoFaq = null;
    })
    .finally(() => oyentesFaq.forEach((f) => f()));
  return pedidoFaq;
}

export function recargarFaq() {
  pedidoFaq = null;
  return pedirFaq();
}

/** Las preguntas de Firebase, o null para usar las escritas en el código. */
export function useFaq(): PreguntaFaq[] | null {
  return useSyncExternalStore(
    (f) => {
      oyentesFaq.add(f);
      void pedirFaq();
      return () => {
        oyentesFaq.delete(f);
      };
    },
    () => faq,
    () => null,
  );
}
