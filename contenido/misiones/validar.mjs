#!/usr/bin/env node
// Revisor de paquetes de misión de Punti.
//
// Uso:  npm run validar:misiones                          (todos los .json de contenido/misiones)
//       node contenido/misiones/validar.mjs archivo.json
//
// Las reglas viven en src/lib/misiones/revisar.mjs: son las mismas que aplica
// el admin al importar un paquete.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { revisarPaquete } from "../../src/lib/misiones/revisar.mjs";

const RAIZ = dirname(fileURLToPath(import.meta.url));

function buscar(dir) {
  return readdirSync(dir).flatMap((n) => {
    const r = join(dir, n);
    return statSync(r).isDirectory() ? buscar(r) : n.endsWith(".json") ? [r] : [];
  });
}

const archivos = process.argv.length > 2 ? process.argv.slice(2) : buscar(RAIZ);
let malos = 0;
for (const a of archivos) {
  let res;
  try { res = revisarPaquete(JSON.parse(readFileSync(a, "utf8"))); }
  catch (e) { res = { errores: [`no es JSON válido: ${e.message}`], avisos: [], resumen: null }; }
  const { errores, avisos, resumen } = res;
  const nombre = relative(process.cwd(), a) || a;
  console.log(`\n${errores.length ? "✗" : "✓"} ${nombre}` + (resumen ? `  (${resumen.bloques} bloques · ${resumen.labs} laboratorios · ${resumen.xp} XP)` : ""));
  errores.forEach((e) => console.log(`   ERROR  ${e}`));
  avisos.forEach((e) => console.log(`   aviso  ${e}`));
  if (!errores.length && !avisos.length) console.log("   0 errores, 0 avisos");
  if (errores.length) malos++;
}
console.log(`\n${archivos.length} paquete(s), ${malos} con errores.`);
process.exit(malos ? 1 : 0);
