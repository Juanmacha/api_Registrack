import permisoService from '../services/permiso.service.js';

export const createPermiso = async (req, res) => {
  try {
    const permiso = await permisoService.createPermiso(req.body);
    res.status(201).json(permiso);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al crear permiso' });
  }
};

export const getAllPermisos = async (req, res) => {
  try {
    const permisos = await permisoService.getAllPermisos();
    res.json(permisos);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al obtener permisos' });
  }
};

export const getPermisoById = async (req, res) => {
  try {
    const permiso = await permisoService.getPermisoById(req.params.id);
    if (!permiso) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json(permiso);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al obtener permiso' });
  }
};

export const updatePermiso = async (req, res) => {
  try {
    const updated = await permisoService.updatePermiso(req.params.id, req.body);
    if (!updated[0]) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json({ mensaje: 'Permiso actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al actualizar permiso' });
  }
};

export const deletePermiso = async (req, res) => {
  try {
    const deleted = await permisoService.deletePermiso(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json({ mensaje: 'Permiso eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al eliminar permiso' });
  }
};

export const changeStatePermiso = async (req, res) => {
  try {
    const { estado } = req.body;
    const updated = await permisoService.changeStatePermiso(req.params.id, estado);
    if (!updated[0]) return res.status(404).json({ error: 'Permiso no encontrado' });
    res.json({ mensaje: `Estado del permiso actualizado a ${estado}` });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error al cambiar estado del permiso' });
  }
};
