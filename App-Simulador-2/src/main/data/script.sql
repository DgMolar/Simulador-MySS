-- script.sql

-- Estructura de tabla para la tabla `datos_incidencias`
CREATE TABLE IF NOT EXISTS `datos_incidencias` (
  `iddato` INTEGER PRIMARY KEY AUTOINCREMENT,
  `N_Casos_Diabetes` INTEGER NOT NULL,
  `P_Obesas_Riesgo` INTEGER NOT NULL,
  `Semana` INTEGER NOT NULL,
  `Fecha` TEXT NOT NULL
);

-- Volcado de datos para la tabla `datos_incidencias`
INSERT OR IGNORE INTO `datos_incidencias` (`N_Casos_Diabetes`, `P_Obesas_Riesgo`, `Semana`, `Fecha`) VALUES
(50, 10000, 1, '2023-01-01');

-- Estructura de tabla para la tabla `margen_error`
CREATE TABLE IF NOT EXISTS `margen_error` (
  `idMargen_Error` INTEGER PRIMARY KEY AUTOINCREMENT,
  `RMSE` TEXT NOT NULL,
  `R_Squared` TEXT NOT NULL
);

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
('karen', 'admin');