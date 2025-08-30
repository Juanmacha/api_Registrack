import { Router } from "express";
import { getCitas, createCita, reprogramarCita, anularCita } from "../controllers/citas.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Rutas con middlewares de autenticación y autorización
router.get("/", roleMiddleware(["administrador", "empleado", "cliente"]), getCitas);
router.post("/", roleMiddleware(["administrador", "empleado", "cliente"]), createCita);
router.put("/:id/reprogramar", roleMiddleware(["administrador", "empleado", "cliente"]), reprogramarCita);
router.put("/:id/anular", roleMiddleware(["administrador", "empleado", "cliente"]), anularCita);

export default router;