"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";

/**
 * La barra de navegación de abajo: siempre en el mismo lugar, para que nadie
 * se pierda. Cuatro destinos:
 *
 *   MUNDOS  → todos los mundos (/inicio)
 *   SEGUIR  → directo a la próxima lección que te toca (/seguir)
 *   MANUAL  → cómo funciona Punti
 *   PERFIL  → tu progreso y tus ajustes
 *
 * No aparece donde estorba: la portada (sin cuenta), el registro, la
 * bienvenida, dentro de una lección (ahí se sale con SALIR) ni en el admin
 * (que tiene sus pestañas).
 *
 * Los íconos son pixel art dibujado con cuadritos, igual que Punti: cada
 * letra `#` del mapa es un pixel. Se pintan con el color del texto
 * (currentColor), así cambian de color solos al activarse.
 */

type Icono = readonly string[];

// Una esfera con su brillo arriba a la izquierda y una lunita.
const PLANETA: Icono = [
  "..........#.",
  ".........###",
  "....####..#.",
  "..########..",
  ".#..#######.",
  ".#.########.",
  ".##########.",
  ".##########.",
  "..########..",
  "....####....",
];

const COHETE: Icono = [
  ".....##.....",
  "....####....",
  "....#..#....",
  "...##..##...",
  "...######...",
  "...######...",
  "..########..",
  ".##.####.##.",
  ".#..####..#.",
  "....#..#....",
  ".....##.....",
  "....#..#....",
];

const LIBRO: Icono = [
  ".####..####.",
  ".#...##...#.",
  ".#.#.##.#.#.",
  ".#...##...#.",
  ".#.#.##.#.#.",
  ".#...##...#.",
  ".#.#.##.#.#.",
  ".#...##...#.",
  ".####..####.",
  ".....##.....",
];

const CASCO: Icono = [
  "....####....",
  "..##....##..",
  ".#........#.",
  ".#.######.#.",
  "#.#......#.#",
  "#.#.#..#.#.#",
  "#.#......#.#",
  ".#.######.#.",
  ".#........#.",
  "..##....##..",
  "...######...",
  "..#.#..#.#..",
];

function IconoPixel({ mapa, tam = 24 }: { mapa: Icono; tam?: number }) {
  const alto = mapa.length;
  const ancho = mapa[0].length;
  // Un solo <path> con todos los pixeles: más liviano que un <rect> por pixel.
  let d = "";
  mapa.forEach((fila, y) => {
    for (let x = 0; x < fila.length; x++) if (fila[x] === "#") d += `M${x} ${y}h1v1h-1z`;
  });
  return (
    <svg
      width={tam}
      height={(tam * alto) / ancho}
      viewBox={`0 0 ${ancho} ${alto}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="block"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

type Destino = {
  href: string;
  texto: Record<Idioma, string>;
  icono: Icono;
  color: string;
  activo: (ruta: string) => boolean;
};

const DESTINOS: Destino[] = [
  {
    href: "/inicio",
    texto: { es: "Mundos", en: "Worlds" },
    icono: PLANETA,
    color: "#00f5ff",
    activo: (r) => r === "/inicio" || r.startsWith("/tema"),
  },
  {
    href: "/seguir",
    texto: { es: "Seguir", en: "Continue" },
    icono: COHETE,
    color: "#00ff41",
    activo: (r) => r === "/seguir",
  },
  {
    href: "/como-funciona",
    texto: { es: "Manual", en: "Manual" },
    icono: LIBRO,
    color: "#ffe600",
    activo: (r) => r === "/como-funciona",
  },
  {
    href: "/perfil",
    texto: { es: "Perfil", en: "Profile" },
    icono: CASCO,
    color: "#ff006e",
    activo: (r) => r === "/perfil",
  },
];

/** Rutas donde la barra no va. */
function oculta(ruta: string) {
  return (
    ruta === "/" ||
    ruta === "/login" ||
    ruta === "/registro" ||
    ruta === "/bienvenida" ||
    ruta.startsWith("/leccion") ||
    ruta.startsWith("/mision") ||
    ruta.startsWith("/juego/") ||
    ruta.startsWith("/admin")
  );
}

export default function NavPunti() {
  const ruta = usePathname();
  const idioma = useIdioma();
  const { usuario } = useAuth();

  if (!usuario || oculta(ruta)) return null;
  return <BarraNav ruta={ruta} idioma={idioma} />;
}

/** Solo el dibujo de la barra, sin decidir si se muestra. */
export function BarraNav({ ruta, idioma }: { ruta: string; idioma: Idioma }) {
  return (
    <>
      {/* Reserva el alto de la barra al final de la página: sin esto, lo
          último de cada pantalla quedaría tapado. */}
      <div aria-hidden="true" className="h-[calc(76px+env(safe-area-inset-bottom,0px))] shrink-0" />

      <nav
        aria-label={idioma === "en" ? "Main menu" : "Menú principal"}
        className="nav-punti fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.96)] pb-[env(safe-area-inset-bottom,0px)] backdrop-blur"
      >
        <ul className="mx-auto grid max-w-[520px] grid-cols-4 gap-1.5 px-2 py-2">
          {DESTINOS.map((d) => {
            const activo = d.activo(ruta);
            return (
              <li key={d.href}>
                <Link
                  href={d.href}
                  aria-current={activo ? "page" : undefined}
                  className={`nav-punti-item flex h-[58px] flex-col items-center justify-center gap-1.5 border-2 ${
                    activo ? "nav-punti-activo" : "border-transparent text-[var(--muted)] hover:text-white"
                  }`}
                  style={
                    activo
                      ? ({ color: d.color, borderColor: d.color, "--nav-color": d.color } as React.CSSProperties)
                      : undefined
                  }
                >
                  {/* Caja de alto fijo: los íconos miden distinto y así los
                      textos quedan todos a la misma altura. */}
                  <span className="flex h-6 items-center">
                    <IconoPixel mapa={d.icono} />
                  </span>
                  <span className="font-[family-name:var(--font-pixel)] text-[8px] leading-none">
                    {d.texto[idioma].toUpperCase()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
