/**
 * Middlewares de validación específicos para tipo de archivo
 */

import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges,
  validateAllowedValues 
} from './response.middleware.js';
import { VALIDATION_MESSAGES, ERROR_CODES } from '../constants/messages.js';

/**
 * Middleware para validación de creación de tipo de archivo
 */
export const validateCreateTipo = [
  validateRequiredFields(['nombre', 'descripcion', 'extensiones_permitidas']),
  validateFieldTypes({
    nombre: 'string',
    descripcion: 'string',
    extensiones_permitidas: 'string',
    max_tamano_mb: 'number',
    es_obligatorio: 'boolean'
  }),
  validateFieldRanges({
    nombre: { minLength: 2, maxLength: 50 },
    descripcion: { minLength: 5, maxLength: 200 },
    extensiones_permitidas: { minLength: 2, maxLength: 100 },
    max_tamano_mb: { min: 0.1, max: 100 }
  })
];

/**
 * Middleware para validación de actualización de tipo de archivo
 */
export const validateUpdateTipo = [
  validateFieldTypes({
    nombre: 'string',
    descripcion: 'string',
    extensiones_permitidas: 'string',
    max_tamano_mb: 'number',
    es_obligatorio: 'boolean',
    activo: 'boolean'
  }),
  validateFieldRanges({
    nombre: { minLength: 2, maxLength: 50 },
    descripcion: { minLength: 5, maxLength: 200 },
    extensiones_permitidas: { minLength: 2, maxLength: 100 },
    max_tamano_mb: { min: 0.1, max: 100 }
  })
];

/**
 * Middleware para validación de ID de tipo de archivo
 */
export const validateIdTipo = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.badRequest('El ID del tipo de archivo es requerido');
  }
  
  if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.badRequest('El ID debe ser un número válido mayor a 0');
  }
  
  req.params.id = parseInt(id);
  next();
};

/**
 * Middleware para validación de búsqueda de tipos de archivo
 */
export const validateSearchTipo = (req, res, next) => {
  const { query, activo } = req.query;
  
  // Validar que al menos un parámetro de búsqueda esté presente
  if (!query && activo === undefined) {
    return res.badRequest('Debe proporcionar al menos un parámetro de búsqueda');
  }
  
  // Validar tipos de datos
  if (query && typeof query !== 'string') {
    return res.badRequest('El parámetro query debe ser una cadena de texto');
  }
  
  if (activo !== undefined && typeof activo !== 'string') {
    return res.badRequest('El parámetro activo debe ser una cadena de texto');
  }
  
  // Validar valores permitidos para activo
  if (activo && !['true', 'false'].includes(activo.toLowerCase())) {
    return res.badRequest('El parámetro activo debe ser "true" o "false"');
  }
  
  // Convertir activo a boolean si está presente
  if (activo !== undefined) {
    req.query.activo = activo.toLowerCase() === 'true';
  }
  
  next();
};
