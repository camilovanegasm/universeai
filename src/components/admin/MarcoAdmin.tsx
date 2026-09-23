"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { esAdmin } from "@/lib/admin";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import CampoEstelar from "@/components/CampoEstelar";

/**
 * El marco de todas las pantallas del admin: revisa que quien entra sea el
 * admin y pone la cabecera con las pestañas Pilotos / Contenido.
 *
 * Esconder estas pantallas no es la seguridad: la seguridad son las reglas de
 * Firestore. Esto solo evita mostrarle a alguien una pantalla que no le va a
 * funcionar.
 */
export default function MarcoAdmin({
  children,
  acciones,
  ancho = 1040,
}: {
  children: React.ReactNode;
  /** botones a la derecha de la cabecera */
  acciones?: React.ReactNode;
  ancho?: number;
}) {
  const router = useRouter();
  const ruta = usePathname();
  const { usuario, cargando } = useAuth();

  useEffect(() => {
    if (!cargando && !usuario) router.replace("/login");
  }, [cargando, usuario, router]);

  if (cargando || !usuario) return <Cargando />;

  if (!esAdmin(usuario)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <PuntiPixel estado="error" ancho={112} />
        <p className="font-[family-name:var(--font-pixel)] text-[11px] text-[var(--pink)]">ZONA RESTRINGIDA</p>
        <p className="max-w-[40ch] text-[15px] text-[var(--muted)]">Esta estación es solo para el equipo de Punti.</p>
        <Link href="/inicio" transitionTypes={["atras"]} className="boton-pixel">
          MUNDOS
        </Link>
      </div>
    );
  }

  const pestanas = [
    { href: "/admin", texto: "PILOTOS", activa: ruta === "/admin" },
    { href: "/admin/contenido", texto: "CONTENIDO", activa: ruta.startsWith("/admin/contenido") },
  ];

  return (
    <div className="relative flex flex-1 flex-col">
      <CampoEstelar className="pointer-events-none fixed inset-0 -z-10" />
      <header className="sticky top-0 z-20 border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.95)] backdrop-blur">
        <div className="mx-auto flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6" style={{ maxWidth: ancho }}>
          <Link href="/perfil" transitionTypes={["atras"]} className="btn-admin">
            ← PERFIL
          </Link>
          <PuntiPixel estado="info" recorte="cabeza" ancho={44} flotando={false} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-[family-name:var(--font-pixel)] text-[10px] leading-[1.6] text-[var(--matrix)]">
              ESTACION DE CONTROL
            </p>
            <nav className="mt-1 flex gap-1" aria-label="Secciones del admin">
              {pestanas.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  aria-current={p.activa ? "page" : undefined}
                  className={`border-b-2 px-2 py-0.5 font-[family-name:var(--font-terminal)] text-[15px] tracking-[0.12em] transition-colors ${
                    p.activa
                      ? "border-[var(--matrix)] text-[var(--matrix)]"
                      : "border-transparent text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {p.texto}
                </Link>
              ))}
            </nav>
          </div>
          {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}
