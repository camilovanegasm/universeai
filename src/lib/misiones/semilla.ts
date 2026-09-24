// Las misiones que vienen en el proyecto (la "semilla"), sin nada de Firebase:
// las usan el lector (si no hay nada publicado), la ruta del Laboratorio, el
// botón "USAR SEMILLA" del admin y la generación de páginas al publicar el sitio.
// Capítulo 1 de Eco · La antena (misiones 1 a 5, en orden).
import type { PaqueteMision } from "./tipos";
import eco01 from "../../../contenido/misiones/eco/01-primera-senal.json";
import eco02 from "../../../contenido/misiones/eco/02-el-pedido-completo.json";
import eco03 from "../../../contenido/misiones/eco/03-la-tienda-de-dona-marta.json";
import eco04 from "../../../contenido/misiones/eco/04-en-que-forma-lo-quieres.json";
import eco05 from "../../../contenido/misiones/eco/05-conversar-no-disparar.json";

export const SEMILLA: PaqueteMision[] = [eco01, eco02, eco03, eco04, eco05].map((p) => p as unknown as PaqueteMision);
