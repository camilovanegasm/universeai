// Las reglas que un paquete de misión (formato punti-mision@1) tiene que
// cumplir para entrar a Punti. Un solo archivo para tres usos:
//   - la app y el admin (se importa desde TypeScript; los tipos están en revisar.d.mts),
//   - el comando `npm run validar:misiones` (contenido/misiones/validar.mjs).
// Está en JavaScript sin dependencias a propósito: así Node lo corre directo.
//
// ERRORES: el paquete no se puede importar. AVISOS: se puede, pero algo va
// contra la voz de Punti o el formato; se revisa antes de publicar.

const ESTADOS = ["boot", "online", "leyendo", "loading", "levelup", "hype", "battery", "error", "info"];
const RECETAS = ["concepto", "habilidad", "criterio", "construccion", "mercado", "futuro"];
const LARGOS = ["rapida", "normal", "proyecto"];
const ESTADOS_PAQUETE = ["borrador", "revision", "aprobado"];
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID_BLOQUE = /^b\d{2}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HTML = /<\/?[a-z!][^>]*>/i;

// Campos propios de cada tipo de bloque: [obligatorios, opcionales]
const COMUNES = ["id", "tipo", "xp", "punti", "titulo", "vivo"];
const TIPOS = {
  "inicio":            [["texto"], []],
  "transmision":       [["texto"], ["grafico"]],
  "antes-despues":     [["antes", "despues", "revelar"], []],
  "piezas":            [["piezas"], []],
  "clasificar":        [["grupos", "items", "bien", "mal"], ["malPorGrupo"]],
  "laboratorio":       [["reto", "inicial", "aprobar", "maxIntentos", "checks", "sistema", "simulado"], []],
  "punti-se-equivoco": [["trozos", "malos", "explicacion", "mal"], []],
  "nota-bitacora":     [["concepto", "definicion", "pregunta", "bien"], ["guardaPrompt", "etiqueta"]],
  "punto-control":     [["preguntas"], []],
  "caso":              [["escena", "opciones", "leccion"], []],
  "debate":            [["pregunta", "posturas", "cierre"], []],
  "reto-ia":           [["instruccion", "checks"], ["pegar"]],
  "fuente":            [["url", "fecha", "porQue"], []],
  "pantalla-viva":     [["texto", "revisado"], ["tabla"]],
};

export function revisarPaquete(p) {
  const errores = [], avisos = [];
  const E = (d, m) => errores.push(`${d}: ${m}`);
  const A = (d, m) => avisos.push(`${d}: ${m}`);
  if (!p || typeof p !== "object" || Array.isArray(p)) return { errores: ["el paquete debe ser un objeto JSON"], avisos, resumen: null };

  const palabras = (s) => s.trim().split(/\s+/).filter(Boolean).length;

  // Un texto bilingüe: exactamente { es, en }, ambos con contenido.
  // voz: false en lo que "escribe la IA" dentro del ejercicio (salidas de ejemplo):
  // esos textos imitan a una IA, a veces a propósito mal, y no siguen la voz de Punti.
  function texto(v, donde, { max = 0, maxPalabras = 0, voz = true } = {}) {
    if (!v || typeof v !== "object" || Array.isArray(v)) { E(donde, "falta el texto { es, en }"); return false; }
    for (const k of Object.keys(v)) if (k !== "es" && k !== "en") E(donde, `clave de más "${k}" (solo van es y en)`);
    for (const l of ["es", "en"]) {
      const s = v[l];
      if (typeof s !== "string" || !s.trim()) { E(donde, `falta el ${l === "es" ? "español" : "inglés"}`); continue; }
      if (HTML.test(s)) E(donde, `[${l}] tiene HTML; solo va texto plano`);
      if (voz && s.includes("—")) A(donde, `[${l}] usa guion largo (—); la voz de Punti usa coma, punto o dos puntos`);
      if (voz && (s.match(/!/g) || []).length > 1 && l === "es" && !s.includes("\n")) A(donde, `[es] más de un signo de exclamación`);
      if (max && s.length > max) A(donde, `[${l}] muy largo (${s.length} caracteres, máximo ${max})`);
      if (maxPalabras && palabras(s) > maxPalabras) A(donde, `[${l}] ${palabras(s)} palabras (máximo ~${maxPalabras})`);
    }
    return true;
  }
  function punti(v, donde, maxPalabras = 45) {
    if (!v || typeof v !== "object") { E(donde, "falta lo que dice Punti { estado, texto }"); return; }
    if (!ESTADOS.includes(v.estado)) E(donde, `estado de Punti "${v.estado}" no existe (${ESTADOS.join(", ")})`);
    texto(v.texto, donde + ".texto", { maxPalabras });
  }
  const lista = (v, donde, min = 1, max = 99) => {
    if (!Array.isArray(v)) { E(donde, "debe ser una lista"); return []; }
    if (v.length < min || v.length > max) E(donde, `debe tener entre ${min} y ${max} elementos (tiene ${v.length})`);
    return v;
  };

  // --- cabecera
  if (p.formato !== "punti-mision@1") E("formato", `debe ser "punti-mision@1"`);
  if (!ID.test(p.id || "")) E("id", "minúsculas, números y guiones");
  if (!ID.test(p.mundo || "")) E("mundo", "falta el id del mundo");
  for (const k of ["capitulo", "numero", "minutos"]) if (!Number.isInteger(p[k]) || p[k] < 1) E(k, "número entero mayor que 0");
  if (!RECETAS.includes(p.receta)) E("receta", RECETAS.join(", "));
  if (!LARGOS.includes(p.largo)) E("largo", LARGOS.join(", "));
  if (!ESTADOS_PAQUETE.includes(p.estado)) E("estado", ESTADOS_PAQUETE.join(", "));
  if (!FECHA.test(p.actualizado || "")) E("actualizado", "fecha AAAA-MM-DD");
  lista(p.conceptos, "conceptos").forEach((c, i) => { if (!ID.test(c)) E(`conceptos[${i}]`, "id no válido"); });
  if (p.usaConceptos) lista(p.usaConceptos, "usaConceptos", 0);
  texto(p.titulo, "titulo", { max: 48 });
  texto(p.resumen, "resumen", { max: 140 });
  if (p.siguiente && !ID.test(p.siguiente)) E("siguiente", "id no válido");
  lista(p.fuentes ?? [], "fuentes", 0).forEach((f, i) => {
    if (!f?.titulo || !/^https:\/\//.test(f?.url || "") || !FECHA.test(f?.fecha || "")) E(`fuentes[${i}]`, "necesita titulo, url https y fecha");
  });

  // --- bloques
  const bloques = lista(p.bloques, "bloques", 3, 16);
  const porId = new Map();
  const piezasDe = new Map();
  let labs = 0, notas = 0, xp = 0, previo = null, hayVivo = false;

  bloques.forEach((b, i) => {
    const d = `bloques[${i}]${b?.id ? " " + b.id : ""}`;
    if (!b || typeof b !== "object") { E(d, "no es un bloque"); return; }
    if (!ID_BLOQUE.test(b.id || "")) E(d, `id "${b.id}" debe ser b01, b02…`);
    else if (porId.has(b.id)) E(d, "id repetido");
    else porId.set(b.id, b);
    const def = TIPOS[b.tipo];
    if (!def) { E(d, `tipo "${b.tipo}" no existe`); return; }
    const [oblig, opc] = def;
    for (const k of oblig) if (b[k] === undefined) E(d, `falta "${k}"`);
    for (const k of Object.keys(b)) if (!COMUNES.includes(k) && !oblig.includes(k) && !opc.includes(k)) A(d, `campo "${k}" no es de un bloque ${b.tipo} (¿error de tipeo?)`);
    if (!Number.isInteger(b.xp) || b.xp < 0 || b.xp > 30) E(d, "xp entero entre 0 y 30");
    xp += b.xp || 0;
    punti(b.punti, d + ".punti");
    if (b.titulo !== undefined) texto(b.titulo, d + ".titulo", { max: 48 });
    if (b.vivo) hayVivo = true;
    if (i === 0 && b.tipo !== "inicio") A(d, "la misión debería abrir con un bloque inicio");
    if (previo === "transmision" && b.tipo === "transmision") A(d, "dos transmisiones seguidas: pon algo para hacer en medio");
    previo = b.tipo;

    switch (b.tipo) {
      case "inicio": texto(b.texto, d + ".texto", { maxPalabras: 40 }); break;
      case "transmision": texto(b.texto, d + ".texto", { maxPalabras: 60 }); break;
      case "antes-despues":
        texto(b.antes?.prompt, d + ".antes.prompt", { voz: false }); texto(b.antes?.salida, d + ".antes.salida", { voz: false });
        lista(b.despues?.partes, d + ".despues.partes", 2, 6).forEach((x, j) => {
          if (!ID.test(x?.pieza || "")) E(`${d}.despues.partes[${j}]`, "falta la pieza");
          texto(x?.texto, `${d}.despues.partes[${j}].texto`);
        });
        texto(b.despues?.salida, d + ".despues.salida", { voz: false });
        if (!["texto", "cartel"].includes(b.despues?.salidaTipo)) E(d + ".despues.salidaTipo", "texto o cartel");
        punti(b.revelar, d + ".revelar");
        break;
      case "piezas": {
        const ids = new Set();
        lista(b.piezas, d + ".piezas", 2, 6).forEach((x, j) => {
          const dd = `${d}.piezas[${j}]`;
          if (!ID.test(x?.id || "")) E(dd, "id no válido"); else if (ids.has(x.id)) E(dd, "id repetido"); else ids.add(x.id);
          if (!HEX.test(x?.color || "")) E(dd, "color #rrggbb");
          texto(x?.titulo, dd + ".titulo", { max: 28 }); texto(x?.descripcion, dd + ".descripcion", { max: 70 });
          texto(x?.ejemplo, dd + ".ejemplo", { maxPalabras: 30 });
        });
        piezasDe.set(b.id, ids);
        break;
      }
      case "clasificar": {
        const grupos = lista(b.grupos, d + ".grupos", 2, 6);
        lista(b.items, d + ".items", 3, 8).forEach((x, j) => {
          texto(x?.texto, `${d}.items[${j}].texto`, { max: 110 });
          const g = typeof x?.grupo === "string" ? x.grupo : null;
          if (!g || !grupos.some((gr) => (typeof gr === "string" ? gr : gr?.id) === g)) E(`${d}.items[${j}]`, `grupo "${x?.grupo}" no está en grupos`);
        });
        grupos.forEach((gr, j) => {
          if (typeof gr === "string") {
            const existe = [...piezasDe.values()].some((s) => s.has(gr));
            if (!existe) E(`${d}.grupos[${j}]`, `"${gr}" no es una pieza de un bloque anterior; usa { id, titulo }`);
          } else { if (!ID.test(gr?.id || "")) E(`${d}.grupos[${j}]`, "id no válido"); texto(gr?.titulo, `${d}.grupos[${j}].titulo`); }
        });
        punti(b.bien, d + ".bien", 30); punti(b.mal, d + ".mal", 30);
        for (const [k, v] of Object.entries(b.malPorGrupo || {})) punti(v, `${d}.malPorGrupo.${k}`, 30);
        break;
      }
      case "laboratorio": {
        labs++;
        texto(b.reto, d + ".reto", { maxPalabras: 60 });
        if (!["vacio", "anterior"].includes(b.inicial)) E(d + ".inicial", "vacio o anterior");
        if (b.inicial === "anterior" && labs < 2) E(d + ".inicial", "\"anterior\" necesita un laboratorio antes");
        const checks = lista(b.checks, d + ".checks", 1, 6);
        const ids = new Set();
        checks.forEach((c, j) => {
          const dd = `${d}.checks[${j}]`;
          if (!ID.test(c?.id || "")) E(dd, "id no válido"); else if (ids.has(c.id)) E(dd, "id repetido"); else ids.add(c.id);
          texto(c?.texto, dd + ".texto", { max: 48 });
          if (typeof c?.rubrica !== "string" || c.rubrica.length < 15) E(dd, "falta la rúbrica para la IA que revisa");
          for (const l of ["es", "en"]) {
            const k = c?.claves?.[l];
            if (!Array.isArray(k) || !k.length) E(dd, `faltan claves en ${l} para el modo simulado`);
            else k.forEach((w) => { if (typeof w !== "string" || w !== w.toLowerCase() || /[áéíóúñü]/.test(w)) E(dd, `clave "${w}" debe ir en minúsculas y sin tildes`); });
          }
        });
        if (!Number.isInteger(b.aprobar) || b.aprobar < 1 || b.aprobar > checks.length) E(d + ".aprobar", `entre 1 y ${checks.length}`);
        if (!Number.isInteger(b.maxIntentos) || b.maxIntentos < 1 || b.maxIntentos > 5) E(d + ".maxIntentos", "entre 1 y 5");
        texto(b.sistema, d + ".sistema");
        for (const k of ["bueno", "debil"]) {
          const s = b.simulado?.[k];
          texto(s?.salida, `${d}.simulado.${k}.salida`, { voz: false }); punti(s?.punti, `${d}.simulado.${k}.punti`);
        }
        if (!["texto", "cartel"].includes(b.simulado?.bueno?.salidaTipo)) E(d + ".simulado.bueno.salidaTipo", "texto o cartel");
        break;
      }
      case "punti-se-equivoco": {
        const t = lista(b.trozos, d + ".trozos", 2, 8);
        t.forEach((x, j) => texto(x, `${d}.trozos[${j}]`));
        const m = lista(b.malos, d + ".malos", 1, 3);
        m.forEach((k) => { if (!Number.isInteger(k) || k < 0 || k >= t.length) E(d + ".malos", `índice ${k} fuera de los trozos`); });
        if (new Set(m).size !== m.length) E(d + ".malos", "índices repetidos");
        punti(b.explicacion, d + ".explicacion", 45); punti(b.mal, d + ".mal", 30);
        break;
      }
      case "nota-bitacora":
        notas++;
        if (!ID.test(b.concepto || "")) E(d + ".concepto", "id no válido");
        else if (!p.conceptos?.includes(b.concepto)) E(d + ".concepto", `"${b.concepto}" no está en los conceptos de la misión`);
        texto(b.definicion, d + ".definicion", { maxPalabras: 40 }); texto(b.pregunta, d + ".pregunta", { max: 60 });
        punti(b.bien, d + ".bien");
        if (b.guardaPrompt) {
          const lab = porId.get(b.guardaPrompt);
          if (!lab || lab.tipo !== "laboratorio") E(d + ".guardaPrompt", `"${b.guardaPrompt}" no es un laboratorio anterior`);
          texto(b.etiqueta, d + ".etiqueta", { max: 24 });
        }
        break;
      case "punto-control":
        lista(b.preguntas, d + ".preguntas", 1, 3).forEach((q, j) => {
          const dd = `${d}.preguntas[${j}]`;
          texto(q?.pregunta, dd + ".pregunta", { max: 160 });
          const ops = lista(q?.opciones, dd + ".opciones", 2, 4);
          ops.forEach((o, k) => texto(o, `${dd}.opciones[${k}]`, { max: 90 }));
          if (!Number.isInteger(q?.correcta) || q.correcta < 0 || q.correcta >= ops.length) E(dd + ".correcta", "índice de una opción");
          punti(q?.bien, dd + ".bien", 30); punti(q?.mal, dd + ".mal", 30);
        });
        break;
      case "caso":
        texto(b.escena, d + ".escena", { maxPalabras: 70 });
        { const ops = lista(b.opciones, d + ".opciones", 2, 4);
          ops.forEach((o, k) => { texto(o?.texto, `${d}.opciones[${k}].texto`, { max: 90 }); texto(o?.consecuencia, `${d}.opciones[${k}].consecuencia`, { maxPalabras: 40 }); });
          if (!ops.some((o) => o?.buena === true)) E(d + ".opciones", "al menos una opción buena"); }
        punti(b.leccion, d + ".leccion");
        break;
      case "debate":
        texto(b.pregunta, d + ".pregunta", { max: 120 });
        lista(b.posturas, d + ".posturas", 2, 2).forEach((x, k) => {
          texto(x?.titulo, `${d}.posturas[${k}].titulo`, { max: 40 }); texto(x?.argumento, `${d}.posturas[${k}].argumento`, { maxPalabras: 50 });
          if (!/^https:\/\//.test(x?.fuente || "")) E(`${d}.posturas[${k}].fuente`, "cada postura necesita una fuente https");
        });
        punti(b.cierre, d + ".cierre");
        break;
      case "reto-ia":
        texto(b.instruccion, d + ".instruccion", { maxPalabras: 60 });
        lista(b.checks, d + ".checks", 1, 6).forEach((c, k) => texto(c, `${d}.checks[${k}]`, { max: 80 }));
        break;
      case "fuente":
        if (!/^https:\/\//.test(b.url || "")) E(d + ".url", "solo enlaces https");
        if (!FECHA.test(b.fecha || "")) E(d + ".fecha", "AAAA-MM-DD");
        texto(b.porQue, d + ".porQue", { maxPalabras: 40 });
        break;
      case "pantalla-viva":
        texto(b.texto, d + ".texto", { maxPalabras: 60 });
        if (!FECHA.test(b.revisado || "")) E(d + ".revisado", "AAAA-MM-DD");
        if (!b.vivo) E(d, "una pantalla viva lleva vivo: true");
        break;
    }
  });

  if (notas !== 1) A("bloques", `debería haber exactamente una nota a la bitácora (hay ${notas})`);
  if (hayVivo && !(p.fuentes || []).length) E("fuentes", "hay bloques vivos: la misión necesita fuentes");
  if (xp < 20 || xp > 120) A("bloques", `la misión da ${xp} XP en total; lo esperado es entre 20 y 120`);

  // --- ficha
  const f = p.ficha;
  if (!f) E("ficha", "falta la ficha de misión");
  else {
    texto(f.concepto?.titulo, "ficha.concepto.titulo", { max: 40 }); texto(f.concepto?.resumen, "ficha.concepto.resumen", { maxPalabras: 30 });
    if (f.piezas && porId.get(f.piezas)?.tipo !== "piezas") E("ficha.piezas", `"${f.piezas}" no es un bloque piezas`);
    lista(f.mejorPrompt ?? [], "ficha.mejorPrompt", 0).forEach((id) => { if (porId.get(id)?.tipo !== "laboratorio") E("ficha.mejorPrompt", `"${id}" no es un laboratorio`); });
    lista(f.logros, "ficha.logros", 2, 8).forEach((l, j) => {
      if (!porId.has(l?.bloque)) E(`ficha.logros[${j}]`, `bloque "${l?.bloque}" no existe`);
      texto(l?.texto, `ficha.logros[${j}].texto`, { max: 70 });
    });
    if (!ID.test(f.habilidad?.id || "")) E("ficha.habilidad.id", "id no válido");
    texto(f.habilidad?.titulo, "ficha.habilidad.titulo", { max: 40 });
  }

  return { errores, avisos, resumen: { bloques: bloques.length, xp, labs } };
}
