import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";
import { validateId } from "../middlewares/response.middleware.js";
import * as controller from "../controllers/archivo.controller.js";
import { validateUpload, validateClienteId } from "../middlewares/archivo.validation.js";

const router = Router();

/**
 * Middleware híbrido para gestión de archivos:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para cliente: permite acceso si tiene permiso (pueden ver/editar sus propios archivos)
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 */
const validateArchivoAccess = (privilegio, permitirCliente = true) => {
  return async (req, res, next) => {
    // Si se permite cliente y el usuario es cliente, solo validar permiso (propiedad se valida en controlador)
    if (permitirCliente && req.user?.rol?.toLowerCase() === 'cliente') {
      const permisoMw = checkPermiso('gestion_archivos', privilegio);
      return permisoMw(req, res, next);
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
        const permisoMw = checkPermiso('gestion_archivos', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_archivos', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ POST /upload - Subir archivo (requiere crear)
router.post(
  "/upload",
  authMiddleware,
  validateArchivoAccess('crear'),
  validateUpload,
  controller.upload
);

// ✅ GET /:id/descargar - Descargar archivo (requiere leer + validación de ID)
router.get(
  "/:id/descargar",
  authMiddleware,
  validateId('id'),
  validateArchivoAccess('leer'),
  controller.download
);

// ✅ GET /cliente/:idCliente - Listar archivos de cliente (requiere leer + validación de ID)
router.get(
  "/cliente/:idCliente",
  authMiddleware,
  validateId('idCliente'),
  validateArchivoAccess('leer'),
  controller.listByCliente
);

export default router;


