-- ============================================================
-- Script SQL para Consultar Solicitudes Creadas
-- Registrack - Sistema de Gestión de Solicitudes
-- ============================================================

USE registrack_db;

-- ============================================================
-- CONSULTA COMPLETA DE TODAS LAS SOLICITUDES
-- ============================================================

SELECT 
    -- Información de la Solicitud
    os.id_orden_servicio,
    os.numero_expediente,
    os.fecha_creacion,
    os.estado,
    
    -- Información del Servicio
    s.nombre AS nombre_servicio,
    s.descripcion AS descripcion_servicio,
    
    -- Información del Cliente
    u_cliente.nombre AS nombre_cliente,
    u_cliente.apellido AS apellido_cliente,
    u_cliente.correo AS correo_cliente,
    u_cliente.telefono AS telefono_cliente,
    
    -- Información de la Empresa (si existe)
    e.nombre AS nombre_empresa,
    e.nit AS nit_empresa,
    
    -- Información del Empleado Asignado (si existe)
    u_empleado.nombre AS nombre_empleado_asignado,
    u_empleado.apellido AS apellido_empleado_asignado,
    u_empleado.correo AS correo_empleado,
    
    -- *** DATOS DEL FORMULARIO DE LA SOLICITUD ***
    os.tipodepersona AS tipo_persona,
    os.tipodedocumento AS tipo_documento,
    os.numerodedocumento AS numero_documento,
    os.nombrecompleto AS nombre_completo_formulario,
    os.correoelectronico AS correo_formulario,
    os.telefono AS telefono_formulario,
    os.direccion AS direccion_formulario,
    os.tipodeentidadrazonsocial AS tipo_entidad_razon_social,
    os.nombredelaempresa AS nombre_empresa_formulario,
    os.nit AS nit_formulario,
    os.poderdelrepresentanteautorizado AS poder_representante,
    os.poderparaelregistrodelamarca AS poder_registro_marca,
    
    -- Información de Anulación (si está anulada)
    os.motivo_anulacion,
    os.fecha_anulacion,
    u_anulo.nombre AS anulado_por_nombre,
    u_anulo.apellido AS anulado_por_apellido,
    
    -- Totales
    os.total_estimado,
    
    -- Ubicación
    os.pais,
    os.ciudad,
    os.codigo_postal

FROM ordenes_de_servicios os

-- Join con Servicios
JOIN servicios s ON os.id_servicio = s.id_servicio

-- Join con Clientes y su Usuario
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u_cliente ON c.id_usuario = u_cliente.id_usuario

-- Left Join con Empresas (puede no tener)
LEFT JOIN empresas e ON os.id_empresa = e.id_empresa

-- Left Join con Empleado Asignado (puede no tener)
LEFT JOIN usuarios u_empleado ON os.id_empleado_asignado = u_empleado.id_usuario

-- Left Join con Usuario que Anuló (puede no estar anulada)
LEFT JOIN usuarios u_anulo ON os.anulado_por = u_anulo.id_usuario

ORDER BY os.fecha_creacion DESC;


-- ============================================================
-- CONSULTA RESUMIDA - SOLO LO ESENCIAL
-- ============================================================

SELECT 
    os.id_orden_servicio AS 'ID',
    os.numero_expediente AS 'N° Expediente',
    os.fecha_creacion AS 'Fecha Creación',
    os.estado AS 'Estado',
    s.nombre AS 'Servicio',
    CONCAT(u_cliente.nombre, ' ', u_cliente.apellido) AS 'Cliente',
    e.nombre AS 'Empresa',
    CONCAT(u_empleado.nombre, ' ', u_empleado.apellido) AS 'Empleado Asignado'
    
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u_cliente ON c.id_usuario = u_cliente.id_usuario
LEFT JOIN empresas e ON os.id_empresa = e.id_empresa
LEFT JOIN usuarios u_empleado ON os.id_empleado_asignado = u_empleado.id_usuario

ORDER BY os.fecha_creacion DESC;


-- ============================================================
-- CONSULTA CON ESTADO ACTUAL DEL PROCESO
-- ============================================================

SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    os.fecha_creacion,
    os.estado AS estado_general,
    
    -- Estado actual del proceso
    dos.estado AS estado_proceso_actual,
    dos.fecha_estado AS fecha_estado_actual,
    
    s.nombre AS servicio,
    CONCAT(u_cliente.nombre, ' ', u_cliente.apellido) AS cliente,
    CONCAT(u_empleado.nombre, ' ', u_empleado.apellido) AS empleado_asignado

FROM ordenes_de_servicios os

JOIN servicios s ON os.id_servicio = s.id_servicio
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u_cliente ON c.id_usuario = u_cliente.id_usuario
LEFT JOIN usuarios u_empleado ON os.id_empleado_asignado = u_empleado.id_usuario

-- Obtener el estado actual (último registro)
LEFT JOIN (
    SELECT 
        id_orden_servicio,
        estado,
        fecha_estado,
        ROW_NUMBER() OVER (PARTITION BY id_orden_servicio ORDER BY fecha_estado DESC) as rn
    FROM detalles_ordenes_servicio
) dos ON os.id_orden_servicio = dos.id_orden_servicio AND dos.rn = 1

ORDER BY os.fecha_creacion DESC;


-- ============================================================
-- ESTADÍSTICAS DE SOLICITUDES
-- ============================================================

-- Total de solicitudes por estado
SELECT 
    estado,
    COUNT(*) AS total
FROM ordenes_de_servicios
GROUP BY estado
ORDER BY total DESC;

-- Total de solicitudes por servicio
SELECT 
    s.nombre AS servicio,
    COUNT(*) AS total_solicitudes
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
GROUP BY s.nombre
ORDER BY total_solicitudes DESC;

-- Solicitudes por empleado
SELECT 
    CONCAT(u.nombre, ' ', u.apellido) AS empleado,
    COUNT(*) AS solicitudes_asignadas
FROM ordenes_de_servicios os
JOIN usuarios u ON os.id_empleado_asignado = u.id_usuario
GROUP BY u.id_usuario, u.nombre, u.apellido
ORDER BY solicitudes_asignadas DESC;


-- ============================================================
-- CONSULTA SOLO DATOS DEL FORMULARIO
-- ============================================================

SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    s.nombre AS servicio,
    
    -- Datos Personales del Formulario
    os.tipodepersona AS 'Tipo Persona',
    os.tipodedocumento AS 'Tipo Documento',
    os.numerodedocumento AS 'Número Documento',
    os.nombrecompleto AS 'Nombre Completo',
    os.correoelectronico AS 'Correo',
    os.telefono AS 'Teléfono',
    os.direccion AS 'Dirección',
    
    -- Datos de Empresa (si aplica)
    os.tipodeentidadrazonsocial AS 'Tipo Entidad',
    os.nombredelaempresa AS 'Nombre Empresa',
    os.nit AS 'NIT',
    
    -- Poderes/Documentos Legales
    os.poderdelrepresentanteautorizado AS 'Poder Representante',
    os.poderparaelregistrodelamarca AS 'Poder Registro Marca',
    
    -- Ubicación
    os.pais AS 'País',
    os.ciudad AS 'Ciudad',
    os.codigo_postal AS 'Código Postal',
    
    os.fecha_creacion

FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
ORDER BY os.fecha_creacion DESC;


-- ============================================================
-- CONSULTA DETALLADA DE UNA SOLICITUD ESPECÍFICA
-- (Cambia el ID por el de la solicitud que quieras ver)
-- ============================================================

SELECT 
    '=== INFORMACIÓN GENERAL ===' AS seccion,
    NULL AS campo,
    NULL AS valor
UNION ALL
SELECT 
    NULL,
    'ID Solicitud',
    CAST(os.id_orden_servicio AS CHAR)
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'N° Expediente',
    os.numero_expediente
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Estado',
    os.estado
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Fecha Creación',
    DATE_FORMAT(os.fecha_creacion, '%d/%m/%Y %H:%i')
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    '=== DATOS DEL FORMULARIO ===',
    NULL,
    NULL
UNION ALL
SELECT 
    NULL,
    'Tipo de Persona',
    os.tipodepersona
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Tipo de Documento',
    os.tipodedocumento
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Número de Documento',
    os.numerodedocumento
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Nombre Completo',
    os.nombrecompleto
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Correo Electrónico',
    os.correoelectronico
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Teléfono',
    os.telefono
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Dirección',
    os.direccion
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    '=== DATOS DE EMPRESA (si aplica) ===',
    NULL,
    NULL
UNION ALL
SELECT 
    NULL,
    'Tipo de Entidad',
    os.tipodeentidadrazonsocial
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'Nombre de la Empresa',
    os.nombredelaempresa
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT 
    NULL,
    'NIT',
    os.nit
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1;


-- ============================================================
-- CONSULTAS ESPECÍFICAS
-- ============================================================

-- Solicitudes pendientes sin empleado asignado
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    s.nombre AS servicio,
    CONCAT(u_cliente.nombre, ' ', u_cliente.apellido) AS cliente,
    os.fecha_creacion,
    DATEDIFF(NOW(), os.fecha_creacion) AS dias_pendiente
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u_cliente ON c.id_usuario = u_cliente.id_usuario
WHERE os.estado = 'Pendiente' 
  AND os.id_empleado_asignado IS NULL
ORDER BY os.fecha_creacion ASC;

-- Solicitudes anuladas con motivo
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    s.nombre AS servicio,
    CONCAT(u_cliente.nombre, ' ', u_cliente.apellido) AS cliente,
    os.fecha_anulacion,
    os.motivo_anulacion,
    CONCAT(u_anulo.nombre, ' ', u_anulo.apellido) AS anulado_por
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u_cliente ON c.id_usuario = u_cliente.id_usuario
LEFT JOIN usuarios u_anulo ON os.anulado_por = u_anulo.id_usuario
WHERE os.estado = 'Anulado'
ORDER BY os.fecha_anulacion DESC;

-- Historial completo de seguimiento de una solicitud específica
-- (Cambiar el ID según la solicitud que quieras consultar)
SELECT 
    s.id_seguimiento,
    s.titulo,
    s.descripcion,
    s.estado_anterior,
    s.nuevo_estado,
    s.observaciones,
    s.fecha_registro,
    CONCAT(u.nombre, ' ', u.apellido) AS registrado_por
FROM seguimientos s
LEFT JOIN usuarios u ON s.registrado_por = u.id_usuario
WHERE s.id_orden_servicio = 1  -- Cambiar por el ID de la solicitud
ORDER BY s.fecha_registro ASC;


-- ============================================================
-- CONSULTA CON TODAS LAS NOTIFICACIONES ENVIADAS
-- ============================================================

SELECT 
    n.id_notificacion,
    n.id_orden_servicio,
    os.numero_expediente,
    n.tipo_notificacion,
    n.destinatario_email,
    n.asunto,
    n.fecha_envio,
    n.estado_envio
FROM notificaciones n
JOIN ordenes_de_servicios os ON n.id_orden_servicio = os.id_orden_servicio
ORDER BY n.fecha_envio DESC;


-- ============================================================
-- CONSULTA MÁS SIMPLE - VER TODO DE UNA SOLICITUD
-- (Cambia el número 1 por el ID de la solicitud que quieras ver)
-- ============================================================

SELECT * 
FROM ordenes_de_servicios 
WHERE id_orden_servicio = 1;


-- ============================================================
-- CONSULTA RÁPIDA - TODOS LOS DATOS DE FORMULARIO DE TODAS LAS SOLICITUDES
-- ============================================================

SELECT 
    id_orden_servicio AS 'ID',
    numero_expediente AS 'Expediente',
    fecha_creacion AS 'Fecha',
    estado AS 'Estado',
    
    -- TODOS los campos del formulario
    tipodepersona,
    tipodedocumento,
    numerodedocumento,
    nombrecompleto,
    correoelectronico,
    telefono,
    direccion,
    tipodeentidadrazonsocial,
    nombredelaempresa,
    nit,
    poderdelrepresentanteautorizado,
    poderparaelregistrodelamarca,
    pais,
    ciudad,
    codigo_postal,
    total_estimado

FROM ordenes_de_servicios
ORDER BY fecha_creacion DESC;


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

