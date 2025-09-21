import { Op } from "sequelize";
import Seguimiento from "../models/Seguimiento.js";
import OrdenServicio from "../models/OrdenServicio.js";
import User from "../models/user.js";

export class SeguimientoRepository {
  // Obtener todos los seguimientos de una orden de servicio
  async findByOrdenServicio(idOrdenServicio) {
    return await Seguimiento.findAll({
      where: {
        id_orden_servicio: idOrdenServicio,
      },
      include: [
        {
          model: User,
          as: "usuario_registro",
          attributes: ["nombre", "apellido", "email"],
        },
      ],
      order: [["fecha_registro", "DESC"]],
    });
  }

  // Crear nuevo seguimiento
  async create(seguimientoData) {
    return await Seguimiento.create(seguimientoData);
  }

  // Obtener seguimiento por ID
  async findById(id) {
    return await Seguimiento.findByPk(id, {
      include: [
        {
          model: User,
          as: "usuario_registro",
          attributes: ["nombre", "apellido", "email"],
        },
        {
          model: OrdenServicio,
          as: "orden_servicio",
          attributes: ["numero_expediente", "estado"],
        },
      ],
    });
  }

  // Actualizar seguimiento
  async update(id, datosActualizados) {
    const seguimiento = await Seguimiento.findByPk(id);
    if (seguimiento) {
      await seguimiento.update(datosActualizados);
      return seguimiento;
    }
    return null;
  }

  // Eliminar seguimiento
  async delete(id) {
    const seguimiento = await Seguimiento.findByPk(id);
    if (seguimiento) {
      await seguimiento.destroy();
      return true;
    }
    return false;
  }

  // Buscar seguimientos por título
  async findByTitulo(idOrdenServicio, titulo) {
    return await Seguimiento.findAll({
      where: {
        id_orden_servicio: idOrdenServicio,
        titulo: {
          [Op.like]: `%${titulo}%`,
        },
      },
      include: [
        {
          model: User,
          as: "usuario_registro",
          attributes: ["nombre", "apellido", "email"],
        },
      ],
      order: [["fecha_registro", "DESC"]],
    });
  }
}
