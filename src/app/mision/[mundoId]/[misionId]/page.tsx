"use client";

// Una misión del formato nuevo, para los pilotos. Carga el paquete publicado
// (o el de la semilla) y lo entrega al motor, JugarMision.
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";
import { cargarMision } from "@/lib/misiones/cargar";
import type { PaqueteMision } from "@/lib/misiones/tipos";
import PuntiPixel from "@/components/PuntiPixel";
import Cargando from "@/components/Cargando";
import JugarMision from "@/components/mision/JugarMision";

const TX: Record<Idioma, { noEncontrada: string; volver: string }> = {
  es: { noEncontrada: "No encontramos esa misión.", volver: "VOLVER AL MUNDO" },
  en: { noEncontrada: "We couldn't find that mission.", volver: "BACK TO THE WORLD" },
};

export default function MisionPage({ params }: { params: Promise<{ mundoId: string; misionId: string }> }) {
  const { mundoId, misionId } = use(params);
  const t = TX[useIdioma()];
  // undefined = cargando; null = no existe o no pasó el revisor.
  const [paquete, setPaquete] = useState<PaqueteMision | null | undefined>(undefined);

  useEffect(() => {
    let vigente = true;
    cargarMision(misionId).then((p) => {
      if (vigente) setPaquete(p && p.mundo === mundoId ? p : null);
    });
    return () => {
      vigente = false;
    };
  }, [misionId, mundoId]);

  if (paquete === undefined) return <Cargando />;
  if (!paquete) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <PuntiPixel estado="error" ancho={112} />
        <p className="font-[family-name:var(--font-ui)] text-lg font-bold text-white">{t.noEncontrada}</p>
        <Link href={`/tema/${mundoId}`} transitionTypes={["atras"]} className="boton-pixel">
          {t.volver}
        </Link>
      </div>
    );
  }
  return <JugarMision key={paquete.id} paquete={paquete} mundoId={mundoId} volver={`/tema/${mundoId}`} />;
}
