import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import * as controller from "../controllers/archivo.controller.js";
import { validateUpload, validateArchivoId, validateClienteId } from "../middlewares/archivo.validation.js";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  validateUpload,
  controller.upload
);

router.get(
  "/:id/descargar",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  validateArchivoId,
  controller.download
);

router.get(
  "/cliente/:idCliente",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  validateClienteId,
  controller.listByCliente
);

export default router;


