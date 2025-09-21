import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import * as controller from "../controllers/servicioProceso.controller.js";
import { body, param, validationResult } from "express-validator";

const router = Router();

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ mensaje: "Validación fallida", errores: errors.array().map(e => e.msg) });
  }
  next();
};

router.get(
  "/:idServicio/procesos",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  param("idServicio").isInt({ min: 1 }).withMessage("idServicio inválido"),
  handle,
  controller.listProcesosByServicio
);

router.post(
  "/:idServicio/procesos",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  param("idServicio").isInt({ min: 1 }).withMessage("idServicio inválido"),
  body("id_proceso").isInt({ min: 1 }).withMessage("id_proceso requerido"),
  handle,
  controller.addProcesoToServicio
);

router.delete(
  "/:idServicio/procesos/:idProceso",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  param("idServicio").isInt({ min: 1 }).withMessage("idServicio inválido"),
  param("idProceso").isInt({ min: 1 }).withMessage("idProceso inválido"),
  handle,
  controller.removeProcesoFromServicio
);

export default router;


