-- =============================================
-- SCRIPT: Crear Permisos y Privilegios Básicos
-- Fecha: Enero 2026
-- Descripción: Inserta permisos y privilegios necesarios para el sistema de permisos granular
-- NOTA: Este script es idempotente y seguro ejecutarlo múltiples veces
-- =============================================

USE registrack_db;

-- =============================================
-- VERIFICAR SI YA EXISTEN DATOS
-- =============================================
-- Si ya existen permisos y privilegios, este script los actualizará sin duplicar

-- =============================================
-- INSERTAR PRIVILEGIOS BÁSICOS
-- =============================================
-- Los privilegios son acciones genéricas que se pueden aplicar a cualquier módulo
INSERT INTO privilegios (nombre, descripcion) VALUES
('crear', 'Permite crear nuevos registros'),
('leer', 'Permite leer/listar registros'),
('actualizar', 'Permite actualizar registros existentes'),
('eliminar', 'Permite eliminar registros')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- =============================================
-- INSERTAR PERMISOS POR MÓDULO
-- =============================================
-- Los permisos son módulos específicos del sistema
-- Formato: gestion_<modulo>
INSERT INTO permisos (nombre, descripcion) VALUES
-- Módulos Completos (tienen todas las acciones)
('gestion_usuarios', 'Gestión de usuarios del sistema'),
('gestion_empleados', 'Gestión de empleados'),
('gestion_clientes', 'Gestión de clientes'),
('gestion_solicitudes', 'Gestión de solicitudes de servicio'),
('gestion_citas', 'Gestión de citas'),
('gestion_seguimiento', 'Gestión de seguimiento de solicitudes'),
('gestion_roles', 'Gestión de roles del sistema'),
('gestion_permisos', 'Gestión de permisos del sistema'),
('gestion_privilegios', 'Gestión de privilegios del sistema'),
('gestion_tipo_archivos', 'Gestión de tipos de archivos'),
('gestion_detalles_procesos', 'Gestión de detalles de procesos'),

-- Módulos Parciales (tienen solo algunas acciones)
('gestion_empresas', 'Gestión de empresas (crear, leer)'),
('gestion_servicios', 'Gestión de servicios (leer, actualizar)'),
('gestion_pagos', 'Gestión de pagos (crear, leer, actualizar)'),
('gestion_archivos', 'Gestión de archivos (crear, leer)'),
('gestion_solicitud_cita', 'Gestión de solicitudes de cita (crear, leer, actualizar)'),
('gestion_detalles_orden', 'Gestión de detalles de orden (crear, leer, actualizar)'),
('gestion_servicios_procesos', 'Gestión de servicios y procesos (crear, leer, eliminar)'),

-- Módulos de Solo Lectura
('gestion_dashboard', 'Acceso al dashboard administrativo (solo lectura)')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- =============================================
-- VERIFICACIÓN
-- =============================================
-- Verificar que se insertaron correctamente
SELECT 'Privilegios insertados:' as mensaje, COUNT(*) as total FROM privilegios;
SELECT 'Permisos insertados:' as mensaje, COUNT(*) as total FROM permisos;

-- Mostrar permisos y privilegios insertados
SELECT 'Privilegios:' as tipo, nombre, descripcion FROM privilegios ORDER BY nombre;
SELECT 'Permisos:' as tipo, nombre, descripcion FROM permisos ORDER BY nombre;

-- =============================================
-- NOTAS
-- =============================================
/*
IMPORTANTE:
1. Este script es idempotente (se puede ejecutar múltiples veces sin problemas)
2. Los permisos y privilegios se insertan solo si no existen (ON DUPLICATE KEY UPDATE)
3. Después de ejecutar este script, debes asignar permisos a los roles en la tabla rol_permisos_privilegios
4. El rol 'administrador' NO necesita permisos específicos (tiene bypass automático)
5. El rol 'cliente' mantiene su lógica actual (no requiere permisos aquí)
6. Los roles 'empleado' y roles personalizados SÍ requieren permisos específicos
*/

