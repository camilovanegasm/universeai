"use client";

import PuntiPixel from "@/components/PuntiPixel";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";

/**
 * Acordeón de preguntas frecuentes.
 *
 * Usa <details>/<summary> del navegador y no estado de React a propósito:
 * abre y cierra sin JavaScript, funciona con teclado y con lector de pantalla
 * sin que haya que programar nada, y no se rompe si el JS falla al cargar.
 *
 * Cada pregunta y cada respuesta están escritas dos veces, una al lado de la
 * otra, para que quien cambie una vea el gemelo que tiene que cambiar.
 */

type T = Record<Idioma, string>;
type Pregunta = { p: T; r: T };

const PREGUNTAS: Pregunta[] = [
  {
    p: { es: "¿Punti es gratis?", en: "Is Punti free?" },
    r: {
      es: "Sí. Todo lo que hay hoy en el universo se puede recorrer sin pagar nada. Más adelante habrá cosas extra para quien quiera apoyar el proyecto, pero lo que ya está no se va a cobrar después.",
      en: "Yes. Everything in the universe today can be explored without paying a thing. Later there will be extras for anyone who wants to support the project, but what's already here won't start costing money.",
    },
  },
  {
    p: { es: "¿Necesito saber de tecnología para empezar?", en: "Do I need to know about technology to start?" },
    r: {
      es: "No. Punti está hecho justamente para quien no programa. Si sabes usar el celular, sabes lo suficiente. Cada idea se explica con palabras normales y con un ejemplo antes de pedirte nada.",
      en: "No. Punti is made precisely for people who don't code. If you can use a phone, you know enough. Every idea is explained in plain words and with an example before you're asked to do anything.",
    },
  },
  {
    p: { es: "¿Qué es la gasolina y por qué se me acaba?", en: "What is fuel, and why does it run out?" },
    r: {
      es: "La gasolina es lo que te permite seguir intentando. Empiezas con cinco y pierdes una cada vez que fallas un ejercicio. Si se acaba, el viaje se pausa hasta el día siguiente — no para castigarte, sino porque aprender cansado no sirve de nada. Se recarga sola cada día.",
      en: "Fuel is what lets you keep trying. You start with five and lose one each time you miss an exercise. If it runs out, the journey pauses until the next day — not to punish you, but because learning while tired doesn't help. It refills on its own every day.",
    },
  },
  {
    p: { es: "¿Tengo que hacer los mundos en orden?", en: "Do I have to do the worlds in order?" },
    r: {
      es: "No, y eso es a propósito. Puedes aterrizar en el mundo que te interese hoy y en otro mañana. Lo único que no se puede abrir es un mundo que todavía no tiene contenido escrito, y esos aparecen marcados como “en obra”.",
      en: "No, and that's on purpose. You can land on the world that interests you today and another one tomorrow. The only ones you can't open are worlds with no content written yet, and those are marked “coming soon”.",
    },
  },
  {
    p: { es: "¿Cuánto dura una lección?", en: "How long is a lesson?" },
    r: {
      es: "Pocos minutos. La idea es que quepa en una fila del banco o en un trayecto en bus. Cada lección tiene una explicación corta y unos ejercicios, y si la terminas rápido ganas puntos extra.",
      en: "A few minutes. The idea is that it fits in a line at the bank or a bus ride. Each lesson has a short explanation and a few exercises, and if you finish fast you earn bonus points.",
    },
  },
  {
    p: { es: "¿Qué pasa si me equivoco?", en: "What happens if I get something wrong?" },
    r: {
      es: "Nada grave. Pierdes una gasolina y sigues. Equivocarse es parte del asunto: lo que decide cuántos puntos ganas no es acertar de una, sino terminar. Y si te quedas atascado, puedes pedirle una pista a Punti: te cuesta media gasolina, o sea la mitad de lo que cuesta fallar.",
      en: "Nothing serious. You lose one fuel and keep going. Mistakes are part of it: what decides how many points you earn isn't getting it right the first time, it's finishing. And if you get stuck, you can ask Punti for a hint: it costs half a fuel, which is half of what a mistake costs.",
    },
  },
  {
    p: { es: "¿Se guarda mi progreso?", en: "Is my progress saved?" },
    r: {
      es: "Sí, en tu cuenta. Puedes cerrar el navegador, cambiar de celular o entrar desde otro computador y vas a encontrar todo donde lo dejaste: tus puntos, tu racha y los mundos que ya recorriste.",
      en: "Yes, in your account. You can close the browser, switch phones or sign in from another computer and you'll find everything where you left it: your points, your streak and the worlds you've already explored.",
    },
  },
  {
    p: { es: "¿Para qué sirve la racha?", en: "What's the streak for?" },
    r: {
      es: "Cuenta los días seguidos que vienes. Es el único número de la app que no puedes recuperar: si dejas pasar más de un día, vuelve a empezar. Está ahí porque diez minutos diarios enseñan más que tres horas de una sola vez.",
      en: "It counts the days in a row you show up. It's the only number in the app you can't get back: if you skip more than a day, it starts over. It's there because ten minutes a day teach more than three hours at once.",
    },
  },
  {
    p: { es: "¿Funciona en el celular?", en: "Does it work on my phone?" },
    r: {
      es: "Sí, y está pensado primero para el celular. No hay que instalar nada: se abre en el navegador como cualquier página y se ve igual de bien en una pantalla pequeña que en un computador.",
      en: "Yes, and it's designed for phones first. There's nothing to install: it opens in the browser like any web page and looks just as good on a small screen as on a computer.",
    },
  },
  {
    p: { es: "¿Cada cuánto salen mundos nuevos?", en: "How often do new worlds come out?" },
    r: {
      es: "El universo está creciendo. Los mundos marcados “en obra” ya tienen su lugar reservado y se van abriendo a medida que se escribe el contenido. El orden en que se abren puede cambiar según lo que más haga falta.",
      en: "The universe is growing. The worlds marked “coming soon” already have their spot reserved and open up as the content gets written. The order they open in can change depending on what's needed most.",
    },
  },
];

const TITULO: T = { es: "Preguntas frecuentes", en: "Frequently asked questions" };

export default function PreguntasFrecuentes() {
  const idioma = useIdioma();

  return (
    <section className="mt-16" aria-labelledby="faq-titulo">
      <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:items-end sm:gap-3">
        <PuntiPixel estado="info" ancho={64} recorte="busto" />
        <h2
          id="faq-titulo"
          className="font-[family-name:var(--font-pixel)] text-[13px] leading-[1.5] text-white sm:pb-2 sm:text-[18px]"
        >
          {TITULO[idioma]}
        </h2>
      </div>

      <div className="mx-auto mt-7 flex max-w-[760px] flex-col gap-2">
        {PREGUNTAS.map((q) => (
          <details key={q.p.es} className="faq-item border-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.55)]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-[family-name:var(--font-ui)] text-[15px] font-bold text-white sm:text-base">
              {q.p[idioma]}
              <i className="faq-flecha shrink-0 text-[var(--matrix)]" aria-hidden="true">▾</i>
            </summary>
            <p className="border-t border-[var(--color-panel-border)] px-4 py-3.5 text-[14.5px] leading-[1.65] text-[var(--muted)]">
              {q.r[idioma]}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
