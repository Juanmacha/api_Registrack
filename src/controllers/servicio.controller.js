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
