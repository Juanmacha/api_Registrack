import { PagoService } from "../services/pago.service.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export const PagoController = {
  async getAll(req, res) {
    try {
      const pagos = await PagoService.listarPagos();
      res.json(pagos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getById(req, res) {
    try {
      const pago = await PagoService.obtenerPago(req.params.id);
      if (!pago) return res.status(404).json({ message: "Pago no encontrado" });
      res.json(pago);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async create(req, res) {
    try {
      const pago = await PagoService.crearPago(req.body);
      res.status(201).json(pago);
    } catch (err) {
      res.status(400).json({ error: err.message });
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
      const { id } = req.params;
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
   */
  async procesarPagoMock(req, res) {
    try {
      const { monto, metodo_pago, id_orden_servicio } = req.body;

      if (!monto || !metodo_pago || !id_orden_servicio) {
        return res.status(400).json({ 
          error: "Datos incompletos. Requiere: monto, metodo_pago, id_orden_servicio" 
        });
      }

      const resultado = await PagoService.procesarPagoMock({
        monto: parseFloat(monto),
        metodo_pago,
        id_orden_servicio: parseInt(id_orden_servicio),
        gateway: 'mock'
      });

      if (resultado.success) {
        res.status(201).json({
          success: true,
          message: resultado.solicitud_activada 
            ? 'Pago procesado exitosamente. Solicitud activada.' 
            : 'Pago procesado exitosamente',
          data: {
            ...resultado,
            solicitud_activada: resultado.solicitud_activada || false
          }
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
      res.status(500).json({ error: err.message });
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
          error: "Datos incompletos. Requiere: monto, metodo_pago, id_orden_servicio" 
        });
      }

      const resultado = await PagoService.simularPago({
        monto: parseFloat(monto),
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
      res.status(500).json({ error: err.message });
    }
  },

  /**
   * ✅ NUEVO: Verificar pago manualmente (admin)
   */
  async verificarPagoManual(req, res) {
    try {
      const { id } = req.params;
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
      const { id } = req.params;
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
