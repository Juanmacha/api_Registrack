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

const router = express.Router();

// Rutas públicas (sin autenticación) para consultar servicios
router.get("/", getAllServicios);
router.get("/buscar", buscarServiciosPorNombre);

// Rutas protegidas (solo ADMIN) para gestión completa de servicios
router.get(
  "/admin/todos",
  authMiddleware,
  roleMiddleware(["administrador"]),
  getAllServiciosAdmin
); // Ver todos (incluyendo ocultos)

// Rutas con parámetros (deben ir después de las rutas específicas)
router.get("/:id", getServicioById);
router.get("/:id/detalle", getDetalleServicio);
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["administrador"]),
  actualizarServicio
);
router.patch(
  "/:id/ocultar",
  authMiddleware,
  roleMiddleware(["administrador"]),
  ocultarServicio
); // Ocultar servicio
router.patch(
  "/:id/publicar",
  authMiddleware,
  roleMiddleware(["administrador"]),
  publicarServicio
); // Publicar servicio

// Rutas para gestionar procesos de servicios
router.get("/:idServicio/procesos", obtenerProcesos); // Público para consultar
router.put(
  "/:idServicio/procesos",
  authMiddleware,
  roleMiddleware(["administrador"]),
  actualizarProcesos
); // Solo ADMIN para editar

export default router;
