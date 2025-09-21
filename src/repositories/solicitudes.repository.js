import { Op } from "sequelize";
import OrdenServicio from "../models/OrdenServicio.js";
import Servicio from "../models/Servicio.js";

export class SolicitudesRepository {
  async findAll() {
    return await OrdenServicio.findAll({
      attributes: [
        "numero_expediente",
        "fecha_creacion",
        "estado",
      ],
      include: [
        {
          model: Servicio,
          as: "servicio",
          attributes: ["nombre", "descripcion", "precio_base"],
        },
      ],
    });
  }

  // Buscar solicitudes por criterios
  async findBySearch(search) {
    return await OrdenServicio.findAll({
      attributes: [
        "numero_expediente",
        "fecha_creacion",
        "estado",
      ],
      include: [
        {
          model: Servicio,
          as: "servicio",
          attributes: ["nombre", "descripcion", "precio_base"],
        },
      ],
      where: {
        [Op.or]: [
          { numero_expediente: { [Op.like]: `%${search}%` } },
          { estado: { [Op.like]: `%${search}%` } },
          { "$servicio.nombre$": { [Op.like]: `%${search}%` } },
        ],
      },
    });
  }

  // Obtener solicitud por ID con detalles
  async findById(id) {
    return await OrdenServicio.findByPk(id, {
      attributes: [
        "id_orden_servicio",
        "numero_expediente",
        "fecha_creacion",
        "estado",
        "pais",
        "ciudad",
        "total_estimado",
        "codigo_postal",
        // Campos editables
        "tipodepersona",
        "tipodedocumento",
        "numerodedocumento",
        "nombrecompleto",
        "correoelectronico",
        "telefono",
        "direccion",
        "tipodeentidadrazonsocial",
        "nombredelaempresa",
        "nit",
        "poderdelrepresentanteautorizado",
        "poderparaelregistrodelamarca",
      ],
      include: [
        {
          model: Servicio,
          as: "servicio",
          attributes: [
            "nombre",
            "descripcion",
            "precio_base",
          ],
        },
      ],
    });
  }

  // Verificar si existe una solicitud duplicada
  async findDuplicate(idCliente, idServicio) {
    return await OrdenServicio.findOne({
      where: {
        id_cliente: idCliente,
        id_servicio: idServicio,
      },
    });
  }

  // Crear nueva solicitud
  async create(solicitudData) {
    return await OrdenServicio.create(solicitudData);
  }

  // Actualizar estado de solicitud
  async updateEstado(id, nuevoEstado) {
    const solicitud = await OrdenServicio.findByPk(id);
    if (solicitud) {
      solicitud.estado = nuevoEstado;
      await solicitud.save();
      return solicitud;
    }
    return null;
  }

  // Editar solicitud de servicio
  async editarSolicitud(id, datosActualizados) {
    try {
      const solicitud = await OrdenServicio.findByPk(id);

      if (!solicitud) {
        return null;
      }

      // Actualizar solo los campos permitidos para edición
      const camposEditables = [
        "pais",
        "ciudad",
        "codigo_postal",
        "total_estimado",
        // Campos editables para "¿Quién solicita el servicio?"
        "tipodepersona",
        "tipodedocumento",
        "numerodedocumento",
        "nombrecompleto",
        "correoelectronico",
        "telefono",
        "direccion",
        // Campos editables para información de la empresa
        "tipodeentidadrazonsocial",
        "nombredelaempresa",
        "nit",
        // Campos editables para documentos de poder
        "poderdelrepresentanteautorizado",
        "poderparaelregistrodelamarca",
      ];

      // Solo actualizar campos que estén en datosActualizados
      for (const campo of camposEditables) {
        if (datosActualizados[campo] !== undefined) {
          solicitud[campo] = datosActualizados[campo];
        }
      }

      await solicitud.save();
      return solicitud;
    } catch (error) {
      throw new Error(`Error al editar la solicitud: ${error.message}`);
    }
  }
}
