import servicioService from "../services/servicio.service.js";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_MESSAGES,
  ERROR_CODES 
} from "../constants/messages.js";

/**
 * Obtener todos los servicios
 */
export const getAllServicios = async (req, res) => {
  try {
    const result = await servicioService.getAllServicios();
    
    // El servicio devuelve { success, data, message }, necesitamos solo los datos
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al obtener servicios",
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Obtener servicio por ID
 */
export const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        error: {
          message: "ID de servicio inválido",
          code: "INVALID_ID",
          details: { field: "id", value: id },
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = await servicioService.getServicioById(id);
    
    // El servicio devuelve { success, data, message }, necesitamos solo los datos
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Servicio no encontrado",
          code: "SERVICE_NOT_FOUND",
          details: { id: req.params.id },
          timestamp: new Date().toISOString()
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        message: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === "development" ? error.message : "Error al obtener servicio",
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Obtener detalle completo de servicio
 */
export const getDetalleServicio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        error: {
          message: "ID de servicio inválido",
          code: "INVALID_ID",
          details: { field: "id", value: id },
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = await servicioService.getDetalleServicio(id);
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener detalle de servicio:", error);
    if (error.message.includes("no encontrado")) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Servicio no encontrado",
          code: "SERVICE_NOT_FOUND",
          details: { id: req.params.id },
          timestamp: new Date().toISOString()
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        message: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === "development" ? error.message : "Error al obtener detalle de servicio",
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Buscar servicios por nombre
 */
export const buscarServiciosPorNombre = async (req, res) => {
  try {
    const { nombre } = req.query;

    if (!nombre || nombre.trim().length < 2) {
      return fail(res, "Debe proporcionar un nombre válido para buscar", 400);
    }

    const result = await servicioService.buscarPorNombre(nombre.trim());
    return ok(res, result);
  } catch (error) {
    console.error("Error al buscar servicios:", error);
    return fail(res, "Error interno del servidor");
  }
};

/**
 * Actualizar servicio (datos de landing page) - CON LOGS DETALLADOS
 */
export const actualizarServicio = async (req, res) => {
  try {
    console.log('🔧 [Backend] ===== INICIANDO ACTUALIZACIÓN DE SERVICIO =====');
    console.log('🔧 [Backend] ID del servicio:', req.params.id);
    console.log('🔧 [Backend] Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('🔧 [Backend] Headers recibidos:', req.headers);
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Validar que el ID sea válido
    if (!id || isNaN(id)) {
      console.log('❌ [Backend] ID inválido');
      return res.status(400).json({ 
        success: false,
        error: { message: 'ID de servicio inválido' }
      });
    }
    
    // Validar que hay datos para actualizar
    console.log('🔍 [Backend] Validando datos recibidos...');
    console.log('🔍 [Backend] updateData:', updateData);
    console.log('🔍 [Backend] Tipo de updateData:', typeof updateData);
    console.log('🔍 [Backend] Keys de updateData:', Object.keys(updateData || {}));
    console.log('🔍 [Backend] Longitud de keys:', Object.keys(updateData || {}).length);
    
    if (!updateData || Object.keys(updateData).length === 0) {
      console.log('❌ [Backend] No hay datos para actualizar');
      return res.status(400).json({ 
        success: false,
        error: { message: 'No hay datos para actualizar' }
      });
    }
    
    console.log('🔧 [Backend] Buscando servicio en la base de datos...');
    
    // Buscar el servicio directamente con Sequelize
    const Servicio = (await import('../models/Servicio.js')).default;
    const servicio = await Servicio.findByPk(id);
    
    if (!servicio) {
      console.log('❌ [Backend] Servicio no encontrado');
      return res.status(404).json({ 
        success: false,
        error: { message: 'Servicio no encontrado' }
      });
    }
    
    console.log('✅ [Backend] Servicio encontrado:', {
      id: servicio.id_servicio,
      nombre: servicio.nombre,
      visible_en_landing: servicio.visible_en_landing,
      tiene_landing_data: !!servicio.landing_data,
      tiene_info_page_data: !!servicio.info_page_data
    });
    
    // 🔍 LOGS DETALLADOS DE COMPARACIÓN
    console.log('🔍 [Backend] ===== COMPARACIÓN DE DATOS =====');
    console.log('🔍 [Backend] Datos actuales del servicio:');
    console.log('🔍 [Backend] - visible_en_landing:', servicio.visible_en_landing);
    console.log('🔍 [Backend] - landing_data:', JSON.stringify(servicio.landing_data, null, 2));
    console.log('🔍 [Backend] - info_page_data:', JSON.stringify(servicio.info_page_data, null, 2));
    
    console.log('🔍 [Backend] Datos recibidos para actualizar:');
    console.log('🔍 [Backend] - visible_en_landing:', updateData.visible_en_landing);
    console.log('🔍 [Backend] - landing_data:', JSON.stringify(updateData.landing_data, null, 2));
    console.log('🔍 [Backend] - info_page_data:', JSON.stringify(updateData.info_page_data, null, 2));
    console.log('🔍 [Backend] - process_states:', JSON.stringify(updateData.process_states, null, 2));
    
    // Verificar si hay cambios reales
    let hayCambios = false;
    
    // Verificar cambios en visible_en_landing
    console.log('🔍 [Backend] ===== VERIFICANDO VISIBLE_EN_LANDING =====');
    console.log('🔍 [Backend] updateData.visible_en_landing:', updateData.visible_en_landing, '(tipo:', typeof updateData.visible_en_landing, ')');
    console.log('🔍 [Backend] servicio.visible_en_landing:', servicio.visible_en_landing, '(tipo:', typeof servicio.visible_en_landing, ')');
    console.log('🔍 [Backend] ¿Es undefined?', updateData.visible_en_landing === undefined);
    console.log('🔍 [Backend] ¿Son diferentes?', updateData.visible_en_landing !== servicio.visible_en_landing);
    
    if (updateData.visible_en_landing !== undefined && updateData.visible_en_landing !== servicio.visible_en_landing) {
      hayCambios = true;
      console.log('✅ [Backend] Cambios detectados en visible_en_landing:', {
        actual: servicio.visible_en_landing,
        nuevo: updateData.visible_en_landing
      });
    } else {
      console.log('❌ [Backend] NO se detectaron cambios en visible_en_landing');
    }
    
    // Verificar cambios en landing_data
    console.log('🔍 [Backend] ===== VERIFICANDO LANDING_DATA =====');
    console.log('🔍 [Backend] updateData.landing_data existe?', !!updateData.landing_data);
    if (updateData.landing_data) {
      const landingDataActual = JSON.stringify(servicio.landing_data || {});
      const landingDataNuevo = JSON.stringify(updateData.landing_data);
      console.log('🔍 [Backend] - Actual JSON:', landingDataActual);
      console.log('🔍 [Backend] - Nuevo JSON:', landingDataNuevo);
      console.log('🔍 [Backend] - ¿Son diferentes?', landingDataActual !== landingDataNuevo);
      
      if (landingDataActual !== landingDataNuevo) {
        hayCambios = true;
        console.log('✅ [Backend] Cambios detectados en landing_data');
      } else {
        console.log('❌ [Backend] NO se detectaron cambios en landing_data');
      }
    } else {
      console.log('❌ [Backend] No se envió landing_data');
    }
    
    // Verificar cambios en info_page_data
    console.log('🔍 [Backend] ===== VERIFICANDO INFO_PAGE_DATA =====');
    console.log('🔍 [Backend] updateData.info_page_data existe?', !!updateData.info_page_data);
    if (updateData.info_page_data) {
      const infoPageActual = JSON.stringify(servicio.info_page_data || {});
      const infoPageNuevo = JSON.stringify(updateData.info_page_data);
      console.log('🔍 [Backend] - Actual JSON:', infoPageActual);
      console.log('🔍 [Backend] - Nuevo JSON:', infoPageNuevo);
      console.log('🔍 [Backend] - ¿Son diferentes?', infoPageActual !== infoPageNuevo);
      
      if (infoPageActual !== infoPageNuevo) {
        hayCambios = true;
        console.log('✅ [Backend] Cambios detectados en info_page_data');
      } else {
        console.log('❌ [Backend] NO se detectaron cambios en info_page_data');
      }
    } else {
      console.log('❌ [Backend] No se envió info_page_data');
    }
    
    // Verificar cambios en process_states (si se envía)
    if (updateData.process_states) {
      console.log('🔍 [Backend] Verificando cambios en process_states...');
      
      // Obtener procesos existentes para comparar
      const Proceso = (await import('../models/Proceso.js')).default;
      const procesosExistentes = await Proceso.findAll({
        where: { servicio_id: id },
        order: [['order_number', 'ASC']]
      });
      
      // Convertir procesos existentes al formato esperado
      const procesosExistentesFormateados = procesosExistentes.map(p => ({
        id: p.id_proceso.toString(),
        name: p.nombre,
        order: p.order_number,
        status_key: p.status_key
      }));
      
      // Comparar con los datos recibidos
      const procesosExistentesJson = JSON.stringify(procesosExistentesFormateados);
      const procesosNuevosJson = JSON.stringify(updateData.process_states);
      
      console.log('🔍 [Backend] Procesos existentes:', procesosExistentesJson);
      console.log('🔍 [Backend] Procesos nuevos:', procesosNuevosJson);
      
      if (procesosExistentesJson !== procesosNuevosJson) {
        hayCambios = true;
        console.log('✅ [Backend] Cambios detectados en process_states');
      } else {
        console.log('🔍 [Backend] No hay cambios en process_states');
      }
    }
    
    console.log('🔍 [Backend] ===== RESUMEN DE CAMBIOS =====');
    console.log('🔍 [Backend] ¿Hay cambios detectados?', hayCambios);
    console.log('🔍 [Backend] Campos enviados:', Object.keys(updateData));
    console.log('🔍 [Backend] Campos verificados: visible_en_landing, landing_data, info_page_data, process_states');
    
    if (!hayCambios) {
      console.log('❌ [Backend] No se detectaron cambios reales en los datos');
      return res.status(400).json({
        success: false,
        error: {
          message: "No se detectaron cambios en los datos para actualizar",
          details: {
            datos_actuales: {
              visible_en_landing: servicio.visible_en_landing,
              landing_data: servicio.landing_data,
              info_page_data: servicio.info_page_data
            },
            datos_recibidos: {
              visible_en_landing: updateData.visible_en_landing,
              landing_data: updateData.landing_data,
              info_page_data: updateData.info_page_data
            }
          }
        }
      });
    }
    
    // Validar campos específicos
    console.log('🔧 [Backend] Validando campos...');
    
    if (updateData.landing_data) {
      console.log('🔧 [Backend] Validando landing_data:', typeof updateData.landing_data);
      if (typeof updateData.landing_data !== 'object') {
        console.log('❌ [Backend] landing_data debe ser un objeto');
        return res.status(400).json({ 
          success: false,
          error: { message: 'landing_data debe ser un objeto' }
        });
      }
    }
    
    if (updateData.info_page_data) {
      console.log('🔧 [Backend] Validando info_page_data:', typeof updateData.info_page_data);
      if (typeof updateData.info_page_data !== 'object') {
        console.log('❌ [Backend] info_page_data debe ser un objeto');
        return res.status(400).json({ 
          success: false,
          error: { message: 'info_page_data debe ser un objeto' }
        });
      }
    }
    
    if (updateData.visible_en_landing !== undefined) {
      console.log('🔧 [Backend] Validando visible_en_landing:', typeof updateData.visible_en_landing);
      if (typeof updateData.visible_en_landing !== 'boolean') {
        console.log('❌ [Backend] visible_en_landing debe ser un boolean');
        return res.status(400).json({ 
          success: false,
          error: { message: 'visible_en_landing debe ser un boolean' }
        });
      }
    }
    
    console.log('🔧 [Backend] Intentando actualizar en la base de datos...');
    console.log('🔧 [Backend] Datos a actualizar:', JSON.stringify(updateData, null, 2));
    
    // Intentar actualizar directamente
    const servicioActualizado = await servicio.update(updateData);
    
    console.log('✅ [Backend] Actualización exitosa');
    console.log('✅ [Backend] Servicio actualizado:', {
      id: servicioActualizado.id_servicio,
      nombre: servicioActualizado.nombre,
      visible_en_landing: servicioActualizado.visible_en_landing,
      landing_data: servicioActualizado.landing_data,
      info_page_data: servicioActualizado.info_page_data
    });
    
    // 🔧 MANEJAR PROCESS_STATES SI SE ENVÍAN
    if (updateData.process_states && Array.isArray(updateData.process_states)) {
      console.log('🔧 [Backend] Procesando process_states...');
      console.log('🔧 [Backend] Process states recibidos:', JSON.stringify(updateData.process_states, null, 2));
      
      try {
        const Proceso = (await import('../models/Proceso.js')).default;
        
        // Obtener procesos existentes del servicio
        console.log('🔧 [Backend] Obteniendo procesos existentes...');
        const procesosExistentes = await Proceso.findAll({
          where: { servicio_id: id },
          order: [['order_number', 'ASC']]
        });
        
        console.log('🔧 [Backend] Procesos existentes:', procesosExistentes.length);
        console.log('🔧 [Backend] Procesos existentes:', procesosExistentes.map(p => ({
          id: p.id_proceso,
          nombre: p.nombre,
          order: p.order_number
        })));
        
        // Separar procesos por tipo de operación
        const procesosParaActualizar = [];
        const procesosParaCrear = [];
        const procesosParaEliminar = [];
        
        // Procesar cada proceso recibido
        for (const proceso of updateData.process_states) {
          if (proceso.id && !isNaN(parseInt(proceso.id))) {
            // Es un proceso existente (tiene ID numérico)
            const procesoExistente = procesosExistentes.find(p => p.id_proceso === parseInt(proceso.id));
            if (procesoExistente) {
              // Actualizar proceso existente
              procesosParaActualizar.push({
                id_proceso: parseInt(proceso.id),
                nombre: proceso.name,
                descripcion: proceso.descripcion || null,
                order_number: proceso.order || procesoExistente.order_number,
                status_key: proceso.status_key
              });
              console.log(`🔧 [Backend] Proceso ${proceso.id} marcado para actualizar`);
            } else {
              // ID no existe, crear como nuevo
              const nuevoOrder = procesosExistentes.length + procesosParaCrear.length + 1;
              procesosParaCrear.push({
                servicio_id: parseInt(id),
                nombre: proceso.name,
                descripcion: proceso.descripcion || null,
                order_number: proceso.order || nuevoOrder,
                status_key: proceso.status_key
              });
              console.log(`🔧 [Backend] Proceso con ID ${proceso.id} no encontrado, se creará como nuevo`);
            }
          } else {
            // Es un proceso nuevo (sin ID o con ID temporal)
            const nuevoOrder = procesosExistentes.length + procesosParaCrear.length + 1;
            procesosParaCrear.push({
              servicio_id: parseInt(id),
              nombre: proceso.name,
              descripcion: proceso.descripcion || null,
              order_number: proceso.order || nuevoOrder,
              status_key: proceso.status_key
            });
            console.log(`🔧 [Backend] Proceso nuevo sin ID marcado para crear`);
          }
        }
        
        // Identificar procesos a eliminar (existen en BD pero no en la lista enviada)
        // SOLO eliminar si se envían procesos con IDs específicos
        const idsEnviados = updateData.process_states
          .filter(p => p.id && !isNaN(parseInt(p.id)))
          .map(p => parseInt(p.id));
        
        // Solo eliminar procesos si se enviaron IDs específicos
        // Si solo se envían procesos nuevos (sin ID), NO eliminar nada
        if (idsEnviados.length > 0) {
          procesosParaEliminar.push(...procesosExistentes
            .filter(p => !idsEnviados.includes(p.id_proceso))
            .map(p => p.id_proceso)
          );
          console.log('🔧 [Backend] Se enviaron IDs específicos, se eliminarán procesos no incluidos');
        } else {
          console.log('🔧 [Backend] Solo se enviaron procesos nuevos, NO se eliminarán procesos existentes');
        }
        
        console.log('🔧 [Backend] Operaciones a realizar:');
        console.log('🔧 [Backend] - Procesos para actualizar:', procesosParaActualizar.length);
        console.log('🔧 [Backend] - Procesos para crear:', procesosParaCrear.length);
        console.log('🔧 [Backend] - Procesos para eliminar:', procesosParaEliminar.length);
        
        // Ejecutar actualizaciones
        for (const proceso of procesosParaActualizar) {
          await Proceso.update({
            nombre: proceso.nombre,
            descripcion: proceso.descripcion,
            order_number: proceso.order_number,
            status_key: proceso.status_key
          }, {
            where: { id_proceso: proceso.id_proceso }
          });
          console.log(`✅ [Backend] Proceso ${proceso.id_proceso} actualizado`);
        }
        
        // Ejecutar creaciones
        if (procesosParaCrear.length > 0) {
          console.log('🔧 [Backend] Creando nuevos procesos:', JSON.stringify(procesosParaCrear, null, 2));
          await Proceso.bulkCreate(procesosParaCrear);
          console.log(`✅ [Backend] ${procesosParaCrear.length} procesos creados`);
        }
        
        // Ejecutar eliminaciones
        if (procesosParaEliminar.length > 0) {
          console.log('🔧 [Backend] Eliminando procesos:', procesosParaEliminar);
          await Proceso.destroy({
            where: { id_proceso: procesosParaEliminar }
          });
          console.log(`✅ [Backend] ${procesosParaEliminar.length} procesos eliminados`);
        }
        
        console.log('✅ [Backend] Process states procesados exitosamente');
        
      } catch (error) {
        console.error('❌ [Backend] Error al procesar process_states:', error);
        console.error('❌ [Backend] Stack trace:', error.stack);
        // No fallar la actualización completa por error en process_states
        console.log('⚠️ [Backend] Continuando con la actualización del servicio...');
      }
    }
    
    // Obtener el servicio actualizado con sus procesos para la respuesta
    const Proceso = (await import('../models/Proceso.js')).default;
    const servicioCompleto = await Servicio.findByPk(id, {
      include: [{
        model: Proceso,
        as: 'process_states',
        order: [['order_number', 'ASC']]
      }]
    });
    
    // Transformar a formato frontend
    const servicioFormateado = {
      id: servicioCompleto.id_servicio.toString(),
      nombre: servicioCompleto.nombre,
      descripcion_corta: servicioCompleto.descripcion_corta,
      visible_en_landing: servicioCompleto.visible_en_landing,
      landing_data: servicioCompleto.landing_data || {},
      info_page_data: servicioCompleto.info_page_data || {},
      route_path: servicioCompleto.route_path,
      process_states: servicioCompleto.process_states?.map(proceso => ({
        id: proceso.id_proceso.toString(),
        name: proceso.nombre,
        order: proceso.order_number,
        status_key: proceso.status_key
      })) || []
    };
    
    console.log('✅ [Backend] Respuesta formateada:', JSON.stringify(servicioFormateado, null, 2));
    
    res.status(200).json({
      success: true,
      message: "Servicio actualizado exitosamente",
      data: servicioFormateado
    });
    
  } catch (error) {
    console.error('❌ [Backend] ===== ERROR EN ACTUALIZACIÓN =====');
    console.error('❌ [Backend] Error específico:', error.message);
    console.error('❌ [Backend] Stack trace completo:', error.stack);
    console.error('❌ [Backend] Nombre del error:', error.name);
    console.error('❌ [Backend] Código del error:', error.code);
    console.error('❌ [Backend] Error original:', error.original);
    
    // Determinar el tipo de error
    if (error.name === 'SequelizeValidationError') {
      console.log('❌ [Backend] Error de validación de Sequelize');
      return res.status(400).json({ 
        success: false,
        error: { 
          message: 'Error de validación: ' + error.message,
          details: error.errors
        }
      });
    }
    
    if (error.name === 'SequelizeDatabaseError') {
      console.log('❌ [Backend] Error de base de datos');
      return res.status(500).json({ 
        success: false,
        error: { 
          message: 'Error de base de datos: ' + error.message,
          code: error.original?.code,
          details: error.original
        }
      });
    }
    
    if (error.name === 'SequelizeConnectionError') {
      console.log('❌ [Backend] Error de conexión a la base de datos');
      return res.status(500).json({ 
        success: false,
        error: { 
          message: 'Error de conexión a la base de datos: ' + error.message
        }
      });
    }
    
    // Error genérico
    res.status(500).json({ 
      success: false,
      error: {
        message: 'Error interno del servidor al actualizar servicio',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Obtener procesos de un servicio
 */
export const obtenerProcesos = async (req, res) => {
  try {
    const { idServicio } = req.params;

    if (!idServicio || isNaN(Number(idServicio))) {
      return res.status(400).json({
        success: false,
        error: {
          message: "ID de servicio inválido",
          code: "INVALID_ID",
          details: { field: "idServicio", value: idServicio },
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = await servicioService.obtenerProcesos(idServicio);
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener procesos:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === "development" ? error.message : "Error al obtener procesos",
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Actualizar procesos de un servicio
 */
export const actualizarProcesos = async (req, res) => {
  try {
    const { idServicio } = req.params;
    const { procesos } = req.body;

    if (!idServicio || isNaN(Number(idServicio))) {
      return res.status(400).json({
        success: false,
        error: {
          message: "ID de servicio inválido",
          code: "INVALID_ID",
          details: { field: "idServicio", value: idServicio },
          timestamp: new Date().toISOString()
        }
      });
    }
    if (!Array.isArray(procesos) || procesos.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Debe proporcionar una lista de procesos válida",
          code: "INVALID_DATA",
          details: { field: "procesos", value: procesos },
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = await servicioService.actualizarProcesos(
      idServicio,
      procesos
    );
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al actualizar procesos:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Error interno del servidor",
        code: "INTERNAL_ERROR",
        details: process.env.NODE_ENV === "development" ? error.message : "Error al actualizar procesos",
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Ocultar servicio
 */
export const ocultarServicio = async (req, res) => {
  try {
    const { idServicio } = req.params;

    if (!idServicio || isNaN(Number(idServicio))) {
      return fail(res, "El ID proporcionado no es válido", 400);
    }

    const result = await servicioService.ocultarServicio(idServicio);
    return ok(res, result);
  } catch (error) {
    console.error("Error al ocultar servicio:", error);
    if (error.name === "NotFoundError") {
      return fail(res, error.message, 404);
    }
    return fail(res, "Error interno del servidor");
  }
};

/**
 * Publicar servicio
 */
export const publicarServicio = async (req, res) => {
  try {
    const { idServicio } = req.params;

    if (!idServicio || isNaN(Number(idServicio))) {
      return fail(res, "El ID proporcionado no es válido", 400);
    }

    const result = await servicioService.publicarServicio(idServicio);
    return ok(res, result);
  } catch (error) {
    console.error("Error al publicar servicio:", error);
    if (error.name === "NotFoundError") {
      return fail(res, error.message, 404);
    }
    return fail(res, "Error interno del servidor");
  }
};

/**
 * Obtener todos los servicios (incluyendo ocultos) - para admin
 */
export const getAllServiciosAdmin = async (req, res) => {
  try {
    const result = await servicioService.getAllServiciosAdmin();
    return ok(res, result);
  } catch (error) {
    console.error("Error al obtener servicios admin:", error);
    return fail(res, "Error interno del servidor");
  }
};
