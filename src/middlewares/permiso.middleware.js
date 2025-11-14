/**
 * Middleware para validar permisos y privilegios específicos
 * 
 * Estrategia Híbrida:
 * - Administrador: Bypass total (acceso completo, no valida permisos)
 * - Cliente: Mantiene lógica actual (no valida permisos aquí, validación en controladores)
 * - Empleado: Validación granular de permisos específicos
 * 
 * @param {string} permiso - Nombre del permiso requerido (ej: "gestion_usuarios")
 * @param {string} privilegio - Nombre del privilegio requerido (ej: "crear", "leer", "actualizar", "eliminar")
 * @returns {Function} Middleware function
 */

import { RolPermisoPrivilegio, Permiso, Privilegio } from '../models/index.js';
import { body, param, validationResult } from 'express-validator';
import PermisoModel from '../models/Permiso.js';

export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id_rol) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    // ✅ BYPASS AUTOMÁTICO PARA ADMINISTRADOR
    if (req.user.rol === 'administrador') {
      console.log('✅ [Permisos] Administrador - Bypass automático');
      return next();
    }

    // ✅ RESTRICCIONES ESPECÍFICAS PARA CLIENTE
    // Los clientes solo pueden realizar ciertas acciones específicas
    if (req.user.rol === 'cliente') {
      // Acciones permitidas para clientes por módulo
      const accionesPermitidasCliente = {
      'gestion_citas': ['leer', 'crear', 'actualizar', 'eliminar'], 
      // 'leer': Ver sus propias citas (filtrado en controlador)
      // 'crear': Crear citas para sí mismo (validado en controlador)
      // 'actualizar': Reprogramar sus propias citas (validado en controlador)
      // 'eliminar': Anular sus propias citas (validado en controlador)
      'gestion_solicitudes': ['crear', 'leer'], 
      // 'crear': Crear solicitudes (validado en controlador)
      // 'leer': Ver sus propias solicitudes (filtrado en controlador)
      'gestion_clientes': ['leer', 'actualizar'],
      // 'leer': Ver su propio perfil de cliente (validado en controlador)
      // 'actualizar': Editar su propio perfil de cliente (validado en controlador)
      'gestion_pagos': ['crear', 'leer'],
      // 'crear': Crear pagos (validado en controlador - solo pueden pagar sus propias solicitudes)
      // 'leer': Ver sus propios pagos (filtrado en controlador)
    };

      // Módulos completamente bloqueados para clientes
      const modulosBloqueados = [
        'gestion_usuarios',      // No pueden gestionar usuarios
        'gestion_empleados',     // No pueden gestionar empleados
        'gestion_empresas',      // No pueden gestionar empresas
        'gestion_servicios',     // No pueden gestionar servicios
        // 'gestion_pagos' - REMOVIDO: Los clientes ahora pueden crear y leer sus propios pagos
        'gestion_roles',         // No pueden gestionar roles
        'gestion_permisos',      // No pueden gestionar permisos
        'gestion_privilegios',   // No pueden gestionar privilegios
        'gestion_dashboard',     // No pueden acceder al dashboard
      ];

      // Si el módulo está bloqueado, denegar acceso
      if (modulosBloqueados.includes(permiso)) {
        console.error(`❌ [Permisos] Cliente - Módulo bloqueado: ${permiso}`);
        return res.status(403).json({ 
          success: false,
          mensaje: `Los clientes no tienen permiso para acceder a ${permiso.replace('gestion_', '')}`,
          permiso_requerido: permiso,
          privilegio_requerido: privilegio,
          rol: req.user.rol,
          detalles: "Este módulo está restringido para administradores y empleados únicamente."
        });
      }

      // Verificar si la acción está permitida para clientes
      if (accionesPermitidasCliente[permiso] && accionesPermitidasCliente[permiso].includes(privilegio)) {
        console.log(`✅ [Permisos] Cliente - Acción permitida: ${permiso} + ${privilegio} (validación de propiedad en controlador)`);
        return next(); // Permitir pero el controlador debe validar propiedad
      }

      // Para otras acciones no permitidas, denegar
      console.error(`❌ [Permisos] Cliente - Acción NO permitida: ${permiso} + ${privilegio}`);
      return res.status(403).json({ 
        success: false,
        mensaje: `Los clientes no tienen permiso para ${privilegio} en ${permiso.replace('gestion_', '')}`,
        permiso_requerido: permiso,
        privilegio_requerido: privilegio,
        rol: req.user.rol,
        detalles: "Esta acción está restringida para administradores y empleados únicamente."
      });
    }

    // ✅ VALIDACIÓN GRANULAR SOLO PARA EMPLEADOS
    // (Y otros roles personalizados que no sean administrador ni cliente)
    try {
      // Obtener IDs de permiso y privilegio
      const permisoObj = await Permiso.findOne({ where: { nombre: permiso } });
      const privilegioObj = await Privilegio.findOne({ where: { nombre: privilegio } });

      if (!permisoObj || !privilegioObj) {
        return res.status(500).json({ 
          success: false,
          mensaje: "Error en la configuración del sistema",
          detalles: `Permiso "${permiso}" o privilegio "${privilegio}" no encontrado en la base de datos`
        });
      }

      // ✅ VERIFICAR COMBINACIÓN ESPECÍFICA: Buscar en tabla intermedia
      // Esto verifica que el rol tenga EXACTAMENTE esta combinación de permiso + privilegio
      const tieneCombinacion = await RolPermisoPrivilegio.findOne({
        where: {
          id_rol: req.user.id_rol,
          id_permiso: permisoObj.id_permiso,
          id_privilegio: privilegioObj.id_privilegio
        }
      });

      if (!tieneCombinacion) {
        return res.status(403).json({ 
          success: false,
          mensaje: `No tienes permiso para ${privilegio} en ${permiso.replace('gestion_', '')}`,
          permiso_requerido: permiso,
          privilegio_requerido: privilegio,
          rol: req.user.rol,
          id_rol: req.user.id_rol,
          detalles: "Tu rol no tiene esta combinación específica de permiso y privilegio asignada. Contacta al administrador para obtener los permisos necesarios."
        });
      }

      // ✅ Usuario tiene la combinación específica de permiso + privilegio
      console.log(`✅ [Permisos] ${req.user.rol} - Permiso ${permiso} + ${privilegio} validado`);
      next();
    } catch (error) {
      console.error('Error al verificar permiso:', error);
      return res.status(500).json({ 
        success: false,
        mensaje: "Error al verificar permisos",
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Middleware para validar múltiples permisos (OR lógico)
 * El usuario debe tener al menos uno de los permisos especificados
 * 
 * @param {Array<{permiso: string, privilegio: string}>} permisosRequeridos - Array de objetos {permiso, privilegio}
 * @returns {Function} Middleware function
 */
export const checkPermisoMultiple = (permisosRequeridos) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id_rol) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    // Bypass para administrador
    if (req.user.rol === 'administrador') {
      return next();
    }

    // Mantener lógica actual para cliente
    if (req.user.rol === 'cliente') {
      return next();
    }

    try {
      // Verificar que el usuario tenga al menos uno de los permisos requeridos
      let tieneAlMenosUno = false;

      for (const { permiso, privilegio } of permisosRequeridos) {
        const permisoObj = await Permiso.findOne({ where: { nombre: permiso } });
        const privilegioObj = await Privilegio.findOne({ where: { nombre: privilegio } });

        if (permisoObj && privilegioObj) {
          const tieneCombinacion = await RolPermisoPrivilegio.findOne({
            where: {
              id_rol: req.user.id_rol,
              id_permiso: permisoObj.id_permiso,
              id_privilegio: privilegioObj.id_privilegio
            }
          });

          if (tieneCombinacion) {
            tieneAlMenosUno = true;
            break;
          }
        }
      }

      if (!tieneAlMenosUno) {
        return res.status(403).json({ 
          success: false,
          mensaje: "No tienes los permisos necesarios para realizar esta acción",
          permisos_requeridos: permisosRequeridos,
          rol: req.user.rol,
          id_rol: req.user.id_rol,
          detalles: "Tu rol no tiene ninguna de las combinaciones de permiso y privilegio requeridas. Contacta al administrador."
        });
      }

      next();
    } catch (error) {
      console.error('Error al verificar permisos múltiples:', error);
      return res.status(500).json({ 
        success: false,
        mensaje: "Error al verificar permisos",
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

// =============================================
// VALIDACIONES DE DATOS PARA PERMISOS
// =============================================

const ONLY_LETTERS_UNDERSCORES = /^[A-Za-zÁÉÍÓÚáéíóúÑñ_]+$/;

// Manejar errores de validación
const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Validación para crear permiso
export const createPermisoValidation = [
  body('nombre')
    .exists().withMessage('nombre es requerido')
    .bail()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('nombre debe tener 2-100 caracteres')
    .matches(ONLY_LETTERS_UNDERSCORES).withMessage('nombre solo permite letras, guiones bajos y sin espacios')
    .bail()
    .custom(async (value) => {
      const existe = await PermisoModel.findOne({ where: { nombre: value.trim() } });
      if (existe) {
        return Promise.reject('El permiso ya existe');
      }
    }),
  handleValidationErrors,
];

// Validación para actualizar permiso
export const updatePermisoValidation = [
  param('id')
    .exists().withMessage('id es requerido')
    .bail()
    .toInt()
    .isInt({ min: 1 }).withMessage('id inválido'),
  body('nombre')
    .optional()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('nombre debe tener 2-100 caracteres')
    .matches(ONLY_LETTERS_UNDERSCORES).withMessage('nombre solo permite letras, guiones bajos y sin espacios')
    .bail()
    .custom(async (value, { req }) => {
      if (!value) return true;
      const existe = await PermisoModel.findOne({ where: { nombre: value.trim() } });
      if (existe && existe.id_permiso !== parseInt(req.params.id)) {
        return Promise.reject('Ya existe un permiso con este nombre');
      }
    }),
  handleValidationErrors,
];

// Validación para parámetro ID
export const idParamValidation = [
  param('id')
    .exists().withMessage('id es requerido')
    .bail()
    .toInt()
    .isInt({ min: 1 }).withMessage('id inválido'),
  handleValidationErrors,
];
