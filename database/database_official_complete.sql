-- =============================================
-- API REGISTRACK - SCHEMA OFICIAL Y COMPLETO
-- Versión: 7.0 (30 Octubre 2025)
-- Base de datos MySQL con todas las entidades y relaciones
-- =============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS registrack_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE registrack_db;

-- =============================================
-- TABLA: roles
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_roles_nombre (nombre),
    INDEX idx_roles_estado (estado)
);

-- =============================================
-- TABLA: tipo_archivos
-- =============================================
CREATE TABLE IF NOT EXISTS tipo_archivos (
    id_tipo_archivo INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_tipo_archivos_descripcion (descripcion),
    INDEX idx_tipo_archivos_descripcion (descripcion)
);

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    tipo_documento VARCHAR(10) NOT NULL,
    documento BIGINT NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(225) NOT NULL UNIQUE,
    contrasena VARCHAR(225) NOT NULL,
    resetPasswordToken VARCHAR(255) NULL,
    resetPasswordExpires DATETIME NULL,
    id_rol INT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_usuarios_correo (correo),
    INDEX idx_usuarios_documento (documento),
    INDEX idx_usuarios_rol (id_rol),
    INDEX idx_usuarios_estado (estado)
);

-- =============================================
-- TABLA: permisos
-- =============================================
CREATE TABLE IF NOT EXISTS permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_permisos_nombre (nombre)
);

-- =============================================
-- TABLA: privilegios
-- =============================================
CREATE TABLE IF NOT EXISTS privilegios (
    id_privilegio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_privilegios_nombre (nombre)
);

-- =============================================
-- TABLA INTERMEDIA: rol_permisos_privilegios
-- =============================================
CREATE TABLE IF NOT EXISTS rol_permisos_privilegios (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    id_privilegio INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_rol, id_permiso, id_privilegio),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_privilegio) REFERENCES privilegios(id_privilegio) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_rol_perm_priv_rol (id_rol),
    INDEX idx_rol_perm_priv_permiso (id_permiso),
    INDEX idx_rol_perm_priv_privilegio (id_privilegio)
);

-- =============================================
-- TABLA: empresas
-- =============================================
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nit BIGINT NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    tipo_empresa VARCHAR(50) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Colombia',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_empresas_nit (nit),
    INDEX idx_empresas_nombre (nombre),
    INDEX idx_empresas_activo (activo)
);

-- =============================================
-- TABLA: empleados
-- =============================================
CREATE TABLE IF NOT EXISTS empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_empleados_usuario (id_usuario),
    INDEX idx_empleados_estado (estado)
);

-- =============================================
-- TABLA: clientes
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    marca VARCHAR(50),
    tipo_persona ENUM('Natural', 'Jurídica') NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    origen ENUM('solicitud', 'directo', 'importado') NOT NULL DEFAULT 'directo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_clientes_usuario (id_usuario),
    INDEX idx_clientes_tipo_persona (tipo_persona),
    INDEX idx_clientes_estado (estado),
    INDEX idx_clientes_origen (origen)
);

-- =============================================
-- TABLA INTERMEDIA: empresa_clientes
-- =============================================
CREATE TABLE IF NOT EXISTS empresa_clientes (
    id_empresa_cliente INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_cliente INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    
    UNIQUE KEY unique_empresa_cliente (id_empresa, id_cliente),
    INDEX idx_empresa_clientes_empresa (id_empresa),
    INDEX idx_empresa_clientes_cliente (id_cliente)
);

-- =============================================
-- TABLA: servicios
-- =============================================
CREATE TABLE IF NOT EXISTS servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    descripcion_corta TEXT,
    visible_en_landing BOOLEAN DEFAULT true,
    landing_data JSON,
    info_page_data JSON,
    route_path VARCHAR(255),
    precio_base DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_servicios_nombre (nombre),
    INDEX idx_servicios_estado (estado),
    INDEX idx_servicios_precio (precio_base),
    INDEX idx_servicios_visible (visible_en_landing)
);

-- =============================================
-- TABLA: procesos (process_states)
-- =============================================
CREATE TABLE IF NOT EXISTS procesos (
    id_proceso INT AUTO_INCREMENT PRIMARY KEY,
    servicio_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    order_number INT NOT NULL,
    status_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (servicio_id) REFERENCES servicios(id_servicio) ON DELETE CASCADE,
    
    INDEX idx_procesos_servicio (servicio_id),
    INDEX idx_procesos_nombre (nombre),
    INDEX idx_procesos_order (order_number),
    INDEX idx_procesos_status (status_key)
);

-- =============================================
-- TABLA PIVOTE: servicio_procesos (configuración global)
-- =============================================
CREATE TABLE IF NOT EXISTS servicio_procesos (
    id_servicio INT NOT NULL,
    id_proceso INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_servicio, id_proceso),
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_servicio_procesos_servicio (id_servicio),
    INDEX idx_servicio_procesos_proceso (id_proceso)
);

-- =============================================
-- TABLA: ordenes_de_servicios
-- =============================================
CREATE TABLE IF NOT EXISTS ordenes_de_servicios (
    id_orden_servicio INT AUTO_INCREMENT PRIMARY KEY,
    numero_expediente VARCHAR(50) UNIQUE,
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,
    id_empresa INT NOT NULL,
    id_empleado_asignado INT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_estimado DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    pais VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    
    -- Campos editables para información del solicitante
    tipodepersona VARCHAR(20),
    tipodedocumento VARCHAR(10),
    numerodedocumento VARCHAR(20),
    nombrecompleto VARCHAR(100),
    correoelectronico VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    
    -- Campos editables para información de la empresa
    tipodeentidadrazonsocial VARCHAR(50),
    nombredelaempresa VARCHAR(100),
    nit VARCHAR(20),
    
    -- Campos editables para documentos de poder
    poderdelrepresentanteautorizado TEXT,
    poderparaelregistrodelamarca TEXT,
    
    -- *** FASE 1: CAMPOS CRÍTICOS ***
    -- Campos de Marca/Producto
    nombredelamarca VARCHAR(100),
    clase_niza VARCHAR(50),
    tipo_producto_servicio VARCHAR(50),
    -- Campos de Documentos
    logotipo TEXT,
    -- Campos de Representantes
    representante_legal VARCHAR(100),
    -- *** FASE 2: CAMPOS IMPORTANTES ***
    -- Campos de Documentos
    certificado_camara_comercio TEXT,
    certificado_renovacion TEXT,
    documento_cesion TEXT,
    documentos_oposicion TEXT,
    soportes TEXT,
    -- Campos de Expedientes/Referencias
    numero_expediente_marca VARCHAR(50),
    marca_a_oponerse VARCHAR(100),
    marca_opositora VARCHAR(100),
    numero_registro_existente VARCHAR(50),
    -- Campos de auditoría para anulaciones
    anulado_por INT NULL,
    fecha_anulacion DATETIME NULL,
    motivo_anulacion TEXT,
    -- *** FASE 3: CAMPOS ESPECÍFICOS ***
    -- Campos de Cesionario
    nombre_razon_social_cesionario VARCHAR(100),
    nit_cesionario VARCHAR(20),
    tipo_documento_cesionario VARCHAR(10),
    numero_documento_cesionario VARCHAR(20),
    correo_cesionario VARCHAR(100),
    telefono_cesionario VARCHAR(20),
    direccion_cesionario TEXT,
    representante_legal_cesionario VARCHAR(100),
    -- Campos de Argumentos/Descripción
    argumentos_respuesta TEXT,
    descripcion_nuevos_productos_servicios TEXT,
    -- Campos de Clases Niza
    clase_niza_actual VARCHAR(50),
    nuevas_clases_niza VARCHAR(200),
    -- Otros campos
    documento_nit_titular VARCHAR(20),
    numero_nit_cedula VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado_asignado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (anulado_por) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_ordenes_cliente (id_cliente),
    INDEX idx_ordenes_servicio (id_servicio),
    INDEX idx_ordenes_empresa (id_empresa),
    INDEX idx_ordenes_empleado (id_empleado_asignado),
    INDEX idx_ordenes_fecha (fecha_creacion),
    INDEX idx_ordenes_estado (estado),
    INDEX idx_ordenes_expediente (numero_expediente),
    INDEX idx_ordenes_cliente_estado (id_cliente, estado),
    INDEX idx_ordenes_empresa_fecha (id_empresa, fecha_creacion),
    INDEX idx_ordenes_anulado_por (anulado_por),
    INDEX idx_ordenes_fecha_anulacion (fecha_anulacion)
);

-- =============================================
-- TABLA: detalles_ordenes_servicio
-- =============================================
CREATE TABLE IF NOT EXISTS detalles_ordenes_servicio (
    id_detalle_orden INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_servicio INT NOT NULL,
    id_servicio INT NOT NULL,
    estado VARCHAR(100) NOT NULL DEFAULT 'Pendiente',
    fecha_estado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_detalles_orden (id_orden_servicio),
    INDEX idx_detalles_servicio (id_servicio),
    INDEX idx_detalles_estado (estado),
    INDEX idx_detalles_orden_estado (id_orden_servicio, estado)
);

-- =============================================
-- TABLA: detalle_servicios_orden_procesos
-- =============================================
CREATE TABLE IF NOT EXISTS detalle_servicios_orden_procesos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    id_proceso INT NOT NULL,
    id_detalle_orden INT NOT NULL,
    monto_a_pagar DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_detalle_orden) REFERENCES detalles_ordenes_servicio(id_detalle_orden) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_proceso) REFERENCES procesos(id_proceso) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_detalle_procesos_detalle (id_detalle_orden),
    INDEX idx_detalle_procesos_proceso (id_proceso)
);

-- =============================================
-- TABLA: citas
-- =============================================
CREATE TABLE IF NOT EXISTS citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo ENUM('General', 'Busqueda', 'Ampliacion', 'Certificacion', 'Renovacion', 'Cesion', 'Oposicion', 'Respuesta de oposicion') NOT NULL,
    modalidad ENUM('Virtual', 'Presencial') NOT NULL,
    estado ENUM('Programada', 'Reprogramada', 'Anulada') DEFAULT 'Programada',
    observacion VARCHAR(200),
    id_cliente INT NOT NULL,
    id_empleado INT,
    id_orden_servicio INT NULL COMMENT 'ID de la orden de servicio asociada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_citas_fecha (fecha),
    INDEX idx_citas_cliente (id_cliente),
    INDEX idx_citas_empleado (id_empleado),
    INDEX idx_citas_orden (id_orden_servicio),
    INDEX idx_citas_estado (estado),
    INDEX idx_citas_tipo (tipo),
    INDEX idx_citas_fecha_estado (fecha, estado)
);

-- =============================================
-- TABLA: solicitudes_citas
-- =============================================
CREATE TABLE IF NOT EXISTS solicitudes_citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_solicitada DATE NOT NULL,
    hora_solicitada TIME NOT NULL,
    tipo ENUM('General', 'Busqueda', 'Ampliacion', 'Certificacion', 'Renovacion', 'Cesion', 'Oposicion', 'Respuesta de oposicion') NOT NULL,
    modalidad ENUM('Virtual', 'Presencial') NOT NULL,
    descripcion TEXT,
    estado ENUM('Pendiente', 'Aprobada', 'Rechazada') DEFAULT 'Pendiente',
    observacion_admin TEXT,
    id_cliente INT NOT NULL,
    id_empleado_asignado INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado_asignado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_solicitudes_citas_fecha (fecha_solicitada),
    INDEX idx_solicitudes_citas_cliente (id_cliente),
    INDEX idx_solicitudes_citas_empleado (id_empleado_asignado),
    INDEX idx_solicitudes_citas_estado (estado)
);

-- =============================================
-- TABLA: seguimientos
-- =============================================
CREATE TABLE IF NOT EXISTS seguimientos (
    id_seguimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_servicio INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    documentos_adjuntos TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    registrado_por INT NOT NULL,
    nuevo_estado VARCHAR(100),
    estado_anterior VARCHAR(100),
    observaciones TEXT,
    id_usuario INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_seguimientos_orden (id_orden_servicio),
    INDEX idx_seguimientos_registrado_por (registrado_por),
    INDEX idx_seguimientos_fecha (fecha_registro),
    INDEX idx_seguimientos_orden_fecha (id_orden_servicio, fecha_registro)
);

-- =============================================
-- TABLA: pagos
-- =============================================
CREATE TABLE IF NOT EXISTS pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_servicio INT NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    metodo_pago ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Cheque') NOT NULL,
    estado ENUM('Pendiente', 'Pagado', 'Rechazado', 'Reembolsado') DEFAULT 'Pendiente',
    fecha_pago DATETIME NULL,
    referencia VARCHAR(255),
    comprobante_url VARCHAR(500),
    observaciones TEXT,
    transaction_id VARCHAR(255) NULL COMMENT 'ID de transacción de la pasarela',
    gateway VARCHAR(50) NULL COMMENT 'Pasarela usada (paypal, stripe, wompi, manual, mock)',
    gateway_data JSON NULL COMMENT 'Datos adicionales de la pasarela',
    verified_at DATETIME NULL COMMENT 'Fecha de verificación del pago',
    verified_by INT NULL COMMENT 'Usuario que verificó el pago (manual)',
    verification_method ENUM('gateway', 'manual', 'mock') DEFAULT 'mock' COMMENT 'Método de verificación',
    numero_comprobante VARCHAR(50) UNIQUE NULL COMMENT 'Número único de comprobante',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_pagos_orden (id_orden_servicio),
    INDEX idx_pagos_estado (estado),
    INDEX idx_pagos_fecha (fecha_pago),
    INDEX idx_pagos_metodo (metodo_pago),
    INDEX idx_pagos_transaction (transaction_id),
    INDEX idx_pagos_gateway (gateway),
    INDEX idx_pagos_comprobante (numero_comprobante),
    INDEX idx_pagos_verification (verification_method),
    INDEX idx_pagos_orden_estado (id_orden_servicio, estado)
);

-- =============================================
-- TABLA: archivos
-- =============================================
CREATE TABLE IF NOT EXISTS archivos (
    id_archivo INT AUTO_INCREMENT PRIMARY KEY,
    url_archivo VARCHAR(255) NOT NULL,
    fecha_subida DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_tipo_archivo INT NOT NULL,
    id_cliente INT NOT NULL,
    id_orden_servicio INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uq_archivos_url (url_archivo),
    FOREIGN KEY (id_tipo_archivo) REFERENCES tipo_archivos(id_tipo_archivo) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_archivos_cliente (id_cliente),
    INDEX idx_archivos_orden (id_orden_servicio),
    INDEX idx_archivos_tipo (id_tipo_archivo)
);

-- =============================================
-- TABLA: notificaciones
-- =============================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_servicio INT NOT NULL,
    tipo_notificacion ENUM('asignacion_empleado', 'nueva_solicitud', 'cambio_estado', 'anulacion_solicitud') NOT NULL,
    destinatario_email VARCHAR(255) NOT NULL,
    asunto VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_envio ENUM('pendiente', 'enviado', 'fallido') DEFAULT 'pendiente',
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_notificaciones_orden (id_orden_servicio),
    INDEX idx_notificaciones_tipo (tipo_notificacion),
    INDEX idx_notificaciones_estado (estado_envio)
);

-- =============================================
-- VISTAS ÚTILES PARA CONSULTAS FRECUENTES
-- =============================================

-- Vista para usuarios con información completa
CREATE OR REPLACE VIEW vista_usuarios_completos AS
SELECT 
    u.id_usuario,
    u.tipo_documento,
    u.documento,
    u.nombre,
    u.apellido,
    u.correo,
    u.estado as usuario_activo,
    r.nombre as rol_nombre,
    r.descripcion as rol_descripcion,
    CASE 
        WHEN e.id_empleado IS NOT NULL THEN 'Empleado'
        WHEN c.id_cliente IS NOT NULL THEN 'Cliente'
        ELSE 'Usuario'
    END as tipo_usuario
FROM usuarios u
LEFT JOIN roles r ON u.id_rol = r.id_rol
LEFT JOIN empleados e ON u.id_usuario = e.id_usuario
LEFT JOIN clientes c ON u.id_usuario = c.id_usuario;

-- Vista para órdenes de servicio con información completa
CREATE OR REPLACE VIEW vista_ordenes_completas AS
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    os.fecha_creacion,
    os.total_estimado,
    os.estado,
    os.pais,
    os.ciudad,
    s.nombre as servicio_nombre,
    s.precio_base,
    c.id_cliente,
    u.nombre as cliente_nombre,
    u.apellido as cliente_apellido,
    u.correo as cliente_correo,
    emp.nombre as empresa_nombre,
    emp.nit as empresa_nit,
    u_emp.nombre as empleado_nombre,
    u_emp.apellido as empleado_apellido
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u ON c.id_usuario = u.id_usuario
JOIN empresas emp ON os.id_empresa = emp.id_empresa
LEFT JOIN usuarios u_emp ON os.id_empleado_asignado = u_emp.id_usuario;

-- =============================================
-- TRIGGERS PARA AUDITORÍA
-- =============================================

DELIMITER $$

CREATE TRIGGER tr_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER tr_ordenes_updated_at
    BEFORE UPDATE ON ordenes_de_servicios
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER tr_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- =============================================
-- PROCEDIMIENTOS ALMACENADOS
-- =============================================

DELIMITER $$

-- Procedimiento para obtener estadísticas de órdenes por estado
CREATE PROCEDURE sp_estadisticas_ordenes_por_estado()
BEGIN
    SELECT 
        estado,
        COUNT(*) as total_ordenes,
        SUM(total_estimado) as monto_total,
        AVG(total_estimado) as monto_promedio
    FROM ordenes_de_servicios
    GROUP BY estado
    ORDER BY total_ordenes DESC;
END$$

-- Procedimiento para obtener reporte de pagos por período
CREATE PROCEDURE sp_reporte_pagos_periodo(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        p.id_pago,
        p.monto,
        p.metodo_pago,
        p.estado,
        p.fecha_pago,
        os.numero_expediente,
        s.nombre as servicio_nombre,
        u.nombre as cliente_nombre,
        u.apellido as cliente_apellido
    FROM pagos p
    JOIN ordenes_de_servicios os ON p.id_orden_servicio = os.id_orden_servicio
    JOIN servicios s ON os.id_servicio = s.id_servicio
    JOIN clientes c ON os.id_cliente = c.id_cliente
    JOIN usuarios u ON c.id_usuario = u.id_usuario
    WHERE DATE(p.fecha_pago) BETWEEN fecha_inicio AND fecha_fin
    ORDER BY p.fecha_pago DESC;
END$$

DELIMITER ;

-- =============================================
-- DATOS INICIALES PARA SERVICIOS Y PROCESOS
-- =============================================

-- Insertar 7 servicios con datos completos para frontend
INSERT INTO servicios (id_servicio, nombre, descripcion, descripcion_corta, visible_en_landing, landing_data, info_page_data, route_path, precio_base, estado) VALUES
(1, 'Búsqueda de Antecedentes', 'Verifica la disponibilidad de tu marca antes de iniciar el registro.', 'Verificar disponibilidad de marca comercial', true, 
 '{"titulo": "Búsqueda de Antecedentes", "resumen": "Verificamos la disponibilidad de tu marca comercial en la base de datos de la SIC", "imagen": ""}',
 '{"descripcion": "Este servicio permite verificar si una marca comercial ya está registrada o en proceso de registro."}',
 '/pages/busqueda', 150000.00, true),

(2, 'Certificación de Marca', 'Acompañamiento completo en el proceso de certificación de tu marca.', 'Certificar marca comercial ante la SIC', true,
 '{"titulo": "Certificación de Marca", "resumen": "Proceso completo de certificación de marca comercial", "imagen": ""}',
 '{"descripcion": "Servicio completo para certificar tu marca comercial ante la Superintendencia de Industria y Comercio."}',
 '/pages/certificacion', 1848000.00, true),

(3, 'Renovación de Marca', 'Renueva tu marca y mantén tu protección legal vigente.', 'Renovar certificado de marca comercial', true,
 '{"titulo": "Renovación de Marca", "resumen": "Renueva tu certificado de marca comercial", "imagen": ""}',
 '{"descripcion": "Proceso de renovación de certificados de marca comercial existentes."}',
 '/pages/renovacion', 1352000.00, true),

(4, 'Presentación de Oposición', 'Defiende tus derechos de marca presentando una oposición.', 'Oponerse a registro de marca', true,
 '{"titulo": "Presentación de Oposición", "resumen": "Oponte al registro de marcas que afecten tus derechos", "imagen": ""}',
 '{"descripcion": "Servicio para presentar oposiciones a registros de marca que puedan afectar tus derechos."}',
 '/pages/oposicion', 1400000.00, true),

(5, 'Cesión de Marca', 'Gestiona la transferencia de derechos de tu marca de forma segura.', 'Ceder derechos de marca comercial', true,
 '{"titulo": "Cesión de Marca", "resumen": "Cede los derechos de tu marca comercial", "imagen": ""}',
 '{"descripcion": "Proceso para ceder los derechos de una marca comercial registrada."}',
 '/pages/cesion', 865000.00, true),

(6, 'Ampliación de Alcance', 'Extiende la protección de tu marca a nuevas clases o categorías.', 'Ampliar cobertura de marca', true,
 '{"titulo": "Ampliación de Alcance", "resumen": "Amplía la cobertura de tu marca comercial", "imagen": ""}',
 '{"descripcion": "Servicio para ampliar la cobertura o clases de una marca comercial existente."}',
 '/pages/ampliacion', 750000.00, true),

(7, 'Respuesta a Oposición', 'Responde a oposiciones presentadas contra tu marca.', 'Responder a oposiciones de marca', true,
 '{"titulo": "Respuesta a Oposición", "resumen": "Responde a oposiciones presentadas contra tu marca", "imagen": ""}',
 '{"descripcion": "Servicio para responder a oposiciones presentadas contra tu marca comercial."}',
 '/pages/respuesta-oposicion', 1200000.00, true)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar estados de proceso para cada servicio
INSERT INTO procesos (servicio_id, nombre, descripcion, order_number, status_key) VALUES
-- Búsqueda de Antecedentes
(1, 'Solicitud Recibida', 'Solicitud de búsqueda recibida y en revisión', 1, 'recibida'),
(1, 'Búsqueda en Proceso', 'Realizando búsqueda en base de datos de la SIC', 2, 'en_proceso'),
(1, 'Informe Generado', 'Informe de búsqueda completado y disponible', 3, 'informe'),
(1, 'Finalizado', 'Proceso de búsqueda completado exitosamente', 4, 'finalizado'),

-- Certificación de Marca
(2, 'Solicitud Recibida', 'Solicitud de certificación recibida', 1, 'recibida'),
(2, 'Revisión de Documentos', 'Revisando documentación requerida', 2, 'revision'),
(2, 'Publicación', 'Publicación en gaceta oficial', 3, 'publicacion'),
(2, 'Certificado Emitido', 'Certificado de marca emitido', 4, 'certificado'),
(2, 'Finalizado', 'Certificación de marca completada exitosamente', 5, 'finalizado'),

-- Renovación de Marca
(3, 'Solicitud Recibida', 'Solicitud de renovación recibida', 1, 'recibida'),
(3, 'Verificación', 'Verificando vigencia y documentación', 2, 'verificacion'),
(3, 'Renovación Aprobada', 'Renovación aprobada y certificado actualizado', 3, 'renovacion'),
(3, 'Finalizado', 'Renovación de marca completada exitosamente', 4, 'finalizado'),

-- Presentación de Oposición
(4, 'Oposición Presentada', 'Oposición presentada ante la autoridad', 1, 'presentada'),
(4, 'En Revisión', 'Oposición en proceso de revisión', 2, 'revision'),
(4, 'Resolución', 'Resolución emitida sobre la oposición', 3, 'resolucion'),
(4, 'Finalizado', 'Proceso de oposición completado exitosamente', 4, 'finalizado'),

-- Cesión de Marca
(5, 'Solicitud Recibida', 'Solicitud de cesión recibida', 1, 'recibida'),
(5, 'Verificación de Derechos', 'Verificando derechos de cesión', 2, 'verificacion'),
(5, 'Cesión Aprobada', 'Cesión aprobada y registrada', 3, 'cesion'),
(5, 'Finalizado', 'Cesión de marca completada exitosamente', 4, 'finalizado'),

-- Ampliación de Alcance
(6, 'Solicitud Recibida', 'Solicitud de ampliación recibida', 1, 'recibida'),
(6, 'Análisis de Viabilidad', 'Analizando viabilidad de ampliación', 2, 'analisis'),
(6, 'Ampliación Aprobada', 'Ampliación aprobada y registrada', 3, 'ampliacion'),
(6, 'Finalizado', 'Ampliación de alcance completada exitosamente', 4, 'finalizado'),

-- Respuesta a Oposición
(7, 'Oposición Recibida', 'Oposición recibida y en análisis', 1, 'recibida'),
(7, 'Preparación de Respuesta', 'Preparando respuesta a la oposición', 2, 'preparacion'),
(7, 'Respuesta Presentada', 'Respuesta presentada ante la autoridad', 3, 'presentada'),
(7, 'Resolución Final', 'Resolución final sobre la oposición', 4, 'resolucion'),
(7, 'Finalizado', 'Respuesta a oposición completada exitosamente', 5, 'finalizado');

-- =============================================
-- COMENTARIOS FINALES
-- =============================================

/*
ESTRUCTURA DE LA BASE DE DATOS API REGISTRACK v7.0

ENTIDADES PRINCIPALES:
- Sistema de autenticación y autorización (usuarios, roles, permisos, privilegios)
- Gestión de empresas y empleados
- Gestión de clientes y servicios
- Órdenes de servicio con 50+ campos editables
- Sistema de seguimiento con cambios de estado
- Sistema de citas y solicitudes (ASOCIADAS)
- Gestión de pagos con pasarelas de pago
- Sistema de archivos y notificaciones
- Dashboard administrativo con KPIs y reportes

CAMBIOS EN v7.0:
- Agregado campo "id_orden_servicio" a tabla citas para asociar con solicitudes
- Relación Foreign Key entre citas y ordenes_de_servicios
- Sistema de asociación de citas con solicitudes de servicio

CAMBIOS EN v6.0:
- Agregado campo "origen" a tabla clientes
- Agregado campo "id_empleado_asignado" a tabla ordenes_de_servicios
- Agregados campos de auditoría (anulado_por, fecha_anulacion, motivo_anulacion)
- Agregados 50+ campos editables en ordenes_de_servicios (Fase 1, 2, 3)
- Agregados campos de pasarela de pago (transaction_id, gateway, gateway_data, etc.)
- Tabla detalles_ordenes_servicio ahora usa VARCHAR(100) para estado (permite process_states)
- Tabla seguimientos agrega campos (nuevo_estado, estado_anterior, observaciones, id_usuario)
- Agregada tabla notificaciones
- Todos los servicios incluyen estado "Finalizado" como último process_state
- Sistema de alertas de renovación de marcas (5 años)
- Dashboard con análisis de ingresos, KPIs y reportes Excel

CARACTERÍSTICAS:
- Soporte para MySQL 8+ con charset utf8mb4
- Claves foráneas con restricciones apropiadas
- Índices optimizados para consultas frecuentes
- Triggers para auditoría automática
- Vistas para consultas complejas
- Procedimientos almacenados para reportes
- Campos JSON para datos flexibles
- Validaciones a nivel de base de datos

RELACIONES:
- 1:1 entre usuarios y empleados/clientes
- 1:N entre roles y usuarios
- 1:N entre empresas y empleados/órdenes
- 1:N entre clientes y órdenes/citas
- 1:N entre servicios y órdenes
- N:M entre roles, permisos y privilegios
- N:M entre empresas y clientes
- 1:N entre servicios y procesos (process_states)
*/

-- =============================================
-- DATOS INICIALES: ROLES
-- =============================================
INSERT INTO roles (id_rol, nombre, descripcion) VALUES
(1, 'cliente', 'Cliente externo con acceso a sus propios datos'),
(2, 'administrador', 'Administrador del sistema con acceso completo'),
(3, 'empleado', 'Empleado de la empresa con acceso limitado')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

