// Compartir o guardar un archivo hecho en el navegador (la Ficha como imagen,
// la Bitácora como texto). Sin librerías y sin alert/confirm.
//
// En el celular (iPhone, Android) se abre la hoja de "Compartir" del sistema
// con el archivo adjunto: de ahí va a Instagram, WhatsApp o a Fotos. En el
// computador, o donde el navegador no sabe compartir archivos, se descarga.

/** Lo que pasó al final: compartido, descargado o el piloto cerró la hoja. */
export type ResultadoCompartir = "compartido" | "descargado" | "cancelado";

/**
 * Deja solo letras, números y guiones (sin tildes ni espacios) para que el
 * nombre del archivo funcione en cualquier sistema. "Camilo Vanegas" → "Camilo-Vanegas".
 */
export function nombreSeguro(texto: string, respaldo = "Piloto"): string {
  const limpio = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return limpio || respaldo;
}

let puedeCache: boolean | null = null;

/**
 * ¿Este navegador puede mandar un archivo a la hoja de Compartir? Se pregunta
 * con un archivo de muestra (vacío) y se recuerda la respuesta.
 */
export function puedeCompartirArchivos(): boolean {
  if (puedeCache !== null) return puedeCache;
  try {
    const muestra = new File([new Uint8Array(0)], "punti.png", { type: "image/png" });
    puedeCache =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [muestra] });
  } catch {
    puedeCache = false;
  }
  return puedeCache;
}

/** Descarga el archivo con un enlace invisible y libera la memoria después. */
export function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Se espera un momento antes de liberar la dirección: si se libera en el
  // mismo instante, algunos navegadores (Safari) cancelan la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Comparte el archivo si se puede; si no, lo descarga.
 *
 * Errores:
 * - Si el piloto cierra la hoja de Compartir (AbortError), no pasa nada: devuelve "cancelado".
 * - Si el navegador dice que el toque "ya se venció" (NotAllowedError, típico
 *   de Safari cuando armar la imagen tardó), el error sube para que el botón
 *   pida un segundo toque: la imagen ya está lista y ese toque comparte al instante.
 */
export async function compartirOGuardar(blob: Blob, nombre: string): Promise<ResultadoCompartir> {
  if (puedeCompartirArchivos()) {
    const archivo = new File([blob], nombre, { type: blob.type || "application/octet-stream" });
    if (navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo] });
        return "compartido";
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return "cancelado";
        throw e;
      }
    }
  }
  descargar(blob, nombre);
  return "descargado";
}
