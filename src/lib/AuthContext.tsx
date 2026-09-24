"use client";

// Contexto de autenticación: guarda quién es el usuario logueado (o null si no hay nadie)
// y lo pone a disposición de toda la app sin tener que pasarlo página por página.
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseApp";

type AuthContextValue = {
  usuario: User | null;
  cargando: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  usuario: null,
  cargando: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Mientras se confirma la sesión, ya se piden en paralelo los mundos y
    // ajustes (que no dependen de quién es). Firestore se carga aparte, sin
    // frenar el primer dibujo.
    const datos = import("./datosIniciales");
    void datos.then((m) => m.precargarCatalogo());
    const unsubscribe = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setCargando(false);
      // Apenas se sabe quién es, se empieza a traer su perfil (en vivo).
      void datos.then((m) => (usuarioActual ? m.precargarPerfil(usuarioActual.uid) : m.soltarPerfil()));
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
