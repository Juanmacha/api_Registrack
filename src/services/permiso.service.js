// src/services/permisoService.js
import * as permisoRepository from '../repositories/permiso.repository.js';

const permisoService = {
  createPermiso: (permiso) => permisoRepository.createPermiso(permiso),
  getAllPermisos: () => permisoRepository.getAllPermisos(),
  getPermisoById: (id) => permisoRepository.getPermisoById(id),
  updatePermiso: (id, permiso) => permisoRepository.updatePermiso(id, permiso),
  deletePermiso: (id) => permisoRepository.deletePermiso(id),
  changeStatePermiso: (id, estado) => permisoRepository.changeStatePermiso(id, estado)
};

export default permisoService;
