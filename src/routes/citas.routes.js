import { Router } from "express";
import { getCitas, createCita, reprogramarCita, anularCita, finalizarCita, descargarReporteCitas, validateCreateCita, crearCitaDesdeSolicitud, obtenerCitasDeSolicitud, buscarUsuarioPorDocumento } from "../controllers/citas.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";

// Middlewares de validación mejorados
import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges,
  validateAllowedValues 
} from "../middlewares/response.middleware.js";

const router = Router();

// ✅ RUTAS PARA TODOS LOS ROLES (Clientes ven solo las suyas, validación en controlador)
// GET / - Listar citas: requiere gestion_citas + leer
router.get("/", authMiddleware, checkPermiso('gestion_citas', 'leer'), getCitas);

// POST / - Crear cita: requiere gestion_citas + crear
router.post("/", 
  authMiddleware,
  checkPermiso('gestion_citas', 'crear'),
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
    modalidad: ['Presencial', 'Virtual']
  }),
  createCita
);

// PUT /:id/reprogramar - Reprogramar cita: requiere gestion_citas + actualizar
router.put("/:id/reprogramar", 
  authMiddleware,
  checkPermiso('gestion_citas', 'actualizar'),
  validateFieldTypes({
    fecha: 'date',
    hora_inicio: 'string',
    hora_fin: 'string'
  }),
  reprogramarCita
);

// PUT /:id/anular - Anular cita: requiere gestion_citas + eliminar
router.put("/:id/anular", 
  authMiddleware,
  checkPermiso('gestion_citas', 'eliminar'),
  validateRequiredFields(['observacion']),
  validateFieldTypes({
    observacion: 'string'
  }),
  anularCita
);

// ✅ RUTAS SOLO PARA ADMIN/EMPLEADO
// PUT /:id/finalizar - Finalizar cita: requiere gestion_citas + actualizar
router.put("/:id/finalizar", 
  authMiddleware,
  checkPermiso('gestion_citas', 'actualizar'),
  finalizarCita
);

// GET /reporte/excel - Descargar reporte Excel: requiere gestion_citas + leer
router.get("/reporte/excel", authMiddleware, checkPermiso('gestion_citas', 'leer'), descargarReporteCitas);

// POST /desde-solicitud/:idOrdenServicio - Crear cita desde solicitud: requiere gestion_citas + crear
router.post(
  "/desde-solicitud/:idOrdenServicio",
  authMiddleware,
  checkPermiso('gestion_citas', 'crear'),
  crearCitaDesdeSolicitud
);

// GET /buscar-usuario/:documento - Buscar usuario: requiere gestion_citas + leer
router.get(
  "/buscar-usuario/:documento",
  authMiddleware,
  checkPermiso('gestion_citas', 'leer'),
  buscarUsuarioPorDocumento
);

// GET /solicitud/:id - Ver citas de solicitud: requiere gestion_citas + leer
router.get(
  "/solicitud/:id",
  authMiddleware,
  checkPermiso('gestion_citas', 'leer'),
  obtenerCitasDeSolicitud
);

export default router;