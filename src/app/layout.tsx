import type { Metadata } from "next";
import { Orbitron, VT323, Rajdhani, Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import FondoEspacial from "@/components/FondoEspacial";

// Sistema tipográfico de Punti: Orbitron para títulos épicos, VT323 para la voz de
// Punti/HUD, Rajdhani para navegación y UI, Press Start 2P (con moderación) para
// logros puntuales, e Inter para todo el texto de lectura.
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"] });
const vt323 = VT323({ variable: "--font-vt323", weight: "400", subsets: ["latin"] });
const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});
const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  weight: "400",
  subsets: ["latin"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Punti — Aprende IA jugando",
  description:
    "Un universo construido por Punti para aprender Inteligencia Artificial gratis: lecciones cortas, planetas por explorar y una racha que cuidar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${vt323.variable} ${rajdhani.variable} ${pressStart.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FondoEspacial />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
