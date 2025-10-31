import { PagoRepository } from "../repositories/pago.repository.js";
import MockPaymentService from "./payment-mock.service.js";

export const PagoService = {
  // Usar servicio mock por ahora
  paymentGateway: MockPaymentService,
  
  async listarPagos() {
    return await PagoRepository.findAll();
  },

  async obtenerPago(id) {
    return await PagoRepository.findById(id);
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

      // 2. Crear registro de pago
      const pago = await this.crearPago({
        ...paymentData,
        transaction_id: paymentResult.transaction_id,
        gateway: paymentResult.gateway || 'mock',
        estado: paymentResult.status === 'paid' ? 'Pagado' : 'Pendiente',
        verified_at: paymentResult.verified ? new Date() : null,
        verification_method: 'mock'
      });

      // 3. Si pago exitoso, generar comprobante y enviar email
      if (paymentResult.success && paymentResult.verified) {
        try {
          await this.generarYEnviarComprobante(pago.id_pago);
        } catch (error) {
          console.error('⚠️ Error al generar comprobante/email:', error);
          // No fallar el pago si falla el email
        }
      }

      return {
        success: true,
        payment: pago,
        transaction_id: paymentResult.transaction_id
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
      
      // Obtener datos del pago
      const pago = await this.obtenerPago(pagoId);
      
      // TODO: Aquí necesitarías obtener datos del cliente
      // Por ahora usamos datos mock para email
      const { sendPaymentConfirmationEmail } = await import('./email.service.js');
      
      // Obtener datos del cliente (simulado por ahora)
      const clienteEmail = 'cliente@example.com';
      const clienteNombre = 'Cliente Test';
      
      // Enviar email
      await sendPaymentConfirmationEmail(
        clienteEmail,
        clienteNombre,
        pago,
        comprobanteUrl
      );
      
      console.log('✅ Comprobante y email enviados exitosamente');
      
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
