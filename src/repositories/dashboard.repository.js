// src/repositories/dashboard.repository.js
import { QueryTypes } from "sequelize";
import sequelize from "../config/db.js";

export const DashboardRepository = {
  /**
   * 📊 Obtener ingresos agrupados por mes
   * @param {string|null} fechaInicio - Fecha de inicio del periodo (YYYY-MM-DD) o null para todos los datos
   * @param {string|null} fechaFin - Fecha de fin del periodo (YYYY-MM-DD) o null para todos los datos
   * @returns {Promise<Array>} Ingresos por mes con desglose por método de pago
   */
  async obtenerIngresosPorMes(fechaInicio, fechaFin) {
    try {
      // Construir condiciones WHERE dinámicamente
      let whereClause = "WHERE estado = 'Pagado' AND fecha_pago IS NOT NULL";
      const replacements = [];

      if (fechaInicio && fechaFin) {
        whereClause += " AND fecha_pago >= ? AND fecha_pago <= ?";
        replacements.push(fechaInicio, fechaFin);
      }

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
        ${whereClause}
        GROUP BY mes
        ORDER BY mes DESC
      `;

      const result = await sequelize.query(query, {
        replacements,
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
   * @param {string|null} fechaInicio - Fecha de inicio del periodo (YYYY-MM-DD) o null para todos los datos
   * @param {string|null} fechaFin - Fecha de fin del periodo (YYYY-MM-DD) o null para todos los datos
   * @returns {Promise<Array>} Lista de servicios con estadísticas de uso
   */
  async obtenerResumenServicios(fechaInicio, fechaFin) {
    try {
      // Construir condiciones WHERE dinámicamente
      const serviciosReplacements = [];
      let serviciosWhereClause = "";
      let serviciosJoinClause = "";

      if (fechaInicio && fechaFin) {
        serviciosWhereClause = "WHERE fecha_creacion >= ? AND fecha_creacion <= ?";
        serviciosJoinClause = "AND os.fecha_creacion >= ? AND os.fecha_creacion <= ?";
        serviciosReplacements.push(fechaInicio, fechaFin, fechaInicio, fechaFin);
      }

      // Query optimizada: Obtener servicios con totales y anulados
      const queryServicios = `
        SELECT 
          s.id_servicio,
          s.nombre AS servicio,
          s.descripcion,
          s.precio_base,
          COUNT(DISTINCT os.id_orden_servicio) AS total_solicitudes,
          ROUND(
            (COUNT(DISTINCT os.id_orden_servicio) * 100.0 / 
              NULLIF((SELECT COUNT(*) FROM ordenes_de_servicios ${serviciosWhereClause}), 0)
            ), 
            2
          ) AS porcentaje_uso,
          SUM(CASE WHEN os.estado = 'Anulado' THEN 1 ELSE 0 END) AS anulados
        FROM servicios s
        LEFT JOIN ordenes_de_servicios os ON s.id_servicio = os.id_servicio
          ${serviciosJoinClause}
        GROUP BY s.id_servicio, s.nombre, s.descripcion, s.precio_base
        ORDER BY total_solicitudes DESC
      `;

      const servicios = await sequelize.query(queryServicios, {
        replacements: serviciosReplacements,
        type: QueryTypes.SELECT
      });

      // Query optimizada: Obtener distribución de estados reales (process_states) por servicio
      // Usamos el estado más reciente de cada orden de servicio desde detalles_ordenes_servicio
      let estadoDistribucionQuery = `
        SELECT 
          os.id_servicio,
          estado_actual.estado,
          COUNT(*) AS cantidad
        FROM ordenes_de_servicios os
        INNER JOIN (
          -- Subquery para obtener el estado más reciente de cada orden de servicio
          SELECT 
            dos1.id_orden_servicio,
            dos1.estado
          FROM detalles_ordenes_servicio dos1
          INNER JOIN (
            SELECT 
              id_orden_servicio,
              MAX(fecha_estado) AS max_fecha
            FROM detalles_ordenes_servicio
            GROUP BY id_orden_servicio
          ) dos2 ON dos1.id_orden_servicio = dos2.id_orden_servicio 
            AND dos1.fecha_estado = dos2.max_fecha
        ) estado_actual ON os.id_orden_servicio = estado_actual.id_orden_servicio
        WHERE os.estado != 'Anulado'
      `;

      const estadoDistribucionParams = [];

      if (fechaInicio && fechaFin) {
        estadoDistribucionQuery += " AND os.fecha_creacion >= ? AND os.fecha_creacion <= ?";
        estadoDistribucionParams.push(fechaInicio, fechaFin);
      }

      estadoDistribucionQuery += " GROUP BY os.id_servicio, estado_actual.estado";

      const distribucionEstados = await sequelize.query(estadoDistribucionQuery, {
        replacements: estadoDistribucionParams,
        type: QueryTypes.SELECT
      });

      // Agrupar distribución de estados por servicio
      const distribucionPorServicio = {};
      distribucionEstados.forEach(item => {
        if (!distribucionPorServicio[item.id_servicio]) {
          distribucionPorServicio[item.id_servicio] = {};
        }
        distribucionPorServicio[item.id_servicio][item.estado] = parseInt(item.cantidad || 0);
      });

      // Combinar servicios con su distribución de estados
      const serviciosConEstados = servicios.map(servicio => {
        const estadoDistribucion = distribucionPorServicio[servicio.id_servicio] || {};
        
        // Agregar "Anulado" por separado (viene del campo anulados)
        const anulados = parseInt(servicio.anulados || 0);
        if (anulados > 0) {
          estadoDistribucion['Anulado'] = anulados;
        }

        return {
          ...servicio,
          estado_distribucion: estadoDistribucion
        };
      });

      return serviciosConEstados;
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
   * @param {number} diasMinimos - Días mínimos sin actualización (default: 10)
   * @returns {Promise<Array>} Lista de solicitudes inactivas
   */
  async obtenerSolicitudesInactivas(diasMinimos = 10) {
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
   * @param {string|null} fechaInicio - Fecha de inicio del periodo (YYYY-MM-DD) o null para todos los datos
   * @param {string|null} fechaFin - Fecha de fin del periodo (YYYY-MM-DD) o null para todos los datos
   * @returns {Promise<Object>} KPIs principales
   */
  async obtenerKPIsGenerales(fechaInicio, fechaFin) {
    try {
      const tieneFechas = fechaInicio && fechaFin;
      const replacements = [];
      
      // Construir condiciones WHERE dinámicamente
      const fechaConditionPagos = tieneFechas 
        ? "AND fecha_pago >= ? AND fecha_pago <= ?" 
        : "";
      
      const fechaConditionOrdenes = tieneFechas 
        ? "AND fecha_creacion >= ? AND fecha_creacion <= ?" 
        : "";

      // Agregar replacements en el orden correcto según aparecen en la query
      if (tieneFechas) {
        // 1. ingresos_totales: fechaInicio, fechaFin
        // 2. total_transacciones: fechaInicio, fechaFin
        // 3. solicitudes_totales: fechaInicio, fechaFin
        // 4. solicitudes_finalizadas: fechaInicio, fechaFin
        // 5. tasa_conversion (numerador - Finalizado): fechaInicio, fechaFin
        // 6. tasa_conversion (denominador - total): fechaInicio, fechaFin
        // 7. tiempo_promedio_resolucion: fechaInicio, fechaFin
        // 8. clientes_unicos: fechaInicio, fechaFin
        // Total: 16 replacements (8 condiciones * 2 valores cada una)
        for (let i = 0; i < 8; i++) {
          replacements.push(fechaInicio, fechaFin);
        }
      }

      const query = `
        SELECT 
          -- Ingresos
          (
            SELECT COALESCE(SUM(monto), 0) 
            FROM pagos 
            WHERE estado = 'Pagado' 
              AND fecha_pago IS NOT NULL
              ${fechaConditionPagos}
          ) AS ingresos_totales,
          
          (
            SELECT COUNT(*) 
            FROM pagos 
            WHERE estado = 'Pagado' 
              AND fecha_pago IS NOT NULL
              ${fechaConditionPagos}
          ) AS total_transacciones,
          
          -- Solicitudes
          (
            SELECT COUNT(*) 
            FROM ordenes_de_servicios 
            WHERE 1=1
              ${fechaConditionOrdenes}
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
              AND DATEDIFF(NOW(), updated_at) >= 10
          ) AS solicitudes_inactivas,
          
          (
            SELECT COUNT(*) 
            FROM ordenes_de_servicios 
            WHERE estado = 'Finalizado'
              ${fechaConditionOrdenes}
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
                ${fechaConditionOrdenes}
            ) * 100.0 / NULLIF(
              (
                SELECT COUNT(*) 
                FROM ordenes_de_servicios 
                WHERE 1=1
                  ${fechaConditionOrdenes}
              ), 0
            ), 2
          ) AS tasa_conversion,
          
          -- Tiempo promedio de resolución (en días)
          (
            SELECT COALESCE(AVG(DATEDIFF(updated_at, fecha_creacion)), 0)
            FROM ordenes_de_servicios
            WHERE estado = 'Finalizado'
              ${fechaConditionOrdenes}
          ) AS tiempo_promedio_resolucion,
          
          -- Clientes únicos
          (
            SELECT COUNT(DISTINCT id_cliente)
            FROM ordenes_de_servicios
            WHERE 1=1
              ${fechaConditionOrdenes}
          ) AS clientes_unicos
      `;

      const result = await sequelize.query(query, {
        replacements,
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
  },

  /**
   * 💰 Obtener ingresos agrupados por servicio
   * @param {string|null} fechaInicio - Fecha de inicio del periodo (YYYY-MM-DD) o null para todos los datos
   * @param {string|null} fechaFin - Fecha de fin del periodo (YYYY-MM-DD) o null para todos los datos
   * @returns {Promise<Array>} Lista de servicios con sus ingresos totales
   */
  async obtenerIngresosPorServicio(fechaInicio, fechaFin) {
    try {
      const replacements = [];
      let fechaCondition = "";

      if (fechaInicio && fechaFin) {
        fechaCondition = "AND p.fecha_pago >= ? AND p.fecha_pago <= ?";
        replacements.push(fechaInicio, fechaFin);
      }

      const query = `
        SELECT 
          s.id_servicio,
          s.nombre AS nombre_servicio,
          COUNT(DISTINCT p.id_pago) AS total_transacciones,
          CAST(COALESCE(SUM(p.monto), 0) AS DECIMAL(15,2)) AS total_ingresos,
          CAST(COALESCE(AVG(p.monto), 0) AS DECIMAL(15,2)) AS promedio_transaccion
        FROM pagos p
        INNER JOIN ordenes_de_servicios os ON p.id_orden_servicio = os.id_orden_servicio
        INNER JOIN servicios s ON os.id_servicio = s.id_servicio
        WHERE p.estado = 'Pagado'
          AND p.fecha_pago IS NOT NULL
          ${fechaCondition}
        GROUP BY s.id_servicio, s.nombre
        ORDER BY total_ingresos DESC
      `;

      const result = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT
      });

      return result;
    } catch (error) {
      console.error('❌ Error en obtenerIngresosPorServicio:', error);
      throw error;
    }
  }
};

