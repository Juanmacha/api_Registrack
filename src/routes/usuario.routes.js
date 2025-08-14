import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { getUsuarios, getUsuarioPorId, updateUsuario, deleteUsuario } from '../controllers/user.controller.js';
import { validarNuevoUsuario, validarActualizarUsuario } from '../middlewares/validarUsuario.js';

const router = Router();

router.post('/register', validarNuevoUsuario, register);
router.post('/login', login);
router.get('/', getUsuarios);
router.get('/:id', getUsuarioPorId);
router.put('/:id', validarActualizarUsuario, updateUsuario);
router.delete('/:id', deleteUsuario);

export default router;