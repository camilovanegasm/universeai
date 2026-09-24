"use client";

// Botón "Guardar imagen" / "Compartir" de la Ficha de misión (fase C2).
//
// Al tocarlo se descarga el dibujante de la imagen (src/lib/fichaImagen.ts,
// con import() para que no pese al abrir la página), se arma el PNG y:
//  - en el celular se abre la hoja de Compartir con la imagen (Instagram, Fotos…);
//  - en el computador se descarga.
// Si Safari dice que el toque "se venció" mientras se dibujaba, la imagen
// queda lista y el botón pide un segundo toque, que comparte al instante.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Idioma } from "@/lib/i18n";
import { textoPixel } from "@/lib/i18n";
import { compartirOGuardar, descargar, puedeCompartirArchivos } from "@/lib/compartir";
import type { DatosFichaImagen } from "@/lib/fichaImagen";
import { sonar } from "@/lib/sonido";

const T: Record<Idioma, Record<string, string>> = {
  es: {
    guardar: "Guardar imagen",
    compartir: "Compartir",
    ocupado: "Dibujando...",
    pendiente: "Lista · toca para compartir",
    hecho: "¡Guardada!",
    compartida: "¡Compartida!",
    error: "No pude armar la imagen. Intenta de nuevo.",
    descripcion: "Ficha de misión como imagen",
  },
  en: {
    guardar: "Save image",
    compartir: "Share",
    ocupado: "Drawing...",
    pendiente: "Ready · tap to share",
    hecho: "Saved!",
    compartida: "Shared!",
    error: "I couldn't make the image. Try again.",
    descripcion: "Mission card as an image",
  },
};

type Estado = "listo" | "ocupado" | "pendiente" | "hecho" | "compartida" | "error";

// Nadie cambia la respuesta mientras la página está abierta: no hay a qué suscribirse.
const sinCambios = () => () => {};
const enServidor = () => false;

export default function BotonFichaImagen({
  idioma,
  armar,
  nombreArchivo,
  className = "boton-pixel boton-pixel-oro",
  style,
}: {
  idioma: Idioma;
  /** Arma los datos al momento del toque (así siempre salen los de ahora). */
  armar: () => DatosFichaImagen;
  /** Nombre del PNG, ya limpio (ver nombreSeguro en src/lib/compartir.ts). */
  nombreArchivo: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = T[idioma];
  // En el servidor (y en el primer pintado) dice "Guardar imagen"; en el
  // navegador pregunta si se puede compartir. Así no hay parpadeos raros.
  const compartible = useSyncExternalStore(sinCambios, puedeCompartirArchivos, enServidor);
  const [estado, setEstado] = useState<Estado>("listo");
  const lista = useRef<Blob | null>(null);
  const reloj = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Al salir de la pantalla, se apaga el reloj que devuelve el botón a su texto.
  useEffect(
    () => () => {
      if (reloj.current) clearTimeout(reloj.current);
    },
    [],
  );

  function terminar(e: Estado) {
    setEstado(e);
    if (reloj.current) clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setEstado("listo"), 2500);
  }

  async function entregar(blob: Blob) {
    try {
      const r = await compartirOGuardar(blob, nombreArchivo);
      if (r === "cancelado") {
        setEstado("listo");
        return;
      }
      sonar("acierto");
      terminar(r === "compartido" ? "compartida" : "hecho");
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        // El toque se venció mientras se dibujaba: se guarda la imagen y se
        // pide otro toque.
        lista.current = blob;
        setEstado("pendiente");
        return;
      }
      // La hoja de Compartir falló por otra razón: se descarga y listo.
      descargar(blob, nombreArchivo);
      sonar("acierto");
      terminar("hecho");
    }
  }

  async function alTocar() {
    if (estado === "ocupado") return;
    const guardada = lista.current;
    if (guardada) {
      lista.current = null;
      await entregar(guardada);
      return;
    }
    setEstado("ocupado");
    try {
      const { crearFichaImagen } = await import("@/lib/fichaImagen");
      const blob = await crearFichaImagen(armar());
      await entregar(blob);
    } catch {
      setEstado("error");
    }
  }

  const etiqueta =
    estado === "ocupado"
      ? t.ocupado
      : estado === "pendiente"
        ? t.pendiente
        : estado === "hecho"
          ? t.hecho
          : estado === "compartida"
            ? t.compartida
            : compartible
              ? t.compartir
              : t.guardar;

  return (
    <>
      <button
        type="button"
        onClick={alTocar}
        // Adelanta la descarga del dibujante apenas el dedo o el mouse se
        // acercan: así el toque llega con todo listo (importa en iPhone).
        onPointerEnter={precargar}
        onPointerDown={precargar}
        onFocus={precargar}
        aria-busy={estado === "ocupado"}
        aria-disabled={estado === "ocupado"}
        aria-label={`${etiqueta} · ${t.descripcion}`}
        className={`${className} ${estado === "ocupado" ? "cursor-wait opacity-70" : ""}`}
        style={style}
      >
        {textoPixel(etiqueta)}
      </button>
      <span role="status" aria-live="polite" className={estado === "error" ? "basis-full text-[14px] text-[var(--pink)]" : "sr-only"}>
        {estado === "error" ? t.error : ""}
      </span>
    </>
  );
}

function precargar() {
  void import("@/lib/fichaImagen").catch(() => undefined);
}
