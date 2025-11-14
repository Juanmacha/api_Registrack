import { Router } from "express";
import { 
  listarClientesDeEmpresa, 
  listarClientesDeEmpresaPorNit,
  crearEmpresaController
} from "../controllers/empresa.controller.js";

// Middlewares
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";
import { validateId } from "../middlewares/response.middleware.js";
import { validateCreateEmpresa } from "../middlewares/validation/cliente.validation.js";

const router = Router();

// Todas las rutas aquí requieren autenticación
router.use(authMiddleware);

/**
 * Middleware híbrido para gestión de empresas:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 * - Clientes no tienen acceso a gestión de empresas
 */
const validateEmpresaAccess = (privilegio) => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso a la gestión de empresas",
        rol: req.user.rol,
        detalles: "Este módulo está restringido para administradores y empleados únicamente."
      });
    }
    
    // Verificar si es uno de los roles principales permitidos (administrador o empleado)
    const rolesPermitidos = ['administrador', 'empleado'];
    const esRolPrincipal = rolesPermitidos.some(r => r.toLowerCase() === req.user?.rol?.toLowerCase());
    
    // Si es rol principal, usar AMBAS validaciones
    if (esRolPrincipal) {
      // Primero: roleMiddleware valida el rol
      const roleMw = roleMiddleware(["administrador", "empleado"]);
      roleMw(req, res, (err) => {
        if (err) return next(err);
        // Segundo: checkPermiso valida el permiso específico
        const permisoMw = checkPermiso('gestion_empresas', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_empresas', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ POST / - Crear empresa (requiere crear)
router.post("/", validateEmpresaAccess('crear'), validateCreateEmpresa, crearEmpresaController);

// ✅ GET /:id/clientes - Listar clientes de empresa (requiere leer + validación de ID)
router.get("/:id/clientes", validateId('id'), validateEmpresaAccess('leer'), listarClientesDeEmpresa);

// ✅ GET /nit/:nit/clientes - Listar clientes de empresa por NIT (requiere leer)
router.get("/nit/:nit/clientes", validateEmpresaAccess('leer'), listarClientesDeEmpresaPorNit);

export default router;
