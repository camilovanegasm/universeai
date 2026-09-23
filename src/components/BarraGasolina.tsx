/**
 * La barra de gasolina, en segmentos.
 *
 * La gasolina puede quedar en medias (pedir una pista cuesta media), así que
 * cada segmento puede estar lleno, a la mitad o vacío. Antes la barra solo
 * preguntaba si el segmento estaba "por debajo" del número, y con 4,5 de
 * gasolina mostraba los 5 segmentos llenos.
 */
export default function BarraGasolina({
  gasolina,
  maximo,
  etiqueta,
  alto = 16,
}: {
  gasolina: number;
  maximo: number;
  etiqueta: string;
  alto?: number;
}) {
  return (
    <span className="flex gap-[3px]" role="img" aria-label={etiqueta}>
      {Array.from({ length: maximo }, (_, k) => {
        const lleno = gasolina >= k + 1;
        const medio = !lleno && gasolina > k;
        return (
          <i
            key={k}
            className="relative block w-[9px] overflow-hidden bg-[rgba(255,255,255,0.12)]"
            style={{ height: alto }}
          >
            {(lleno || medio) && (
              <span
                className="absolute inset-x-0 bottom-0 block bg-[var(--gold)] shadow-[0_0_7px_rgba(255,230,0,0.75)]"
                style={{ height: lleno ? "100%" : "50%" }}
              />
            )}
          </i>
        );
      })}
    </span>
  );
}
