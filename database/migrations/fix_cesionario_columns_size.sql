-- =============================================
-- MIGRACIÓN: Ajustar tamaños de columnas del Cesionario
-- Fecha: Enero 2026
-- Problema: tipo_documento_cesionario es muy pequeño (VARCHAR(10)) 
--           y no puede almacenar "Cédula de Ciudadanía" (22 caracteres)
-- =============================================

USE registrack_db;

-- =============================================
-- PASO 1: Verificar tamaños actuales
-- =============================================
SHOW COLUMNS FROM ordenes_de_servicios 
WHERE Field IN (
  'tipo_documento_cesionario',
  'numero_documento_cesionario',
  'nombre_razon_social_cesionario',
  'representante_legal_cesionario',
  'nit_cesionario',
  'correo_cesionario',
  'telefono_cesionario',
  'direccion_cesionario'
);

-- =============================================
-- PASO 2: Modificar columna tipo_documento_cesionario
-- =============================================
-- CRÍTICO: Cambiar de VARCHAR(10) a VARCHAR(50) para soportar
-- valores como "Cédula de Ciudadanía" (22 caracteres)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN tipo_documento_cesionario VARCHAR(50) 
COMMENT 'Tipo de documento del cesionario (CC, CE, NIT, etc.)';

-- =============================================
-- PASO 3: Verificar cambios
-- =============================================
SHOW COLUMNS FROM ordenes_de_servicios 
WHERE Field = 'tipo_documento_cesionario';

-- =============================================
-- PASO 4: Verificar otras columnas del cesionario
-- (Opcional: asegurar que tengan tamaños adecuados)
-- =============================================
-- Nota: Las otras columnas ya tienen tamaños adecuados:
-- - numero_documento_cesionario: VARCHAR(20) ✅
-- - nombre_razon_social_cesionario: VARCHAR(100) ✅
-- - representante_legal_cesionario: VARCHAR(100) ✅
-- - nit_cesionario: VARCHAR(20) ✅
-- - correo_cesionario: VARCHAR(100) ✅
-- - telefono_cesionario: VARCHAR(20) ✅
-- - direccion_cesionario: TEXT ✅ (suficiente para direcciones largas)

-- =============================================
-- RESUMEN DE CAMBIOS
-- =============================================
-- ✅ tipo_documento_cesionario: VARCHAR(10) → VARCHAR(50)
-- ✅ Soluciona error: "Data too long for column 'tipo_documento_cesionario'"
-- ✅ Permite almacenar valores como "Cédula de Ciudadanía", "Cédula de Extranjería", etc.

