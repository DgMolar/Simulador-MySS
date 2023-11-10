const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'MyDatabase.db');
const db = new sqlite3.Database(dbPath);

const form = document.getElementById('login-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  try {
    const isAuthenticated = await authUser(usernameInput.value, passwordInput.value);
    if(isAuthenticated){
      alert("Usuario autenticado. Acceso permitido.");
      location.reload();
    } else {
      alert("Usuario o contraseña incorrectos");
    }
    //console.log(isAuthenticated ? 'Usuario autenticado. Acceso permitido.' : 'Usuario no autenticado. Acceso denegado.');
  } catch (error) {
    console.error('Error durante la autenticación:', error);
  }
});

function authUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) {
        console.error('Error al autenticar usuario:', err);
        reject(err);
      } else {
        resolve(!!row); // Simplifica la lógica para devolver true o false directamente
      }
    });
  });
}
