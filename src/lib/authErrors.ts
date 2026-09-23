import type { Idioma } from "@/lib/i18n";

// Traduce los códigos de error de Firebase Authentication a mensajes simples.
//
// Regla: el mensaje le dice a la persona QUÉ HACER, no qué falló por dentro.
// Y el código crudo siempre se registra en la consola, porque cuando alguien
// reporta "me salió un error" lo primero que hace falta es saber cuál era.

type Mensaje = Record<Idioma, string>;

const MENSAJES: Record<string, Mensaje> = {
  "auth/invalid-email": {
    es: "Ese correo no parece válido. Revísalo e intenta de nuevo.",
    en: "That email doesn't look right. Check it and try again.",
  },
  "auth/invalid-credential": {
    es: "Correo o contraseña incorrectos.",
    en: "Wrong email or password.",
  },
  "auth/email-already-in-use": {
    es: "Ya existe una cuenta con ese correo. Intenta iniciar sesión.",
    en: "There's already an account with that email. Try signing in.",
  },
  "auth/weak-password": {
    es: "La contraseña debe tener al menos 6 caracteres.",
    en: "Your password needs at least 6 characters.",
  },
  "auth/too-many-requests": {
    es: "Demasiados intentos. Espera un momento y vuelve a intentarlo.",
    en: "Too many attempts. Wait a moment and try again.",
  },
  "auth/popup-closed-by-user": {
    es: "Cerraste la ventana de Google antes de terminar. Intenta de nuevo.",
    en: "You closed the Google window before finishing. Try again.",
  },
  "auth/cancelled-popup-request": {
    es: "Se abrió otra ventana de Google. Cierra las demás e intenta de nuevo.",
    en: "Another Google window opened. Close the others and try again.",
  },
  "auth/popup-blocked": {
    es: "Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio e intenta de nuevo.",
    en: "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
  },
  "auth/account-exists-with-different-credential": {
    es: "Ya tienes una cuenta con ese correo, creada de otra forma. Inicia sesión con correo y contraseña.",
    en: "You already have an account with that email, created another way. Sign in with email and password.",
  },
  "auth/network-request-failed": {
    es: "Hubo un problema de conexión. Revisa tu internet e intenta de nuevo.",
    en: "There was a connection problem. Check your internet and try again.",
  },

  // Estos dos son de configuración, no del usuario: nadie que esté
  // intentando entrar puede resolverlos. El mensaje lo dice sin rodeos
  // para que quien administra la app sepa dónde mirar.
  "auth/unauthorized-domain": {
    es: "Este sitio todavía no está habilitado para iniciar sesión con Google. Si administras Punti, autoriza el dominio en Firebase → Authentication → Settings → Authorized domains.",
    en: "This site isn't enabled for Google sign-in yet. If you run Punti, authorize the domain in Firebase → Authentication → Settings → Authorized domains.",
  },
  "auth/operation-not-allowed": {
    es: "Ese método de inicio de sesión está desactivado. Si administras Punti, actívalo en Firebase → Authentication → Sign-in method.",
    en: "That sign-in method is turned off. If you run Punti, enable it in Firebase → Authentication → Sign-in method.",
  },
};

// Tres códigos distintos que significan lo mismo para la persona.
MENSAJES["auth/user-not-found"] = MENSAJES["auth/invalid-credential"];
MENSAJES["auth/wrong-password"] = MENSAJES["auth/invalid-credential"];

const INESPERADO: Mensaje = {
  es: "Ocurrió un error inesperado. Intenta de nuevo.",
  en: "Something unexpected went wrong. Please try again.",
};

export function traducirErrorAuth(codigo: string, idioma: Idioma = "es"): string {
  if (codigo) {
    console.error(`[auth] ${codigo}`);
  }
  return (MENSAJES[codigo] ?? INESPERADO)[idioma];
}
