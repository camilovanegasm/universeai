// Lo que usa el editor de contenido del admin: borradores, validación y
// publicación. Las reglas de Firestore solo dejan escribir esto al admin.
//
// DÓNDE VIVE CADA COSA EN FIREBASE
//   contenido/catalogo         los mundos publicados (lo que ve la gente)
//   lecciones/{id}             cada lección publicada
//   borradores/catalogo        los mundos como los está editando el admin
//   borradores/leccion-{id}    cada lección como la está editando el admin
//
// Guardar escribe solo en borradores. Publicar copia el borrador a la
// versión pública. Así una lección a medio escribir nunca le sale a nadie.
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { LECCIONES } from "./lecciones";
import { calcularXpMaximo, normalizarAjustes, validarClub, validarJuego, type Ajustes, type AjustesClub, type AjustesJuego, type Anuncio } from "./ajustes";
import {
  firma,
  catalogoDesdeCodigo,
  leccionABilingue,
  recargarCatalogo,
  recargarFaq,
  type PreguntaFaq,
  type EjercicioB,
  type LeccionB,
  type TemaC,
  type Texto,
  type TipoEjercicio,
} from "./contenido";

/* ---------------------------------------------------------- utilidades */

// `firma` vive en contenido.ts (la usan también pantallas públicas) y se
// reexporta aquí para que el editor la tenga a mano.
export { firma };

/** "Mitos y verdades" → "mitos-y-verdades". Sirve de id permanente. */
export function aId(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Un id que no choque con ninguno de los que ya existen. */
export function idLibre(base: string, usados: Set<string>): string {
  const limpio = aId(base) || "nuevo";
  if (!usados.has(limpio)) return limpio;
  let n = 2;
  while (usados.has(`${limpio}-${n}`)) n++;
  return `${limpio}-${n}`;
}

export const vacio = (): Texto => ({ es: "", en: "" });

export function ejercicioNuevo(tipo: TipoEjercicio): EjercicioB {
  switch (tipo) {
    case "opcion-multiple":
      return { tipo, pregunta: vacio(), opciones: [vacio(), vacio(), vacio()], correcta: 0, pista: vacio() };
    case "verdadero-falso":
      return { tipo, enunciado: vacio(), correcta: true, pista: vacio() };
    case "completar-frase":
      return { tipo, antes: vacio(), despues: vacio(), opciones: [vacio(), vacio(), vacio()], correcta: 0, pista: vacio() };
    case "ordenar-pasos":
      return { tipo, instruccion: vacio(), pasos: [vacio(), vacio(), vacio()], pista: vacio() };
    case "escribir-prompt":
      return { tipo, instruccion: vacio(), pista: vacio() };
  }
}

export function leccionNueva(id: string): LeccionB {
  return {
    id,
    tiempoObjetivoSegundos: 180,
    tarea: vacio(),
    explicacion: [{ texto: vacio(), estadoPunti: "online" }],
    ejercicios: [ejercicioNuevo("opcion-multiple")],
  };
}

/* ---------------------------------------------------------- validación */

const lleno = (x: Texto) => x.es.trim() !== "" && x.en.trim() !== "";

/** Qué le falta a un texto, en palabras. */
function faltaEn(x: Texto): string {
  const es = x.es.trim() === "";
  const en = x.en.trim() === "";
  return es && en ? "vacío" : es ? "falta el español" : "falta el inglés";
}

/**
 * Los problemas que impiden publicar una lección. Lista vacía = se puede.
 * Cada problema dice dónde está, para encontrarlo rápido.
 */
export function validarLeccion(l: LeccionB): string[] {
  const p: string[] = [];
  const revisar = (x: Texto, donde: string) => {
    if (!lleno(x)) p.push(`${donde}: ${faltaEn(x)}`);
  };

  if (!(l.tiempoObjetivoSegundos > 0)) p.push("Tiempo objetivo: tiene que ser mayor que 0");
  revisar(l.tarea, "Tarea para la semana");

  if (l.explicacion.length === 0) p.push("Explicación: agrega al menos una pantalla");
  l.explicacion.forEach((pant, i) => {
    const d = `Pantalla ${i + 1}`;
    revisar(pant.texto, `${d}, texto`);
    const g = pant.grafico;
    if (g?.tipo === "tabla") {
      revisar(g.encabezados.a, `${d}, encabezado 1`);
      revisar(g.encabezados.b, `${d}, encabezado 2`);
      if (g.filas.length === 0) p.push(`${d}, tabla: agrega al menos una fila`);
      g.filas.forEach((f, j) => {
        revisar(f.a, `${d}, fila ${j + 1}, columna 1`);
        revisar(f.b, `${d}, fila ${j + 1}, columna 2`);
      });
    } else if (g?.tipo === "flujo") {
      if (g.pasos.length < 2) p.push(`${d}, diagrama: necesita al menos 2 pasos`);
      g.pasos.forEach((x, j) => revisar(x, `${d}, paso ${j + 1}`));
    }
  });

  if (l.ejercicios.length === 0) p.push("Ejercicios: agrega al menos uno");
  l.ejercicios.forEach((e, i) => {
    const d = `Ejercicio ${i + 1}`;
    revisar(e.pista, `${d}, pista`);
    switch (e.tipo) {
      case "opcion-multiple":
      case "completar-frase":
        if (e.tipo === "opcion-multiple") revisar(e.pregunta, `${d}, pregunta`);
        else {
          if (!lleno(e.antes) && !lleno(e.despues)) p.push(`${d}: la frase está vacía`);
          if (e.antes.es.trim() !== "" && e.antes.en.trim() === "") p.push(`${d}, texto antes del espacio: falta el inglés`);
          if (e.antes.en.trim() !== "" && e.antes.es.trim() === "") p.push(`${d}, texto antes del espacio: falta el español`);
          if (e.despues.es.trim() !== "" && e.despues.en.trim() === "") p.push(`${d}, texto después del espacio: falta el inglés`);
          if (e.despues.en.trim() !== "" && e.despues.es.trim() === "") p.push(`${d}, texto después del espacio: falta el español`);
        }
        if (e.opciones.length < 2) p.push(`${d}: necesita al menos 2 opciones`);
        e.opciones.forEach((o, j) => revisar(o, `${d}, opción ${j + 1}`));
        if (e.correcta < 0 || e.correcta >= e.opciones.length) p.push(`${d}: marca cuál opción es la correcta`);
        break;
      case "verdadero-falso":
        revisar(e.enunciado, `${d}, enunciado`);
        break;
      case "ordenar-pasos":
        revisar(e.instruccion, `${d}, instrucción`);
        if (e.pasos.length < 2) p.push(`${d}: necesita al menos 2 pasos`);
        e.pasos.forEach((x, j) => revisar(x, `${d}, paso ${j + 1}`));
        break;
      case "escribir-prompt":
        revisar(e.instruccion, `${d}, instrucción`);
        break;
    }
  });
  return p;
}

export function validarCatalogo(temas: TemaC[]): string[] {
  const p: string[] = [];
  const ids = new Set<string>();
  if (temas.length === 0) p.push("Tiene que haber al menos un mundo");
  temas.forEach((m, i) => {
    const d = `Mundo ${i + 1}`;
    if (!lleno(m.nombre)) p.push(`${d}, nombre: ${faltaEn(m.nombre)}`);
    if (!lleno(m.titulo)) p.push(`${d}, título: ${faltaEn(m.titulo)}`);
    if (!lleno(m.descripcion)) p.push(`${d}, descripción: ${faltaEn(m.descripcion)}`);
    m.subtemas.forEach((s, j) => {
      const ds = `${d}, lección ${j + 1}`;
      if (ids.has(s.id)) p.push(`${ds}: el id "${s.id}" está repetido`);
      ids.add(s.id);
      if (!lleno(s.titulo)) p.push(`${ds}, título: ${faltaEn(s.titulo)}`);
      if (!lleno(s.descripcion)) p.push(`${ds}, descripción: ${faltaEn(s.descripcion)}`);
    });
  });
  return p;
}

/* ------------------------------------------------------- lectura */

export type PanoramaContenido = {
  /** true si el contenido ya vive en Firebase */
  importado: boolean;
  borrador: TemaC[];
  publicado: TemaC[];
  /** por id de lección: cómo está */
  lecciones: Record<string, "sin-leccion" | "borrador" | "publicada" | "cambios">;
};

export async function leerPanorama(): Promise<PanoramaContenido> {
  const [pub, bor, lecPub, borradores] = await Promise.all([
    getDoc(doc(db, "contenido", "catalogo")),
    getDoc(doc(db, "borradores", "catalogo")),
    getDocs(collection(db, "lecciones")),
    getDocs(collection(db, "borradores")),
  ]);
  const publicado = (pub.exists() ? (pub.data().temas as TemaC[]) : null) ?? catalogoDesdeCodigo();
  const borrador = (bor.exists() ? (bor.data().temas as TemaC[]) : null) ?? publicado;

  const firmasPub = new Map(lecPub.docs.map((d) => [d.id, firma(d.data().leccion)]));
  const firmasBor = new Map(
    borradores.docs
      .filter((d) => d.id.startsWith("leccion-"))
      .map((d) => [d.id.slice("leccion-".length), firma(d.data().leccion)]),
  );

  const lecciones: PanoramaContenido["lecciones"] = {};
  for (const m of borrador) {
    for (const s of m.subtemas) {
      const p = firmasPub.get(s.id);
      const b = firmasBor.get(s.id);
      lecciones[s.id] = !p && !b ? "sin-leccion" : !p ? "borrador" : b && b !== p ? "cambios" : "publicada";
    }
  }
  return { importado: pub.exists(), borrador, publicado, lecciones };
}

/** El borrador de una lección; si no hay, la publicada; si tampoco, null. */
export async function leerLeccionParaEditar(id: string): Promise<{
  leccion: LeccionB | null;
  publicada: LeccionB | null;
}> {
  const [b, p] = await Promise.all([getDoc(doc(db, "borradores", `leccion-${id}`)), getDoc(doc(db, "lecciones", id))]);
  const publicada = p.exists() ? (p.data().leccion as LeccionB) : null;
  const borrador = b.exists() ? (b.data().leccion as LeccionB) : null;
  return { leccion: borrador ?? publicada, publicada };
}

/* ------------------------------------------------------ escritura */

/**
 * Primera vez: copia a Firebase todo lo que hoy está escrito en el código,
 * como borrador y como publicado. Desde ahí, Firebase manda.
 */
export async function importarDesdeCodigo() {
  const lote = writeBatch(db);
  const temas = catalogoDesdeCodigo();
  const cuando = serverTimestamp();
  lote.set(doc(db, "contenido", "catalogo"), { temas, publicadoEn: cuando });
  lote.set(doc(db, "borradores", "catalogo"), { temas, guardadoEn: cuando });
  for (const [id, par] of Object.entries(LECCIONES)) {
    const leccion = leccionABilingue(par);
    lote.set(doc(db, "lecciones", id), { leccion, publicadoEn: cuando });
    lote.set(doc(db, "borradores", `leccion-${id}`), { leccion, guardadoEn: cuando });
  }
  await lote.commit();
  await recargarCatalogo();
}

/** Los ids de las lecciones que están en mundos del Club. */
export function idsClub(temas: TemaC[]): Set<string> {
  return new Set(temas.filter((m) => m.club === true).flatMap((m) => m.subtemas.map((s) => s.id)));
}

export async function guardarBorradorCatalogo(temas: TemaC[]) {
  await setDoc(doc(db, "borradores", "catalogo"), { temas, guardadoEn: serverTimestamp() });
}

/**
 * Publica los mundos. `tieneLeccion` no se toma del borrador sino de lo que
 * está publicado de verdad, para no anunciar una lección que no existe.
 */
export async function publicarCatalogo(temas: TemaC[]) {
  const docsPublicados = (await getDocs(collection(db, "lecciones"))).docs;
  const publicadas = new Set(docsPublicados.map((d) => d.id));
  const club = idsClub(temas);
  const final = temas.map((m) => ({
    ...m,
    subtemas: m.subtemas.map((s) => ({ ...s, tieneLeccion: publicadas.has(s.id) })),
  }));
  const lote = writeBatch(db);
  const cuando = serverTimestamp();
  lote.set(doc(db, "contenido", "catalogo"), { temas: final, publicadoEn: cuando });
  lote.set(doc(db, "borradores", "catalogo"), { temas: final, guardadoEn: cuando });
  // Si un mundo entró o salió del Club, sus lecciones publicadas cambian de
  // marca: es lo que leen las reglas de Firestore para dejar pasar o no.
  for (const d of docsPublicados) {
    const quiere = club.has(d.id);
    if ((d.data().club === true) !== quiere) lote.update(d.ref, { club: quiere });
  }
  await lote.commit();
  await recargarCatalogo();
  return final;
}

export type ResultadoPublicarTodo = {
  publicadas: string[];
  incompletas: { id: string; problemas: string[] }[];
  temas: TemaC[];
};

/**
 * Publica de una sola vez todos los borradores de lección que están listos y
 * después publica los mundos. Aplica las mismas reglas del editor
 * (validarLeccion): una lección incompleta no se publica y se reporta.
 * Solo toma lecciones que existen en los mundos, y se salta las que ya están
 * publicadas sin cambios.
 */
export async function publicarTodo(temas: TemaC[]): Promise<ResultadoPublicarTodo> {
  const enMundos = new Set(temas.flatMap((m) => m.subtemas.map((s) => s.id)));
  const [borradores, publicadas] = await Promise.all([
    getDocs(collection(db, "borradores")),
    getDocs(collection(db, "lecciones")),
  ]);
  const firmasPub = new Map(publicadas.docs.map((d) => [d.id, firma(d.data().leccion)]));

  const listas: LeccionB[] = [];
  const incompletas: ResultadoPublicarTodo["incompletas"] = [];
  for (const d of borradores.docs) {
    if (!d.id.startsWith("leccion-")) continue;
    const id = d.id.slice("leccion-".length);
    const l = d.data().leccion as LeccionB | undefined;
    if (!l || l.id !== id || !enMundos.has(id)) continue;
    if (firmasPub.get(id) === firma(l)) continue;
    const problemas = validarLeccion(l);
    if (problemas.length) incompletas.push({ id, problemas });
    else listas.push(l);
  }

  // Firestore acepta hasta 500 escrituras por lote: se parte en grupos.
  const cuando = serverTimestamp();
  const club = idsClub(temas);
  for (let i = 0; i < listas.length; i += 200) {
    const lote = writeBatch(db);
    for (const l of listas.slice(i, i + 200)) lote.set(doc(db, "lecciones", l.id), { leccion: l, publicadoEn: cuando, club: club.has(l.id) });
    await lote.commit();
  }

  // Los mundos se publican al final: así marcan como disponibles justo las
  // lecciones que ya quedaron publicadas.
  const final = await publicarCatalogo(temas);
  return { publicadas: listas.map((l) => l.id), incompletas, temas: final };
}

export async function guardarBorradorLeccion(l: LeccionB) {
  await setDoc(doc(db, "borradores", `leccion-${l.id}`), { leccion: l, guardadoEn: serverTimestamp() });
}

/**
 * Publica una lección: la copia a `lecciones/{id}` y marca en los dos
 * catálogos (publicado y borrador) que esa lección ya existe.
 */
export async function publicarLeccion(l: LeccionB) {
  const problemas = validarLeccion(l);
  if (problemas.length) throw new Error(problemas[0]);

  const [pub, bor] = await Promise.all([
    getDoc(doc(db, "contenido", "catalogo")),
    getDoc(doc(db, "borradores", "catalogo")),
  ]);
  const marcar = (temas: TemaC[]) =>
    temas.map((m) => ({
      ...m,
      subtemas: m.subtemas.map((s) => (s.id === l.id ? { ...s, tieneLeccion: true } : s)),
    }));

  const catalogoActual = ((bor.exists() ? bor.data().temas : pub.exists() ? pub.data().temas : []) ?? []) as TemaC[];
  const club = idsClub(catalogoActual).has(l.id);

  const lote = writeBatch(db);
  const cuando = serverTimestamp();
  lote.set(doc(db, "lecciones", l.id), { leccion: l, publicadoEn: cuando, club });
  lote.set(doc(db, "borradores", `leccion-${l.id}`), { leccion: l, guardadoEn: cuando });
  if (pub.exists()) lote.update(doc(db, "contenido", "catalogo"), { temas: marcar(pub.data().temas as TemaC[]) });
  if (bor.exists()) lote.update(doc(db, "borradores", "catalogo"), { temas: marcar(bor.data().temas as TemaC[]) });
  await lote.commit();
  await recargarCatalogo();
}

/* -------------------------------------------------------- ajustes */

// Los ajustes no tienen borrador: son pocos números y se guardan a
// propósito con un botón. Lo que se guarda aplica de inmediato.

export async function leerAjustesAdmin(): Promise<{ ajustes: Ajustes; faq: PreguntaFaq[] | null }> {
  const [a, f] = await Promise.all([getDoc(doc(db, "contenido", "ajustes")), getDoc(doc(db, "contenido", "faq"))]);
  const lista = f.exists() ? (f.data().preguntas as PreguntaFaq[] | undefined) : undefined;
  return {
    ajustes: normalizarAjustes(a.exists() ? a.data() : null),
    faq: Array.isArray(lista) && lista.length ? lista : null,
  };
}

export async function guardarClub(club: AjustesClub) {
  const problemas = validarClub(club);
  if (problemas.length) throw new Error(problemas[0]);
  await setDoc(doc(db, "contenido", "ajustes"), { club, actualizadoEn: serverTimestamp() }, { merge: true });
  await recargarCatalogo();
}

/** La lista de espera del Club (solo el admin la puede leer). */
export async function leerListaEspera(): Promise<{ uid: string; email: string; plan: string; moneda: string; creadoEn: Date | null }[]> {
  const snap = await getDocs(collection(db, "listaEspera"));
  return snap.docs
    .map((d) => {
      const x = d.data();
      return {
        uid: d.id,
        email: String(x.email ?? ""),
        plan: String(x.plan ?? ""),
        moneda: String(x.moneda ?? ""),
        creadoEn: typeof x.creadoEn?.toDate === "function" ? (x.creadoEn.toDate() as Date) : null,
      };
    })
    .sort((a, b) => (b.creadoEn?.getTime() ?? 0) - (a.creadoEn?.getTime() ?? 0));
}

export async function guardarJuego(juego: AjustesJuego) {
  const problemas = validarJuego(juego);
  if (problemas.length) throw new Error(problemas[0]);
  // xpMaximo se calcula aquí, no lo escribe nadie a mano: las reglas de
  // Firestore lo usan para saber cuánto XP aceptar por lección.
  const final = { ...juego, xpMaximo: calcularXpMaximo(juego) };
  await setDoc(doc(db, "contenido", "ajustes"), { juego: final, actualizadoEn: serverTimestamp() }, { merge: true });
  await recargarCatalogo();
  return final;
}

export async function guardarAnuncio(anuncio: Anuncio) {
  await setDoc(doc(db, "contenido", "ajustes"), { anuncio, actualizadoEn: serverTimestamp() }, { merge: true });
  await recargarCatalogo();
}

export function validarFaq(lista: PreguntaFaq[]): string[] {
  const p: string[] = [];
  if (lista.length === 0) p.push("Tiene que haber al menos una pregunta");
  lista.forEach((q, i) => {
    if (!lleno(q.p)) p.push(`Pregunta ${i + 1}: ${faltaEn(q.p)}`);
    if (!lleno(q.r)) p.push(`Respuesta ${i + 1}: ${faltaEn(q.r)}`);
  });
  return p;
}

export async function guardarFaq(lista: PreguntaFaq[]) {
  const problemas = validarFaq(lista);
  if (problemas.length) throw new Error(problemas[0]);
  await setDoc(doc(db, "contenido", "faq"), { preguntas: lista, actualizadoEn: serverTimestamp() });
  await recargarFaq();
}
