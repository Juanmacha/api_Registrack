// src/routes/permisoRoutes.js
import { Router } from 'express';
import {
  createPermiso,
  getAllPermisos,
  getPermisoById,
  updatePermiso,
  deletePermiso
} from '../controllers/permisoController.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import {
  createPermisoValidation,
  updatePermisoValidation,
  idParamValidation
} from '../middlewares/permiso.middleware.js';

const router = Router();

// Rutas de permisos solo para administradores

// Crear permiso con validación
router.post(
  '/',
  roleMiddleware(["administrador"]),
  createPermisoValidation,  // 👈 Validación antes de crear
  createPermiso
);

// Obtener todos los permisos
router.get(
  '/',
  roleMiddleware(["administrador"]),
  getAllPermisos
);

// Obtener permiso por ID con validación de ID
router.get(
  '/:id',
  roleMiddleware(["administrador"]),
  idParamValidation,
  getPermisoById
);

// Actualizar permiso con validación
router.put(
  '/:id',
  roleMiddleware(["administrador"]),
  updatePermisoValidation,  // 👈 Validación antes de actualizar
  updatePermiso
);

// Eliminar permiso con validación de ID
router.delete(
  '/:id',
  roleMiddleware(["administrador"]),
  idParamValidation,
  deletePermiso
);

export default router;
