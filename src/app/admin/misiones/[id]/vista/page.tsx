"use client";

// Vista previa del BORRADOR de una misión, jugable, para el admin.
// No gasta gasolina ni guarda progreso (JugarMision en modo `vista`).
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { esAdmin } from "@/lib/admin";
import { leerBorrador } from "@/lib/misiones/admin";
import { revisarPaquete } from "@/lib/misiones/revisar.mjs";
import type { PaqueteMision } from "@/lib/misiones/tipos";
import Cargando from "@/components/Cargando";
import JugarMision from "@/components/mision/JugarMision";

export default function VistaMisionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { usuario, cargando } = useAuth();
  const [paquete, setPaquete] = useState<PaqueteMision | null | undefined>(undefined);
  const admin = esAdmin(usuario);

  useEffect(() => {
    if (!cargando && !admin) router.replace("/inicio");
  }, [cargando, admin, router]);

  useEffect(() => {
    if (!admin) return;
    let vigente = true;
    leerBorrador(id)
      .then((p) => {
        if (vigente) setPaquete(p && revisarPaquete(p).errores.length === 0 ? p : null);
      })
      .catch(() => vigente && setPaquete(null));
    return () => {
      vigente = false;
    };
  }, [id, admin]);

  if (cargando || !admin || paquete === undefined) return <Cargando />;
  if (!paquete) {
    return (
      <div className="grid flex-1 place-content-center gap-4 px-6 text-center">
        <p className="text-white">El borrador no existe o tiene errores. Corrígelos antes de jugarlo.</p>
        <Link href={`/admin/misiones/${id}`} className="btn-admin justify-self-center">← VOLVER AL ADMIN</Link>
      </div>
    );
  }
  return <JugarMision key={`${paquete.id}-vista`} paquete={paquete} mundoId={paquete.mundo} volver={`/admin/misiones/${id}`} vista />;
}
