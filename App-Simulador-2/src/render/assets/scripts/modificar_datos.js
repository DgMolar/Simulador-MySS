const { da } = require("date-fns/locale");
const { ipcRenderer } = require("electron");
const { format, getMonth, getYear } = require("date-fns");
const { actualizarDatosIncidencias } = require('../../../main/databaseQueries');

function consultarDatosIncidencias() {
  ipcRenderer.send("consulta-datos-incidencias");
}
consultarDatosIncidencias();

ipcRenderer.on("consulta-datos-incidencias-respuesta", (event, response) => {
  if (response.success) {
    const tabla = response.data;
    console.log("Datos de incidencias:", tabla);
    const formContainer = document.getElementById("form-container");
    const urlParams = new URLSearchParams(window.location.search);
    const idModificar = parseInt(urlParams.get("idDato"));
    console.log("El id seleccionado es:", idModificar);

    tabla.forEach((info) => {
      if (info.iddato == idModificar) {
        console.log("El id del dato es:", info.iddato);
        const datoFila = document.createElement("div");
        datoFila.classList.add("row");
        datoFila.innerHTML = tablaEditarDatos(info);
        formContainer.append(datoFila);
      }
    });
    guardarDatosIncidencias();
  } else {
    console.error("Error al consultar datos de incidencias:", response.error);
  }
});

function guardarDatosIncidencias() {
    const form = document.getElementById("form-Edit");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const urlParams = new URLSearchParams(window.location.search);
      const idModificar = parseInt(urlParams.get("idDato"));
      const obesidad = document.getElementById("obesidad").value;
      const diabetes = document.getElementById("diabetes").value;
  
      ipcRenderer.send('actualizar-datos-incidencias', { idModificar, obesidad, diabetes });
  
      ipcRenderer.on('actualizar-datos-incidencias-respuesta', (event, response) => {
        if (response.success) {
          alert("Datos actualizados correctamente");
          window.location.href = `actualizar_analisis.html`;
        } else {
          console.error("Error al actualizar datos de incidencias:", response.error);
        }
      });
    });
  }
  
function tablaEditarDatos({
  iddato,
  Fecha,
  N_Casos_Diabetes,
  P_Obesas_Riesgo,
}) {
  const fechaFormateada = new Date(Fecha + 1);
  const mes = format(fechaFormateada, "MMMM"); // Obtener el mes
  const anio = format(fechaFormateada, "yyyy"); // Obtener el año

  return `
            <div class="form-group col-md-6">
            <label for="semana">Mes:</label>
            <input
            type="text"
            class="form-control"
            id="semana"
            placeholder="${mes}"
            readonly
            />
        </div>
        <div class="form-group col-md-6">
            <label for="ano">Año:</label>
            <input
            type="text"
            class="form-control"
            id="ano"
            placeholder="${anio}"
            readonly
            />
        </div>  
        <div class="form-group col-md-6">
            <label for="obesidad">Prevalencia de obesidad:</label>
            <input
            type="text"
            class="form-control"
            id="obesidad"
            placeholder=""
            value="${P_Obesas_Riesgo}"
            />
        </div>
        <div class="form-group col-md-6">
            <label for="diabetes">Prevalencia de diabetes:</label>
            <input
            type="text"
            class="form-control"
            id="diabetes"
            placeholder=""
            value="${N_Casos_Diabetes}"
            />
        </div>
        <div
              class="form-group my-3 col-md-12 d-flex justify-content-center"
            >
              <button id="btn-Guardar" type="submit" class="btn btn-primary">Guardar</button>
            </div>
    `;
}
