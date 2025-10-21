-- =============================================
-- DATOS DE PRUEBA PARA FORMULARIOS DINÁMICOS
-- Fecha: 2025-10-01
-- Descripción: Insertar datos de ejemplo para probar formularios JSON
-- =============================================

USE registrack;

-- =============================================
-- 1. DATOS DE PRUEBA PARA BÚSQUEDA DE ANTECEDENTES
-- =============================================

INSERT INTO ordenes_de_servicios (
    id_cliente,
    id_servicio,
    id_empresa,
    total_estimado,
    estado,
    pais,
    ciudad,
    codigo_postal,
    formulario_data
) VALUES (
    1, -- Cliente existente
    1, -- Búsqueda de Antecedentes
    1, -- Empresa existente
    150000.00,
    'Solicitud Recibida',
    'Colombia',
    'Bogotá',
    '110111',
    JSON_OBJECT(
        'tipo_solicitante', 'Natural',
        'campos_persona_natural', JSON_OBJECT(
            'nombres_apellidos', 'Juan Carlos Pérez García',
            'tipo_documento', 'Cédula de Ciudadanía',
            'numero_documento', '12345678',
            'direccion', 'Calle 123 #45-67',
            'telefono', '3001234567',
            'correo', 'juan.perez@email.com',
            'pais', 'Colombia'
        ),
        'campos_especificos_servicio', JSON_OBJECT(
            'nombre_a_buscar', 'TechNova Solutions',
            'tipo_producto_servicio', 'Servicios de tecnología y software',
            'logotipo', 'logotipo_tecnova.jpg'
        ),
        'metadatos', JSON_OBJECT(
            'fecha_creacion', '2025-10-01T10:30:00Z',
            'usuario_creacion', 'cliente_1',
            'version_formulario', '1.0',
            'campos_validados', true
        )
    )
);

-- =============================================
-- 2. DATOS DE PRUEBA PARA REGISTRO DE MARCA (PERSONA NATURAL)
-- =============================================

INSERT INTO ordenes_de_servicios (
    id_cliente,
    id_servicio,
    id_empresa,
    total_estimado,
    estado,
    pais,
    ciudad,
    codigo_postal,
    formulario_data
) VALUES (
    2, -- Cliente existente
    2, -- Registro de Marca
    2, -- Empresa existente
    1848000.00,
    'Solicitud Recibida',
    'Colombia',
    'Medellín',
    '050001',
    JSON_OBJECT(
        'tipo_solicitante', 'Natural',
        'campos_persona_natural', JSON_OBJECT(
            'nombres_apellidos', 'María Elena Rodríguez López',
            'tipo_documento', 'Cédula de Ciudadanía',
            'numero_documento', '87654321',
            'direccion', 'Carrera 50 #25-30',
            'telefono', '3008765432',
            'correo', 'maria.rodriguez@email.com',
            'pais', 'Colombia',
            'numero_nit_cedula', '87654321'
        ),
        'campos_especificos_servicio', JSON_OBJECT(
            'nombre_marca', 'EcoFashion',
            'tipo_producto_servicio', 'Ropa ecológica y sostenible',
            'certificado_camara_comercio', 'certificado_maria.pdf',
            'logotipo', 'logotipo_ecofashion.jpg',
            'poder_autorizacion', 'poder_maria.pdf'
        ),
        'metadatos', JSON_OBJECT(
            'fecha_creacion', '2025-10-01T11:15:00Z',
            'usuario_creacion', 'cliente_2',
            'version_formulario', '1.0',
            'campos_validados', true
        )
    )
);

-- =============================================
-- 3. DATOS DE PRUEBA PARA REGISTRO DE MARCA (PERSONA JURÍDICA)
-- =============================================

INSERT INTO ordenes_de_servicios (
    id_cliente,
    id_servicio,
    id_empresa,
    total_estimado,
    estado,
    pais,
    ciudad,
    codigo_postal,
    formulario_data
) VALUES (
    3, -- Cliente existente
    2, -- Registro de Marca
    3, -- Empresa existente
    1848000.00,
    'Solicitud Recibida',
    'Colombia',
    'Cali',
    '760001',
    JSON_OBJECT(
        'tipo_solicitante', 'Jurídica',
        'campos_persona_juridica', JSON_OBJECT(
            'tipo_entidad', 'SAS',
            'razon_social', 'Innovación Tecnológica S.A.S',
            'nit_empresa', '900123456-1',
            'representante_legal', 'Carlos Alberto Mendoza',
            'direccion_domicilio', 'Avenida 6N #28-09',
            'pais', 'Colombia'
        ),
        'campos_especificos_servicio', JSON_OBJECT(
            'nombre_marca', 'InnoTech Pro',
            'tipo_producto_servicio', 'Servicios de consultoría tecnológica',
            'certificado_camara_comercio', 'certificado_innotech.pdf',
            'logotipo', 'logotipo_innotech.jpg',
            'poder_autorizacion', 'poder_carlos.pdf'
        ),
        'metadatos', JSON_OBJECT(
            'fecha_creacion', '2025-10-01T12:00:00Z',
            'usuario_creacion', 'cliente_3',
            'version_formulario', '1.0',
            'campos_validados', true
        )
    )
);

-- =============================================
-- 4. DATOS DE PRUEBA PARA RENOVACIÓN DE MARCA
-- =============================================

INSERT INTO ordenes_de_servicios (
    id_cliente,
    id_servicio,
    id_empresa,
    total_estimado,
    estado,
    pais,
    ciudad,
    codigo_postal,
    formulario_data
) VALUES (
    1, -- Cliente existente
    3, -- Renovación de Marca
    1, -- Empresa existente
    1352000.00,
    'Solicitud Recibida',
    'Colombia',
    'Bogotá',
    '110111',
    JSON_OBJECT(
        'tipo_solicitante', 'Natural',
        'campos_persona_natural', JSON_OBJECT(
            'nombres_apellidos', 'Ana Patricia Silva',
            'tipo_documento', 'Cédula de Ciudadanía',
            'numero_documento', '11223344',
            'direccion', 'Calle 80 #40-50',
            'telefono', '3001122334',
            'correo', 'ana.silva@email.com',
            'pais', 'Colombia'
        ),
        'campos_especificos_servicio', JSON_OBJECT(
            'nombre_marca', 'Artisan Crafts',
            'numero_expediente_marca', 'EXP-2020-123456',
            'poder_autorizacion', 'poder_ana.pdf',
            'certificado_renovacion', 'certificado_renovacion.pdf',
            'logotipo', 'logotipo_artisan.jpg'
        ),
        'metadatos', JSON_OBJECT(
            'fecha_creacion', '2025-10-01T13:30:00Z',
            'usuario_creacion', 'cliente_1',
            'version_formulario', '1.0',
            'campos_validados', true
        )
    )
);

-- =============================================
-- 5. DATOS DE PRUEBA PARA CESIÓN DE MARCA
-- =============================================

INSERT INTO ordenes_de_servicios (
    id_cliente,
    id_servicio,
    id_empresa,
    total_estimado,
    estado,
    pais,
    ciudad,
    codigo_postal,
    formulario_data
) VALUES (
    2, -- Cliente existente
    5, -- Cesión de Marca
    2, -- Empresa existente
    865000.00,
    'Solicitud Recibida',
    'Colombia',
    'Medellín',
    '050001',
    JSON_OBJECT(
        'tipo_solicitante', 'Titular',
        'campos_titular', JSON_OBJECT(
            'nombres_apellidos', 'Roberto Carlos Vega',
            'tipo_documento', 'Cédula de Ciudadanía',
            'numero_documento', '55667788',
            'direccion', 'Carrera 70 #25-15',
            'telefono', '3005566778',
            'correo', 'roberto.vega@email.com',
            'pais', 'Colombia'
        ),
        'campos_cesionario', JSON_OBJECT(
            'nombre_razon_social', 'Distribuidora Vega S.A.S',
            'nit', '900987654-3',
            'representante_legal', 'Roberto Carlos Vega',
            'tipo_documento', 'Cédula de Ciudadanía',
            'numero_documento', '55667788',
            'correo', 'ventas@distribuidoravega.com',
            'telefono', '3005566779',
            'direccion', 'Carrera 70 #25-15'
        ),
        'campos_especificos_servicio', JSON_OBJECT(
            'nombre_marca', 'Vega Distributions',
            'numero_expediente_marca', 'EXP-2019-789012',
            'documento_cesion', 'documento_cesion.pdf',
            'poder_autorizacion', 'poder_roberto.pdf'
        ),
        'metadatos', JSON_OBJECT(
            'fecha_creacion', '2025-10-01T14:45:00Z',
            'usuario_creacion', 'cliente_2',
            'version_formulario', '1.0',
            'campos_validados', true
        )
    )
);

-- =============================================
-- 6. DATOS DE PRUEBA PARA PRESENTACIÓN DE OPOSICIÓN
-- =============================================

INSERT INTO ordenes_de_servicios (
    id_cliente,
    id_servicio,
    id_empresa,
    total_estimado,
    estado,
    pais,
    ciudad,
    codigo_postal,
    formulario_data
) VALUES (
    3, -- Cliente existente
    4, -- Presentación de Oposición
    3, -- Empresa existente
    1400000.00,
    'Solicitud Recibida',
    'Colombia',
    'Cali',
    '760001',
    JSON_OBJECT(
        'tipo_solicitante', 'Titular',
        'campos_persona_juridica', JSON_OBJECT(
            'tipo_entidad', 'LTDA',
            'razon_social', 'Comercializadora del Valle Ltda',
            'nit_empresa', '800123456-1',
            'representante_legal', 'Luis Fernando Herrera',
            'pais', 'Colombia'
        ),
        'campos_especificos_servicio', JSON_OBJECT(
            'nombre_marca', 'Valle Verde',
            'marca_a_oponerse', 'Valle Verde Plus',
            'poder_autorizacion', 'poder_luis.pdf',
            'argumentos_respuesta', 'Similitud fonética y conceptual que puede causar confusión en el mercado',
            'documentos_oposicion', JSON_ARRAY('certificado_marca.pdf', 'estudio_confusion.pdf')
        ),
        'metadatos', JSON_OBJECT(
            'fecha_creacion', '2025-10-01T15:20:00Z',
            'usuario_creacion', 'cliente_3',
            'version_formulario', '1.0',
            'campos_validados', true
        )
    )
);

-- =============================================
-- 7. DATOS DE PRUEBA PARA RESPUESTA DE OPOSICIÓN
-- =============================================

INSERT INTO ordenes_de_servicios (
    id_cliente,
    id_servicio,
    id_empresa,
    total_estimado,
    estado,
    pais,
    ciudad,
    codigo_postal,
    formulario_data
) VALUES (
    1, -- Cliente existente
    7, -- Respuesta de Oposición
    1, -- Empresa existente
    1200000.00,
    'Solicitud Recibida',
    'Colombia',
    'Bogotá',
    '110111',
    JSON_OBJECT(
        'campos_persona_natural', JSON_OBJECT(
            'nombres_apellidos', 'Pedro Ramírez',
            'tipo_documento', 'Cédula de Ciudadanía',
            'numero_documento', '99887766',
            'direccion', 'Avenida 68 #12-34',
            'telefono', '3009988776',
            'correo', 'pedro.ramirez@email.com',
            'pais', 'Colombia',
            'nit_empresa', '800987654-2'
        ),
        'campos_especificos_servicio', JSON_OBJECT(
            'nombre_marca', 'Ramirez Solutions',
            'numero_expediente_marca', 'EXP-2021-345678',
            'marca_opositora', 'Ramirez Tech',
            'poder_autorizacion', 'poder_pedro.pdf'
        ),
        'metadatos', JSON_OBJECT(
            'fecha_creacion', '2025-10-01T16:10:00Z',
            'usuario_creacion', 'cliente_1',
            'version_formulario', '1.0',
            'campos_validados', true
        )
    )
);

-- =============================================
-- 8. VERIFICAR DATOS INSERTADOS
-- =============================================

SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    s.nombre as servicio,
    os.estado,
    JSON_UNQUOTE(os.formulario_data->>'$.tipo_solicitante') as tipo_solicitante,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_persona_natural.nombres_apellidos') as nombres_natural,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_persona_juridica.razon_social') as razon_social,
    JSON_UNQUOTE(os.formulario_data->>'$.campos_especificos_servicio.nombre_marca') as nombre_marca,
    os.fecha_creacion
FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
WHERE os.formulario_data IS NOT NULL
ORDER BY os.id_orden_servicio;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

SELECT 'Datos de prueba para formularios dinámicos insertados exitosamente' as resultado;
