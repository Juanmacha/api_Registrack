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
    
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.SERVICES_FOUND,
      data: {
        servicios: result,
        total: Array.isArray(result) ? result.length : 0
      },
      meta: {
        timestamp: new Date().toISOString(),
        filters: {
          available: "Use query parameters para filtrar por nombre, precio, estado, etc."
        }
      }
    });
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
    const { idServicio } = req.params;

    if (!idServicio || isNaN(Number(idServicio))) {
      return res.status(400).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.SERVICE.INVALID_SERVICE_ID,
          code: ERROR_CODES.INVALID_ID,
          details: { field: "idServicio", value: idServicio },
          timestamp: new Date().toISOString()
        }
      });
    }

    const result = await servicioService.getServicioById(idServicio);
    
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.SERVICE_FOUND,
      data: {
        servicio: result
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    if (error.name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.SERVICE.SERVICE_NOT_FOUND,
          code: ERROR_CODES.SERVICE_NOT_FOUND,
          details: { id: idServicio },
          timestamp: new Date().toISOString()
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
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
    const { idServicio } = req.params;

    if (!idServicio || isNaN(Number(idServicio))) {
      return fail(res, "El ID proporcionado no es válido", 400);
    }

    const result = await servicioService.getDetalleServicio(idServicio);
    return ok(res, result);
  } catch (error) {
    console.error("Error al obtener detalle de servicio:", error);
    if (error.name === "NotFoundError") {
      return fail(res, error.message, 404);
    }
    return fail(res, "Error interno del servidor");
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
 * Actualizar servicio (datos de landing page)
 */
export const actualizarServicio = async (req, res) => {
  try {
    const { idServicio } = req.params;
    const datosActualizados = req.body;

    if (!idServicio || isNaN(Number(idServicio))) {
      return fail(res, "El ID proporcionado no es válido", 400);
    }

    const result = await servicioService.actualizarServicio(
      idServicio,
      datosActualizados
    );
    return ok(res, result);
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    if (error.name === "NotFoundError") {
      return fail(res, error.message, 404);
    }
    return fail(res, "Error interno del servidor");
  }
};

/**
 * Obtener procesos de un servicio
 */
export const obtenerProcesos = async (req, res) => {
  try {
    const { idServicio } = req.params;

    if (!idServicio || isNaN(Number(idServicio))) {
      return fail(res, "El ID proporcionado no es válido", 400);
    }

    const result = await servicioService.obtenerProcesos(idServicio);
    return ok(res, result);
  } catch (error) {
    console.error("Error al obtener procesos:", error);
    if (error.name === "NotFoundError") {
      return fail(res, error.message, 404);
    }
    return fail(res, "Error interno del servidor");
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
      return fail(res, "El ID proporcionado no es válido", 400);
    }
    if (!Array.isArray(procesos) || procesos.length === 0) {
      return fail(res, "Debe proporcionar una lista de procesos válida", 400);
    }

    const result = await servicioService.actualizarProcesos(
      idServicio,
      procesos
    );
    return ok(res, result);
  } catch (error) {
    console.error("Error al actualizar procesos:", error);
    if (error.name === "NotFoundError") {
      return fail(res, error.message, 404);
    }
    return fail(res, "Error interno del servidor");
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
