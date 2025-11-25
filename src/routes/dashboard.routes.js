// src/routes/dashboard.routes.js
import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";

const router = Router();

/**
 * Middleware híbrido para gestión de dashboard:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 * - Clientes no tienen acceso al dashboard
 * - Todos los endpoints requieren permiso 'leer' (dashboard es solo lectura)
 */
const validateDashboardAccess = (privilegio = 'leer') => {
  return async (req, res, next) => {
    // Verificar si es cliente (rechazar automáticamente)
    if (req.user?.rol?.toLowerCase() === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "Los clientes no tienen acceso al dashboard",
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
        const permisoMw = checkPermiso('gestion_dashboard', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_dashboard', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ==========================================
// ENDPOINTS DEL DASHBOARD
// ==========================================

/**
 * GET /api/dashboard/ingresos
 * Obtener datos de control de ingresos
 * Query params:
 *   - periodo: '6meses' | '12meses' | 'custom' (default: '6meses')
 *   - fecha_inicio: 'YYYY-MM-DD' (requerido si periodo=custom)
 *   - fecha_fin: 'YYYY-MM-DD' (requerido si periodo=custom)
 */
router.get(
  "/ingresos",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getIngresos
);

/**
 * GET /api/dashboard/servicios
 * Resumen de gestión de servicios
 * Query params:
 *   - periodo: '6meses' | '12meses' | 'todo' (default: '12meses')
 */
router.get(
  "/servicios",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getServicios
);

/**
 * GET /api/dashboard/resumen
 * Resumen general del dashboard (todos los KPIs)
 * Query params:
 *   - periodo: '6meses' | '12meses' | 'custom' (default: '6meses')
 */
router.get(
  "/resumen",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getResumen
);

/**
 * GET /api/dashboard/pendientes
 * Tabla de servicios pendientes
 * Query params:
 *   - format: 'json' | 'excel' (default: 'json')
 *   - dias_minimos: número (default: 0)
 */
router.get(
  "/pendientes",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getPendientes
);

/**
 * GET /api/dashboard/inactivas
 * Tabla de solicitudes con inactividad prolongada
 * Query params:
 *   - format: 'json' | 'excel' (default: 'json')
 *   - dias_minimos: número (default: 10)
 */
router.get(
  "/inactivas",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getInactivas
);

/**
 * GET /api/dashboard/renovaciones-proximas
 * Tabla de marcas próximas a vencer (5 años después de finalizar renovación)
 * Query params:
 *   - format: 'json' | 'excel' (default: 'json')
 *   - dias_anticipacion: número (default: 90)
 */
router.get(
  "/renovaciones-proximas",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getRenovacionesProximas
);

/**
 * POST /api/dashboard/renovaciones-proximas/test-alertas
 * Endpoint manual para probar envío de alertas (solo admin)
 */
router.post(
  "/renovaciones-proximas/test-alertas",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.testAlertasRenovaciones
);

/**
 * GET /api/dashboard/periodos
 * Obtener lista de períodos disponibles
 * No requiere parámetros
 */
router.get(
  "/periodos",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getPeriodos
);

/**
 * GET /api/dashboard/ingresos-por-servicio
 * Obtener distribución de ingresos agrupados por servicio
 * Query params:
 *   - periodo: '1mes' | '3meses' | '6meses' | '12meses' | '18meses' | '2anos' | '3anos' | '5anos' | 'todo' | 'custom' (default: '6meses')
 *   - fecha_inicio: 'YYYY-MM-DD' (requerido si periodo=custom)
 *   - fecha_fin: 'YYYY-MM-DD' (requerido si periodo=custom)
 */
router.get(
  "/ingresos-por-servicio",
  authMiddleware,
  validateDashboardAccess('leer'),
  DashboardController.getIngresosPorServicio
);

export default router;

