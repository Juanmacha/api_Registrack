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
      `INSERT INTO pagos (monto, metodo_pago, estado, comprobante_url, id_orden_servicio)
       VALUES (?, ?, ?, ?, ?)`,
      {
        replacements: [pago.monto, pago.metodo_pago, pago.estado, pago.comprobante_url, pago.id_orden_servicio],
        type: QueryTypes.INSERT
      }
    );
    return { id_pago: result, ...pago };
  },

};
