import SolicitudCita from "../models/solicitud_cita.js";
import User from "../models/user.js";
import Cita from "../models/citas.js"; // Importar Cita
import { Op } from "sequelize";
import {
  sendSolicitudCitaCreada,
  sendSolicitudCitaAprobada,
  sendSolicitudCitaRechazada
} from "../services/email.service.js";

// Cliente: Crear una nueva solicitud de cita
export const crearSolicitud = async (req, res) => {
    const { fecha_solicitada, hora_solicitada, tipo, modalidad, descripcion } = req.body;
    const id_cliente = req.user.id_usuario; // Asumimos que el id del cliente viene del token de autenticación

    // Validar campos básicos
    if (!fecha_solicitada || !hora_solicitada || !tipo || !modalidad) {
        return res.status(400).json({ message: "Los campos fecha_solicitada, hora_solicitada, tipo y modalidad son obligatorios." });
    }

    try {
        const nuevaSolicitud = await SolicitudCita.create({
            fecha_solicitada,
            hora_solicitada,
            tipo,
            modalidad,
            descripcion,
            id_cliente
        });

        // Enviar email de confirmación al cliente
        try {
            // Obtener datos del cliente
            const cliente = await User.findByPk(id_cliente);
            if (cliente && cliente.correo) {
                console.log('📧 Enviando email de solicitud de cita creada:', cliente.correo);
                await sendSolicitudCitaCreada(
                    cliente.correo,
                    `${cliente.nombre} ${cliente.apellido}`,
                    {
                        solicitud_id: nuevaSolicitud.id,
                        tipo: tipo,
                        fecha: fecha_solicitada,
                        hora: hora_solicitada,
                        modalidad: modalidad,
                        descripcion: descripcion || null
                    }
                );
                console.log('✅ Email enviado al cliente');
            } else {
                console.log('⚠️ No se pudo obtener correo del cliente');
            }
        } catch (emailError) {
            console.error('❌ Error al enviar email:', emailError);
            // No fallar la operación por error de email
        }

        res.status(201).json({ message: "Solicitud de cita creada exitosamente. Queda pendiente de aprobación.", solicitud: nuevaSolicitud });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => `El valor '${err.value}' no es válido para el campo '${err.path}'. Los valores permitidos son: ${err.validatorArgs[0].join(', ')}.`);
            return res.status(400).json({ message: "Error de validación", errors: messages });
        }
        res.status(500).json({ message: "Error al crear la solicitud de cita.", error: error.message });
    }
};

// Cliente: Ver el estado de sus solicitudes
export const verMisSolicitudes = async (req, res) => {
    const id_cliente = req.user.id_usuario;

    try {
        const solicitudes = await SolicitudCita.findAll({
            where: { id_cliente },
            order: [['id', 'DESC']]
        });
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener tus solicitudes de cita.", error: error.message });
    }
};

// --- Rutas de Administrador ---

// Admin/Empleado: Ver todas las solicitudes
export const getAllSolicitudes = async (req, res) => {
    try {
        const solicitudes = await SolicitudCita.findAll({
            include: [{
                model: User,
                as: 'cliente',
                attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
            }],
            order: [['id', 'DESC']]
        });
        res.json(solicitudes);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las solicitudes.", error: error.message });
    }
};

// Admin/Empleado: Gestionar una solicitud (Aprobar/Rechazar)
export const gestionarSolicitud = async (req, res) => {
    const { id } = req.params;
    const { estado, observacion_admin, id_empleado_asignado, hora_fin } = req.body;

    if (!estado || (estado !== 'Aprobada' && estado !== 'Rechazada')) {
        return res.status(400).json({ message: "El campo 'estado' es obligatorio y debe ser 'Aprobada' o 'Rechazada'." });
    }

    try {
        const solicitud = await SolicitudCita.findByPk(id, {
            include: [{
                model: User,
                as: 'cliente',
                attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
            }]
        });
        if (!solicitud) {
            return res.status(404).json({ message: "Solicitud no encontrada." });
        }

        if (solicitud.estado !== 'Pendiente') {
            return res.status(400).json({ message: `La solicitud ya ha sido ${solicitud.estado.toLowerCase()}.` });
        }

        solicitud.estado = estado;
        solicitud.observacion_admin = observacion_admin;

        if (estado === 'Aprobada') {
            if (!id_empleado_asignado || !hora_fin) {
                return res.status(400).json({ message: "Para aprobar una cita, se requiere 'id_empleado_asignado' y 'hora_fin'." });
            }

            // Re-validar solapamiento antes de crear la cita
            const existingCita = await Cita.findOne({
                where: {
                    fecha: solicitud.fecha_solicitada,
                    id_empleado: id_empleado_asignado,
                    hora_inicio: { [Op.lt]: hora_fin },
                    hora_fin: { [Op.gt]: solicitud.hora_solicitada }
                }
            });

            if (existingCita) {
                return res.status(400).json({ message: "Conflicto de horario. Ya existe una cita agendada en ese horario para el empleado seleccionado." });
            }

            const nuevaCita = await Cita.create({
                fecha: solicitud.fecha_solicitada,
                hora_inicio: solicitud.hora_solicitada,
                hora_fin: hora_fin, // La hora de fin la define el admin
                tipo: solicitud.tipo,
                modalidad: solicitud.modalidad,
                estado: 'Programada',
                id_cliente: solicitud.id_cliente,
                id_empleado: id_empleado_asignado,
                observacion: solicitud.descripcion
            });
            
            solicitud.id_empleado_asignado = id_empleado_asignado;
            await solicitud.save();

            // Enviar email de aprobación al cliente
            try {
                if (solicitud.cliente && solicitud.cliente.correo) {
                    // Obtener nombre del empleado
                    const empleado = await User.findByPk(id_empleado_asignado);
                    const empleadoNombre = empleado ? `${empleado.nombre} ${empleado.apellido}` : null;

                    console.log('📧 Enviando email de aprobación:', solicitud.cliente.correo);
                    await sendSolicitudCitaAprobada(
                        solicitud.cliente.correo,
                        `${solicitud.cliente.nombre} ${solicitud.cliente.apellido}`,
                        {
                            cita_id: nuevaCita.id_cita,
                            tipo: solicitud.tipo,
                            fecha: solicitud.fecha_solicitada,
                            hora_inicio: solicitud.hora_solicitada,
                            hora_fin: hora_fin,
                            modalidad: solicitud.modalidad,
                            empleado_nombre: empleadoNombre,
                            observacion_admin: observacion_admin || null
                        }
                    );
                    console.log('✅ Email de aprobación enviado');
                }
            } catch (emailError) {
                console.error('❌ Error al enviar email de aprobación:', emailError);
                // No fallar la operación por error de email
            }

            return res.json({ message: "Solicitud aprobada y cita creada exitosamente.", solicitud, cita_creada: nuevaCita });
        } else { // Si es 'Rechazada'
            await solicitud.save();

            // Enviar email de rechazo al cliente
            try {
                if (solicitud.cliente && solicitud.cliente.correo) {
                    console.log('📧 Enviando email de rechazo:', solicitud.cliente.correo);
                    await sendSolicitudCitaRechazada(
                        solicitud.cliente.correo,
                        `${solicitud.cliente.nombre} ${solicitud.cliente.apellido}`,
                        {
                            solicitud_id: solicitud.id,
                            tipo: solicitud.tipo,
                            fecha: solicitud.fecha_solicitada,
                            hora: solicitud.hora_solicitada,
                            modalidad: solicitud.modalidad,
                            observacion_admin: observacion_admin || null
                        }
                    );
                    console.log('✅ Email de rechazo enviado');
                }
            } catch (emailError) {
                console.error('❌ Error al enviar email de rechazo:', emailError);
                // No fallar la operación por error de email
            }

            return res.json({ message: "Solicitud rechazada exitosamente.", solicitud });
        }

    } catch (error) {
        res.status(500).json({ message: "Error al gestionar la solicitud.", error: error.message });
    }
};