import Servicio from "../models/Servicio.js";
import Proceso from "../models/Proceso.js";
import "../models/ServicioProceso.js"; // establece las asociaciones

export const listProcesosByServicio = async (req, res) => {
  try {
    const { idServicio } = req.params;
    const servicio = await Servicio.findByPk(idServicio, { include: [{ model: Proceso, as: "procesos" }] });
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado" });
    res.json({ mensaje: "Procesos del servicio", data: servicio.procesos || [] });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al listar procesos del servicio", error: err.message });
  }
};

export const addProcesoToServicio = async (req, res) => {
  try {
    const { idServicio } = req.params;
    const { id_proceso } = req.body;
    const servicio = await Servicio.findByPk(idServicio);
    const proceso = await Proceso.findByPk(id_proceso);
    if (!servicio || !proceso) return res.status(404).json({ mensaje: "Servicio o Proceso no encontrado" });
    await servicio.addProceso(proceso);
    res.status(201).json({ mensaje: "Proceso asociado al servicio", data: { id_servicio: idServicio, id_proceso } });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible asociar el proceso", error: err.message });
  }
};

export const removeProcesoFromServicio = async (req, res) => {
  try {
    const { idServicio, idProceso } = req.params;
    const servicio = await Servicio.findByPk(idServicio);
    const proceso = await Proceso.findByPk(idProceso);
    if (!servicio || !proceso) return res.status(404).json({ mensaje: "Servicio o Proceso no encontrado" });
    await servicio.removeProceso(proceso);
    res.json({ mensaje: "Proceso removido del servicio" });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible remover el proceso", error: err.message });
  }
};


