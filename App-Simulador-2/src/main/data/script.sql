-- script.sql

-- Estructura de tabla para la tabla `usuarios`
CREATE TABLE IF NOT EXISTS `usuarios` (
  `idusuario` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` TEXT NOT NULL,
  `password` TEXT NOT NULL
);

-- Volcado de datos para la tabla `usuarios`
INSERT OR IGNORE INTO `usuarios` (`username`, `password`) VALUES
('admin', '123'),
('dgmolar', 'admin'),
('emma', 'admin'),
('karen', 'admin'),
('arely', 'admin'),
('luis', 'admin');