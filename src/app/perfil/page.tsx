"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { esAdmin } from "@/lib/admin";
import { useCatalogo } from "@/lib/contenido";
import { guardarIdioma, obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import { useIdioma, cambiarIdioma } from "@/lib/useIdioma";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import PanelPerfil from "@/components/PanelPerfil";
import SelectorIdioma from "@/components/SelectorIdioma";
import CampoEstelar from "@/components/CampoEstelar";

export default function PerfilPage() {
  const router = useRouter();
  const idioma = useIdioma();
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [fallo, setFallo] = useState(false);
  // Rangos y tanque dependen de los ajustes: se espera a que lleguen.
  const { listo } = useCatalogo();

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/login");
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario) return;
    let vigente = true;
    obtenerPerfil(usuario.uid)
      .then((datos) => {
        if (!vigente) return;
        if (!datos) {
          setFallo(true);
          return;
        }
        if (datos.idioma) cambiarIdioma(datos.idioma);
        setPerfil(datos);
      })
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
    };
  }, [usuario]);

  if (fallo) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <PuntiPixel estado="error" ancho={112} />
        <p className="max-w-[40ch] text-[15px] text-[var(--muted)]">
          {idioma === "en"
            ? "I couldn't load your profile. Check your connection and try again."
            : "No pude cargar tu perfil. Revisa tu conexión e intenta de nuevo."}
        </p>
        <Link href="/inicio" className="boton-pixel">
          {idioma === "en" ? "WORLDS" : "MUNDOS"}
        </Link>
      </div>
    );
  }

  if (cargando || !usuario || !perfil || !listo) {
    return <Cargando />;
  }

  return (
    <div className="relative flex flex-1 flex-col">
      <CampoEstelar className="pointer-events-none fixed inset-0 -z-10" />
      <header className="sticky top-0 z-20 border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[860px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/inicio"
            transitionTypes={["atras"]}
            className="border-2 border-[var(--color-panel-border)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--muted)] transition-colors hover:border-[var(--matrix)] hover:text-[var(--matrix)]"
          >
            ← {idioma === "en" ? "WORLDS" : "MUNDOS"}
          </Link>
          {esAdmin(usuario) ? (
            <Link
              href="/admin"
              transitionTypes={["adelante"]}
              className="border-2 border-[var(--gold)] px-3 py-2 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/15"
            >
              ESTACION DE CONTROL
            </Link>
          ) : (
            <span className="font-[family-name:var(--font-pixel)] text-[11px] text-white">PUNTI</span>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[860px] flex-1 px-4 pb-16 pt-7 sm:px-6">
        <PanelPerfil
          perfil={perfil}
          idioma={idioma}
          alSalir={() => signOut(auth).then(() => router.replace("/"))}
          selectorIdioma={<SelectorIdioma alCambiar={(i) => guardarIdioma(usuario.uid, i).catch(() => {})} />}
        />
      </main>
    </div>
  );
}
