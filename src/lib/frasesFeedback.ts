// Frases cortas, con humor gamer-retro (la voz de Punti), que aparecen después de
// responder cada ejercicio. Se elige una al azar cada vez para que no se sienta repetitivo.
const FRASES_CORRECTAS = [
  "¡Sabía que lo lograrías!",
  "Vas más rápido que un cohete 🚀",
  "Próxima parada: Júpiter.",
  "Neurona activada. Nivel: genio.",
  "Eso sí fue nivel astronauta.",
  "Punti está impresionado (y eso no es fácil).",
  "Achievement unlocked.",
  "Combustible al máximo, sigue así.",
];

const FRASES_INCORRECTAS = [
  "Ups... te estrellaste con un cometa.",
  "Error 404: respuesta correcta no encontrada.",
  "Casi. Recalculando ruta...",
  "Ese asteroide no lo viste venir, ¿eh?",
  "Fallo de sistema. Reintenta, astronauta.",
  "Turbulencia espacial. Ajusta el rumbo.",
];

export function fraseAleatoria(correcto: boolean): string {
  const lista = correcto ? FRASES_CORRECTAS : FRASES_INCORRECTAS;
  return lista[Math.floor(Math.random() * lista.length)];
}
