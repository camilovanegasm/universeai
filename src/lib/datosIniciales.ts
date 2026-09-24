// Lo que la app pide apenas arranca, en paralelo con el inicio de sesión.
// AuthContext lo importa de forma diferida para no meter Firestore en el
// primer paquete de la app.
export { cargarCatalogo as precargarCatalogo } from "./contenido";
export { precargarPerfil, soltarPerfil } from "./userProfile";
