import privilegioService from '../services/privilegio.service.js';

export const createPrivilegio = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    const privilegio = await privilegioService.createPrivilegio(req.body);
    res.status(201).json(privilegio);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al crear privilegio' });
  }
};

export const getAllPrivilegios = async (req, res) => {
  try {
    const privilegios = await privilegioService.getAllPrivilegios();
    res.json(privilegios);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al obtener privilegios' });
  }
};

export const getPrivilegioById = async (req, res) => {
  try {
    const privilegio = await privilegioService.getPrivilegioById(req.params.id);
    if (!privilegio) return res.status(404).json({ error: 'Privilegio no encontrado' });
    res.json(privilegio);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al obtener privilegio' });
  }
};

export const updatePrivilegio = async (req, res) => {
  try {
    const updated = await privilegioService.updatePrivilegio(req.params.id, req.body);
    if (!updated[0]) return res.status(404).json({ error: 'Privilegio no encontrado' });
    res.json({ mensaje: 'Privilegio actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al actualizar privilegio' });
  }
};

export const deletePrivilegio = async (req, res) => {
  try {
    const deleted = await privilegioService.deletePrivilegio(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Privilegio no encontrado' });
    res.json({ mensaje: 'Privilegio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al eliminar privilegio' });
  }
};
