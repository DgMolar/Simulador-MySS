const { ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');

ipcMain.on('auth-request', (event, credentials) => {
  const userDataPath = app.getPath('userData');
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
