// src/routes/permisoRoutes.js
import { Router } from 'express';
import {
  createPermiso,
  getAllPermisos,
  getPermisoById,
  updatePermiso,
  deletePermiso
} from '../controllers/permisoController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { checkPermiso } from '../middlewares/permiso.middleware.js';
import { validateId } from '../middlewares/response.middleware.js';
import {
  createPermisoValidation,
  updatePermisoValidation,
  idParamValidation
} from '../middlewares/permiso.middleware.js';

const router = Router();

/**
 * Middleware híbrido para gestión de permisos:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 * - Clientes no tienen acceso a gestión de permisos
 */
const validatePermisoAccess = (privilegio) => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso a la gestión de permisos",
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
        const permisoMw = checkPermiso('gestion_permisos', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_permisos', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ POST / - Crear permiso (requiere crear)
router.post(
  '/',
  authMiddleware,
  validatePermisoAccess('crear'),
  createPermisoValidation,
  createPermiso
);

// ✅ GET / - Obtener todos los permisos (requiere leer)
router.get(
  '/',
  authMiddleware,
  validatePermisoAccess('leer'),
  getAllPermisos
);

// ✅ GET /:id - Obtener permiso por ID (requiere leer + validación de ID)
router.get(
  '/:id',
  authMiddleware,
  validateId('id'),
  validatePermisoAccess('leer'),
  idParamValidation,
  getPermisoById
);

// ✅ PUT /:id - Actualizar permiso (requiere actualizar + validación de ID)
router.put(
  '/:id',
  authMiddleware,
  validateId('id'),
  validatePermisoAccess('actualizar'),
  updatePermisoValidation,
  updatePermiso
);

// ✅ DELETE /:id - Eliminar permiso (requiere eliminar + validación de ID)
router.delete(
  '/:id',
  authMiddleware,
  validateId('id'),
  validatePermisoAccess('eliminar'),
  idParamValidation,
  deletePermiso
);

export default router;
