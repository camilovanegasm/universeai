"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCatalogo } from "@/lib/contenido";
import { obtenerPerfil } from "@/lib/userProfile";
import { useIdioma } from "@/lib/useIdioma";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";

/**
 * SEGUIR: el botón del medio de la barra. Busca la primera lección que la
 * persona no ha hecho y que ya existe, en el orden de los mundos, y la abre.
 *
 * El perfil se lee solo cuando alguien toca SEGUIR, no en cada pantalla:
 * la barra de navegación no hace ninguna lectura por su cuenta.
 */
export default function Seguir() {
  const router = useRouter();
  const idioma = useIdioma();
  const { usuario, cargando } = useAuth();
  const catalogo = useCatalogo();
  const [alDia, setAlDia] = useState(false);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/login");
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario || !catalogo.listo) return;
    let vigente = true;
    obtenerPerfil(usuario.uid)
      .then((perfil) => {
        if (!vigente) return;
        for (const tema of catalogo.temas) {
          const siguiente = tema.subtemas.find(
            (s) => catalogo.conLeccion.has(s.id) && !perfil?.progreso?.[s.id]?.completada,
          );
          if (siguiente) {
            // replace: al volver atrás desde la lección no se cae de nuevo aquí.
            router.replace(`/leccion/${tema.id}/${siguiente.id}`, { transitionTypes: ["adelante"] });
            return;
          }
        }
        setAlDia(true);
      })
      .catch(() => {
        if (vigente) setFallo(true);
      });
    return () => {
      vigente = false;
    };
  }, [usuario, catalogo, router]);

  if (fallo) {
    return (
      <Aviso estado="error" texto={idioma === "en" ? "I couldn't find your next lesson. Check your connection." : "No pude encontrar tu próxima lección. Revisa tu conexión."} idioma={idioma} />
    );
  }

  if (alDia) {
    return (
      <Aviso
        estado="hype"
        titulo={idioma === "en" ? "You're all caught up!" : "¡Estás al día!"}
        texto={
          idioma === "en"
            ? "You've done every lesson that's out so far. New ones land soon; meanwhile you can replay any world."
            : "Hiciste todas las lecciones que hay por ahora. Pronto llegan nuevas; mientras tanto puedes repasar cualquier mundo."
        }
        idioma={idioma}
      />
    );
  }

  return <Cargando />;
}

function Aviso({
  estado,
  titulo,
  texto,
  idioma,
}: {
  estado: "hype" | "error";
  titulo?: string;
  texto: string;
  idioma: "es" | "en";
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
      <PuntiPixel estado={estado} ancho={128} />
      {titulo && <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-white">{titulo}</h1>}
      <p className="max-w-[42ch] text-[15px] leading-[1.6] text-[var(--muted)]">{texto}</p>
      <Link href="/inicio" className="boton-pixel">
        {idioma === "en" ? "WORLDS" : "MUNDOS"}
      </Link>
    </div>
  );
}
