import { PagoRepository } from "../repositories/pago.repository.js";

export const PagoService = {
  async listarPagos() {
    return await PagoRepository.findAll();
  },

  async obtenerPago(id) {
    return await PagoRepository.findById(id);
  },

  async crearPago(data) {
    if (!data.monto || !data.metodo_pago || data.estado === undefined || !data.id_orden_servicio) {
      throw new Error("Datos incompletos");
    }
    return await PagoRepository.create(data);
  },
};
