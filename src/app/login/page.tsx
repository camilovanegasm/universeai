"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { crearPerfilSiNoExiste } from "@/lib/userProfile";
import { traducirErrorAuth } from "@/lib/authErrors";
import BotonGoogle from "@/components/BotonGoogle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/inicio");
    } catch (err) {
      const codigo = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError(traducirErrorAuth(codigo));
    } finally {
      setCargando(false);
    }
  }

  async function iniciarConGoogle() {
    setError(null);
    setCargando(true);
    try {
      const resultado = await signInWithPopup(auth, new GoogleAuthProvider());
      await crearPerfilSiNoExiste(resultado.user);
      router.push("/inicio");
    } catch (err) {
      const codigo = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError(traducirErrorAuth(codigo));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
          UniverseAI
        </h1>
        <p className="mt-2 text-center text-zinc-500 dark:text-zinc-400">
          Inicia sesión para continuar aprendiendo
        </p>

        <form onSubmit={manejarEnvio} className="mt-8 flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {cargando ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          <span className="text-sm text-zinc-400">o</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <BotonGoogle
          onClick={iniciarConGoogle}
          deshabilitado={cargando}
          texto="Continuar con Google"
        />

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-semibold text-blue-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
