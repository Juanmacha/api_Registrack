import DetalleServicioOrdenProceso from "../models/DetalleServicioOrdenProceso.js";
import DetalleOrdenServicio from "../models/DetalleOrdenServicio.js";
import Proceso from "../models/Proceso.js";
import Servicio from "../models/Servicio.js";

export const listByDetalle = async (req, res) => {
  try {
    const { idDetalle } = req.params;
    const items = await DetalleServicioOrdenProceso.findAll({ where: { id_detalle_orden: idDetalle } });
    res.json({ mensaje: "Procesos del detalle", data: items });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al listar procesos del detalle", error: err.message });
  }
};

export const createForDetalle = async (req, res) => {
  try {
    const { idDetalle } = req.params;
    const { id_servicio, id_proceso, monto_a_pagar } = req.body;
    // FK checks
    const detalle = await DetalleOrdenServicio.findByPk(idDetalle);
    if (!detalle) return res.status(404).json({ mensaje: "Detalle de orden no encontrado" });
    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado" });
    const proceso = await Proceso.findByPk(id_proceso);
    if (!proceso) return res.status(404).json({ mensaje: "Proceso no encontrado" });
    const creado = await DetalleServicioOrdenProceso.create({ id_detalle_orden: idDetalle, id_servicio, id_proceso, monto_a_pagar });
    res.status(201).json({ mensaje: "Proceso agregado al detalle", data: creado });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible agregar el proceso", error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await DetalleServicioOrdenProceso.findByPk(id);
    if (!item) return res.status(404).json({ mensaje: "Registro no encontrado" });
    await item.update(req.body);
    res.json({ mensaje: "Registro actualizado", data: item });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible actualizar el registro", error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await DetalleServicioOrdenProceso.findByPk(id);
    if (!item) return res.status(404).json({ mensaje: "Registro no encontrado" });
    await item.destroy();
    res.json({ mensaje: "Registro eliminado" });
  } catch (err) {
    res.status(500).json({ mensaje: "No fue posible eliminar el registro", error: err.message });
  }
};


