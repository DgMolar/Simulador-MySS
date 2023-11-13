const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'login.html'));
  mainWindow.webContents.openDevTools();
  console.log('ventana principal creada');

  // Obtener la ruta al directorio de datos del usuario
  const userDataPath = app.getPath('userData');
  // Crear la base de datos en el directorio de datos del usuario
  const dbPath = path.join(userDataPath, 'database.db');

  if (!fs.existsSync(dbPath)) {
    console.log('La base de datos no existe. Creándola...');

    const db = new sqlite3.Database(dbPath);

    // Leer el script.sql y ejecutarlo para crear la estructura inicial
    const scriptPath = path.join(__dirname, 'script.sql');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

    // Ejecutar el script SQL para crear la estructura inicial
    db.exec(scriptContent, (err) => {
      if (err) {
        console.error('Error al ejecutar el script SQL:', err);
      } else {
        console.log('Base de datos creada y estructura inicial aplicada.');
      }
      db.close();
    });
  }
}

app.whenReady().then(() => {
  createWindow();
});

ipcMain.on('auth-request', (event, credentials) => {
  // Obtener la ruta al directorio de datos del usuario
  const userDataPath = app.getPath('userData');
  // Crear la base de datos en el directorio de datos del usuario
  const dbPath = path.join(userDataPath, 'database.db');

  const db = new sqlite3.Database(dbPath);

  db.get('SELECT * FROM usuarios WHERE username = ? AND password = ?', [credentials.username, credentials.password], (err, row) => {
    if (err) {
      console.error('Error al autenticar usuario:', err);
      event.reply('auth-response', { error: err.message });
    } else {
      event.reply('auth-response', { isAuthenticated: !!row });
    }
    db.close();
  });
});
