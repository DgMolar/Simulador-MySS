const { ipcRenderer } = require("electron");
const Chart = require("chart.js/auto");
const regression = require("regression");
const csv = require("csvtojson");
// Para guardar data.json
const fs = require("fs");
const path = require("path");

const { processJson } = require("../../../preprossecing/preprocessing.js");
const { generateChart } = require("../../../graphs/graphs.js");

let json = null;
let modelo = null;

// cuando el documento se cargue, se ejecutara la funcion
document.addEventListener("DOMContentLoaded", () => {
  // ipcRenderer.invoke para obtener la ruta del directorio de datos del usuario
  ipcRenderer.invoke("get-user-data-path").then((userDataPath) => {
    const datosPath = path.join(userDataPath, "datos.json");
    const modelPath = path.join(userDataPath, "model.json");

    // Verificar la existencia de datos.json
    fs.access(datosPath, fs.constants.F_OK, (errDatos) => {
      if (errDatos) {
        // Si datos.json no existe, mostrar alerta y terminar la ejecución
        alert("No hay datos cargados en el sistema. Favor de cargar datos.");
        window.location.href = "actualizar_analisis.html";
        return;
      }

      // Si datos.json existe, leer su contenido como JSON
      fs.readFile(datosPath, "utf8", (err, data) => {
        if (err) {
          console.error("Error al leer el archivo datos.json:", err);
          return;
        } else {
          console.log("Contenido de datos.json:", data);
          json = JSON.parse(data);
          // Verificar la existencia de model.json
          fs.access(modelPath, fs.constants.F_OK, (errModel) => {
            if (errModel) {
              // Si model.json no existe, mostrar alerta y realizar alguna acción
              const errorDialog = document.getElementById("errorDialog");
              errorDialog.innerHTML =
                '<div class="alert alert-danger d-flex justify-content-center" role="alert">Modelo no entrenado</div>';
              return;
            }
            // Si model.json existe, puedes realizar alguna acción si es necesario
            fs.readFile(modelPath, "utf8", (err, data) => {
              if (err) {
                console.error("Error al leer el archivo model.json:", err);
                return;
              } else {
                modelo = JSON.parse(data);
                verDatosGrafica(json, modelo);
              }
            });
          });
        }
      });
    });
  });
});

function verDatosGrafica(json, modelo) {
  const datosPreparadosParaGraficar = processJson(json);

  console.log("Incidencias de diabetes", datosPreparadosParaGraficar);

  console.log("Predicciones", modelo);

  const a = modelo.equation[0];
  const b = modelo.equation[1];
  const c = modelo.equation[2];
  const d = modelo.equation[3];
  const f = modelo.equation[4];

  const predict = (x) => {
    return a * x ** 4 + b * x ** 3 + c * x ** 2 + d * x + f;
  };

  const datosDelAlgoritmoFormateadosParaGraficar = modelo.points.map((item) => {
    return { x: item[0], y: item[1] };
  });

  const prediccion200 = Array.from(
    { length: datosPreparadosParaGraficar.length + 2 },
    (_, i) => {
      return { x: i + 1, y: predict(i + 1) };
    }
  );
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
    2000
  );
  const predictionCanvas = document.getElementById("prediction-plot");

  new Chart(predictionCanvas, predictChart);

  console.log(`La incidencia del siguiente trimestre es ${predict(36)}`);
  console.log(`La funcion de regresion es: ${modelo.string}`);
}
