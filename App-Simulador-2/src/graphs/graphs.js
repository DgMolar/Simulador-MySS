/**
 * Objeto que representa un conjunto de datos para generar una gráfica.
 * @typedef {Object} ChartDataset
 * @property {string} label - Etiqueta del conjunto de datos.
 * @property {string} color - Color del conjunto de datos en formato RGB.
 *  @property {string} borderColor - Color del conjunto de datos en formato RGB.
 * @property {Array<{x: number, y: number}>} data - Datos de la gráfica, cada punto representado por las coordenadas (x, y).
 */

/**
 * Arreglo de conjuntos de datos para generar una gráfica.
 * @type {Array<ChartDataset>}
 */
/**
 * Genera una gráfica a partir de un conjunto de datos.
 * @param {Array<ChartDataset>} data - Conjunto de datos para generar la gráfica.
 * @param {string} title - Título de la gráfica.
 * @param {Array<number>} ano - Lista de años para etiquetar el eje X.
 */
/**
 * Genera una gráfica a partir de un conjunto de datos.
 * @param {Array<ChartDataset>} data - Conjunto de datos para generar la gráfica.
 */
function generateChart(data, ymin, ymax, title, ano) {
  const datasets = data.map((dataset) => {
    return {
      label: dataset.label,
      pointStyle: 'circle',
      pointRadius: 5,
      data: dataset.data,
      fill: false,
      tension: 0.4,
      borderColor: dataset.borderColor,
      backgroundColor: dataset.color,
    };
  });

  return {
    type: "line",
    data: {
      datasets,
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        },
        title: {
          display: true,
          text: title, // Se utiliza el título pasado como parámetro
          color: "black",
          font: {
            family: "Arial",
            size: 20,
            weight: "bold",
            lineHeight: 1.2,
          },
        },
      },  
      animation: {
        duration: 800,
        easing: "easeInOutQuart",
      },      
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          display: true,
          title: {
            display: true,
            text: "Trimestre",
            color: "black",
            font: {
              family: "Arial",
              size: 15,
              weight: "bold",
              lineHeight: 1.2,
            },
          },
          labels: ano,
          ticks: {
            // forces step size to be 50 units
            stepSize: 1 
          },
        },
        y: {
          min: ymin,
          max: ymax,
          display: true,
          title: {
            display: true,
            text: "Personas",
            color: "black",
            font: {
              family: "Arial",
              size: 15,
              style: "normal",
              weight: "bold",
              lineHeight: 1.2,
            },
            ticks: {
              // forces step size to be 50 units
              stepSize: 50
            },
            padding: { top: 10, left: 0, right: 0, bottom: 0 },
          },
        },
      },
    },
  };
}

module.exports = { generateChart };
