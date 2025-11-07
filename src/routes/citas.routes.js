import { Router } from "express";
import { getCitas, createCita, reprogramarCita, anularCita, descargarReporteCitas, validateCreateCita, crearCitaDesdeSolicitud, obtenerCitasDeSolicitud, buscarUsuarioPorDocumento } from "../controllers/citas.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

// Middlewares de validación mejorados
import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges,
  validateAllowedValues 
} from "../middlewares/response.middleware.js";

const router = Router();

// Rutas con middlewares de autenticación y autorización
router.get("/", roleMiddleware(["administrador", "empleado", "cliente"]), getCitas);

// Crear cita con validaciones mejoradas
// ✅ NOTA: validateAllowedValues se removió porque createCita normaliza y valida el tipo internamente
router.post("/", 
  roleMiddleware(["administrador", "empleado", "cliente"]),
  validateRequiredFields(['fecha', 'hora_inicio', 'hora_fin', 'tipo', 'modalidad', 'id_empleado']),
  validateFieldTypes({
    fecha: 'date',
    hora_inicio: 'string',
    hora_fin: 'string',
    tipo: 'string',
    modalidad: 'string',
    id_cliente: 'number',
    id_empleado: 'number',
    observacion: 'string'
  }),
  validateAllowedValues({
    // Solo validar modalidad aquí, tipo se normaliza en createCita
    modalidad: ['Presencial', 'Virtual']
  }),
  createCita
);

// Reprogramar cita
router.put("/:id/reprogramar", 
  roleMiddleware(["administrador", "empleado", "cliente"]),
  validateFieldTypes({
    fecha: 'date',
    hora_inicio: 'string',
    hora_fin: 'string'
  }),
  reprogramarCita
);

// Anular cita
router.put("/:id/anular", 
  roleMiddleware(["administrador", "empleado", "cliente"]),
  validateRequiredFields(['observacion']),
  validateFieldTypes({
    observacion: 'string'
  }),
  anularCita
);

// Ruta para descargar reporte Excel de citas
router.get("/reporte/excel", roleMiddleware(["administrador", "empleado"]), descargarReporteCitas);

// ✅ NUEVAS RUTAS: Citas asociadas a solicitudes
/**
 * POST /api/gestion-citas/desde-solicitud/:idOrdenServicio
 * Crear cita asociada a una solicitud de servicio
 * Solo Admin/Empleado
 */
router.post(
  "/desde-solicitud/:idOrdenServicio",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  crearCitaDesdeSolicitud
);

/**
 * GET /api/gestion-citas/solicitud/:id
 * Obtener citas asociadas a una solicitud
 */
router.get(
  "/solicitud/:id",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  obtenerCitasDeSolicitud
);

/**
 * GET /api/gestion-citas/buscar-usuario/:documento
 * Buscar usuario por documento y retornar sus datos para autocompletar
 * Solo Admin/Empleado
 */
router.get(
  "/buscar-usuario/:documento",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  buscarUsuarioPorDocumento
);

export default router;