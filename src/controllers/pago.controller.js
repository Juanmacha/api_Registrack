import { PagoService } from "../services/pago.service.js";
import { PagoRepository } from "../repositories/pago.repository.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

/**
 * ✅ VALIDACIÓN DE MONTO: Validar rangos y precisión decimal
 * @param {number|string} monto - Monto a validar
 * @returns {object} { esValido: boolean, monto: number, error?: string }
 */
const validarMonto = (monto) => {
  // Validar que el monto sea un número válido
  const montoNum = parseFloat(monto);
  
  if (isNaN(montoNum)) {
    return {
      esValido: false,
      monto: null,
      error: 'El monto debe ser un número válido'
    };
  }
  
  // Validar que sea positivo
  if (montoNum <= 0) {
    return {
      esValido: false,
      monto: montoNum,
      error: 'El monto debe ser un número positivo mayor a 0'
    };
  }
  
  // Validar límite máximo (1 billón)
  if (montoNum > 1000000000) {
    return {
      esValido: false,
      monto: montoNum,
      error: `El monto excede el límite permitido de $1,000,000,000 (1 billón). Monto recibido: $${montoNum.toLocaleString()}`
    };
  }
  
  // Validar precisión decimal (máximo 2 decimales)
  const montoStr = montoNum.toString();
  const partes = montoStr.split('.');
  
  if (partes.length > 1 && partes[1].length > 2) {
    return {
      esValido: false,
      monto: montoNum,
      error: 'El monto debe tener máximo 2 decimales. Ejemplo válido: 50000.00 o 50000'
    };
  }
  
  return {
    esValido: true,
    monto: montoNum
  };
};

/**
 * ✅ VALIDACIÓN DE RELACIÓN FOREIGN KEY: Verificar que la orden de servicio exista
 * @param {number|string} idOrdenServicio - ID de la orden de servicio
 * @returns {Promise<object>} { esValida: boolean, ordenServicio?: object, error?: string }
 */
const validarOrdenServicio = async (idOrdenServicio) => {
  try {
    const idOrden = parseInt(idOrdenServicio);
    
    if (isNaN(idOrden) || idOrden <= 0) {
      return {
        esValida: false,
        ordenServicio: null,
        error: 'El ID de la orden de servicio debe ser un número válido mayor a 0'
      };
    }
    
    const ordenServicio = await PagoRepository.getOrdenServicioById(idOrden);
    
    if (!ordenServicio) {
      return {
        esValida: false,
        ordenServicio: null,
        error: `Orden de servicio no encontrada con ID: ${idOrden}`
      };
    }
    
    // Verificar que la orden esté activa (no anulada ni finalizada prematuramente)
    if (ordenServicio.estado === 'Anulado') {
      return {
        esValida: false,
        ordenServicio: ordenServicio,
        error: `No se puede procesar un pago para una orden de servicio anulada (ID: ${idOrden})`
      };
    }
    
    return {
      esValida: true,
      ordenServicio: ordenServicio
    };
  } catch (error) {
    return {
      esValida: false,
      ordenServicio: null,
      error: `Error al validar orden de servicio: ${error.message}`
    };
  }
};

export const PagoController = {
  async getAll(req, res) {
    try {
      // ✅ VALIDAR PROPIEDAD: Si es cliente, solo puede ver sus propios pagos
      let pagos;
      if (req.user.rol === 'cliente') {
        // Buscar el cliente asociado al usuario
        const Cliente = (await import("../models/Cliente.js")).default;
        const cliente = await Cliente.findOne({
          where: { id_usuario: req.user.id_usuario }
        });
        
        if (!cliente) {
          return res.json([]); // No hay cliente asociado, retornar array vacío
        }
        
        // Filtrar pagos por cliente
        const todosPagos = await PagoService.listarPagosConDetalles();
        pagos = todosPagos.filter(pago => pago.id_cliente === cliente.id_cliente);
      } else {
        // Admin/empleado: ver todos los pagos
        pagos = await PagoService.listarPagosConDetalles();
      }
      
      // Formatear respuesta para mejor estructura
      const pagosFormateados = pagos.map(pago => ({
        pago: {
          id_pago: pago.id_pago,
          monto_pagado: parseFloat(pago.monto_pagado),
          metodo_pago: pago.metodo_pago,
          estado: pago.estado_pago,
          fecha_pago: pago.fecha_pago,
          transaction_id: pago.transaction_id,
          gateway: pago.gateway,
          comprobante_url: pago.comprobante_url,
          numero_comprobante: pago.numero_comprobante,
          verified_at: pago.verified_at,
          verification_method: pago.verification_method,
          created_at: pago.created_at,
          updated_at: pago.updated_at
        },
        solicitud: {
          id_orden_servicio: pago.id_orden_servicio,
          numero_expediente: pago.numero_expediente,
          fecha_creacion: pago.fecha_creacion_solicitud,
          estado: pago.estado_solicitud,
          total_orden_servicio: parseFloat(pago.total_orden_servicio),
          pais: pago.pais,
          ciudad: pago.ciudad,
          codigo_postal: pago.codigo_postal,
          nombre_completo: pago.nombrecompleto,
          correo: pago.correoelectronico,
          telefono: pago.telefono_solicitud
        },
        servicio: {
          id_servicio: pago.id_servicio,
          nombre: pago.nombre_servicio,
          descripcion: pago.descripcion_servicio,
          precio_base: parseFloat(pago.precio_base_servicio)
        },
        usuario: {
          id_usuario: pago.id_usuario,
          nombre: pago.nombre_usuario,
          apellido: pago.apellido_usuario,
          correo: pago.correo_usuario,
          telefono: pago.telefono_usuario,
          tipo_documento: pago.tipo_documento_usuario,
          documento: pago.documento_usuario
        },
        cliente: {
          id_cliente: pago.id_cliente,
          marca: pago.marca,
          tipo_persona: pago.tipo_persona
        },
        empresa: pago.id_empresa ? {
          id_empresa: pago.id_empresa,
          nombre: pago.nombre_empresa,
          nit: pago.nit_empresa,
          tipo_empresa: pago.tipo_empresa
        } : null
      }));
      
      res.json(pagosFormateados);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      
      // ✅ NUEVO: Usar método con detalles para incluir información completa
      const pago = await PagoService.obtenerPagoConDetalles(id);
      if (!pago) return res.status(404).json({ message: "Pago no encontrado" });
      
      // ✅ VALIDAR PROPIEDAD: Si es cliente, solo puede ver sus propios pagos
      if (req.user.rol === 'cliente') {
        // Buscar el cliente asociado al usuario
        const Cliente = (await import("../models/Cliente.js")).default;
        const cliente = await Cliente.findOne({
          where: { id_usuario: req.user.id_usuario }
        });
        
        if (!cliente || pago.id_cliente !== cliente.id_cliente) {
          return res.status(403).json({ 
            success: false,
            mensaje: "No tienes permiso para ver este pago",
            error: {
              code: 'PERMISSION_DENIED',
              details: 'Solo puedes ver tus propios pagos'
            }
          });
        }
      }
      
      // Formatear respuesta para mejor estructura
      const pagoFormateado = {
        pago: {
          id_pago: pago.id_pago,
          monto_pagado: parseFloat(pago.monto_pagado),
          metodo_pago: pago.metodo_pago,
          estado: pago.estado_pago,
          fecha_pago: pago.fecha_pago,
          transaction_id: pago.transaction_id,
          gateway: pago.gateway,
          comprobante_url: pago.comprobante_url,
          numero_comprobante: pago.numero_comprobante,
          verified_at: pago.verified_at,
          verification_method: pago.verification_method
        },
        solicitud: {
          id_orden_servicio: pago.id_orden_servicio,
          numero_expediente: pago.numero_expediente,
          fecha_creacion: pago.fecha_creacion_solicitud,
          estado: pago.estado_solicitud,
          total_orden_servicio: parseFloat(pago.total_orden_servicio),
          pais: pago.pais,
          ciudad: pago.ciudad,
          codigo_postal: pago.codigo_postal,
          nombre_completo: pago.nombrecompleto,
          correo: pago.correoelectronico,
          telefono: pago.telefono_solicitud
        },
        servicio: {
          id_servicio: pago.id_servicio,
          nombre: pago.nombre_servicio,
          descripcion: pago.descripcion_servicio,
          precio_base: parseFloat(pago.precio_base_servicio)
        },
        usuario: {
          id_usuario: pago.id_usuario,
          nombre: pago.nombre_usuario,
          apellido: pago.apellido_usuario,
          correo: pago.correo_usuario,
          telefono: pago.telefono_usuario,
          tipo_documento: pago.tipo_documento_usuario,
          documento: pago.documento_usuario
        },
        cliente: {
          id_cliente: pago.id_cliente,
          marca: pago.marca,
          tipo_persona: pago.tipo_persona
        },
        empresa: pago.id_empresa ? {
          id_empresa: pago.id_empresa,
          nombre: pago.nombre_empresa,
          nit: pago.nit_empresa,
          tipo_empresa: pago.tipo_empresa
        } : null
      };
      
      res.json(pagoFormateado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const { monto, id_orden_servicio } = req.body;
      
      // ✅ VALIDAR MONTO
      if (monto !== undefined && monto !== null) {
        const validacionMonto = validarMonto(monto);
        if (!validacionMonto.esValido) {
          return res.status(400).json({
            success: false,
            error: {
              message: validacionMonto.error,
              code: 'VALIDATION_ERROR',
              details: { field: 'monto', value: monto },
              timestamp: new Date().toISOString()
            }
          });
        }
      }
      
      // ✅ VALIDAR RELACIÓN FOREIGN KEY: Verificar que la orden de servicio exista
      if (id_orden_servicio) {
        const validacionOrden = await validarOrdenServicio(id_orden_servicio);
        if (!validacionOrden.esValida) {
          return res.status(400).json({
            success: false,
            error: {
              message: validacionOrden.error,
              code: 'FOREIGN_KEY_ERROR',
              details: { field: 'id_orden_servicio', value: id_orden_servicio },
              timestamp: new Date().toISOString()
            }
          });
        }
      }
      
      const pago = await PagoService.crearPago(req.body);
      res.status(201).json(pago);
    } catch (err) {
      console.error('Error en create pago:', err);
      res.status(400).json({ 
        success: false,
        error: {
          message: err.message,
          code: 'CREATION_ERROR',
          timestamp: new Date().toISOString()
        }
      });
    }
  },

  // 📌 Mantener: Reporte general de pagos (Excel)
  async descargarReporteGeneral(req, res) {
    try {
      const pagos = await PagoService.listarPagos();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Pagos");

      worksheet.columns = [
        { header: "ID", key: "id_pago", width: 10 },
        { header: "Monto", key: "monto", width: 15 },
        { header: "Método de Pago", key: "metodo_pago", width: 20 },
        { header: "Estado", key: "estado", width: 15 },
        { header: "Comprobante", key: "comprobante_url", width: 30 },
        { header: "Orden de Servicio", key: "id_orden_servicio", width: 20 },
      ];

      pagos.forEach((p) => worksheet.addRow(p));

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center" };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=reporte_pagos.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // 📌 Nuevo: Comprobante de pago específico (PDF)
  async generarComprobante(req, res) {
    try {
      const { id } = req.params; // ID ya validado por validateId middleware
      const pago = await PagoService.obtenerPago(id);

      if (!pago) return res.status(404).json({ message: "Pago no encontrado" });

      const doc = new PDFDocument();

      // Config headers para descargar
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=comprobante_pago_${id}.pdf`
      );

      // Enviar directo como stream
      doc.pipe(res);

      // Contenido del comprobante
      doc.fontSize(18).text("Comprobante de Pago", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`ID Pago: ${pago.id_pago}`);
      doc.text(`Monto: $${pago.monto}`);
      doc.text(`Método de Pago: ${pago.metodo_pago}`);
      doc.text(`Estado: ${pago.estado}`);
      doc.text(`Orden de Servicio: ${pago.id_orden_servicio}`);
      doc.text(`Fecha: ${new Date().toLocaleString()}`);

      doc.moveDown();
      doc.text("Gracias por su pago.", { align: "center" });

      doc.end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * ✅ NUEVO: Procesar pago con mock
   * Incluye información completa de la solicitud, servicio, usuario y precios reales
   */
  async procesarPagoMock(req, res) {
    try {
      const { monto, metodo_pago, id_orden_servicio } = req.body;
      const usuarioQuePago = req.user; // Usuario autenticado que realiza el pago

      if (!metodo_pago || !id_orden_servicio) {
        return res.status(400).json({ 
          success: false,
          error: "Datos incompletos. Requiere: metodo_pago, id_orden_servicio (monto es opcional, se toma del servicio)" 
        });
      }

      // ✅ VALIDAR RELACIÓN FOREIGN KEY: Verificar que la orden de servicio exista
      const validacionOrden = await validarOrdenServicio(id_orden_servicio);
      if (!validacionOrden.esValida) {
        return res.status(400).json({
          success: false,
          error: {
            message: validacionOrden.error,
            code: 'FOREIGN_KEY_ERROR',
            details: { field: 'id_orden_servicio', value: id_orden_servicio },
            timestamp: new Date().toISOString()
          }
        });
      }
      
      const ordenServicio = validacionOrden.ordenServicio;

      // ✅ Obtener precio del servicio (precio_base_servicio o total_estimado)
      const precioBaseServicio = parseFloat(ordenServicio.precio_base_servicio || 0);
      const totalEstimado = parseFloat(ordenServicio.total_estimado || 0);
      
      // ✅ Preferir precio_base_servicio si está disponible, sino usar total_estimado
      const precioServicio = precioBaseServicio > 0 ? precioBaseServicio : totalEstimado;

      // ✅ VALIDAR MONTO: Si se envía monto, validar formato, rango y precisión
      let montoFinal;
      if (monto !== undefined && monto !== null) {
        const validacionMonto = validarMonto(monto);
        if (!validacionMonto.esValido) {
          return res.status(400).json({
            success: false,
            error: {
              message: validacionMonto.error,
              code: 'VALIDATION_ERROR',
              details: { field: 'monto', value: monto },
              timestamp: new Date().toISOString()
            }
          });
        }
        
        montoFinal = validacionMonto.monto;
        
        // Validar que el monto coincida con el precio del servicio (tolerancia de 0.01 para decimales)
        if (Math.abs(montoFinal - precioServicio) > 0.01) {
          return res.status(400).json({
            success: false,
            error: {
              message: `El monto enviado ($${montoFinal.toLocaleString()}) no coincide con el precio del servicio ($${precioServicio.toLocaleString()}). Use el monto correcto o omita el campo 'monto' para usar el precio automático.`,
              code: 'AMOUNT_MISMATCH',
              details: {
                monto_enviado: montoFinal,
                precio_servicio: precioServicio,
                precio_base_servicio: precioBaseServicio > 0 ? precioBaseServicio : null,
                total_estimado: totalEstimado,
                diferencia: Math.abs(montoFinal - precioServicio)
              },
              timestamp: new Date().toISOString()
            }
          });
        }
      } else {
        // Si no se envía monto, usar automáticamente el precio del servicio
        montoFinal = precioServicio;
      }

      console.log(`💰 Procesando pago: Monto = $${montoFinal.toLocaleString()} (precio del servicio: $${precioServicio.toLocaleString()})`);

      const resultado = await PagoService.procesarPagoMock({
        monto: montoFinal, // ✅ Usar monto automático del servicio
        metodo_pago,
        id_orden_servicio: parseInt(id_orden_servicio),
        gateway: 'mock',
        id_usuario_pago: usuarioQuePago?.id_usuario || null // Usuario que realizó el pago
      });

      if (resultado.success) {
        // Estructurar respuesta con información completa
        const responseData = {
          pago: {
            id_pago: resultado.payment?.id_pago,
            monto_pagado: resultado.payment?.monto_pagado || resultado.payment?.monto,
            metodo_pago: resultado.payment?.metodo_pago,
            estado: resultado.payment?.estado_pago || resultado.payment?.estado || 'Pagado',
            transaction_id: resultado.transaction_id,
            gateway: resultado.payment?.gateway || 'mock',
            comprobante_url: resultado.payment?.comprobante_url,
            numero_comprobante: resultado.payment?.numero_comprobante,
            fecha_pago: resultado.payment?.fecha_pago || resultado.payment?.created_at,
            verified_at: resultado.payment?.verified_at
          },
          solicitud: {
            id_orden_servicio: resultado.payment?.id_orden_servicio,
            numero_expediente: resultado.payment?.numero_expediente,
            fecha_creacion: resultado.payment?.fecha_creacion_solicitud,
            estado: resultado.payment?.estado_solicitud,
            total_orden_servicio: parseFloat(resultado.payment?.total_orden_servicio || 0),
            pais: resultado.payment?.pais,
            ciudad: resultado.payment?.ciudad,
            codigo_postal: resultado.payment?.codigo_postal
          },
          servicio: {
            id_servicio: resultado.payment?.id_servicio,
            nombre: resultado.payment?.nombre_servicio,
            descripcion: resultado.payment?.descripcion_servicio,
            precio_base: parseFloat(resultado.payment?.precio_base_servicio || 0)
          },
          usuario: {
            id_usuario: resultado.payment?.id_usuario,
            nombre: resultado.payment?.nombre_usuario,
            apellido: resultado.payment?.apellido_usuario,
            correo: resultado.payment?.correo_usuario,
            telefono: resultado.payment?.telefono_usuario,
            tipo_documento: resultado.payment?.tipo_documento_usuario,
            documento: resultado.payment?.documento_usuario
          },
          empresa: resultado.payment?.id_empresa ? {
            id_empresa: resultado.payment?.id_empresa,
            nombre: resultado.payment?.nombre_empresa,
            nit: resultado.payment?.nit_empresa,
            tipo_empresa: resultado.payment?.tipo_empresa,
            direccion: resultado.payment?.direccion_empresa,
            telefono: resultado.payment?.telefono_empresa,
            email: resultado.payment?.email_empresa,
            ciudad: resultado.payment?.ciudad_empresa,
            pais: resultado.payment?.pais_empresa
          } : null,
          precios: {
            precio_base_servicio: parseFloat(resultado.payment?.precio_base_servicio || 0),
            total_orden_servicio: parseFloat(resultado.payment?.total_orden_servicio || 0),
            monto_pagado: parseFloat(resultado.payment?.monto_pagado || resultado.payment?.monto || 0),
            diferencia: parseFloat(resultado.payment?.total_orden_servicio || 0) - parseFloat(resultado.payment?.monto_pagado || resultado.payment?.monto || 0)
          },
          solicitud_activada: resultado.solicitud_activada || false,
          usuario_que_pago: {
            id_usuario: usuarioQuePago?.id_usuario,
            nombre: usuarioQuePago?.nombre,
            apellido: usuarioQuePago?.apellido,
            correo: usuarioQuePago?.correo,
            rol: usuarioQuePago?.rol
          }
        };

        res.status(201).json({
          success: true,
          message: resultado.solicitud_activada 
            ? 'Pago procesado exitosamente. Solicitud activada.' 
            : 'Pago procesado exitosamente',
          data: responseData
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al procesar pago',
          error: resultado.error
        });
      }
    } catch (err) {
      console.error('Error en procesarPagoMock:', err);
      res.status(500).json({ 
        success: false,
        error: err.message 
      });
    }
  },

  /**
   * ✅ NUEVO: Simular pago (testing)
   */
  async simularPago(req, res) {
    try {
      const { monto, metodo_pago, id_orden_servicio } = req.body;

      if (!monto || !metodo_pago || !id_orden_servicio) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Datos incompletos. Requiere: monto, metodo_pago, id_orden_servicio",
            code: 'MISSING_FIELDS',
            details: {
              campos_requeridos: ['monto', 'metodo_pago', 'id_orden_servicio'],
              campos_recibidos: Object.keys(req.body)
            },
            timestamp: new Date().toISOString()
          }
        });
      }

      // ✅ VALIDAR MONTO
      const validacionMonto = validarMonto(monto);
      if (!validacionMonto.esValido) {
        return res.status(400).json({
          success: false,
          error: {
            message: validacionMonto.error,
            code: 'VALIDATION_ERROR',
            details: { field: 'monto', value: monto },
            timestamp: new Date().toISOString()
          }
        });
      }

      // ✅ VALIDAR RELACIÓN FOREIGN KEY: Verificar que la orden de servicio exista
      const validacionOrden = await validarOrdenServicio(id_orden_servicio);
      if (!validacionOrden.esValida) {
        return res.status(400).json({
          success: false,
          error: {
            message: validacionOrden.error,
            code: 'FOREIGN_KEY_ERROR',
            details: { field: 'id_orden_servicio', value: id_orden_servicio },
            timestamp: new Date().toISOString()
          }
        });
      }

      const resultado = await PagoService.simularPago({
        monto: validacionMonto.monto,
        metodo_pago,
        id_orden_servicio: parseInt(id_orden_servicio)
      });

      res.status(201).json({
        success: true,
        message: 'Pago simulado exitosamente',
        data: resultado
      });
    } catch (err) {
      console.error('Error en simularPago:', err);
      res.status(500).json({
        success: false,
        error: {
          message: err.message,
          code: 'INTERNAL_ERROR',
          timestamp: new Date().toISOString()
        }
      });
    }
  },

  /**
   * ✅ NUEVO: Verificar pago manualmente (admin)
   */
  async verificarPagoManual(req, res) {
    try {
      const { id } = req.params; // ID ya validado por validateId middleware
      const usuarioId = req.user?.id_usuario;

      if (!usuarioId) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      const pago = await PagoService.verificarPagoManual(id, usuarioId);

      res.json({
        success: true,
        message: 'Pago verificado exitosamente',
        data: pago
      });
    } catch (err) {
      console.error('Error en verificarPagoManual:', err);
      res.status(400).json({ error: err.message });
    }
  },

  /**
   * ✅ NUEVO: Descargar comprobante
   */
  async descargarComprobante(req, res) {
    try {
      const { id } = req.params; // ID ya validado por validateId middleware
      const pago = await PagoService.obtenerPago(id);

      if (!pago) {
        return res.status(404).json({ message: "Pago no encontrado" });
      }

      res.json({
        success: true,
        message: 'Comprobante generado',
        data: {
          comprobante_url: pago.comprobante_url,
          numero_comprobante: pago.numero_comprobante
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
