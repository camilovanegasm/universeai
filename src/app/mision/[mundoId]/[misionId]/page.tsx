// Una misión. La pantalla es de cliente (PaginaMision); aquí solo se generan,
// al publicar el sitio, las páginas de las misiones de la semilla, para que
// abran sin despertar un servidor. Las publicadas después igual abren.
import { SEMILLA } from "@/lib/misiones/semilla";
import PaginaMision from "./PaginaMision";

export function generateStaticParams() {
  return SEMILLA.map((m) => ({ mundoId: m.mundo, misionId: m.id }));
}

export default function Page(props: PageProps<"/mision/[mundoId]/[misionId]">) {
  return <PaginaMision params={props.params} />;
}
