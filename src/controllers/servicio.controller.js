import servicioService from "../services/servicio.service.js";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_MESSAGES,
  ERROR_CODES 
} from "../constants/messages.js";

/**
 * ✅ VALIDACIÓN DE PRECIO: Validar rangos y precisión decimal
 * @param {number|string} precio - Precio a validar
 * @returns {object} { esValido: boolean, precio: number, error?: string }
 */
const validarPrecio = (precio) => {
  // Validar que el precio sea un número válido
  const precioNum = parseFloat(precio);
  
  if (isNaN(precioNum)) {
    return {
      esValido: false,
      precio: null,
      error: 'El precio debe ser un número válido'
    };
  }
  
  // Validar que sea positivo
  if (precioNum <= 0) {
    return {
      esValido: false,
      precio: precioNum,
      error: 'El precio debe ser un número positivo mayor a 0'
    };
  }
  
  // Validar límite máximo (1 billón)
  if (precioNum > 1000000000) {
    return {
      esValido: false,
      precio: precioNum,
      error: `El precio excede el límite permitido de $1,000,000,000 (1 billón). Precio recibido: $${precioNum.toLocaleString()}`
    };
  }
  
  // Validar precisión decimal (máximo 2 decimales)
  const precioStr = precioNum.toString();
  const partes = precioStr.split('.');
  
  if (partes.length > 1 && partes[1].length > 2) {
    return {
      esValido: false,
      precio: precioNum,
      error: 'El precio debe tener máximo 2 decimales. Ejemplo válido: 50000.00 o 50000'
    };
  }
  
  return {
    esValido: true,
    precio: precioNum
  };
};

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

    // ✅ Validación de ID ya manejada por validateId middleware
    // Esta validación adicional es redundante pero se mantiene por compatibilidad
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

    // ✅ Validación de ID ya manejada por validateId middleware (si se aplica)
    // Esta validación adicional es redundante pero se mantiene por compatibilidad
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
    
    // ✅ VALIDACIÓN DE PRECIO: Normalizar y validar precio_base o precio
    // Aceptar tanto 'precio' como 'precio_base' y normalizar a 'precio_base'
    if (updateData.precio !== undefined || updateData.precio_base !== undefined) {
      const precioValue = updateData.precio !== undefined ? updateData.precio : updateData.precio_base;
      const campoOriginal = updateData.precio !== undefined ? 'precio' : 'precio_base';
      
      console.log(`🔍 [Backend] Validando ${campoOriginal}:`, precioValue);
      
      const validacionPrecio = validarPrecio(precioValue);
      
      if (!validacionPrecio.esValido) {
        console.log('❌ [Backend] Precio inválido:', validacionPrecio.error);
        return res.status(400).json({
          success: false,
          error: {
            message: validacionPrecio.error,
            code: 'VALIDATION_ERROR',
            details: {
              field: campoOriginal,
              expectedField: 'precio_base',
              value: precioValue,
              receivedValue: validacionPrecio.precio
            },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      // Normalizar: siempre usar precio_base (remover 'precio' si existe)
      if (updateData.precio !== undefined) {
        delete updateData.precio;
      }
      updateData.precio_base = validacionPrecio.precio;
      console.log('✅ [Backend] Precio validado y normalizado a precio_base:', validacionPrecio.precio);
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
      } else if (key === 'process_states') {
        // Para process_states, necesitamos obtener los procesos existentes
      const procesosExistentes = await Proceso.findAll({
        where: { servicio_id: id },
        order: [['order_number', 'ASC']]
      });
      
      const procesosExistentesFormateados = procesosExistentes.map(p => ({
        id: p.id_proceso.toString(),
        name: p.nombre,
        order: p.order_number,
        status_key: p.status_key
      }));
      
        const actualJson = JSON.stringify(procesosExistentesFormateados);
        const nuevoJson = JSON.stringify(valorNuevo || []);
        esDiferente = actualJson !== nuevoJson;
        console.log(`  - Process states diferente: ${esDiferente}`);
        console.log(`  - Procesos actuales: ${actualJson}`);
        console.log(`  - Procesos nuevos: ${nuevoJson}`);
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
    
    // Preparar datos para actualización (excluyendo process_states)
    const datosParaActualizar = { ...updateData };
    delete datosParaActualizar.process_states;
    
    // Actualizar servicio
    await servicioActual.update(datosParaActualizar);
    
    console.log('✅ [Backend] Servicio actualizado en base de datos');
    
    // Manejar process_states si están presentes
    if (updateData.process_states && Array.isArray(updateData.process_states)) {
      console.log('🔧 [Backend] Procesando process_states:', updateData.process_states.length, 'estados');
      
      // Eliminar procesos existentes
      await Proceso.destroy({
        where: { servicio_id: id }
      });
      console.log('🗑️ [Backend] Procesos existentes eliminados');
      
      // Crear nuevos procesos
      for (let i = 0; i < updateData.process_states.length; i++) {
        const proceso = updateData.process_states[i];
        await Proceso.create({
          servicio_id: id,
          nombre: proceso.name || proceso.nombre,
          order_number: proceso.order || i + 1,
          status_key: proceso.status_key || `estado_${i + 1}`
        });
        console.log(`➕ [Backend] Proceso ${i + 1} creado:`, proceso.name || proceso.nombre);
      }
      
      console.log('✅ [Backend] Process_states procesados exitosamente');
    }
    
    // Obtener servicio actualizado con sus procesos
    const servicioActualizado = await Servicio.findByPk(id, {
      include: [
        {
        model: Proceso,
        as: 'process_states',
        order: [['order_number', 'ASC']]
        }
      ]
    });
    
    console.log('✅ [Backend] Servicio actualizado obtenido:', {
      id: servicioActualizado.id_servicio,
      visible_en_landing: servicioActualizado.visible_en_landing,
      process_states_count: servicioActualizado.process_states ? servicioActualizado.process_states.length : 0
    });
    
    // Formatear respuesta
    const respuesta = {
      success: true,
      message: "Servicio actualizado exitosamente",
      data: {
        id: servicioActualizado.id_servicio.toString(),
        nombre: servicioActualizado.nombre,
        descripcion_corta: servicioActualizado.descripcion_corta,
        precio_base: servicioActualizado.precio_base,
        visible_en_landing: servicioActualizado.visible_en_landing,
        landing_data: servicioActualizado.landing_data || {},
        info_page_data: servicioActualizado.info_page_data || {},
        route_path: servicioActualizado.route_path || `/pages/${servicioActualizado.nombre.toLowerCase().replace(/\s+/g, '-')}`,
        process_states: servicioActualizado.process_states ? servicioActualizado.process_states.map(proceso => ({
        id: proceso.id_proceso.toString(),
        name: proceso.nombre,
        order: proceso.order_number,
        status_key: proceso.status_key
        })) : []
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

    // ✅ Validación de ID ya manejada por validateId middleware (si se aplica)
    // Esta validación adicional es redundante pero se mantiene por compatibilidad
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

    // ✅ Validación de ID ya manejada por validateId middleware
    // Esta validación adicional es redundante pero se mantiene por compatibilidad
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
    const { id } = req.params;

    // ✅ Validación de ID ya manejada por validateId middleware
    // Esta validación adicional es redundante pero se mantiene por compatibilidad
    if (!id || isNaN(Number(id))) {
      return fail(res, "El ID proporcionado no es válido", 400);
    }

    const result = await servicioService.ocultarServicio(id);
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
    const { id } = req.params;

    // ✅ Validación de ID ya manejada por validateId middleware
    // Esta validación adicional es redundante pero se mantiene por compatibilidad
    if (!id || isNaN(Number(id))) {
      return fail(res, "El ID proporcionado no es válido", 400);
    }

    const result = await servicioService.publicarServicio(id);
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
