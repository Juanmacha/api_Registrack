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

const router = Router();

// Obtener historial de seguimiento de una solicitud
router.get(
  "/historial/:idOrdenServicio",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  obtenerHistorialSeguimiento
);

// Crear nuevo registro de seguimiento
router.post(
  "/crear",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  crearSeguimiento
);

// Obtener seguimiento por ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  obtenerSeguimientoPorId
);

// Actualizar seguimiento
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  actualizarSeguimiento
);

// Eliminar seguimiento
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  eliminarSeguimiento
);

// Buscar seguimientos por título
router.get(
  "/buscar/:idOrdenServicio",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  buscarPorTitulo
);

// 🚀 NUEVA RUTA: Obtener estados disponibles para una solicitud
router.get(
  "/:idOrdenServicio/estados-disponibles",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  obtenerEstadosDisponibles
);

export default router;
