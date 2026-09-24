import NavPunti from "@/components/NavPunti";
import InvitacionApp from "@/components/InvitacionApp";
import type { Metadata, Viewport } from "next";
import { preconnect } from "react-dom";
import { Orbitron, VT323, Rajdhani, Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LangDocumento from "@/components/LangDocumento";
import SonidoGlobal from "@/components/SonidoGlobal";
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
  // Solo para etiquetas pequeñas: no se precarga, así no compite con las
  // fuentes del texto que se lee primero.
  preload: false,
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Punti — Aprende IA jugando",
  description:
    "Un universo construido por Punti para aprender Inteligencia Artificial gratis: lecciones cortas, planetas por explorar y una racha que cuidar.",
  applicationName: "Punti",
  // En iPhone, "Agregar a pantalla de inicio" abre Punti como app, sin barras del navegador.
  appleWebApp: { capable: true, title: "Punti", statusBarStyle: "black" },
};

// Color de la barra del sistema (Android y la app instalada): el fondo del espacio.
export const viewport: Viewport = {
  themeColor: "#050510",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Abrir de una vez la conexión con los servidores de Firebase (login y base
  // de datos): cuando la app los necesita, el saludo de red ya está hecho.
  preconnect("https://firestore.googleapis.com");
  preconnect("https://identitytoolkit.googleapis.com");
  preconnect("https://securetoken.googleapis.com");
  if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) preconnect(`https://${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}`);
  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${vt323.variable} ${rajdhani.variable} ${pressStart.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FondoEspacial />
        <LangDocumento />
        <SonidoGlobal />
        <AuthProvider>
          {children}
          <NavPunti />
          <InvitacionApp />
        </AuthProvider>
      </body>
    </html>
  );
}
