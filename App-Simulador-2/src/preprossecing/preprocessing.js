/**
 * @typedef {Object} InformeTrimestral
 * @property {number} trimestre - Número del trimestre.
 * @property {number} trimestreDelAño - Año del informe.
 * @property {number} año - Año del informe.
 * @property {number} casosDeObesidad - Número de casos de obesidad.
 * @property {number} casosDeDiabetes - Número de casos de diabetes.
 * @property {string} afiliados - Número de afiliados o una cadena que representa el total.
 * @property {string} total - Total de algún tipo representado como cadena.
 */

/**
 * @param {InformeTrimestral[]} informeTrimestral
 * @returns {Array<{x: number, y: number}>}
 */

function processJson(informeTrimestral) {
  // Paso 1. Calcular el porcentaje de la poblacion con servicios medicos con diabetes

  const porcentajePoblacionDiabetes = informeTrimestral.map((informe) => {
    return (informe.casosDeDiabetes / informe.afiliados) * 100;
  });

  // Paso 2. Calcular el porcentaje de la poblacion con servicios medicos con diabetes

  const porcentajePoblacionObesidad = informeTrimestral.map((informe) => {
    return (informe.casosDeObesidad / informe.afiliados) * 100;
  });

  // Paso 3. Calcular la proyeccion de afiliados con diabetes

  const proyeccionAfiliadosDiabetes = porcentajePoblacionDiabetes.map(
    (porcentaje, index) => {
      return (porcentaje * informeTrimestral[index].total) / 100;
    }
  );

  // Paso 4. Calcular la proyeccion de afiliados con obesidad

  const proyeccionAfiliadosObesidad = porcentajePoblacionObesidad.map(
    (porcentaje, index) => {
      return (porcentaje * informeTrimestral[index].total) / 100;
    }
  );

  // Paso 5. Calcular la incidencia de diabetes en la poblacion

  const incidenciaDiabetes = proyeccionAfiliadosDiabetes.map(
    (proyeccion, index) => {
      return (proyeccion / proyeccionAfiliadosObesidad[index]) * 1000;
    }
  );

  const cleanData = informeTrimestral.map((informe, index) => {
    return {
      x: index + 1,
      y: incidenciaDiabetes[index],
    };
  });

  return cleanData;
}

module.exports = { processJson };