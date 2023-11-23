const { ipcRenderer } = require("electron");
const Chart = require("chart.js/auto");
const regression = require("regression");
const csv = require("csvtojson");
// Para guardar data.json
const fs = require("fs");
const path = require("path");

const { processJson } = require("../../../preprossecing/preprocessing.js");
const { generateChart } = require("../../../graphs/graphs.js");

const fileInput = document.getElementById("file-input");
const fileButton = document.getElementById("file-button");
const predictionContainer = document.getElementById("prediction-container");

// cuando el documento se cargue, se ejecutara la funcion
document.addEventListener("DOMContentLoaded", () => {
  // ipcRenderer.invoke para obtener la ruta del directorio de datos del usuario
  ipcRenderer.invoke("get-user-data-path").then((userDataPath) => {
    const filePath = path.join(userDataPath, "datos.json");

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // Si el archivo no existe, muestra una alerta y termina la ejecución
        alert("No hay datos cargados en el sistema. Favor de cargar datos.");
        window.location.href = "actualizar_analisis.html";
        return;
      }

      // Si el archivo existe, leer su contenido como JSON
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Error al leer el archivo:", err);
          return;
        }

        try {
          const json = JSON.parse(data);
          verDatosGrafica(json);
        } catch (error) {
          console.error("Error al parsear el archivo JSON:", error);
        }
      });
    });
  });
});


function verDatosGrafica(json) {
  const datosPreparadosParaGraficar = processJson(json);

    console.log(datosPreparadosParaGraficar);

    

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
      -100,
      1000
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
}

function datosTotales(totalTrimestres) {
  let mesesRegistrados = totalTrimestres;
  document.getElementById("trimestresRegistrados").value =
    mesesRegistrados + " Trimestres";
}

