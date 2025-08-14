import { Router } from "express";
import { PagoController } from "../controllers/pago.controller.js";

const router = Router();

router.get("/", PagoController.getAll);
router.get("/:id", PagoController.getById);
router.post("/", PagoController.create);

export default router;
