import express from "express";
import {
  getAllServicios,
  getServicioById,
  getDetalleServicio,
  buscarServiciosPorNombre,
  actualizarServicio,
  obtenerProcesos,
  actualizarProcesos,
  ocultarServicio,
  publicarServicio,
  getAllServiciosAdmin,
} from "../controllers/servicio.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";
import { validateId } from "../middlewares/response.middleware.js";

const router = express.Router();

/**
 * Middleware híbrido para gestión de servicios:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 * - Clientes no tienen acceso a gestión de servicios
 */
const validateServicioAccess = (privilegio) => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso a la gestión de servicios",
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
        const permisoMw = checkPermiso('gestion_servicios', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_servicios', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// Rutas públicas (sin autenticación) para consultar servicios
router.get("/", getAllServicios);
router.get("/buscar", buscarServiciosPorNombre);

// Rutas protegidas (solo ADMIN) para gestión completa de servicios
router.get(
  "/admin/todos",
  authMiddleware,
  validateServicioAccess('leer'),
  getAllServiciosAdmin
); // Ver todos (incluyendo ocultos)

// Rutas con parámetros (deben ir después de las rutas específicas)
router.get("/:id", getServicioById);
router.get("/:id/detalle", getDetalleServicio);
router.put(
  "/:id",
  validateId('id'),
  authMiddleware,
  validateServicioAccess('actualizar'),
  actualizarServicio
);
router.patch(
  "/:id/ocultar",
  validateId('id'),
  authMiddleware,
  validateServicioAccess('actualizar'),
  ocultarServicio
); // Ocultar servicio
router.patch(
  "/:id/publicar",
  validateId('id'),
  authMiddleware,
  validateServicioAccess('actualizar'),
  publicarServicio
); // Publicar servicio

// Rutas para gestionar procesos de servicios
router.get("/:idServicio/procesos", obtenerProcesos); // Público para consultar
router.put(
  "/:idServicio/procesos",
  validateId('idServicio'),
  authMiddleware,
  validateServicioAccess('actualizar'),
  actualizarProcesos
); // Solo ADMIN para editar

export default router;
