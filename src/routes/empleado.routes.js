import express from "express";
import {
  getAllEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  changeEmpleadoState,
  deleteEmpleado,
  descargarReporteEmpleados
} from "../controllers/empleado.controller.js";

import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { checkPermiso } from '../middlewares/permiso.middleware.js';
import { validateId } from '../middlewares/response.middleware.js';

const router = express.Router();

// Todas las rutas aquí requieren autenticación
router.use(authMiddleware);

/**
 * Middleware híbrido: 
 * - Para los roles principales permitidos (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para cliente: rechaza automáticamente (no tiene acceso a gestión de empleados)
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 */
const validateEmpleadoAccess = (privilegio) => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso a la gestión de empleados",
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
        const permisoMw = checkPermiso('gestion_empleados', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_empleados', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ GET / - Listar empleados (requiere leer)
router.get("/", validateEmpleadoAccess('leer'), getAllEmpleados);

// ✅ GET /reporte/excel - Descargar reporte Excel (requiere leer)
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get("/reporte/excel", validateEmpleadoAccess('leer'), descargarReporteEmpleados);

// ✅ GET /:id - Obtener empleado por ID (requiere leer + validación de ID)
router.get("/:id", validateId('id'), validateEmpleadoAccess('leer'), getEmpleadoById);

// ✅ POST / - Crear empleado (requiere crear)
router.post("/", validateEmpleadoAccess('crear'), createEmpleado);

// ✅ PUT /:id - Actualizar empleado (requiere actualizar + validación de ID)
router.put("/:id", validateId('id'), validateEmpleadoAccess('actualizar'), updateEmpleado);

// ✅ PATCH /:id/estado - Cambiar estado de empleado (requiere actualizar + validación de ID)
router.patch("/:id/estado", validateId('id'), validateEmpleadoAccess('actualizar'), changeEmpleadoState);

// ✅ DELETE /:id - Eliminar empleado (requiere eliminar + validación de ID)
router.delete("/:id", validateId('id'), validateEmpleadoAccess('eliminar'), deleteEmpleado);

export default router;
