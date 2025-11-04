import { body, param } from 'express-validator';

// Crear rol
export const createRoleValidation = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio')
];

// Actualizar rol
export const updateRoleValidation = [
  param('id').isInt().withMessage('ID inválido'),
  body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('estado').optional().custom((value) => {
    if (typeof value === 'boolean') return true;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      return lower === 'activo' || lower === 'inactivo' || lower === 'true' || lower === 'false';
    }
    if (typeof value === 'number') return value === 0 || value === 1;
    return false;
  }).withMessage('El estado debe ser true/false, "Activo"/"Inactivo" o 1/0'),
  body('permisos').optional().isObject().withMessage('Los permisos deben ser un objeto')
];

// Cambiar estado
export const changeStateValidation = [
  param('id').isInt().withMessage('ID inválido'),
  body('estado').isBoolean().withMessage('El estado debe ser true o false')
];

// Eliminar rol
export const deleteRoleValidation = [
  param('id').isInt().withMessage('ID inválido')
];

export const roleMiddleware = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.some(r => r.toLowerCase() === req.user.rol.toLowerCase())) {
      return res.status(403).json({ mensaje: "No tienes permisos" });
    }
    next();
  };
};


