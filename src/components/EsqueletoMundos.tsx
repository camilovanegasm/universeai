/**
 * La forma de la pantalla de mundos mientras llega el progreso.
 *
 * Mismas medidas que las tarjetas reales, a propósito: cuando llega el
 * contenido, nada salta de lugar. Un cargador centrado y luego una grilla
 * completa obliga al ojo a reubicarse; un esqueleto con la misma forma no.
 */
export default function EsqueletoMundos({ cuantos = 6 }: { cuantos?: number }) {
  return (
    <div className="flex flex-1 flex-col" aria-hidden="true">
      <div className="border-b-2 border-[var(--color-panel-border)] bg-[rgba(5,5,16,0.94)]">
        <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="esqueleto h-[48px] w-[48px]" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="esqueleto h-3 w-40" />
            <div className="esqueleto h-3 w-24" />
          </div>
          <div className="esqueleto hidden h-4 w-28 sm:block" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-7 sm:px-6">
        <div className="esqueleto h-4 w-48" />
        <div className="esqueleto mt-4 h-6 w-64" />
        <div className="esqueleto mt-4 h-4 w-full max-w-[54ch]" />
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cuantos }, (_, i) => (
            <div key={i} className="flex flex-col border-2 border-[var(--color-panel-border)] p-4" style={{ ["--retraso" as string]: `${i * 90}ms` } as React.CSSProperties}>
              <div className="flex justify-between">
                <div className="esqueleto h-3 w-24" />
                <div className="esqueleto h-5 w-20" />
              </div>
              <div className="flex h-[184px] items-center justify-center">
                <div className="esqueleto h-[116px] w-[116px] rounded-full" />
              </div>
              <div className="esqueleto h-4 w-3/4" />
              <div className="esqueleto mt-3 h-3 w-full" />
              <div className="esqueleto mt-2 h-3 w-2/3" />
              <div className="esqueleto mt-5 h-3 w-full" />
              <div className="esqueleto mt-4 h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
