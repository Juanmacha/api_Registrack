import DetalleOrdenServicio from "../models/DetalleOrdenServicio.js";
import OrdenServicio from "../models/OrdenServicio.js";
import Servicio from "../models/Servicio.js";

export const listByOrden = async (req, res) => {
  try {
    const { idOrden } = req.params;
    const detalles = await DetalleOrdenServicio.findAll({ where: { id_orden_servicio: idOrden } });
    res.json({ mensaje: "Detalles de la orden", data: detalles });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al listar detalles", error: err.message });
  }
};

export const createForOrden = async (req, res) => {
  try {
    const { idOrden } = req.params;
    const { id_servicio } = req.body;
    // FK checks
    const orden = await OrdenServicio.findByPk(idOrden);
    if (!orden) return res.status(404).json({ mensaje: "Orden de servicio no encontrada" });
    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado" });
    const creado = await DetalleOrdenServicio.create({ id_orden_servicio: idOrden, id_servicio });
    res.status(201).json({ mensaje: "Detalle creado", data: creado });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible crear el detalle", error: err.message });
  }
};

export const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const detalle = await DetalleOrdenServicio.findByPk(id);
    if (!detalle) return res.status(404).json({ mensaje: "Detalle no encontrado" });
    await detalle.update({ estado, fecha_estado: new Date() });
    res.json({ mensaje: "Estado del detalle actualizado", data: detalle });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible actualizar el detalle", error: err.message });
  }
};


