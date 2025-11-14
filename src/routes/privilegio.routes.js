import express from 'express';
import * as privilegioController from '../controllers/privilegio.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { checkPermiso } from '../middlewares/permiso.middleware.js';
import { validateId } from '../middlewares/response.middleware.js';
import {
  createPrivilegioValidation,
  updatePrivilegioValidation,
  idParamValidation,
} from '../middlewares/privilegio.middleware.js';

const router = express.Router();

/**
 * Middleware híbrido para gestión de privilegios:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 * - Clientes no tienen acceso a gestión de privilegios
 */
const validatePrivilegioAccess = (privilegio) => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso a la gestión de privilegios",
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
        const permisoMw = checkPermiso('gestion_privilegios', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_privilegios', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ POST / - Crear privilegio (requiere crear)
router.post('/', authMiddleware, validatePrivilegioAccess('crear'), createPrivilegioValidation, privilegioController.createPrivilegio);

// ✅ GET / - Obtener todos los privilegios (requiere leer)
router.get('/', authMiddleware, validatePrivilegioAccess('leer'), privilegioController.getAllPrivilegios);

// ✅ GET /:id - Obtener privilegio por ID (requiere leer + validación de ID)
router.get('/:id', authMiddleware, validateId('id'), validatePrivilegioAccess('leer'), idParamValidation, privilegioController.getPrivilegioById);

// ✅ PUT /:id - Actualizar privilegio (requiere actualizar + validación de ID)
router.put('/:id', authMiddleware, validateId('id'), validatePrivilegioAccess('actualizar'), updatePrivilegioValidation, privilegioController.updatePrivilegio);

// ✅ DELETE /:id - Eliminar privilegio (requiere eliminar + validación de ID)
router.delete('/:id', authMiddleware, validateId('id'), validatePrivilegioAccess('eliminar'), idParamValidation, privilegioController.deletePrivilegio);

export default router;
