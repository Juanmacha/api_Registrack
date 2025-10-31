/**
 * Servicio para generar comprobantes de pago en PDF
 * Genera PDFs profesionales con toda la información del pago
 */

import PDFDocument from 'pdfkit';

export class ComprobanteService {
  
  /**
   * Generar número único de comprobante
   * Formato: RC-YYYYMM-XXXX
   */
  generarNumeroComprobante() {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `RC-${year}${month}-${random}`;
  }

  /**
   * Generar PDF del comprobante
   * @param {number} pagoId - ID del pago
   * @returns {string} URL del comprobante (por ahora retorna path local)
   */
  async generarPDF(pagoId) {
    try {
      const { PagoService } = await import('./pago.service.js');
      const { SolicitudesService } = await import('./solicitudes.service.js');
      
      // Obtener datos del pago
      const pago = await PagoService.obtenerPago(pagoId);
      
      if (!pago) {
        throw new Error('Pago no encontrado');
      }

      // Generar número de comprobante único
      const numeroComprobante = this.generarNumeroComprobante();
      
      // Crear instancia de PDFDocument
      const doc = new PDFDocument({
        margin: 50,
        size: 'LETTER'
      });

      // Configurar metadata del PDF
      doc.info = {
        Title: `Comprobante de Pago - ${numeroComprobante}`,
        Author: 'Registrack',
        Subject: 'Comprobante de Pago',
        Keywords: 'pago, comprobante, registrack'
      };

      // ============================================
      // ENCABEZADO
      // ============================================
      doc.rect(50, 50, 500, 100)
         .fillColor('#007bff')
         .fillAndStroke('#007bff', '#007bff');

      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('COMPROBANTE DE PAGO', 50, 70, { align: 'center', width: 500 });

      doc.fontSize(12)
         .text(`Registrack - Sistema de Gestión`, 50, 105, { align: 'center', width: 500 });

      // ============================================
      // INFORMACIÓN DEL COMPROBANTE
      // ============================================
      doc.y = 170;
      doc.fillColor('#000000')
         .fontSize(10)
         .font('Helvetica');

      doc.font('Helvetica-Bold')
         .text('Número de Comprobante:', 50, doc.y);
      doc.font('Helvetica')
         .text(numeroComprobante, 200, doc.y);

      doc.y += 15;
      doc.font('Helvetica-Bold')
         .text('ID de Transacción:', 50, doc.y);
      doc.font('Helvetica')
         .text(pago.transaction_id || 'N/A', 200, doc.y);

      doc.y += 15;
      doc.font('Helvetica-Bold')
         .text('Fecha de Pago:', 50, doc.y);
      doc.font('Helvetica')
         .text(new Date(pago.created_at).toLocaleString('es-CO'), 200, doc.y);

      // ============================================
      // DETALLES DEL PAGO
      // ============================================
      doc.y += 25;
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#007bff')
         .text('Detalles del Pago', 50, doc.y);

      doc.y += 15;
      doc.fontSize(10)
         .fillColor('#000000')
         .font('Helvetica');

      const detallesY = doc.y;
      
      doc.font('Helvetica-Bold')
         .text('Monto:', 50, doc.y);
      doc.font('Helvetica')
         .text(`$${parseFloat(pago.monto).toLocaleString('es-CO')}`, 200, doc.y);

      doc.y += 15;
      doc.font('Helvetica-Bold')
         .text('Método de Pago:', 50, doc.y);
      doc.font('Helvetica')
         .text(pago.metodo_pago, 200, doc.y);

      doc.y += 15;
      doc.font('Helvetica-Bold')
         .text('Pasarela:', 50, doc.y);
      doc.font('Helvetica')
         .text(pago.gateway?.toUpperCase() || 'MOCK', 200, doc.y);

      doc.y += 15;
      doc.font('Helvetica-Bold')
         .text('Estado:', 50, doc.y);
      
      const estadoColor = pago.estado === 'Pagado' ? '#28a745' : '#ffc107';
      doc.font('Helvetica-Bold')
         .fillColor(estadoColor)
         .text(pago.estado, 200, doc.y);

      // ============================================
      // INFORMACIÓN DE LA ORDEN
      // ============================================
      doc.y += 25;
      doc.fillColor('#000000')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Información de la Orden', 50, doc.y);

      doc.y += 15;
      doc.fontSize(10)
         .font('Helvetica');

      doc.font('Helvetica-Bold')
         .text('ID Orden:', 50, doc.y);
      doc.font('Helvetica')
         .text(`#${pago.id_orden_servicio}`, 200, doc.y);

      // ============================================
      // FOOTER
      // ============================================
      doc.y = 650;
      doc.fontSize(9)
         .fillColor('#666666')
         .font('Helvetica')
         .text('Este es un comprobante generado automáticamente.', 50, doc.y, { align: 'center', width: 500 });

      doc.y += 10;
      doc.text('Registrack - Todos los derechos reservados.', 50, doc.y, { align: 'center', width: 500 });

      doc.y += 5;
      doc.text(`Generado el: ${new Date().toLocaleString('es-CO')}`, 50, doc.y, { align: 'center', width: 500 });

      // ============================================
      // NOTA ADICIONAL SI ES MOCK
      // ============================================
      if (pago.gateway === 'mock') {
        doc.y += 15;
        doc.fontSize(8)
           .fillColor('#ffc107')
           .font('Helvetica-Bold')
           .text('⚠️ SIMULACIÓN DE PAGO - NO HAY DINERO REAL INVOLUCRADO', 50, doc.y, { 
             align: 'center', 
             width: 500 
           });
      }

      // ============================================
      // FINALIZAR PDF
      // ============================================
      doc.end();

      // Por ahora demonstrar el PDF en un buffer
      // En producción, guardarías esto en S3/Cloudinary/etc.
      const comprobanteUrl = `https://tu-storage.com/comprobantes/${numeroComprobante}.pdf`;
      
      console.log(`✅ Comprobante PDF generado: ${numeroComprobante}`);
      
      // Actualizar pago con número de comprobante
      const { PagoRepository } = await import('../repositories/pago.repository.js');
      await PagoRepository.updateComprobante(pagoId, comprobanteUrl, numeroComprobante);
      
      return comprobanteUrl;

    } catch (error) {
      console.error('❌ Error al generar comprobante PDF:', error);
      throw error;
    }
  }

  /**
   * Generar PDF simple (versión básica para testing)
   */
  async generarPDFSimple(pagoId) {
    const { PagoService } = await import('./pago.service.js');
    const pago = await PagoService.obtenerPago(pagoId);
    
    if (!pago) {
      throw new Error('Pago no encontrado');
    }

    const numeroComprobante = this.generarNumeroComprobante();
    
    // Simulación simple de URL de comprobante
    const comprobanteUrl = `/comprobantes/${numeroComprobante}.pdf`;
    
    console.log(`✅ Comprobante generado: ${numeroComprobante}`);
    
    return comprobanteUrl;
  }
}

export default new ComprobanteService();

