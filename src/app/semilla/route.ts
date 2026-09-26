// GET /semilla — el índice de las misiones de la semilla (id, mundo, capítulo,
// número, título, resumen y minutos de cada una), sin el contenido completo.
//
// Se arma UNA vez al publicar el sitio y queda como archivo fijo en la red de
// Vercel: el celular lo baja rápido y no despierta ningún servidor. Antes
// todas las misiones viajaban dentro de la app aunque nadie las abriera.
import { SEMILLA } from "@/lib/misiones/semilla";
import { resumirMision } from "@/lib/misiones/resumen";

export const dynamic = "force-static";

export function GET() {
  return Response.json(SEMILLA.map(resumirMision));
}
