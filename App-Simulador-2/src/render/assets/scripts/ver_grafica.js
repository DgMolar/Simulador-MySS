document.addEventListener("DOMContentLoaded", function () {
  var selectElement = document.getElementById("grafica-seleccionada");
  var ctx = document.getElementById("myChart").getContext("2d");

  var chartData = {
      type: selectElement.value,
      data: { 
          labels: [
              "Semana 1",
              "Semana 2",
              "Semana 3",
              "Semana 4",
              "Semana 5",
              "Semana 6",
              "Semana 7",
              "Semana 8",
              "Semana 9",
              "Semana 10"
          ],
          datasets: [
              {
                  label: "Incidencia de personas",
                  data: [12, 19, 3, 5, 2, 3, 4, 5, 6, 7],
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
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true,
              },
          },
      },
  };

  var myChart = new Chart(ctx, chartData);

  selectElement.addEventListener("change", function () {
      chartData.type = this.value;
      myChart.destroy(); // Destruye el gráfico actual
      myChart = new Chart(ctx, chartData); // Crea un nuevo gráfico con el tipo actualizado
  });
});
