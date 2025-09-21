import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import * as controller from "../controllers/detalleOrden.controller.js";
import { body, param, validationResult } from "express-validator";

const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ mensaje: "Validación fallida", errores: errors.array().map(e => e.msg) });
  }
  next();
};

const router = Router();

router.get(
  "/orden/:idOrden",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  param("idOrden").isInt({ min: 1 }).withMessage("idOrden inválido"),
  handle,
  controller.listByOrden
);

router.post(
  "/orden/:idOrden",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  param("idOrden").isInt({ min: 1 }).withMessage("idOrden inválido"),
  body("id_servicio").isInt({ min: 1 }).withMessage("id_servicio requerido"),
  handle,
  controller.createForOrden
);

router.put(
  "/:id/estado",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  param("id").isInt({ min: 1 }).withMessage("id inválido"),
  body("estado").isIn(["Pendiente", "En Proceso", "Finalizado", "Anulado"]).withMessage("estado inválido"),
  handle,
  controller.updateEstado
);

export default router;


