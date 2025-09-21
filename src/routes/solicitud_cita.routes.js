import { Router } from "express";
import { 
    crearSolicitud, 
    verMisSolicitudes,
    getAllSolicitudes,
    gestionarSolicitud
} from "../controllers/solicitud_cita.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

// Rutas para el cliente
router.post("/", authMiddleware, roleMiddleware(["cliente"]), crearSolicitud);
router.get("/mis-solicitudes", authMiddleware, roleMiddleware(["cliente"]), verMisSolicitudes);

// Rutas para Administrador/Empleado
router.get("/", authMiddleware, roleMiddleware(["administrador", "empleado"]), getAllSolicitudes);
router.put("/:id/gestionar", authMiddleware, roleMiddleware(["administrador", "empleado"]), gestionarSolicitud);


export default router;
