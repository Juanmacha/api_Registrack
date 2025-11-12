-- =============================================
-- MIGRACIÓN: Añadir campo telefono a usuarios
-- Fecha: Enero 2026
-- Versión: 7.2
-- =============================================

-- Añadir columna telefono a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN telefono VARCHAR(20) NULL COMMENT 'Teléfono de contacto del usuario (opcional)' 
AFTER correo;

-- Índice opcional para búsquedas por teléfono
CREATE INDEX idx_usuarios_telefono ON usuarios(telefono);

-- Verificar migración
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db' 
  AND TABLE_NAME = 'usuarios' 
  AND COLUMN_NAME = 'telefono';

-- =============================================
-- FIN DE MIGRACIÓN
-- =============================================

