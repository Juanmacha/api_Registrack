/**
 * Middlewares de validación específicos para solicitudes
 */

import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges,
  validateAllowedValues 
} from './response.middleware.js';
import { VALIDATION_MESSAGES, ERROR_CODES } from '../constants/messages.js';

/**
 * Middleware para validación de búsqueda de solicitudes
 */
export const validateSearch = (req, res, next) => {
  const { query, tipo, estado, fecha_inicio, fecha_fin } = req.query;
  
  // Validar que al menos un parámetro de búsqueda esté presente
  if (!query && !tipo && !estado && !fecha_inicio && !fecha_fin) {
    return res.badRequest('Debe proporcionar al menos un parámetro de búsqueda');
  }
  
  // Validar tipos de datos
  if (query && typeof query !== 'string') {
    return res.badRequest('El parámetro query debe ser una cadena de texto');
  }
  
  if (tipo && typeof tipo !== 'string') {
    return res.badRequest('El parámetro tipo debe ser una cadena de texto');
  }
  
  if (estado && typeof estado !== 'string') {
    return res.badRequest('El parámetro estado debe ser una cadena de texto');
  }
  
  // Validar fechas si están presentes
  if (fecha_inicio && isNaN(Date.parse(fecha_inicio))) {
    return res.badRequest('El parámetro fecha_inicio debe ser una fecha válida');
  }
  
  if (fecha_fin && isNaN(Date.parse(fecha_fin))) {
    return res.badRequest('El parámetro fecha_fin debe ser una fecha válida');
  }
  
  // Validar que fecha_inicio sea anterior a fecha_fin
  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
    return res.badRequest('La fecha de inicio debe ser anterior a la fecha de fin');
  }
  
  // Validar valores permitidos para estado
  if (estado && !['pendiente', 'en_proceso', 'completada', 'cancelada'].includes(estado)) {
    return res.badRequest('El estado debe ser uno de: pendiente, en_proceso, completada, cancelada');
  }
  
  next();
};

/**
 * Middleware para validación de ID de solicitud
 */
export const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.badRequest('El ID de la solicitud es requerido');
  }
  
  if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.badRequest('El ID debe ser un número válido mayor a 0');
  }
  
  req.params.id = parseInt(id);
  next();
};

/**
 * Middleware para validación de edición de solicitud
 */
export const validateEdicionSolicitud = [
  validateFieldTypes({
    estado: 'string',
    observaciones: 'string',
    id_empleado_asignado: 'number'
  }),
  validateFieldRanges({
    observaciones: { maxLength: 500 }
  }),
  validateAllowedValues({
    estado: ['pendiente', 'en_proceso', 'completada', 'cancelada']
  })
];

/**
 * Middleware para validación de creación de solicitud
 */
export const validateCreacionSolicitud = [
  validateRequiredFields(['id_cliente', 'id_servicio', 'descripcion']),
  validateFieldTypes({
    id_cliente: 'number',
    id_servicio: 'number',
    descripcion: 'string',
    observaciones: 'string',
    archivos: 'array'
  }),
  validateFieldRanges({
    descripcion: { minLength: 10, maxLength: 1000 },
    observaciones: { maxLength: 500 }
  })
];

/**
 * Middleware para validación de parámetros de paginación
 */
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    return res.badRequest('El parámetro page debe ser un número mayor a 0');
  }
  
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.badRequest('El parámetro limit debe ser un número entre 1 y 100');
  }
  
  // Establecer valores por defecto
  req.query.page = page ? parseInt(page) : 1;
  req.query.limit = limit ? parseInt(limit) : 10;
  
  next();
};
