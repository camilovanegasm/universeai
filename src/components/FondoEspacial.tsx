// Fondo fijo detrás de toda la app: degradado oscuro + nebulosas de color + polvo de estrellas.
// Se pone una sola vez en el layout para que todas las páginas compartan el mismo "universo".
export default function FondoEspacial() {
  return (
    <div className="fondo-espacial" aria-hidden="true">
      <div className="estrellas" />
    </div>
  );
}
