-- =============================================
-- MIGRACIÓN OPCIONAL: Cambiar columnas de archivos a LONGTEXT
-- Fecha: Enero 2026
-- Descripción: Cambiar columnas que almacenan archivos base64 a LONGTEXT
-- para soportar archivos muy grandes (hasta 4GB)
-- =============================================
-- ⚠️ NOTA: Este script es OPCIONAL. Úsalo solo si necesitas soportar archivos muy grandes.
-- TEXT (64KB) es suficiente para la mayoría de casos.
-- LONGTEXT (4GB) es para archivos extremadamente grandes.
-- =============================================

USE registrack_db;

-- =============================================
-- CORRECCIÓN: Cambiar columnas de documentos a LONGTEXT
-- =============================================

-- Cambiar poderparaelregistrodelamarca a LONGTEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderparaelregistrodelamarca LONGTEXT NULL 
COMMENT 'Poder para el registro de la marca (base64) - LONGTEXT para archivos grandes';

-- Cambiar poderdelrepresentanteautorizado a LONGTEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderdelrepresentanteautorizado LONGTEXT NULL 
COMMENT 'Poder del representante autorizado (base64) - Solo para personas jurídicas - LONGTEXT para archivos grandes';

-- Cambiar certificado_camara_comercio a LONGTEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_camara_comercio LONGTEXT NULL 
COMMENT 'Certificado de cámara de comercio (base64) - LONGTEXT para archivos grandes';

-- Cambiar logotipo a LONGTEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN logotipo LONGTEXT NULL 
COMMENT 'Logotipo de la marca (base64) - LONGTEXT para archivos grandes';

-- Cambiar otros campos de documentos a LONGTEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_renovacion LONGTEXT NULL 
COMMENT 'Certificado de renovación (base64) - LONGTEXT para archivos grandes';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documento_cesion LONGTEXT NULL 
COMMENT 'Documento de cesión (base64) - LONGTEXT para archivos grandes';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documentos_oposicion LONGTEXT NULL 
COMMENT 'Documentos de oposición (base64) - LONGTEXT para archivos grandes';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN soportes LONGTEXT NULL 
COMMENT 'Documentos adicionales de soporte (base64) - LONGTEXT para archivos grandes';

-- =============================================
-- VERIFICACIÓN: Mostrar estructura de columnas modificadas
-- =============================================

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
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
LONGTEXT vs TEXT:
- TEXT: Hasta 65,535 bytes (64KB) - Suficiente para PDFs pequeños/medianos
- LONGTEXT: Hasta 4,294,967,295 bytes (4GB) - Para archivos muy grandes

Para archivos base64:
- Un PDF de 1MB se convierte en ~1.33MB en base64
- Un PDF de 5MB se convierte en ~6.67MB en base64
- Un PDF de 10MB se convierte en ~13.3MB en base64

Recomendación:
- Usar TEXT si los archivos son normalmente < 5MB
- Usar LONGTEXT si necesitas soportar archivos > 5MB

Esta migración es OPCIONAL y solo debe ejecutarse si:
1. Los archivos que se suben son muy grandes (> 5MB)
2. Se prevé que en el futuro se subirán archivos grandes
3. Se quiere evitar problemas futuros con archivos grandes

Si ya ejecutaste fix_file_columns_to_text.sql, puedes ejecutar este
para actualizar a LONGTEXT. Los datos existentes no se perderán.
*/

