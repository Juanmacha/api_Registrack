import { PagoRepository } from "../repositories/pago.repository.js";
import MockPaymentService from "./payment-mock.service.js";

export const PagoService = {
  // Usar servicio mock por ahora
  paymentGateway: MockPaymentService,
  
  async listarPagos() {
    return await PagoRepository.findAll();
  },

  /**
   * ✅ NUEVO: Listar pagos con información completa
   */
  async listarPagosConDetalles() {
    return await PagoRepository.findAllWithDetails();
  },

  async obtenerPago(id) {
    return await PagoRepository.findById(id);
  },

  async obtenerPagoConDetalles(id) {
    return await PagoRepository.findByIdWithDetails(id);
  },

  async crearPago(data) {
    if (!data.monto || !data.metodo_pago || !data.id_orden_servicio) {
      throw new Error("Datos incompletos");
    }
    return await PagoRepository.create(data);
  },

  /**
   * ✅ NUEVO: Procesar pago con mock
   */
  async procesarPagoMock(paymentData) {
    try {
      console.log('💰 Procesando pago con mock...', paymentData);
      
      // 1. Procesar pago con mock
      const paymentResult = await this.paymentGateway.processPayment(paymentData);
      
      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error || 'Error al procesar pago',
          payment: null
        };
      }

      // 2. Crear registro de pago - Siempre con estado "Pagado" para demo
      const pago = await this.crearPago({
        ...paymentData,
        transaction_id: paymentResult.transaction_id,
        gateway: paymentResult.gateway || 'mock',
        estado: 'Pagado', // ✅ Siempre "Pagado" para demo
        verified_at: paymentResult.verified ? new Date() : new Date(),
        verification_method: 'mock'
      });

      // 3. ⚠️ NUEVO: Si pago exitoso, activar la solicitud
      let solicitudActivada = false;
      if (paymentResult.success && paymentResult.verified && paymentData.id_orden_servicio) {
        try {
          const { activarSolicitudDespuesPago } = await import('../controllers/solicitudes.controller.js');
          const activacion = await activarSolicitudDespuesPago(paymentData.id_orden_servicio);
          
          if (activacion.success) {
            solicitudActivada = true;
            console.log('✅ Solicitud activada después de pago:', activacion.estado);
          } else {
            console.log('⚠️ No se pudo activar solicitud:', activacion.mensaje);
          }
        } catch (activacionError) {
          console.error('❌ Error al activar solicitud:', activacionError);
          // No fallar el pago si falla la activación (se puede activar manualmente después)
        }
      }

      // 4. Si pago exitoso, generar comprobante y enviar email
      if (paymentResult.success && paymentResult.verified) {
        try {
          await this.generarYEnviarComprobante(pago.id_pago);
        } catch (error) {
          console.error('⚠️ Error al generar comprobante/email:', error);
          // No fallar el pago si falla el email
        }
      }

      // 5. Obtener información completa del pago con detalles de solicitud y usuario
      let pagoCompleto = null;
      try {
        pagoCompleto = await this.obtenerPagoConDetalles(pago.id_pago);
      } catch (error) {
        console.error('⚠️ Error al obtener detalles del pago:', error);
        // Continuar con pago básico si falla
      }

      return {
        success: true,
        payment: pagoCompleto || pago,
        transaction_id: paymentResult.transaction_id,
        solicitud_activada: solicitudActivada
      };

    } catch (error) {
      console.error('❌ Error al procesar pago:', error);
      throw error;
    }
  },

  /**
   * ✅ NUEVO: Generar y enviar comprobante
   */
  async generarYEnviarComprobante(pagoId) {
    try {
      const { ComprobanteService } = await import('./comprobante.service.js');
      const comprobanteService = new ComprobanteService();
      
      // Generar comprobante (por ahora simulamos)
      const comprobanteUrl = await comprobanteService.generarPDFSimple(pagoId);
      
      // Obtener datos completos del pago (incluye información del cliente)
      const pagoCompleto = await this.obtenerPagoConDetalles(pagoId);
      
      if (!pagoCompleto) {
        throw new Error(`Pago con ID ${pagoId} no encontrado`);
      }
      
      // Obtener datos del cliente desde el pago completo
      const clienteEmail = pagoCompleto.correo_usuario;
      const clienteNombre = `${pagoCompleto.nombre_usuario || ''} ${pagoCompleto.apellido_usuario || ''}`.trim();
      
      // Validar que tengamos datos del cliente
      if (!clienteEmail) {
        console.error('⚠️ No se encontró correo del cliente para el pago:', pagoId);
        return comprobanteUrl; // Retornar comprobante aunque no se pueda enviar email
      }
      
      const { sendPaymentConfirmationEmail } = await import('./email.service.js');
      
      // Preparar datos del pago para el email
      const paymentData = {
        monto: pagoCompleto.monto_pagado || pagoCompleto.monto,
        metodo_pago: pagoCompleto.metodo_pago,
        estado: pagoCompleto.estado_pago || 'Pagado',
        transaction_id: pagoCompleto.transaction_id,
        gateway: pagoCompleto.gateway,
        created_at: pagoCompleto.fecha_pago || pagoCompleto.created_at
      };
      
      // Enviar email con datos reales del cliente
      await sendPaymentConfirmationEmail(
        clienteEmail,
        clienteNombre || 'Cliente',
        paymentData,
        comprobanteUrl
      );
      
      console.log(`✅ Email de confirmación de pago enviado a cliente: ${clienteEmail}`);
      
      return comprobanteUrl;
    } catch (error) {
      console.error('❌ Error al generar/enviar comprobante:', error);
      throw error;
    }
  },

  /**
   * ✅ NUEVO: Verificar pago manualmente (para admin)
   */
  async verificarPagoManual(pagoId, usuarioId) {
    const pago = await this.obtenerPago(pagoId);
    
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    if (pago.estado === 'Pagado') {
      throw new Error('El pago ya fue verificado');
    }

    // Actualizar pago
    await PagoRepository.updateStatus(pagoId, {
      estado: 'Pagado',
      verified_at: new Date(),
      verified_by: usuarioId,
      verification_method: 'manual'
    });

    // Generar comprobante
    await this.generarYEnviarComprobante(pagoId);

    return await this.obtenerPago(pagoId);
  },

  /**
   * ✅ NUEVO: Simular pago (para testing)
   */
  async simularPago(data) {
    return await this.procesarPagoMock({
      ...data,
      gateway: 'mock',
      verification_method: 'mock'
    });
  }
};
