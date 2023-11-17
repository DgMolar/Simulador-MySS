const { ipcRenderer } = require('electron');

// Enviar una solicitud de consulta al proceso principal
ipcRenderer.send('consulta-incidencias');

// Escuchar la respuesta del proceso principal
ipcRenderer.on('consulta-incidencias-respuesta', (event, response) => {
  if (response.success) {
    const data = response.data;
    // Manipular los datos y mostrarlos en tu interfaz
    // Por ejemplo, podrías actualizar una tabla HTML con estos datos
    console.log(data);
  } else {
    console.error('Error al consultar incidencias:', response.error);
  }
});

const form = document.getElementById('login-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  try {
    const isAuthenticated = await authUser(usernameInput.value, passwordInput.value);
    if (isAuthenticated) {
      alert("Usuario autenticado. Acceso permitido.");
      // transferir a la pagina principal.
      location.href = '../render/assets/pages/index.html';
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  } catch (error) {
    console.error('Error durante la autenticación:', error);
  }
});

function authUser(username, password) {
  return new Promise((resolve, reject) => {
    ipcRenderer.send('auth-request', { username, password });

    ipcRenderer.once('auth-response', (event, data) => {
      if (data.error) {
        reject(new Error(data.error));
      } else {
        resolve(data.isAuthenticated);
      }
    });
  });
}