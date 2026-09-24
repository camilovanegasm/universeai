// Conexión de la app con Firebase (login de usuarios + base de datos).
// Los valores vienen del archivo .env.local (no se sube a GitHub).
// El login vive en firebaseApp.ts (sin Firestore, para el marco de la app).
import { getFirestore } from "firebase/firestore";
import { app, auth } from "./firebaseApp";

export { auth };
export const db = getFirestore(app);
export default app;
