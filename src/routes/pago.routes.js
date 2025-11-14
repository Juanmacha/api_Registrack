import { Router } from "express";
import { PagoController } from "../controllers/pago.controller.js";

// Middlewares de seguridad
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { checkPermiso } from "../middlewares/permiso.middleware.js";
import { validateId } from "../middlewares/response.middleware.js";

const router = Router();

// Todas las rutas aquí requieren autenticación
router.use(authMiddleware);

/**
 * Middleware híbrido para gestión de pagos:
 * - Para roles principales (administrador, empleado): usa roleMiddleware + checkPermiso
 * - Para cliente: permite acceso si tiene permiso (pueden ver sus propios pagos)
 * - Para roles personalizados (id_rol > 3): solo usa checkPermiso
 */
const validatePagoAccess = (privilegio, permitirCliente = false) => {
  return async (req, res, next) => {
    // Si se permite cliente y el usuario es cliente, solo validar permiso
    if (permitirCliente && req.user?.rol?.toLowerCase() === 'cliente') {
      const permisoMw = checkPermiso('gestion_pagos', privilegio);
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
        const permisoMw = checkPermiso('gestion_pagos', privilegio);
        permisoMw(req, res, next);
      });
    } else {
      // Si es rol personalizado (id_rol > 3), solo usar checkPermiso
      const permisoMw = checkPermiso('gestion_pagos', privilegio);
      permisoMw(req, res, next);
    }
  };
};

// ✅ GET / - Listar pagos (requiere leer, permite cliente para ver sus propios pagos)
router.get("/", validatePagoAccess('leer', true), PagoController.getAll);

// ✅ GET /reporte/excel - Descargar reporte Excel (requiere leer, solo admin/empleado)
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get("/reporte/excel", validatePagoAccess('leer'), PagoController.descargarReporteGeneral);

// ✅ GET /:id - Obtener pago por ID (requiere leer + validación de ID, permite cliente)
router.get("/:id", validateId('id'), validatePagoAccess('leer', true), PagoController.getById);

// ✅ POST / - Crear pago (requiere crear, solo admin/empleado)
router.post("/", validatePagoAccess('crear'), PagoController.create);

// ✅ NUEVO: Procesar pago con mock (requiere crear, permite cliente)
router.post("/process-mock", validatePagoAccess('crear', true), PagoController.procesarPagoMock);

// ✅ NUEVO: Simular pago (testing) (requiere crear, solo admin/empleado)
router.post("/simular", validatePagoAccess('crear'), PagoController.simularPago);

// ✅ GET /:id/comprobante - Generar comprobante PDF (requiere leer + validación de ID, permite cliente)
router.get("/:id/comprobante", validateId('id'), validatePagoAccess('leer', true), PagoController.generarComprobante);

// ✅ GET /:id/comprobante/download - Descargar comprobante (requiere leer + validación de ID, permite cliente)
router.get("/:id/comprobante/download", validateId('id'), validatePagoAccess('leer', true), PagoController.descargarComprobante);

// ✅ POST /:id/verify-manual - Verificar pago manualmente (requiere actualizar + validación de ID, solo admin)
router.post("/:id/verify-manual", validateId('id'), validatePagoAccess('actualizar'), PagoController.verificarPagoManual);

export default router;
