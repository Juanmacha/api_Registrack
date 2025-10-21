-- =============================================
-- SCRIPT CORRECCIÓN: AGREGAR COLUMNAS FALTANTES
-- Fecha: 2025-10-01
-- Descripción: Agregar columnas que pueden faltar en ordenes_de_servicios
-- =============================================

USE registrack;

-- =============================================
-- 1. VERIFICAR Y AGREGAR COLUMNA id_empleado_asignado SI NO EXISTE
-- =============================================

-- Verificar si la columna existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'registrack' 
    AND TABLE_NAME = 'ordenes_de_servicios' 
    AND COLUMN_NAME = 'id_empleado_asignado'
);

-- Agregar columna solo si no existe
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE ordenes_de_servicios ADD COLUMN id_empleado_asignado INT NULL AFTER estado',
    'SELECT "Columna id_empleado_asignado ya existe" as mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================
-- 2. AGREGAR FOREIGN KEY PARA id_empleado_asignado SI NO EXISTE
-- =============================================

-- Verificar si la foreign key existe
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'registrack' 
    AND TABLE_NAME = 'ordenes_de_servicios' 
    AND COLUMN_NAME = 'id_empleado_asignado'
    AND REFERENCED_TABLE_NAME = 'usuarios'
);

-- Agregar foreign key solo si no existe
SET @sql_fk = IF(@fk_exists = 0, 
    'ALTER TABLE ordenes_de_servicios ADD CONSTRAINT fk_ordenes_empleado_asignado FOREIGN KEY (id_empleado_asignado) REFERENCES usuarios(id_usuario) ON DELETE SET NULL ON UPDATE CASCADE',
    'SELECT "Foreign key para id_empleado_asignado ya existe" as mensaje'
);

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- =============================================
-- 3. AGREGAR ÍNDICE PARA id_empleado_asignado SI NO EXISTE
-- =============================================

-- Verificar si el índice existe
SET @index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'registrack' 
    AND TABLE_NAME = 'ordenes_de_servicios' 
    AND INDEX_NAME = 'idx_ordenes_empleado_asignado'
);

-- Agregar índice solo si no existe
SET @sql_idx = IF(@index_exists = 0, 
    'ALTER TABLE ordenes_de_servicios ADD INDEX idx_ordenes_empleado_asignado (id_empleado_asignado)',
    'SELECT "Índice para id_empleado_asignado ya existe" as mensaje'
);

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- =============================================
-- 4. VERIFICAR ESTRUCTURA FINAL
-- =============================================

DESCRIBE ordenes_de_servicios;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

SELECT 'Corrección de columnas faltantes completada exitosamente' as resultado;
