// La app de Firebase y el inicio de sesión, SIN la base de datos.
//
// El marco de la app (AuthContext, en el layout) solo necesita saber quién es
// la persona. Separarlo de Firestore evita que cada pantalla cargue la base de
// datos solo para arrancar: Firestore llega aparte, en paralelo.
//
// LA VENTANA DE GOOGLE, SOLO DONDE SE USA. getAuth() trae el "popupRedirect
// Resolver" (lo que abre "Continuar con Google"). En celulares y Safari, con
// él, el login ESPERA en cada apertura a que cargue un iframe de
// firebaseapp.com antes de decir quién es la persona: esa era buena parte del
// "Contando estrellas". Ahora:
//  - en /login y /registro se arranca CON la ventana, igual que siempre (en
//    iPhone la ventana tiene que estar lista antes del toque o Safari la
//    bloquea);
//  - en el resto, SIN ella: la app sabe quién eres sin esa espera.
//  Si alguien llega al login navegando dentro de la app (sin la ventana), esa
//  pantalla se recarga una vez para arrancar con ella (ver necesitaRecargarParaGoogle).
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Evita inicializar Firebase más de una vez (Next.js puede recargar el código en desarrollo).
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const RUTAS_CON_GOOGLE = ["/login", "/registro"];
let conGoogle = false;

function iniciarAuth(): Auth {
  // En el servidor (al generar las páginas) no hay navegador: instancia simple.
  if (typeof window === "undefined") return getAuth(app);
  conGoogle = RUTAS_CON_GOOGLE.some((r) => window.location.pathname.startsWith(r));
  try {
    return initializeAuth(app, {
      // La sesión se guarda igual que con getAuth(): nadie pierde su sesión.
      persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
      ...(conGoogle ? { popupRedirectResolver: browserPopupRedirectResolver } : {}),
    });
  } catch {
    // Ya estaba iniciada (recarga en desarrollo).
    conGoogle = true;
    return getAuth(app);
  }
}

export const auth = iniciarAuth();

/**
 * true si esta pantalla de login llegó navegando desde otra de la app (la
 * sesión arrancó sin la ventana de Google). La pantalla se recarga una vez y
 * arranca con ella. No hay bucle: tras recargar, la ruta ya es /login.
 */
export function necesitaRecargarParaGoogle() {
  return typeof window !== "undefined" && !conGoogle;
}
