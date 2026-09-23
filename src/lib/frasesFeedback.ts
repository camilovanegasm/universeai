import type { Idioma } from "@/lib/i18n";

// Frases cortas, con humor gamer-retro (la voz de Punti), que aparecen después de
// responder cada ejercicio. Se elige una al azar cada vez para que no se sienta
// repetitivo. Las inglesas no son traducción literal: son el mismo chiste
// contado como lo contaría alguien que habla inglés.

const FRASES: Record<Idioma, { bien: string[]; mal: string[] }> = {
  es: {
    bien: [
      "¡Sabía que lo lograrías!",
      "Vas más rápido que un cohete.",
      "Próxima parada: Júpiter.",
      "Neurona activada. Nivel: genio.",
      "Eso sí fue nivel astronauta.",
      "Punti está impresionado (y eso no es fácil).",
      "Achievement unlocked.", // en inglés a propósito: jerga gamer, es la voz de Punti
      "Combustible al máximo, sigue así.",
    ],
    mal: [
      "Ups... te estrellaste con un cometa.",
      "Error 404: respuesta correcta no encontrada.",
      "Casi. Recalculando ruta...",
      "Ese asteroide no lo viste venir, ¿eh?",
      "Fallo de sistema. Reintenta, astronauta.",
      "Turbulencia espacial. Ajusta el rumbo.",
    ],
  },
  en: {
    bien: [
      "Knew you'd nail it!",
      "Faster than a rocket.",
      "Next stop: Jupiter.",
      "Neuron activated. Level: genius.",
      "Now that was astronaut-grade.",
      "Punti is impressed (and that's not easy).",
      "Achievement unlocked.",
      "Fuel at max. Keep it up.",
    ],
    mal: [
      "Oops... you crashed into a comet.",
      "Error 404: right answer not found.",
      "Close. Recalculating route...",
      "Didn't see that asteroid coming, huh?",
      "System failure. Try again, astronaut.",
      "Space turbulence. Adjust your course.",
    ],
  },
};

export function fraseAleatoria(correcto: boolean, idioma: Idioma = "es"): string {
  const lista = correcto ? FRASES[idioma].bien : FRASES[idioma].mal;
  return lista[Math.floor(Math.random() * lista.length)];
}
