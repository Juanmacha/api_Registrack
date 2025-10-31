import { Router } from "express";
import { PagoController } from "../controllers/pago.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// CRUD
router.get("/", authMiddleware, roleMiddleware(["administrador", "empleado"]), PagoController.getAll);
router.get("/:id", authMiddleware, roleMiddleware(["administrador", "empleado"]), PagoController.getById);
router.post("/", authMiddleware, roleMiddleware(["administrador", "empleado"]), PagoController.create);

//  Reporte general (Excel) - solo admin/empleado
router.get(
  "/reporte/excel",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  PagoController.descargarReporteGeneral
);

// Comprobante de pago (PDF) - accesible para admin, empleado y cliente
router.get(
  "/:id/comprobante",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  PagoController.generarComprobante
);

// ✅ NUEVO: Procesar pago con mock
router.post(
  "/process-mock",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  PagoController.procesarPagoMock
);

// ✅ NUEVO: Simular pago (testing)
router.post(
  "/simular",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  PagoController.simularPago
);

// ✅ NUEVO: Ver registrar pago manualmente
router.post(
  "/:id/verify-manual",
  authMiddleware,
  roleMiddleware(["administrador"]),
  PagoController.verificarPagoManual
);

// ✅ NUEVO: Descargar comprobante
router.get(
  "/:id/comprobante/download",
  authMiddleware,
  roleMiddleware(["administrador", "empleado", "cliente"]),
  PagoController.descargarComprobante
);

export default router;
