"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";

export default function InicioPage() {
  const router = useRouter();
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login");
    }
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (usuario) {
      obtenerPerfil(usuario.uid).then(setPerfil);
    }
  }, [usuario]);

  if (cargando || !usuario) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500 dark:text-zinc-400">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
          UniverseAI
        </h1>
        <div className="flex items-center gap-4 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
          <span title="XP">⭐ {perfil?.xp ?? 0} XP</span>
          <span title="Corazones">❤️ {perfil?.corazones ?? 0}</span>
          <span title="Racha">🔥 {perfil?.racha ?? 0}</span>
          <button
            onClick={() => signOut(auth)}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-2xl">👋</p>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          ¡Bienvenido{perfil?.nombre ? `, ${perfil.nombre}` : ""}!
        </h2>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Tu cuenta ya está lista. El mapa de niveles y la primera lección
          llegarán en el siguiente paso de construcción.
        </p>
      </main>
    </div>
  );
}
