"use client";

// Contexto de autenticación: guarda quién es el usuario logueado (o null si no hay nadie)
// y lo pone a disposición de toda la app sin tener que pasarlo página por página.
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

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
    const unsubscribe = onAuthStateChanged(auth, (usuarioActual) => {
      setUsuario(usuarioActual);
      setCargando(false);
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
