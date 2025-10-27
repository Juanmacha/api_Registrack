import { OrdenServicio, Servicio, Cliente } from "../models/associations.js";
import User from "../models/user.js";
import { Op } from "sequelize";
import { SolicitudesRepository } from "../repositories/solicitudes.repository.js";

export class SolicitudesService {
  constructor() {
    this.repository = new SolicitudesRepository();
  }

  // Listar solicitudes con el Servicio asociado
  async listarSolicitudes() {
    try {
      const ordenes = await OrdenServicio.findAll({
        include: [
          { 
            model: Servicio, 
            as: "servicio",
            attributes: ["id_servicio", "nombre", "descripcion"]
          },
          {
            model: Cliente,
            as: "cliente",
            include: [{
              model: User,
              as: "Usuario",
              attributes: ["id_usuario", "nombre", "apellido", "correo"]
            }]
          },
          // {
          //   model: User,
          //   as: "empleado_asignado",
          //   attributes: ["id_usuario", "nombre", "apellido"]
          // }
        ]
      });
      return ordenes;
    } catch (error) {
      throw new Error("Error al listar solicitudes: " + error.message);
    }
  }

  // Listar solicitudes de un usuario específico (para clientes)
  async listarSolicitudesPorUsuario(idUsuario) {
    try {
      const ordenes = await OrdenServicio.findAll({
        where: {
          id_cliente: idUsuario,
        },
        include: [
          {
            model: Servicio,
            as: "servicio",
            attributes: ["id_servicio", "nombre", "descripcion"],
          },
          {
            model: Cliente,
            as: "cliente",
            include: [{
              model: User,
              as: "Usuario",
              attributes: ["id_usuario", "nombre", "apellido", "correo"]
            }]
          },
          // {
          //   model: User,
          //   as: "empleado_asignado",
          //   attributes: ["id_usuario", "nombre", "apellido"]
          // }
        ],
        order: [["fecha_creacion", "DESC"]],
      });
      return ordenes;
    } catch (error) {
      throw new Error(
        "Error al listar solicitudes del usuario: " + error.message
      );
    }
  }

  // Listar solicitudes en proceso de un cliente específico
  async listarSolicitudesEnProcesoPorUsuario(idUsuario) {
    try {
      const ordenes = await OrdenServicio.findAll({
        attributes: [
          "id_orden_servicio",
          "fecha_creacion",
          "estado",
          "pais",
          "ciudad",
        ],
        where: {
          id_cliente: idUsuario,
          estado: {
            [Op.notIn]: ["Anulado", "Rechazado", "Aprobado"],
          },
        },
        include: [
          {
            model: Servicio,
            as: "servicio",
            attributes: ["nombre", "descripcion"],
          },
        ],
        order: [["fecha_creacion", "DESC"]],
      });
      return ordenes;
    } catch (error) {
      throw new Error(
        "Error al listar solicitudes en proceso del usuario: " + error.message
      );
    }
  }

  // Listar solicitudes finalizadas de un cliente específico
  async listarSolicitudesFinalizadasPorUsuario(idUsuario) {
    try {
      const ordenes = await OrdenServicio.findAll({
        attributes: [
          "id_orden_servicio",
          "fecha_creacion",
          "estado",
          "pais",
          "ciudad",
        ],
        where: {
          id_cliente: idUsuario,
          estado: {
            [Op.in]: ["Anulado", "Rechazado", "Aprobado"],
          },
        },
        include: [
          {
            model: Servicio,
            as: "servicio",
            attributes: ["nombre", "descripcion"],
          },
        ],
        order: [["fecha_creacion", "DESC"]],
      });
      return ordenes;
    } catch (error) {
      throw new Error(
        "Error al listar solicitudes finalizadas del usuario: " + error.message
      );
    }
  }

  // Listar solicitudes en proceso (admin/empleado)
  async listarSolicitudesEnProceso() {
    try {
      const ordenes = await OrdenServicio.findAll({
        where: {
          estado: {
            [Op.notIn]: ["Anulado", "Rechazado", "Aprobado"],
          },
        },
        include: [{ model: Servicio, as: "servicio" }],
        order: [["fecha_creacion", "DESC"]],
      });
      return ordenes;
    } catch (error) {
      throw new Error(
        "Error al listar solicitudes en proceso: " + error.message
      );
    }
  }

  // Listar solicitudes finalizadas (admin/empleado)
  async listarSolicitudesFinalizadas() {
    try {
      const ordenes = await OrdenServicio.findAll({
        where: {
          estado: {
            [Op.in]: ["Anulado", "Rechazado", "Aprobado"],
          },
        },
        include: [{ model: Servicio, as: "servicio" }],
        order: [["fecha_creacion", "DESC"]],
      });
      return ordenes;
    } catch (error) {
      throw new Error(
        "Error al listar solicitudes finalizadas: " + error.message
      );
    }
  }

  // Buscar solicitudes
  async buscarSolicitud(search) {
    try {
      if (!search) {
        throw new Error("El parámetro de búsqueda es requerido.");
      }

      const solicitudes = await this.repository.findBySearch(search);

      if (!solicitudes || solicitudes.length === 0) {
        throw new Error("No se encontraron coincidencias.");
      }

      return solicitudes;
    } catch (error) {
      throw new Error("Error al buscar solicitudes: " + error.message);
    }
  }

  // Ver detalle de solicitud
  async verDetalleSolicitud(id) {
    try {
      const solicitud = await this.repository.findById(id);
      if (!solicitud) {
        throw new Error("Solicitud no encontrada.");
      }
      return solicitud;
    } catch (error) {
      throw new Error("Error al ver detalle de solicitud: " + error.message);
    }
  }

  // Anular solicitud con auditoría completa (MEJORADO)
  async anularSolicitud(id, datosAnulacion) {
    try {
      console.log('🚫 Iniciando anulación de solicitud:', { id, usuario: datosAnulacion.usuario_id });
      
      // 1. Validar motivo
      if (!datosAnulacion.motivo || datosAnulacion.motivo.trim() === '') {
        throw new Error('El motivo de anulación es obligatorio');
      }

      if (datosAnulacion.motivo.trim().length < 10) {
        throw new Error('El motivo debe tener al menos 10 caracteres');
      }

      if (datosAnulacion.motivo.trim().length > 500) {
        throw new Error('El motivo no puede exceder 500 caracteres');
      }

      // 2. Anular en repositorio (con transacción)
      const solicitud = await this.repository.anularSolicitud(id, datosAnulacion);

      console.log('✅ Solicitud anulada exitosamente en repositorio');

      // 3. Preparar respuesta
      const resultado = {
        success: true,
        mensaje: `La solicitud ${id} ha sido anulada correctamente.`,
        data: {
          id_orden_servicio: solicitud.id_orden_servicio,
          numero_expediente: solicitud.numero_expediente,
          estado: solicitud.estado,
          fecha_anulacion: solicitud.fecha_anulacion,
          motivo: solicitud.motivo_anulacion,
          anulado_por: solicitud.anulado_por
        }
      };

      // 4. Enviar notificación al cliente (sin bloquear el flujo)
      if (solicitud.cliente && solicitud.cliente.Usuario && solicitud.cliente.Usuario.correo) {
        try {
          const { sendAnulacionSolicitudCliente } = await import('./email.service.js');
          await sendAnulacionSolicitudCliente(
            solicitud.cliente.Usuario.correo,
            `${solicitud.cliente.Usuario.nombre} ${solicitud.cliente.Usuario.apellido}`,
            {
              orden_id: solicitud.id_orden_servicio,
              numero_expediente: solicitud.numero_expediente,
              servicio_nombre: solicitud.servicio.nombre,
              motivo_anulacion: datosAnulacion.motivo,
              fecha_anulacion: solicitud.fecha_anulacion
            }
          );
          console.log('✅ Email de anulación enviado al cliente');
        } catch (emailError) {
          console.error('❌ Error al enviar email al cliente:', emailError.message);
          // No detener el proceso si falla el email
        }
      }

      // 5. Si tenía empleado asignado, notificarle también
      if (solicitud.empleado_asignado && solicitud.empleado_asignado.correo) {
        try {
          const { sendAnulacionSolicitudEmpleado } = await import('./email.service.js');
          await sendAnulacionSolicitudEmpleado(
            solicitud.empleado_asignado.correo,
            `${solicitud.empleado_asignado.nombre} ${solicitud.empleado_asignado.apellido}`,
            {
              orden_id: solicitud.id_orden_servicio,
              servicio_nombre: solicitud.servicio.nombre,
              motivo_anulacion: datosAnulacion.motivo
            }
          );
          console.log('✅ Email de anulación enviado al empleado');
        } catch (emailError) {
          console.error('❌ Error al enviar email al empleado:', emailError.message);
          // No detener el proceso si falla el email
        }
      }

      return resultado;
      
    } catch (error) {
      console.error('❌ Error en anularSolicitud service:', error.message);
      throw new Error("Error al anular la solicitud: " + error.message);
    }
  }

  // Crear nueva solicitud
  async crearSolicitud(solicitudData) {
    try {
      console.log("Datos recibidos para crear solicitud:", solicitudData);

      // Validar campos requeridos
      const camposRequeridos = [
        "id_cliente",
        "id_servicio",
        "id_empresa",
        "total_estimado",
        "pais",
        "ciudad",
        "codigo_postal",
        "estado",
        "fecha_creacion",
        "numero_expediente"
      ];

      for (const campo of camposRequeridos) {
        if (!solicitudData[campo]) {
          throw new Error(`El campo ${campo} es requerido.`);
        }
      }

      console.log("Todos los campos requeridos están presentes");

      const solicitudExistente = await this.repository.findDuplicate(
        solicitudData.id_cliente,
        solicitudData.id_servicio
      );

      if (solicitudExistente) {
        throw new Error(
          "Ya existe una solicitud para este cliente y servicio. No se permiten duplicados."
        );
      }

      const nuevaSolicitud = await this.repository.create(solicitudData);
      
      console.log("Solicitud creada exitosamente:", nuevaSolicitud);

      return {
        mensaje: "Solicitud de servicio creada exitosamente.",
        solicitud: nuevaSolicitud,
      };
    } catch (error) {
      console.error("Error en crearSolicitud:", error);
      throw new Error("Error al crear la solicitud: " + error.message);
    }
  }

  // Editar solicitud
  async editarSolicitud(id, datosActualizados) {
    try {
      const solicitudExistente = await this.repository.findById(id);
      if (!solicitudExistente) {
        throw new Error("Solicitud no encontrada.");
      }

      const camposEditables = [
        "pais", "ciudad", "codigo_postal", "total_estimado", "estado",
        "tipodepersona", "tipodedocumento", "numerodedocumento",
        "nombrecompleto", "correoelectronico", "telefono", "direccion",
        "tipodeentidadrazonsocial", "nombredelaempresa", "nit",
        "poderdelrepresentanteautorizado", "poderparaelregistrodelamarca"
      ];

      const camposPresentes = camposEditables.filter(
        (campo) =>
          datosActualizados[campo] !== undefined &&
          datosActualizados[campo] !== null
      );

      if (camposPresentes.length === 0) {
        throw new Error("Debe proporcionar al menos un campo para editar.");
      }

      // Actualizar solo los campos permitidos
      for (const campo of camposPresentes) {
        solicitudExistente[campo] = datosActualizados[campo];
      }

      const solicitudEditada = await this.repository.editarSolicitud(id, datosActualizados);

      if (!solicitudEditada) {
        throw new Error("Error al actualizar la solicitud.");
      }

      return {
        mensaje: `La solicitud ${id} ha sido editada exitosamente.`,
        solicitud: solicitudEditada,
      };
    } catch (error) {
      throw new Error("Error al editar la solicitud: " + error.message);
    }
  }
}
