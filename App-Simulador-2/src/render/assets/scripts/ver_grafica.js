const { ipcRenderer } = require("electron");

function consultarDatosIncidencias() {
  ipcRenderer.send("consulta-datos-incidencias");
}
consultarDatosIncidencias();
ipcRenderer.on("consulta-datos-incidencias-respuesta", (event, response) => {
  if (response.success) {
    const data = response.data;
    console.log("Datos de incidencias:", data);
    const chartData = prepararChartData(data);
    updateChartData(chartData);
  } else {
    console.error("Error al consultar datos de incidencias:", response.error);
  }
});

function prepararChartData(data) {
  totalMeses = data.length;
  console.log("Total de meses: ", totalMeses);
  datosTotales(totalMeses);
  // Aquí, haz la lógica para preparar los datos para el gráfico
  const valores = data.map(
    (item) => (item.N_Casos_Diabetes / item.P_Obesas_Riesgo) * 1000
  );
  return {
    labels: data.map((item) => `${item.Fecha}`),
    datasets: [
      {
        label: "Incidencia de personas",
        data: valores,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 5,
      },
    ],
  };
}

function updateChartData(chartData) {
  // Aquí actualiza el gráfico con los nuevos datos
  const selectElement = document.getElementById("grafica-seleccionada");
  const ctx = document.getElementById("myChart").getContext("2d");
  const myChart = new Chart(ctx, {
    type: selectElement.value,
    data: chartData,
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  selectElement.addEventListener("change", function () {
    myChart.config.type = this.value;
    myChart.update();
  });
}

function datosTotales(totalMeses) {
  let mesesRegistrados = totalMeses;
  let rmse = 435;
  let rSquared = 54.34;
  document.getElementById("mesesRegistrados").textContent =
    mesesRegistrados + " Meses";
  document.getElementById("rmse").textContent = rmse.toString();
  document.getElementById("rSquared").textContent = rSquared.toString();
}

module.exports = { consultarDatosIncidencias };
