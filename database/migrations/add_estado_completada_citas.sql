-- =============================================
-- MIGRACIÓN: Agregar Estado "Finalizada" a Citas
-- Fecha: Enero 2026
-- Descripción: Agrega el estado "Finalizada" al ENUM de estados de citas
-- =============================================

USE registrack_db;

-- Agregar estado "Finalizada" al ENUM
ALTER TABLE citas 
MODIFY COLUMN estado ENUM('Programada', 'Reprogramada', 'Anulada', 'Finalizada') 
DEFAULT 'Programada'
COMMENT 'Estados: Programada, Reprogramada, Anulada, Finalizada';

-- Verificar que el cambio se aplicó correctamente
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
AND TABLE_NAME = 'citas'
AND COLUMN_NAME = 'estado';

-- Mensaje de confirmación
SELECT '✅ Migración completada: Estado "Finalizada" agregado a citas' as estado;

