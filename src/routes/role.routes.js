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

const router = express.Router();

// Middleware para capturar errores de validación
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

//  Solo ADMIN puede gestionar roles
router.get('/', authMiddleware, roleMiddleware(["administrador"]), getRoles);
router.post('/', authMiddleware, roleMiddleware(["administrador"]), createRoleValidation, validateResults, createRole);
router.get('/:id', authMiddleware, roleMiddleware(["administrador"]), getRoleById);
router.put('/:id', authMiddleware, roleMiddleware(["administrador"]), updateRoleValidation, validateResults, updateRole);
router.patch('/:id/state', authMiddleware, roleMiddleware(["administrador"]), validateResults, changeRoleState);
router.delete('/:id', authMiddleware, roleMiddleware(["administrador"]), deleteRoleValidation, validateResults, deleteRole);

export default router;
