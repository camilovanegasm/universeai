#!/usr/bin/env node
// Escribe src/lib/misiones/semilla.ts: la lista de las misiones que vienen con
// el proyecto (la "semilla"), una línea por cada paquete .json que haya en
// contenido/misiones/<mundo>/.
//
// Uso:  npm run semilla   (y corre solo antes de cada `npm run build`)
//
// Por qué un script y no escribirlo a mano: con 240 misiones es fácil olvidar
// una o repetirla. Así, basta con guardar el .json en su carpeta.
//
// El resultado siempre sale igual para los mismos archivos (mismo orden, mismo
// texto), así Git solo muestra cambios cuando de verdad entra o sale una misión.

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const MISIONES = join(RAIZ, "contenido", "misiones");
const DESTINO = join(RAIZ, "src", "lib", "misiones", "semilla.ts");

// El orden de los mundos en el mapa. Un mundo nuevo que no esté aquí va al
// final (en orden alfabético) y se avisa, para agregarlo a esta lista.
const ORDEN_MUNDOS = [
  "origen", "lexia", "eco", "orbita", "brujula", "forja",
  "prisma", "nexo", "taller", "horizonte", "automata", "nucleo",
];

const carpetas = readdirSync(MISIONES)
  .filter((n) => statSync(join(MISIONES, n)).isDirectory())
  .sort((a, b) => {
    const ia = ORDEN_MUNDOS.indexOf(a), ib = ORDEN_MUNDOS.indexOf(b);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
  });

const paquetes = [];
for (const carpeta of carpetas) {
  if (!ORDEN_MUNDOS.includes(carpeta)) console.warn(`aviso: la carpeta "${carpeta}" no está en ORDEN_MUNDOS; va al final.`);
  const enMundo = [];
  for (const nombre of readdirSync(join(MISIONES, carpeta)).sort()) {
    if (!nombre.endsWith(".json")) continue;
    const ruta = join(MISIONES, carpeta, nombre);
    let p;
    try {
      p = JSON.parse(readFileSync(ruta, "utf8"));
    } catch (e) {
      // Un archivo a medio escribir no debe tumbar la publicación: se salta y se avisa.
      console.warn(`aviso: se salta ${relative(RAIZ, ruta)} (no es JSON válido: ${e.message})`);
      continue;
    }
    // Solo entran paquetes de misión de verdad; cualquier otro .json se ignora.
    if (!p || p.formato !== "punti-mision@1") continue;
    // El id viaja en la dirección web (/semilla/<id>): solo minúsculas, números y guiones.
    if (typeof p.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(p.id)) {
      console.warn(`aviso: se salta ${relative(RAIZ, ruta)} (id inválido)`);
      continue;
    }
    enMundo.push({ ruta, id: p.id, capitulo: Number(p.capitulo) || 0, numero: Number(p.numero) || 0, nombre });
  }
  enMundo.sort((a, b) => a.capitulo - b.capitulo || a.numero - b.numero || a.nombre.localeCompare(b.nombre));
  paquetes.push(...enMundo);
}

// Dos misiones con el mismo id se pisarían: mejor parar y que alguien lo arregle.
const vistos = new Map();
for (const p of paquetes) {
  if (vistos.has(p.id)) {
    console.error(`ERROR: el id "${p.id}" está repetido en ${relative(RAIZ, vistos.get(p.id))} y ${relative(RAIZ, p.ruta)}.`);
    process.exit(1);
  }
  vistos.set(p.id, p.ruta);
}

const nombreVar = (i) => `m${String(i + 1).padStart(3, "0")}`;
const texto = `// ARCHIVO GENERADO por scripts/generar-semilla.mjs: no se edita a mano.
// Para agregar una misión, guarda su .json en contenido/misiones/<mundo>/ y
// corre \`npm run semilla\` (también corre solo antes de cada build).
//
// Las misiones que vienen en el proyecto (la "semilla"), completas. Solo se usan
// en el servidor: la ruta del Laboratorio, la generación de páginas al publicar
// y los archivos estáticos /semilla que descarga el navegador cuando los
// necesita. "server-only" hace que la publicación falle si alguien la importa
// desde una pantalla, porque metería todas las misiones en la app del celular.
import "server-only";
import type { PaqueteMision } from "./tipos";
${paquetes.map((p, i) => `import ${nombreVar(i)} from "${relative(dirname(DESTINO), p.ruta).split("\\").join("/")}";`).join("\n")}

export const SEMILLA: PaqueteMision[] = [
${paquetes.map((_, i) => `  ${nombreVar(i)},`).join("\n")}
].map((p) => p as unknown as PaqueteMision);
`;

const anterior = existsSync(DESTINO) ? readFileSync(DESTINO, "utf8") : "";
if (anterior === texto) {
  console.log(`semilla: ${paquetes.length} misiones, sin cambios.`);
} else {
  writeFileSync(DESTINO, texto);
  console.log(`semilla: ${paquetes.length} misiones escritas en ${relative(RAIZ, DESTINO)}.`);
}
