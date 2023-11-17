const { app, BrowserWindow, ipcMain } = require("electron");
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
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      contextIsolation: false,
    },
  });
  mainWindow.setMenu(null);
  mainWindow.maximize();
  mainWindow.loadFile(path.join(__dirname, "../auth/login.html"));
  // mainWindow.webContents.openDevTools();

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
}

// Manejo de IPC para la autenticación que ahora está en authHandler.js
require("./authHandler");

//Consulta de datos de incidencias
ipcMain.on("consulta-datos-incidencias", (event) => {
  const db = new sqlite3.Database(dbPath);

  db.all("SELECT * FROM datos_incidencias", (err, rows) => {
    if (err) {
      console.error(err.message);
      event.reply("consulta-datos-incidencias-respuesta", {
        success: false,
        error: err.message,
      });
    } else {
      event.reply("consulta-datos-incidencias-respuesta", {
        success: true,
        data: rows,
      });
    }
    db.close();
  });
});

//Actualizar datos de incidencias
ipcMain.on("actualizar-datos-incidencias", (event, updatedData) => {
  const { idModificar, obesidad, diabetes } = updatedData;

  const db = new sqlite3.Database(dbPath);
  const query = `UPDATE datos_incidencias SET N_Casos_Diabetes = ?, P_Obesas_Riesgo = ? WHERE iddato = ?`;

  db.run(query, [diabetes, obesidad, idModificar], function (err) {
    if (err) {
      console.error(err.message);
      event.reply("actualizar-datos-incidencias-respuesta", {
        success: false,
        error: err.message,
      });
    } else {
      event.reply("actualizar-datos-incidencias-respuesta", { success: true });
    }
    db.close();
  });
});

//Insertar datos de incidencias solo si no existen datos con la misma Fecha
ipcMain.on("insertar-datos-incidencias", (event, newData) => {
  const { obesidad, diabetes, fecha } = newData;

  const db = new sqlite3.Database(dbPath);
  const query = `INSERT INTO datos_incidencias (Fecha, N_Casos_Diabetes, P_Obesas_Riesgo) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT * FROM datos_incidencias WHERE Fecha = ?)`;
  db.run(query, [fecha, obesidad, diabetes, fecha], function (err) {
    if (err) {
      console.error(err.message);
      event.reply("insertar-datos-incidencias-respuesta", {
        success: false,
        error: err.message,
      });
    } else {
      if (this.changes === 0) {
        event.reply("insertar-datos-incidencias-respuesta", {
          success: false,
          error: "La fecha ya ha sido registrada.",
        });
      } else {
        event.reply("insertar-datos-incidencias-respuesta", { success: true });
      }
    }
    db.close();
  });
});
