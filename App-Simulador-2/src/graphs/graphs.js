/**
 * Objeto que representa un conjunto de datos para generar una gráfica.
 * @typedef {Object} ChartDataset
 * @property {string} label - Etiqueta del conjunto de datos.
 * @property {string} color - Color del conjunto de datos en formato RGB.
 * @property {Array<{x: number, y: number}>} data - Datos de la gráfica, cada punto representado por las coordenadas (x, y).
 */

/**
 * Arreglo de conjuntos de datos para generar una gráfica.
 * @type {Array<ChartDataset>}
 */

/**
 * Genera una gráfica a partir de un conjunto de datos.
 * @param {Array<ChartDataset>} data - Conjunto de datos para generar la gráfica.
 */
function generateChart(data, ymin, ymax) {
  const datasets = data.map((dataset) => {
    return {
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.color,
    };
  });

  return {
    type: "scatter",
    data: {
      datasets,
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
        y: {
          min: ymin,
          max: ymax,
        },
      },
    },
  };
}

module.exports = { generateChart };
