import { Chart } from "chart.js/auto";
import regression from "regression";
import csv from "csvtojson";
import { processJson } from "./src/preprossecing";
import { generateChart } from "./src/graphs";
const fileInput = document.getElementById("file-input");
const fileButton = document.getElementById("file-button");
const plotContainer = document.getElementById("plot-container");
const predictionContainer = document.getElementById("prediction-container");

fileButton.addEventListener("click", (event) => {
  event.preventDefault();

  // Aqui se lee el archivo
  if (fileInput.files.length === 0) {
    return;
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

    console.log(json);

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
      -1000,
      3000
    );

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

    // Despues de obtener los datos se tiene que procesar para meter en la funcion de regresion
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
      return a * x ** 4 + b * x ** 3 + c * x ** 2 + d * x + e;
    };

    console.log(
      `La incidencia del siguiente trimestre es: ${predict(
        datosPreparadosParaGraficar.length + 1
      )}`
    );

    // Formateas los datos para graficar
    const datosDelAlgoritmoFormateadosParaGraficar =
      resultadoRegresion.points.map((item) => {
        return { x: item[0], y: item[1] };
      });

    const predictChart = generateChart([
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
    ]);

    if (predictionContainer.hasChildNodes()) {
      predictionContainer.removeChild(predictionContainer.firstChild);
      const canvas = document.createElement("canvas");
      canvas.id = "prediction-plot";
      predictionContainer.appendChild(canvas);
    }

    new Chart(document.getElementById("prediction-plot"), predictChart);

    console.log(
      `La incidencia del siguiente trimestre es ${predict(
        datosPreparadosParaGraficar.length + 1
      )}`
    );

    console.log(`La funcion de regresion es: ${resultadoRegresion.string}`);
  };
});