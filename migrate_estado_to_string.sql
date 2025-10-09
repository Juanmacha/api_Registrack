-- 🔧 MIGRACIÓN: Cambiar campo estado de ENUM a STRING
-- Ejecutar este script en la base de datos para permitir process_states

-- 1. Modificar la tabla detalles_ordenes_servicio
ALTER TABLE detalles_ordenes_servicio 
MODIFY COLUMN estado VARCHAR(100) NOT NULL DEFAULT 'Pendiente';

-- 2. Actualizar registros existentes con nombres de procesos
-- (Esto es opcional, solo si quieres actualizar datos existentes)

-- 3. Verificar que el cambio se aplicó correctamente
DESCRIBE detalles_ordenes_servicio;

-- 4. Verificar que los datos existentes siguen funcionando
SELECT * FROM detalles_ordenes_servicio LIMIT 5;
