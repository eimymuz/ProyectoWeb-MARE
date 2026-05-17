-- =========================================
-- SEED DE SOLICITUDES PENDIENTES — MARE
-- 30 solicitudes con clientes y barcos variados
-- Ejecutar después de tener los tipos de barco cargados
-- =========================================

-- Limpia datos anteriores de prueba (opcional)
-- DELETE FROM solicitud; DELETE FROM embarcacion; DELETE FROM clientes;

SET FOREIGN_KEY_CHECKS = 0;

-- =========================================
-- CLIENTES (30 clientes variados)
-- =========================================
INSERT INTO clientes (fullname, email, telefono) VALUES
('JAMES MORRISON', 'james.morrison@email.com', '3221234567'),
('SARAH CONNORS', 'sarah.connors@email.com', '3229876543'),
('RODRIGO PEREIRA', 'rodrigo.pereira@email.com', '3221112233'),
('MICHAEL TORRES', 'michael.torres@email.com', '3224445566'),
('ELENA VASQUEZ', 'elena.vasquez@email.com', '3227778899'),
('WILLIAM BANKS', 'william.banks@email.com', '3220001122'),
('PRIYA SHARMA', 'priya.sharma@email.com', '3223334455'),
('LUCAS FERNANDEZ', 'lucas.fernandez@email.com', '3226667788'),
('CAMILA REYES', 'camila.reyes@email.com', '3229990011'),
('ANDRE DUPONT', 'andre.dupont@email.com', '3222223344'),
('SOFIA JIMENEZ', 'sofia.jimenez@email.com', '3225556677'),
('CARLOS MENDOZA', 'carlos.mendoza@email.com', '3228889900'),
('ANNA PETROV', 'anna.petrov@email.com', '3221234568'),
('DIEGO MORALES', 'diego.morales@email.com', '3224567890'),
('ISABELLA MARINO', 'isabella.marino@email.com', '3227890123'),
('THOMAS WEBER', 'thomas.weber@email.com', '3220123456'),
('VALENTINA CRUZ', 'valentina.cruz@email.com', '3223456789'),
('OMAR HASSAN', 'omar.hassan@email.com', '3226789012'),
('NATALIA GOMEZ', 'natalia.gomez@email.com', '3229012345'),
('PATRICK LEROY', 'patrick.leroy@email.com', '3222345678'),
('MARINA SILVA', 'marina.silva@email.com', '3225678901'),
('ROBERTO VEGA', 'roberto.vega@email.com', '3228901234'),
('CLAUDIA HERRERA', 'claudia.herrera@email.com', '3221357900'),
('SAMUEL ORTIZ', 'samuel.ortiz@email.com', '3224680123'),
('DANIELA FLORES', 'daniela.flores@email.com', '3227913456'),
('FRANK MUELLER', 'frank.mueller@email.com', '3220246789'),
('ALEJANDRA RUIZ', 'alejandra.ruiz@email.com', '3223579012'),
('VICTOR CASTRO', 'victor.castro@email.com', '3226802345'),
('BEATRIZ SANTOS', 'beatriz.santos@email.com', '3229135678'),
('JUAN PABLO RIOS', 'juanpablo.rios@email.com', '3222468901');

-- =========================================
-- EMBARCACIONES (30 barcos variados)
-- tipo_barco IDs: 1=YATE, 2=VELERO, 3=LANCHA, 4=CATAMARÁN, 5=MOTONAVE
-- =========================================
INSERT INTO embarcacion (cliente_id, tipo_barco_id, nombre_bote, eslora, manga, calado) VALUES
-- Yates grandes
((SELECT id FROM clientes WHERE email='james.morrison@email.com'),      1, 'SEA HAWK',       26.0, 7.5, 2.8),
((SELECT id FROM clientes WHERE email='sarah.connors@email.com'),       1, 'BAHIA GRANDE',   28.5, 8.0, 3.0),
((SELECT id FROM clientes WHERE email='rodrigo.pereira@email.com'),     1, 'POSEIDON',       22.0, 6.5, 2.5),
((SELECT id FROM clientes WHERE email='michael.torres@email.com'),      1, 'VIENTO SUR',     18.5, 5.5, 2.2),
-- Veleros
((SELECT id FROM clientes WHERE email='elena.vasquez@email.com'),       2, 'ESPERANZA',      15.0, 4.5, 2.0),
((SELECT id FROM clientes WHERE email='william.banks@email.com'),       2, 'LIBERTAD',       17.5, 5.0, 2.3),
((SELECT id FROM clientes WHERE email='priya.sharma@email.com'),        2, 'AURORA BOREAL',  12.0, 3.8, 1.8),
((SELECT id FROM clientes WHERE email='lucas.fernandez@email.com'),     2, 'MAR ABIERTO',    19.0, 5.5, 2.4),
((SELECT id FROM clientes WHERE email='camila.reyes@email.com'),        2, 'BRISA MARINA',   14.5, 4.2, 1.9),
-- Lanchas
((SELECT id FROM clientes WHERE email='andre.dupont@email.com'),        3, 'TRUENO AZUL',     8.0, 2.8, 0.8),
((SELECT id FROM clientes WHERE email='sofia.jimenez@email.com'),       3, 'RAPIDO',          7.5, 2.5, 0.7),
((SELECT id FROM clientes WHERE email='carlos.mendoza@email.com'),      3, 'DELFIN',          9.0, 3.0, 0.9),
((SELECT id FROM clientes WHERE email='anna.petrov@email.com'),         3, 'CENTELLA',        6.5, 2.2, 0.6),
((SELECT id FROM clientes WHERE email='diego.morales@email.com'),       3, 'RELAMPAGO',       8.5, 2.7, 0.8),
-- Catamaranes
((SELECT id FROM clientes WHERE email='isabella.marino@email.com'),     4, 'DOBLE VELA',     16.0, 8.0, 1.2),
((SELECT id FROM clientes WHERE email='thomas.weber@email.com'),        4, 'PACIFICO',       18.0, 9.0, 1.4),
((SELECT id FROM clientes WHERE email='valentina.cruz@email.com'),      4, 'HORIZONTE',      14.0, 7.5, 1.1),
((SELECT id FROM clientes WHERE email='omar.hassan@email.com'),         4, 'GEMELOS',        20.0, 10.0, 1.5),
-- Motonaves
((SELECT id FROM clientes WHERE email='natalia.gomez@email.com'),       5, 'CRONOS',         30.0, 9.0, 3.5),
((SELECT id FROM clientes WHERE email='patrick.leroy@email.com'),       5, 'TITAN',          35.0, 10.5, 4.0),
((SELECT id FROM clientes WHERE email='marina.silva@email.com'),        5, 'NEPTUNO',        28.0, 8.5, 3.2),
((SELECT id FROM clientes WHERE email='roberto.vega@email.com'),        5, 'GOLIATH',        40.0, 12.0, 4.5),
-- Más variedad
((SELECT id FROM clientes WHERE email='claudia.herrera@email.com'),     1, 'ESTRELLA DEL MAR', 24.0, 7.0, 2.7),
((SELECT id FROM clientes WHERE email='samuel.ortiz@email.com'),        2, 'VELA BLANCA',    16.5, 4.8, 2.1),
((SELECT id FROM clientes WHERE email='daniela.flores@email.com'),      3, 'COLIBRÍ',         7.0, 2.3, 0.7),
((SELECT id FROM clientes WHERE email='frank.mueller@email.com'),       4, 'CUATRO VIENTOS', 17.0, 8.5, 1.3),
((SELECT id FROM clientes WHERE email='alejandra.ruiz@email.com'),      1, 'BELLA VITA',     21.0, 6.2, 2.4),
((SELECT id FROM clientes WHERE email='victor.castro@email.com'),       5, 'LEVIATÁN',       32.0, 9.5, 3.8),
((SELECT id FROM clientes WHERE email='beatriz.santos@email.com'),      2, 'SIRENA',         13.5, 4.0, 1.7),
((SELECT id FROM clientes WHERE email='juanpablo.rios@email.com'),      3, 'TORMENTA',        9.5, 3.2, 1.0);

-- =========================================
-- SOLICITUDES PENDIENTES (30 solicitudes)
-- Fechas variadas de llegada y salida en mayo-julio 2026
-- =========================================
INSERT INTO solicitud (embarcacion_id, fecha_llegada, fecha_salida, comentario, estado, primera_entrada_mexico) VALUES
((SELECT id FROM embarcacion WHERE nombre_bote='SEA HAWK'),         '2026-05-20', '2026-06-05', 'SOLICITO ESPACIO AMPLIO CERCA DE LA ENTRADA', 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='BAHIA GRANDE'),     '2026-05-22', '2026-06-10', NULL, 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='POSEIDON'),         '2026-05-25', '2026-06-15', 'PRIMERA VEZ EN LA MARINA', 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='VIENTO SUR'),       '2026-05-28', '2026-06-08', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='ESPERANZA'),        '2026-06-01', '2026-06-20', 'NECESITO CONEXION ELECTRICA EN EL MUELLE', 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='LIBERTAD'),         '2026-06-03', '2026-06-18', NULL, 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='AURORA BOREAL'),    '2026-06-05', '2026-06-25', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='MAR ABIERTO'),      '2026-06-08', '2026-07-01', 'VENIMOS DE PANAMA', 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='BRISA MARINA'),     '2026-06-10', '2026-06-28', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='TRUENO AZUL'),      '2026-05-21', '2026-05-30', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='RAPIDO'),           '2026-05-23', '2026-06-02', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='DELFIN'),           '2026-05-26', '2026-06-05', 'VISITA DE FIN DE SEMANA EXTENDIDO', 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='CENTELLA'),         '2026-05-29', '2026-06-07', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='RELAMPAGO'),        '2026-06-02', '2026-06-12', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='DOBLE VELA'),       '2026-06-04', '2026-06-22', 'GRUPO FAMILIAR CON NINOS', 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='PACIFICO'),         '2026-06-07', '2026-06-30', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='HORIZONTE'),        '2026-06-09', '2026-06-27', NULL, 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='GEMELOS'),          '2026-06-12', '2026-07-05', 'TRAVESIA DESDE CABO SAN LUCAS', 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='CRONOS'),           '2026-05-24', '2026-06-14', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='TITAN'),            '2026-05-27', '2026-06-20', 'EMBARCACION COMERCIAL PRIVADA', 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='NEPTUNO'),          '2026-05-30', '2026-06-18', NULL, 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='GOLIATH'),          '2026-06-06', '2026-07-10', 'REQUIERE MUELLE REFORZADO', 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='ESTRELLA DEL MAR'), '2026-06-11', '2026-06-29', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='VELA BLANCA'),      '2026-06-13', '2026-07-03', NULL, 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='COLIBRÍ'),          '2026-05-22', '2026-05-31', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='CUATRO VIENTOS'),   '2026-06-15', '2026-07-08', 'PRIMERA ENTRADA A MEXICO', 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='BELLA VITA'),       '2026-06-17', '2026-07-12', NULL, 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='LEVIATÁN'),         '2026-06-19', '2026-07-15', 'EMBARCACION DE GRAN CALADO', 'PENDIENTE', 0),
((SELECT id FROM embarcacion WHERE nombre_bote='SIRENA'),           '2026-06-21', '2026-07-10', NULL, 'PENDIENTE', 1),
((SELECT id FROM embarcacion WHERE nombre_bote='TORMENTA'),         '2026-05-20', '2026-05-28', NULL, 'PENDIENTE', 0);

SET FOREIGN_KEY_CHECKS = 1;
