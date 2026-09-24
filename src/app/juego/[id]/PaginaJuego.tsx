"use client";

import { Suspense, use } from "react";
import { notFound } from "next/navigation";
import { buscarJuego } from "@/lib/juegos/catalogo";
import MarcoJuego from "@/components/juegos/MarcoJuego";
import Cargando from "@/components/Cargando";

/** Un minijuego: /juego/punti-flap, /juego/caza-la-estafa… */
export default function JuegoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const juego = buscarJuego(id);
  if (!juego) notFound();
  // MarcoJuego lee ?volver= de la dirección; Next pide un Suspense alrededor.
  return (
    <Suspense fallback={<Cargando />}>
      <MarcoJuego key={juego.id} juego={juego} />
    </Suspense>
  );
}
