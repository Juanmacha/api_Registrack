import { SeguimientoRepository } from "../repositories/seguimiento.repository.js";
import { SolicitudesRepository } from "../repositories/solicitudes.repository.js";

export class SeguimientoService {
  constructor() {
    this.repository = new SeguimientoRepository();
    this.solicitudesRepository = new SolicitudesRepository();
  }

  // Obtener historial de seguimiento de una solicitud
  async obtenerHistorialSeguimiento(idOrdenServicio) {
    try {
      // Verificar que la orden de servicio existe
      const ordenServicio = await this.solicitudesRepository.findById(
        idOrdenServicio
      );
      if (!ordenServicio) {
        throw new Error("Orden de servicio no encontrada.");
      }

      const seguimientos = await this.repository.findByOrdenServicio(
        idOrdenServicio
      );
      return seguimientos;
    } catch (error) {
      throw new Error(
        "Error al obtener historial de seguimiento: " + error.message
      );
    }
  }

  // Crear nuevo registro de seguimiento
  async crearSeguimiento(seguimientoData) {
    try {
      const camposRequeridos = [
        "id_orden_servicio",
        "titulo",
        "descripcion",
        "registrado_por",
      ];

      for (const campo of camposRequeridos) {
        if (!seguimientoData[campo]) {
          throw new Error(`El campo ${campo} es requerido.`);
        }
      }

      // Verificar que la orden de servicio existe
      const ordenServicio = await this.solicitudesRepository.findById(
        seguimientoData.id_orden_servicio
      );
      if (!ordenServicio) {
        throw new Error("Orden de servicio no encontrada.");
      }

      // Validar longitud del título
      if (seguimientoData.titulo.length > 200) {
        throw new Error("El título no puede exceder los 200 caracteres.");
      }

      // Procesar documentos adjuntos si existen
      if (seguimientoData.documentos_adjuntos) {
        if (typeof seguimientoData.documentos_adjuntos === "object") {
          seguimientoData.documentos_adjuntos = JSON.stringify(
            seguimientoData.documentos_adjuntos
          );
        }
      }

      const nuevoSeguimiento = await this.repository.create(seguimientoData);

      return {
        mensaje: "Registro de seguimiento creado exitosamente.",
        seguimiento: nuevoSeguimiento,
      };
    } catch (error) {
      throw new Error("Error al crear seguimiento: " + error.message);
    }
  }

  // Obtener seguimiento por ID
  async obtenerSeguimientoPorId(id) {
    try {
      const seguimiento = await this.repository.findById(id);
      if (!seguimiento) {
        throw new Error("Seguimiento no encontrado.");
      }
      return seguimiento;
    } catch (error) {
      throw new Error("Error al obtener seguimiento: " + error.message);
    }
  }

  // Actualizar seguimiento
  async actualizarSeguimiento(id, datosActualizados) {
    try {
      const seguimientoExistente = await this.repository.findById(id);
      if (!seguimientoExistente) {
        throw new Error("Seguimiento no encontrado.");
      }

      const camposEditables = ["titulo", "descripcion", "documentos_adjuntos"];
      const camposPresentes = camposEditables.filter(
        (campo) =>
          datosActualizados[campo] !== undefined &&
          datosActualizados[campo] !== null
      );

      if (camposPresentes.length === 0) {
        throw new Error("Debe proporcionar al menos un campo para editar.");
      }

      // Procesar documentos adjuntos si se actualizan
      if (
        datosActualizados.documentos_adjuntos &&
        typeof datosActualizados.documentos_adjuntos === "object"
      ) {
        datosActualizados.documentos_adjuntos = JSON.stringify(
          datosActualizados.documentos_adjuntos
        );
      }

      const seguimientoActualizado = await this.repository.update(
        id,
        datosActualizados
      );

      return {
        mensaje: "Seguimiento actualizado exitosamente.",
        seguimiento: seguimientoActualizado,
      };
    } catch (error) {
      throw new Error("Error al actualizar seguimiento: " + error.message);
    }
  }

  // Eliminar seguimiento
  async eliminarSeguimiento(id) {
    try {
      const seguimientoExistente = await this.repository.findById(id);
      if (!seguimientoExistente) {
        throw new Error("Seguimiento no encontrado.");
      }

      const eliminado = await this.repository.delete(id);
      if (!eliminado) {
        throw new Error("Error al eliminar el seguimiento.");
      }

      return {
        mensaje: "Seguimiento eliminado exitosamente.",
      };
    } catch (error) {
      throw new Error("Error al eliminar seguimiento: " + error.message);
    }
  }

  // Buscar seguimientos por título
  async buscarPorTitulo(idOrdenServicio, titulo) {
    try {
      const seguimientos = await this.repository.findByTitulo(
        idOrdenServicio,
        titulo
      );
      return seguimientos;
    } catch (error) {
      throw new Error(
        "Error al buscar seguimientos por título: " + error.message
      );
    }
  }
}
