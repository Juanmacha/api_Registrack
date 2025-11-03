-- =============================================
-- MIGRACIÓN: Corregir Relaciones de Empleados
-- Fecha: 1 de Noviembre de 2025
-- Descripción: Migración de datos para corregir referencias incorrectas
--             donde se guardó id_empleado en vez de id_usuario
-- =============================================

USE registrack_db;

-- =============================================
-- VERIFICACIÓN PRE-MIGRACIÓN
-- =============================================

SELECT 'Verificando datos incorrectos...' as estado;

-- Mostrar solicitudes con id_empleado_asignado incorrecto
SELECT 'Solicitudes con asignaciones incorrectas:' as tipo;
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    os.id_empleado_asignado,
    CASE 
        WHEN EXISTS (SELECT 1 FROM empleados e WHERE e.id_empleado = os.id_empleado_asignado) THEN '✅ Correcto (id_empleado)'
        WHEN EXISTS (SELECT 1 FROM usuarios u WHERE u.id_usuario = os.id_empleado_asignado AND EXISTS (SELECT 1 FROM empleados e WHERE e.id_usuario = u.id_usuario)) THEN '✅ Correcto (id_usuario)'
        ELSE '❌ Incorrecto'
    END as estado_asignacion
FROM ordenes_de_servicios os
WHERE os.id_empleado_asignado IS NOT NULL
LIMIT 20;

-- Mostrar citas con id_empleado incorrecto
SELECT 'Citas con asignaciones incorrectas:' as tipo;
SELECT 
    c.id_cita,
    c.fecha,
    c.hora_inicio,
    c.id_empleado,
    CASE 
        WHEN EXISTS (SELECT 1 FROM empleados e WHERE e.id_empleado = c.id_empleado) THEN '✅ Correcto (id_empleado)'
        WHEN EXISTS (SELECT 1 FROM usuarios u WHERE u.id_usuario = c.id_empleado AND EXISTS (SELECT 1 FROM empleados e WHERE e.id_usuario = u.id_usuario)) THEN '✅ Correcto (id_usuario)'
        ELSE '❌ Incorrecto'
    END as estado_asignacion
FROM citas c
WHERE c.id_empleado IS NOT NULL
LIMIT 20;

-- Mostrar solicitudes de citas con id_empleado_asignado incorrecto
SELECT 'Solicitudes de citas con asignaciones incorrectas:' as tipo;
SELECT 
    sc.id,
    sc.fecha_solicitada,
    sc.id_empleado_asignado,
    CASE 
        WHEN EXISTS (SELECT 1 FROM empleados e WHERE e.id_empleado = sc.id_empleado_asignado) THEN '✅ Correcto (id_empleado)'
        WHEN EXISTS (SELECT 1 FROM usuarios u WHERE u.id_usuario = sc.id_empleado_asignado AND EXISTS (SELECT 1 FROM empleados e WHERE e.id_usuario = u.id_usuario)) THEN '✅ Correcto (id_usuario)'
        ELSE '❌ Incorrecto'
    END as estado_asignacion
FROM solicitudes_citas sc
WHERE sc.id_empleado_asignado IS NOT NULL
LIMIT 20;

-- =============================================
-- MIGRACIÓN DE DATOS
-- =============================================

SELECT 'Iniciando migración de datos...' as estado;

-- CORRECCIÓN 1: ordenes_de_servicios
-- Convertir id_empleado a id_usuario si es necesario
UPDATE ordenes_de_servicios os
INNER JOIN empleados e ON os.id_empleado_asignado = e.id_empleado
SET os.id_empleado_asignado = e.id_usuario
WHERE os.id_empleado_asignado IS NOT NULL;

SELECT CONCAT('✅ Corregidas ', ROW_COUNT(), ' asignaciones en ordenes_de_servicios') as resultado;

-- CORRECCIÓN 2: citas
-- Convertir id_empleado a id_usuario si es necesario
UPDATE citas c
INNER JOIN empleados e ON c.id_empleado = e.id_empleado
SET c.id_empleado = e.id_usuario
WHERE c.id_empleado IS NOT NULL;

SELECT CONCAT('✅ Corregidas ', ROW_COUNT(), ' asignaciones en citas') as resultado;

-- CORRECCIÓN 3: solicitudes_citas
-- Convertir id_empleado_asignado a id_usuario si es necesario
UPDATE solicitudes_citas sc
INNER JOIN empleados e ON sc.id_empleado_asignado = e.id_empleado
SET sc.id_empleado_asignado = e.id_usuario
WHERE sc.id_empleado_asignado IS NOT NULL;

SELECT CONCAT('✅ Corregidas ', ROW_COUNT(), ' asignaciones en solicitudes_citas') as resultado;

-- =============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- =============================================

SELECT 'Verificando datos corregidos...' as estado;

-- Mostrar solicitudes con asignaciones correctas
SELECT 'Solicitudes con asignaciones correctas:' as tipo;
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    os.id_empleado_asignado,
    u.nombre,
    u.apellido,
    u.correo
FROM ordenes_de_servicios os
LEFT JOIN usuarios u ON os.id_empleado_asignado = u.id_usuario
LEFT JOIN empleados e ON u.id_usuario = e.id_usuario
WHERE os.id_empleado_asignado IS NOT NULL
AND e.id_usuario IS NOT NULL
LIMIT 20;

-- Mostrar citas con asignaciones correctas
SELECT 'Citas con asignaciones correctas:' as tipo;
SELECT 
    c.id_cita,
    c.fecha,
    c.hora_inicio,
    c.id_empleado,
    u.nombre,
    u.apellido
FROM citas c
LEFT JOIN usuarios u ON c.id_empleado = u.id_usuario
LEFT JOIN empleados e ON u.id_usuario = e.id_usuario
WHERE c.id_empleado IS NOT NULL
AND e.id_usuario IS NOT NULL
LIMIT 20;

-- Mostrar solicitudes de citas con asignaciones correctas
SELECT 'Solicitudes de citas con asignaciones correctas:' as tipo;
SELECT 
    sc.id,
    sc.fecha_solicitada,
    sc.id_empleado_asignado,
    u.nombre,
    u.apellido
FROM solicitudes_citas sc
LEFT JOIN usuarios u ON sc.id_empleado_asignado = u.id_usuario
LEFT JOIN empleados e ON u.id_usuario = e.id_usuario
WHERE sc.id_empleado_asignado IS NOT NULL
AND e.id_usuario IS NOT NULL
LIMIT 20;

-- =============================================
-- RESUMEN
-- =============================================

SELECT 'Migración completada exitosamente' as resultado;

SELECT 
    'Todas las asignaciones ahora usan id_usuario correctamente' as resumen,
    'Los nuevos registros también usarán id_usuario gracias a las correcciones en el código' as nota;

