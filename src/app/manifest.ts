import type { MetadataRoute } from "next";

// Punti como app: en el celular, "Agregar a pantalla de inicio" la abre a
// pantalla completa, sin la barra del navegador, con su propio ícono.
// (Next.js sirve este archivo en /manifest.webmanifest.)
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Punti — Aprende IA jugando",
    short_name: "Punti",
    description: "Un universo construido por Punti para aprender Inteligencia Artificial jugando.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#050510",
    theme_color: "#050510",
    lang: "es",
    icons: [
      { src: "/iconos/punti-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/iconos/punti-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/iconos/punti-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
