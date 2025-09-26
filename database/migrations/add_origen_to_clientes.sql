-- =============================================
-- MIGRACIÓN: Agregar campo origen a tabla clientes
-- Fecha: 2024-01-15
-- Descripción: Agrega campo origen para distinguir entre clientes creados por solicitudes, directos o importados
-- =============================================

USE registrack_db;

-- Agregar columna origen a la tabla clientes
ALTER TABLE clientes 
ADD COLUMN origen ENUM('solicitud', 'directo', 'importado') 
NOT NULL DEFAULT 'directo' 
AFTER estado;

-- Crear índice para mejorar consultas por origen
CREATE INDEX idx_clientes_origen ON clientes(origen);

-- Actualizar clientes existentes que no tienen origen definido
-- (Esto es opcional, ya que el DEFAULT 'directo' se aplicará automáticamente)
UPDATE clientes 
SET origen = 'directo' 
WHERE origen IS NULL;

-- Verificar la estructura de la tabla
DESCRIBE clientes;

-- Mostrar estadísticas de clientes por origen
SELECT 
    origen,
    COUNT(*) as total_clientes,
    COUNT(CASE WHEN estado = 1 THEN 1 END) as activos,
    COUNT(CASE WHEN estado = 0 THEN 1 END) as inactivos
FROM clientes 
GROUP BY origen;
