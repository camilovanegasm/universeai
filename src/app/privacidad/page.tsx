"use client";

import PaginaLegal, { type TextoLegal } from "@/components/PaginaLegal";
import type { Idioma } from "@/lib/i18n";

// Política de privacidad de Punti. Describe lo que la app hace de verdad con
// los datos (revisar si cambia: Firebase, Vercel, lista de espera, pagos).
// Base legal: Ley 1581 de 2012 de Colombia (habeas data) y su reglamentación.
// No es asesoría legal: conviene que la revise un abogado antes de cobrar.

const CORREO = "camilovanegasm@gmail.com";

const TEXTOS: Record<Idioma, TextoLegal> = {
  es: {
    titulo: "Política de privacidad",
    actualizado: "Última actualización: 23 de septiembre de 2026",
    intro:
      "Punti (punti.space) es una escuela gratuita para aprender inteligencia artificial. Aquí te contamos, sin letra pequeña, qué datos tuyos guardamos, para qué, con quién los compartimos y cómo puedes pedir que los cambiemos o los borremos.",
    secciones: [
      {
        titulo: "1. Quién es responsable de tus datos",
        parrafos: [
          `El responsable del tratamiento es Camilo Vanegas, creador de Punti, en Colombia. Para cualquier tema de datos personales escríbenos a ${CORREO}.`,
        ],
      },
      {
        titulo: "2. Qué datos guardamos",
        parrafos: [
          "Tu cuenta: tu nombre y tu correo. Si entras con Google, recibimos de Google tu nombre y tu correo. Tu contraseña la maneja Firebase Authentication (de Google): Punti nunca la ve ni la guarda.",
          "Tu avance: XP, rango, racha, gasolina, las lecciones que completaste con su nota y tiempo, tu idioma y si eres miembro de Punti Club.",
          "La lista de espera de Punti Club, si te anotas: tu correo, el plan y la moneda que elegiste y la fecha.",
          "En tu navegador guardamos tu idioma y si el sonido está encendido, y Firebase guarda lo necesario para mantener tu sesión abierta. No usamos cookies de publicidad.",
          "Lo que escribes en los ejercicios de 'escribe tu prompt' no se guarda: solo se revisa en tu pantalla que tenga un largo mínimo.",
          "Como cualquier sitio web, los servidores de Vercel y Google registran datos técnicos (como la dirección IP y el tipo de navegador) por seguridad y para que el servicio funcione.",
        ],
      },
      {
        titulo: "3. Para qué los usamos",
        parrafos: [
          "Para crear y proteger tu cuenta, guardar tu avance, mostrarte tus rangos y tu racha, y avisarte sobre Punti Club si te anotaste.",
          "No vendemos tus datos, no mostramos publicidad y no los usamos para entrenar modelos de inteligencia artificial.",
        ],
      },
      {
        titulo: "4. Tu autorización",
        parrafos: [
          "Al crear tu cuenta nos autorizas a tratar tus datos para lo que explica esta política. Puedes revocar esa autorización cuando quieras (sección 7).",
        ],
      },
      {
        titulo: "5. Con quién los compartimos",
        parrafos: [
          "Solo con los servicios que hacen funcionar Punti, que actúan como encargados: Google Firebase (cuentas y base de datos) y Vercel (el alojamiento del sitio). Sus servidores pueden estar fuera de Colombia, por ejemplo en Estados Unidos.",
          "Cuando Punti Club empiece a cobrar, los pagos los procesará una pasarela de pago; Punti no verá ni guardará los datos de tu tarjeta. Actualizaremos esta política antes de ese momento.",
          "No compartimos tus datos con nadie más, salvo que una autoridad lo exija conforme a la ley.",
        ],
      },
      {
        titulo: "6. Cuánto tiempo los guardamos",
        parrafos: [
          "Mientras tengas tu cuenta. Si pides borrarla, eliminamos tu perfil, tu avance y tu anotación en la lista de espera.",
        ],
      },
      {
        titulo: "7. Tus derechos",
        parrafos: [
          "Según la Ley 1581 de 2012 tienes derecho a conocer, actualizar y corregir tus datos; pedir prueba de la autorización que nos diste; saber cómo los usamos; revocar la autorización y pedir que los borremos; acceder a ellos gratis; y presentar quejas ante la Superintendencia de Industria y Comercio (SIC).",
          `Para ejercerlos escríbenos a ${CORREO} desde el correo de tu cuenta. Respondemos las consultas en máximo 10 días hábiles y los reclamos (como corregir o borrar datos) en máximo 15 días hábiles.`,
        ],
      },
      {
        titulo: "8. Niñas, niños y adolescentes",
        parrafos: [
          "Punti no está dirigido a menores de 13 años. Si tienes entre 13 y 17 años, usa Punti con permiso de tu madre, padre o acudiente.",
          `Si eres madre, padre o acudiente y crees que un menor de 13 años creó una cuenta, escríbenos a ${CORREO} y la borramos.`,
        ],
      },
      {
        titulo: "9. Seguridad",
        parrafos: [
          "Usamos conexiones cifradas (HTTPS) y reglas de seguridad en la base de datos: cada persona solo puede ver y cambiar su propia información, y solo el administrador de Punti puede ver la de todos. Ningún sistema es perfecto, pero trabajamos para proteger tus datos.",
        ],
      },
      {
        titulo: "10. Cambios a esta política",
        parrafos: [
          "Si cambiamos algo importante, lo publicaremos aquí con una fecha nueva y te avisaremos dentro de la app.",
        ],
      },
    ],
  },
  en: {
    titulo: "Privacy policy",
    actualizado: "Last updated: September 23, 2026",
    intro:
      "Punti (punti.space) is a free school for learning artificial intelligence. Here's, with no fine print, what data we keep about you, why, who we share it with and how you can ask us to change or delete it.",
    secciones: [
      {
        titulo: "1. Who is responsible for your data",
        parrafos: [
          `The data controller is Camilo Vanegas, creator of Punti, in Colombia. For anything about your personal data, email ${CORREO}.`,
        ],
      },
      {
        titulo: "2. What data we keep",
        parrafos: [
          "Your account: your name and email. If you sign in with Google, Google gives us your name and email. Your password is handled by Firebase Authentication (by Google): Punti never sees or stores it.",
          "Your progress: XP, rank, streak, fuel, the lessons you completed with their score and time, your language, and whether you're a Punti Club member.",
          "The Punti Club waitlist, if you join: your email, the plan and currency you picked, and the date.",
          "In your browser we store your language and whether sound is on, and Firebase stores what it needs to keep you signed in. We don't use advertising cookies.",
          "What you type in 'write your prompt' exercises is not saved: it's only checked on your screen for a minimum length.",
          "Like any website, Vercel's and Google's servers log technical data (such as IP address and browser type) for security and to keep the service running.",
        ],
      },
      {
        titulo: "3. What we use it for",
        parrafos: [
          "To create and protect your account, save your progress, show your ranks and streak, and tell you about Punti Club if you joined the waitlist.",
          "We don't sell your data, we don't show ads, and we don't use it to train artificial intelligence models.",
        ],
      },
      {
        titulo: "4. Your consent",
        parrafos: [
          "By creating an account you authorize us to process your data as this policy explains. You can withdraw that consent anytime (section 7).",
        ],
      },
      {
        titulo: "5. Who we share it with",
        parrafos: [
          "Only with the services that run Punti, acting as processors: Google Firebase (accounts and database) and Vercel (site hosting). Their servers may be outside Colombia, for example in the United States.",
          "When Punti Club starts charging, payments will be handled by a payment provider; Punti will never see or store your card details. We'll update this policy before then.",
          "We don't share your data with anyone else, unless an authority requires it under the law.",
        ],
      },
      {
        titulo: "6. How long we keep it",
        parrafos: ["As long as you have your account. If you ask us to delete it, we delete your profile, your progress and your waitlist entry."],
      },
      {
        titulo: "7. Your rights",
        parrafos: [
          "Under Colombian Law 1581 of 2012 you have the right to access, update and correct your data; ask for proof of your consent; know how we use it; withdraw consent and ask us to delete it; access it for free; and file complaints with the Superintendence of Industry and Commerce (SIC).",
          `To use these rights, email ${CORREO} from your account's email. We answer inquiries within 10 business days and claims (such as correcting or deleting data) within 15 business days.`,
        ],
      },
      {
        titulo: "8. Children and teens",
        parrafos: [
          "Punti is not meant for children under 13. If you're between 13 and 17, use Punti with permission from a parent or guardian.",
          `If you're a parent or guardian and think a child under 13 created an account, email ${CORREO} and we'll delete it.`,
        ],
      },
      {
        titulo: "9. Security",
        parrafos: [
          "We use encrypted connections (HTTPS) and database security rules: each person can only see and change their own information, and only Punti's administrator can see everyone's. No system is perfect, but we work to protect your data.",
        ],
      },
      {
        titulo: "10. Changes to this policy",
        parrafos: ["If we change anything important, we'll publish it here with a new date and let you know inside the app."],
      },
    ],
  },
};

export default function PrivacidadPage() {
  return <PaginaLegal textos={TEXTOS} />;
}
