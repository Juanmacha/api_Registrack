    -- =============================================
-- API Registrack v4 - Script SQL Completo
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_clientes_usuario (id_usuario),
    INDEX idx_clientes_tipo_persona (tipo_persona),
    INDEX idx_clientes_estado (estado)
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
    precio_base DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_servicios_nombre (nombre),
    INDEX idx_servicios_estado (estado),
    INDEX idx_servicios_precio (precio_base)
);

-- =============================================
-- TABLA: procesos
-- =============================================
CREATE TABLE IF NOT EXISTS procesos (
    id_proceso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_procesos_nombre (nombre)
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
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_ordenes_cliente (id_cliente),
    INDEX idx_ordenes_servicio (id_servicio),
    INDEX idx_ordenes_empresa (id_empresa),
    INDEX idx_ordenes_fecha (fecha_creacion),
    INDEX idx_ordenes_estado (estado),
    INDEX idx_ordenes_expediente (numero_expediente)
);

-- =============================================
-- TABLA: detalles_ordenes_servicio
-- =============================================
CREATE TABLE IF NOT EXISTS detalles_ordenes_servicio (
    id_detalle_orden INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_servicio INT NOT NULL,
    id_servicio INT NOT NULL,
    estado ENUM('Pendiente','En Proceso','Finalizado','Anulado') NOT NULL DEFAULT 'Pendiente',
    fecha_estado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_detalles_orden (id_orden_servicio),
    INDEX idx_detalles_servicio (id_servicio),
    INDEX idx_detalles_estado (estado)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_empleado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE,
    
    INDEX idx_citas_fecha (fecha),
    INDEX idx_citas_cliente (id_cliente),
    INDEX idx_citas_empleado (id_empleado),
    INDEX idx_citas_estado (estado),
    INDEX idx_citas_tipo (tipo)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_seguimientos_orden (id_orden_servicio),
    INDEX idx_seguimientos_registrado_por (registrado_por),
    INDEX idx_seguimientos_fecha (fecha_registro)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_pagos_orden (id_orden_servicio),
    INDEX idx_pagos_estado (estado),
    INDEX idx_pagos_fecha (fecha_pago),
    INDEX idx_pagos_metodo (metodo_pago)
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
    emp.nit as empresa_nit
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u ON c.id_usuario = u.id_usuario
JOIN empresas emp ON os.id_empresa = emp.id_empresa;

-- =============================================
-- TRIGGERS PARA AUDITORÍA
-- =============================================

-- Trigger para actualizar updated_at automáticamente
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
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =============================================

-- Procedimiento para obtener estadísticas de órdenes por estado
DELIMITER $$

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
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =============================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_ordenes_cliente_estado ON ordenes_de_servicios(id_cliente, estado);
CREATE INDEX idx_ordenes_empresa_fecha ON ordenes_de_servicios(id_empresa, fecha_creacion);
CREATE INDEX idx_pagos_orden_estado ON pagos(id_orden_servicio, estado);
CREATE INDEX idx_citas_fecha_estado ON citas(fecha, estado);
CREATE INDEX idx_seguimientos_orden_fecha ON seguimientos(id_orden_servicio, fecha_registro);
CREATE INDEX idx_detalles_orden_estado ON detalles_ordenes_servicio(id_orden_servicio, estado);

-- =============================================
-- COMENTARIOS FINALES
-- =============================================

/*
ESTRUCTURA DE LA BASE DE DATOS API REGISTRACK v4

ENTIDADES PRINCIPALES:
- Sistema de autenticación y autorización (usuarios, roles, permisos, privilegios)
- Gestión de empresas y empleados
- Gestión de clientes y servicios
- Órdenes de servicio y seguimiento
- Sistema de citas y solicitudes
- Gestión de pagos

CARACTERÍSTICAS:
- Soporte para MySQL con charset utf8mb4
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
*/
