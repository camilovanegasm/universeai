// Un mundo. La pantalla es de cliente (PaginaTema); aquí solo se generan, al
// publicar el sitio, las páginas de los mundos conocidos: así abren desde la
// red de Vercel al instante, sin despertar un servidor. Un mundo nuevo creado
// desde el admin igual abre (se genera la primera vez que alguien entra).
import { mundosPublicados } from "@/lib/servidor/catalogoPublicado";
import PaginaTema from "./PaginaTema";

export async function generateStaticParams() {
  return (await mundosPublicados()).map((t) => ({ id: t.id }));
}

export default function Page(props: PageProps<"/tema/[id]">) {
  return <PaginaTema params={props.params} />;
}
