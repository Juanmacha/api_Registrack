-- =============================================
-- ACTUALIZACIÓN DE SERVICIOS PARA FORMULARIOS NUEVOS
-- Fecha: 2025-10-01
-- Descripción: Actualizar nombres y configuraciones de servicios
-- =============================================

USE registrack;

-- =============================================
-- 1. ACTUALIZAR NOMBRES DE SERVICIOS SEGÚN FORMULARIOS NUEVOS
-- =============================================

-- Actualizar "Certificación de Marca" a "Registro de Marca (Certificación de marca)"
UPDATE servicios 
SET nombre = 'Registro de Marca (Certificación de marca)',
    descripcion = 'Proceso completo de registro y certificación de marca comercial ante la Superintendencia de Industria y Comercio',
    descripcion_corta = 'Registrar y certificar marca comercial ante la SIC',
    updated_at = CURRENT_TIMESTAMP
WHERE id_servicio = 2;

-- Actualizar "Presentación de Oposición" a "Presentación de Oposición" (corregir nombre)
UPDATE servicios 
SET nombre = 'Presentación de Oposición',
    descripcion = 'Presentar oposición a registros de marca que puedan afectar tus derechos de propiedad intelectual',
    descripcion_corta = 'Oponerse a registro de marca',
    updated_at = CURRENT_TIMESTAMP
WHERE id_servicio = 4;

-- Actualizar "Cesión de Derechos" a "Cesión de Marca"
UPDATE servicios 
SET nombre = 'Cesión de Marca',
    descripcion = 'Proceso de cesión y transferencia de derechos de marca comercial registrada',
    descripcion_corta = 'Ceder derechos de marca comercial',
    updated_at = CURRENT_TIMESTAMP
WHERE id_servicio = 5;

-- Actualizar "Respuesta a Oposición" a "Respuesta de Oposición"
UPDATE servicios 
SET nombre = 'Respuesta de Oposición',
    descripcion = 'Responder a oposiciones presentadas contra tu solicitud de registro de marca',
    descripcion_corta = 'Responder a oposiciones de marca',
    updated_at = CURRENT_TIMESTAMP
WHERE id_servicio = 7;

-- =============================================
-- 2. ACTUALIZAR RUTAS DE SERVICIOS
-- =============================================

UPDATE servicios 
SET route_path = '/pages/registro-marca'
WHERE id_servicio = 2;

UPDATE servicios 
SET route_path = '/pages/presentacion-oposicion'
WHERE id_servicio = 4;

UPDATE servicios 
SET route_path = '/pages/cesion-marca'
WHERE id_servicio = 5;

UPDATE servicios 
SET route_path = '/pages/respuesta-oposicion'
WHERE id_servicio = 7;

-- =============================================
-- 3. ACTUALIZAR DATOS DE LANDING E INFO PAGE
-- =============================================

-- Registro de Marca (Certificación de marca)
UPDATE servicios 
SET landing_data = JSON_OBJECT(
    'titulo', 'Registro de Marca (Certificación de marca)',
    'resumen', 'Proceso completo de registro y certificación de tu marca comercial ante la SIC',
    'imagen', '',
    'beneficios', JSON_ARRAY(
        'Protección legal de tu marca',
        'Exclusividad en el mercado',
        'Valor agregado a tu empresa',
        'Acompañamiento especializado'
    )
),
info_page_data = JSON_OBJECT(
    'descripcion', 'Servicio completo para registrar y certificar tu marca comercial ante la Superintendencia de Industria y Comercio. Incluye búsqueda de antecedentes, preparación de documentos y seguimiento del proceso.',
    'costo', '$1.848.000',
    'vigencia', '10 años',
    'requisitos', JSON_ARRAY(
        'Ser persona natural o jurídica',
        'Tener documento de identidad vigente',
        'Definir nombre de la marca',
        'Especificar clase NIZA',
        'Tener poder de representación'
    ),
    'proceso_paso_a_paso', JSON_ARRAY(
        'Diligenciar formulario de solicitud',
        'Adjuntar documentos requeridos',
        'Realizar pago del trámite',
        'Revisión y aprobación por SIC',
        'Recibir certificado de registro'
    ),
    'tiempo_procesamiento', '6-8 meses',
    'entidad_emisora', 'Superintendencia de Industria y Comercio',
    'contacto_soporte', JSON_OBJECT(
        'email', 'soporte@registrack.com',
        'horario', 'Lunes a Viernes 8:00 AM - 6:00 PM',
        'telefono', '601-123-4567'
    )
)
WHERE id_servicio = 2;

-- Presentación de Oposición
UPDATE servicios 
SET landing_data = JSON_OBJECT(
    'titulo', 'Presentación de Oposición',
    'resumen', 'Defiende tus derechos de marca presentando una oposición a registros que puedan afectarte',
    'imagen', '',
    'beneficios', JSON_ARRAY(
        'Protección de derechos existentes',
        'Prevención de conflictos legales',
        'Asesoría especializada',
        'Representación legal'
    )
),
info_page_data = JSON_OBJECT(
    'descripcion', 'Servicio para presentar oposiciones a solicitudes de registro de marca que puedan afectar tus derechos de propiedad intelectual existentes.',
    'costo', '$1.400.000',
    'vigencia', 'Durante el proceso de oposición',
    'requisitos', JSON_ARRAY(
        'Ser titular de marca registrada',
        'Tener derechos previos',
        'Identificar marca conflictiva',
        'Preparar argumentos legales',
        'Tener poder de representación'
    ),
    'proceso_paso_a_paso', JSON_ARRAY(
        'Identificar marca conflictiva',
        'Preparar argumentos de oposición',
        'Recopilar documentos soporte',
        'Presentar oposición ante SIC',
        'Seguimiento del proceso'
    ),
    'tiempo_procesamiento', '3-6 meses',
    'entidad_emisora', 'Superintendencia de Industria y Comercio'
)
WHERE id_servicio = 4;

-- Cesión de Marca
UPDATE servicios 
SET landing_data = JSON_OBJECT(
    'titulo', 'Cesión de Marca',
    'resumen', 'Gestiona la transferencia de derechos de tu marca de forma segura y legal',
    'imagen', '',
    'beneficios', JSON_ARRAY(
        'Transferencia legal segura',
        'Documentación completa',
        'Asesoría especializada',
        'Cumplimiento normativo'
    )
),
info_page_data = JSON_OBJECT(
    'descripcion', 'Proceso para ceder los derechos de una marca comercial registrada a otra persona natural o jurídica.',
    'costo', '$865.000',
    'vigencia', 'Permanente',
    'requisitos', JSON_ARRAY(
        'Ser titular de marca registrada',
        'Tener documento de cesión',
        'Identificar cesionario',
        'Tener poder de representación',
        'Documentos de identidad'
    ),
    'proceso_paso_a_paso', JSON_ARRAY(
        'Preparar documento de cesión',
        'Identificar cesionario',
        'Recopilar documentos',
        'Presentar solicitud ante SIC',
        'Recibir certificado de cesión'
    ),
    'tiempo_procesamiento', '2-4 meses',
    'entidad_emisora', 'Superintendencia de Industria y Comercio'
)
WHERE id_servicio = 5;

-- Respuesta de Oposición
UPDATE servicios 
SET landing_data = JSON_OBJECT(
    'titulo', 'Respuesta de Oposición',
    'resumen', 'Responde a oposiciones presentadas contra tu marca con argumentos legales sólidos',
    'imagen', '',
    'beneficios', JSON_ARRAY(
        'Defensa legal especializada',
        'Argumentos técnicos sólidos',
        'Representación ante SIC',
        'Protección de derechos'
    )
),
info_page_data = JSON_OBJECT(
    'descripcion', 'Servicio para responder a oposiciones presentadas contra tu solicitud de registro de marca comercial.',
    'costo', '$1.200.000',
    'vigencia', 'Durante el proceso de respuesta',
    'requisitos', JSON_ARRAY(
        'Ser solicitante de marca',
        'Tener solicitud en proceso',
        'Recibir notificación de oposición',
        'Preparar argumentos de defensa',
        'Tener poder de representación'
    ),
    'proceso_paso_a_paso', JSON_ARRAY(
        'Analizar oposición recibida',
        'Preparar argumentos de defensa',
        'Recopilar documentos soporte',
        'Presentar respuesta ante SIC',
        'Seguimiento del proceso'
    ),
    'tiempo_procesamiento', '2-4 meses',
    'entidad_emisora', 'Superintendencia de Industria y Comercio'
)
WHERE id_servicio = 7;

-- =============================================
-- 4. VERIFICAR ACTUALIZACIONES
-- =============================================

SELECT 
    id_servicio,
    nombre,
    descripcion_corta,
    route_path,
    precio_base,
    estado
FROM servicios 
ORDER BY id_servicio;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

SELECT 'Actualización de servicios completada exitosamente' as resultado;
