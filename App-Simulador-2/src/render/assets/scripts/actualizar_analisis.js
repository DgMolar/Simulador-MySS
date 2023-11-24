const { ipcRenderer } = require("electron");
const Chart = require("chart.js/auto");
const regression = require("regression");
const csv = require("csvtojson");
// Para guardar data.json
const remote = require("electron");
const app = remote.app;
const fs = require("fs");
const path = require("path");

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

    ipcRenderer.invoke("get-user-data-path").then((userDataPath) => {
      const dataFilePath = path.join(userDataPath, "datos.json");

      // Verificar si el archivo datos.json existe
      fs.access(dataFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          // El archivo no existe, entonces lo creamos
          fs.writeFile(dataFilePath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
              console.error("Error al crear el archivo datos.json:", err);
            } else {
              console.log("Archivo datos.json creado correctamente.");
              window.location.reload();
            }
          });
        } else {
          // El archivo existe, sobrescribimos los datos
          fs.writeFile(dataFilePath, JSON.stringify(json, null, 2), (err) => {
            if (err) {
              console.error("Error al sobrescribir datos.json:", err);
            } else {
              console.log("Archivo datos.json sobrescrito correctamente.");
              window.location.reload();
            }
          });
        }
      });
    });
  };
});

// cuando el documento se cargue, se ejecutara la funcion
document.addEventListener("DOMContentLoaded", () => {
  // ipcRenderer.invoke para obtener la ruta del directorio de datos del usuario
  ipcRenderer.invoke("get-user-data-path").then((userDataPath) => {
    const filePath = path.join(userDataPath, "datos.json");

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
  datosTotales(json.length);
  const dataJson = json;
  console.log("El data contiene:", dataJson);
  const ano = dataJson.map((objeto) => objeto.año);
  console.log("ano:", ano);

  const datosPreparadosParaGraficar = processJson(json);

  console.log(datosPreparadosParaGraficar);

  const graficaOriginal = generateChart(
    [
      {
        label: "Incidencia de diabetes",
        data: datosPreparadosParaGraficar,
        color: "rgba(255, 99, 132, 1)",
        borderColor: "#A8C6FA",
      },
    ],
    -100,
    2000,
    "Gráfica para Incidencia de diabetes",
    ano
  );
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

  console.log("ESTE SERA EL MODELO", resultadoRegresion);
  // Entrenar modelo
  btnEntrenar = document.getElementById("btnEntrenar");
  btnEntrenar.addEventListener("click", () => {
    entrenarModelo(resultadoRegresion);
    // window.location.reload();
  });
}

function datosTotales(totalTrimestres) {
  let mesesRegistrados = totalTrimestres;
  document.getElementById("trimestresRegistrados").value =
    mesesRegistrados + " Trimestres";
}

function entrenarModelo(resultadoRegresion) {
  ipcRenderer.invoke("get-user-data-path").then((userDataPath) => {
    const dataFilePath = path.join(userDataPath, "model.json");

    // Verificar si el archivo models.json existe
    fs.access(dataFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        // El archivo no existe, entonces lo creamos
        fs.writeFile(
          dataFilePath,
          JSON.stringify(resultadoRegresion, null, 2),
          (err) => {
            if (err) {
              console.error("Error al crear el archivo model.json:", err);
            } else {
              console.log("Archivo model.json creado correctamente.");
              alert("Modelo entrenado correctamente");
            }
          }
        );
      } else {
        // El archivo existe, sobrescribimos los model
        fs.writeFile(
          dataFilePath,
          JSON.stringify(resultadoRegresion, null, 2),
          (err) => {
            if (err) {
              console.error("Error al sobrescribir model.json:", err);
            } else {
              console.log("Archivo model.json sobrescrito correctamente.");
              alert("Modelo entrenado correctamente");
            }
          }
        );
      }
    });
  });
}
