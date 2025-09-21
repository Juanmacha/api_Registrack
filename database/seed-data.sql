-- =============================================
-- API Registrack v4 - Datos de Ejemplo
-- =============================================

USE registrack_db;

-- =============================================
-- INSERTAR ROLES
-- =============================================
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador del sistema con acceso completo'),
('empleado', 'Empleado de la empresa con acceso limitado'),
('cliente', 'Cliente externo con acceso a sus propios datos');

-- =============================================
-- INSERTAR USUARIOS (contraseñas hasheadas con bcrypt)
-- =============================================
-- Contraseña: admin123
INSERT INTO usuarios (email, password, nombre, telefono) VALUES
('admin@registrack.com', '$2b$10$rQZ8K9vX2mN3pL4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'Administrador del Sistema', '3001234567');

-- Contraseña: empleado123
INSERT INTO usuarios (email, password, nombre, telefono) VALUES
('empleado@registrack.com', '$2b$10$sRZ9L0wY3nO4qM5rS6tU7vX8wY9zA0bC1dE2fG3hI4jK5lM6nO7pQ8rS9tU0vW', 'Empleado de Registrack', '3002345678');

-- Contraseña: cliente123
INSERT INTO usuarios (email, password, nombre, telefono) VALUES
('cliente@ejemplo.com', '$2b$10$tSZ0M1xZ4oP5rN6sT7uV8wX9xZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX', 'Cliente de Prueba', '3003456789');

-- =============================================
-- ASIGNAR ROLES A USUARIOS
-- =============================================
INSERT INTO user_rol (id_usuario, id_rol) VALUES
(1, 1), -- admin@registrack.com -> admin
(2, 2), -- empleado@registrack.com -> empleado
(3, 3); -- cliente@ejemplo.com -> cliente

-- =============================================
-- INSERTAR EMPRESAS
-- =============================================
INSERT INTO empresas (nombre, nit, direccion, telefono, email, ciudad, pais) VALUES
('Registrack Legal S.A.S', '900123456-1', 'Calle 123 #45-67, Oficina 201', '6012345678', 'contacto@registrack.com', 'Bogotá', 'Colombia'),
('Consultoría Jurídica Ltda', '900789012-3', 'Carrera 45 #78-90, Piso 3', '6018765432', 'info@consultoriajuridica.com', 'Medellín', 'Colombia'),
('Estudio Legal Integral', '900456789-5', 'Avenida 68 #12-34, Local 15', '6014567890', 'contacto@estudiolegal.com', 'Cali', 'Colombia');

-- =============================================
-- INSERTAR EMPLEADOS
-- =============================================
INSERT INTO empleados (nombre, documento, tipo_documento, telefono, email, direccion, ciudad, pais, id_empresa) VALUES
('Carlos Mendoza', '12345678', 'Cédula de Ciudadanía', '3001111111', 'carlos.mendoza@registrack.com', 'Calle 100 #15-20', 'Bogotá', 'Colombia', 1),
('Ana García', '87654321', 'Cédula de Ciudadanía', '3002222222', 'ana.garcia@registrack.com', 'Carrera 50 #25-30', 'Bogotá', 'Colombia', 1),
('Luis Rodríguez', '11223344', 'Cédula de Ciudadanía', '3003333333', 'luis.rodriguez@consultoriajuridica.com', 'Calle 80 #40-50', 'Medellín', 'Colombia', 2),
('María López', '44332211', 'Cédula de Ciudadanía', '3004444444', 'maria.lopez@estudiolegal.com', 'Avenida 6N #25-15', 'Cali', 'Colombia', 3);

-- =============================================
-- INSERTAR CLIENTES
-- =============================================
INSERT INTO clientes (nombre, documento, tipo_documento, telefono, email, direccion, ciudad, pais) VALUES
('Juan Pérez', '12345678', 'Cédula de Ciudadanía', '3001234567', 'juan.perez@email.com', 'Calle 123 #45-67', 'Bogotá', 'Colombia'),
('María González', '87654321', 'Cédula de Ciudadanía', '3008765432', 'maria.gonzalez@email.com', 'Carrera 45 #78-90', 'Medellín', 'Colombia'),
('Pedro Ramírez', '11223344', 'Cédula de Ciudadanía', '3001122334', 'pedro.ramirez@email.com', 'Avenida 68 #12-34', 'Cali', 'Colombia'),
('Empresa ABC S.A.S', '800123456-1', 'NIT', '6012345678', 'contacto@empresaabc.com', 'Calle 100 #15-20', 'Bogotá', 'Colombia'),
('Ana Martínez', '55667788', 'Cédula de Ciudadanía', '3005566778', 'ana.martinez@email.com', 'Carrera 50 #25-30', 'Barranquilla', 'Colombia'),
('Roberto Silva', '99887766', 'Cédula de Ciudadanía', '3009988776', 'roberto.silva@email.com', 'Calle 80 #40-50', 'Bucaramanga', 'Colombia');

-- =============================================
-- INSERTAR SERVICIOS
-- =============================================
INSERT INTO servicios (nombre, descripcion, precio_base) VALUES
('Búsqueda de Antecedentes', 'Búsqueda exhaustiva de antecedentes de marcas, patentes y nombres comerciales en bases de datos oficiales', 50000.00),
('Certificación de Marca', 'Proceso completo de certificación y registro de marca comercial ante la Superintendencia de Industria y Comercio', 150000.00),
('Renovación de Marca', 'Renovación de registro de marca comercial existente', 100000.00),
('Cesión de Derechos', 'Proceso de cesión de derechos de propiedad intelectual', 80000.00),
('Oposición', 'Presentación de oposición a solicitudes de registro de marcas o patentes', 120000.00),
('Respuesta a Oposición', 'Respuesta a oposiciones presentadas contra solicitudes de registro', 100000.00),
('Ampliación de Cobertura', 'Ampliación de cobertura de productos o servicios de una marca registrada', 90000.00),
('Registro de Patente', 'Registro de patente de invención o modelo de utilidad', 250000.00),
('Registro de Nombre Comercial', 'Registro de nombre comercial ante la Cámara de Comercio', 75000.00),
('Consulta Legal', 'Consulta especializada en propiedad intelectual', 80000.00);

-- =============================================
-- INSERTAR ÓRDENES DE SERVICIOS
-- =============================================
INSERT INTO ordenes_de_servicios (id_cliente, id_servicio, id_empresa, total_estimado, estado, pais, ciudad, codigo_postal, estado_orden, observaciones) VALUES
(1, 1, 1, 50000.00, 'en_proceso', 'Colombia', 'Bogotá', '110111', 'activa', 'Búsqueda de antecedentes para nueva marca de ropa'),
(2, 2, 1, 150000.00, 'pendiente', 'Colombia', 'Medellín', '050001', 'activa', 'Certificación de marca para empresa de tecnología'),
(3, 3, 2, 100000.00, 'completada', 'Colombia', 'Cali', '760001', 'finalizada', 'Renovación de marca existente'),
(4, 4, 1, 80000.00, 'en_proceso', 'Colombia', 'Bogotá', '110111', 'activa', 'Cesión de derechos de marca entre empresas'),
(5, 5, 2, 120000.00, 'pendiente', 'Colombia', 'Barranquilla', '080001', 'activa', 'Oposición a registro de marca similar'),
(6, 6, 3, 100000.00, 'en_proceso', 'Colombia', 'Bucaramanga', '680001', 'activa', 'Respuesta a oposición presentada'),
(1, 7, 1, 90000.00, 'pendiente', 'Colombia', 'Bogotá', '110111', 'activa', 'Ampliación de cobertura de productos'),
(2, 8, 2, 250000.00, 'en_proceso', 'Colombia', 'Medellín', '050001', 'activa', 'Registro de patente de invención');

-- =============================================
-- INSERTAR CITAS
-- =============================================
INSERT INTO citas (fecha, hora, id_cliente, id_empleado, tipo_cita, descripcion, estado) VALUES
('2024-01-15', '10:00:00', 1, 1, 'Consulta', 'Consulta sobre registro de marca', 'programada'),
('2024-01-16', '14:30:00', 2, 2, 'Revisión', 'Revisión de documentos para certificación', 'programada'),
('2024-01-17', '09:00:00', 3, 1, 'Seguimiento', 'Seguimiento de renovación de marca', 'completada'),
('2024-01-18', '11:00:00', 4, 3, 'Consulta', 'Consulta sobre cesión de derechos', 'programada'),
('2024-01-19', '15:00:00', 5, 2, 'Revisión', 'Revisión de oposición presentada', 'programada'),
('2024-01-20', '08:30:00', 6, 4, 'Consulta', 'Consulta sobre respuesta a oposición', 'programada');

-- =============================================
-- INSERTAR SEGUIMIENTO
-- =============================================
INSERT INTO seguimiento (id_orden_servicio, estado, observaciones) VALUES
(1, 'Solicitud recibida', 'Se recibió la solicitud de búsqueda de antecedentes'),
(1, 'En proceso', 'Iniciando búsqueda en bases de datos oficiales'),
(2, 'Solicitud recibida', 'Se recibió la solicitud de certificación de marca'),
(3, 'Solicitud recibida', 'Se recibió la solicitud de renovación'),
(3, 'En proceso', 'Revisando documentos presentados'),
(3, 'Completada', 'Renovación procesada exitosamente'),
(4, 'Solicitud recibida', 'Se recibió la solicitud de cesión de derechos'),
(4, 'En proceso', 'Revisando documentos de cesión'),
(5, 'Solicitud recibida', 'Se recibió la solicitud de oposición'),
(6, 'Solicitud recibida', 'Se recibió la solicitud de respuesta a oposición'),
(6, 'En proceso', 'Preparando respuesta a oposición'),
(7, 'Solicitud recibida', 'Se recibió la solicitud de ampliación de cobertura'),
(8, 'Solicitud recibida', 'Se recibió la solicitud de registro de patente'),
(8, 'En proceso', 'Revisando documentación técnica de la patente');

-- =============================================
-- INSERTAR SOLICITUDES DE CITAS
-- =============================================
INSERT INTO solicitudes_citas (id_cliente, fecha_preferida, hora_preferida, tipo_consulta, descripcion, estado) VALUES
(1, '2024-01-22', '10:00:00', 'Consulta', 'Necesito consultar sobre el proceso de registro de marca', 'pendiente'),
(2, '2024-01-23', '14:00:00', 'Revisión', 'Revisar documentos para certificación de marca', 'pendiente'),
(3, '2024-01-24', '09:30:00', 'Seguimiento', 'Seguimiento del estado de mi renovación', 'pendiente'),
(4, '2024-01-25', '11:30:00', 'Consulta', 'Consulta sobre cesión de derechos de marca', 'pendiente'),
(5, '2024-01-26', '15:30:00', 'Revisión', 'Revisar estrategia de oposición', 'pendiente');

-- =============================================
-- INSERTAR PAGOS
-- =============================================
INSERT INTO pagos (id_orden_servicio, monto, metodo_pago, estado, fecha_pago, referencia, observaciones) VALUES
(1, 50000.00, 'Transferencia bancaria', 'pagado', '2024-01-10 10:30:00', 'TXN001234567', 'Pago por búsqueda de antecedentes'),
(2, 150000.00, 'Tarjeta de crédito', 'pagado', '2024-01-11 14:20:00', 'TXN001234568', 'Pago por certificación de marca'),
(3, 100000.00, 'Transferencia bancaria', 'pagado', '2024-01-12 09:15:00', 'TXN001234569', 'Pago por renovación de marca'),
(4, 80000.00, 'Efectivo', 'pendiente', NULL, NULL, 'Pago pendiente por cesión de derechos'),
(5, 120000.00, 'Tarjeta de crédito', 'pagado', '2024-01-14 16:45:00', 'TXN001234570', 'Pago por oposición'),
(6, 100000.00, 'Transferencia bancaria', 'pendiente', NULL, NULL, 'Pago pendiente por respuesta a oposición'),
(7, 90000.00, 'Tarjeta de débito', 'pagado', '2024-01-15 11:20:00', 'TXN001234571', 'Pago por ampliación de cobertura'),
(8, 250000.00, 'Transferencia bancaria', 'pagado', '2024-01-16 13:30:00', 'TXN001234572', 'Pago por registro de patente');

-- =============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =============================================
-- Mostrar resumen de datos insertados
SELECT 'Roles' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'User_Rol', COUNT(*) FROM user_rol
UNION ALL
SELECT 'Empresas', COUNT(*) FROM empresas
UNION ALL
SELECT 'Empleados', COUNT(*) FROM empleados
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Servicios', COUNT(*) FROM servicios
UNION ALL
SELECT 'Órdenes de Servicios', COUNT(*) FROM ordenes_de_servicios
UNION ALL
SELECT 'Citas', COUNT(*) FROM citas
UNION ALL
SELECT 'Seguimiento', COUNT(*) FROM seguimiento
UNION ALL
SELECT 'Solicitudes Citas', COUNT(*) FROM solicitudes_citas
UNION ALL
SELECT 'Pagos', COUNT(*) FROM pagos;
