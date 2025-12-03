import Archivo from "../models/Archivo.js";
import TipoArchivo from "../models/TipoArchivo.js";
import Cliente from "../models/Cliente.js";
import OrdenServicio from "../models/OrdenServicio.js";
import User from "../models/user.js";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_MESSAGES,
  ERROR_CODES 
} from "../constants/messages.js";
import {
  sendArchivoSubidoCliente,
  sendArchivoSubidoEmpleado
} from "../services/email.service.js";

export const upload = async (req, res) => {
  try {
    const { url_archivo, id_tipo_archivo, id_cliente, id_orden_servicio } = req.body;
    
    // Validar campos requeridos
    if (!url_archivo || !id_tipo_archivo || !id_cliente) {
      return res.status(400).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.FILE.REQUIRED_FIELDS,
          code: ERROR_CODES.REQUIRED_FIELD,
          details: { 
            missingFields: [
              !url_archivo ? 'url_archivo' : null,
              !id_tipo_archivo ? 'id_tipo_archivo' : null,
              !id_cliente ? 'id_cliente' : null
            ].filter(Boolean)
          },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Validar formato de URL
    if (url_archivo.length < 5) {
      return res.status(400).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.FILE.INVALID_URL,
          code: ERROR_CODES.INVALID_URL,
          details: { field: "url_archivo", value: url_archivo },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Verificar que el tipo de archivo existe
    const tipo = await TipoArchivo.findByPk(id_tipo_archivo);
    if (!tipo) {
      return res.status(404).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.FILE.INVALID_FILE_TYPE_ID,
          code: ERROR_CODES.FILE_NOT_FOUND,
          details: { id: id_tipo_archivo },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Verificar que el cliente existe
    const cliente = await Cliente.findByPk(id_cliente);
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.FILE.INVALID_CLIENT_ID,
          code: ERROR_CODES.CLIENT_NOT_FOUND,
          details: { id: id_cliente },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Verificar que la orden de servicio existe (si se proporciona)
    if (id_orden_servicio) {
      const orden = await OrdenServicio.findByPk(id_orden_servicio);
      if (!orden) {
        return res.status(404).json({
          success: false,
          error: {
            message: VALIDATION_MESSAGES.FILE.INVALID_ORDER_ID,
            code: ERROR_CODES.ORDER_NOT_FOUND,
            details: { id: id_orden_servicio },
            timestamp: new Date().toISOString()
          }
        });
      }
    }
    
    const creado = await Archivo.create({ 
      url_archivo, 
      id_tipo_archivo, 
      id_cliente, 
      id_orden_servicio 
    });

    // Enviar emails de notificación de subida de archivo
    try {
      // Obtener información del cliente y su usuario
      const clienteCompleto = await Cliente.findByPk(id_cliente);
      let clienteUser = null;
      if (clienteCompleto && clienteCompleto.id_usuario) {
        clienteUser = await User.findByPk(clienteCompleto.id_usuario);
      }

      // Obtener información de la orden de servicio si existe
      let ordenCompleta = null;
      let empleadoAsignado = null;
      if (id_orden_servicio) {
        ordenCompleta = await OrdenServicio.findByPk(id_orden_servicio);

        // Obtener empleado asignado si existe
        if (ordenCompleta && ordenCompleta.id_empleado_asignado) {
          empleadoAsignado = await User.findByPk(ordenCompleta.id_empleado_asignado);
        }
      }

      // Email al cliente
      if (clienteUser && clienteUser.correo) {
        await sendArchivoSubidoCliente(
          clienteUser.correo,
          `${clienteUser.nombre} ${clienteUser.apellido}`,
          {
            tipo_archivo: tipo.descripcion,
            descripcion: req.body.descripcion || 'Archivo subido',
            orden_id: id_orden_servicio || null
          }
        );
        console.log('✅ Email de archivo subido enviado al cliente:', clienteUser.correo);
      }

      // Email al empleado asignado (si existe orden y empleado)
      if (empleadoAsignado && empleadoAsignado.correo && ordenCompleta) {
        await sendArchivoSubidoEmpleado(
          empleadoAsignado.correo,
          `${empleadoAsignado.nombre} ${empleadoAsignado.apellido}`,
          {
            tipo_archivo: tipo.descripcion,
            descripcion: req.body.descripcion || 'Archivo subido',
            orden_id: id_orden_servicio,
            cliente_nombre: clienteUser ? 
              `${clienteUser.nombre} ${clienteUser.apellido}` : 
              'No asignado'
          }
        );
        console.log('✅ Email de archivo subido enviado al empleado:', empleadoAsignado.correo);
      }
    } catch (emailError) {
      console.error('❌ Error al enviar emails de archivo subido:', emailError);
      // No fallar la operación por error de email
    }
    
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.FILE_UPLOADED,
      data: {
        archivo: {
          id_archivo: creado.id_archivo,
          url_archivo: creado.url_archivo,
          id_tipo_archivo: creado.id_tipo_archivo,
          id_cliente: creado.id_cliente,
          id_orden_servicio: creado.id_orden_servicio,
          fecha_subida: creado.fecha_subida || new Date().toISOString()
        },
        tipo_archivo: {
          id_tipo_archivo: tipo.id_tipo_archivo,
          descripcion: tipo.descripcion
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        nextSteps: [
          "El archivo ha sido registrado exitosamente",
          "Puede descargar el archivo usando el ID proporcionado",
          "El archivo está asociado al cliente y tipo especificados"
        ]
      }
    });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.FILE_UPLOAD_ERROR,
        code: ERROR_CODES.FILE_UPLOAD_ERROR,
        details: process.env.NODE_ENV === "development" ? err.message : "Error al registrar archivo",
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const download = async (req, res) => {
  try {
    const archivo = await Archivo.findByPk(req.params.id);
    
    if (!archivo) {
      return res.status(404).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.FILE.FILE_NOT_FOUND,
          code: ERROR_CODES.FILE_NOT_FOUND,
          details: { id: req.params.id },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.FILE_FOUND,
      data: {
        archivo: {
          id_archivo: archivo.id_archivo,
          url_archivo: archivo.url_archivo,
          id_tipo_archivo: archivo.id_tipo_archivo,
          id_cliente: archivo.id_cliente,
          id_orden_servicio: archivo.id_orden_servicio,
          fecha_subida: archivo.fecha_subida
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        instructions: [
          "Use la URL proporcionada para descargar el archivo",
          "Verifique que el archivo esté accesible antes de usarlo",
          "El archivo puede tener restricciones de acceso"
        ]
      }
    });
  } catch (err) {
    console.error("Error al obtener archivo:", err);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.FILE_DOWNLOAD_ERROR,
        code: ERROR_CODES.FILE_DOWNLOAD_ERROR,
        details: process.env.NODE_ENV === "development" ? err.message : "Error al obtener archivo",
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const listByCliente = async (req, res) => {
  try {
    const { idCliente } = req.params;
    
    // Validar ID del cliente
    if (!idCliente || isNaN(parseInt(idCliente))) {
      return res.status(400).json({
        success: false,
        error: {
          message: "El ID del cliente debe ser un número válido",
          code: ERROR_CODES.INVALID_ID,
          details: { field: "idCliente", value: idCliente },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    const archivos = await Archivo.findAll({ 
      where: { id_cliente: parseInt(idCliente) },
      include: [
        { model: TipoArchivo, as: 'tipo' }
      ]
    });
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.FILES_FOUND,
      data: {
        archivos: archivos.map(archivo => ({
          id_archivo: archivo.id_archivo,
          url_archivo: archivo.url_archivo,
          id_tipo_archivo: archivo.id_tipo_archivo,
          id_cliente: archivo.id_cliente,
          id_orden_servicio: archivo.id_orden_servicio,
          fecha_subida: archivo.fecha_subida,
          tipo_archivo: archivo.tipo ? {
            descripcion: archivo.tipo.descripcion
          } : null
        })),
        total: archivos.length,
        id_cliente: parseInt(idCliente)
      },
      meta: {
        timestamp: new Date().toISOString(),
        filters: {
          available: "Use query parameters para filtrar por tipo de archivo, fecha, etc."
        }
      }
    });
  } catch (err) {
    console.error("Error al listar archivos:", err);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? err.message : "Error al listar archivos",
        timestamp: new Date().toISOString()
      }
    });
  }
};


