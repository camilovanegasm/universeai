// Traduce los códigos de error de Firebase Authentication a mensajes simples en español.
//
// Regla: el mensaje le dice a la persona QUÉ HACER, no qué falló por dentro.
// Y el código crudo siempre se registra en la consola, porque cuando alguien
// reporta "me salió un error" lo primero que hace falta es saber cuál era.
export function traducirErrorAuth(codigo: string): string {
  if (codigo) {
    console.error(`[auth] ${codigo}`);
  }

  switch (codigo) {
    case "auth/invalid-email":
      return "Ese correo no parece válido. Revísalo e intenta de nuevo.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese correo. Intenta iniciar sesión.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento y vuelve a intentarlo.";
    case "auth/popup-closed-by-user":
      return "Cerraste la ventana de Google antes de terminar. Intenta de nuevo.";
    case "auth/cancelled-popup-request":
      return "Se abrió otra ventana de Google. Cierra las demás e intenta de nuevo.";
    case "auth/popup-blocked":
      return "Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio e intenta de nuevo.";
    case "auth/account-exists-with-different-credential":
      return "Ya tienes una cuenta con ese correo, creada de otra forma. Inicia sesión con correo y contraseña.";
    case "auth/network-request-failed":
      return "Hubo un problema de conexión. Revisa tu internet e intenta de nuevo.";

    // Estos dos son de configuración, no del usuario: nadie que esté
    // intentando entrar puede resolverlos. El mensaje lo dice sin rodeos
    // para que quien administra la app sepa dónde mirar.
    case "auth/unauthorized-domain":
      return "Este sitio todavía no está habilitado para iniciar sesión con Google. Si administras Punti, autoriza el dominio en Firebase → Authentication → Settings → Authorized domains.";
    case "auth/operation-not-allowed":
      return "Ese método de inicio de sesión está desactivado. Si administras Punti, actívalo en Firebase → Authentication → Sign-in method.";

    default:
      return "Ocurrió un error inesperado. Intenta de nuevo.";
  }
}
