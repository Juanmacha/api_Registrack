import { Router } from "express";
import { 
  crearCliente, 
  listarClientes, 
  obtenerCliente, 
  editarCliente, 
  borrarCliente,
  descargarReporteClientes
} from "../controllers/cliente.controller.js";

// Middlewares
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Rutas Clientes con seguridad
router.get("/", roleMiddleware(["administrador", "empleado"]), listarClientes); 
router.get("/:id", roleMiddleware(["administrador", "empleado", "cliente"]), obtenerCliente);
router.post("/", roleMiddleware(["administrador", "empleado"]), crearCliente);
router.put("/:id", roleMiddleware(["administrador", "empleado"]), editarCliente);
router.delete("/:id", roleMiddleware(["administrador"]), borrarCliente);

// Ruta para descargar reporte Excel de clientes
router.get("/reporte/excel", roleMiddleware(["administrador", "empleado"]), descargarReporteClientes);

export default router;
