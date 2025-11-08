-- ============================================
-- MIGRACIÓN: Cambiar columnas de archivos de TEXT a LONGTEXT
-- ============================================
-- Fecha: Enero 2026
-- Descripción: Cambia las columnas que almacenan archivos Base64 de TEXT a LONGTEXT
--              para permitir almacenar archivos grandes sin errores de "Data too long"
-- ============================================
-- ⚠️ IMPORTANTE: Hacer backup de la base de datos antes de ejecutar
-- ============================================

USE registrack_db;

-- ============================================
-- COLUMNAS CRÍTICAS (usadas en todos/múltiples servicios)
-- ============================================

-- 1. logotipo - ⚠️ CRÍTICO - Usado en TODOS los servicios
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN logotipo LONGTEXT 
COMMENT 'Logotipo de la marca (base64)';

-- 2. poderparaelregistrodelamarca - ⚠️ CRÍTICO - Usado en múltiples servicios
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderparaelregistrodelamarca LONGTEXT 
COMMENT 'Poder para el registro de la marca (base64) - Siempre usado';

-- ============================================
-- COLUMNAS ESPECÍFICAS POR SERVICIO
-- ============================================

-- 3. poderdelrepresentanteautorizado - Para Certificación (Jurídica)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderdelrepresentanteautorizado LONGTEXT 
COMMENT 'Poder del representante autorizado (base64) - Solo para personas jurídicas';

-- 4. certificado_camara_comercio - Para Certificación (Jurídica)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_camara_comercio LONGTEXT 
COMMENT 'Certificado de cámara de comercio (base64) - Solo para personas jurídicas';

-- 5. certificado_renovacion - Para Renovación
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_renovacion LONGTEXT 
COMMENT 'Certificado de renovación (base64)';

-- 6. documento_cesion - Para Cesión
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documento_cesion LONGTEXT 
COMMENT 'Documento de cesión (base64)';

-- 7. documentos_oposicion - Para Oposición
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documentos_oposicion LONGTEXT 
COMMENT 'Documentos de oposición (base64)';

-- 8. soportes - Para Ampliación
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN soportes LONGTEXT 
COMMENT 'Documentos adicionales de soporte (base64)';

-- ============================================
-- VERIFICACIÓN DE CAMBIOS
-- ============================================

-- Verificar que todas las columnas fueron cambiadas correctamente
SHOW COLUMNS FROM ordenes_de_servicios 
WHERE Field IN (
  'logotipo',
  'poderparaelregistrodelamarca',
  'poderdelrepresentanteautorizado',
  'certificado_camara_comercio',
  'certificado_renovacion',
  'documento_cesion',
  'documentos_oposicion',
  'soportes'
);

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Todas las columnas deben mostrar Type: longtext
-- ============================================

