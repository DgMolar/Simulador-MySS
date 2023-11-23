import datos from "./db.json";

/**
 * @typedef {Object} InformeTrimestral
 * @property {number} trimestre - Número del trimestre.
 * @property {number} año - Año del informe.
 * @property {number} casosDeObesidad - Número de casos de obesidad.
 * @property {number} casosDeDiabetes - Número de casos de diabetes.
 * @property {string} afiliados - Número de afiliados o una cadena que representa el total.
 * @property {string} total - Total de algún tipo representado como cadena.
 */

/**
 * @type {InformeTrimestral[]}
 */
const informesTrimestrales = datos;

export default informesTrimestrales;
