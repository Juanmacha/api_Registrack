-- ===================================================
-- MIGRACIÓN FASE 3: Agregar Campos Específicos
-- Fecha: 28 de Octubre de 2025
-- ===================================================
USE registrack_db;
SELECT 'Iniciando migración Fase 3...' as estado;

-- Prioridad 1: Campos de Cesionario (Cesión de Marca)
ALTER TABLE ordenes_de_servicios
ADD COLUMN nombre_razon_social_cesionario VARCHAR(100) NULL COMMENT 'Nombre o razón social del cesionario',
ADD COLUMN nit_cesionario VARCHAR(20) NULL COMMENT 'NIT del cesionario',
ADD COLUMN tipo_documento_cesionario VARCHAR(10) NULL COMMENT 'Tipo documento cesionario',
ADD COLUMN numero_documento_cesionario VARCHAR(20) NULL COMMENT 'Número documento cesionario',
ADD COLUMN correo_cesionario VARCHAR(100) NULL COMMENT 'Correo del cesionario',
ADD COLUMN telefono_cesionario VARCHAR(20) NULL COMMENT 'Teléfono del cesionario',
ADD COLUMN direccion_cesionario TEXT NULL COMMENT 'Dirección del cesionario',
ADD COLUMN representante_legal_cesionario VARCHAR(100) NULL COMMENT 'Representante legal del cesionario';

-- Prioridad 2: Campos de Argumentos/Descripción
ALTER TABLE ordenes_de_servicios
ADD COLUMN argumentos_respuesta TEXT NULL COMMENT 'Argumentos legales de respuesta a oposición',
ADD COLUMN descripcion_nuevos_productos_servicios TEXT NULL COMMENT 'Descripción de nuevos productos/servicios (ampliación)';

-- Prioridad 3: Campos de Clases Niza (Ampliación)
ALTER TABLE ordenes_de_servicios
ADD COLUMN clase_niza_actual VARCHAR(50) NULL COMMENT 'Clase Niza actual del registro',
ADD COLUMN nuevas_clases_niza VARCHAR(200) NULL COMMENT 'Nuevas clases Niza a agregar';

-- Prioridad 4: Otros campos
ALTER TABLE ordenes_de_servicios
ADD COLUMN documento_nit_titular VARCHAR(20) NULL COMMENT 'Documento o NIT del titular',
ADD COLUMN numero_nit_cedula VARCHAR(20) NULL COMMENT 'Número NIT o Cédula';

-- Índices para búsquedas frecuentes
CREATE INDEX idx_nombre_cesionario ON ordenes_de_servicios(nombre_razon_social_cesionario);
CREATE INDEX idx_nit_cesionario ON ordenes_de_servicios(nit_cesionario);
CREATE INDEX idx_clase_niza_actual ON ordenes_de_servicios(clase_niza_actual);

-- Verificación
SELECT 'Migración Fase 3 completada exitosamente' as resultado;

-- Verificar columnas agregadas
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_COMMENT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'registrack_db' 
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND COLUMN_NAME IN (
    'nombre_razon_social_cesionario',
    'nit_cesionario',
    'tipo_documento_cesionario',
    'numero_documento_cesionario',
    'correo_cesionario',
    'telefono_cesionario',
    'direccion_cesionario',
    'representante_legal_cesionario',
    'argumentos_respuesta',
    'descripcion_nuevos_productos_servicios',
    'clase_niza_actual',
    'nuevas_clases_niza',
    'documento_nit_titular',
    'numero_nit_cedula'
  )
ORDER BY ORDINAL_POSITION;

