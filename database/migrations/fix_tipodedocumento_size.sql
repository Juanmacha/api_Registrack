-- ===================================================
-- MIGRACIÓN: Aumentar tamaño de columna tipodedocumento
-- Fecha: 4 de Noviembre de 2025
-- Problema: Error "Data too long for column 'tipodedocumento'"
-- Solución: Aumentar VARCHAR(10) a VARCHAR(50)
-- ===================================================
USE registrack_db;

SELECT 'Iniciando migración para aumentar tamaño de tipodedocumento...' as estado;

-- Aumentar tamaño de columna tipodedocumento
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN tipodedocumento VARCHAR(50) NULL COMMENT 'Tipo de documento del solicitante';

SELECT '✅ Migración completada: tipodedocumento ahora acepta hasta 50 caracteres' as estado;

-- Verificar el cambio
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND COLUMN_NAME = 'tipodedocumento';

