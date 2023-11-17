const { ipcRenderer } = require("electron");
const { format, getMonth, getYear } = require("date-fns");

function consultarDatosIncidencias() {
  ipcRenderer.send("consulta-datos-incidencias");
}
consultarDatosIncidencias();

ipcRenderer.on("consulta-datos-incidencias-respuesta", (event, response) => {
  if (response.success) {
    const tabla = response.data;
    totalMeses = tabla.length;
    console.log("Total de meses: ", totalMeses);
    datosTotales(totalMeses);
    console.log("Datos de incidencias:", tabla);
    const tablaContainer = document.getElementById("tablaDatos");

    tabla.forEach((info) => {
      const datoFila = document.createElement("tr");
      datoFila.innerHTML = tablaDatos(info);
      tablaContainer.append(datoFila);
    });
  } else {
    console.error("Error al consultar datos de incidencias:", response.error);
  }
});

function tablaDatos({ iddato, Fecha, N_Casos_Diabetes, P_Obesas_Riesgo }) {
  const fechaFormateada = new Date(Fecha + 1);
  const mes = format(fechaFormateada, "MMMM"); // Obtener el mes
  const anio = format(fechaFormateada, "yyyy"); // Obtener el año

  return `
      <td>${mes}</td>
      <td>${anio}</td>
      <td>${N_Casos_Diabetes}</td>
      <td>${P_Obesas_Riesgo}</td>
      <td>
        <a href="modificar_mes.html?idDato=${iddato}" class="btn btn-primary">
          <i class="fas fa-edit"></i>
        </a>
      </td>
    `;
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
