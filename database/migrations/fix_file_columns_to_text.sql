-- =============================================
-- MIGRACIÓN: Cambiar columnas de archivos a TEXT/LONGTEXT
-- Fecha: Enero 2026
-- Descripción: Cambiar columnas que almacenan archivos base64 de VARCHAR a TEXT/LONGTEXT
-- para evitar errores "Data too long for column"
-- =============================================

USE registrack_db;

-- =============================================
-- CORRECCIÓN 1: Cambiar columnas de documentos a TEXT
-- =============================================

-- Cambiar poderparaelregistrodelamarca a TEXT (si no es TEXT ya)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderparaelregistrodelamarca TEXT NULL 
COMMENT 'Poder para el registro de la marca (base64)';

-- Cambiar poderdelrepresentanteautorizado a TEXT (si no es TEXT ya)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderdelrepresentanteautorizado TEXT NULL 
COMMENT 'Poder del representante autorizado (base64) - Solo para personas jurídicas';

-- Cambiar certificado_camara_comercio a TEXT (ya debería ser TEXT según el modelo)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_camara_comercio TEXT NULL 
COMMENT 'Certificado de cámara de comercio (base64)';

-- Cambiar logotipo a TEXT (ya debería ser TEXT según el modelo)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN logotipo TEXT NULL 
COMMENT 'Logotipo de la marca (base64)';

-- Cambiar otros campos de documentos a TEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_renovacion TEXT NULL 
COMMENT 'Certificado de renovación (base64)';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documento_cesion TEXT NULL 
COMMENT 'Documento de cesión (base64)';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documentos_oposicion TEXT NULL 
COMMENT 'Documentos de oposición (base64)';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN soportes TEXT NULL 
COMMENT 'Documentos adicionales de soporte (base64)';

-- =============================================
-- VERIFICACIÓN: Mostrar estructura de columnas modificadas
-- =============================================

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND COLUMN_NAME IN (
    'poderparaelregistrodelamarca',
    'poderdelrepresentanteautorizado',
    'certificado_camara_comercio',
    'logotipo',
    'certificado_renovacion',
    'documento_cesion',
    'documentos_oposicion',
    'soportes'
  )
ORDER BY COLUMN_NAME;

-- =============================================
-- NOTAS
-- =============================================
/*
Esta migración cambia las columnas de archivos base64 a tipo TEXT,
que puede almacenar hasta 65,535 bytes (aproximadamente 64KB).

Si necesitas almacenar archivos más grandes, puedes cambiar a LONGTEXT:

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderparaelregistrodelamarca LONGTEXT NULL;

LONGTEXT puede almacenar hasta 4GB de datos.

Para archivos base64:
- Un PDF de 1MB se convierte en ~1.33MB en base64
- Un archivo de 5MB se convierte en ~6.67MB en base64
- TEXT (64KB) es suficiente para archivos pequeños/medianos
- LONGTEXT (4GB) es necesario para archivos muy grandes

Recomendación: Usar LONGTEXT para todos los campos de archivos base64
para evitar problemas futuros con archivos grandes.
*/

