"use client";

import { useEffect } from "react";
import {
  useMusica, useSilencio, cambiarMusica, iniciarMusica, detenerMusica, musicaEncendida, registrarPantallaConMusica,
} from "@/lib/sonido";
import { useIdioma } from "@/lib/useIdioma";

/**
 * La música de la portada. Apagada por defecto: solo suena si la persona la
 * enciende, y deja de sonar al salir de la portada. Si alguna vez la encendió,
 * al volver a la portada arranca con el primer toque — nunca sola, porque el
 * navegador no lo permite y porque sonar sin permiso es de mala educación.
 */
export default function BotonMusica({ className = "" }: { className?: string }) {
  const encendida = useMusica();
  const silencio = useSilencio();
  const en = useIdioma() === "en";

  useEffect(() => {
    const salir = registrarPantallaConMusica();
    // Si estaba encendida desde otra visita, espera al primer toque.
    const arrancar = () => {
      if (musicaEncendida()) iniciarMusica();
    };
    document.addEventListener("pointerdown", arrancar, { once: true });
    return () => {
      salir();
      document.removeEventListener("pointerdown", arrancar);
      detenerMusica();
    };
  }, []);

  if (silencio) return null;

  const etiqueta = encendida ? (en ? "Music: on" : "Música: sí") : en ? "Music: off" : "Música: no";

  return (
    <button
      type="button"
      data-mudo
      aria-pressed={encendida}
      aria-label={etiqueta}
      onClick={() => cambiarMusica(!encendida)}
      className={`flex h-[34px] items-center gap-2 border-2 px-2.5 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em] transition-colors ${
        encendida
          ? "border-[var(--purple)] text-[var(--purple)]"
          : "border-[var(--color-panel-border)] text-[var(--muted)] hover:text-white"
      } ${className}`}
    >
      <span className={`ecualizador ${encendida ? "ecualizador-on" : ""}`} aria-hidden="true">
        <i /><i /><i />
      </span>
      {en ? "Music" : "Música"}
    </button>
  );
}
