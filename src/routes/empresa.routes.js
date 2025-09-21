import { Router } from "express";
import { 
  listarClientesDeEmpresa, 
  listarClientesDeEmpresaPorNit 
} from "../controllers/empresa.controller.js";

// Middlewares
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Rutas Empresas con seguridad
router.get("/:id/clientes", roleMiddleware(["administrador", "empleado"]), listarClientesDeEmpresa);
router.get("/nit/:nit/clientes", roleMiddleware(["administrador", "empleado"]), listarClientesDeEmpresaPorNit);

export default router;
