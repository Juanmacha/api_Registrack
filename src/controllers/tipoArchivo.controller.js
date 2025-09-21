import TipoArchivo from "../models/TipoArchivo.js";

export const getAll = async (_req, res) => {
  try {
    const tipos = await TipoArchivo.findAll();
    res.json({ mensaje: "Tipos de archivo", data: tipos });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al listar tipos", error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { descripcion } = req.body;
    const creado = await TipoArchivo.create({ descripcion });
    res.status(201).json({ mensaje: "Tipo de archivo creado", data: creado });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible crear el tipo", error: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;
    const tipo = await TipoArchivo.findByPk(id);
    if (!tipo) return res.status(404).json({ mensaje: "Tipo de archivo no encontrado" });
    await tipo.update({ descripcion });
    res.json({ mensaje: "Tipo de archivo actualizado", data: tipo });
  } catch (err) {
    res.status(400).json({ mensaje: "No fue posible actualizar el tipo", error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const tipo = await TipoArchivo.findByPk(id);
    if (!tipo) return res.status(404).json({ mensaje: "Tipo de archivo no encontrado" });
    await tipo.destroy();
    res.json({ mensaje: "Tipo de archivo eliminado" });
  } catch (err) {
    res.status(500).json({ mensaje: "No fue posible eliminar el tipo", error: err.message });
  }
};


