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
 * Actualizar servicio (datos de landing page) - VERSIÓN CON DEBUGGING CRÍTICO
 */
export const actualizarServicio = async (req, res) => {
  try {
    console.log('🔧 [Backend] ===== INICIO UPDATE SERVICIO =====');
    console.log('🔧 [Backend] Request params:', req.params);
    console.log('🔧 [Backend] Request body:', req.body);
    console.log('🔧 [Backend] Request headers:', req.headers);
    
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('🔧 [Backend] ID del servicio:', id);
    console.log('🔧 [Backend] Datos de actualización:', updateData);
    
    // Verificar que el ID sea válido
    if (!id || isNaN(id)) {
      console.log('❌ [Backend] ID inválido:', id);
      return res.status(400).json({
        success: false,
        error: { message: "ID de servicio inválido" }
      });
    }
    
    // Verificar que hay datos para actualizar
    if (!updateData || Object.keys(updateData).length === 0) {
      console.log('❌ [Backend] No hay datos para actualizar');
      return res.status(400).json({
        success: false,
        error: { message: "No hay datos para actualizar" }
      });
    }
    
    console.log('🔧 [Backend] Importando modelos...');
    
    // Importar modelos
    const Servicio = (await import('../models/Servicio.js')).default;
    const Proceso = (await import('../models/Proceso.js')).default;
    
    console.log('✅ [Backend] Modelos importados correctamente');
    console.log('🔧 [Backend] Obteniendo servicio de la base de datos...');
    
    // Obtener servicio actual
    const servicioActual = await Servicio.findByPk(id);
    
    if (!servicioActual) {
      console.log('❌ [Backend] Servicio no encontrado:', id);
      return res.status(404).json({
        success: false,
        error: { message: "Servicio no encontrado" }
      });
    }
    
    console.log('✅ [Backend] Servicio encontrado:', {
      id: servicioActual.id_servicio,
      nombre: servicioActual.nombre,
      visible_en_landing: servicioActual.visible_en_landing
    });
    
    // Verificar cambios
    let hayCambios = false;
    const cambiosDetectados = [];
    
    console.log('🔧 [Backend] Verificando cambios...');
    
    for (const key of Object.keys(updateData)) {
      const valorActual = servicioActual[key];
      const valorNuevo = updateData[key];
      
      console.log(`🔍 [Backend] Campo ${key}:`);
      console.log(`  - Actual:`, valorActual);
      console.log(`  - Nuevo:`, valorNuevo);
      
      let esDiferente = false;
      
      if (key === 'visible_en_landing') {
        esDiferente = Boolean(valorActual) !== Boolean(valorNuevo);
        console.log(`  - Boolean diferente: ${esDiferente} (${Boolean(valorActual)} vs ${Boolean(valorNuevo)})`);
      } else if (key === 'landing_data' || key === 'info_page_data') {
        const actualJson = JSON.stringify(valorActual || {});
        const nuevoJson = JSON.stringify(valorNuevo || {});
        esDiferente = actualJson !== nuevoJson;
        console.log(`  - JSON diferente: ${esDiferente}`);
        console.log(`  - JSON actual: ${actualJson}`);
        console.log(`  - JSON nuevo: ${nuevoJson}`);
      } else {
        esDiferente = valorActual !== valorNuevo;
        console.log(`  - Campo simple diferente: ${esDiferente}`);
      }
      
      if (esDiferente) {
        hayCambios = true;
        cambiosDetectados.push(key);
        console.log(`✅ [Backend] Cambio detectado en ${key}`);
      } else {
        console.log(`ℹ️ [Backend] Sin cambios en ${key}`);
      }
    }
    
    console.log('🔍 [Backend] ¿Hay cambios?', hayCambios);
    console.log('🔍 [Backend] Campos con cambios:', cambiosDetectados);
    
    if (!hayCambios) {
      console.log('⚠️ [Backend] No hay cambios reales');
      return res.status(400).json({
        success: false,
        error: { message: "No hay datos para actualizar" }
      });
    }
    
    console.log('🔧 [Backend] Actualizando servicio en base de datos...');
    
    // Actualizar servicio
    await servicioActual.update(updateData);
    
    console.log('✅ [Backend] Servicio actualizado en base de datos');
    
    // Obtener servicio actualizado
    const servicioActualizado = await Servicio.findByPk(id);
    
    console.log('✅ [Backend] Servicio actualizado obtenido:', {
      id: servicioActualizado.id_servicio,
      visible_en_landing: servicioActualizado.visible_en_landing
    });
    
    // Formatear respuesta
    const respuesta = {
      success: true,
      message: "Servicio actualizado exitosamente",
      data: {
        id: servicioActualizado.id_servicio.toString(),
        nombre: servicioActualizado.nombre,
        descripcion_corta: servicioActualizado.descripcion_corta,
        visible_en_landing: servicioActualizado.visible_en_landing,
        landing_data: servicioActualizado.landing_data || {},
        info_page_data: servicioActualizado.info_page_data || {},
        route_path: servicioActualizado.route_path || `/pages/${servicioActualizado.nombre.toLowerCase().replace(/\s+/g, '-')}`,
        process_states: []
      }
    };
    
    console.log('✅ [Backend] Respuesta preparada:', respuesta);
    console.log('🔧 [Backend] ===== FIN UPDATE SERVICIO =====');
    
    res.json(respuesta);
    
  } catch (error) {
    console.error('❌ [Backend] ERROR CRÍTICO en updateServicio:', error);
    console.error('❌ [Backend] Stack trace:', error.stack);
    console.error('❌ [Backend] Error name:', error.name);
    console.error('❌ [Backend] Error message:', error.message);
    console.error('❌ [Backend] Error code:', error.code);
    
    res.status(500).json({
      success: false,
      error: { 
        message: "Error interno del servidor",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
