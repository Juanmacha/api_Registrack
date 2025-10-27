import { Op } from "sequelize";
import sequelize from "../config/db.js";
import OrdenServicio from "../models/OrdenServicio.js";
import Servicio from "../models/Servicio.js";
import Cliente from "../models/Cliente.js";
import User from "../models/user.js";
import DetalleOrdenServicio from "../models/DetalleOrdenServicio.js";
import Seguimiento from "../models/seguimiento.js";

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

  // Actualizar estado de solicitud (método simple - mantener para compatibilidad)
  async updateEstado(id, nuevoEstado) {
    const solicitud = await OrdenServicio.findByPk(id);
    if (solicitud) {
      solicitud.estado = nuevoEstado;
      await solicitud.save();
      return solicitud;
    }
    return null;
  }

  // Anular solicitud con auditoría completa (NUEVO)
  async anularSolicitud(id, datosAnulacion) {
    const transaction = await sequelize.transaction();
    
    try {
      console.log('🔍 Buscando solicitud para anular:', id);
      
      // 1. Buscar solicitud con todas las relaciones necesarias
      const solicitud = await OrdenServicio.findByPk(id, {
        include: [
          { 
            model: Servicio, 
            as: 'servicio',
            attributes: ['id_servicio', 'nombre']
          },
          { 
            model: Cliente, 
            as: 'cliente',
            include: [{ 
              model: User, 
              as: 'Usuario',
              attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
            }]
          },
          { 
            model: User, 
            as: 'empleado_asignado',
            attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
          }
        ],
        transaction
      });

      if (!solicitud) {
        throw new Error('Solicitud no encontrada');
      }

      console.log('✅ Solicitud encontrada:', {
        id: solicitud.id_orden_servicio,
        estado_actual: solicitud.estado,
        servicio: solicitud.servicio?.nombre
      });

      // 2. Validar estado actual
      if (solicitud.estado === 'Anulado') {
        throw new Error('La solicitud ya está anulada');
      }
      
      if (solicitud.estado === 'Finalizado') {
        throw new Error('No se puede anular una solicitud finalizada');
      }

      // 3. Guardar estado anterior para el historial
      const estadoAnterior = solicitud.estado;
      console.log('📋 Estado anterior:', estadoAnterior);

      // 4. Actualizar orden de servicio con datos de anulación
      solicitud.estado = 'Anulado';
      solicitud.anulado_por = datosAnulacion.usuario_id;
      solicitud.fecha_anulacion = new Date();
      solicitud.motivo_anulacion = datosAnulacion.motivo;
      await solicitud.save({ transaction });
      
      console.log('✅ Estado actualizado a "Anulado"');

      // 5. Crear registro en historial (detalles_ordenes_servicio)
      await DetalleOrdenServicio.create({
        id_orden_servicio: id,
        id_servicio: solicitud.id_servicio,
        estado: 'Anulado',
        fecha_estado: new Date()
      }, { transaction });
      
      console.log('✅ Registro creado en detalles_ordenes_servicio');

      // 6. Crear seguimiento con auditoría completa
      await Seguimiento.create({
        id_orden_servicio: id,
        titulo: 'Solicitud Anulada',
        descripcion: `La solicitud ha sido anulada. Motivo: ${datosAnulacion.motivo}`,
        registrado_por: datosAnulacion.usuario_id,
        nuevo_estado: 'Anulado',
        estado_anterior: estadoAnterior,
        observaciones: `ANULACIÓN: ${datosAnulacion.motivo}`,
        fecha_registro: new Date(),
        id_usuario: datosAnulacion.usuario_id
      }, { transaction });
      
      console.log('✅ Registro creado en seguimientos');

      // 7. Commit de la transacción
      await transaction.commit();
      console.log('✅ Transacción completada exitosamente');

      return solicitud;
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error en anularSolicitud (rollback):', error.message);
      throw error;
    }
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
