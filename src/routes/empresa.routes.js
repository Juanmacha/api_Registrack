import { Router } from "express";
import { 
  listarClientesDeEmpresa, 
  listarClientesDeEmpresaPorNit,
  crearEmpresaController
} from "../controllers/empresa.controller.js";

// Middlewares
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validateCreateEmpresa } from "../middlewares/validation/cliente.validation.js";

const router = Router();

// Rutas Empresas con seguridad
router.post("/", authMiddleware, roleMiddleware(["administrador", "empleado"]), validateCreateEmpresa, crearEmpresaController);
router.get("/:id/clientes", authMiddleware, roleMiddleware(["administrador", "empleado"]), listarClientesDeEmpresa);
router.get("/nit/:nit/clientes", authMiddleware, roleMiddleware(["administrador", "empleado"]), listarClientesDeEmpresaPorNit);

export default router;
