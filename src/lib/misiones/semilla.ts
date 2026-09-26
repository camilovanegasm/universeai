// ARCHIVO GENERADO por scripts/generar-semilla.mjs: no se edita a mano.
// Para agregar una misión, guarda su .json en contenido/misiones/<mundo>/ y
// corre `npm run semilla` (también corre solo antes de cada build).
//
// Las misiones que vienen en el proyecto (la "semilla"), completas. Solo se usan
// en el servidor: la ruta del Laboratorio, la generación de páginas al publicar
// y los archivos estáticos /semilla que descarga el navegador cuando los
// necesita. "server-only" hace que la publicación falle si alguien la importa
// desde una pantalla, porque metería todas las misiones en la app del celular.
import "server-only";
import type { PaqueteMision } from "./tipos";
import m001 from "../../../contenido/misiones/origen/01-una-ia-en-tu-bolsillo.json";
import m002 from "../../../contenido/misiones/origen/02-reglas-o-ejemplos.json";
import m003 from "../../../contenido/misiones/origen/03-los-cuatro-oficios.json";
import m004 from "../../../contenido/misiones/origen/04-eso-es-ia-o-no.json";
import m005 from "../../../contenido/misiones/origen/p1-mi-mapa-de-ia-de-un-dia.json";
import m006 from "../../../contenido/misiones/origen/05-la-pregunta-de-turing.json";
import m007 from "../../../contenido/misiones/origen/06-inviernos-y-primaveras.json";
import m008 from "../../../contenido/misiones/origen/07-los-tres-combustibles.json";
import m009 from "../../../contenido/misiones/origen/p2-la-linea-de-tiempo-de-tu-familia.json";
import m010 from "../../../contenido/misiones/lexia/01-el-autocompletar-gigante.json";
import m011 from "../../../contenido/misiones/lexia/02-fichas-no-palabras.json";
import m012 from "../../../contenido/misiones/lexia/03-la-tombola.json";
import m013 from "../../../contenido/misiones/lexia/p1-radiografia-de-una-respuesta.json";
import m014 from "../../../contenido/misiones/eco/01-primera-senal.json";
import m015 from "../../../contenido/misiones/eco/02-el-pedido-completo.json";
import m016 from "../../../contenido/misiones/eco/03-la-tienda-de-dona-marta.json";
import m017 from "../../../contenido/misiones/eco/04-en-que-forma-lo-quieres.json";
import m018 from "../../../contenido/misiones/eco/05-conversar-no-disparar.json";
import m019 from "../../../contenido/misiones/eco/p1-kit-de-senales.json";
import m020 from "../../../contenido/misiones/eco/06-los-5-errores-clasicos.json";
import m021 from "../../../contenido/misiones/eco/07-cuando-la-ia-inventa.json";
import m022 from "../../../contenido/misiones/eco/08-lo-que-no-se-transmite.json";
import m023 from "../../../contenido/misiones/eco/09-esta-respuesta-sirve.json";
import m024 from "../../../contenido/misiones/eco/p2-auditoria.json";
import m025 from "../../../contenido/misiones/eco/10-dale-ejemplos.json";
import m026 from "../../../contenido/misiones/eco/11-paso-a-paso.json";
import m027 from "../../../contenido/misiones/eco/12-pon-limites-claros.json";
import m028 from "../../../contenido/misiones/eco/13-divide-lo-grande.json";
import m029 from "../../../contenido/misiones/eco/14-dale-un-papel.json";
import m030 from "../../../contenido/misiones/eco/p3-mision-larga.json";
import m031 from "../../../contenido/misiones/eco/15-que-te-entreviste.json";
import m032 from "../../../contenido/misiones/eco/16-que-mejore-tu-prompt.json";
import m033 from "../../../contenido/misiones/eco/17-que-se-revise-a-si-misma.json";
import m034 from "../../../contenido/misiones/eco/18-instrucciones-que-recuerda.json";
import m035 from "../../../contenido/misiones/eco/19-tu-biblioteca-de-plantillas.json";
import m036 from "../../../contenido/misiones/eco/p4-tu-copiloto-personal.json";
import m037 from "../../../contenido/misiones/orbita/01-que-cocino-hoy.json";
import m038 from "../../../contenido/misiones/orbita/02-la-casa-en-orden.json";
import m039 from "../../../contenido/misiones/orbita/03-arreglos-con-cuidado.json";
import m040 from "../../../contenido/misiones/orbita/p1-semana-organizada.json";
import m041 from "../../../contenido/misiones/orbita/04-tu-presupuesto-sin-datos.json";
import m042 from "../../../contenido/misiones/orbita/05-la-letra-menuda.json";
import m043 from "../../../contenido/misiones/orbita/06-el-reclamo-bien-hecho.json";
import m044 from "../../../contenido/misiones/orbita/07-comprar-con-cabeza.json";
import m045 from "../../../contenido/misiones/orbita/p2-carpeta-de-tramites.json";
import m046 from "../../../contenido/misiones/brujula/01-la-voz-que-no-era.json";
import m047 from "../../../contenido/misiones/brujula/02-el-famoso-que-no-invirtio.json";
import m048 from "../../../contenido/misiones/brujula/03-la-cuenta-nueva-del-proveedor.json";
import m049 from "../../../contenido/misiones/brujula/04-el-mensaje-perfecto.json";
import m050 from "../../../contenido/misiones/brujula/05-real-o-hecho-con-ia.json";
import m051 from "../../../contenido/misiones/brujula/p1-protocolo-antiestafas.json";
import m052 from "../../../contenido/misiones/forja/01-la-armeria.json";
import m053 from "../../../contenido/misiones/forja/02-que-suene-a-ti.json";
import m054 from "../../../contenido/misiones/forja/03-resumir-con-proposito.json";
import m055 from "../../../contenido/misiones/forja/04-del-desorden-al-plan.json";
import m056 from "../../../contenido/misiones/forja/05-respuestas-para-clientes.json";
import m057 from "../../../contenido/misiones/forja/p1-kit-de-escritorio.json";
import m058 from "../../../contenido/misiones/forja/06-tres-picas.json";
import m059 from "../../../contenido/misiones/forja/07-sigue-la-veta.json";
import m060 from "../../../contenido/misiones/forja/08-el-plano-de-la-excavacion.json";
import m061 from "../../../contenido/misiones/forja/09-hechos-opiniones-y-voces.json";
import m062 from "../../../contenido/misiones/forja/p2-informe-de-una-pagina.json";
import m063 from "../../../contenido/misiones/prisma/01-del-ruido-a-la-imagen.json";
import m064 from "../../../contenido/misiones/prisma/02-el-haz-completo.json";
import m065 from "../../../contenido/misiones/prisma/03-refractar.json";
import m066 from "../../../contenido/misiones/prisma/04-caza-el-destello.json";
import m067 from "../../../contenido/misiones/prisma/05-una-imagen-con-encargo.json";
import m068 from "../../../contenido/misiones/prisma/p1-afiche-de-un-evento-real.json";
import m069 from "../../../contenido/misiones/nexo/01-de-responder-a-actuar.json";
import m070 from "../../../contenido/misiones/nexo/02-el-ciclo-del-droide.json";
import m071 from "../../../contenido/misiones/nexo/03-las-manos-del-agente.json";
import m072 from "../../../contenido/misiones/nexo/04-esto-es-para-un-agente.json";
import m073 from "../../../contenido/misiones/nexo/p1-radar-de-tareas.json";
import m074 from "../../../contenido/misiones/taller/01-describe-y-el-robot-arma.json";
import m075 from "../../../contenido/misiones/horizonte/01-pronostico-no-profecia.json";
import m076 from "../../../contenido/misiones/horizonte/02-quien-lo-dice-y-que-gana.json";
import m077 from "../../../contenido/misiones/horizonte/03-numeros-que-asustan.json";
import m078 from "../../../contenido/misiones/horizonte/04-demo-no-es-producto.json";
import m079 from "../../../contenido/misiones/horizonte/05-lo-probado-y-lo-prometido.json";
import m080 from "../../../contenido/misiones/horizonte/p1-ficha-de-la-noticia.json";
import m081 from "../../../contenido/misiones/automata/01-la-tarea-que-se-repite.json";
import m082 from "../../../contenido/misiones/automata/02-sensor-y-estacion.json";
import m083 from "../../../contenido/misiones/automata/03-engranajes-que-ya-tienes.json";
import m084 from "../../../contenido/misiones/automata/04-las-cajas-viajan.json";
import m085 from "../../../contenido/misiones/nucleo/01-la-receta-de-un-modelo.json";
import m086 from "../../../contenido/misiones/nucleo/02-de-donde-salen-los-datos.json";
import m087 from "../../../contenido/misiones/nucleo/03-las-manos-detras-de-los-datos.json";
import m088 from "../../../contenido/misiones/nucleo/04-basura-entra-basura-sale.json";

export const SEMILLA: PaqueteMision[] = [
  m001,
  m002,
  m003,
  m004,
  m005,
  m006,
  m007,
  m008,
  m009,
  m010,
  m011,
  m012,
  m013,
  m014,
  m015,
  m016,
  m017,
  m018,
  m019,
  m020,
  m021,
  m022,
  m023,
  m024,
  m025,
  m026,
  m027,
  m028,
  m029,
  m030,
  m031,
  m032,
  m033,
  m034,
  m035,
  m036,
  m037,
  m038,
  m039,
  m040,
  m041,
  m042,
  m043,
  m044,
  m045,
  m046,
  m047,
  m048,
  m049,
  m050,
  m051,
  m052,
  m053,
  m054,
  m055,
  m056,
  m057,
  m058,
  m059,
  m060,
  m061,
  m062,
  m063,
  m064,
  m065,
  m066,
  m067,
  m068,
  m069,
  m070,
  m071,
  m072,
  m073,
  m074,
  m075,
  m076,
  m077,
  m078,
  m079,
  m080,
  m081,
  m082,
  m083,
  m084,
  m085,
  m086,
  m087,
  m088,
].map((p) => p as unknown as PaqueteMision);
