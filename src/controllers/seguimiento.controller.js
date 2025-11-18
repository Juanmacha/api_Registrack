import { SeguimientoService } from "../services/seguimiento.service.js";
import Seguimiento from "../models/Seguimiento.js";
import DetalleOrdenServicio from "../models/DetalleOrdenServicio.js";
import OrdenServicio from "../models/OrdenServicio.js";
import Servicio from "../models/Servicio.js";
import Proceso from "../models/Proceso.js";
import Cliente from "../models/Cliente.js";
import User from "../models/user.js";
import { sendCambioEstadoCliente } from "../services/email.service.js";
import archiver from "archiver";

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

// 🚀 NUEVA FUNCIÓN: Obtener seguimientos de una solicitud (para clientes)
export const obtenerSeguimientosCliente = async (req, res) => {
  try {
    const { idOrdenServicio } = req.params;
    
    // Verificar que el usuario es cliente
    if (req.user.rol !== "cliente") {
      return res.status(403).json({
        success: false,
        mensaje: "Este endpoint es exclusivo para clientes"
      });
    }
    
    // Buscar el cliente asociado al usuario
    const cliente = await Cliente.findOne({
      where: { id_usuario: req.user.id_usuario }
    });
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        mensaje: "Cliente no encontrado"
      });
    }
    
    // Verificar que la orden de servicio pertenece al cliente
    const ordenServicio = await OrdenServicio.findByPk(idOrdenServicio, {
      include: [{
        model: Cliente,
        as: 'cliente',
        attributes: ['id_cliente']
      }]
    });
    
    if (!ordenServicio) {
      return res.status(404).json({
        success: false,
        mensaje: "Orden de servicio no encontrada"
      });
    }
    
    if (ordenServicio.id_cliente !== cliente.id_cliente) {
      return res.status(403).json({
        success: false,
        mensaje: "No tienes permisos para ver los seguimientos de esta solicitud"
      });
    }
    
    // Obtener los seguimientos de la orden
    const seguimientos = await seguimientoService.obtenerHistorialSeguimiento(idOrdenServicio);
    
    res.json({
      success: true,
      data: seguimientos
    });
    
  } catch (error) {
    console.error("Error al obtener seguimientos para cliente:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor"
    });
  }
};

// 🚀 NUEVA FUNCIÓN: Descargar archivos adjuntos de un seguimiento
export const descargarArchivosSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📦 [API] Descargando archivos de seguimiento ID:', id);
    
    // Obtener el seguimiento con todas las relaciones
    const seguimiento = await Seguimiento.findByPk(id, {
      include: [
        {
          model: OrdenServicio,
          as: 'orden_servicio',
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
                attributes: ['id_usuario', 'nombre', 'apellido']
              }]
            }
          ]
        },
        {
          model: User,
          as: 'usuario_registro',
          attributes: ['nombre', 'apellido', 'correo']
        }
      ]
    });
    
    if (!seguimiento) {
      return res.status(404).json({
        success: false,
        mensaje: "Seguimiento no encontrado"
      });
    }
    
    // Verificar que el seguimiento tiene documentos adjuntos
    if (!seguimiento.documentos_adjuntos) {
      return res.status(404).json({
        success: false,
        mensaje: "Este seguimiento no tiene archivos adjuntos"
      });
    }
    
    // Función auxiliar para extraer Base64 y tipo MIME
    const extraerBase64YExtension = (base64String) => {
      if (!base64String || typeof base64String !== 'string') return null;
      
      if (base64String.includes('data:')) {
        const match = base64String.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const extensionMap = {
            'application/pdf': 'pdf',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/gif': 'gif',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
          };
          const extension = extensionMap[mimeType] || 'bin';
          return { base64Data, extension, mimeType };
        }
      }
      
      return { base64Data: base64String, extension: 'pdf', mimeType: 'application/pdf' };
    };
    
    // Función auxiliar para convertir Base64 a Buffer
    const base64ToBuffer = (base64String) => {
      try {
        const { base64Data } = extraerBase64YExtension(base64String) || { base64Data: base64String };
        return Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error('❌ Error al convertir Base64 a Buffer:', error);
        return null;
      }
    };
    
    // Procesar documentos adjuntos
    let documentosAdjuntos;
    try {
      // Intentar parsear como JSON
      documentosAdjuntos = typeof seguimiento.documentos_adjuntos === 'string' 
        ? JSON.parse(seguimiento.documentos_adjuntos)
        : seguimiento.documentos_adjuntos;
    } catch (error) {
      // Si no es JSON, tratar como string simple (URL o texto)
      documentosAdjuntos = { archivo: seguimiento.documentos_adjuntos };
    }
    
    // Recopilar archivos
    const archivos = [];
    const nombreBase = `SEG-${seguimiento.id_seguimiento}`;
    const nombreCarpeta = `${nombreBase}_${seguimiento.titulo?.substring(0, 30) || 'seguimiento'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    // Si es un objeto, iterar sobre sus propiedades
    if (typeof documentosAdjuntos === 'object' && documentosAdjuntos !== null) {
      Object.keys(documentosAdjuntos).forEach((key, index) => {
        const valor = documentosAdjuntos[key];
        if (valor) {
          // Si es una URL, no podemos descargarla directamente sin hacer una petición HTTP
          // Por ahora, solo procesamos Base64
          if (typeof valor === 'string' && (valor.startsWith('data:') || valor.length > 100)) {
            const infoArchivo = extraerBase64YExtension(valor);
            if (infoArchivo) {
              const buffer = base64ToBuffer(valor);
              if (buffer) {
                const nombreArchivo = `${String(index + 1).padStart(2, '0')}_${key}.${infoArchivo.extension}`;
                archivos.push({
                  nombre: nombreArchivo,
                  buffer: buffer,
                  tamaño: buffer.length
                });
                console.log(`✅ Archivo agregado: ${nombreArchivo} (${(buffer.length / 1024).toFixed(2)} KB)`);
              }
            }
          } else if (typeof valor === 'string' && valor.startsWith('http')) {
            // Si es una URL, crear un archivo de texto con la URL
            archivos.push({
              nombre: `${String(index + 1).padStart(2, '0')}_${key}_url.txt`,
              buffer: Buffer.from(`URL del archivo: ${valor}`, 'utf-8'),
              tamaño: valor.length
            });
          }
        }
      });
    } else if (typeof documentosAdjuntos === 'string') {
      // Si es un string directo, intentar procesarlo como Base64 o URL
      if (documentosAdjuntos.startsWith('data:') || documentosAdjuntos.length > 100) {
        const infoArchivo = extraerBase64YExtension(documentosAdjuntos);
        if (infoArchivo) {
          const buffer = base64ToBuffer(documentosAdjuntos);
          if (buffer) {
            archivos.push({
              nombre: `01_archivo.${infoArchivo.extension}`,
              buffer: buffer,
              tamaño: buffer.length
            });
          }
        }
      } else if (documentosAdjuntos.startsWith('http')) {
        archivos.push({
          nombre: '01_archivo_url.txt',
          buffer: Buffer.from(`URL del archivo: ${documentosAdjuntos}`, 'utf-8'),
          tamaño: documentosAdjuntos.length
        });
      }
    }
    
    // Si no hay archivos, retornar error
    if (archivos.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "No se encontraron archivos válidos en este seguimiento",
        detalles: "Los documentos adjuntos pueden estar en formato URL o no ser procesables"
      });
    }
    
    // Crear archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    // Configurar headers de respuesta
    const nombreZip = `${nombreCarpeta}_archivos.zip`;
    res.attachment(nombreZip);
    res.setHeader('Content-Type', 'application/zip');
    
    // Pipe del archivo ZIP a la respuesta
    archive.pipe(res);
    
    // Agregar cada archivo al ZIP
    archivos.forEach(archivo => {
      archive.append(archivo.buffer, { name: archivo.nombre });
    });
    
    // Agregar un archivo README con información del seguimiento
    const readmeContent = `
ARCHIVOS DEL SEGUIMIENTO
========================

ID Seguimiento: ${seguimiento.id_seguimiento}
Título: ${seguimiento.titulo || 'N/A'}
Fecha de Registro: ${seguimiento.fecha_registro || 'N/A'}
Registrado por: ${seguimiento.usuario_registro ? `${seguimiento.usuario_registro.nombre} ${seguimiento.usuario_registro.apellido}` : 'N/A'}

Orden de Servicio: ${seguimiento.orden_servicio?.numero_expediente || seguimiento.id_orden_servicio}
Servicio: ${seguimiento.orden_servicio?.servicio?.nombre || 'N/A'}
Cliente: ${seguimiento.orden_servicio?.cliente?.Usuario ? `${seguimiento.orden_servicio.cliente.Usuario.nombre} ${seguimiento.orden_servicio.cliente.Usuario.apellido}` : 'N/A'}

Descripción: ${seguimiento.descripcion || 'Sin descripción'}

ARCHIVOS INCLUIDOS:
${archivos.map((a, i) => `${i + 1}. ${a.nombre} (${(a.tamaño / 1024).toFixed(2)} KB)`).join('\n')}

Total de archivos: ${archivos.length}
Fecha de descarga: ${new Date().toLocaleString('es-CO')}
    `.trim();
    
    archive.append(readmeContent, { name: 'README.txt' });
    
    // Finalizar el archivo ZIP
    await archive.finalize();
    
    console.log(`✅ [API] ZIP creado exitosamente: ${nombreZip} (${archivos.length} archivos)`);
    
  } catch (error) {
    console.error("❌ [API] Error al descargar archivos de seguimiento:", error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        mensaje: "Error al generar archivo ZIP",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor"
      });
    }
  }
};
