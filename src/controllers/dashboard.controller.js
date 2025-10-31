// src/controllers/dashboard.controller.js
import { DashboardService } from "../services/dashboard.service.js";
import { RenovationAlertService } from "../services/renovation-alert.service.js";
import ExcelJS from "exceljs";

const dashboardService = new DashboardService();

export const DashboardController = {
  /**
   * GET /api/dashboard/ingresos
   * Obtener datos de control de ingresos
   */
  async getIngresos(req, res) {
    try {
      const { periodo = '6meses', fecha_inicio, fecha_fin } = req.query;

      // Validar periodo
      const periodosValidos = ['6meses', '12meses', 'custom'];
      if (!periodosValidos.includes(periodo)) {
        return res.status(400).json({
          success: false,
          error: `Periodo inválido. Debe ser: ${periodosValidos.join(', ')}`
        });
      }

      // Validar fechas para periodo custom
      if (periodo === 'custom' && (!fecha_inicio || !fecha_fin)) {
        return res.status(400).json({
          success: false,
          error: 'Para periodo "custom" se requieren fecha_inicio y fecha_fin'
        });
      }

      const data = await dashboardService.calcularIngresos(periodo, fecha_inicio, fecha_fin);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Error en getIngresos:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/dashboard/servicios
   * Resumen de gestión de servicios
   */
  async getServicios(req, res) {
    try {
      const { periodo = '12meses' } = req.query;

      // Validar periodo
      const periodosValidos = ['6meses', '12meses', 'todo'];
      if (!periodosValidos.includes(periodo)) {
        return res.status(400).json({
          success: false,
          error: `Periodo inválido. Debe ser: ${periodosValidos.join(', ')}`
        });
      }

      const data = await dashboardService.calcularResumenServicios(periodo);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Error en getServicios:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/dashboard/resumen
   * Resumen general del dashboard (todos los KPIs)
   */
  async getResumen(req, res) {
    try {
      const { periodo = '6meses' } = req.query;

      // Validar periodo
      const periodosValidos = ['6meses', '12meses', 'custom'];
      if (!periodosValidos.includes(periodo)) {
        return res.status(400).json({
          success: false,
          error: `Periodo inválido. Debe ser: ${periodosValidos.join(', ')}`
        });
      }

      const data = await dashboardService.obtenerResumenGeneral(periodo);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('❌ Error en getResumen:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/dashboard/pendientes
   * Tabla de servicios pendientes (JSON o Excel)
   */
  async getPendientes(req, res) {
    try {
      const { format = 'json', dias_minimos = '0' } = req.query;
      const diasMinimos = parseInt(dias_minimos);

      if (isNaN(diasMinimos) || diasMinimos < 0) {
        return res.status(400).json({
          success: false,
          error: 'dias_minimos debe ser un número mayor o igual a 0'
        });
      }

      const resultado = await dashboardService.obtenerServiciosPendientes(diasMinimos);

      // Si es JSON, devolver directamente
      if (format === 'json') {
        return res.json({
          success: true,
          ...resultado
        });
      }

      // Si es Excel, generar archivo
      if (format === 'excel') {
        return await DashboardController._generarExcelPendientes(res, resultado);
      }

      // Formato no válido
      res.status(400).json({
        success: false,
        error: 'Formato no válido. Use: json o excel'
      });
    } catch (error) {
      console.error('❌ Error en getPendientes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/dashboard/inactivas
   * Tabla de solicitudes con inactividad prolongada (JSON o Excel)
   */
  async getInactivas(req, res) {
    try {
      const { format = 'json', dias_minimos = '30' } = req.query;
      const diasMinimos = parseInt(dias_minimos);

      if (isNaN(diasMinimos) || diasMinimos < 0) {
        return res.status(400).json({
          success: false,
          error: 'dias_minimos debe ser un número mayor o igual a 0'
        });
      }

      const resultado = await dashboardService.obtenerSolicitudesInactivas(diasMinimos);

      // Si es JSON, devolver directamente
      if (format === 'json') {
        return res.json({
          success: true,
          ...resultado
        });
      }

      // Si es Excel, generar archivo
      if (format === 'excel') {
        return await DashboardController._generarExcelInactivas(res, resultado);
      }

      // Formato no válido
      res.status(400).json({
        success: false,
        error: 'Formato no válido. Use: json o excel'
      });
    } catch (error) {
      console.error('❌ Error en getInactivas:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * GET /api/dashboard/renovaciones-proximas
   * Tabla de marcas próximas a vencer (5 años) (JSON o Excel)
   */
  async getRenovacionesProximas(req, res) {
    try {
      const { format = 'json', dias_anticipacion = '90' } = req.query;
      const diasAnticipacion = parseInt(dias_anticipacion);

      if (isNaN(diasAnticipacion) || diasAnticipacion < 0) {
        return res.status(400).json({
          success: false,
          error: 'dias_anticipacion debe ser un número mayor o igual a 0'
        });
      }

      const resultado = await dashboardService.obtenerRenovacionesProximas(diasAnticipacion);

      // Si es JSON, devolver directamente
      if (format === 'json') {
        return res.json({
          success: true,
          ...resultado
        });
      }

      // Si es Excel, generar archivo
      if (format === 'excel') {
        return await DashboardController._generarExcelRenovaciones(res, resultado);
      }

      // Formato no válido
      res.status(400).json({
        success: false,
        error: 'Formato no válido. Use: json o excel'
      });
    } catch (error) {
      console.error('❌ Error en getRenovacionesProximas:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ========================================
  // MÉTODOS PRIVADOS PARA GENERACIÓN DE EXCEL
  // ========================================

  /**
   * Generar archivo Excel para servicios pendientes
   * @private
   */
  async _generarExcelPendientes(res, resultado) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Servicios Pendientes');

      // Configurar columnas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Expediente', key: 'expediente', width: 20 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Servicio', key: 'servicio', width: 35 },
        { header: 'Fecha Creación', key: 'fecha_creacion', width: 20 },
        { header: 'Días en Espera', key: 'dias_espera', width: 15 },
        { header: 'Empleado Asignado', key: 'empleado', width: 30 },
        { header: 'Última Actualización', key: 'actualizacion', width: 20 }
      ];

      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0070C0' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Agregar datos
      resultado.data.forEach(item => {
        worksheet.addRow({
          id: item.id_orden_servicio,
          expediente: item.numero_expediente,
          cliente: item.cliente,
          email: item.cliente_email,
          servicio: item.servicio,
          fecha_creacion: new Date(item.fecha_creacion).toLocaleDateString('es-CO'),
          dias_espera: item.dias_en_espera,
          empleado: item.empleado_asignado,
          actualizacion: new Date(item.ultima_actualizacion).toLocaleDateString('es-CO')
        });
      });

      // Aplicar bordes a todas las celdas
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Resaltar filas con más de 30 días en espera (excepto encabezado)
        if (rowNumber > 1) {
          const diasEspera = row.getCell('dias_espera').value;
          if (diasEspera > 30) {
            row.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFF4CC' } // Amarillo claro
              };
            });
          }
        }
      });

      // Agregar resumen al final
      const resumenRow = worksheet.addRow({});
      worksheet.addRow({
        id: 'TOTAL:',
        expediente: resultado.total,
        cliente: '',
        email: '',
        servicio: '',
        fecha_creacion: '',
        dias_espera: '',
        empleado: '',
        actualizacion: ''
      });

      const totalRow = worksheet.lastRow;
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' }
      };

      // Configurar respuesta HTTP
      const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `servicios_pendientes_${fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('❌ Error al generar Excel de pendientes:', error);
      throw error;
    }
  },

  /**
   * Generar archivo Excel para solicitudes inactivas
   * @private
   */
  async _generarExcelInactivas(res, resultado) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Solicitudes Inactivas');

      // Configurar columnas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Expediente', key: 'expediente', width: 20 },
        { header: 'Cliente', key: 'cliente', width: 30 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Servicio', key: 'servicio', width: 35 },
        { header: 'Estado', key: 'estado', width: 15 },
        { header: 'Fecha Creación', key: 'fecha_creacion', width: 20 },
        { header: 'Última Actualización', key: 'actualizacion', width: 20 },
        { header: 'Días Inactivos', key: 'dias_inactivos', width: 15 },
        { header: 'Último Movimiento', key: 'ultimo_movimiento', width: 40 },
        { header: 'Empleado Asignado', key: 'empleado', width: 30 }
      ];

      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD32F2F' } // Rojo para inactivas
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Agregar datos
      resultado.data.forEach(item => {
        worksheet.addRow({
          id: item.id_orden_servicio,
          expediente: item.numero_expediente,
          cliente: item.cliente,
          email: item.cliente_email,
          servicio: item.servicio,
          estado: item.estado,
          fecha_creacion: new Date(item.fecha_creacion).toLocaleDateString('es-CO'),
          actualizacion: new Date(item.ultima_actualizacion).toLocaleDateString('es-CO'),
          dias_inactivos: item.dias_inactivos,
          ultimo_movimiento: item.ultimo_movimiento,
          empleado: item.empleado_asignado
        });
      });

      // Aplicar bordes y colores según nivel de inactividad
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Colorear según días de inactividad (excepto encabezado)
        if (rowNumber > 1) {
          const diasInactivos = row.getCell('dias_inactivos').value;
          
          if (diasInactivos >= 90) {
            // Rojo claro para > 90 días
            row.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFCDD2' }
              };
            });
          } else if (diasInactivos >= 60) {
            // Naranja claro para 60-89 días
            row.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFE0B2' }
              };
            });
          } else if (diasInactivos >= 30) {
            // Amarillo claro para 30-59 días
            row.eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFF4CC' }
              };
            });
          }
        }
      });

      // Agregar resumen al final
      const resumenRow = worksheet.addRow({});
      worksheet.addRow({
        id: 'TOTAL:',
        expediente: resultado.total,
        cliente: '',
        email: '',
        servicio: '',
        estado: '',
        fecha_creacion: '',
        actualizacion: '',
        dias_inactivos: '',
        ultimo_movimiento: '',
        empleado: ''
      });

      const totalRow = worksheet.lastRow;
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' }
      };

      // Configurar respuesta HTTP
      const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `solicitudes_inactivas_${fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('❌ Error al generar Excel de inactivas:', error);
      throw error;
    }
  },

  /**
   * Generar archivo Excel para renovaciones próximas a vencer
   * @private
   */
  async _generarExcelRenovaciones(res, resultado) {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Renovaciones Próximas');

      // Configurar columnas
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Expediente', key: 'expediente', width: 20 },
        { header: 'Empresa/Titular', key: 'empresa', width: 30 },
        { header: 'Fecha Finalización', key: 'fecha_finalizacion', width: 18 },
        { header: 'Fecha Vencimiento', key: 'fecha_vencimiento', width: 18 },
        { header: 'Días Restantes', key: 'dias_restantes', width: 15 },
        { header: 'Nivel Urgencia', key: 'urgencia', width: 15 },
        { header: 'Empleado Asignado', key: 'empleado', width: 30 },
        { header: 'Email Empleado', key: 'email_emp', width: 35 }
      ];

      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A86E8' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Agregar datos
      resultado.renovaciones.forEach(item => {
        worksheet.addRow({
          id: item.id_orden_servicio,
          expediente: item.numero_expediente,
          empresa: item.empresa,
          fecha_finalizacion: new Date(item.fecha_finalizacion).toLocaleDateString('es-CO'),
          fecha_vencimiento: new Date(item.fecha_vencimiento).toLocaleDateString('es-CO'),
          dias_restantes: item.dias_restantes,
          urgencia: item.nivel_urgencia.toUpperCase(),
          empleado: item.empleado_asignado,
          email_emp: item.email_empleado || 'Sin email'
        });
      });

      // Aplicar bordes y colores según urgencia
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Colorear según nivel de urgencia (excepto encabezado)
        if (rowNumber > 1) {
          const urgencia = row.getCell('urgencia').value;
          let color;

          if (urgencia === 'CRÍTICO') {
            color = 'FFFFCDD2'; // Rojo claro
          } else if (urgencia === 'ALTO') {
            color = 'FFFFE0B2'; // Naranja claro
          } else if (urgencia === 'MEDIO') {
            color = 'FFFFF4CC'; // Amarillo claro
          } else {
            color = 'FFFFFFFF'; // Blanco
          }

          row.eachCell((cell) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: color }
            };
          });
        }
      });

      // Agregar resumen al final
      const resumenRow = worksheet.addRow({});
      worksheet.addRow({
        id: 'TOTAL:',
        expediente: resultado.total,
        empresa: `Crítico: ${resultado.por_urgencia.critico} | Alto: ${resultado.por_urgencia.alto} | Medio: ${resultado.por_urgencia.medio} | Bajo: ${resultado.por_urgencia.bajo}`,
        fecha_finalizacion: '',
        fecha_vencimiento: '',
        dias_restantes: '',
        urgencia: '',
        empleado: '',
        email_emp: ''
      });

      const totalRow = worksheet.lastRow;
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' }
      };

      // Configurar respuesta HTTP
      const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `renovaciones_proximas_${fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('❌ Error al generar Excel de renovaciones:', error);
      throw error;
    }
  },

  /**
   * POST /api/dashboard/renovaciones-proximas/test-alertas
   * Endpoint manual para probar envío de alertas (solo admin)
   */
  async testAlertasRenovaciones(req, res) {
    try {
      console.log('🧪 Iniciando prueba manual de alertas de renovación...');
      
      const resultado = await RenovationAlertService.enviarAlertasDiarias();

      res.json({
        success: true,
        mensaje: 'Prueba de alertas ejecutada',
        resultado
      });
    } catch (error) {
      console.error('❌ Error en testAlertasRenovaciones:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

