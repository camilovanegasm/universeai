import { ViewTransition } from "react";

/**
 * Cómo entra y sale cada pantalla.
 *
 * Un template, a diferencia de un layout, se vuelve a montar en cada
 * navegación. Por eso la transición se pone aquí una sola vez y no en cada
 * página: el layout persiste y nunca dispararía entrada ni salida.
 *
 * La dirección no es decorativa, codifica dónde estás:
 *   - "adelante" (entrar a un mundo, a una lección, al perfil): el contenido
 *     viejo sale por la izquierda y el nuevo entra por la derecha.
 *   - "atras" (volver a los mundos): al revés.
 *   - sin tipo (botón atrás del navegador, enlaces de la portada): un fundido
 *     corto. El navegador no dice hacia dónde fue, así que no se inventa.
 *
 * Los enlaces y los router.push marcan su tipo con `transitionTypes`.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ adelante: "adelante", atras: "atras", default: "fundido" }}
      exit={{ adelante: "adelante", atras: "atras", default: "fundido" }}
      default="none"
    >
      <div className="flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
