import { Router } from "express";
import {
  listarSolicitudes,
  buscarSolicitud,
  verDetalleSolicitud,
  anularSolicitud,
  crearSolicitud,
  editarSolicitud,
  obtenerEstadosDisponibles,
  obtenerEstadoActual,
  asignarEmpleado,
  verEmpleadoAsignado,
  descargarArchivosSolicitud,
} from "../controllers/solicitudes.controller.js";
import {
  validateSearch,
  validateId,
  validateEdicionSolicitud,
} from "../middlewares/validation.middleware.js";

//  Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";

const router = Router();

// ✅ RUTAS PARA CLIENTES (Mantienen lógica actual)
// POST /crear/:servicio - Crear solicitud (cliente, admin, empleado)
router.post(
  "/crear/:servicio",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'crear'),
  crearSolicitud
);

// GET /mias - Ver mis solicitudes (solo cliente)
router.get(
  "/mias",
  authMiddleware,
  roleMiddleware(["cliente"]),
  listarSolicitudes
);

// GET /mis/:id/estados-disponibles - Estados disponibles (solo cliente)
router.get(
  "/mis/:id/estados-disponibles",
  authMiddleware,
  roleMiddleware(["cliente"]),
  validateId,
  obtenerEstadosDisponibles
);

// GET /mis/:id/estado-actual - Estado actual (solo cliente)
router.get(
  "/mis/:id/estado-actual",
  authMiddleware,
  roleMiddleware(["cliente"]),
  validateId,
  obtenerEstadoActual
);

// GET /mis/:id/empleado-asignado - Ver empleado asignado (solo cliente)
router.get(
  "/mis/:id/empleado-asignado",
  authMiddleware,
  roleMiddleware(["cliente"]),
  validateId,
  verEmpleadoAsignado
);

// ✅ RUTAS PARA ADMIN/EMPLEADO (Validación granular)
// GET / - Listar todas las solicitudes: requiere gestion_solicitudes + leer
router.get(
  "/",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'leer'),
  listarSolicitudes
);

// GET /buscar - Buscar solicitudes: requiere gestion_solicitudes + leer
router.get(
  "/buscar",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'leer'),
  validateSearch,
  buscarSolicitud
);

// GET /:id - Ver detalle solicitud: requiere gestion_solicitudes + leer
router.get(
  "/:id",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'leer'),
  validateId,
  verDetalleSolicitud
);

// PUT /anular/:id - Anular solicitud: requiere gestion_solicitudes + eliminar
router.put(
  "/anular/:id",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'eliminar'),
  validateId,
  anularSolicitud
);

// PUT /editar/:id - Editar solicitud: requiere gestion_solicitudes + actualizar
router.put(
  "/editar/:id",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'actualizar'),
  validateId,
  validateEdicionSolicitud,
  editarSolicitud
);

// GET /:id/estados-disponibles - Estados disponibles: requiere gestion_solicitudes + leer
router.get(
  "/:id/estados-disponibles",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'leer'),
  validateId,
  obtenerEstadosDisponibles
);

// GET /:id/estado-actual - Estado actual: requiere gestion_solicitudes + leer
router.get(
  "/:id/estado-actual",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'leer'),
  validateId,
  obtenerEstadoActual
);

// PUT /asignar-empleado/:id - Asignar empleado: requiere gestion_solicitudes + actualizar
router.put(
  "/asignar-empleado/:id",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'actualizar'),
  validateId,
  asignarEmpleado
);

// GET /:id/descargar-archivos - Descargar archivos: requiere gestion_solicitudes + leer
router.get(
  "/:id/descargar-archivos",
  authMiddleware,
  checkPermiso('gestion_solicitudes', 'leer'),
  validateId,
  descargarArchivosSolicitud
);

export default router;
