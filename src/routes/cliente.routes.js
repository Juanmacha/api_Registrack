import { Router } from "express";
import { 
  listarClientes, 
  obtenerCliente, 
  editarCliente, 
  editarUsuarioCliente,
  editarEmpresaCliente,
  borrarCliente,
  descargarReporteClientes
} from "../controllers/cliente.controller.js";

// Middlewares
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";
import { validateId } from "../middlewares/response.middleware.js";

const router = Router();

// Todas las rutas aquí requieren autenticación
router.use(authMiddleware);

/**
 * Middleware híbrido para gestión de clientes:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para cliente: permite acceso si tiene permiso (pueden ver/editar sus propios recursos)
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 */
const validateClienteAccess = (privilegio, permitirCliente = false) => {
  return async (req, res, next) => {
    // Si se permite cliente y el usuario es cliente, solo validar permiso
    if (permitirCliente && req.user?.rol?.toLowerCase() === 'cliente') {
      const permisoMw = checkPermiso('gestion_clientes', privilegio);
      return permisoMw(req, res, next);
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
        const permisoMw = checkPermiso('gestion_clientes', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_clientes', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ GET / - Listar clientes (requiere leer, solo admin/empleado)
router.get("/", validateClienteAccess('leer'), listarClientes);

// ✅ GET /reporte/excel - Descargar reporte Excel (requiere leer, solo admin/empleado)
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get("/reporte/excel", validateClienteAccess('leer'), descargarReporteClientes);

// ✅ GET /:id - Obtener cliente por ID (requiere leer + validación de ID, permite cliente)
router.get("/:id", validateId('id'), validateClienteAccess('leer', true), obtenerCliente);

// ✅ PUT /:id - Editar cliente (requiere actualizar + validación de ID, permite cliente)
router.put("/:id", validateId('id'), validateClienteAccess('actualizar', true), editarCliente);

// ✅ PUT /:id/usuario - Editar usuario del cliente (requiere actualizar + validación de ID, permite cliente)
router.put("/:id/usuario", validateId('id'), validateClienteAccess('actualizar', true), editarUsuarioCliente);

// ✅ PUT /:id/empresa - Editar empresa del cliente (requiere actualizar + validación de ID, permite cliente)
router.put("/:id/empresa", validateId('id'), validateClienteAccess('actualizar', true), editarEmpresaCliente);

// ✅ DELETE /:id - Eliminar cliente (requiere eliminar + validación de ID, solo admin)
router.delete("/:id", validateId('id'), validateClienteAccess('eliminar'), borrarCliente);

export default router;
