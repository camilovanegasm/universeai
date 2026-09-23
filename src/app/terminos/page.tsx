"use client";

import PaginaLegal, { type TextoLegal } from "@/components/PaginaLegal";
import type { Idioma } from "@/lib/i18n";

// Términos de uso de Punti. Escritos en lenguaje simple. Antes de que Punti
// Club empiece a cobrar hay que agregar las condiciones de pago (precio,
// renovación, cancelación y derecho de retracto) y conviene que los revise
// un abogado. No es asesoría legal.

const CORREO = "camilovanegasm@gmail.com";

const TEXTOS: Record<Idioma, TextoLegal> = {
  es: {
    titulo: "Términos de uso",
    actualizado: "Última actualización: 23 de septiembre de 2026",
    intro:
      "Estas son las reglas para usar Punti (punti.space). Al crear una cuenta o usar el sitio, las aceptas. Si algo no te queda claro, escríbenos.",
    secciones: [
      {
        titulo: "1. Qué es Punti",
        parrafos: [
          "Punti es una escuela en línea para aprender inteligencia artificial con lecciones cortas, ejercicios, XP, rangos y rachas. La creó y la opera Camilo Vanegas, en Colombia.",
        ],
      },
      {
        titulo: "2. Tu cuenta",
        parrafos: [
          "Necesitas tener al menos 13 años. Si tienes entre 13 y 17, usa Punti con permiso de tu madre, padre o acudiente.",
          "Usa datos reales, una cuenta por persona, y cuida tu contraseña. Eres responsable de lo que se haga con tu cuenta.",
        ],
      },
      {
        titulo: "3. Úsalo con buena fe",
        parrafos: [
          "No intentes hacer trampa con el XP, la gasolina o los rangos; no ataques ni sobrecargues el sitio; no copies el contenido de forma automática; y no uses Punti para molestar a otras personas. Si lo haces, podemos suspender tu cuenta.",
        ],
      },
      {
        titulo: "4. El contenido es para aprender",
        parrafos: [
          "Las lecciones explican temas de inteligencia artificial de forma sencilla. La IA cambia muy rápido: revisamos el contenido seguido, pero algún dato puede quedar desactualizado. Verifica lo importante en fuentes oficiales.",
          "Nada en Punti es asesoría profesional médica, legal, financiera ni de ningún otro tipo.",
        ],
      },
      {
        titulo: "5. De quién es cada cosa",
        parrafos: [
          "Las lecciones, los ejercicios, el personaje Punti, las insignias y el diseño del sitio son de Punti. Puedes usarlos para aprender; no los copies ni los publiques como propios sin permiso.",
          "Lo que tú crees al hacer las tareas con otras herramientas de IA es tuyo, según los términos de esas herramientas.",
          "Punti menciona marcas y productos de otras empresas (como ChatGPT, Gemini o Claude) solo para enseñar. Cada una tiene sus propios términos y Punti no tiene relación comercial con ellas.",
        ],
      },
      {
        titulo: "6. Gratis y Punti Club",
        parrafos: [
          "Lo esencial de Punti es gratis. Punti Club será una suscripción opcional con beneficios extra. Hoy solo existe la lista de espera y no se cobra nada.",
          "Antes de empezar a cobrar publicaremos las condiciones del Club: precio, renovación, cómo cancelar y tu derecho de retracto según la ley colombiana.",
        ],
      },
      {
        titulo: "7. Cambios y disponibilidad",
        parrafos: [
          "Punti puede cambiar, agregar o quitar lecciones y funciones, o dejar de estar disponible por un tiempo por mantenimiento. Haremos lo posible por avisar con tiempo los cambios importantes.",
        ],
      },
      {
        titulo: "8. Responsabilidad",
        parrafos: [
          "Punti se ofrece tal como está. En la medida en que la ley lo permita, no respondemos por daños indirectos derivados del uso del sitio o de decisiones tomadas con base en su contenido. Esto no limita los derechos que la ley colombiana te da como consumidor.",
        ],
      },
      {
        titulo: "9. Ley aplicable",
        parrafos: ["Estos términos se rigen por las leyes de Colombia."],
      },
      {
        titulo: "10. Cambios a estos términos y contacto",
        parrafos: [
          `Si cambiamos algo importante, lo publicaremos aquí con una fecha nueva. Para cualquier pregunta, escríbenos a ${CORREO}.`,
          "Cómo tratamos tus datos está en la Política de privacidad (punti.space/privacidad).",
        ],
      },
    ],
  },
  en: {
    titulo: "Terms of use",
    actualizado: "Last updated: September 23, 2026",
    intro:
      "These are the rules for using Punti (punti.space). By creating an account or using the site, you accept them. If anything is unclear, email us.",
    secciones: [
      {
        titulo: "1. What Punti is",
        parrafos: [
          "Punti is an online school for learning artificial intelligence with short lessons, exercises, XP, ranks and streaks. It was created and is run by Camilo Vanegas, in Colombia.",
        ],
      },
      {
        titulo: "2. Your account",
        parrafos: [
          "You must be at least 13. If you're between 13 and 17, use Punti with permission from a parent or guardian.",
          "Use real details, one account per person, and keep your password safe. You're responsible for what happens with your account.",
        ],
      },
      {
        titulo: "3. Use it in good faith",
        parrafos: [
          "Don't try to cheat XP, fuel or ranks; don't attack or overload the site; don't scrape the content; and don't use Punti to harass anyone. If you do, we may suspend your account.",
        ],
      },
      {
        titulo: "4. The content is for learning",
        parrafos: [
          "Lessons explain artificial intelligence topics in simple terms. AI changes very fast: we review the content often, but some facts may become outdated. Check important things with official sources.",
          "Nothing on Punti is professional medical, legal, financial or any other kind of advice.",
        ],
      },
      {
        titulo: "5. Who owns what",
        parrafos: [
          "The lessons, exercises, the Punti character, the badges and the site design belong to Punti. You can use them to learn; don't copy them or publish them as your own without permission.",
          "What you create while doing the tasks with other AI tools is yours, under those tools' terms.",
          "Punti mentions other companies' brands and products (like ChatGPT, Gemini or Claude) only to teach. Each has its own terms, and Punti has no business relationship with them.",
        ],
      },
      {
        titulo: "6. Free and Punti Club",
        parrafos: [
          "Punti's essentials are free. Punti Club will be an optional subscription with extra benefits. Right now there is only a waitlist and nothing is charged.",
          "Before charging, we'll publish the Club terms: price, renewal, how to cancel, and your right of withdrawal under Colombian law.",
        ],
      },
      {
        titulo: "7. Changes and availability",
        parrafos: [
          "Punti may change, add or remove lessons and features, or be unavailable for a while for maintenance. We'll do our best to give notice of important changes.",
        ],
      },
      {
        titulo: "8. Liability",
        parrafos: [
          "Punti is provided as is. To the extent the law allows, we're not liable for indirect damages from using the site or from decisions based on its content. This doesn't limit your rights as a consumer under Colombian law.",
        ],
      },
      {
        titulo: "9. Governing law",
        parrafos: ["These terms are governed by the laws of Colombia."],
      },
      {
        titulo: "10. Changes to these terms and contact",
        parrafos: [
          `If we change anything important, we'll publish it here with a new date. For any question, email ${CORREO}.`,
          "How we handle your data is in the Privacy policy (punti.space/privacidad).",
        ],
      },
    ],
  },
};

export default function TerminosPage() {
  return <PaginaLegal textos={TEXTOS} />;
}
