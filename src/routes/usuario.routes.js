import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { getUsuarios, getUsuarioPorId, updateUsuario, deleteUsuario, createUserByAdmin, changeUserStatus } from '../controllers/user.controller.js';
import { validarNuevoUsuario, validarActualizarUsuario } from '../middlewares/validarUsuario.js';
import { validarCrearUsuarioPorAdmin } from '../middlewares/validarUsuarioAdmin.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { checkPermiso } from '../middlewares/permiso.middleware.js';
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

// Rutas protegidas - Con validación granular de permisos
// ✅ GET / - Listar usuarios: requiere gestion_usuarios + leer
router.get('/', authMiddleware, checkPermiso('gestion_usuarios', 'leer'), getUsuarios);

// ✅ GET /:id - Ver usuario: requiere gestion_usuarios + leer
router.get('/:id', authMiddleware, checkPermiso('gestion_usuarios', 'leer'), getUsuarioPorId);

// ✅ DELETE /:id - Eliminar usuario: requiere gestion_usuarios + eliminar
router.delete('/:id', authMiddleware, checkPermiso('gestion_usuarios', 'eliminar'), deleteUsuario);

// ✅ PUT /:id - Actualizar usuario: requiere gestion_usuarios + actualizar
// Nota: Los usuarios pueden actualizar sus propios datos (validación en controlador)
router.put('/:id', authMiddleware, checkPermiso('gestion_usuarios', 'actualizar'), validateUpdateUser, validarActualizarUsuario, updateUsuario);

// ✅ PUT /cambiar-estado/:id - Cambiar estado: requiere gestion_usuarios + actualizar
router.put('/cambiar-estado/:id', authMiddleware, checkPermiso('gestion_usuarios', 'actualizar'), validateChangeUserStatus, changeUserStatus);

// ✅ POST /crear - Crear usuario: requiere gestion_usuarios + crear
router.post('/crear', authMiddleware, checkPermiso('gestion_usuarios', 'crear'), validateCreateUserByAdmin, validarCrearUsuarioPorAdmin, createUserByAdmin);

export default router;