const { ipcRenderer } = require("electron");
const Chart = require("chart.js/auto");
const regression = require("regression");
const csv = require("csvtojson");
// Para guardar data.json
const fs = require("fs");
const path = require("path");

const { processJson } = require("../../../preprossecing/preprocessing.js");
const { generateChart } = require("../../../graphs/graphs.js");

// ELEMENTOS DEL DOM
const modeloActualInput = document.getElementById("modelo-actual-input");
//

//CACHE
let json = null;
let modelo = null;
let tablaActivada = false;
//

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
                const a = modelo.equation[0];
                const b = modelo.equation[1];
                const c = modelo.equation[2];
                const d = modelo.equation[3];
                const f = modelo.equation[4];

                const predict = (x) => {
                  return a * x ** 4 + b * x ** 3 + c * x ** 2 + d * x + f;
                };
                const modelFunction = modelo.string;
                modeloActualInput.value = modelFunction;
                const jsonGraph = processJson(json);
                const modelGraph = modelo.points.map((item) => {
                  return { x: item[0], y: item[1] };
                });
                verDatosGrafica(jsonGraph, modelGraph);

                const rmseValue = calculateRmse(jsonGraph, modelGraph);
                rmsInput = document.getElementById("RMSE-input");
                rmsInput.value = rmseValue.toFixed(2);
                console.log(`El RMSE es: ${rmseValue}`);

                let prediccionIncidenciaInput = document.getElementById(
                  "prediccionIncidencia-input"
                );
                prediccionIncidenciaInput.value = predict(
                  jsonGraph.length + 1
                ).toFixed(2);

                document
                  .getElementById("periodoIncidencia-selected")
                  .addEventListener("change", (event) => {
                    let opcionSeleccionada = parseInt(event.target.value);
                    let nuevaPrediccion = predict(
                      jsonGraph.length + opcionSeleccionada
                    ).toFixed(2);
                    prediccionIncidenciaInput.value = nuevaPrediccion;
                  });

                const btnVerDatos = document.getElementById("btnVerDatos");
                btnVerDatos.addEventListener("click", async () => {
                  if (tablaActivada === true) {
                    return;
                  } else {
                    imprimirDatosTabla(json);
                    tablaActivada = true;
                  }
                });
              }
            });
          });
        }
      });
    });
  });
});

/**
 * @param {Array<{x: number, y: number}>} json
 * @param {Array<{x: number, y: number}>} modelo
 */
function verDatosGrafica(json, modelo) {
  const predictChart = generateChart(
    [
      {
        label: "Prediccion de diabetes",
        data: modelo,
        color: "rgba(54, 162, 235, 1)",
        borderColor: "rgba(54, 162, 235, 1)",
      },
      {
        label: "Incidencia de diabetes",
        data: json,
        color: "rgba(255, 99, 132, 1)",
        borderColor: "rgba(255, 99, 132, 1)",
      },
    ],
    -100,
    2000,
    "Grafica para predicción de diabetes"
  );
  const predictionCanvas = document.getElementById("prediction-plot");

  new Chart(predictionCanvas, predictChart);
}

/**
 *
 * @param {Array<{x: number, y: number}>} datos
 * @param {Array<{x: number, y: number}>} modelo
 */
const calculateRmse = (datos, modelo) => {
  const n = datos.length;
  const sumatoria = datos.reduce((acc, item, index) => {
    return acc + (item.y - modelo[index].y) ** 2;
  }, 0);
  return Math.sqrt(sumatoria / n);
};

function imprimirDatosTabla(json) {
  tablaContenido = document.getElementById("datosTabla");
  try {
    json.map((objeto) => {
      const tomaData = document.createElement("tr");
      tomaData.innerHTML = icomponentDatosTabla(objeto);
      tablaContenido.append(tomaData);
    });
  } catch (error) {
    console.log("Error al imprimir datos en la tabla", error);
  }
}

function icomponentDatosTabla({ trimestre, año, casosDeDiabetes }) {
  return `
    <tr>
      <td>${año}</td>
      <td>${trimestre}</td>
      <td>${casosDeDiabetes}</td>
    </tr>
  `;
}
