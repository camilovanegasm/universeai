// Los metadatos viven en el layout porque la página es un componente de
// cliente (necesita router y estado para pasar de un paso a otro), y Next no
// deja exportar `metadata` desde un componente de cliente.
export const metadata = {
  title: "Cómo funciona Punti",
  description:
    "El manual de vuelo en cinco pasos: elegir un mundo, aprender, practicar, subir de rango y volver mañana.",
};

export default function LayoutComoFunciona({ children }: { children: React.ReactNode }) {
  return children;
}
