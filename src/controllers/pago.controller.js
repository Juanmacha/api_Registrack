import { PagoService } from "../services/pago.service.js";

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
};
