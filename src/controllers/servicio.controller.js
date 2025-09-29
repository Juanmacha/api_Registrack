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
 * Actualizar servicio (datos de landing page) - VERSIÓN CORREGIDA CON BUG FIX
 */
export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('🔧 [ServicioController] Actualizando servicio:', id);
    console.log('🔍 [ServicioController] Datos recibidos:', JSON.stringify(updateData, null, 2));
    
    // Obtener servicio actual
    const Servicio = (await import('../models/Servicio.js')).default;
    const Proceso = (await import('../models/Proceso.js')).default;
    
    const servicioActual = await Servicio.findByPk(id, {
      include: [
        {
          model: Proceso,
          as: 'procesos',
          order: [['order_number', 'ASC']]
        }
      ]
    });
    
    if (!servicioActual) {
      return res.status(404).json({
        success: false,
        error: { message: "Servicio no encontrado" }
      });
    }
    
    console.log('🔍 [ServicioController] Servicio actual:', {
      id: servicioActual.id_servicio,
      visible_en_landing: servicioActual.visible_en_landing,
      landing_data: servicioActual.landing_data,
      info_page_data: servicioActual.info_page_data,
      process_states_count: servicioActual.procesos ? servicioActual.procesos.length : 0
    });
    
    // ✅ LÓGICA DE DETECCIÓN DE CAMBIOS CORREGIDA
    let hasChanges = false;
    const changesDetected = [];
    
    for (const key of Object.keys(updateData)) {
      const currentValue = servicioActual[key];
      const newValue = updateData[key];
      
      console.log(`🔍 [ServicioController] Comparando campo ${key}:`);
      console.log('  - Valor actual:', currentValue);
      console.log('  - Valor nuevo:', newValue);
      
      let isDifferent = false;
      
      // Manejo especial para campos boolean
      if (key === 'visible_en_landing') {
        const currentBool = Boolean(currentValue);
        const newBool = Boolean(newValue);
        isDifferent = currentBool !== newBool;
        console.log(`  - Boolean diferente: ${isDifferent} (${currentBool} vs ${newBool})`);
      }
      
      // Manejo especial para campos JSON
      else if (key === 'info_page_data' || key === 'landing_data') {
        const currentJson = JSON.stringify(currentValue || {});
        const newJson = JSON.stringify(newValue || {});
        isDifferent = currentJson !== newJson;
        console.log(`  - JSON diferente: ${isDifferent}`);
        console.log(`  - JSON actual: ${currentJson}`);
        console.log(`  - JSON nuevo: ${newJson}`);
      }
      
      // Manejo especial para process_states
      else if (key === 'process_states') {
        const currentProcesses = JSON.stringify(servicioActual.procesos || []);
        const newProcesses = JSON.stringify(newValue || []);
        isDifferent = currentProcesses !== newProcesses;
        console.log(`  - Process states diferente: ${isDifferent}`);
        console.log(`  - Procesos actuales: ${currentProcesses}`);
        console.log(`  - Procesos nuevos: ${newProcesses}`);
      }
      
      // Comparación normal para campos simples
      else {
        isDifferent = currentValue !== newValue;
        console.log(`  - Campo simple diferente: ${isDifferent}`);
      }
      
      if (isDifferent) {
        hasChanges = true;
        changesDetected.push(key);
      }
    }
    
    console.log('🔍 [ServicioController] ¿Hay cambios?', hasChanges);
    console.log('🔍 [ServicioController] Campos con cambios:', changesDetected);
    
    if (!hasChanges) {
      console.log('⚠️ [ServicioController] No se detectaron cambios');
      return res.status(400).json({
        success: false,
        error: { message: "No hay datos para actualizar" }
      });
    }
    
    console.log('✅ [ServicioController] Cambios detectados, procediendo con actualización');
    
    // Preparar datos para actualización
    const datosParaActualizar = {};
    
    // Manejar campos simples con conversión de tipos
    if (updateData.visible_en_landing !== undefined) {
      datosParaActualizar.visible_en_landing = Boolean(updateData.visible_en_landing);
      console.log('🔧 [ServicioController] Actualizando visible_en_landing:', datosParaActualizar.visible_en_landing);
    }
    
    if (updateData.landing_data) {
      datosParaActualizar.landing_data = updateData.landing_data;
      console.log('🔧 [ServicioController] Actualizando landing_data:', JSON.stringify(updateData.landing_data, null, 2));
    }
    
    if (updateData.info_page_data) {
      datosParaActualizar.info_page_data = updateData.info_page_data;
      console.log('🔧 [ServicioController] Actualizando info_page_data:', JSON.stringify(updateData.info_page_data, null, 2));
    }
    
    console.log('🔍 [ServicioController] Datos para actualizar:', JSON.stringify(datosParaActualizar, null, 2));
    
    // Actualizar servicio
    await servicioActual.update(datosParaActualizar);
    console.log('✅ [ServicioController] Servicio actualizado en base de datos');
    
    // Manejar process_states si está presente
    if (updateData.process_states) {
      console.log('🔧 [ServicioController] Actualizando process_states');
      
      // Eliminar procesos existentes
      await Proceso.destroy({
        where: { servicio_id: id }
      });
      console.log('🗑️ [ServicioController] Procesos existentes eliminados');
      
      // Crear nuevos procesos
      for (let i = 0; i < updateData.process_states.length; i++) {
        const proceso = updateData.process_states[i];
        await Proceso.create({
          servicio_id: id,
          nombre: proceso.name || proceso.nombre,
          order_number: proceso.order || i + 1,
          status_key: proceso.status_key || `estado_${i + 1}`
        });
        console.log(`➕ [ServicioController] Proceso ${i + 1} creado:`, proceso.name || proceso.nombre);
      }
    }
    
    // Obtener servicio actualizado
    const servicioActualizado = await Servicio.findByPk(id, {
      include: [
        {
          model: Proceso,
          as: 'procesos',
          order: [['order_number', 'ASC']]
        }
      ]
    });
    
    // Transformar a formato frontend
    const servicioFormateado = {
      id: servicioActualizado.id_servicio.toString(),
      nombre: servicioActualizado.nombre,
      descripcion_corta: servicioActualizado.descripcion_corta,
      visible_en_landing: servicioActualizado.visible_en_landing,
      landing_data: servicioActualizado.landing_data || {},
      info_page_data: servicioActualizado.info_page_data || {},
      route_path: servicioActualizado.route_path || `/pages/${servicioActualizado.nombre.toLowerCase().replace(/\s+/g, '-')}`,
      process_states: servicioActualizado.procesos.map(proceso => ({
        id: proceso.id_proceso.toString(),
        name: proceso.nombre,
        order: proceso.order_number,
        status_key: proceso.status_key
      }))
    };
    
    console.log('✅ [ServicioController] Servicio actualizado exitosamente');
    console.log('📤 [ServicioController] Enviando respuesta:', JSON.stringify(servicioFormateado, null, 2));
    
    res.json({
      success: true,
      message: "Servicio actualizado exitosamente",
      data: servicioFormateado
    });
    
  } catch (error) {
    console.error('❌ [ServicioController] Error actualizando servicio:', error);
    res.status(500).json({
      success: false,
      error: { message: "Error interno del servidor" }
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
