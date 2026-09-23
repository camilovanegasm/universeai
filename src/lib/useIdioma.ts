"use client";

import { useSyncExternalStore } from "react";
import { type Idioma } from "@/lib/i18n";

/**
 * El idioma activo, disponible en cualquier página — con o sin cuenta.
 *
 * De dónde sale, en este orden:
 *   1. Lo último que la persona eligió en este navegador (localStorage).
 *   2. Si nunca eligió nada, el idioma del navegador.
 *   3. Si nada de eso existe, español.
 *
 * Con cuenta, el perfil manda: /inicio copia `perfil.idioma` aquí al cargar,
 * porque el perfil es lo único que viaja de un celular a otro.
 *
 * Se lee con useSyncExternalStore y no con useState + useEffect por dos
 * razones: no dispara el "setState dentro de un efecto" que prohíbe ESLint, y
 * no rompe la hidratación — el servidor siempre pinta español y el navegador
 * corrige en el primer cuadro.
 */

const CLAVE = "punti-idioma";
const oyentes = new Set<() => void>();

function leer(): Idioma {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === "es" || guardado === "en") return guardado;
  } catch {
    // almacenamiento bloqueado (modo privado, permisos): se sigue sin él
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en")) {
    return "en";
  }
  return "es";
}

const leerEnServidor = (): Idioma => "es";

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  // Si la persona cambia de idioma en otra pestaña, esta se entera.
  const alCambiarOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) avisar();
  };
  window.addEventListener("storage", alCambiarOtraPestana);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", alCambiarOtraPestana);
  };
}

export function cambiarIdioma(nuevo: Idioma) {
  try {
    localStorage.setItem(CLAVE, nuevo);
  } catch {
    // sin almacenamiento el cambio vale solo para esta visita
  }
  oyentes.forEach((f) => f());
}

export function useIdioma(): Idioma {
  return useSyncExternalStore(suscribir, leer, leerEnServidor);
}
