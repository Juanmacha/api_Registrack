-- ==================================================
-- MIGRACIÓN: Mejora del Sistema de Anulación de Solicitudes
-- Versión: 2.4.0
-- Fecha: 27 de Octubre 2025
-- Descripción: Agrega campos de auditoría para anulaciones
-- ==================================================

USE registrack_db;

-- ==================================================
-- PASO 1: Verificar estructura actual de la tabla
-- ==================================================
SELECT 'PASO 1: Verificando estructura actual de ordenes_de_servicios' AS mensaje;

SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND COLUMN_NAME IN ('anulado_por', 'fecha_anulacion', 'motivo_anulacion');

-- ==================================================
-- PASO 2: Agregar campos de auditoría
-- ==================================================
SELECT 'PASO 2: Agregando campos de auditoría' AS mensaje;

-- Campo: anulado_por (ID del usuario que anuló)
ALTER TABLE ordenes_de_servicios
ADD COLUMN IF NOT EXISTS anulado_por INT NULL 
COMMENT 'ID del usuario (admin/empleado) que anuló la solicitud';

-- Campo: fecha_anulacion (Timestamp de la anulación)
ALTER TABLE ordenes_de_servicios
ADD COLUMN IF NOT EXISTS fecha_anulacion DATETIME NULL 
COMMENT 'Fecha y hora exacta de la anulación';

-- Campo: motivo_anulacion (Razón de la anulación)
ALTER TABLE ordenes_de_servicios
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT NULL 
COMMENT 'Motivo detallado de por qué se anuló la solicitud';

-- ==================================================
-- PASO 3: Agregar Foreign Key para anulado_por
-- ==================================================
SELECT 'PASO 3: Agregando Foreign Key constraint' AS mensaje;

-- Verificar si la FK ya existe
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = 'registrack_db'
      AND TABLE_NAME = 'ordenes_de_servicios'
      AND CONSTRAINT_NAME = 'fk_ordenes_anulado_por'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);

-- Agregar FK solo si no existe
SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE ordenes_de_servicios 
     ADD CONSTRAINT fk_ordenes_anulado_por 
     FOREIGN KEY (anulado_por) REFERENCES usuarios(id_usuario) 
     ON DELETE SET NULL 
     ON UPDATE CASCADE',
    'SELECT "FK fk_ordenes_anulado_por ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================================================
-- PASO 4: Agregar índices para optimizar consultas
-- ==================================================
SELECT 'PASO 4: Agregando índices' AS mensaje;

-- Índice para búsquedas por estado anulado
CREATE INDEX IF NOT EXISTS idx_ordenes_estado 
ON ordenes_de_servicios(estado);

-- Índice para búsquedas por usuario que anuló
CREATE INDEX IF NOT EXISTS idx_ordenes_anulado_por 
ON ordenes_de_servicios(anulado_por);

-- Índice para búsquedas por fecha de anulación
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha_anulacion 
ON ordenes_de_servicios(fecha_anulacion);

-- ==================================================
-- PASO 5: Verificar tabla seguimientos
-- ==================================================
SELECT 'PASO 5: Verificando tabla seguimientos' AS mensaje;

-- Verificar si la tabla seguimientos tiene los campos necesarios
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'seguimientos'
  AND COLUMN_NAME IN ('nuevo_estado', 'estado_anterior', 'observaciones', 'id_usuario');

-- ==================================================
-- PASO 6: Verificar que existe el tipo de notificación
-- ==================================================
SELECT 'PASO 6: Verificando tipo de notificación anulacion_solicitud' AS mensaje;

-- Verificar columna tipo_notificacion en notificaciones
SELECT COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'notificaciones'
  AND COLUMN_NAME = 'tipo_notificacion';

-- Si es ENUM, agregar nuevo valor (si no existe)
-- NOTA: Si tipo_notificacion es ENUM, necesitaremos modificarlo
SET @column_type = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'registrack_db'
      AND TABLE_NAME = 'notificaciones'
      AND COLUMN_NAME = 'tipo_notificacion'
);

-- Si es ENUM y no contiene 'anulacion_solicitud', modificar
SET @sql_modify_enum = IF(
    @column_type LIKE '%enum%' AND @column_type NOT LIKE '%anulacion_solicitud%',
    "ALTER TABLE notificaciones 
     MODIFY COLUMN tipo_notificacion ENUM(
         'asignacion_empleado', 
         'nueva_solicitud', 
         'cambio_estado',
         'anulacion_solicitud'
     ) NOT NULL",
    'SELECT "Tipo notificacion ya incluye anulacion_solicitud o no es ENUM" AS mensaje'
);

PREPARE stmt FROM @sql_modify_enum;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ==================================================
-- PASO 7: Verificación final
-- ==================================================
SELECT 'PASO 7: Verificación final de cambios' AS mensaje;

-- Mostrar estructura actualizada
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_KEY,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND COLUMN_NAME IN ('anulado_por', 'fecha_anulacion', 'motivo_anulacion')
ORDER BY ORDINAL_POSITION;

-- Verificar Foreign Keys
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND CONSTRAINT_NAME = 'fk_ordenes_anulado_por';

-- Verificar índices
SHOW INDEX FROM ordenes_de_servicios 
WHERE Key_name IN ('idx_ordenes_estado', 'idx_ordenes_anulado_por', 'idx_ordenes_fecha_anulacion');

-- ==================================================
-- RESULTADO FINAL
-- ==================================================
SELECT 
    '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' AS resultado,
    NOW() AS fecha_ejecucion;

SELECT 
    'Campos agregados: anulado_por, fecha_anulacion, motivo_anulacion' AS detalle_1,
    'Foreign Key agregada: fk_ordenes_anulado_por' AS detalle_2,
    'Índices creados: 3 índices para optimización' AS detalle_3,
    'Tipo de notificación actualizado: anulacion_solicitud' AS detalle_4;

-- ==================================================
-- CONSULTA DE PRUEBA (Opcional)
-- ==================================================
-- Puedes ejecutar esta consulta para ver la estructura completa:
-- DESCRIBE ordenes_de_servicios;

