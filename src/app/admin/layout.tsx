import type { Metadata } from "next";

// El admin no debe aparecer en Google. No es la seguridad (esa son las reglas
// de Firestore); es para no mostrarle la puerta a nadie.
export const metadata: Metadata = {
  title: "Estación de control · Punti",
  robots: { index: false, follow: false, nocache: true },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return children;
}
