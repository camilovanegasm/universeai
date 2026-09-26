// GET /semilla/<id> — el paquete completo de UNA misión de la semilla.
//
// Igual que el índice (/semilla), se genera un archivo fijo por misión al
// publicar el sitio. El navegador baja solo la misión que va a jugar, en vez
// de cargar todas dentro de la app.
import { SEMILLA } from "@/lib/misiones/semilla";

export const dynamic = "force-static";
// Solo existen las misiones de la semilla: cualquier otra dirección da 404
// sin que se ejecute nada en el servidor.
export const dynamicParams = false;

export function generateStaticParams() {
  return SEMILLA.map((m) => ({ id: m.id }));
}

export async function GET(_pedido: Request, ctx: RouteContext<"/semilla/[id]">) {
  const { id } = await ctx.params;
  const paquete = SEMILLA.find((m) => m.id === id);
  if (!paquete) return Response.json({ error: "no-existe" }, { status: 404 });
  return Response.json(paquete);
}
