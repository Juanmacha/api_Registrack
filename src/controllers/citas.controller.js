import { Op } from "sequelize";
import { Cita, OrdenServicio, Cliente, Servicio } from "../models/associations.js";
import User from "../models/user.js";
import Seguimiento from "../models/Seguimiento.js";
import ExcelJS from "exceljs";
import {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  VALIDATION_MESSAGES,
  ERROR_CODES
} from "../constants/messages.js";
import {
  sendCitaProgramadaCliente,
  sendCitaProgramadaEmpleado
} from "../services/email.service.js";

export const getCitas = async (req, res) => {
    try {
        const citas = await Cita.findAll({
            include: [
                {
                    model: User,
                    as: 'Cliente',
                    attributes: ['id_usuario', 'documento', 'nombre', 'apellido']
                },
                {
                    model: User,
                    as: 'Empleado',
                    attributes: ['id_usuario', 'nombre', 'apellido']
                }
            ]
        });
        
        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.APPOINTMENTS_FOUND,
            data: {
                citas: citas.map(cita => ({
                    id_cita: cita.id_cita,
                    fecha: cita.fecha,
                    hora_inicio: cita.hora_inicio,
                    hora_fin: cita.hora_fin,
                    tipo: cita.tipo,
                    modalidad: cita.modalidad,
                    estado: cita.estado,
                    observacion: cita.observacion,
                    id_orden_servicio: cita.id_orden_servicio, // Indica si está asociada a una solicitud
                    cliente: cita.Cliente ? {
                        id_usuario: cita.Cliente.id_usuario,
                        documento: cita.Cliente.documento,
                        nombre: cita.Cliente.nombre,
                        apellido: cita.Cliente.apellido
                    } : null,
                    empleado: cita.Empleado ? {
                        id_usuario: cita.Empleado.id_usuario,
                        nombre: cita.Empleado.nombre,
                        apellido: cita.Empleado.apellido
                    } : null
                })),
                total: citas.length
            },
            meta: {
                timestamp: new Date().toISOString(),
                filters: {
                    available: "Use query parameters para filtrar por fecha, estado, tipo, etc."
                }
            }
        });
    } catch (error) {
        console.error("Error al obtener citas:", error);
        res.status(500).json({
            success: false,
            error: {
                message: ERROR_MESSAGES.INTERNAL_ERROR,
                code: ERROR_CODES.INTERNAL_ERROR,
                details: process.env.NODE_ENV === "development" ? error.message : "Error al obtener citas",
                timestamp: new Date().toISOString()
            }
        });
    }
};

export const createCita = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, tipo, modalidad, id_cliente, id_empleado, observacion } = req.body;
    let { estado } = req.body;

    // 1. Field Validation
    const requiredFields = ['fecha', 'hora_inicio', 'hora_fin', 'tipo', 'modalidad', 'id_cliente', 'id_empleado'];
    const missingFields = [];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            missingFields.push(field);
        }
    }
    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Los siguientes campos son obligatorios:",
            campos_faltantes: missingFields
        });
    }

    // Date format validation
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormat.test(fecha)) {
        return res.status(400).json({ message: "El formato de la fecha debe ser YYYY-MM-DD." });
    }

    // Time format validation
    const timeFormat = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeFormat.test(hora_inicio)) {
        return res.status(400).json({ message: `El formato de la hora_inicio debe ser HH:MM:SS.` });
    }
    if (!timeFormat.test(hora_fin)) {
        return res.status(400).json({ message: `El formato de la hora_fin debe ser HH:MM:SS.` });
    }

    // If estado is not provided or is empty, use the default value
    if (!estado) {
        estado = 'Programada';
    }

    console.log("Creating cita with data:", req.body);

    try {
        // 2. Date Validation
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight
        const requestedDate = new Date(fecha);

        if (requestedDate < today) {
            return res.status(400).json({ message: "No se puede crear una cita en una fecha anterior a hoy." });
        }

        // 2. Time Validation
        const startTime = new Date(`1970-01-01T${hora_inicio}`);
        const endTime = new Date(`1970-01-01T${hora_fin}`);
        const openingTime = new Date(`1970-01-01T07:00:00`);
        const closingTime = new Date(`1970-01-01T18:00:00`);

        if (startTime < openingTime || endTime > closingTime) {
            return res.status(400).json({ message: "Las citas solo se pueden agendar entre las 7:00 AM y las 6:00 PM." });
        }

        if (startTime >= endTime) {
            return res.status(400).json({ message: "La hora de inicio debe ser anterior a la hora de fin." });
        }

        // 4. Overlap Validation
        console.log("Checking for existing appointments with overlap...");
        const existingCita = await Cita.findOne({
            where: {
                fecha,
                id_empleado,
                hora_inicio: {
                    [Op.lt]: hora_fin
                },
                hora_fin: {
                    [Op.gt]: hora_inicio
                }
            },
            logging: console.log // Log the generated SQL query
        });

        console.log("Found existing cita:", existingCita);

        if (existingCita) {
            return res.status(400).json({ message: "Ya existe una cita agendada en ese horario para el empleado seleccionado." });
        }

        const newCita = await Cita.create({
            fecha,
            hora_inicio,
            hora_fin,
            tipo,
            modalidad,
            estado,
            id_cliente,
            id_empleado,
            observacion
        });
        res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.APPOINTMENT_CREATED,
            data: {
                cita: {
                    id_cita: newCita.id_cita,
                    fecha: newCita.fecha,
                    hora_inicio: newCita.hora_inicio,
                    hora_fin: newCita.hora_fin,
                    tipo: newCita.tipo,
                    modalidad: newCita.modalidad,
                    estado: newCita.estado,
                    observacion: newCita.observacion,
                    id_cliente: newCita.id_cliente,
                    id_empleado: newCita.id_empleado,
                    id_orden_servicio: newCita.id_orden_servicio || null // Puede ser null si no está asociada
                }
            },
            meta: {
                timestamp: new Date().toISOString(),
                nextSteps: [
                    "La cita ha sido programada exitosamente",
                    "Se enviará una confirmación por correo electrónico",
                    "Puede reprogramar o cancelar la cita si es necesario"
                ]
            }
        });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => {
                let customMessage = `Error en el campo '${err.path}': ${err.message}`;
                switch (err.validatorKey) {
                    case 'isIn':
                        customMessage = `El valor '${err.value}' no es válido para el campo '${err.path}'. Los valores permitidos son: ${err.validatorArgs[0].join(', ')}.`;
                        break;
                    case 'isDate':
                    case 'isDateOnly':
                        customMessage = `El valor '${err.value}' no es una fecha válida para el campo '${err.path}'. Asegúrate de que el formato sea YYYY-MM-DD.`;
                        break;
                    // Add more cases for other validators if needed
                }
                return customMessage;
            });
            return res.status(400).json({ message: "Error de validación", errors: messages });
        }
        res.status(500).json({ message: error.message });
    }
};

export const reprogramarCita = async (req, res) => {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin } = req.body;

    try {
        const cita = await Cita.findByPk(id);
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada." });
        }

        // Check if the appointment is canceled
        if (cita.estado === 'Anulada') {
            return res.status(400).json({ message: "No se puede reprogramar una cita que ha sido anulada." });
        }

        // Validations (similar to createCita)
        // Date format validation
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
        if (fecha && !dateFormat.test(fecha)) {
            return res.status(400).json({ message: "El formato de la fecha debe ser YYYY-MM-DD." });
        }

        // Time format validation
        const timeFormat = /^\d{2}:\d{2}:\d{2}$/;
        if (hora_inicio && !timeFormat.test(hora_inicio)) {
            return res.status(400).json({ message: `El formato de la hora_inicio debe ser HH:MM:SS.` });
        }
        if (hora_fin && !timeFormat.test(hora_fin)) {
            return res.status(400).json({ message: `El formato de la hora_fin debe ser HH:MM:SS.` });
        }
        
        const newFecha = fecha || cita.fecha;
        const newHoraInicio = hora_inicio || cita.hora_inicio;
        const newHoraFin = hora_fin || cita.hora_fin;

        // Date in the past validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const requestedDate = new Date(newFecha);
        if (requestedDate < today) {
            return res.status(400).json({ message: "No se puede reprogramar una cita a una fecha anterior a hoy." });
        }

        // Time within working hours validation
        const startTime = new Date(`1970-01-01T${newHoraInicio}`);
        const endTime = new Date(`1970-01-01T${newHoraFin}`);
        const openingTime = new Date(`1970-01-01T07:00:00`);
        const closingTime = new Date(`1970-01-01T18:00:00`);

        if (startTime < openingTime || endTime > closingTime) {
            return res.status(400).json({ message: "Las citas solo se pueden agendar entre las 7:00 AM y las 6:00 PM." });
        }

        if (startTime >= endTime) {
            return res.status(400).json({ message: "La hora de inicio debe ser anterior a la hora de fin." });
        }

        // Overlap validation
        const existingCita = await Cita.findOne({
            where: {
                id_cita: { [Op.ne]: id }, // Exclude the current appointment
                fecha: newFecha,
                id_empleado: cita.id_empleado,
                hora_inicio: { [Op.lt]: newHoraFin },
                hora_fin: { [Op.gt]: newHoraInicio }
            }
        });

        if (existingCita) {
            return res.status(400).json({ message: "Ya existe una cita agendada en ese horario para el empleado seleccionado." });
        }

        cita.fecha = newFecha;
        cita.hora_inicio = newHoraInicio;
        cita.hora_fin = newHoraFin;
        cita.estado = 'Reprogramada';
        await cita.save();

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.APPOINTMENT_RESCHEDULED,
            data: {
                cita: {
                    id_cita: cita.id_cita,
                    fecha: cita.fecha,
                    hora_inicio: cita.hora_inicio,
                    hora_fin: cita.hora_fin,
                    tipo: cita.tipo,
                    modalidad: cita.modalidad,
                    estado: cita.estado,
                    observacion: cita.observacion,
                    id_orden_servicio: cita.id_orden_servicio || null
                }
            },
            meta: {
                timestamp: new Date().toISOString(),
                nextSteps: [
                    "La cita ha sido reprogramada exitosamente",
                    "Se enviará una notificación al cliente",
                    "Verifique la nueva fecha y hora"
                ]
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const anularCita = async (req, res) => {
    const { id } = req.params;

    try {
        // Check for body and observacion
        if (!req.body || !req.body.observacion) {
            return res.status(400).json({ message: "Se requiere una observación para anular la cita." });
        }
        const { observacion } = req.body;

        const cita = await Cita.findByPk(id);
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada." });
        }

        // Check if the appointment is already canceled
        if (cita.estado === 'Anulada') {
            return res.status(400).json({ message: "Esta cita ya ha sido anulada." });
        }

        cita.estado = 'Anulada';
        cita.observacion = observacion;
        await cita.save();

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.APPOINTMENT_CANCELLED,
            data: {
                cita: {
                    id_cita: cita.id_cita,
                    fecha: cita.fecha,
                    hora_inicio: cita.hora_inicio,
                    hora_fin: cita.hora_fin,
                    tipo: cita.tipo,
                    modalidad: cita.modalidad,
                    estado: cita.estado,
                    observacion: cita.observacion,
                    id_orden_servicio: cita.id_orden_servicio || null
                }
            },
            meta: {
                timestamp: new Date().toISOString(),
                nextSteps: [
                    "La cita ha sido anulada exitosamente",
                    "Se enviará una notificación al cliente",
                    "El horario queda disponible para nuevas citas"
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reporte Excel de citas
export const descargarReporteCitas = async (req, res) => {
    try {
        const citas = await Cita.findAll({
            include: [
                {
                    model: User,
                    as: 'Cliente',
                    attributes: ['id_usuario', 'documento', 'nombre', 'apellido']
                },
                {
                    model: User,
                    as: 'Empleado',
                    attributes: ['id_usuario', 'nombre', 'apellido']
                }
            ]
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Citas");

        worksheet.columns = [
            { header: "ID Cita", key: "id_cita", width: 10 },
            { header: "Fecha", key: "fecha", width: 15 },
            { header: "Hora Inicio", key: "hora_inicio", width: 15 },
            { header: "Hora Fin", key: "hora_fin", width: 15 },
            { header: "Tipo", key: "tipo", width: 15 },
            { header: "Modalidad", key: "modalidad", width: 15 },
            { header: "Estado", key: "estado", width: 15 },
            { header: "ID Solicitud", key: "id_orden_servicio", width: 15 },
            { header: "Cliente", key: "cliente", width: 25 },
            { header: "Empleado", key: "empleado", width: 25 },
            { header: "Observación", key: "observacion", width: 30 }
        ];

        citas.forEach(cita => {
            worksheet.addRow({
                id_cita: cita.id_cita,
                fecha: cita.fecha,
                hora_inicio: cita.hora_inicio,
                hora_fin: cita.hora_fin,
                tipo: cita.tipo,
                modalidad: cita.modalidad,
                estado: cita.estado,
                id_orden_servicio: cita.id_orden_servicio || 'No asociada',
                cliente: cita.Cliente ? `${cita.Cliente.nombre} ${cita.Cliente.apellido}` : 'No asignado',
                empleado: cita.Empleado ? `${cita.Empleado.nombre} ${cita.Empleado.apellido}` : 'No asignado',
                observacion: cita.observacion || ''
            });
        });

        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
        });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_citas.xlsx");

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: "Error al generar el reporte de citas", error: error.message });
    }
};

// Middleware de validación para crear cita
export const validateCreateCita = (req, res, next) => {
    const { fecha, hora_inicio, hora_fin, tipo, modalidad, id_cliente, id_empleado } = req.body;
    
    const requiredFields = { fecha, hora_inicio, hora_fin, tipo, modalidad, id_cliente, id_empleado };
    const missingFields = Object.keys(requiredFields).filter(field => !requiredFields[field]);
    
    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            error: {
                message: `Los campos son obligatorios: ${missingFields.join(', ')}`,
                code: 'REQUIRED_FIELD',
                details: { missingFields },
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'El formato de fecha debe ser YYYY-MM-DD',
                code: 'INVALID_DATE_FORMAT',
                details: { field: 'fecha', value: fecha },
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // Validar formato de hora
    if (!/^\d{2}:\d{2}:\d{2}$/.test(hora_inicio) || !/^\d{2}:\d{2}:\d{2}$/.test(hora_fin)) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'El formato de hora debe ser HH:MM:SS',
                code: 'INVALID_TIME_FORMAT',
                details: { field: 'hora_inicio/hora_fin' },
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // Validar tipos permitidos
    const tiposPermitidos = ['Consulta', 'Seguimiento', 'Reunión', 'Presentación'];
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({
            success: false,
            error: {
                message: `Tipo de cita no válido. Tipos permitidos: ${tiposPermitidos.join(', ')}`,
                code: 'INVALID_CHOICE',
                details: { field: 'tipo', value: tipo, allowed: tiposPermitidos },
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // Validar modalidades permitidas
    const modalidadesPermitidas = ['Presencial', 'Virtual', 'Híbrida'];
    if (!modalidadesPermitidas.includes(modalidad)) {
        return res.status(400).json({
            success: false,
            error: {
                message: `Modalidad no válida. Modalidades permitidas: ${modalidadesPermitidas.join(', ')}`,
                code: 'INVALID_CHOICE',
                details: { field: 'modalidad', value: modalidad, allowed: modalidadesPermitidas },
                timestamp: new Date().toISOString()
            }
        });
    }
    
    // Validar IDs numéricos
    if (isNaN(parseInt(id_cliente)) || parseInt(id_cliente) <= 0) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'El ID del cliente debe ser un número válido',
                code: 'INVALID_ID',
                details: { field: 'id_cliente', value: id_cliente },
                timestamp: new Date().toISOString()
            }
        });
    }
    
    if (isNaN(parseInt(id_empleado)) || parseInt(id_empleado) <= 0) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'El ID del empleado debe ser un número válido',
                code: 'INVALID_ID',
                details: { field: 'id_empleado', value: id_empleado },
                timestamp: new Date().toISOString()
            }
        });
    }
    
    next();
};

/**
 * POST /api/gestion-citas/desde-solicitud/:idOrdenServicio
 * Crear cita asociada a una solicitud de servicio
 * Solo Admin/Empleado
 */
export const crearCitaDesdeSolicitud = async (req, res) => {
  const { idOrdenServicio } = req.params;
  const { fecha, hora_inicio, hora_fin, modalidad, id_empleado, observacion } = req.body;

  try {
    console.log('📅 Creando cita desde solicitud:', { idOrdenServicio });

    // 1. Validar campos requeridos
    if (!fecha || !hora_inicio || !hora_fin || !modalidad) {
      return res.status(400).json({ 
        success: false,
        message: "Los campos fecha, hora_inicio, hora_fin y modalidad son obligatorios" 
      });
    }

    // 2. Buscar la solicitud con todas las relaciones
    const solicitud = await OrdenServicio.findByPk(idOrdenServicio, {
      include: [
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
          model: Servicio,
          as: 'servicio',
          attributes: ['id_servicio', 'nombre']
        },
        {
          model: User,
          as: 'empleado_asignado',
          required: false
        }
      ]
    });

    if (!solicitud) {
      return res.status(404).json({ 
        success: false,
        message: "Solicitud no encontrada" 
      });
    }

    // 3. Validar que la solicitud tenga cliente válido
    if (!solicitud.cliente || !solicitud.cliente.Usuario) {
      return res.status(400).json({ 
        success: false,
        message: "La solicitud no tiene un cliente asociado válido" 
      });
    }

    // 4. Validaciones de fecha y hora
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(fecha);
    if (requestedDate < today) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede crear una cita en una fecha anterior a hoy" 
      });
    }

    // 5. Validar horario de oficina (7 AM - 6 PM)
    const startTime = new Date(`1970-01-01T${hora_inicio}`);
    const endTime = new Date(`1970-01-01T${hora_fin}`);
    const openingTime = new Date(`1970-01-01T07:00:00`);
    const closingTime = new Date(`1970-01-01T18:00:00`);

    if (startTime < openingTime || endTime > closingTime) {
      return res.status(400).json({ 
        success: false,
        message: "Las citas solo se pueden agendar entre las 7:00 AM y las 6:00 PM" 
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ 
        success: false,
        message: "La hora de inicio debe ser anterior a la hora de fin" 
      });
    }

    // 6. Validar solapamiento de horarios
    if (id_empleado) {
      const existingCita = await Cita.findOne({
        where: {
          fecha,
          id_empleado,
          hora_inicio: { [Op.lt]: hora_fin },
          hora_fin: { [Op.gt]: hora_inicio }
        }
      });

      if (existingCita) {
        return res.status(400).json({ 
          success: false,
          message: "Ya existe una cita agendada en ese horario para el empleado seleccionado" 
        });
      }
    }

    // 7. Mapear nombre del servicio a tipo de cita válido
    const tipoMap = {
      'Búsqueda de Antecedentes': 'Busqueda',
      'Certificación de Marca': 'Certificacion',
      'Renovación de Marca': 'Renovacion',
      'Presentación de Oposición': 'Oposicion',
      'Cesión de Marca': 'Cesion',
      'Ampliación de Alcance': 'Ampliacion',
      'Respuesta a Oposición': 'Respuesta de oposicion'
    };
    const tipoCita = tipoMap[solicitud.servicio.nombre] || 'General';

    // 8. Crear la cita asociada a la solicitud
    const nuevaCita = await Cita.create({
      fecha,
      hora_inicio,
      hora_fin,
      tipo: tipoCita, // Tipo mapeado al ENUM válido
      modalidad,
      estado: 'Programada',
      observacion,
      id_cliente: solicitud.cliente.Usuario.id_usuario, // Cliente automático
      id_empleado, // Empleado asignado por admin
      id_orden_servicio: idOrdenServicio // ← VINCULAR CON SOLICITUD
    });

    console.log('✅ Cita creada:', nuevaCita.id_cita);

    // 9. Crear seguimiento automático en la solicitud
    await Seguimiento.create({
      id_orden_servicio: idOrdenServicio,
      titulo: 'Cita Programada',
      descripcion: `Cita ${modalidad} programada para ${fecha} de ${hora_inicio} a ${hora_fin}`,
      registrado_por: req.user.id_usuario,
      id_usuario: req.user.id_usuario,
      fecha_registro: new Date()
    });

    console.log('✅ Seguimiento creado');

    // 10. Enviar emails de notificación
    try {
      // Obtener datos del empleado una sola vez si está asignado
      let empleadoData = null;
      if (id_empleado) {
        const empleado = await User.findByPk(id_empleado);
        if (empleado) {
          empleadoData = {
            correo: empleado.correo,
            nombre: `${empleado.nombre} ${empleado.apellido}`
          };
        }
      }

      // Email al cliente
      if (solicitud.cliente && solicitud.cliente.Usuario && solicitud.cliente.Usuario.correo) {
        console.log('📧 Enviando email de cita al cliente:', solicitud.cliente.Usuario.correo);
        await sendCitaProgramadaCliente(
          solicitud.cliente.Usuario.correo,
          `${solicitud.cliente.Usuario.nombre} ${solicitud.cliente.Usuario.apellido}`,
          {
            solicitud_id: idOrdenServicio,
            servicio: solicitud.servicio.nombre,
            fecha: fecha,
            hora_inicio: hora_inicio,
            hora_fin: hora_fin,
            modalidad: modalidad,
            empleado_nombre: empleadoData ? empleadoData.nombre : null,
            observacion: observacion
          }
        );
        console.log('✅ Email enviado al cliente');
      } else {
        console.log('⚠️ No se pudo obtener correo del cliente');
      }

      // Email al empleado si está asignado
      if (empleadoData && empleadoData.correo) {
        console.log('📧 Enviando email de cita al empleado:', empleadoData.correo);
        await sendCitaProgramadaEmpleado(
          empleadoData.correo,
          empleadoData.nombre,
          {
            solicitud_id: idOrdenServicio,
            servicio: solicitud.servicio.nombre,
            cliente_nombre: `${solicitud.cliente.Usuario.nombre} ${solicitud.cliente.Usuario.apellido}`,
            cliente_email: solicitud.cliente.Usuario.correo,
            fecha: fecha,
            hora_inicio: hora_inicio,
            hora_fin: hora_fin,
            modalidad: modalidad,
            observacion: observacion
          }
        );
        console.log('✅ Email enviado al empleado');
      } else {
        console.log('⚠️ No hay empleado asignado para enviar email');
      }
    } catch (emailError) {
      console.error('❌ Error al enviar emails:', emailError);
      // No fallar la operación por error de email
    }

    // 11. Retornar respuesta
    res.status(201).json({
      success: true,
      message: "Cita creada y asociada a la solicitud exitosamente",
      data: {
        cita: {
          id_cita: nuevaCita.id_cita,
          fecha: nuevaCita.fecha,
          hora_inicio: nuevaCita.hora_inicio,
          hora_fin: nuevaCita.hora_fin,
          modalidad: nuevaCita.modalidad,
          estado: nuevaCita.estado
        },
        solicitud_id: idOrdenServicio,
        cliente: {
          nombre: `${solicitud.cliente.Usuario.nombre} ${solicitud.cliente.Usuario.apellido}`,
          correo: solicitud.cliente.Usuario.correo
        },
        servicio: solicitud.servicio.nombre
      }
    });

  } catch (error) {
    console.error('❌ Error al crear cita desde solicitud:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear la cita desde la solicitud", 
      error: error.message 
    });
  }
};

/**
 * GET /api/gestion-citas/solicitud/:id
 * Obtener todas las citas asociadas a una solicitud
 */
export const obtenerCitasDeSolicitud = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar la solicitud
    const solicitud = await OrdenServicio.findByPk(id, {
      attributes: ['id_orden_servicio', 'numero_expediente']
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: "Solicitud no encontrada"
      });
    }

    // Buscar todas las citas asociadas
    const citas = await Cita.findAll({
      where: { id_orden_servicio: id },
      include: [
        {
          model: User,
          as: 'Empleado',
          attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
        }
      ],
      order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']]
    });

    res.json({
      success: true,
      solicitud_id: id,
      numero_expediente: solicitud.numero_expediente,
      total: citas.length,
      citas: citas.map(cita => ({
        id_cita: cita.id_cita,
        fecha: cita.fecha,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        modalidad: cita.modalidad,
        estado: cita.estado,
        observacion: cita.observacion,
        empleado: cita.Empleado ? {
          nombre: `${cita.Empleado.nombre} ${cita.Empleado.apellido}`,
          correo: cita.Empleado.correo
        } : null
      }))
    });

  } catch (error) {
    console.error('❌ Error al obtener citas de solicitud:', error);
    res.status(500).json({
      success: false,
      message: "Error al obtener citas",
      error: error.message
    });
  }
};