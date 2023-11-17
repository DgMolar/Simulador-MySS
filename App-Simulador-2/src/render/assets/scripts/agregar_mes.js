const { ipcRenderer } = require("electron");


  

const form = document.getElementById("addData-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const obesidad = document.getElementById("obesidad").value;
  const diabetes = document.getElementById("diabetes").value;
  let fecha = document.getElementById("fecha").value;

  // Si el valor de fecha solo contiene YYYY-MM, agregamos el día "01" por defecto
  if (fecha.length === 7) {
    fecha += "-01";
  }
  console.log("La Fecha seleccionada es:", fecha);
  console.log("La obesidad seleccionada es:", obesidad);
    console.log("La diabetes seleccionada es:", diabetes);
  
  // Enviar los datos al proceso principal
  guardarDatosIncidencias(obesidad, diabetes, fecha);
  // Escuchar la respuesta del proceso principal
ipcRenderer.on('insertar-datos-incidencias-respuesta', (event, data) => {
    console.log('Recibida respuesta de inserción con datos:', data);
    if (data.success) {
      alert('Datos insertados exitosamente.');
      // Redirigir a otra página
      window.location.href = 'actualizar_analisis.html'; 
    } else {
      if (data.error === 'La fecha ya existe.') {
        alert('Error: ' + data.error);
      } else {
        alert('Error al insertar datos: ' + data.error);
        window.location.href = 'agregar_mes.html';
      }
    }
  });
});

function guardarDatosIncidencias(obesidad, diabetes, fecha) {
  ipcRenderer.send("insertar-datos-incidencias", { obesidad, diabetes, fecha });
}
