import express from 'express';
import { 
  createRole, getRoles, getRoleById, updateRole, deleteRole, changeRoleState 
} from '../controllers/role.controller.js';
import { 
  createRoleValidation, updateRoleValidation, deleteRoleValidation 
} from '../middlewares/role.middleware.js';
import { validationResult } from 'express-validator';

//  Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";

const router = express.Router();

// Middleware para capturar errores de validación
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// ✅ Rutas de gestión de roles - Con validación granular de permisos
// GET / - Listar roles: requiere gestion_roles + leer
router.get('/', authMiddleware, checkPermiso('gestion_roles', 'leer'), getRoles);

// POST / - Crear rol: requiere gestion_roles + crear
router.post('/', authMiddleware, checkPermiso('gestion_roles', 'crear'), createRoleValidation, validateResults, createRole);

// GET /:id - Ver rol: requiere gestion_roles + leer
router.get('/:id', authMiddleware, checkPermiso('gestion_roles', 'leer'), getRoleById);

// PUT /:id - Actualizar rol: requiere gestion_roles + actualizar
router.put('/:id', authMiddleware, checkPermiso('gestion_roles', 'actualizar'), updateRoleValidation, validateResults, updateRole);

// PATCH /:id/state - Cambiar estado: requiere gestion_roles + actualizar
router.patch('/:id/state', authMiddleware, checkPermiso('gestion_roles', 'actualizar'), validateResults, changeRoleState);

// DELETE /:id - Eliminar rol: requiere gestion_roles + eliminar
router.delete('/:id', authMiddleware, checkPermiso('gestion_roles', 'eliminar'), deleteRoleValidation, validateResults, deleteRole);

export default router;
