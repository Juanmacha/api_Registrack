-- 🔧 MIGRACIÓN COMPLETA: Sistema de Estados Simplificado
-- Ejecutar este script en la base de datos para completar la migración

-- 1. Modificar la tabla detalles_ordenes_servicio para permitir process_states
ALTER TABLE detalles_ordenes_servicio 
MODIFY COLUMN estado VARCHAR(100) NOT NULL DEFAULT 'Pendiente';

-- 2. Agregar columnas para manejo de cambios de proceso en seguimientos
ALTER TABLE seguimientos 
ADD COLUMN nuevo_estado VARCHAR(100) NULL,
ADD COLUMN estado_anterior VARCHAR(100) NULL;

-- 3. Verificar que los cambios se aplicaron correctamente
DESCRIBE detalles_ordenes_servicio;
DESCRIBE seguimientos;

-- 4. Verificar que los datos existentes siguen funcionando
SELECT * FROM detalles_ordenes_servicio LIMIT 5;
SELECT * FROM seguimientos LIMIT 5;
