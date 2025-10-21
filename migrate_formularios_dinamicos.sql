-- =============================================
-- MIGRACIÓN: FORMULARIOS DINÁMICOS PARA PROCESOS LEGALES
-- Fecha: 2025-10-01
-- Descripción: Agregar soporte para formularios JSON dinámicos
-- =============================================

USE registrack;

-- =============================================
-- 1. AGREGAR CAMPO JSON A ORDENES DE SERVICIOS
-- =============================================
ALTER TABLE ordenes_de_servicios 
ADD COLUMN formulario_data JSON NULL 
COMMENT 'Datos del formulario específico por servicio en formato JSON' 
AFTER poderparaelregistrodelamarca;

-- =============================================
-- 2. CREAR TABLA DE AUDITORÍA PARA FORMULARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS auditoria_formularios (
    id_auditoria INT PRIMARY KEY AUTO_INCREMENT,
    id_orden_servicio INT NOT NULL,
    campo_modificado VARCHAR(100) NOT NULL,
    valor_anterior TEXT NULL,
    valor_nuevo TEXT NULL,
    usuario_modificacion INT NOT NULL,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo_modificacion TEXT NULL,
    ip_modificacion VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    
    FOREIGN KEY (id_orden_servicio) REFERENCES ordenes_de_servicios(id_orden_servicio) ON DELETE CASCADE,
    FOREIGN KEY (usuario_modificacion) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    
    INDEX idx_auditoria_orden (id_orden_servicio),
    INDEX idx_auditoria_fecha (fecha_modificacion),
    INDEX idx_auditoria_usuario (usuario_modificacion),
    INDEX idx_auditoria_campo (campo_modificado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. CREAR TABLA DE CONFIGURACIÓN DE FORMULARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS configuracion_formularios (
    id_configuracion INT PRIMARY KEY AUTO_INCREMENT,
    id_servicio INT NOT NULL,
    version_formulario VARCHAR(20) NOT NULL DEFAULT '1.0',
    nombre_formulario VARCHAR(100) NOT NULL,
    campos_configuracion JSON NOT NULL,
    validaciones JSON NULL,
    campos_obligatorios JSON NOT NULL,
    campos_condicionales JSON NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE,
    
    UNIQUE KEY uk_servicio_version (id_servicio, version_formulario),
    INDEX idx_configuracion_servicio (id_servicio),
    INDEX idx_configuracion_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. CREAR ÍNDICES PARA CONSULTAS EFICIENTES EN JSON
-- =============================================

-- Índice para tipo de solicitante
ALTER TABLE ordenes_de_servicios 
ADD INDEX idx_formulario_tipo_solicitante (
    (CAST(formulario_data->>'$.tipo_solicitante' AS CHAR(20)))
);

-- Índice para tipo de documento
ALTER TABLE ordenes_de_servicios 
ADD INDEX idx_formulario_tipo_documento (
    (CAST(formulario_data->>'$.campos_persona_natural.tipo_documento' AS CHAR(50)))
);

-- Índice para número de documento
ALTER TABLE ordenes_de_servicios 
ADD INDEX idx_formulario_numero_documento (
    (CAST(formulario_data->>'$.campos_persona_natural.numero_documento' AS CHAR(20)))
);

-- Índice para nombre de marca
ALTER TABLE ordenes_de_servicios 
ADD INDEX idx_formulario_nombre_marca (
    (CAST(formulario_data->>'$.campos_especificos_servicio.nombre_marca' AS CHAR(100)))
);

-- =============================================
-- 5. INSERTAR CONFIGURACIONES INICIALES DE FORMULARIOS
-- =============================================

-- Búsqueda de Antecedentes
INSERT INTO configuracion_formularios (
    id_servicio, 
    version_formulario, 
    nombre_formulario, 
    campos_configuracion,
    validaciones,
    campos_obligatorios,
    campos_condicionales
) VALUES (
    1, -- Búsqueda de Antecedentes
    '1.0',
    'Formulario Búsqueda de Antecedentes',
    JSON_OBJECT(
        'campos_persona_natural', JSON_ARRAY(
            'nombres_apellidos', 'tipo_documento', 'numero_documento', 
            'direccion', 'telefono', 'correo', 'pais'
        ),
        'campos_especificos', JSON_ARRAY(
            'nombre_a_buscar', 'tipo_producto_servicio', 'logotipo'
        )
    ),
    JSON_OBJECT(
        'numero_documento', 'formato_cedula_colombiana',
        'correo', 'email_valido',
        'telefono', 'formato_telefono_colombiano'
    ),
    JSON_ARRAY(
        'nombres_apellidos', 'tipo_documento', 'numero_documento',
        'correo', 'telefono', 'nombre_a_buscar'
    ),
    JSON_OBJECT(
        'logotipo', JSON_OBJECT(
            'condicion', 'tipo_producto_servicio',
            'requerido_si', 'Servicios con imagen'
        )
    )
);

-- Certificación de Marca
INSERT INTO configuracion_formularios (
    id_servicio, 
    version_formulario, 
    nombre_formulario, 
    campos_configuracion,
    validaciones,
    campos_obligatorios,
    campos_condicionales
) VALUES (
    2, -- Certificación de Marca
    '1.0',
    'Formulario Certificación de Marca',
    JSON_OBJECT(
        'tipo_solicitante', 'Natural|Jurídica',
        'campos_persona_natural', JSON_ARRAY(
            'nombres_apellidos', 'tipo_documento', 'numero_documento',
            'direccion', 'telefono', 'correo', 'pais', 'numero_nit_cedula'
        ),
        'campos_persona_juridica', JSON_ARRAY(
            'tipo_entidad', 'razon_social', 'nit_empresa', 
            'representante_legal', 'direccion_domicilio', 'pais'
        ),
        'campos_especificos', JSON_ARRAY(
            'nombre_marca', 'tipo_producto_servicio', 
            'certificado_camara_comercio', 'logotipo', 'poder_autorizacion'
        )
    ),
    JSON_OBJECT(
        'numero_documento', 'formato_cedula_colombiana',
        'nit_empresa', 'formato_nit_colombiano',
        'correo', 'email_valido'
    ),
    JSON_ARRAY(
        'tipo_solicitante', 'nombre_marca', 'tipo_producto_servicio',
        'poder_autorizacion'
    ),
    JSON_OBJECT(
        'campos_natural', JSON_ARRAY('nombres_apellidos', 'numero_documento'),
        'campos_juridica', JSON_ARRAY('razon_social', 'nit_empresa'),
        'certificado_camara_comercio', JSON_OBJECT(
            'condicion', 'tipo_solicitante',
            'requerido_si', 'Jurídica'
        )
    )
);

-- Renovación de Marca
INSERT INTO configuracion_formularios (
    id_servicio, 
    version_formulario, 
    nombre_formulario, 
    campos_configuracion,
    validaciones,
    campos_obligatorios,
    campos_condicionales
) VALUES (
    3, -- Renovación de Marca
    '1.0',
    'Formulario Renovación de Marca',
    JSON_OBJECT(
        'tipo_solicitante', 'Natural|Jurídica',
        'campos_persona_natural', JSON_ARRAY(
            'nombres_apellidos', 'tipo_documento', 'numero_documento',
            'direccion', 'telefono', 'correo', 'pais'
        ),
        'campos_persona_juridica', JSON_ARRAY(
            'tipo_entidad', 'razon_social', 'nit_empresa',
            'representante_legal', 'pais'
        ),
        'campos_especificos', JSON_ARRAY(
            'nombre_marca', 'numero_expediente_marca', 'poder_autorizacion',
            'certificado_renovacion', 'logotipo'
        )
    ),
    JSON_OBJECT(
        'numero_documento', 'formato_cedula_colombiana',
        'numero_expediente_marca', 'formato_expediente_sic'
    ),
    JSON_ARRAY(
        'tipo_solicitante', 'nombre_marca', 'numero_expediente_marca',
        'poder_autorizacion'
    ),
    JSON_OBJECT(
        'certificado_renovacion', JSON_OBJECT(
            'condicion', 'tipo_solicitante',
            'requerido_si', 'Jurídica'
        )
    )
);

-- Cesión de Marca
INSERT INTO configuracion_formularios (
    id_servicio, 
    version_formulario, 
    nombre_formulario, 
    campos_configuracion,
    validaciones,
    campos_obligatorios,
    campos_condicionales
) VALUES (
    5, -- Cesión de Marca
    '1.0',
    'Formulario Cesión de Marca',
    JSON_OBJECT(
        'tipo_solicitante', 'Titular|Representante Autorizado',
        'campos_titular', JSON_ARRAY(
            'nombres_apellidos', 'tipo_documento', 'numero_documento',
            'direccion', 'telefono', 'correo', 'pais'
        ),
        'campos_cesionario', JSON_ARRAY(
            'nombre_razon_social', 'nit', 'representante_legal',
            'tipo_documento', 'numero_documento', 'correo', 'telefono', 'direccion'
        ),
        'campos_especificos', JSON_ARRAY(
            'nombre_marca', 'numero_expediente_marca', 'documento_cesion', 'poder_autorizacion'
        )
    ),
    JSON_OBJECT(
        'numero_documento', 'formato_cedula_colombiana',
        'nit', 'formato_nit_colombiano'
    ),
    JSON_ARRAY(
        'tipo_solicitante', 'nombre_marca', 'numero_expediente_marca',
        'documento_cesion', 'poder_autorizacion'
    ),
    JSON_OBJECT(
        'campos_cesionario', JSON_ARRAY(
            'nombre_razon_social', 'nit', 'correo', 'telefono'
        )
    )
);

-- Presentación de Oposición
INSERT INTO configuracion_formularios (
    id_servicio, 
    version_formulario, 
    nombre_formulario, 
    campos_configuracion,
    validaciones,
    campos_obligatorios,
    campos_condicionales
) VALUES (
    4, -- Presentación de Oposición
    '1.0',
    'Formulario Presentación de Oposición',
    JSON_OBJECT(
        'tipo_solicitante', 'Titular',
        'campos_persona_natural', JSON_ARRAY(
            'nombres_apellidos', 'tipo_documento', 'numero_documento',
            'direccion', 'telefono', 'correo', 'pais', 'nit_empresa'
        ),
        'campos_persona_juridica', JSON_ARRAY(
            'tipo_entidad', 'razon_social', 'nit_empresa',
            'representante_legal', 'pais'
        ),
        'campos_especificos', JSON_ARRAY(
            'nombre_marca', 'marca_a_oponerse', 'poder_autorizacion',
            'argumentos_respuesta', 'documentos_oposicion'
        )
    ),
    JSON_OBJECT(
        'numero_documento', 'formato_cedula_colombiana',
        'nit_empresa', 'formato_nit_colombiano'
    ),
    JSON_ARRAY(
        'tipo_solicitante', 'nombre_marca', 'marca_a_oponerse',
        'poder_autorizacion'
    ),
    JSON_OBJECT(
        'argumentos_respuesta', JSON_ARRAY('argumentos_respuesta'),
        'documentos_oposicion', JSON_ARRAY('documentos_oposicion')
    )
);

-- Respuesta a Oposición
INSERT INTO configuracion_formularios (
    id_servicio, 
    version_formulario, 
    nombre_formulario, 
    campos_configuracion,
    validaciones,
    campos_obligatorios,
    campos_condicionales
) VALUES (
    7, -- Respuesta a Oposición
    '1.0',
    'Formulario Respuesta a Oposición',
    JSON_OBJECT(
        'campos_persona_natural', JSON_ARRAY(
            'nombres_apellidos', 'tipo_documento', 'numero_documento',
            'direccion', 'telefono', 'correo', 'pais', 'nit_empresa'
        ),
        'campos_persona_juridica', JSON_ARRAY(
            'razon_social', 'representante_legal', 'pais',
            'nit_empresa'
        ),
        'campos_especificos', JSON_ARRAY(
            'nombre_marca', 'numero_expediente_marca', 'marca_opositora',
            'poder_autorizacion'
        )
    ),
    JSON_OBJECT(
        'numero_documento', 'formato_cedula_colombiana',
        'nit_empresa', 'formato_nit_colombiano'
    ),
    JSON_ARRAY(
        'nombre_marca', 'numero_expediente_marca', 'marca_opositora',
        'poder_autorizacion'
    ),
    JSON_OBJECT(
        'campos_juridica', JSON_ARRAY('razon_social', 'nit_empresa')
    )
);

-- =============================================
-- 6. CREAR TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- =============================================

DELIMITER $$

-- Trigger para auditoría de cambios en formulario_data
CREATE TRIGGER tr_auditoria_formulario_update
AFTER UPDATE ON ordenes_de_servicios
FOR EACH ROW
BEGIN
    -- Solo auditar si cambió el formulario_data
    IF OLD.formulario_data != NEW.formulario_data OR 
       (OLD.formulario_data IS NULL AND NEW.formulario_data IS NOT NULL) OR
       (OLD.formulario_data IS NOT NULL AND NEW.formulario_data IS NULL) THEN
        
        INSERT INTO auditoria_formularios (
            id_orden_servicio,
            campo_modificado,
            valor_anterior,
            valor_nuevo,
            usuario_modificacion,
            motivo_modificacion
        ) VALUES (
            NEW.id_orden_servicio,
            'formulario_data',
            OLD.formulario_data,
            NEW.formulario_data,
            COALESCE(@usuario_actual, 1), -- Usar variable de sesión o default
            'Actualización de formulario'
        );
    END IF;
END$$

DELIMITER ;

-- =============================================
-- 7. CREAR VISTAS PARA CONSULTAS FRECUENTES
-- =============================================

-- Vista para consultar datos de formularios de manera estructurada
CREATE VIEW vw_formularios_estructurados AS
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    s.nombre as servicio_nombre,
    os.fecha_creacion,
    os.estado,
    -- Extraer datos comunes del JSON
    JSON_UNQUOTE(os.formulario_data->>'$.tipo_solicitante') as tipo_solicitante,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_persona_natural.nombres_apellidos') as nombres_apellidos,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_persona_natural.numero_documento') as numero_documento,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_persona_juridica.razon_social') as razon_social,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_persona_juridica.nit_empresa') as nit_empresa,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_especificos_servicio.nombre_marca') as nombre_marca,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_especificos_servicio.numero_expediente') as numero_expediente_marca,
    os.formulario_data
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
WHERE os.formulario_data IS NOT NULL;

-- =============================================
-- 8. COMENTARIOS Y DOCUMENTACIÓN
-- =============================================

-- Comentarios en las tablas
ALTER TABLE ordenes_de_servicios 
COMMENT = 'Tabla principal de órdenes de servicio con soporte para formularios JSON dinámicos';

ALTER TABLE auditoria_formularios 
COMMENT = 'Auditoría de cambios en formularios para cumplimiento legal';

ALTER TABLE configuracion_formularios 
COMMENT = 'Configuración de campos y validaciones por servicio';

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

SELECT 'Migración de formularios dinámicos completada exitosamente' as resultado;
