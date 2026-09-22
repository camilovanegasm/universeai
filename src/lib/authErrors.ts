// Traduce los códigos de error de Firebase Authentication a mensajes simples en español.
export function traducirErrorAuth(codigo: string): string {
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
    case "auth/network-request-failed":
      return "Hubo un problema de conexión. Revisa tu internet e intenta de nuevo.";
    default:
      return "Ocurrió un error inesperado. Intenta de nuevo.";
  }
}
