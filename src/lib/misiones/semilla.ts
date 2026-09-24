// Las misiones que vienen en el proyecto (la "semilla"), sin nada de Firebase:
// las usan el lector (si no hay nada publicado), la ruta del Laboratorio y la
// generación de páginas al publicar el sitio.
import type { PaqueteMision } from "./tipos";
import eco03 from "../../../contenido/misiones/eco/03-la-tienda-de-dona-marta.json";

export const SEMILLA: PaqueteMision[] = [eco03 as unknown as PaqueteMision];
