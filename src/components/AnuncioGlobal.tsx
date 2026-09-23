"use client";

import { useState } from "react";
import { firma, useCatalogo } from "@/lib/contenido";
import type { Idioma } from "@/lib/i18n";
import type { TonoAnuncio } from "@/lib/ajustes";

/**
 * El anuncio que el admin escribe en Ajustes (una novedad, un aviso de
 * mantenimiento, una celebración). Aparece arriba de los mundos.
 *
 * Se puede cerrar, y queda cerrado durante esa visita. Si el admin cambia el
 * texto, vuelve a aparecer: se recuerda qué texto se cerró, no solo "cerrado".
 */

const CLAVE = "punti-anuncio-cerrado";

const COLOR: Record<TonoAnuncio, string> = {
  info: "#00f5ff",
  alerta: "#ffe600",
  celebracion: "#00ff41",
};

function leerCerrado(): string | null {
  try {
    return sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export default function AnuncioGlobal({ idioma }: { idioma: Idioma }) {
  const { ajustes } = useCatalogo();
  const anuncio = ajustes.anuncio;
  const huella = firma(anuncio.texto);
  const [cerrado, setCerrado] = useState<string | null>(leerCerrado);

  const texto = anuncio.texto[idioma].trim() || anuncio.texto.es.trim();
  if (!anuncio.activo || !texto || cerrado === huella) return null;

  const color = COLOR[anuncio.tono];
  return (
    <div role="status" className="cargando-entra mx-auto w-full max-w-[1120px] px-4 pt-4 sm:px-6">
      <div className="flex items-start gap-3 border-2 bg-[rgba(5,5,16,0.9)] px-4 py-3" style={{ borderColor: color }}>
        <span className="mt-1 h-2.5 w-2.5 shrink-0" style={{ background: color }} aria-hidden="true" />
        <p className="flex-1 whitespace-pre-line text-[15px] leading-[1.55] text-white">{texto}</p>
        <button
          onClick={() => {
            setCerrado(huella);
            try {
              sessionStorage.setItem(CLAVE, huella);
            } catch {
              /* ventana privada: se cierra igual, solo que no se recuerda */
            }
          }}
          aria-label={idioma === "en" ? "Close notice" : "Cerrar aviso"}
          className="shrink-0 px-1 font-[family-name:var(--font-terminal)] text-[20px] leading-none text-[var(--muted)] hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
