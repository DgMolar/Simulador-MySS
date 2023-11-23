const { app, BrowserWindow, ipcMain, ipcRenderer } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

let mainWindow;
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "database.db");

app.whenReady().then(() => {
  createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // resizable: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
    },
  });
  // mainWindow.setMenu(null);
  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, "../auth/login.html"));
  mainWindow.webContents.openDevTools();

  if (!fs.existsSync(dbPath)) {
    console.log("La base de datos no existe. Creándola...");

    const db = new sqlite3.Database(dbPath);

    const scriptPath = path.join(__dirname, "data/script.sql");
    const scriptContent = fs.readFileSync(scriptPath, "utf-8");

    db.exec(scriptContent, (err) => {
      if (err) {
        console.error("Error al ejecutar el script SQL:", err);
      } else {
        console.log("Base de datos creada y estructura inicial aplicada.");
      }
      db.close();
    });
  } else {
    console.log("La base de datos ya existe.");
  }
  ipcMain.handle('get-user-data-path', (event) => {
    return app.getPath('userData');
  });
}

// Manejo de IPC para la autenticación que ahora está en authHandler.js
require("./authHandler");