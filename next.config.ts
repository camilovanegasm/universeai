import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad que se mandan con cada página.
 *
 * - nosniff: el navegador no adivina el tipo de un archivo (evita que un
 *   archivo se ejecute como algo que no es).
 * - Referrer-Policy: a otros sitios solo les llega "punti.space", nunca la
 *   ruta completa en la que estaba la persona.
 * - X-Frame-Options DENY: nadie puede meter Punti dentro de su página para
 *   engañar clics (clickjacking).
 * - Permissions-Policy: la app no usa cámara, micrófono, ubicación ni pagos;
 *   se apagan para que nada que se cuele pueda pedirlos.
 * - COOP same-origin-allow-popups: aísla la pestaña, pero deja funcionar la
 *   ventanita de "Continuar con Google" (signInWithPopup la necesita).
 * - HSTS: el navegador solo entra por https.
 *
 * Pendiente: una Content-Security-Policy completa. Hay que probarla con el
 * login de Google y los scripts de Next antes de activarla, o rompe el sitio.
 */
const cabeceras = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // No anunciar con qué está hecho el sitio.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: cabeceras }];
  },
};

export default nextConfig;
