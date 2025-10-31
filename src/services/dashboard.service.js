// src/services/dashboard.service.js
import { DashboardRepository } from "../repositories/dashboard.repository.js";

export class DashboardService {
  /**
   * Calcular datos de ingresos con análisis y tendencias
   * @param {string} periodo - '6meses', '12meses', 'custom'
   * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD) para periodo custom
   * @param {string} fechaFin - Fecha fin (YYYY-MM-DD) para periodo custom
   * @returns {Promise<Object>} Datos de ingresos procesados
   */
  async calcularIngresos(periodo = '6meses', fechaInicio = null, fechaFin = null) {
    try {
      // Calcular fechas según periodo
      const { inicio, fin } = this._calcularRangoFechas(periodo, fechaInicio, fechaFin);

      // Obtener datos del repositorio
      const ingresos = await DashboardRepository.obtenerIngresosPorMes(inicio, fin);

      if (!ingresos || ingresos.length === 0) {
        return {
          periodo,
          total_ingresos: 0,
          total_transacciones: 0,
          promedio_transaccion: 0,
          crecimiento_mensual: 0,
          ingresos_por_mes: [],
          metodos_pago: {}
        };
      }

      // Procesar datos por mes
      const ingresosPorMes = this._agruparPorMes(ingresos);

      // Calcular totales
      const totalIngresos = ingresos.reduce((sum, item) => sum + parseFloat(item.total_ingresos || 0), 0);
      const totalTransacciones = ingresos.reduce((sum, item) => sum + parseInt(item.total_transacciones || 0), 0);
      const promedioTransaccion = totalTransacciones > 0 ? totalIngresos / totalTransacciones : 0;

      // Calcular crecimiento mensual
      const crecimientoMensual = this._calcularCrecimiento(ingresosPorMes);

      // Agrupar por método de pago
      const metodosPago = this._agruparPorMetodo(ingresos);

      return {
        periodo,
        fecha_inicio: inicio,
        fecha_fin: fin,
        total_ingresos: parseFloat(totalIngresos.toFixed(2)),
        total_transacciones: totalTransacciones,
        promedio_transaccion: parseFloat(promedioTransaccion.toFixed(2)),
        crecimiento_mensual: crecimientoMensual,
        ingresos_por_mes: ingresosPorMes,
        metodos_pago: metodosPago
      };
    } catch (error) {
      console.error('❌ Error en calcularIngresos:', error);
      throw error;
    }
  }

  /**
   * Calcular resumen de gestión de servicios
   * @param {string} periodo - '6meses', '12meses', 'todo'
   * @returns {Promise<Object>} Resumen de servicios
   */
  async calcularResumenServicios(periodo = '12meses') {
    try {
      const servicios = await DashboardRepository.obtenerResumenServicios(periodo);

      if (!servicios || servicios.length === 0) {
        return {
          total_servicios: 0,
          total_solicitudes: 0,
          servicios: [],
          servicios_mas_solicitados: [],
          servicios_menos_solicitados: []
        };
      }

      // Calcular totales
      const totalServicios = servicios.length;
      const totalSolicitudes = servicios.reduce((sum, s) => sum + parseInt(s.total_solicitudes || 0), 0);

      // Procesar cada servicio
      const serviciosProcesados = servicios.map(servicio => ({
        id_servicio: servicio.id_servicio,
        nombre: servicio.servicio,
        total_solicitudes: parseInt(servicio.total_solicitudes || 0),
        porcentaje_uso: parseFloat(servicio.porcentaje_uso || 0),
        estado_distribucion: {
          Pendiente: parseInt(servicio.pendientes || 0),
          'En Proceso': parseInt(servicio.en_proceso || 0),
          Finalizado: parseInt(servicio.finalizados || 0),
          Anulado: parseInt(servicio.anulados || 0)
        },
        precio_base: parseFloat(servicio.precio_base || 0)
      }));

      // Top 3 más solicitados
      const masSolicitados = [...serviciosProcesados]
        .sort((a, b) => b.total_solicitudes - a.total_solicitudes)
        .slice(0, 3)
        .map(s => ({ nombre: s.nombre, cantidad: s.total_solicitudes }));

      // Top 3 menos solicitados
      const menosSolicitados = [...serviciosProcesados]
        .sort((a, b) => a.total_solicitudes - b.total_solicitudes)
        .slice(0, 3)
        .map(s => ({ nombre: s.nombre, cantidad: s.total_solicitudes }));

      return {
        total_servicios: totalServicios,
        total_solicitudes: totalSolicitudes,
        servicios: serviciosProcesados,
        servicios_mas_solicitados: masSolicitados,
        servicios_menos_solicitados: menosSolicitados
      };
    } catch (error) {
      console.error('❌ Error en calcularResumenServicios:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen general del dashboard con todos los KPIs
   * @param {string} periodo - '6meses', '12meses', 'custom'
   * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD) para periodo custom
   * @param {string} fechaFin - Fecha fin (YYYY-MM-DD) para periodo custom
   * @returns {Promise<Object>} Resumen completo
   */
  async obtenerResumenGeneral(periodo = '6meses', fechaInicio = null, fechaFin = null) {
    try {
      // Calcular fechas según periodo
      const { inicio, fin } = this._calcularRangoFechas(periodo, fechaInicio, fechaFin);

      // Obtener KPIs generales del repositorio
      const kpisData = await DashboardRepository.obtenerKPIsGenerales(inicio, fin);

      // Obtener datos de ingresos
      const ingresos = await this.calcularIngresos(periodo, fechaInicio, fechaFin);

      // Obtener resumen de servicios
      const servicios = await this.calcularResumenServicios(periodo);

      // Procesar KPIs
      const kpis = {
        ingresos_totales: ingresos.total_ingresos,
        solicitudes_totales: parseInt(kpisData.solicitudes_totales || 0),
        solicitudes_pendientes: parseInt(kpisData.solicitudes_pendientes || 0),
        solicitudes_inactivas: parseInt(kpisData.solicitudes_inactivas || 0),
        tasa_finalizacion: this._calcularTasaFinalizacion(kpisData),
        clientes_activos: parseInt(kpisData.clientes_unicos || 0)
      };

      // Generar alertas
      const alertas = this._generarAlertas(kpis);

      // Resumen de ingresos del mes actual vs anterior
      const resumenIngresos = this._calcularResumenIngresosMensual(ingresos.ingresos_por_mes);

      return {
        periodo,
        kpis,
        alertas,
        resumen_ingresos: resumenIngresos,
        resumen_servicios: {
          total_servicios: servicios.total_servicios,
          total_solicitudes: servicios.total_solicitudes,
          mas_popular: servicios.servicios_mas_solicitados[0]?.nombre || 'N/A',
          menos_popular: servicios.servicios_menos_solicitados[0]?.nombre || 'N/A'
        }
      };
    } catch (error) {
      console.error('❌ Error en obtenerResumenGeneral:', error);
      throw error;
    }
  }

  /**
   * Obtener tabla de servicios pendientes
   * @param {number} diasMinimos - Días mínimos en espera (default: 0)
   * @returns {Promise<Object>} Lista de servicios pendientes
   */
  async obtenerServiciosPendientes(diasMinimos = 0) {
    try {
      const pendientes = await DashboardRepository.obtenerServiciosPendientes(diasMinimos);

      return {
        total: pendientes.length,
        filtro_dias: diasMinimos,
        data: pendientes.map(item => ({
          id_orden_servicio: item.id_orden_servicio,
          numero_expediente: item.numero_expediente,
          cliente: item.cliente,
          cliente_email: item.cliente_email,
          servicio: item.servicio,
          fecha_creacion: item.fecha_creacion,
          dias_en_espera: parseInt(item.dias_en_espera || 0),
          empleado_asignado: item.empleado_asignado || 'Sin asignar',
          ultima_actualizacion: item.ultima_actualizacion
        }))
      };
    } catch (error) {
      console.error('❌ Error en obtenerServiciosPendientes:', error);
      throw error;
    }
  }

  /**
   * Obtener tabla de solicitudes inactivas
   * @param {number} diasMinimos - Días mínimos de inactividad (default: 30)
   * @returns {Promise<Object>} Lista de solicitudes inactivas
   */
  async obtenerSolicitudesInactivas(diasMinimos = 30) {
    try {
      const inactivas = await DashboardRepository.obtenerSolicitudesInactivas(diasMinimos);

      return {
        total: inactivas.length,
        filtro_dias: diasMinimos,
        data: inactivas.map(item => ({
          id_orden_servicio: item.id_orden_servicio,
          numero_expediente: item.numero_expediente,
          cliente: item.cliente,
          cliente_email: item.cliente_email,
          servicio: item.servicio,
          estado: item.estado,
          fecha_creacion: item.fecha_creacion,
          ultima_actualizacion: item.ultima_actualizacion,
          dias_inactivos: parseInt(item.dias_inactivos || 0),
          ultimo_movimiento: item.ultimo_movimiento || 'Sin movimientos registrados',
          empleado_asignado: item.empleado_asignado || 'Sin asignar'
        }))
      };
    } catch (error) {
      console.error('❌ Error en obtenerSolicitudesInactivas:', error);
      throw error;
    }
  }

  /**
   * Obtener renovaciones de marca próximas a vencer
   * @param {number} diasAnticipacion - Días de anticipación (default: 90)
   * @returns {Promise<Object>} Lista de renovaciones próximas a vencer
   */
  async obtenerRenovacionesProximas(diasAnticipacion = 90) {
    try {
      const renovaciones = await DashboardRepository.obtenerRenovacionesProximas(diasAnticipacion);

      // Calcular resumen por urgencia
      const porUrgencia = {
        critico: renovaciones.filter(r => r.nivel_urgencia === 'crítico').length,
        alto: renovaciones.filter(r => r.nivel_urgencia === 'alto').length,
        medio: renovaciones.filter(r => r.nivel_urgencia === 'medio').length,
        bajo: renovaciones.filter(r => r.nivel_urgencia === 'bajo').length
      };

      return {
        total: renovaciones.length,
        dias_anticipacion: diasAnticipacion,
        por_urgencia: porUrgencia,
        renovaciones: renovaciones.map(item => ({
          id_orden_servicio: item.id_orden_servicio,
          numero_expediente: item.numero_expediente,
          empresa: item.empresa,
          fecha_finalizacion: item.fecha_finalizacion,
          fecha_vencimiento: item.fecha_vencimiento,
          dias_restantes: parseInt(item.dias_restantes || 0),
          nivel_urgencia: item.nivel_urgencia,
          empleado_asignado: item.nombre_empleado || 'Sin asignar',
          email_empleado: item.email_empleado || null,
          titular_nombre: item.titular_nombre,
          titular_email: item.titular_email || null
        }))
      };
    } catch (error) {
      console.error('❌ Error en obtenerRenovacionesProximas:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS (HELPERS)
  // ========================================

  /**
   * Calcular rango de fechas según periodo
   * @private
   */
  _calcularRangoFechas(periodo, fechaInicio, fechaFin) {
    const hoy = new Date();
    let inicio, fin;

    if (periodo === 'custom' && fechaInicio && fechaFin) {
      inicio = fechaInicio;
      fin = fechaFin;
    } else if (periodo === '12meses') {
      const hace12Meses = new Date(hoy);
      hace12Meses.setMonth(hoy.getMonth() - 12);
      inicio = hace12Meses.toISOString().split('T')[0];
      fin = hoy.toISOString().split('T')[0];
    } else {
      // Default: 6 meses
      const hace6Meses = new Date(hoy);
      hace6Meses.setMonth(hoy.getMonth() - 6);
      inicio = hace6Meses.toISOString().split('T')[0];
      fin = hoy.toISOString().split('T')[0];
    }

    return { inicio, fin };
  }

  /**
   * Agrupar ingresos por mes
   * @private
   */
  _agruparPorMes(ingresos) {
    const mesesMap = {};

    ingresos.forEach(item => {
      const mes = item.mes;
      if (!mesesMap[mes]) {
        mesesMap[mes] = {
          mes,
          mes_nombre: this._formatearMes(mes),
          total: 0,
          transacciones: 0,
          metodos: {
            Efectivo: 0,
            Transferencia: 0,
            Tarjeta: 0,
            Cheque: 0
          }
        };
      }

      mesesMap[mes].total += parseFloat(item.total_ingresos || 0);
      mesesMap[mes].transacciones += parseInt(item.total_transacciones || 0);
      
      if (item.metodo_pago) {
        mesesMap[mes].metodos[item.metodo_pago] = parseFloat(item.total_ingresos || 0);
      }
    });

    return Object.values(mesesMap).sort((a, b) => b.mes.localeCompare(a.mes));
  }

  /**
   * Agrupar por método de pago
   * @private
   */
  _agruparPorMetodo(ingresos) {
    const metodos = {
      Efectivo: 0,
      Transferencia: 0,
      Tarjeta: 0,
      Cheque: 0
    };

    ingresos.forEach(item => {
      if (item.metodo_pago) {
        metodos[item.metodo_pago] += parseFloat(item.total_ingresos || 0);
      }
    });

    return metodos;
  }

  /**
   * Calcular crecimiento mensual promedio
   * @private
   */
  _calcularCrecimiento(ingresosPorMes) {
    if (ingresosPorMes.length < 2) return 0;

    const ordenado = [...ingresosPorMes].sort((a, b) => a.mes.localeCompare(b.mes));
    const mesAnterior = ordenado[ordenado.length - 2].total;
    const mesActual = ordenado[ordenado.length - 1].total;

    if (mesAnterior === 0) return 0;

    return parseFloat((((mesActual - mesAnterior) / mesAnterior) * 100).toFixed(2));
  }

  /**
   * Formatear mes (2025-04 -> Abril 2025)
   * @private
   */
  _formatearMes(mes) {
    const [year, month] = mes.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[parseInt(month) - 1]} ${year}`;
  }

  /**
   * Calcular tasa de finalización
   * @private
   */
  _calcularTasaFinalizacion(kpisData) {
    const finalizadas = parseInt(kpisData.solicitudes_finalizadas || 0);
    const total = parseInt(kpisData.total_solicitudes || 0);
    
    if (total === 0) return 0;
    
    return parseFloat(((finalizadas / total) * 100).toFixed(2));
  }

  /**
   * Generar alertas según KPIs
   * @private
   */
  _generarAlertas(kpis) {
    const alertas = [];

    if (kpis.solicitudes_inactivas > 0) {
      alertas.push({
        tipo: 'inactividad',
        nivel: kpis.solicitudes_inactivas > 10 ? 'alta' : 'media',
        cantidad: kpis.solicitudes_inactivas,
        mensaje: `${kpis.solicitudes_inactivas} solicitudes sin actualizar por más de 30 días`
      });
    }

    if (kpis.solicitudes_pendientes > 20) {
      alertas.push({
        tipo: 'pendientes',
        nivel: kpis.solicitudes_pendientes > 50 ? 'alta' : 'media',
        cantidad: kpis.solicitudes_pendientes,
        mensaje: `${kpis.solicitudes_pendientes} solicitudes pendientes de atención`
      });
    }

    if (kpis.tasa_finalizacion < 50) {
      alertas.push({
        tipo: 'finalizacion',
        nivel: 'media',
        cantidad: kpis.tasa_finalizacion,
        mensaje: `Tasa de finalización baja: ${kpis.tasa_finalizacion}%`
      });
    }

    return alertas;
  }

  /**
   * Calcular resumen de ingresos mes actual vs anterior
   * @private
   */
  _calcularResumenIngresosMensual(ingresosPorMes) {
    if (ingresosPorMes.length === 0) {
      return {
        total: 0,
        mes_actual: 0,
        mes_anterior: 0,
        crecimiento: 0
      };
    }

    const ordenado = [...ingresosPorMes].sort((a, b) => b.mes.localeCompare(a.mes));
    const mesActual = ordenado[0]?.total || 0;
    const mesAnterior = ordenado[1]?.total || 0;

    const crecimiento = mesAnterior > 0 
      ? parseFloat((((mesActual - mesAnterior) / mesAnterior) * 100).toFixed(2))
      : 0;

    const total = ingresosPorMes.reduce((sum, m) => sum + m.total, 0);

    return {
      total: parseFloat(total.toFixed(2)),
      mes_actual: parseFloat(mesActual.toFixed(2)),
      mes_anterior: parseFloat(mesAnterior.toFixed(2)),
      crecimiento
    };
  }
}

