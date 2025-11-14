import { Router } from "express";
import {
  obtenerHistorialSeguimiento,
  crearSeguimiento,
  obtenerSeguimientoPorId,
  actualizarSeguimiento,
  eliminarSeguimiento,
  buscarPorTitulo,
  obtenerEstadosDisponibles,
} from "../controllers/seguimiento.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";
import { validateId } from "../middlewares/response.middleware.js";

const router = Router();

/**
 * Middleware híbrido para gestión de seguimiento:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 * - Clientes no tienen acceso a gestión de seguimiento
 */
const validateSeguimientoAccess = (privilegio) => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso a la gestión de seguimiento",
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
        const permisoMw = checkPermiso('gestion_seguimiento', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_seguimiento', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ GET /historial/:idOrdenServicio - Obtener historial de seguimiento (requiere leer + validación de ID)
router.get(
  "/historial/:idOrdenServicio",
  authMiddleware,
  validateId('idOrdenServicio'),
  validateSeguimientoAccess('leer'),
  obtenerHistorialSeguimiento
);

// ✅ POST /crear - Crear nuevo registro de seguimiento (requiere crear)
router.post(
  "/crear",
  authMiddleware,
  validateSeguimientoAccess('crear'),
  crearSeguimiento
);

// ✅ GET /:idOrdenServicio/estados-disponibles - Obtener estados disponibles (requiere leer + validación de ID)
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get(
  "/:idOrdenServicio/estados-disponibles",
  authMiddleware,
  validateId('idOrdenServicio'),
  validateSeguimientoAccess('leer'),
  obtenerEstadosDisponibles
);

// ✅ GET /:id - Obtener seguimiento por ID (requiere leer + validación de ID)
// IMPORTANTE: Esta ruta debe ir DESPUÉS de rutas específicas para evitar conflictos
router.get(
  "/:id",
  authMiddleware,
  validateId('id'),
  validateSeguimientoAccess('leer'),
  obtenerSeguimientoPorId
);

// ✅ PUT /:id - Actualizar seguimiento (requiere actualizar + validación de ID)
router.put(
  "/:id",
  authMiddleware,
  validateId('id'),
  validateSeguimientoAccess('actualizar'),
  actualizarSeguimiento
);

// ✅ DELETE /:id - Eliminar seguimiento (requiere eliminar + validación de ID)
router.delete(
  "/:id",
  authMiddleware,
  validateId('id'),
  validateSeguimientoAccess('eliminar'),
  eliminarSeguimiento
);

// ✅ GET /buscar/:idOrdenServicio - Buscar seguimientos por título (requiere leer + validación de ID)
router.get(
  "/buscar/:idOrdenServicio",
  authMiddleware,
  validateId('idOrdenServicio'),
  validateSeguimientoAccess('leer'),
  buscarPorTitulo
);

export default router;
