"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { guardarIdioma, marcarBienvenidaVista } from "@/lib/userProfile";
import type { Idioma } from "@/lib/i18n";
import { cambiarIdioma } from "@/lib/useIdioma";
import { sonar } from "@/lib/sonido";
import Cargando from "@/components/Cargando";
import CampoEstelar from "@/components/CampoEstelar";
import ComoFunciona from "@/components/ComoFunciona";
import ElegirIdioma from "@/components/ElegirIdioma";

/**
 * La bienvenida: lo primero que ve alguien recién registrado.
 *
 * Dos pasos: elegir idioma y recorrer el manual de vuelo. Todo lo que pase
 * por aquí converge — registro con correo, registro con Google, o una cuenta
 * vieja que todavía no tenía idioma — porque /inicio manda aquí a cualquiera
 * que no haya visto la bienvenida.
 *
 * Sirve también para cambiar de idioma más adelante: volver a /bienvenida no
 * rompe nada, solo vuelve a preguntar.
 */
export default function BienvenidaPage() {
  const router = useRouter();
  const { usuario, cargando } = useAuth();

  const [paso, setPaso] = useState<"idioma" | "manual">("idioma");
  const [idioma, setIdioma] = useState<Idioma | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/login");
  }, [cargando, usuario, router]);

  if (cargando || !usuario) {
    return <Cargando />;
  }

  async function elegir(nuevo: Idioma) {
    if (guardando || !usuario) return;
    setGuardando(true);
    setFallo(false);
    setIdioma(nuevo);
    try {
      await guardarIdioma(usuario.uid, nuevo);
      cambiarIdioma(nuevo);
      // Un respiro para que se vea la celebración antes de cambiar de pantalla:
      // si el cambio es instantáneo, la reacción de Punti no alcanza a verse.
      setTimeout(() => setPaso("manual"), 900);
    } catch {
      setIdioma(null);
      setFallo(true);
      setGuardando(false);
    }
  }

  async function terminar() {
    if (!usuario) return;
    sonar("arranque");
    try {
      await marcarBienvenidaVista(usuario.uid);
    } catch {
      // Si falla, no se le cierra el paso: /inicio lo volverá a traer aquí
      // la próxima vez, que es mejor que dejarlo encerrado en el manual.
    }
    router.replace("/inicio");
  }

  if (paso === "manual" && idioma) {
    return (
      <main key="manual" className="slide-paso mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        <p className="text-center font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.3em] text-[var(--matrix)]">
          {idioma === "en" ? "// Flight manual" : "// Manual de vuelo"}
        </p>
        <div className="mt-5 flex flex-1 flex-col">
          <ComoFunciona idioma={idioma} alTerminar={terminar} />
        </div>
      </main>
    );
  }

  return (
    <main key="idioma" className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <CampoEstelar className="absolute inset-0 -z-10" />
      <ElegirIdioma idioma={idioma} guardando={guardando} fallo={fallo} onElegir={elegir} />
    </main>
  );
}
