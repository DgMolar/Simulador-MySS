const { ipcRenderer } = require("electron");
const Chart = require("chart.js/auto");
const regression = require("regression");
const csv = require("csvtojson");
// Para guardar data.json
const fs = require("fs");
const path = require("path");
const remote = require("electron");
const app = remote.app;

const { processJson } = require("../../../preprossecing/preprocessing.js");
const { generateChart } = require("../../../graphs/graphs.js");

const fileInput = document.getElementById("file-input");
const fileButton = document.getElementById("file-button");
const plotContainer = document.getElementById("plot-container");

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
    // Creacion de data.son
    const dataFolderPath = path.join(__dirname, "../../../data");
    const dataFilePath = path.join(dataFolderPath, "datos.json");
    const jsonString = JSON.stringify(json, null, 2);

    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath, { recursive: true });
    }

    fs.writeFile(dataFilePath, jsonString, (err) => {
      if (err) {
        console.error("Error al escribir datos.json:", err);
      } else {
        console.log("Archivo datos.json escrito correctamente.");
        window.location.reload();
      }
    });
    // Fin de la creación de datos.json
  };
});

// cuando el documento se cargue, se ejecutara la funcion
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si el archivo datos.json existe
  const filePath = path.resolve(__dirname, "../../../data/datos.json");

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si el archivo no existe, muestra una alerta y termina la ejecución
      alert("Favor de cargar datos del CSV");
      return;
    }

    // Si el archivo existe, leer su contenido como JSON
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error al leer el archivo:", err);
        return;
      }

      try {
        // Intenta parsear el contenido del archivo JSON
        const json = JSON.parse(data);
        // console.log("Datos extraídos del archivo:", json);
        verDatosGrafica(json);
      } catch (error) {
        console.error("Error al parsear el archivo JSON:", error);
      }
    });
  });
});

function verDatosGrafica(json) {
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
    -100,
    2000
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

  const datosDelAlgoritmoFormateadosParaGraficar =
    resultadoRegresion.points.map((item) => {
      return { x: item[0], y: item[1] };
    });

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
