import sequelize from "../config/db.js";
import { QueryTypes } from "sequelize";

export const PagoRepository = {
  async findAll() {
    return await sequelize.query(
      `SELECT 
        id_pago,
        id_orden_servicio,
        monto,
        metodo_pago,
        estado,
        COALESCE(fecha_pago, created_at) as fecha_pago,
        referencia,
        comprobante_url,
        observaciones,
        transaction_id,
        gateway,
        gateway_data,
        verified_at,
        verified_by,
        verification_method,
        numero_comprobante,
        created_at,
        updated_at
      FROM pagos 
      ORDER BY created_at DESC`, 
      { type: QueryTypes.SELECT }
    );
  },

  /**
   * ✅ NUEVO: Obtener todos los pagos con información completa (usuario, solicitud, servicio)
   */
  async findAllWithDetails() {
    return await sequelize.query(
      `SELECT 
        -- Información del pago
        p.id_pago,
        p.monto as monto_pagado,
        p.metodo_pago,
        p.estado as estado_pago,
        p.transaction_id,
        p.gateway,
        p.comprobante_url,
        p.numero_comprobante,
        p.verified_at,
        p.verification_method,
        COALESCE(p.fecha_pago, p.created_at) as fecha_pago,
        p.created_at,
        p.updated_at,
        
        -- Información de la solicitud/orden
        os.id_orden_servicio,
        os.numero_expediente,
        os.fecha_creacion as fecha_creacion_solicitud,
        os.estado as estado_solicitud,
        os.total_estimado as total_orden_servicio,
        os.pais,
        os.ciudad,
        os.codigo_postal,
        os.nombrecompleto,
        os.correoelectronico,
        os.telefono as telefono_solicitud,
        
        -- Información del servicio
        s.id_servicio,
        s.nombre as nombre_servicio,
        s.descripcion as descripcion_servicio,
        s.precio_base as precio_base_servicio,
        
        -- Información del cliente
        c.id_cliente,
        c.marca,
        c.tipo_persona,
        
        -- Información del usuario (cliente)
        u.id_usuario,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario,
        u.correo as correo_usuario,
        u.telefono as telefono_usuario,
        u.tipo_documento as tipo_documento_usuario,
        u.documento as documento_usuario,
        
        -- Información de la empresa (si aplica)
        e.id_empresa,
        e.nombre as nombre_empresa,
        e.nit as nit_empresa,
        e.tipo_empresa
      FROM pagos p
      INNER JOIN ordenes_de_servicios os ON p.id_orden_servicio = os.id_orden_servicio
      INNER JOIN servicios s ON os.id_servicio = s.id_servicio
      INNER JOIN clientes c ON os.id_cliente = c.id_cliente
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN empresas e ON os.id_empresa = e.id_empresa
      ORDER BY p.created_at DESC`, 
      { type: QueryTypes.SELECT }
    );
  },

  async findById(id) {
    const result = await sequelize.query(
      `SELECT 
        id_pago,
        id_orden_servicio,
        monto,
        metodo_pago,
        estado,
        COALESCE(fecha_pago, created_at) as fecha_pago,
        referencia,
        comprobante_url,
        observaciones,
        transaction_id,
        gateway,
        gateway_data,
        verified_at,
        verified_by,
        verification_method,
        numero_comprobante,
        created_at,
        updated_at
      FROM pagos 
      WHERE id_pago = ?`,
      { replacements: [id], type: QueryTypes.SELECT }
    );
    return result[0];
  },

  async create(pago) {
    // Si el estado es "Pagado", establecer fecha_pago automáticamente
    const fechaPago = (pago.estado === 'Pagado') 
      ? (pago.fecha_pago || new Date()) 
      : null;
    
    const [result] = await sequelize.query(
      `INSERT INTO pagos (
        monto, metodo_pago, estado, fecha_pago, comprobante_url, id_orden_servicio,
        transaction_id, gateway, gateway_data, verified_at, verified_by,
        verification_method, numero_comprobante
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          pago.monto, 
          pago.metodo_pago, 
          pago.estado || 'Pendiente',
          fechaPago, // ✅ Agregado fecha_pago
          pago.comprobante_url || null, 
          pago.id_orden_servicio || null,
          pago.transaction_id || null,
          pago.gateway || 'mock',
          pago.gateway_data ? JSON.stringify(pago.gateway_data) : null,
          pago.verified_at || null,
          pago.verified_by || null,
          pago.verification_method || 'mock',
          pago.numero_comprobante || null
        ],
        type: QueryTypes.INSERT
      }
    );
    return { id_pago: result, ...pago, fecha_pago: fechaPago };
  },

  /**
   * ✅ NUEVO: Buscar pago por transaction_id
   */
  async findByTransactionId(transactionId) {
    const result = await sequelize.query(
      "SELECT * FROM pagos WHERE transaction_id = ?",
      { replacements: [transactionId], type: QueryTypes.SELECT }
    );
    return result[0];
  },

  /**
   * ✅ NUEVO: Obtener orden de servicio con total_estimado y precio_base del servicio
   */
  async getOrdenServicioById(idOrdenServicio) {
    const result = await sequelize.query(
      `SELECT 
        os.id_orden_servicio,
        os.total_estimado,
        os.estado,
        os.id_servicio,
        os.id_cliente,
        s.precio_base as precio_base_servicio
      FROM ordenes_de_servicios os
      INNER JOIN servicios s ON os.id_servicio = s.id_servicio
      WHERE os.id_orden_servicio = ?`,
      { replacements: [idOrdenServicio], type: QueryTypes.SELECT }
    );
    return result[0];
  },

  /**
   * ✅ NUEVO: Actualizar estado de pago
   */
  async updateStatus(id, data) {
    const [result] = await sequelize.query(
      `UPDATE pagos SET 
        estado = ?,
        verified_at = ?,
        verified_by = ?,
        verification_method = ?,
        numero_comprobante = ?
      WHERE id_pago = ?`,
      {
        replacements: [
          data.estado,
          data.verified_at,
          data.verified_by,
          data.verification_method,
          data.numero_comprobante,
          id
        ],
        type: QueryTypes.UPDATE
      }
    );
    return result;
  },

  /**
   * ✅ NUEVO: Actualizar comprobante
   */
  async updateComprobante(id, comprobanteUrl, numeroComprobante) {
    const [result] = await sequelize.query(
      `UPDATE pagos SET 
        comprobante_url = ?,
        numero_comprobante = ?
      WHERE id_pago = ?`,
      {
        replacements: [comprobanteUrl, numeroComprobante, id],
        type: QueryTypes.UPDATE
      }
    );
    return result;
  },

  /**
   * ✅ NUEVO: Buscar pagos por orden de servicio
   */
  async findByOrdenServicio(idOrdenServicio) {
    const result = await sequelize.query(
      "SELECT * FROM pagos WHERE id_orden_servicio = ? ORDER BY created_at DESC",
      { replacements: [idOrdenServicio], type: QueryTypes.SELECT }
    );
    return result;
  },

  /**
   * ✅ NUEVO: Obtener pago con información completa de solicitud y usuario
   * Incluye precios reales del servicio y totales de la orden
   */
  async findByIdWithDetails(id) {
    const result = await sequelize.query(
      `SELECT 
        -- Información del pago
        p.id_pago,
        p.monto as monto_pagado,
        p.metodo_pago,
        p.estado as estado_pago,
        p.transaction_id,
        p.gateway,
        p.comprobante_url,
        p.numero_comprobante,
        p.verified_at,
        p.verification_method,
        COALESCE(p.fecha_pago, p.created_at) as fecha_pago,
        
        -- Información de la solicitud/orden
        os.id_orden_servicio,
        os.numero_expediente,
        os.fecha_creacion as fecha_creacion_solicitud,
        os.estado as estado_solicitud,
        os.total_estimado as total_orden_servicio,
        os.pais,
        os.ciudad,
        os.codigo_postal,
        os.tipodepersona,
        os.tipodedocumento,
        os.numerodedocumento,
        os.nombrecompleto,
        os.correoelectronico,
        os.telefono as telefono_solicitud,
        os.direccion,
        os.tipodeentidadrazonsocial,
        os.nombredelaempresa,
        os.nit,
        
        -- Información del servicio (con precios reales)
        s.id_servicio,
        s.nombre as nombre_servicio,
        s.descripcion as descripcion_servicio,
        s.precio_base as precio_base_servicio,
        
        -- Información del cliente
        c.id_cliente,
        c.marca,
        c.tipo_persona,
        
        -- Información del usuario que hizo el pago (cliente)
        u.id_usuario,
        u.nombre as nombre_usuario,
        u.apellido as apellido_usuario,
        u.correo as correo_usuario,
        u.telefono as telefono_usuario,
        u.tipo_documento as tipo_documento_usuario,
        u.documento as documento_usuario,
        
        -- Información de la empresa (si aplica)
        e.id_empresa,
        e.nombre as nombre_empresa,
        e.nit as nit_empresa,
        e.tipo_empresa,
        e.direccion as direccion_empresa,
        e.telefono as telefono_empresa,
        e.email as email_empresa,
        e.ciudad as ciudad_empresa,
        e.pais as pais_empresa
      FROM pagos p
      INNER JOIN ordenes_de_servicios os ON p.id_orden_servicio = os.id_orden_servicio
      INNER JOIN servicios s ON os.id_servicio = s.id_servicio
      INNER JOIN clientes c ON os.id_cliente = c.id_cliente
      INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
      LEFT JOIN empresas e ON os.id_empresa = e.id_empresa
      WHERE p.id_pago = ?`,
      { replacements: [id], type: QueryTypes.SELECT }
    );
    return result[0];
  }

};
