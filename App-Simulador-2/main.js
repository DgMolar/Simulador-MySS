const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos y ejecutar el script SQL
function createWindow() {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false, // Esto permite el uso de require en el proceso de renderizado
      }
    });
  
    win.loadFile('login.html');
  
    win.webContents.openDevTools();
  
   
  
    // Conectar a la base de datos y ejecutar el script SQL
    const db = new sqlite3.Database('MyDatabase.db');
    const scriptPath = path.join(__dirname, 'script.sql');
    const script = fs.readFileSync(scriptPath, 'utf8');
  
    db.exec(script, (err) => {
      if (err) {
        console.error('Error ejecutando el script SQL:', err);
      } else {
        console.log('Script SQL ejecutado correctamente');
        // Mostrar alerta de éxito
        // dialog.showMessageBox({
        //   type: 'info',
        //   message: 'Conexión a la base de datos establecida con éxito.',
        //   buttons: ['OK'],
        // });
      }
  
      // Cerrar la conexión a la base de datos después de ejecutar el script
      db.close();
    });
  }
  
  app.whenReady().then(createWindow);