import sequelize from "../config/db.js";
import { QueryTypes } from "sequelize";

export const PagoRepository = {
  async findAll() {
    return await sequelize.query("SELECT * FROM pagos", { type: QueryTypes.SELECT });
  },

  async findById(id) {
    const result = await sequelize.query(
      "SELECT * FROM pagos WHERE id_pago = ?",
      { replacements: [id], type: QueryTypes.SELECT }
    );
    return result[0];
  },

  async create(pago) {
    const [result] = await sequelize.query(
      `INSERT INTO pagos (
        monto, metodo_pago, estado, comprobante_url, id_orden_servicio,
        transaction_id, gateway, gateway_data, verified_at, verified_by,
        verification_method, numero_comprobante
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          pago.monto, 
          pago.metodo_pago, 
          pago.estado || 'Pendiente', 
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
    return { id_pago: result, ...pago };
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
  }

};
