const { ipcRenderer } = require('electron');
const Chart = require("chart.js/auto");
const regression = require("regression");
const csv = require("csvtojson");
const { processJson } = require("../../../preprossecing/preprocessing.js");
const { generateChart } = require("../../../graphs/graphs.js");

const fileInput = document.getElementById("file-input");
const fileButton = document.getElementById("file-button");
const plotContainer = document.getElementById("plot-container");
const predictionContainer = document.getElementById("prediction-container");

fileButton.addEventListener("click", async (event) => {
  event.preventDefault();

  if (fileInput.files.length === 0) {
    return console.error("No se ha seleccionado ningún archivo.");
  }

  const file = fileInput.files[0];

  const reader = new FileReader();

  reader.readAsText(file);

  reader.onload = async function (e) {
    const csvString = e.target.result;

    const json = await csv({
      colParser: {
        trimestre: "number",
        año: "number",
        casosDeObesidad: "number",
        casosDeDiabetes: "number",
        afiliados: "number",
        total: "number",
      },
    }).fromString(csvString);

    datosTotales(json.length);

    const datosPreparadosParaGraficar = processJson(json);

    console.log(datosPreparadosParaGraficar);

    const graficaOriginal = generateChart(
      [
        {
          label: "Incidencia de diabetes",
          data: datosPreparadosParaGraficar,
          color: "rgba(255, 99, 132, 1)",
        },
      ],
      -10,
      800
    );

    // Verificas si hay un gráfico existente en 'actual-plot'
    const existingPlotCanvas = document.getElementById("actual-plot");
    const existingPlotChart = Chart.getChart(existingPlotCanvas);

    if (existingPlotChart) {
      existingPlotChart.destroy();
    }

    if (plotContainer.hasChildNodes()) {
      plotContainer.removeChild(plotContainer.firstChild);
      const canvas = document.createElement("canvas");
      canvas.id = "actual-plot";
      plotContainer.appendChild(canvas);
    }

    new Chart(document.getElementById("actual-plot"), graficaOriginal);

    const datosPreparadosParaRegresion = datosPreparadosParaGraficar.map(
      (item) => [item.x, item.y]
    );

    const resultadoRegresion = regression.polynomial(
      datosPreparadosParaRegresion,
      {
        order: 4,
        precision: 5,
      }
    );

    console.log(resultadoRegresion);

    const a = resultadoRegresion.equation[0];
    const b = resultadoRegresion.equation[1];
    const c = resultadoRegresion.equation[2];
    const d = resultadoRegresion.equation[3];
    const f = resultadoRegresion.equation[4];

    const predict = (x) => {
      return a * x ** 4 + b * x ** 3 + c * x ** 2 + d * x + f;
    };

    console.log(
      `La incidencia del siguiente trimestre es: ${predict(
        datosPreparadosParaGraficar.length + 1
      )}`
    );

    const datosDelAlgoritmoFormateadosParaGraficar =
      resultadoRegresion.points.map((item) => {
        return { x: item[0], y: item[1] };
      });

    const predictChart = generateChart(
      [
        {
          label: "Prediccion de diabetes",
          data: datosDelAlgoritmoFormateadosParaGraficar,
          color: "rgba(54, 162, 235, 1)",
        },
        {
          label: "Incidencia de diabetes",
          data: datosPreparadosParaGraficar,
          color: "rgba(255, 99, 132, 1)",
        },
      ],
      -10,
      800
    );

    const predictionCanvas = document.getElementById("prediction-plot");
    const existingPredictionChart = Chart.getChart(predictionCanvas);

    if (existingPredictionChart) {
      existingPredictionChart.destroy();
    }

    new Chart(predictionCanvas, predictChart);

    console.log(
      `La incidencia del siguiente trimestre es ${predict(
        datosPreparadosParaGraficar.length + 1
      )}`
    );

    console.log(`La funcion de regresion es: ${resultadoRegresion.string}`);
  };
});

function datosTotales(totalTrimestres) {
  let mesesRegistrados = totalTrimestres;
  document.getElementById("trimestresRegistrados").value =
    mesesRegistrados + " Trimestres";
}
