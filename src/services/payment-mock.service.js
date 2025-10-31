/**
 * Servicio MOCK para simular pasarelas de pago
 * Este servicio simula el comportamiento de PayPal, Stripe, Wompi, etc.
 * Reemplazar por servicio real cuando pasarela esté lista
 */

export class MockPaymentService {
  
  /**
   * Simular creación de intención de pago
   * @param {Object} paymentData - Datos del pago
   * @returns {Object} Información de la intención de pago
   */
  async createPaymentIntent(paymentData) {
    console.log('🎭 [MOCK] Creando intención de pago...', paymentData);
    
    // Generar ID de transacción falso
    const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      transaction_id: transactionId,
      status: 'created',
      redirect_url: `/payment-simulation?transaction_id=${transactionId}`,
      gateway: 'mock',
      mock_data: {
        message: 'Esta es una simulación. El pago será procesado automáticamente.',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora
      }
    };
  }

  /**
   * Simular verificación de pago
   * @param {string} transactionId - ID de transacción
   * @returns {Object} Información de verificación
   */
  async verifyPayment(transactionId) {
    console.log('🎭 [MOCK] Verificando pago...', transactionId);
    
    // Simular verificación exitosa siempre (para mock)
    return {
      success: true,
      verified: true,
      transaction_id: transactionId,
      status: 'completed',
      verified_at: new Date().toISOString(),
      mock_notice: 'Verificación simulada - siempre exitosa'
    };
  }

  /**
   * Simular proceso de pago completo
   * @param {Object} paymentData - Datos del pago
   * @returns {Object} Resultado del pago
   */
  async processPayment(paymentData) {
    console.log('🎭 [MOCK] Procesando pago...', paymentData);
    
    // Simular delay de procesamiento (como una pasarela real)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular éxito (puedes cambiar para probar errores)
    // 90% éxito, 10% fallo
    const shouldSucceed = Math.random() > 0.1;
    
    if (shouldSucceed) {
      const transactionId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ [MOCK] Pago simulado exitosamente:', transactionId);
      
      return {
        success: true,
        transaction_id: transactionId || paymentData.transaction_id,
        status: 'paid',
        gateway: 'mock',
        verified: true,
        verified_at: new Date().toISOString(),
        amount: paymentData.amount,
        currency: paymentData.currency || 'COP',
        mock_notice: 'Pago simulado exitosamente',
        mock_warning: 'Esta es una simulación, no hay dinero real involucrado'
      };
    } else {
      console.log('❌ [MOCK] Pago simulado rechazado');
      
      return {
        success: false,
        status: 'rejected',
        error: 'Simulación de pago rechazado',
        error_code: 'MOCK_REJECTED',
        mock_notice: 'Simulación de pago rechazado (para testing)'
      };
    }
  }

  /**
   * Simular webhook de pasarela (para futura integración)
   * @param {Object} webhookData - Datos del webhook
   * @returns {Object} Resultado del webhook
   */
  async handleWebhook(webhookData) {
    console.log('🎭 [MOCK] Recibiendo webhook simulado...', webhookData);
    
    // Simular procesamiento de webhook
    return {
      success: true,
      processed: true,
      transaction_id: webhookData.transaction_id,
      status: 'completed',
      mock_notice: 'Webhook simulado procesado'
    };
  }

  /**
   * Generar datos de prueba de webhook
   * Útil para testing
   */
  generateMockWebhookData(transactionId, status = 'completed') {
    return {
      id: transactionId,
      status: status,
      amount: {
        total: "50.00",
        currency: "COP"
      },
      payer: {
        email: "test@example.com"
      },
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString()
    };
  }
}

export default new MockPaymentService();

