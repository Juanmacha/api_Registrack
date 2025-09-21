import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import * as controller from "../controllers/tipoArchivo.controller.js";
import { validateCreateTipo, validateUpdateTipo, validateIdTipo } from "../middlewares/tipoArchivo.validation.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware(["administrador", "empleado"]), controller.getAll);
router.post("/", authMiddleware, roleMiddleware(["administrador", "empleado"]), validateCreateTipo, controller.create);
router.put("/:id", authMiddleware, roleMiddleware(["administrador", "empleado"]), validateUpdateTipo, controller.update);
router.delete("/:id", authMiddleware, roleMiddleware(["administrador"]), validateIdTipo, controller.remove);

export default router;


