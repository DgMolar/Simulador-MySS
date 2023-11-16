const { ipcRenderer } = require('electron');

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
