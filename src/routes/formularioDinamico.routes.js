import express from "express";
import ValidacionServicioController from "../controllers/formularioDinamico.controller.js";

const router = express.Router();
const controller = new ValidacionServicioController();

// Validar orden de servicio
router.post(
  "/validar/:idServicio",
  controller.validarOrdenServicio.bind(controller)
);

// Obtener servicios con validación
router.get(
  "/servicios",
  controller.obtenerServiciosConValidacion.bind(controller)
);

// Verificar si un campo es obligatorio
router.get(
  "/verificar/:nombreServicio/:nombreCampo",
  controller.verificarCampoObligatorio.bind(controller)
);

// Obtener campos obligatorios de un servicio
router.get(
  "/campos/:nombreServicio",
  controller.obtenerCamposObligatorios.bind(controller)
);

// Obtener configuración de todos los servicios
router.get(
  "/configuracion",
  controller.obtenerConfiguracionServicios.bind(controller)
);

export default router;
