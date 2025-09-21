import { Router } from "express";
import {
  listarSolicitudes,
  buscarSolicitud,
  verDetalleSolicitud,
  anularSolicitud,
  crearSolicitud,
  editarSolicitud,
} from "../controllers/solicitudes.controller.js";
import {
  validateSearch,
  validateId,
  validateEdicionSolicitud,
} from "../middlewares/validation.middleware.js";

//  Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Ruta para crear solicitud con validación dinámica según el servicio en la URL
router.post(
  "/crear/:servicio",
  roleMiddleware(["cliente", "administrador", "empleado"]),
  crearSolicitud
);

//  Cliente puede ver solo las suyas (endpoint general)
router.get(
  "/mias",
  roleMiddleware(["cliente"]),
  listarSolicitudes
);

//  Nuevos endpoints para clientes - separar en proceso y finalizadas
// Ruta eliminada: no existe la función listarMisSolicitudesEnProceso en el controlador

// Ruta eliminada: no existe la función listarMiHistorial en el controlador

//  Admin y empleado pueden gestionar todas
router.get(
  "/",
  roleMiddleware(["administrador", "empleado"]),
  listarSolicitudes
);

//  Nuevos endpoints para separar solicitudes en proceso y finalizadas
// Ruta eliminada: no existe la función listarSolicitudesEnProceso en el controlador
// router.get(
//   "/proceso",
//   authMiddleware,
//   roleMiddleware(["administrador", "empleado"]),
//   listarSolicitudesEnProceso
// );
// Ruta eliminada: no existe la función listarSolicitudesFinalizadas en el controlador
// router.get(
//   "/fin",
//   authMiddleware,
//   roleMiddleware(["administrador", "empleado"]),
//   listarSolicitudesFinalizadas
// );
router.get(
  "/buscar",
  roleMiddleware(["administrador", "empleado"]),
  validateSearch,
  buscarSolicitud
);
router.get(
  "/:id",
  roleMiddleware(["administrador", "empleado"]),
  validateId,
  verDetalleSolicitud
);
router.put(
  "/anular/:id",
  roleMiddleware(["administrador", "empleado"]),
  validateId,
  anularSolicitud
);
router.put(
  "/editar/:id",
  roleMiddleware(["administrador", "empleado"]),
  validateId,
  validateEdicionSolicitud,
  editarSolicitud
);

export default router;
