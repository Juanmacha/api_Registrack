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
import { validateId } from "../middlewares/response.middleware.js";

const router = express.Router();

// Middleware para capturar errores de validación
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

/**
 * Middleware híbrido para gestión de roles:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 * - Clientes no tienen acceso a gestión de roles
 */
const validateRoleAccess = (privilegio) => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso a la gestión de roles",
        rol: req.user.rol,
        detalles: "Este módulo está restringido para administradores y empleados únicamente."
      });
    }
    
    // Verificar si es uno de los roles principales permitidos (administrador o empleado)
    const rolesPermitidos = ['administrador', 'empleado'];
    const esRolPrincipal = rolesPermitidos.some(r => r.toLowerCase() === req.user?.rol?.toLowerCase());
    
    // Si es rol principal, usar AMBAS validaciones
    if (esRolPrincipal) {
      // Primero: roleMiddleware valida el rol
      const roleMw = roleMiddleware(["administrador", "empleado"]);
      roleMw(req, res, (err) => {
        if (err) return next(err);
        // Segundo: checkPermiso valida el permiso específico
        const permisoMw = checkPermiso('gestion_roles', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_roles', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ GET / - Listar roles (requiere leer)
router.get('/', authMiddleware, validateRoleAccess('leer'), getRoles);

// ✅ POST / - Crear rol (requiere crear)
router.post('/', authMiddleware, validateRoleAccess('crear'), createRoleValidation, validateResults, createRole);

// ✅ GET /:id - Ver rol (requiere leer + validación de ID)
router.get('/:id', authMiddleware, validateId('id'), validateRoleAccess('leer'), getRoleById);

// ✅ PUT /:id - Actualizar rol (requiere actualizar + validación de ID)
router.put('/:id', authMiddleware, validateId('id'), validateRoleAccess('actualizar'), updateRoleValidation, validateResults, updateRole);

// ✅ PATCH /:id/state - Cambiar estado (requiere actualizar + validación de ID)
router.patch('/:id/state', authMiddleware, validateId('id'), validateRoleAccess('actualizar'), validateResults, changeRoleState);

// ✅ DELETE /:id - Eliminar rol (requiere eliminar + validación de ID)
router.delete('/:id', authMiddleware, validateId('id'), validateRoleAccess('eliminar'), deleteRoleValidation, validateResults, deleteRole);

export default router;
