"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { crearPerfilSiNoExiste } from "@/lib/userProfile";
import { traducirErrorAuth } from "@/lib/authErrors";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";
import BotonGoogle from "@/components/BotonGoogle";
import MarcoCuenta, { AvisoCuenta, CampoCuenta, SeparadorCuenta } from "@/components/MarcoCuenta";

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    titulo: "Bienvenido de vuelta",
    sub: "Inicia sesión para seguir tu viaje",
    correo: "Correo electrónico",
    clave: "Contraseña",
    entrar: "ENTRAR",
    entrando: "ENTRANDO...",
    o: "o",
    google: "Continuar con Google",
    sinCuenta: "¿No tienes cuenta?",
    crear: "Crea una gratis",
  },
  en: {
    titulo: "Welcome back",
    sub: "Sign in to continue your journey",
    correo: "Email",
    clave: "Password",
    entrar: "SIGN IN",
    entrando: "SIGNING IN...",
    o: "or",
    google: "Continue with Google",
    sinCuenta: "No account yet?",
    crear: "Create one for free",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const idioma = useIdioma();
  const t = TX[idioma];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Se guarda el código, no el mensaje: así, si la persona cambia de idioma
  // con el error en pantalla, el mensaje se traduce también.
  const leerCodigo = (err: unknown) =>
    err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    setCodigoError(null);
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/inicio");
    } catch (err) {
      setCodigoError(leerCodigo(err));
    } finally {
      setCargando(false);
    }
  }

  async function iniciarConGoogle() {
    setCodigoError(null);
    setCargando(true);
    try {
      const resultado = await signInWithPopup(auth, new GoogleAuthProvider());
      await crearPerfilSiNoExiste(resultado.user);
      router.push("/inicio");
    } catch (err) {
      setCodigoError(leerCodigo(err));
    } finally {
      setCargando(false);
    }
  }

  const estado = codigoError !== null ? "error" : cargando ? "loading" : "online";

  return (
    <MarcoCuenta estado={estado} titulo={t.titulo} subtitulo={t.sub}>
      <form onSubmit={manejarEnvio} className="flex flex-col gap-3">
        <CampoCuenta
          type="email"
          required
          autoComplete="email"
          placeholder={t.correo}
          aria-label={t.correo}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CampoCuenta
          type="password"
          required
          autoComplete="current-password"
          placeholder={t.clave}
          aria-label={t.clave}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {codigoError !== null && <AvisoCuenta texto={traducirErrorAuth(codigoError, idioma)} />}

        <button type="submit" disabled={cargando} className="boton-pixel boton-pixel-lleno mt-1 w-full disabled:opacity-50">
          {cargando ? t.entrando : t.entrar}
        </button>
      </form>

      <SeparadorCuenta texto={t.o} />

      <BotonGoogle onClick={iniciarConGoogle} deshabilitado={cargando} texto={t.google} />

      <p className="mt-6 text-center text-[14px] text-[var(--muted)]">
        {t.sinCuenta}{" "}
        <Link href="/registro" className="font-semibold text-[var(--matrix)] underline-offset-4 hover:underline">
          {t.crear}
        </Link>
      </p>
    </MarcoCuenta>
  );
}
