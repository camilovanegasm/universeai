"use client";

import { useRouter } from "next/navigation";
import ComoFunciona from "@/components/ComoFunciona";
import SelectorIdioma from "@/components/SelectorIdioma";
import { useIdioma } from "@/lib/useIdioma";

export default function ComoFuncionaPage() {
  const router = useRouter();
  const idioma = useIdioma();

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <p className="font-[family-name:var(--font-terminal)] text-[19px] uppercase tracking-[0.3em] text-[var(--matrix)]">
          {idioma === "en" ? "// Flight manual" : "// Manual de vuelo"}
        </p>
        <SelectorIdioma />
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        {/* Sin `key` a propósito: si alguien cambia de idioma en el paso 3,
            sigue en el paso 3. Volver al 1 obligaría a recorrer todo otra vez. */}
        <ComoFunciona idioma={idioma} alTerminar={() => router.push("/inicio")} />
      </div>
    </main>
  );
}
