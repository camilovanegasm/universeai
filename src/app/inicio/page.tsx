"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import {
  calcularXp,
  completarLeccion,
  corazonesEfectivos,
  rachaEfectiva,
  restarCorazon,
} from "@/lib/progreso";
import Cache, { type EstadoCache } from "@/components/Cache";

const LECCION_DE_PRUEBA = "leccion-prueba";

export default function InicioPage() {
  const router = useRouter();
  const { usuario, cargando } = useAuth();
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [accionEnCurso, setAccionEnCurso] = useState<string | null>(null);
  const [estadoCache, setEstadoCache] = useState<EstadoCache>("online");

  useEffect(() => {
    if (!cargando && !usuario) {
      router.push("/login");
    }
  }, [cargando, usuario, router]);

  useEffect(() => {
    if (!usuario) return;
    let vigente = true;
    obtenerPerfil(usuario.uid).then((datos) => {
      if (vigente) setPerfil(datos);
    });
    return () => {
      vigente = false;
    };
  }, [usuario]);

  // Cache reacciona un momento a lo que acaba de pasar y luego vuelve a su estado normal.
  function mostrarReaccion(estado: EstadoCache) {
    setEstadoCache(estado);
    setTimeout(() => setEstadoCache("online"), 2500);
  }

  async function simularLeccion(errores: number, tiempoSegundos: number) {
    if (!usuario) return;
    setAccionEnCurso("leccion");
    setEstadoCache("loading");
    try {
      const resultado = { errores, tiempoSegundos, tiempoObjetivoSegundos: 90 };
      const { combustible } = calcularXp(resultado);
      await completarLeccion(usuario.uid, LECCION_DE_PRUEBA, resultado);
      const datos = await obtenerPerfil(usuario.uid);
      setPerfil(datos);
      mostrarReaccion(combustible === 3 ? "hype" : "levelup");
    } finally {
      setAccionEnCurso(null);
    }
  }

  async function simularFallo() {
    if (!usuario) return;
    setAccionEnCurso("fallo");
    setEstadoCache("loading");
    try {
      await restarCorazon(usuario.uid);
      const datos = await obtenerPerfil(usuario.uid);
      setPerfil(datos);
      mostrarReaccion("battery");
    } finally {
      setAccionEnCurso(null);
    }
  }

  if (cargando || !usuario) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="font-[family-name:var(--font-terminal)] text-xl text-[var(--matrix)]">
          Cargando...
        </p>
      </div>
    );
  }

  const corazones = perfil ? corazonesEfectivos(perfil) : 0;
  const racha = perfil ? rachaEfectiva(perfil) : 0;

  return (
    <div className="flex flex-1 flex-col">
      <header className="tarjeta-espacial mx-4 mt-4 flex items-center justify-between rounded-2xl px-6 py-4 sm:mx-6">
        <h1 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--matrix)]">
          UniverseAI
        </h1>
        <div className="flex items-center gap-4 font-[family-name:var(--font-ui)] text-sm font-bold text-white">
          <span title="XP" className="text-[var(--gold)]">⭐ {perfil?.xp ?? 0} XP</span>
          <span title="Corazones">❤️ {corazones}</span>
          <span title="Racha">🔥 {racha}</span>
          <button
            onClick={() => signOut(auth)}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-white hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <Cache estado={estadoCache} tamano={130} />

        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
            ¡Bienvenido{perfil?.nombre ? `, ${perfil.nombre}` : ""}!
          </h2>
          <p className="mx-auto mt-2 max-w-md font-[family-name:var(--font-ui)] text-[var(--muted)]">
            Tu nave ya está lista. El mapa de niveles y la primera lección
            llegarán en el siguiente paso de construcción.
          </p>
        </div>

        <div className="tarjeta-espacial w-full max-w-md rounded-2xl p-6 text-left">
          <p className="mb-1 font-[family-name:var(--font-ui)] text-xs font-bold uppercase tracking-wide text-[var(--matrix)]">
            {"// Zona de pruebas (temporal)"}
          </p>
          <p className="mb-4 text-sm text-[var(--muted)]">
            Estos botones simulan terminar o fallar una lección, para probar que el
            combustible, el XP, los corazones y la racha se guardan bien en la base de
            datos. Se reemplazarán por la lección real más adelante.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => simularLeccion(0, 60)}
              disabled={accionEnCurso !== null}
              className="boton-matrix rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              Simular lección perfecta y rápida (tanque lleno + bono)
            </button>
            <button
              onClick={() => simularLeccion(1, 120)}
              disabled={accionEnCurso !== null}
              className="boton-matrix rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-50"
            >
              Simular lección con 1 error (sin bono de velocidad)
            </button>
            <button
              onClick={simularFallo}
              disabled={accionEnCurso !== null}
              className="rounded-lg border border-[var(--pink)]/40 bg-[var(--pink)]/10 px-4 py-2.5 text-sm font-bold text-[var(--pink)] hover:bg-[var(--pink)]/20 disabled:opacity-50"
            >
              Simular fallo (-1 corazón)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
