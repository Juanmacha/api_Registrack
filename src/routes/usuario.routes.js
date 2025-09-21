import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { getUsuarios, getUsuarioPorId, updateUsuario, deleteUsuario, createUserByAdmin, changeUserStatus } from '../controllers/user.controller.js';
import { validarNuevoUsuario, validarActualizarUsuario } from '../middlewares/validarUsuario.js';
import { validarCrearUsuarioPorAdmin } from '../middlewares/validarUsuarioAdmin.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validarForgotPassword, validarResetPassword } from '../middlewares/validarAuth.js';

// Importar nuevos middlewares de validación
import { 
  validateUserRegistration,
  validateUserLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCreateUserByAdmin,
  validateUpdateUser,
  validateChangeUserStatus
} from "../middlewares/validation/auth.validation.js";

const router = Router();

// Rutas públicas de autenticación
router.post('/registrar', validateUserRegistration, validarNuevoUsuario, register);
router.post('/login', validateUserLogin, login);

// Rutas para recuperación de contraseña
router.post('/forgot-password', validateForgotPassword, validarForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, validarResetPassword, resetPassword);

// Rutas protegidas - Solo administradores y empleados
router.get('/', authMiddleware, roleMiddleware(["administrador", "empleado"]), getUsuarios);
router.get('/:id', authMiddleware, roleMiddleware(["administrador", "empleado"]), getUsuarioPorId);
router.delete('/:id', authMiddleware, roleMiddleware(["administrador", "empleado"]), deleteUsuario);

// Ruta de actualización - Todos los roles autenticados (con validación en controlador)
router.put('/:id', authMiddleware, validateUpdateUser, validarActualizarUsuario, updateUsuario);

// Cambiar estado de usuario - Solo administradores
router.put('/cambiar-estado/:id', authMiddleware, roleMiddleware(["administrador"]), validateChangeUserStatus, changeUserStatus);

// Ruta para crear usuarios con rol específico - Solo administradores
router.post('/crear', authMiddleware, roleMiddleware(["administrador"]), validateCreateUserByAdmin, validarCrearUsuarioPorAdmin, createUserByAdmin);

export default router;