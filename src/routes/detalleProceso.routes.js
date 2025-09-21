import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import * as controller from "../controllers/detalleProceso.controller.js";
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
  "/detalle/:idDetalle",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  param("idDetalle").isInt({ min: 1 }).withMessage("idDetalle inválido"),
  handle,
  controller.listByDetalle
);

router.post(
  "/detalle/:idDetalle",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  param("idDetalle").isInt({ min: 1 }).withMessage("idDetalle inválido"),
  body("id_servicio").isInt({ min: 1 }).withMessage("id_servicio requerido"),
  body("id_proceso").isInt({ min: 1 }).withMessage("id_proceso requerido"),
  body("monto_a_pagar").isFloat({ gt: 0 }).withMessage("monto_a_pagar > 0"),
  handle,
  controller.createForDetalle
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  param("id").isInt({ min: 1 }).withMessage("id inválido"),
  handle,
  controller.update
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  param("id").isInt({ min: 1 }).withMessage("id inválido"),
  handle,
  controller.remove
);

export default router;


