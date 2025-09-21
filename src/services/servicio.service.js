import servicioRepository from "../repositories/servicio.repository.js";

const servicioService = {
  // Obtener todos los servicios
  getAllServicios: async () => {
    try {
      const servicios = await servicioRepository.getAllServicios();
      return {
        success: true,
        data: servicios,
        message: "Servicios obtenidos exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Obtener servicio por ID
  getServicioById: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error("ID de servicio inválido");
      }

      const servicio = await servicioRepository.getServicioById(id);
      return {
        success: true,
        data: servicio,
        message: "Servicio obtenido exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Obtener detalle completo de servicio
  getDetalleServicio: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error("ID de servicio inválido");
      }

      const detalleServicio = await servicioRepository.getDetalleServicio(id);
      return {
        success: true,
        data: detalleServicio,
        message: "Detalle de servicio obtenido exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Buscar servicios por nombre
  buscarPorNombre: async (nombre) => {
    try {
      if (!nombre || nombre.trim().length === 0) {
        throw new Error("El nombre de búsqueda es requerido");
      }

      const servicios = await servicioRepository.buscarPorNombre(nombre.trim());
      return {
        success: true,
        data: servicios,
        message:
          servicios.length > 0
            ? `${servicios.length} servicio(s) encontrado(s)`
            : "No se encontraron servicios con ese nombre",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Actualizar servicio (datos de landing page)
  actualizarServicio: async (id, datosActualizados) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error("ID de servicio inválido");
      }

      // Validar campos requeridos
      if (
        datosActualizados.nombre &&
        datosActualizados.nombre.trim().length === 0
      ) {
        throw new Error("El nombre del servicio no puede estar vacío");
      }

      if (datosActualizados.precio_base && datosActualizados.precio_base <= 0) {
        throw new Error("El precio base debe ser mayor a 0");
      }

      const servicioActualizado = await servicioRepository.actualizarServicio(
        id,
        datosActualizados
      );
      return {
        success: true,
        data: servicioActualizado,
        message: "Servicio actualizado exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Obtener procesos de un servicio
  obtenerProcesos: async (idServicio) => {
    try {
      if (!idServicio || isNaN(parseInt(idServicio))) {
        throw new Error("ID de servicio inválido");
      }

      const procesos = await servicioRepository.obtenerProcesos(idServicio);
      return {
        success: true,
        data: procesos,
        message: "Procesos obtenidos exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Actualizar procesos de un servicio
  actualizarProcesos: async (idServicio, procesos) => {
    try {
      if (!idServicio || isNaN(parseInt(idServicio))) {
        throw new Error("ID de servicio inválido");
      }

      if (!Array.isArray(procesos)) {
        throw new Error("Los procesos deben ser un array");
      }

      // Validar que cada proceso tenga los campos requeridos
      for (let i = 0; i < procesos.length; i++) {
        const proceso = procesos[i];
        if (!proceso.nombre || proceso.nombre.trim().length === 0) {
          throw new Error(`El proceso ${i + 1} debe tener un nombre`);
        }
        if (proceso.orden === undefined || proceso.orden === null) {
          throw new Error(`El proceso ${i + 1} debe tener un orden`);
        }
      }

      const procesosActualizados = await servicioRepository.actualizarProcesos(
        idServicio,
        procesos
      );
      return {
        success: true,
        data: procesosActualizados,
        message: "Procesos actualizados exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Ocultar servicio
  ocultarServicio: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error("ID de servicio inválido");
      }

      const servicioOculto = await servicioRepository.ocultarServicio(id);
      return {
        success: true,
        data: servicioOculto,
        message: "Servicio ocultado exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Publicar servicio
  publicarServicio: async (id) => {
    try {
      if (!id || isNaN(parseInt(id))) {
        throw new Error("ID de servicio inválido");
      }

      const servicioPublicado = await servicioRepository.publicarServicio(id);
      return {
        success: true,
        data: servicioPublicado,
        message: "Servicio publicado exitosamente",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },

  // Obtener todos los servicios (incluyendo ocultos) - para admin
  getAllServiciosAdmin: async () => {
    try {
      const servicios = await servicioRepository.getAllServiciosAdmin();
      return {
        success: true,
        data: servicios,
        message: "Servicios obtenidos exitosamente (incluyendo ocultos)",
      };
    } catch (error) {
      throw new Error(`Error en servicio: ${error.message}`);
    }
  },
};

export default servicioService;
