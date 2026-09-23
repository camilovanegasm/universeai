"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { crearPerfilSiNoExiste } from "@/lib/userProfile";
import { traducirErrorAuth } from "@/lib/authErrors";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";
import BotonGoogle from "@/components/BotonGoogle";
import MarcoCuenta, { AvisoCuenta, CampoCuenta, SeparadorCuenta } from "@/components/MarcoCuenta";

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    titulo: "Crea tu cuenta",
    sub: "Es gratis y toma un minuto",
    nombre: "Tu nombre",
    correo: "Correo electrónico",
    clave: "Contraseña (mínimo 6 caracteres)",
    crear: "CREAR CUENTA",
    creando: "CREANDO...",
    o: "o",
    google: "Registrarse con Google",
    conCuenta: "¿Ya tienes cuenta?",
    entrar: "Entra aquí",
  },
  en: {
    titulo: "Create your account",
    sub: "It's free and takes a minute",
    nombre: "Your name",
    correo: "Email",
    clave: "Password (at least 6 characters)",
    crear: "CREATE ACCOUNT",
    creando: "CREATING...",
    o: "or",
    google: "Sign up with Google",
    conCuenta: "Already have an account?",
    entrar: "Sign in",
  },
};

export default function RegistroPage() {
  const router = useRouter();
  const idioma = useIdioma();
  const t = TX[idioma];
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigoError, setCodigoError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const leerCodigo = (err: unknown) =>
    err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    setCodigoError(null);
    setCargando(true);
    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, password);
      if (nombre.trim()) {
        await updateProfile(credencial.user, { displayName: nombre.trim() });
      }
      await crearPerfilSiNoExiste(credencial.user);
      router.push("/bienvenida");
    } catch (err) {
      setCodigoError(leerCodigo(err));
    } finally {
      setCargando(false);
    }
  }

  async function registrarseConGoogle() {
    setCodigoError(null);
    setCargando(true);
    try {
      const resultado = await signInWithPopup(auth, new GoogleAuthProvider());
      await crearPerfilSiNoExiste(resultado.user);
      router.push("/bienvenida");
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
          type="text"
          required
          autoComplete="name"
          placeholder={t.nombre}
          aria-label={t.nombre}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
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
          minLength={6}
          autoComplete="new-password"
          placeholder={t.clave}
          aria-label={t.clave}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {codigoError !== null && <AvisoCuenta texto={traducirErrorAuth(codigoError, idioma)} />}

        <button type="submit" disabled={cargando} className="boton-pixel boton-pixel-lleno mt-1 w-full disabled:opacity-50">
          {cargando ? t.creando : t.crear}
        </button>
      </form>

      <SeparadorCuenta texto={t.o} />

      <BotonGoogle onClick={registrarseConGoogle} deshabilitado={cargando} texto={t.google} />

      <p className="mt-6 text-center text-[14px] text-[var(--muted)]">
        {t.conCuenta}{" "}
        <Link href="/login" className="font-semibold text-[var(--matrix)] underline-offset-4 hover:underline">
          {t.entrar}
        </Link>
      </p>
    </MarcoCuenta>
  );
}
