"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { obtenerPerfil, type PerfilUsuario } from "@/lib/userProfile";
import { corazonesEfectivos, rachaEfectiva } from "@/lib/progreso";
import { NIVELES } from "@/lib/niveles";
import Cache from "@/components/Cache";

// Un color distinto por nivel para que el "planeta" se sienta variado en el mapa.
const COLOR_POR_NIVEL = [
  "#00ff41", // 1 · verde Matrix
  "#00f5ff", // 2 · cian
  "#b400ff", // 3 · morado
  "#ff006e", // 4 · rosa
  "#ffe600", // 5 · amarillo
  "#4ade80", // 6 · verde suave
  "#818cf8", // 7 · índigo
];

// Posición horizontal (0-100, % del ancho) de cada planeta: un patrón asimétrico,
// no un zigzag parejo, para que el camino se sienta más orgánico/espacial.
const POSICION_X = [50, 74, 32, 62, 22, 80, 44];
const ESPACIADO_Y = 150; // separación vertical entre planetas, en px

function generarCurva(puntos: { x: number; y: number }[]): string {
  if (puntos.length === 0) return "";
  let d = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 1; i < puntos.length; i++) {
    const anterior = puntos[i - 1];
    const actual = puntos[i];
    const midY = (anterior.y + actual.y) / 2;
    d += ` C ${anterior.x} ${midY}, ${actual.x} ${midY}, ${actual.x} ${actual.y}`;
  }
  return d;
}

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
    if (!usuario) return;
    let vigente = true;
    obtenerPerfil(usuario.uid).then((datos) => {
      if (vigente) setPerfil(datos);
    });
    return () => {
      vigente = false;
    };
  }, [usuario]);

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

      <main className="flex flex-1 flex-col items-center px-6 py-10">
        <div className="mb-2 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-white">
            ¡Bienvenido{perfil?.nombre ? `, ${perfil.nombre}` : ""}!
          </h2>
          <p className="mt-1 font-[family-name:var(--font-ui)] text-[var(--muted)]">
            Elige un planeta para empezar tu viaje.
          </p>
        </div>

        <div
          className="relative w-full max-w-sm"
          style={{ height: NIVELES.length * ESPACIADO_Y }}
        >
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 100 ${NIVELES.length * ESPACIADO_Y}`}
            preserveAspectRatio="none"
          >
            <path
              d={generarCurva(
                NIVELES.map((_, indice) => ({
                  x: POSICION_X[indice % POSICION_X.length],
                  y: indice * ESPACIADO_Y + ESPACIADO_Y / 2,
                }))
              )}
              fill="none"
              stroke="var(--color-panel-border)"
              strokeWidth="2"
              strokeDasharray="4 6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {NIVELES.map((nivel, indice) => {
            const desbloqueado = nivel.disponible;
            const color = COLOR_POR_NIVEL[indice % COLOR_POR_NIVEL.length];
            const x = POSICION_X[indice % POSICION_X.length];
            const y = indice * ESPACIADO_Y + ESPACIADO_Y / 2;

            const nodo = (
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex items-center justify-center">
                  {indice === 0 && (
                    <Cache
                      estado="online"
                      tamano={56}
                      className="absolute -right-14 -top-6 hidden sm:block"
                    />
                  )}
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full font-[family-name:var(--font-display)] text-2xl font-bold"
                    style={
                      desbloqueado
                        ? {
                            background: `radial-gradient(circle at 35% 30%, ${color}55, #050510 75%)`,
                            border: `2px solid ${color}`,
                            boxShadow: `0 0 24px -4px ${color}aa`,
                            color: "white",
                          }
                        : {
                            background: "radial-gradient(circle at 35% 30%, #1a1a2e, #050510 75%)",
                            border: "2px solid rgba(255,255,255,0.12)",
                            color: "rgba(255,255,255,0.35)",
                          }
                    }
                  >
                    {desbloqueado ? nivel.numero : "🔒"}
                  </div>
                </div>
                <div className="max-w-[9rem] text-center">
                  <p
                    className="font-[family-name:var(--font-ui)] text-sm font-bold"
                    style={{ color: desbloqueado ? "white" : "rgba(255,255,255,0.4)" }}
                  >
                    {nivel.titulo}
                  </p>
                  {!desbloqueado && (
                    <p className="mt-0.5 font-[family-name:var(--font-terminal)] text-xs text-[var(--muted)]">
                      Próximamente
                    </p>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={nivel.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: y }}
              >
                {desbloqueado ? (
                  <Link href={`/leccion/${nivel.id}`} className="block transition-transform hover:scale-105">
                    {nodo}
                  </Link>
                ) : (
                  <div className="cursor-not-allowed opacity-90">{nodo}</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
