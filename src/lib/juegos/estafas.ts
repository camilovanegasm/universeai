// Mensajes de "Caza la estafa". Cada mensaje está partido en frases; las que
// son señal de estafa llevan `senal` con la explicación que se muestra si la
// persona la encuentra (o se le pasa). Los mensajes seguros no tienen señales:
// ahí lo correcto es no tocar nada.
//
// Reglas de contenido (voz de Punti): remitentes genéricos, nunca marcas ni
// personas reales; señales que se repiten en estafas de verdad (urgencia,
// secreto, pedir claves, enlaces raros, pagos imposibles de rastrear, voces y
// videos clonados). Los montos van en pesos colombianos en español y en
// dólares en inglés.
import type { Texto } from "../i18n";

export type Frase = { t: Texto; senal?: Texto };
export type Mensaje = { id: string; de: Texto; frases: Frase[] };

export const ESTAFAS: Mensaje[] = [
  {
    id: "voz-hijo",
    de: { es: "Número desconocido · nota de voz", en: "Unknown number · voice note" },
    frases: [
      { t: { es: "Mami, soy yo, se me dañó el celular.", en: "Mom, it's me, my phone broke." } },
      {
        t: { es: "Este es mi número nuevo.", en: "This is my new number." },
        senal: { es: "Número nuevo sin forma de comprobarlo. Llama al número de siempre antes de hacer nada.", en: "A new number you can't check. Call the usual number before doing anything." },
      },
      {
        t: { es: "Necesito que me transfieras 800.000 pesos", en: "I need you to send me $300" },
        senal: { es: "Pide plata. Con unos segundos de audio, una IA puede clonar la voz de alguien que quieres.", en: "It asks for money. With a few seconds of audio, an AI can clone the voice of someone you love." },
      },
      {
        t: { es: "ya mismo, es urgente.", en: "right now, it's urgent." },
        senal: { es: "Urgencia: la prisa es para que no pienses ni preguntes.", en: "Urgency: the rush is so you don't stop and ask." },
      },
      {
        t: { es: "No le cuentes a papá.", en: "Don't tell Dad." },
        senal: { es: "Te pide secreto para que nadie te ayude a darte cuenta.", en: "It asks for secrecy so nobody can help you notice." },
      },
    ],
  },
  {
    id: "banco-sms",
    de: { es: "SMS · TU BANCO", en: "Text · YOUR BANK" },
    frases: [
      { t: { es: "Detectamos un movimiento extraño en tu cuenta.", en: "We detected unusual activity on your account." } },
      {
        t: { es: "Se bloqueará en 1 hora", en: "It will be locked in 1 hour" },
        senal: { es: "Amenaza con plazo corto: presión para que actúes sin pensar.", en: "A threat with a short deadline: pressure to act without thinking." },
      },
      {
        t: { es: "si no confirmas tu clave y el código que te llegó", en: "unless you confirm your password and the code we sent" },
        senal: { es: "Ningún banco te pide la clave ni el código por mensaje.", en: "No bank asks for your password or code by message." },
      },
      {
        t: { es: "en bit.ly/tubanco-seguro", en: "at bit.ly/yourbank-secure" },
        senal: { es: "Enlace acortado que esconde a dónde te lleva. Entra siempre desde la app oficial.", en: "A shortened link that hides where it goes. Always use the official app." },
      },
    ],
  },
  {
    id: "video-inversion",
    de: { es: "Video en redes sociales", en: "Social media video" },
    frases: [
      { t: { es: "Un presentador famoso habla de su nueva plataforma con IA.", en: "A famous TV host talks about his new AI platform." } },
      {
        t: { es: "Dice que duplica tu plata en una semana.", en: "He says it doubles your money in a week." },
        senal: { es: "Ganancia imposible y garantizada. Ninguna inversión seria promete eso.", en: "Impossible, guaranteed returns. No real investment promises that." },
      },
      {
        t: { es: "Su voz suena plana y la boca no va con las palabras.", en: "His voice sounds flat and his mouth doesn't match the words." },
        senal: { es: "Señales de un deepfake: voz robótica y labios que no coinciden.", en: "Deepfake signs: a robotic voice and lips that don't match." },
      },
      {
        t: { es: "Solo quedan 12 cupos.", en: "Only 12 spots left." },
        senal: { es: "Escasez falsa para apurarte.", en: "Fake scarcity to rush you." },
      },
      {
        t: { es: "Se paga con tarjetas de regalo.", en: "Payment is by gift card." },
        senal: { es: "Pago que no se puede rastrear ni devolver.", en: "A payment that can't be traced or refunded." },
      },
    ],
  },
  {
    id: "paquete",
    de: { es: "SMS · Mensajería", en: "Text · Delivery" },
    frases: [
      { t: { es: "Tu paquete está retenido en bodega.", en: "Your package is being held at the warehouse." } },
      {
        t: { es: "Paga 4.900 pesos de envío", en: "Pay a $2 shipping fee" },
        senal: { es: "Cobro pequeño e inesperado: lo que buscan son los datos de tu tarjeta.", en: "A small, unexpected fee: what they want is your card details." },
      },
      {
        t: { es: "en paquetes-entrega.xyz", en: "at parcel-delivery.xyz" },
        senal: { es: "Dirección rara que no es la de la empresa.", en: "A strange web address that isn't the company's." },
      },
      {
        t: { es: "hoy antes de las 6 p. m.", en: "today before 6 p.m." },
        senal: { es: "Otra vez la prisa.", en: "The rush again." },
      },
    ],
  },
  {
    id: "empleo",
    de: { es: "WhatsApp · Reclutadora", en: "WhatsApp · Recruiter" },
    frases: [
      { t: { es: "¡Hola! Vi tu perfil.", en: "Hi! I saw your profile." } },
      {
        t: { es: "Trabajo desde casa: dar 'me gusta' a videos.", en: "Work from home: liking videos." },
        senal: { es: "Trabajo demasiado fácil para lo que paga.", en: "A job that's way too easy for what it pays." },
      },
      {
        t: { es: "Ganas 300.000 pesos al día.", en: "You earn $100 a day." },
        senal: { es: "Pago irreal.", en: "Unrealistic pay." },
      },
      {
        t: { es: "Para empezar, paga 50.000 de inscripción.", en: "To start, pay a $20 sign-up fee." },
        senal: { es: "Te cobran por darte trabajo: al revés de como funciona.", en: "They charge you for a job: backwards from how it works." },
      },
      {
        t: { es: "Escríbeme solo por Telegram.", en: "Message me only on Telegram." },
        senal: { es: "Te sacan a otra app donde es más difícil reportarlos.", en: "They move you to another app where it's harder to report them." },
      },
    ],
  },
  {
    id: "jefe",
    de: { es: "Nota de voz · Tu jefe", en: "Voice note · Your boss" },
    frases: [
      { t: { es: "Necesito que le pagues hoy a un proveedor nuevo.", en: "I need you to pay a new supplier today." } },
      {
        t: { es: "Es confidencial, no lo comentes con nadie.", en: "It's confidential, don't mention it to anyone." },
        senal: { es: "Secreto: así nadie de la empresa lo puede frenar.", en: "Secrecy: so nobody at the company can stop it." },
      },
      {
        t: { es: "No me puedo conectar a videollamada ahora.", en: "I can't get on a video call right now." },
        senal: { es: "Evita que lo verifiques. Una voz clonada no aguanta una llamada de verdad.", en: "It avoids being checked. A cloned voice won't survive a real call." },
      },
      {
        t: { es: "Tiene que salir en los próximos 20 minutos.", en: "It has to go out in the next 20 minutes." },
        senal: { es: "Urgencia.", en: "Urgency." },
      },
    ],
  },
  {
    id: "premio",
    de: { es: "Correo · Sorteos", en: "Email · Giveaways" },
    frases: [
      {
        t: { es: "¡Felicidades! Ganaste un celular nuevo", en: "Congratulations! You won a new phone" },
        senal: { es: "Un premio que llega de la nada.", en: "A prize out of nowhere." },
      },
      { t: { es: "por ser uno de nuestros clientes.", en: "for being one of our customers." } },
      {
        t: { es: "Para reclamarlo, escribe los datos de tu tarjeta.", en: "To claim it, enter your card details." },
        senal: { es: "Nadie necesita tu tarjeta para darte un regalo.", en: "Nobody needs your card to give you a gift." },
      },
      {
        t: { es: "Tienes 10 minutos.", en: "You have 10 minutes." },
        senal: { es: "Reloj corriendo para que no lo pienses.", en: "A ticking clock so you don't think it through." },
      },
    ],
  },
];

export const SEGUROS: Mensaje[] = [
  {
    id: "mama-almuerzo",
    de: { es: "Mamá", en: "Mom" },
    frases: [
      { t: { es: "Hola, ¿vienes a almorzar el domingo?", en: "Hi honey, coming for lunch on Sunday?" } },
      { t: { es: "Voy a hacer sancocho.", en: "I'm making soup." } },
      { t: { es: "Avísame para comprar lo que falta.", en: "Let me know so I can buy what's missing." } },
    ],
  },
  {
    id: "banco-compra",
    de: { es: "App de tu banco", en: "Your bank's app" },
    frases: [
      { t: { es: "Hiciste una compra de 35.000 pesos en un supermercado.", en: "You made a $12 purchase at a grocery store." } },
      { t: { es: "Si no la reconoces, llama al número que está detrás de tu tarjeta.", en: "If you don't recognize it, call the number on the back of your card." } },
      { t: { es: "Nunca te pediremos tu clave.", en: "We'll never ask for your password." } },
    ],
  },
  {
    id: "companera",
    de: { es: "Compañera de trabajo", en: "Coworker" },
    frases: [
      { t: { es: "Te dejé las notas de la reunión de hoy.", en: "I left you the notes from today's meeting." } },
      { t: { es: "Están en la carpeta del equipo, la de siempre.", en: "They're in the team folder, the usual one." } },
    ],
  },
  {
    id: "tienda",
    de: { es: "Tienda de la esquina", en: "Corner store" },
    frases: [
      { t: { es: "Ya llegaron los huevos que encargaste.", en: "The eggs you ordered are in." } },
      { t: { es: "Pasa cuando quieras, abrimos hasta las 8.", en: "Stop by whenever, we're open until 8." } },
    ],
  },
];
