"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { crearPerfilSiNoExiste } from "@/lib/userProfile";
import { traducirErrorAuth } from "@/lib/authErrors";
import BotonGoogle from "@/components/BotonGoogle";
import Punti from "@/components/Punti";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, password);
      if (nombre.trim()) {
        await updateProfile(credencial.user, { displayName: nombre.trim() });
      }
      await crearPerfilSiNoExiste(credencial.user);
      router.push("/inicio");
    } catch (err) {
      const codigo = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError(traducirErrorAuth(codigo));
    } finally {
      setCargando(false);
    }
  }

  async function registrarseConGoogle() {
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
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="tarjeta-espacial w-full max-w-sm rounded-2xl p-8">
        <div className="flex justify-center">
          <Punti estado="boot" tamano={90} />
        </div>
        <h1 className="mt-2 text-center font-[family-name:var(--font-display)] text-xl font-bold text-[var(--matrix)]">
          Punti
        </h1>
        <p className="mt-2 text-center font-[family-name:var(--font-terminal)] text-lg text-[var(--cyan)] opacity-80">
          Crea tu cuenta gratis y empieza tu viaje_
        </p>

        <form onSubmit={manejarEnvio} className="mt-8 flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-xl border border-[var(--color-panel-border)] bg-black/30 px-4 py-3 text-white placeholder-[var(--muted)] outline-none focus:border-[var(--matrix)]"
          />
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-[var(--color-panel-border)] bg-black/30 px-4 py-3 text-white placeholder-[var(--muted)] outline-none focus:border-[var(--matrix)]"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-[var(--color-panel-border)] bg-black/30 px-4 py-3 text-white placeholder-[var(--muted)] outline-none focus:border-[var(--matrix)]"
          />

          {error && (
            <p className="rounded-xl border border-[var(--pink)]/40 bg-[var(--pink)]/10 px-4 py-3 text-sm font-medium text-[var(--pink)]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="boton-matrix rounded-xl px-5 py-3 font-[family-name:var(--font-ui)] font-bold uppercase tracking-wide disabled:opacity-50"
          >
            {cargando ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-sm text-[var(--muted)]">o</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <BotonGoogle
          onClick={registrarseConGoogle}
          deshabilitado={cargando}
          texto="Registrarse con Google"
        />

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-[var(--matrix)] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
