"use client";

import { useEffect } from "react";
import { useIdioma } from "@/lib/useIdioma";

/**
 * Mantiene `<html lang>` al día con el idioma activo. No es decorativo: los
 * lectores de pantalla eligen la voz según ese atributo, y un texto en inglés
 * leído con voz española no se entiende.
 */
export default function LangDocumento() {
  const idioma = useIdioma();
  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);
  return null;
}
