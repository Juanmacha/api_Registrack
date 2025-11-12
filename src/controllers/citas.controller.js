import { Op } from "sequelize";
import { Cita, OrdenServicio, Cliente, Servicio } from "../models/associations.js";
import User from "../models/user.js";
import Rol from "../models/Role.js"; // Importar Rol para búsqueda de usuario
import Empleado from "../models/Empleado.js"; // Importar Empleado para validaciones
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

// ✅ Función para actualizar automáticamente citas pasadas a "Finalizada"
const actualizarCitasFinalizadas = async () => {
    try {
        const ahora = new Date();
        const fechaActual = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
        const horaActual = ahora.toTimeString().split(' ')[0]; // HH:MM:SS
        
        // Actualizar citas que ya pasaron su fecha/hora y no están anuladas
        const resultado = await Cita.update(
            { estado: 'Finalizada' },
            {
                where: {
                    estado: {
                        [Op.in]: ['Programada', 'Reprogramada']
                    },
                    [Op.or]: [
                        // Fecha pasada
                        { fecha: { [Op.lt]: fechaActual } },
                        // Fecha hoy pero hora_fin ya pasó
                        {
                            fecha: fechaActual,
                            hora_fin: { [Op.lt]: horaActual }
                        }
                    ]
                }
            }
        );
        
        if (resultado[0] > 0) {
            console.log(`✅ ${resultado[0]} citas actualizadas automáticamente a "Finalizada"`);
        }
    } catch (error) {
        console.error('❌ Error al actualizar citas finalizadas:', error);
    }
};

export const getCitas = async (req, res) => {
    try {
        // ✅ Actualizar automáticamente citas pasadas antes de consultar
        await actualizarCitasFinalizadas();
        
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
            ],
            order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']]
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

// ✅ Función para validar que los datos enviados coincidan con los datos reales del usuario
const validarDatosUsuarioConDocumento = (usuario, datosEnviados) => {
    const discrepancias = [];
    
    // Validar nombre (si se envía)
    if (datosEnviados.nombre && datosEnviados.nombre.trim().toLowerCase() !== usuario.nombre.trim().toLowerCase()) {
        discrepancias.push({
            campo: 'nombre',
            valor_enviado: datosEnviados.nombre,
            valor_real: usuario.nombre,
            mensaje: `El nombre enviado "${datosEnviados.nombre}" no coincide con el nombre registrado "${usuario.nombre}"`
        });
    }
    
    // Validar apellido (si se envía)
    if (datosEnviados.apellido && datosEnviados.apellido.trim().toLowerCase() !== usuario.apellido.trim().toLowerCase()) {
        discrepancias.push({
            campo: 'apellido',
            valor_enviado: datosEnviados.apellido,
            valor_real: usuario.apellido,
            mensaje: `El apellido enviado "${datosEnviados.apellido}" no coincide con el apellido registrado "${usuario.apellido}"`
        });
    }
    
    // Validar correo (si se envía)
    if (datosEnviados.correo && datosEnviados.correo.trim().toLowerCase() !== usuario.correo.trim().toLowerCase()) {
        discrepancias.push({
            campo: 'correo',
            valor_enviado: datosEnviados.correo,
            valor_real: usuario.correo,
            mensaje: `El correo enviado "${datosEnviados.correo}" no coincide con el correo registrado "${usuario.correo}"`
        });
    }
    
    // Validar tipo_documento (si se envía)
    if (datosEnviados.tipo_documento && datosEnviados.tipo_documento.trim() !== usuario.tipo_documento.trim()) {
        discrepancias.push({
            campo: 'tipo_documento',
            valor_enviado: datosEnviados.tipo_documento,
            valor_real: usuario.tipo_documento,
            mensaje: `El tipo de documento enviado "${datosEnviados.tipo_documento}" no coincide con el tipo registrado "${usuario.tipo_documento}"`
        });
    }
    
    // Validar telefono (si se envía y existe en BD)
    if (datosEnviados.telefono && usuario.telefono) {
        // Normalizar teléfonos (remover espacios, guiones, paréntesis)
        const normalizarTelefono = (tel) => tel.replace(/[\s\-\(\)]/g, '');
        const telefonoEnviadoNormalizado = normalizarTelefono(datosEnviados.telefono);
        const telefonoRealNormalizado = normalizarTelefono(usuario.telefono);
        
        if (telefonoEnviadoNormalizado !== telefonoRealNormalizado) {
            discrepancias.push({
                campo: 'telefono',
                valor_enviado: datosEnviados.telefono,
                valor_real: usuario.telefono,
                mensaje: `El teléfono enviado "${datosEnviados.telefono}" no coincide con el teléfono registrado "${usuario.telefono}"`
            });
        }
    }
    
    return discrepancias;
};

// ✅ Función para normalizar tipos de cita (mapea variaciones comunes a valores exactos)
const normalizarTipoCita = (tipo) => {
    if (!tipo || typeof tipo !== 'string') return tipo;
    
    // Convertir a minúsculas y remover espacios/acentos para comparación
    const tipoNormalizado = tipo.trim();
    const tipoLower = tipoNormalizado.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
    
    // Mapeo de variaciones comunes a valores exactos
    const mapeoTipos = {
        // General
        'general': 'General',
        // Búsqueda
        'busqueda': 'Busqueda',
        'busqueda de antecedentes': 'Busqueda',
        'búsqueda': 'Busqueda',
        'búsqueda de antecedentes': 'Busqueda',
        // Ampliación
        'ampliacion': 'Ampliacion',
        'ampliación': 'Ampliacion',
        'ampliacion de alcance': 'Ampliacion',
        'ampliación de alcance': 'Ampliacion',
        // Certificación
        'certificacion': 'Certificacion',
        'certificación': 'Certificacion',
        'certificacion de marca': 'Certificacion',
        'certificación de marca': 'Certificacion',
        // Renovación
        'renovacion': 'Renovacion',
        'renovación': 'Renovacion',
        'renovacion de marca': 'Renovacion',
        'renovación de marca': 'Renovacion',
        // Cesión
        'cesion': 'Cesion',
        'cesión': 'Cesion',
        'cesion de marca': 'Cesion',
        'cesión de marca': 'Cesion',
        // Oposición
        'oposicion': 'Oposicion',
        'oposición': 'Oposicion',
        'presentacion de oposicion': 'Oposicion',
        'presentación de oposición': 'Oposicion',
        // Respuesta de oposición
        'respuesta de oposicion': 'Respuesta de oposicion',
        'respuesta de oposición': 'Respuesta de oposicion',
        'respuesta a oposicion': 'Respuesta de oposicion',
        'respuesta a oposición': 'Respuesta de oposicion',
    };
    
    // Si existe en el mapeo, retornar el valor exacto
    if (mapeoTipos[tipoLower]) {
        return mapeoTipos[tipoLower];
    }
    
    // Si coincide exactamente con un valor permitido, retornarlo tal cual
    const tiposPermitidos = ['General', 'Busqueda', 'Ampliacion', 'Certificacion', 'Renovacion', 'Cesion', 'Oposicion', 'Respuesta de oposicion'];
    if (tiposPermitidos.includes(tipoNormalizado)) {
        return tipoNormalizado;
    }
    
    // Si no coincide, retornar el valor original (será rechazado en la validación)
    return tipoNormalizado;
};

export const createCita = async (req, res) => {
    // ✅ NORMALIZAR TIPO ANTES DE VALIDAR
    let tipoNormalizado = null;
    if (req.body.tipo) {
        tipoNormalizado = normalizarTipoCita(req.body.tipo);
        req.body.tipo = tipoNormalizado; // Actualizar el body con el valor normalizado
    }
    
    const { fecha, hora_inicio, hora_fin, tipo, modalidad, id_cliente, id_empleado, observacion, documento, nombre, apellido, correo, tipo_documento, telefono } = req.body;
    let { estado } = req.body;

    // 1. Field Validation - Modificado para aceptar documento o id_cliente
    const requiredFields = ['fecha', 'hora_inicio', 'hora_fin', 'tipo', 'modalidad', 'id_empleado'];
    const missingFields = [];
    for (const field of requiredFields) {
        if (!req.body[field]) {
            missingFields.push(field);
        }
    }
    
    // Validar que se proporcione id_cliente O documento (no ambos requeridos)
    if (!id_cliente && !documento) {
        missingFields.push('id_cliente o documento');
    }
    
    if (missingFields.length > 0) {
        return res.status(400).json({
            message: "Los siguientes campos son obligatorios:",
            campos_faltantes: missingFields,
            nota: "Debe proporcionar 'id_cliente' o 'documento' (no ambos)"
        });
    }
    
    // ✅ VALIDAR TIPO con mensaje mejorado
    const tiposPermitidos = ['General', 'Busqueda', 'Ampliacion', 'Certificacion', 'Renovacion', 'Cesion', 'Oposicion', 'Respuesta de oposicion'];
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({
            success: false,
            message: "Tipo de cita no válido",
            error: {
                campo: 'tipo',
                valor_recibido: req.body.tipo || tipo,
                valores_permitidos: tiposPermitidos,
                nota: "Los valores deben ser exactamente: " + tiposPermitidos.join(', ')
            }
        });
    }

    // ✅ VALIDAR que id_empleado corresponda a un empleado válido
    const empleado = await Empleado.findByPk(id_empleado, {
        include: [{ model: User, as: 'usuario' }]
    });

    if (!empleado || !empleado.usuario || !empleado.usuario.estado) {
        return res.status(400).json({ 
            message: "El empleado no es válido o está inactivo" 
        });
    }

    // Convertir id_empleado a id_usuario del empleado
    const id_usuario_empleado = empleado.id_usuario;

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
        // ✅ NUEVO: Si se envía documento, buscar el usuario primero
        let clienteId = id_cliente;
        if (documento && !id_cliente) {
            console.log('🔍 Buscando usuario por documento:', documento);
            const usuario = await User.findOne({
                where: { documento: BigInt(documento) }
            });
            
            if (!usuario) {
                return res.status(400).json({ 
                    success: false,
                    message: "No se encontró un usuario con ese documento",
                    documento: documento.toString()
                });
            }
            
            // Verificar que el usuario sea un cliente
            const cliente = await Cliente.findOne({
                where: { id_usuario: usuario.id_usuario }
            });
            
            if (!cliente) {
                return res.status(400).json({ 
                    success: false,
                    message: "El usuario no es un cliente registrado",
                    documento: documento.toString(),
                    id_usuario: usuario.id_usuario
                });
            }
            
            // ✅ VALIDAR INTEGRIDAD DE DATOS: Verificar que los datos enviados coincidan con los datos reales
            const datosEnviados = {
                nombre: nombre || null,
                apellido: apellido || null,
                correo: correo || null,
                tipo_documento: tipo_documento || null,
                telefono: telefono || null
            };
            
            const discrepancias = validarDatosUsuarioConDocumento(usuario, datosEnviados);
            
            if (discrepancias.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Los datos enviados no coinciden con los datos registrados del usuario",
                    documento: documento.toString(),
                    discrepancias: discrepancias,
                    datos_reales: {
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        correo: usuario.correo,
                        tipo_documento: usuario.tipo_documento,
                        telefono: usuario.telefono || null
                    },
                    instrucciones: "Por favor, verifique los datos y vuelva a intentar. Los datos deben coincidir exactamente con los registrados en el sistema."
                });
            }
            
            clienteId = usuario.id_usuario;
            console.log('✅ Usuario encontrado y datos validados:', usuario.nombre, usuario.apellido, 'ID:', clienteId);
        }

        if (!clienteId) {
            return res.status(400).json({ 
                success: false,
                message: "Se requiere id_cliente o documento válido" 
            });
        }

        // ✅ NUEVO: Validar que el cliente no tenga una cita activa en ese horario
        console.log('🔍 Validando citas duplicadas para cliente:', clienteId);
        const citaExistenteCliente = await Cita.findOne({
            where: {
                id_cliente: clienteId,
                fecha: fecha,
                estado: {
                    [Op.in]: ['Programada', 'Reprogramada']
                },
                hora_inicio: {
                    [Op.lt]: hora_fin
                },
                hora_fin: {
                    [Op.gt]: hora_inicio
                }
            }
        });

        if (citaExistenteCliente) {
            console.log('❌ Cita duplicada encontrada:', citaExistenteCliente.id_cita);
            return res.status(400).json({
                success: false,
                message: "El usuario ya tiene una cita activa en ese horario",
                data: {
                    cita_existente: {
                        id_cita: citaExistenteCliente.id_cita,
                        fecha: citaExistenteCliente.fecha,
                        hora_inicio: citaExistenteCliente.hora_inicio,
                        hora_fin: citaExistenteCliente.hora_fin,
                        tipo: citaExistenteCliente.tipo,
                        modalidad: citaExistenteCliente.modalidad,
                        estado: citaExistenteCliente.estado
                    }
                }
            });
        }
        console.log('✅ No se encontraron citas duplicadas para el cliente');

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

        // 4. Overlap Validation (usando id_usuario_empleado)
        console.log("Checking for existing appointments with overlap...");
        const existingCita = await Cita.findOne({
            where: {
                fecha,
                id_empleado: id_usuario_empleado, // ✅ Usar id_usuario
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
            tipo: tipo, // ✅ Usar tipo normalizado
            modalidad,
            estado,
            id_cliente: clienteId, // ✅ Usar clienteId (puede venir de documento o id_cliente)
            id_empleado: id_usuario_empleado, // ✅ Guardar id_usuario
            observacion
        });

        // 📧 Enviar emails de confirmación
        try {
            // Obtener datos del cliente y empleado
            const cliente = await User.findByPk(clienteId); // ✅ Usar clienteId
            const empleadoUser = await User.findByPk(id_usuario_empleado);

            // Email al cliente
            if (cliente && cliente.correo) {
                console.log('📧 Enviando email de cita al cliente:', cliente.correo);
                await sendCitaProgramadaCliente(
                    cliente.correo,
                    `${cliente.nombre} ${cliente.apellido}`,
                    {
                        solicitud_id: null,
                        servicio: tipo,
                        fecha: fecha,
                        hora_inicio: hora_inicio,
                        hora_fin: hora_fin,
                        modalidad: modalidad,
                        empleado_nombre: empleadoUser ? `${empleadoUser.nombre} ${empleadoUser.apellido}` : null,
                        observacion: observacion
                    }
                );
                console.log('✅ Email enviado al cliente');
            }

            // Email al empleado
            if (empleadoUser && empleadoUser.correo) {
                console.log('📧 Enviando email de cita al empleado:', empleadoUser.correo);
                await sendCitaProgramadaEmpleado(
                    empleadoUser.correo,
                    empleadoUser.nombre,
                    {
                        solicitud_id: null,
                        servicio: tipo,
                        cliente_nombre: `${cliente.nombre} ${cliente.apellido}`,
                        cliente_email: cliente.correo,
                        fecha: fecha,
                        hora_inicio: hora_inicio,
                        hora_fin: hora_fin,
                        modalidad: modalidad,
                        observacion: observacion
                    }
                );
                console.log('✅ Email enviado al empleado');
            }
        } catch (emailError) {
            console.error('❌ Error al enviar emails:', emailError);
            // No fallar la operación por error de email
        }

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
        console.error("❌ Error al crear cita:", error);
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

        // Check if the appointment is canceled or finalized
        if (cita.estado === 'Anulada') {
            return res.status(400).json({ message: "No se puede reprogramar una cita que ha sido anulada." });
        }
        
        if (cita.estado === 'Finalizada') {
            return res.status(400).json({ message: "No se puede reprogramar una cita que ya ha sido finalizada." });
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

        // Check if the appointment is already canceled or finalized
        if (cita.estado === 'Anulada') {
            return res.status(400).json({ message: "Esta cita ya ha sido anulada." });
        }
        
        if (cita.estado === 'Finalizada') {
            return res.status(400).json({ message: "No se puede anular una cita que ya ha sido finalizada." });
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

// ✅ Endpoint para marcar cita como finalizada manualmente
export const finalizarCita = async (req, res) => {
    const { id } = req.params;
    
    try {
        const cita = await Cita.findByPk(id);
        if (!cita) {
            return res.status(404).json({ message: "Cita no encontrada." });
        }
        
        // Verificar que la cita no esté anulada
        if (cita.estado === 'Anulada') {
            return res.status(400).json({ message: "No se puede finalizar una cita que ha sido anulada." });
        }
        
        // Verificar que la cita no esté ya finalizada
        if (cita.estado === 'Finalizada') {
            return res.status(400).json({ message: "Esta cita ya ha sido finalizada." });
        }
        
        // Verificar que la fecha/hora ya pasó (opcional, pero recomendado)
        const ahora = new Date();
        const fechaActual = ahora.toISOString().split('T')[0];
        const horaActual = ahora.toTimeString().split(' ')[0];
        const fechaHoraCita = new Date(`${cita.fecha}T${cita.hora_fin}`);
        const fechaHoraActual = new Date(`${fechaActual}T${horaActual}`);
        
        if (fechaHoraCita > fechaHoraActual) {
            return res.status(400).json({ 
                message: "No se puede finalizar una cita que aún no ha terminado. La cita finaliza el " + 
                cita.fecha + " a las " + cita.hora_fin 
            });
        }
        
        cita.estado = 'Finalizada';
        if (req.body.observacion) {
            cita.observacion = req.body.observacion;
        }
        await cita.save();
        
        res.status(200).json({
            success: true,
            message: "Cita marcada como finalizada exitosamente",
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
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Error al finalizar cita:", error);
        res.status(500).json({ message: error.message });
    }
};

// ⚠️ DEPRECATED: Este middleware ya no se usa porque createCita normaliza y valida internamente
// Se mantiene por compatibilidad pero createCita maneja todas las validaciones
export const validateCreateCita = (req, res, next) => {
    // Este middleware ya no valida porque createCita lo hace internamente
    // Solo pasar al siguiente middleware
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

    // 1.1. Validar formato de modalidad
    const modalidadesValidas = ['Virtual', 'Presencial'];
    const modalidadNormalizada = modalidad.trim();
    
    // Corrección automática de typos comunes
    let modalidadCorregida = modalidadNormalizada;
    if (modalidadNormalizada.toLowerCase() === 'virtusl' || 
        modalidadNormalizada.toLowerCase() === 'virtua' ||
        modalidadNormalizada.toLowerCase() === 'virtul') {
      modalidadCorregida = 'Virtual';
      console.log(`⚠️ Modalidad corregida automáticamente: "${modalidadNormalizada}" -> "Virtual"`);
    } else if (modalidadNormalizada.toLowerCase() === 'presencial' ||
               modalidadNormalizada.toLowerCase() === 'presenciall') {
      modalidadCorregida = 'Presencial';
      console.log(`⚠️ Modalidad corregida automáticamente: "${modalidadNormalizada}" -> "Presencial"`);
    }
    
    if (!modalidadesValidas.includes(modalidadCorregida)) {
      return res.status(400).json({ 
        success: false,
        message: `Modalidad inválida: "${modalidadNormalizada}". Los valores permitidos son: ${modalidadesValidas.join(', ')}`,
        valor_recibido: modalidadNormalizada,
        valores_permitidos: modalidadesValidas
      });
    }

    // Usar la modalidad corregida para el resto del proceso
    const modalidadFinal = modalidadCorregida;

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

    // ✅ VALIDAR que id_empleado corresponda a un empleado válido
    let id_usuario_empleado = null;
    if (id_empleado) {
      const empleado = await Empleado.findByPk(id_empleado, {
        include: [{ model: User, as: 'usuario' }]
      });

      if (!empleado || !empleado.usuario || !empleado.usuario.estado) {
        return res.status(400).json({ 
          success: false,
          message: "El empleado no es válido o está inactivo" 
        });
      }

      // Convertir id_empleado a id_usuario del empleado
      id_usuario_empleado = empleado.id_usuario;
    }

    // 6. Validar solapamiento de horarios (usando id_usuario_empleado)
    if (id_usuario_empleado) {
      const existingCita = await Cita.findOne({
        where: {
          fecha,
          id_empleado: id_usuario_empleado, // ✅ Usar id_usuario
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
      modalidad: modalidadFinal, // Usar modalidad corregida
      estado: 'Programada',
      observacion,
      id_cliente: solicitud.cliente.Usuario.id_usuario, // Cliente automático
      id_empleado: id_usuario_empleado, // ✅ Guardar id_usuario del empleado
      id_orden_servicio: idOrdenServicio // ← VINCULAR CON SOLICITUD
    });

    console.log('✅ Cita creada:', nuevaCita.id_cita);

    // 9. Crear seguimiento automático en la solicitud
    await Seguimiento.create({
      id_orden_servicio: idOrdenServicio,
      titulo: 'Cita Programada',
      descripcion: `Cita ${modalidadFinal} programada para ${fecha} de ${hora_inicio} a ${hora_fin}`,
      registrado_por: req.user.id_usuario,
      id_usuario: req.user.id_usuario,
      fecha_registro: new Date()
    });

    console.log('✅ Seguimiento creado');

    // 10. Preparar datos para emails (ANTES de responder)
    const emailData = {
      solicitud: {
        id: idOrdenServicio,
        servicioNombre: solicitud.servicio.nombre,
        cliente: {
          correo: solicitud.cliente?.Usuario?.correo,
          nombre: solicitud.cliente?.Usuario ? `${solicitud.cliente.Usuario.nombre} ${solicitud.cliente.Usuario.apellido}` : null
        }
      },
      empleadoAsignadoSolicitud: null,
      empleadoData: null,
      cita: {
        fecha,
        hora_inicio,
        hora_fin,
        modalidad: modalidadFinal,
        observacion
      }
    };

    // Obtener datos del empleado asignado a la solicitud
    if (solicitud.id_empleado_asignado && solicitud.empleado_asignado && solicitud.empleado_asignado.correo) {
      emailData.empleadoAsignadoSolicitud = {
        id_usuario: solicitud.id_empleado_asignado,
        correo: solicitud.empleado_asignado.correo,
        nombre: `${solicitud.empleado_asignado.nombre} ${solicitud.empleado_asignado.apellido}`
      };
      console.log('👤 [EMAIL] Empleado asignado a la solicitud encontrado:', emailData.empleadoAsignadoSolicitud.nombre);
    } else {
      console.log('⚠️ [EMAIL] No hay empleado asignado a la solicitud o no tiene correo válido');
    }

    // Obtener datos del empleado del body (si se proporcionó uno diferente)
    if (id_usuario_empleado) {
      const empleadoUser = await User.findByPk(id_usuario_empleado);
      if (empleadoUser && empleadoUser.correo) {
        emailData.empleadoData = {
          id_usuario: id_usuario_empleado,
          correo: empleadoUser.correo,
          nombre: `${empleadoUser.nombre} ${empleadoUser.apellido}`
        };
        console.log('👤 [EMAIL] Empleado del body encontrado:', emailData.empleadoData.nombre);
      }
    }

    // Determinar nombre del empleado para el email del cliente
    const empleadoNombreParaCliente = emailData.empleadoData ? emailData.empleadoData.nombre : 
                                     (emailData.empleadoAsignadoSolicitud ? emailData.empleadoAsignadoSolicitud.nombre : null);

    // 11. Retornar respuesta INMEDIATAMENTE (antes de enviar emails)
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

    // 12. Enviar emails de notificación EN BACKGROUND (después de responder)
    // Esto asegura que los emails se envíen incluso si hay timeout en el frontend
    console.log('📧 [EMAIL] Iniciando envío de emails en background...');
    
    // Función asíncrona para enviar emails sin bloquear
    const enviarEmailsBackground = async () => {
      try {
        const inicioTiempo = Date.now();
        console.log('📧 [EMAIL] Iniciando proceso de envío de emails...');

        // Email al cliente
        if (emailData.solicitud.cliente.correo) {
          console.log('📧 [EMAIL] Enviando email al cliente:', emailData.solicitud.cliente.correo);
          const clienteStartTime = Date.now();
          try {
            await sendCitaProgramadaCliente(
              emailData.solicitud.cliente.correo,
              emailData.solicitud.cliente.nombre,
              {
                solicitud_id: idOrdenServicio,
                servicio: emailData.solicitud.servicioNombre,
                fecha: emailData.cita.fecha,
                hora_inicio: emailData.cita.hora_inicio,
                hora_fin: emailData.cita.hora_fin,
                modalidad: emailData.cita.modalidad,
                empleado_nombre: empleadoNombreParaCliente,
                observacion: emailData.cita.observacion
              }
            );
            const clienteTime = Date.now() - clienteStartTime;
            console.log(`✅ [EMAIL] Email enviado al cliente en ${clienteTime}ms`);
          } catch (clienteError) {
            console.error(`❌ [EMAIL] Error al enviar email al cliente:`, clienteError.message);
            console.error(`   Stack:`, clienteError.stack);
          }
        } else {
          console.log('⚠️ [EMAIL] No se pudo obtener correo del cliente');
        }

        // Email al empleado asignado de la solicitud
        if (emailData.empleadoAsignadoSolicitud && emailData.empleadoAsignadoSolicitud.correo) {
          const esMismoEmpleado = emailData.empleadoData && 
                                emailData.empleadoData.id_usuario === emailData.empleadoAsignadoSolicitud.id_usuario;
          
          if (!esMismoEmpleado) {
            console.log('📧 [EMAIL] Enviando email al empleado asignado de la solicitud:', emailData.empleadoAsignadoSolicitud.correo);
            const empleadoSolicitudStartTime = Date.now();
            try {
              await sendCitaProgramadaEmpleado(
                emailData.empleadoAsignadoSolicitud.correo,
                emailData.empleadoAsignadoSolicitud.nombre,
                {
                  solicitud_id: idOrdenServicio,
                  servicio: emailData.solicitud.servicioNombre,
                  cliente_nombre: emailData.solicitud.cliente.nombre,
                  cliente_email: emailData.solicitud.cliente.correo,
                  fecha: emailData.cita.fecha,
                  hora_inicio: emailData.cita.hora_inicio,
                  hora_fin: emailData.cita.hora_fin,
                  modalidad: emailData.cita.modalidad,
                  observacion: emailData.cita.observacion
                }
              );
              const empleadoSolicitudTime = Date.now() - empleadoSolicitudStartTime;
              console.log(`✅ [EMAIL] Email enviado al empleado asignado de la solicitud en ${empleadoSolicitudTime}ms`);
            } catch (empleadoSolicitudError) {
              console.error(`❌ [EMAIL] Error al enviar email al empleado asignado:`, empleadoSolicitudError.message);
              console.error(`   Stack:`, empleadoSolicitudError.stack);
            }
          } else {
            console.log('ℹ️ [EMAIL] Empleado asignado es el mismo que el del body, evitando duplicado');
          }
        }

        // Email al empleado del body si está asignado y es diferente
        if (emailData.empleadoData && emailData.empleadoData.correo) {
          console.log('📧 [EMAIL] Enviando email al empleado del body:', emailData.empleadoData.correo);
          const empleadoBodyStartTime = Date.now();
          try {
            await sendCitaProgramadaEmpleado(
              emailData.empleadoData.correo,
              emailData.empleadoData.nombre,
              {
                solicitud_id: idOrdenServicio,
                servicio: emailData.solicitud.servicioNombre,
                cliente_nombre: emailData.solicitud.cliente.nombre,
                cliente_email: emailData.solicitud.cliente.correo,
                fecha: emailData.cita.fecha,
                hora_inicio: emailData.cita.hora_inicio,
                hora_fin: emailData.cita.hora_fin,
                modalidad: emailData.cita.modalidad,
                observacion: emailData.cita.observacion
              }
            );
            const empleadoBodyTime = Date.now() - empleadoBodyStartTime;
            console.log(`✅ [EMAIL] Email enviado al empleado del body en ${empleadoBodyTime}ms`);
          } catch (empleadoBodyError) {
            console.error(`❌ [EMAIL] Error al enviar email al empleado del body:`, empleadoBodyError.message);
            console.error(`   Stack:`, empleadoBodyError.stack);
          }
        } else if (!emailData.empleadoAsignadoSolicitud) {
          console.log('⚠️ [EMAIL] No hay empleado asignado para enviar email (ni en solicitud ni en body)');
        }

        const tiempoTotal = Date.now() - inicioTiempo;
        console.log(`✅ [EMAIL] Proceso de envío de emails completado en ${tiempoTotal}ms`);
      } catch (emailError) {
        console.error('❌ [EMAIL] Error general en proceso de envío de emails:', emailError);
        console.error('   Mensaje:', emailError.message);
        console.error('   Stack:', emailError.stack);
      }
    };

    // Ejecutar en background sin await (no bloquea la respuesta)
    enviarEmailsBackground().catch(error => {
      console.error('❌ [EMAIL] Error crítico en función de envío background:', error);
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

/**
 * GET /api/gestion-citas/buscar-usuario/:documento
 * Buscar usuario por documento y retornar sus datos para autocompletar
 * Solo Admin/Empleado
 */
export const buscarUsuarioPorDocumento = async (req, res) => {
  try {
    const { documento } = req.params;

    if (!documento) {
      return res.status(400).json({
        success: false,
        message: "El documento es requerido"
      });
    }

    console.log('🔍 Buscando usuario por documento:', documento);

    // Validar que el documento sea numérico
    if (isNaN(documento)) {
      return res.status(400).json({
        success: false,
        message: "El documento debe ser un número válido",
        documento: documento
      });
    }

    // Buscar usuario por documento
    // Nota: Si la relación 'rol' no está disponible, se obtendrá el rol por separado
    const usuario = await User.findOne({
      where: { documento: BigInt(documento) }
    });
    
    // Obtener el rol del usuario si existe
    let rolUsuario = null;
    if (usuario) {
      try {
        rolUsuario = await Rol.findByPk(usuario.id_rol);
      } catch (rolError) {
        console.warn('⚠️ No se pudo obtener el rol del usuario:', rolError.message);
      }
    }

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con ese documento",
        documento: documento
      });
    }

    console.log('✅ Usuario encontrado:', usuario.nombre, usuario.apellido);

    // Verificar si es un cliente
    const cliente = await Cliente.findOne({
      where: { id_usuario: usuario.id_usuario }
    });

    if (!cliente) {
      return res.status(400).json({
        success: false,
        message: "El usuario no es un cliente registrado",
        documento: documento,
        id_usuario: usuario.id_usuario,
        rol: rolUsuario?.nombre || 'No definido'
      });
    }

    console.log('✅ Cliente encontrado:', cliente.id_cliente);

    // Buscar citas activas del usuario
    const citasActivas = await Cita.findAll({
      where: {
        id_cliente: usuario.id_usuario,
        estado: {
          [Op.in]: ['Programada', 'Reprogramada']
        }
      },
      order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']],
      limit: 10
    });

    console.log('📅 Citas activas encontradas:', citasActivas.length);

    res.json({
      success: true,
      data: {
        usuario: {
          id_usuario: usuario.id_usuario,
          tipo_documento: usuario.tipo_documento,
          documento: usuario.documento.toString(),
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono || null,
          id_rol: usuario.id_rol,
          rol: rolUsuario?.nombre || null,
          estado: usuario.estado
        },
        cliente: {
          id_cliente: cliente.id_cliente,
          tipo_persona: cliente.tipo_persona,
          estado: cliente.estado
        },
        tiene_citas_activas: citasActivas.length > 0,
        citas_activas: citasActivas.map(cita => ({
          id_cita: cita.id_cita,
          fecha: cita.fecha,
          hora_inicio: cita.hora_inicio,
          hora_fin: cita.hora_fin,
          tipo: cita.tipo,
          modalidad: cita.modalidad,
          estado: cita.estado,
          observacion: cita.observacion
        }))
      },
      meta: {
        timestamp: new Date().toISOString(),
        total_citas_activas: citasActivas.length
      }
    });
  } catch (error) {
    console.error('❌ Error al buscar usuario por documento:', error);
    res.status(500).json({
      success: false,
      message: "Error al buscar usuario",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};