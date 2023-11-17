const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let mainWindow;
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'database.db');

app.whenReady().then(() => {
  createWindow();
});

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
  mainWindow.loadFile(path.join(__dirname, '../auth/login.html'));
  // Maximizar la ventana
  mainWindow.maximize();
  mainWindow.webContents.openDevTools();
  console.log('ventana principal creada');

  if (!fs.existsSync(dbPath)) {
    console.log('La base de datos no existe. Creándola...');

    const db = new sqlite3.Database(dbPath);

    const scriptPath = path.join(__dirname, 'data/script.sql');
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

    db.exec(scriptContent, (err) => {
      if (err) {
        console.error('Error al ejecutar el script SQL:', err);
      } else {
        console.log('Base de datos creada y estructura inicial aplicada.');
      }
      db.close();
    });
  } else {
    console.log('La base de datos ya existe.');
  }
}

// Manejo de IPC para la autenticación que ahora está en authHandler.js
require('./authHandler');

//Consulta de datos de incidencias
ipcMain.on('consulta-datos-incidencias', (event) => {
  const db = new sqlite3.Database(dbPath);

  db.all('SELECT * FROM datos_incidencias', (err, rows) => {
    if (err) {
      console.error(err.message);
      event.reply('consulta-datos-incidencias-respuesta', { success: false, error: err.message });
    } else {
      event.reply('consulta-datos-incidencias-respuesta', { success: true, data: rows });
    }
    db.close();
  });
});
