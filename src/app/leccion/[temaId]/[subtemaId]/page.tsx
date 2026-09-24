// Una lección. La pantalla es de cliente (PaginaLeccion); aquí solo se generan,
// al publicar el sitio, las páginas de las lecciones conocidas, para que abran
// desde la red de Vercel sin despertar un servidor. Las nuevas igual abren.
import { mundosPublicados } from "@/lib/servidor/catalogoPublicado";
import PaginaLeccion from "./PaginaLeccion";

export async function generateStaticParams() {
  return (await mundosPublicados()).flatMap((t) => t.subtemas.map((id) => ({ temaId: t.id, subtemaId: id })));
}

export default function Page(props: PageProps<"/leccion/[temaId]/[subtemaId]">) {
  return <PaginaLeccion params={props.params} />;
}
