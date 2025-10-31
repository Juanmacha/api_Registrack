// src/repositories/dashboard.repository.js
import { QueryTypes } from "sequelize";
import sequelize from "../config/db.js";

export const DashboardRepository = {
  /**
   * 📊 Obtener ingresos agrupados por mes
   * @param {Date} fechaInicio - Fecha de inicio del periodo
   * @param {Date} fechaFin - Fecha de fin del periodo
   * @returns {Promise<Array>} Ingresos por mes con desglose por método de pago
   */
  async obtenerIngresosPorMes(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          DATE_FORMAT(fecha_pago, '%Y-%m') AS mes,
          COUNT(*) AS total_transacciones,
          CAST(SUM(monto) AS DECIMAL(15,2)) AS total_ingresos,
          CAST(AVG(monto) AS DECIMAL(15,2)) AS promedio_transaccion,
          CAST(SUM(CASE WHEN metodo_pago = 'Efectivo' THEN monto ELSE 0 END) AS DECIMAL(15,2)) AS efectivo,
          CAST(SUM(CASE WHEN metodo_pago = 'Transferencia' THEN monto ELSE 0 END) AS DECIMAL(15,2)) AS transferencia,
          CAST(SUM(CASE WHEN metodo_pago = 'Tarjeta' THEN monto ELSE 0 END) AS DECIMAL(15,2)) AS tarjeta,
          CAST(SUM(CASE WHEN metodo_pago = 'Cheque' THEN monto ELSE 0 END) AS DECIMAL(15,2)) AS cheque
        FROM pagos
        WHERE estado = 'Pagado'
          AND fecha_pago IS NOT NULL
          AND fecha_pago >= ?
          AND fecha_pago <= ?
        GROUP BY mes
        ORDER BY mes DESC
      `;

      const result = await sequelize.query(query, {
        replacements: [fechaInicio, fechaFin],
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerIngresosPorMes:', error);
      throw error;
    }
  },

  /**
   * 📈 Obtener resumen de servicios con estadísticas
   * @param {string} periodo - '6meses', '12meses', 'todo'
   * @returns {Promise<Array>} Lista de servicios con estadísticas de uso
   */
  async obtenerResumenServicios(periodo = '12meses') {
    try {
      // Calcular fecha de inicio según periodo
      let fechaInicio = null;
      
      if (periodo !== 'todo') {
        const meses = periodo === '6meses' ? 6 : 12;
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() - meses);
        fechaInicio = fecha.toISOString().split('T')[0];
      }

      let query = `
        SELECT 
          s.id_servicio,
          s.nombre AS servicio,
          s.descripcion,
          s.precio_base,
          COUNT(os.id_orden_servicio) AS total_solicitudes,
          ROUND(
            (COUNT(os.id_orden_servicio) * 100.0 / 
              NULLIF((SELECT COUNT(*) FROM ordenes_de_servicios ${fechaInicio ? 'WHERE fecha_creacion >= ?' : ''}), 0)
            ), 
            2
          ) AS porcentaje_uso,
          SUM(CASE WHEN os.estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
          SUM(CASE WHEN os.estado = 'En Proceso' THEN 1 ELSE 0 END) AS en_proceso,
          SUM(CASE WHEN os.estado = 'Finalizado' THEN 1 ELSE 0 END) AS finalizados,
          SUM(CASE WHEN os.estado = 'Anulado' THEN 1 ELSE 0 END) AS anulados
        FROM servicios s
        LEFT JOIN ordenes_de_servicios os ON s.id_servicio = os.id_servicio
          ${fechaInicio ? 'AND os.fecha_creacion >= ?' : ''}
        GROUP BY s.id_servicio, s.nombre, s.descripcion, s.precio_base
        ORDER BY total_solicitudes DESC
      `;

      const replacements = fechaInicio ? [fechaInicio, fechaInicio] : [];

      const result = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerResumenServicios:', error);
      throw error;
    }
  },

  /**
   * ⏳ Obtener servicios pendientes
   * @param {number} diasMinimos - Días mínimos en espera (default: 0)
   * @returns {Promise<Array>} Lista de solicitudes pendientes
   */
  async obtenerServiciosPendientes(diasMinimos = 0) {
    try {
      const query = `
        SELECT 
          os.id_orden_servicio,
          os.numero_expediente,
          CONCAT(u.nombre, ' ', u.apellido) AS cliente,
          u.correo AS cliente_email,
          s.nombre AS servicio,
          s.id_servicio,
          os.fecha_creacion,
          DATEDIFF(NOW(), os.fecha_creacion) AS dias_en_espera,
          COALESCE(CONCAT(emp.nombre, ' ', emp.apellido), 'Sin asignar') AS empleado_asignado,
          os.updated_at AS ultima_actualizacion,
          os.total_estimado,
          os.pais,
          os.ciudad
        FROM ordenes_de_servicios os
        INNER JOIN servicios s ON os.id_servicio = s.id_servicio
        INNER JOIN clientes c ON os.id_cliente = c.id_cliente
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
        LEFT JOIN empleados emp_rel ON os.id_empleado_asignado = emp_rel.id_empleado
        LEFT JOIN usuarios emp ON emp_rel.id_usuario = emp.id_usuario
        WHERE os.estado = 'Pendiente'
          AND DATEDIFF(NOW(), os.fecha_creacion) >= ?
        ORDER BY dias_en_espera DESC
        LIMIT 1000
      `;

      const result = await sequelize.query(query, {
        replacements: [diasMinimos],
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerServiciosPendientes:', error);
      throw error;
    }
  },

  /**
   * 🔴 Obtener solicitudes inactivas (sin actualizaciones por X días)
   * @param {number} diasMinimos - Días mínimos sin actualización (default: 30)
   * @returns {Promise<Array>} Lista de solicitudes inactivas
   */
  async obtenerSolicitudesInactivas(diasMinimos = 30) {
    try {
      const query = `
        SELECT 
          os.id_orden_servicio,
          os.numero_expediente,
          CONCAT(u.nombre, ' ', u.apellido) AS cliente,
          u.correo AS cliente_email,
          s.nombre AS servicio,
          s.id_servicio,
          os.estado,
          os.fecha_creacion,
          os.updated_at AS ultima_actualizacion,
          DATEDIFF(NOW(), os.updated_at) AS dias_inactivos,
          (
            SELECT titulo 
            FROM seguimientos 
            WHERE id_orden_servicio = os.id_orden_servicio 
            ORDER BY fecha_registro DESC 
            LIMIT 1
          ) AS ultimo_movimiento,
          (
            SELECT fecha_registro 
            FROM seguimientos 
            WHERE id_orden_servicio = os.id_orden_servicio 
            ORDER BY fecha_registro DESC 
            LIMIT 1
          ) AS fecha_ultimo_movimiento,
          COALESCE(CONCAT(emp.nombre, ' ', emp.apellido), 'Sin asignar') AS empleado_asignado,
          os.total_estimado,
          os.pais,
          os.ciudad
        FROM ordenes_de_servicios os
        INNER JOIN servicios s ON os.id_servicio = s.id_servicio
        INNER JOIN clientes c ON os.id_cliente = c.id_cliente
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
        LEFT JOIN empleados emp_rel ON os.id_empleado_asignado = emp_rel.id_empleado
        LEFT JOIN usuarios emp ON emp_rel.id_usuario = emp.id_usuario
        WHERE os.estado NOT IN ('Finalizado', 'Anulado')
          AND DATEDIFF(NOW(), os.updated_at) >= ?
        ORDER BY dias_inactivos DESC
        LIMIT 1000
      `;

      const result = await sequelize.query(query, {
        replacements: [diasMinimos],
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerSolicitudesInactivas:', error);
      throw error;
    }
  },

  /**
   * 📊 Obtener KPIs generales para el resumen del dashboard
   * @param {Date} fechaInicio - Fecha de inicio del periodo
   * @param {Date} fechaFin - Fecha de fin del periodo
   * @returns {Promise<Object>} KPIs principales
   */
  async obtenerKPIsGenerales(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          -- Ingresos
          (
            SELECT COALESCE(SUM(monto), 0) 
            FROM pagos 
            WHERE estado = 'Pagado' 
              AND fecha_pago >= ? 
              AND fecha_pago <= ?
          ) AS ingresos_totales,
          
          (
            SELECT COUNT(*) 
            FROM pagos 
            WHERE estado = 'Pagado' 
              AND fecha_pago >= ? 
              AND fecha_pago <= ?
          ) AS total_transacciones,
          
          -- Solicitudes
          (
            SELECT COUNT(*) 
            FROM ordenes_de_servicios 
            WHERE fecha_creacion >= ? 
              AND fecha_creacion <= ?
          ) AS solicitudes_totales,
          
          (
            SELECT COUNT(*) 
            FROM ordenes_de_servicios 
            WHERE estado = 'Pendiente'
          ) AS solicitudes_pendientes,
          
          (
            SELECT COUNT(*) 
            FROM ordenes_de_servicios 
            WHERE estado NOT IN ('Finalizado', 'Anulado')
              AND DATEDIFF(NOW(), updated_at) >= 30
          ) AS solicitudes_inactivas,
          
          (
            SELECT COUNT(*) 
            FROM ordenes_de_servicios 
            WHERE estado = 'Finalizado'
              AND fecha_creacion >= ? 
              AND fecha_creacion <= ?
          ) AS solicitudes_finalizadas,
          
          (
            SELECT COUNT(*) 
            FROM ordenes_de_servicios 
            WHERE estado = 'En Proceso'
          ) AS solicitudes_en_proceso,
          
          -- Tasa de conversión (finalizadas / totales * 100)
          ROUND(
            (
              SELECT COUNT(*) 
              FROM ordenes_de_servicios 
              WHERE estado = 'Finalizado'
                AND fecha_creacion >= ? 
                AND fecha_creacion <= ?
            ) * 100.0 / NULLIF(
              (
                SELECT COUNT(*) 
                FROM ordenes_de_servicios 
                WHERE fecha_creacion >= ? 
                AND fecha_creacion <= ?
              ), 0
            ), 2
          ) AS tasa_conversion,
          
          -- Tiempo promedio de resolución (en días)
          (
            SELECT COALESCE(AVG(DATEDIFF(updated_at, fecha_creacion)), 0)
            FROM ordenes_de_servicios
            WHERE estado = 'Finalizado'
              AND fecha_creacion >= ? 
              AND fecha_creacion <= ?
          ) AS tiempo_promedio_resolucion,
          
          -- Clientes únicos
          (
            SELECT COUNT(DISTINCT id_cliente)
            FROM ordenes_de_servicios
            WHERE fecha_creacion >= ? 
              AND fecha_creacion <= ?
          ) AS clientes_unicos
      `;

      const result = await sequelize.query(query, {
        replacements: [
          fechaInicio, fechaFin, // ingresos_totales
          fechaInicio, fechaFin, // total_transacciones
          fechaInicio, fechaFin, // solicitudes_totales
          fechaInicio, fechaFin, // solicitudes_finalizadas
          fechaInicio, fechaFin, // tasa_conversion (numerador)
          fechaInicio, fechaFin, // tasa_conversion (denominador)
          fechaInicio, fechaFin, // tiempo_promedio_resolucion
          fechaInicio, fechaFin  // clientes_unicos
        ],
        type: QueryTypes.SELECT
      });

      return result[0];
    } catch (error) {
      console.error('❌ Error en obtenerKPIsGenerales:', error);
      throw error;
    }
  },

  /**
   * 💰 Obtener distribución de métodos de pago
   * @param {Date} fechaInicio - Fecha de inicio del periodo
   * @param {Date} fechaFin - Fecha de fin del periodo
   * @returns {Promise<Array>} Distribución por método de pago
   */
  async obtenerDistribucionMetodosPago(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          metodo_pago,
          COUNT(*) AS cantidad,
          CAST(SUM(monto) AS DECIMAL(15,2)) AS total_monto,
          ROUND(
            (COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM pagos WHERE estado = 'Pagado' AND fecha_pago >= ? AND fecha_pago <= ?), 0)), 
            2
          ) AS porcentaje
        FROM pagos
        WHERE estado = 'Pagado'
          AND fecha_pago >= ?
          AND fecha_pago <= ?
        GROUP BY metodo_pago
        ORDER BY total_monto DESC
      `;

      const result = await sequelize.query(query, {
        replacements: [fechaInicio, fechaFin, fechaInicio, fechaFin],
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerDistribucionMetodosPago:', error);
      throw error;
    }
  },

  /**
   * 🏆 Obtener top clientes por ingresos
   * @param {Date} fechaInicio - Fecha de inicio del periodo
   * @param {Date} fechaFin - Fecha de fin del periodo
   * @param {number} limit - Número de clientes a retornar (default: 10)
   * @returns {Promise<Array>} Top clientes
   */
  async obtenerTopClientes(fechaInicio, fechaFin, limit = 10) {
    try {
      const query = `
        SELECT 
          c.id_cliente,
          CONCAT(u.nombre, ' ', u.apellido) AS cliente,
          u.correo,
          COUNT(DISTINCT os.id_orden_servicio) AS total_solicitudes,
          CAST(COALESCE(SUM(p.monto), 0) AS DECIMAL(15,2)) AS total_pagado
        FROM clientes c
        INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
        LEFT JOIN ordenes_de_servicios os ON c.id_cliente = os.id_cliente
        LEFT JOIN pagos p ON os.id_orden_servicio = p.id_orden_servicio 
          AND p.estado = 'Pagado'
          AND p.fecha_pago >= ?
          AND p.fecha_pago <= ?
        WHERE os.fecha_creacion >= ?
          AND os.fecha_creacion <= ?
        GROUP BY c.id_cliente, cliente, u.correo
        ORDER BY total_pagado DESC
        LIMIT ?
      `;

      const result = await sequelize.query(query, {
        replacements: [fechaInicio, fechaFin, fechaInicio, fechaFin, limit],
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerTopClientes:', error);
      throw error;
    }
  },

  /**
   * 👥 Obtener productividad de empleados
   * @param {Date} fechaInicio - Fecha de inicio del periodo
   * @param {Date} fechaFin - Fecha de fin del periodo
   * @returns {Promise<Array>} Estadísticas de empleados
   */
  async obtenerProductividadEmpleados(fechaInicio, fechaFin) {
    try {
      const query = `
        SELECT 
          emp.id_empleado,
          CONCAT(u.nombre, ' ', u.apellido) AS empleado,
          u.correo,
          COUNT(os.id_orden_servicio) AS total_asignadas,
          SUM(CASE WHEN os.estado = 'Finalizado' THEN 1 ELSE 0 END) AS finalizadas,
          SUM(CASE WHEN os.estado = 'En Proceso' THEN 1 ELSE 0 END) AS en_proceso,
          SUM(CASE WHEN os.estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
          ROUND(
            (SUM(CASE WHEN os.estado = 'Finalizado' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(os.id_orden_servicio), 0)), 
            2
          ) AS tasa_finalizacion,
          COALESCE(AVG(
            CASE 
              WHEN os.estado = 'Finalizado' 
              THEN DATEDIFF(os.updated_at, os.fecha_creacion)
              ELSE NULL
            END
          ), 0) AS dias_promedio_resolucion
        FROM empleados emp
        INNER JOIN usuarios u ON emp.id_usuario = u.id_usuario
        LEFT JOIN ordenes_de_servicios os ON emp.id_empleado = os.id_empleado_asignado
          AND os.fecha_creacion >= ?
          AND os.fecha_creacion <= ?
        GROUP BY emp.id_empleado, empleado, u.correo
        ORDER BY finalizadas DESC, tasa_finalizacion DESC
      `;

      const result = await sequelize.query(query, {
        replacements: [fechaInicio, fechaFin],
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerProductividadEmpleados:', error);
      throw error;
    }
  },

  /**
   * 🔔 Obtener renovaciones de marca próximas a vencer
   * @param {number} diasAnticipacion - Días de anticipación para mostrar renovaciones (default: 90)
   * @returns {Promise<Array>} Lista de renovaciones próximas a vencer
   */
  async obtenerRenovacionesProximas(diasAnticipacion = 90) {
    try {
      const query = `
        SELECT 
          os.id_orden_servicio,
          os.numero_expediente,
          COALESCE(os.nombredelaempresa, os.nombrecompleto) AS empresa,
          dos.fecha_estado AS fecha_finalizacion,
          DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR) AS fecha_vencimiento,
          DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) AS dias_restantes,
          os.id_empleado_asignado,
          u_emp.correo AS email_empleado,
          CONCAT(u_emp.nombre, ' ', u_emp.apellido) AS nombre_empleado,
          cl.id_cliente,
          u_cliente.correo AS email_cliente,
          os.nombrecompleto AS titular_nombre,
          os.correoelectronico AS titular_email,
          CASE 
            WHEN DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) <= 15 THEN 'crítico'
            WHEN DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) <= 30 THEN 'alto'
            WHEN DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) <= 60 THEN 'medio'
            ELSE 'bajo'
          END AS nivel_urgencia
        FROM ordenes_de_servicios os
        INNER JOIN detalles_ordenes_servicio dos 
          ON os.id_orden_servicio = dos.id_orden_servicio
        INNER JOIN servicios s 
          ON os.id_servicio = s.id_servicio
        LEFT JOIN usuarios u_emp 
          ON os.id_empleado_asignado = u_emp.id_usuario
        LEFT JOIN clientes cl 
          ON os.id_cliente = cl.id_cliente
        LEFT JOIN usuarios u_cliente 
          ON cl.id_usuario = u_cliente.id_usuario
        WHERE s.nombre = 'Renovación de Marca'
          AND dos.estado = 'Finalizado'
          AND dos.fecha_estado IS NOT NULL
          AND DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR) >= CURDATE()
          AND DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) <= ?
        ORDER BY 
          CASE 
            WHEN DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) <= 15 THEN 1
            WHEN DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) <= 30 THEN 2
            WHEN DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) <= 60 THEN 3
            ELSE 4
          END,
          dias_restantes ASC
      `;

      const result = await sequelize.query(query, {
        replacements: [diasAnticipacion],
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerRenovacionesProximas:', error);
      throw error;
    }
  }
};

