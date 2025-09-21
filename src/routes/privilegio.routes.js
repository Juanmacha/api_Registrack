import express from 'express';
import * as privilegioController from '../controllers/privilegio.controller.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import {
  createPrivilegioValidation,
  updatePrivilegioValidation,
  idParamValidation,
} from '../middlewares/privilegio.middleware.js';

const router = express.Router();

// Crear privilegio (valida que no exista y que el nombre sea válido)
router.post('/', roleMiddleware(["administrador"]), createPrivilegioValidation, privilegioController.createPrivilegio);

// Obtener todos
router.get('/', roleMiddleware(["administrador"]), privilegioController.getAllPrivilegios);

// Obtener por id (valida que el id sea entero válido)
router.get('/:id', roleMiddleware(["administrador"]), idParamValidation, privilegioController.getPrivilegioById);

// Actualizar (valida id y que el nombre no esté duplicado)
router.put('/:id', roleMiddleware(["administrador"]), updatePrivilegioValidation, privilegioController.updatePrivilegio);

// Eliminar (valida id)
router.delete('/:id', roleMiddleware(["administrador"]), idParamValidation, privilegioController.deletePrivilegio);

export default router;
