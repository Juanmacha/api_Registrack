// src/routes/dashboard.routes.js
import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

/**
 * TODAS las rutas del dashboard requieren:
 * - JWT válido (authMiddleware)
 * - Rol de administrador (roleMiddleware(['administrador']))
 */

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
  roleMiddleware(["administrador"]),
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
  roleMiddleware(["administrador"]),
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
  roleMiddleware(["administrador"]),
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
  roleMiddleware(["administrador"]),
  DashboardController.getPendientes
);

/**
 * GET /api/dashboard/inactivas
 * Tabla de solicitudes con inactividad prolongada
 * Query params:
 *   - format: 'json' | 'excel' (default: 'json')
 *   - dias_minimos: número (default: 30)
 */
router.get(
  "/inactivas",
  authMiddleware,
  roleMiddleware(["administrador"]),
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
  roleMiddleware(["administrador", "empleado"]),
  DashboardController.getRenovacionesProximas
);

/**
 * POST /api/dashboard/renovaciones-proximas/test-alertas
 * Endpoint manual para probar envío de alertas (solo admin)
 */
router.post(
  "/renovaciones-proximas/test-alertas",
  authMiddleware,
  roleMiddleware(["administrador"]),
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
  roleMiddleware(["administrador"]),
  DashboardController.getPeriodos
);

export default router;

