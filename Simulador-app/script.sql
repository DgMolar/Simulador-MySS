-- script.sql

-- Crear la tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
);

-- Insertar el usuario solo si no existe
INSERT OR IGNORE INTO usuarios (username, password) VALUES ('admin', '12345');
