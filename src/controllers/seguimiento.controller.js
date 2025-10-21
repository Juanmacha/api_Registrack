import { SeguimientoService } from "../services/seguimiento.service.js";
import Seguimiento from "../models/Seguimiento.js";
import DetalleOrdenServicio from "../models/DetalleOrdenServicio.js";
import OrdenServicio from "../models/OrdenServicio.js";
import Servicio from "../models/Servicio.js";
import Proceso from "../models/Proceso.js";
import Cliente from "../models/Cliente.js";
import User from "../models/user.js";
import { sendCambioEstadoCliente } from "../services/email.service.js";

const seguimientoService = new SeguimientoService();

// Obtener historial de seguimiento de una solicitud
export const obtenerHistorialSeguimiento = async (req, res) => {
  try {
    const { idOrdenServicio } = req.params;
    const seguimientos = await seguimientoService.obtenerHistorialSeguimiento(
      idOrdenServicio
    );
    res.json(seguimientos);
  } catch (error) {
    console.error("Error al obtener historial de seguimiento:", error);
    if (error.message.includes("Orden de servicio no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Crear nuevo registro de seguimiento
export const crearSeguimiento = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado y tenga ID
    if (!req.user || !req.user.id_usuario) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado o ID de usuario no válido.",
      });
    }

    const seguimientoData = {
      ...req.body,
      registrado_por: req.user.id_usuario, // Asignar automáticamente el usuario que registra
    };

    // 🚀 NUEVA FUNCIONALIDAD: Manejo de cambio de proceso
    if (req.body.nuevo_proceso) {
      console.log('🔄 Procesando cambio de proceso...');
      
      // Obtener la orden de servicio con información del cliente
      const ordenServicio = await OrdenServicio.findByPk(req.body.id_orden_servicio, {
        include: [{
          model: Servicio,
          as: 'servicio',
          include: [{
            model: Proceso,
            as: 'process_states'
          }]
        }, {
          model: Cliente,
          as: 'cliente',
          include: [{
            model: User,
            as: 'Usuario'
          }]
        }]
      });
      
      if (!ordenServicio) {
        return res.status(404).json({
          mensaje: "Orden de servicio no encontrada"
        });
      }
      
      // Obtener el estado actual
      const estadoActual = await DetalleOrdenServicio.findOne({
        where: { id_orden_servicio: req.body.id_orden_servicio },
        order: [['fecha_estado', 'DESC']]
      });
      
      const procesoAnterior = estadoActual ? estadoActual.estado : 'Sin proceso';
      console.log('📊 Proceso anterior:', procesoAnterior);
      console.log('📊 Nuevo proceso solicitado:', req.body.nuevo_proceso);
      
      // Validar que el nuevo proceso esté en los process_states del servicio
      const procesosValidos = ordenServicio.servicio.process_states.map(p => p.nombre);
      if (!procesosValidos.includes(req.body.nuevo_proceso)) {
        return res.status(400).json({
          mensaje: `El proceso "${req.body.nuevo_proceso}" no es válido para este servicio. Procesos disponibles: ${procesosValidos.join(', ')}`
        });
      }
      
      // Agregar campos de proceso al seguimiento
      seguimientoData.estado_anterior = procesoAnterior;
      seguimientoData.nuevo_estado = req.body.nuevo_proceso;
      
      // Crear el seguimiento
      const resultado = await seguimientoService.crearSeguimiento(seguimientoData);
      
      // Crear nuevo registro en DetalleOrdenServicio con el nuevo proceso
      await DetalleOrdenServicio.create({
        id_orden_servicio: req.body.id_orden_servicio,
        id_servicio: ordenServicio.id_servicio,
        estado: req.body.nuevo_proceso, // Usar directamente el nombre del proceso
        fecha_estado: new Date()
      });
      
      // Actualizar el estado de la orden principal
      await ordenServicio.update({ estado: req.body.nuevo_proceso });
      
      console.log('✅ Proceso cambiado exitosamente:', procesoAnterior, '→', req.body.nuevo_proceso);
      
      // 🚀 NUEVA FUNCIONALIDAD: Enviar email al cliente sobre el cambio de estado
      try {
        if (ordenServicio.cliente && ordenServicio.cliente.Usuario && ordenServicio.cliente.Usuario.correo) {
          console.log('📧 Enviando notificación de cambio de estado al cliente...');
          await sendCambioEstadoCliente(
            ordenServicio.cliente.Usuario.correo,
            `${ordenServicio.cliente.Usuario.nombre} ${ordenServicio.cliente.Usuario.apellido}`,
            {
              orden_id: ordenServicio.id_orden_servicio,
              servicio_nombre: ordenServicio.servicio.nombre,
              estado_anterior: procesoAnterior,
              nuevo_estado: req.body.nuevo_proceso,
              fecha_cambio: new Date().toISOString(),
              comentarios: req.body.comentarios || null
            }
          );
          console.log('✅ Email de cambio de estado enviado al cliente:', ordenServicio.cliente.Usuario.correo);
        } else {
          console.log('⚠️ No se pudo obtener información del cliente para enviar notificación de cambio de estado');
        }
      } catch (emailError) {
        console.error('❌ Error al enviar email de cambio de estado:', emailError);
        // No fallar la operación por error de email
      }
      
      // Agregar información del cambio de proceso a la respuesta
      if (resultado.data) {
        resultado.data.cambio_proceso = {
          proceso_anterior: procesoAnterior,
          nuevo_proceso: req.body.nuevo_proceso,
          fecha_cambio: new Date().toISOString()
        };
      } else {
        // Si no hay data, crear la estructura completa
        resultado.data = {
          cambio_proceso: {
            proceso_anterior: procesoAnterior,
            nuevo_proceso: req.body.nuevo_proceso,
            fecha_cambio: new Date().toISOString()
          }
        };
      }
      
      res.status(201).json(resultado);
      
    } else {
      // Crear seguimiento normal sin cambio de estado
      const resultado = await seguimientoService.crearSeguimiento(seguimientoData);
    res.status(201).json(resultado);
    }
    
  } catch (error) {
    console.error("Error al crear seguimiento:", error);
    if (error.message.includes("es requerido")) {
      res.status(400).json({ mensaje: error.message });
    } else if (error.message.includes("Orden de servicio no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else if (error.message.includes("El título no puede exceder")) {
      res.status(400).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Obtener seguimiento por ID
export const obtenerSeguimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const seguimiento = await seguimientoService.obtenerSeguimientoPorId(id);
    res.json(seguimiento);
  } catch (error) {
    console.error("Error al obtener seguimiento:", error);
    if (error.message.includes("Seguimiento no encontrado")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Actualizar seguimiento
export const actualizarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    const resultado = await seguimientoService.actualizarSeguimiento(
      id,
      datosActualizados
    );
    res.json(resultado);
  } catch (error) {
    console.error("Error al actualizar seguimiento:", error);
    if (error.message.includes("Seguimiento no encontrado")) {
      res.status(404).json({ mensaje: error.message });
    } else if (error.message.includes("Debe proporcionar al menos un campo")) {
      res.status(400).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Eliminar seguimiento
export const eliminarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await seguimientoService.eliminarSeguimiento(id);
    res.json(resultado);
  } catch (error) {
    console.error("Error al eliminar seguimiento:", error);
    if (error.message.includes("Seguimiento no encontrado")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Buscar seguimientos por título
export const buscarPorTitulo = async (req, res) => {
  try {
    const { idOrdenServicio } = req.params;
    const { titulo } = req.query;

    if (!titulo) {
      return res
        .status(400)
        .json({ mensaje: "El parámetro titulo es requerido." });
    }

    const seguimientos = await seguimientoService.buscarPorTitulo(
      idOrdenServicio,
      titulo
    );
    res.json(seguimientos);
  } catch (error) {
    console.error("Error al buscar seguimientos por título:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

// 🚀 NUEVA FUNCIÓN: Obtener estados disponibles para una solicitud
export const obtenerEstadosDisponibles = async (req, res) => {
  try {
    const { idOrdenServicio } = req.params;
    
    // Obtener la orden de servicio con el servicio asociado
    const ordenServicio = await OrdenServicio.findByPk(idOrdenServicio, {
      include: [{
        model: Servicio,
        as: 'servicio',
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      }]
    });
    
    if (!ordenServicio) {
      return res.status(404).json({
        success: false,
        mensaje: "Orden de servicio no encontrada"
      });
    }
    
    // Obtener el estado actual de la solicitud
    const estadoActual = await DetalleOrdenServicio.findOne({
      where: { id_orden_servicio: idOrdenServicio },
      order: [['fecha_estado', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        orden_servicio_id: idOrdenServicio,
        servicio: ordenServicio.servicio.nombre,
        estado_actual: estadoActual ? estadoActual.estado : 'Sin estado',
        estados_disponibles: ordenServicio.servicio.process_states.map(proceso => ({
          id: proceso.id_proceso,
          nombre: proceso.nombre,
          descripcion: proceso.descripcion,
          order_number: proceso.order_number,
          status_key: proceso.status_key
        }))
      }
    });
    
  } catch (error) {
    console.error("Error al obtener estados disponibles:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor"
    });
  }
};
