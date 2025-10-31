// src/services/renovation-alert.service.js
import { DashboardService } from "./dashboard.service.js";
import { 
  sendRenovationAlertEmpleado, 
  sendRenovationAlertCliente, 
  sendRenovationAlertAdmin 
} from "./email.service.js";
import sequelize from "../config/db.js";
import { QueryTypes } from "sequelize";

const dashboardService = new DashboardService();

/**
 * Servicio de alertas de renovaciones de marca
 * Se ejecuta diariamente para enviar notificaciones automáticas
 */
export const RenovationAlertService = {
  /**
   * Ejecutar verificación y envío de alertas diarias
   * @returns {Promise<Object>} Resultado de la ejecución
   */
  async enviarAlertasDiarias() {
    try {
      console.log('🔔 Iniciando verificación de renovaciones próximas...');
      
      // Obtener renovaciones próximas (90 días de anticipación)
      const datos = await dashboardService.obtenerRenovacionesProximas(90);
      
      if (datos.total === 0) {
        console.log('✅ No hay renovaciones próximas a vencer');
        return {
          success: true,
          total: 0,
          enviados: 0,
          mensaje: 'No hay renovaciones próximas'
        };
      }

      console.log(`⚠️ Encontradas ${datos.total} renovaciones próximas`);

      const resultados = {
        empleados: 0,
        clientes: 0,
        admins: 0,
        errores: 0
      };

      // Enviar emails a empleados y clientes
      for (const renovacion of datos.renovaciones) {
        // Email al empleado asignado
        if (renovacion.email_empleado && renovacion.nombre_empleado) {
          try {
            await sendRenovationAlertEmpleado(
              renovacion.email_empleado,
              renovacion.nombre_empleado,
              {
                empresa: renovacion.empresa,
                numero_expediente: renovacion.numero_expediente,
                fecha_finalizacion: new Date(renovacion.fecha_finalizacion).toLocaleDateString('es-CO'),
                fecha_vencimiento: new Date(renovacion.fecha_vencimiento).toLocaleDateString('es-CO'),
                dias_restantes: renovacion.dias_restantes,
                nivel_urgencia: renovacion.nivel_urgencia,
                titular_nombre: renovacion.titular_nombre,
                titular_email: renovacion.titular_email
              }
            );
            resultados.empleados++;
          } catch (error) {
            console.error(`❌ Error enviando email a empleado ${renovacion.email_empleado}:`, error);
            resultados.errores++;
          }
        }

        // Email al cliente
        if (renovacion.titular_email && renovacion.titular_nombre) {
          try {
            await sendRenovationAlertCliente(
              renovacion.titular_email,
              renovacion.titular_nombre,
              {
                empresa: renovacion.empresa,
                numero_expediente: renovacion.numero_expediente,
                fecha_finalizacion: new Date(renovacion.fecha_finalizacion).toLocaleDateString('es-CO'),
                fecha_vencimiento: new Date(renovacion.fecha_vencimiento).toLocaleDateString('es-CO'),
                dias_restantes: renovacion.dias_restantes,
                nivel_urgencia: renovacion.nivel_urgencia
              }
            );
            resultados.clientes++;
          } catch (error) {
            console.error(`❌ Error enviando email a cliente ${renovacion.titular_email}:`, error);
            resultados.errores++;
          }
        }
      }

      // Email resumen a administradores (solo si hay renovaciones críticas o más de 10 total)
      const renovacionesCriticas = datos.renovaciones.filter(r => r.nivel_urgencia === 'crítico').length;
      
      if (renovacionesCriticas > 0 || datos.total > 10) {
        const emailsAdmins = await RenovationAlertService._obtenerEmailsAdministradores();
        
        for (const adminEmail of emailsAdmins) {
          try {
            await sendRenovationAlertAdmin(adminEmail, {
              total: datos.total,
              por_urgencia: datos.por_urgencia,
              marcas: datos.renovaciones.slice(0, 20) // Primeras 20 para no saturar el email
            });
            resultados.admins++;
          } catch (error) {
            console.error(`❌ Error enviando email resumen a admin ${adminEmail}:`, error);
            resultados.errores++;
          }
        }
      }

      const totalEnviados = resultados.empleados + resultados.clientes + resultados.admins;
      
      console.log('✅ Alertas enviadas correctamente:');
      console.log(`   - Empleados: ${resultados.empleados}`);
      console.log(`   - Clientes: ${resultados.clientes}`);
      console.log(`   - Admins: ${resultados.admins}`);
      console.log(`   - Errores: ${resultados.errores}`);

      return {
        success: true,
        total: datos.total,
        enviados: totalEnviados,
        errores: resultados.errores,
        desglose: resultados
      };
    } catch (error) {
      console.error('❌ Error crítico en alertas de renovación:', error);
      return {
        success: false,
        error: error.message,
        total: 0,
        enviados: 0
      };
    }
  },

  /**
   * Obtener emails de todos los administradores
   * @private
   * @returns {Promise<Array<string>>} Lista de emails de administradores
   */
  async _obtenerEmailsAdministradores() {
    try {
      const query = `
        SELECT u.correo
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE r.nombre = 'Administrador'
          AND u.correo IS NOT NULL
          AND u.correo != ''
      `;

      const results = await sequelize.query(query, {
        type: QueryTypes.SELECT
      });

      return results.map(r => r.correo);
    } catch (error) {
      console.error('❌ Error obteniendo emails de administradores:', error);
      return [];
    }
  },

  /**
   * Enviar alertas para renovaciones específicas (manual)
   * @param {Array<number>} ordenIds - IDs de órdenes de servicio
   * @returns {Promise<Object>} Resultado de la ejecución
   */
  async enviarAlertasPorOrdenes(ordenIds) {
    try {
      console.log(`🔔 Enviando alertas para ${ordenIds.length} renovación(es) específica(s)...`);

      const resultados = {
        empleados: 0,
        clientes: 0,
        errores: 0
      };

      // Obtener detalles de las órdenes
      const query = `
        SELECT 
          os.id_orden_servicio,
          os.numero_expediente,
          COALESCE(os.nombredelaempresa, os.nombrecompleto) AS empresa,
          dos.fecha_estado AS fecha_finalizacion,
          DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR) AS fecha_vencimiento,
          DATEDIFF(DATE_ADD(dos.fecha_estado, INTERVAL 5 YEAR), CURDATE()) AS dias_restantes,
          u_emp.correo AS email_empleado,
          CONCAT(u_emp.nombre, ' ', u_emp.apellido) AS nombre_empleado,
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
        WHERE s.nombre = 'Renovación de Marca'
          AND dos.estado = 'Finalizado'
          AND os.id_orden_servicio IN (?)
      `;

      const renovaciones = await sequelize.query(query, {
        replacements: [ordenIds],
        type: QueryTypes.SELECT
      });

      // Enviar emails para cada renovación
      for (const renovacion of renovaciones) {
        // Email al empleado
        if (renovacion.email_empleado && renovacion.nombre_empleado) {
          try {
            await sendRenovationAlertEmpleado(
              renovacion.email_empleado,
              renovacion.nombre_empleado,
              renovacion
            );
            resultados.empleados++;
          } catch (error) {
            console.error(`❌ Error enviando email a empleado ${renovacion.email_empleado}:`, error);
            resultados.errores++;
          }
        }

        // Email al cliente
        if (renovacion.titular_email && renovacion.titular_nombre) {
          try {
            await sendRenovationAlertCliente(
              renovacion.titular_email,
              renovacion.titular_nombre,
              renovacion
            );
            resultados.clientes++;
          } catch (error) {
            console.error(`❌ Error enviando email a cliente ${renovacion.titular_email}:`, error);
            resultados.errores++;
          }
        }
      }

      const totalEnviados = resultados.empleados + resultados.clientes;
      
      console.log('✅ Alertas enviadas correctamente');
      console.log(`   - Empleados: ${resultados.empleados}`);
      console.log(`   - Clientes: ${resultados.clientes}`);
      console.log(`   - Errores: ${resultados.errores}`);

      return {
        success: true,
        total: renovaciones.length,
        enviados: totalEnviados,
        errores: resultados.errores,
        desglose: resultados
      };
    } catch (error) {
      console.error('❌ Error enviando alertas por órdenes:', error);
      return {
        success: false,
        error: error.message,
        total: 0,
        enviados: 0
      };
    }
  }
};

