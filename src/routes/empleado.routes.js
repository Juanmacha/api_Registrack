import express from "express";
import {
  getAllEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  changeEmpleadoState,
  deleteEmpleado,
  descargarReporteEmpleados
} from "../controllers/empleado.controller.js";

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = express.Router();

// Todas las rutas aquí requieren autenticación
router.use(authMiddleware);

// Solo administradores pueden acceder a estas rutas
router.use(roleMiddleware(["administrador"]));

router.get("/", getAllEmpleados);
router.get("/:id", getEmpleadoById);
router.post("/", createEmpleado);
router.put("/:id", updateEmpleado);
router.patch("/:id/estado", changeEmpleadoState);
router.delete("/:id", deleteEmpleado);

// Nuevo endpoint: Reporte en Excel
router.get("/reporte/excel", descargarReporteEmpleados);

export default router;
