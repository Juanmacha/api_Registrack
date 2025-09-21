// src/repositories/permisoRepository.js
import Permiso from '../models/Permiso.js';

export const createPermiso = async (permiso) => Permiso.create(permiso);
export const getAllPermisos = async () => Permiso.findAll();
export const getPermisoById = async (id) => Permiso.findByPk(id);
export const updatePermiso = async (id, permiso) => Permiso.update(permiso, { where: { id_permiso: id } });
export const deletePermiso = async (id) => Permiso.destroy({ where: { id_permiso: id } });
export const changeStatePermiso = async (id, estado) =>
    Permiso.update({ estado }, { where: { id_permiso: id } });
