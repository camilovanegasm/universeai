// Un minijuego. La pantalla es de cliente (PaginaJuego); aquí solo se generan,
// al publicar el sitio, las páginas de los juegos, para que abran sin
// despertar un servidor.
import { JUEGOS } from "@/lib/juegos/catalogo";
import PaginaJuego from "./PaginaJuego";

export function generateStaticParams() {
  return JUEGOS.map((j) => ({ id: j.id }));
}

export default function Page(props: PageProps<"/juego/[id]">) {
  return <PaginaJuego params={props.params} />;
}
