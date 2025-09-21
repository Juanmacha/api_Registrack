/**
 * Middlewares de validación específicos para archivos
 */

import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges,
  validateAllowedValues 
} from './response.middleware.js';
import { VALIDATION_MESSAGES, ERROR_CODES } from '../constants/messages.js';

/**
 * Middleware para validación de subida de archivos
 */
export const validateUpload = (req, res, next) => {
  // Verificar que se haya enviado al menos un archivo
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.badRequest('Debe enviar al menos un archivo');
  }
  
  // Verificar campos requeridos en el body
  const { id_solicitud, id_tipo_archivo, descripcion } = req.body;
  
  if (!id_solicitud) {
    return res.badRequest('El ID de la solicitud es requerido');
  }
  
  if (!id_tipo_archivo) {
    return res.badRequest('El ID del tipo de archivo es requerido');
  }
  
  if (!descripcion) {
    return res.badRequest('La descripción del archivo es requerida');
  }
  
  // Validar tipos de datos
  if (isNaN(parseInt(id_solicitud)) || parseInt(id_solicitud) <= 0) {
    return res.badRequest('El ID de la solicitud debe ser un número válido mayor a 0');
  }
  
  if (isNaN(parseInt(id_tipo_archivo)) || parseInt(id_tipo_archivo) <= 0) {
    return res.badRequest('El ID del tipo de archivo debe ser un número válido mayor a 0');
  }
  
  if (typeof descripcion !== 'string') {
    return res.badRequest('La descripción debe ser una cadena de texto');
  }
  
  // Validar longitud de la descripción
  if (descripcion.length < 5 || descripcion.length > 200) {
    return res.badRequest('La descripción debe tener entre 5 y 200 caracteres');
  }
  
  // Validar cada archivo
  const files = Array.isArray(req.files.archivo) ? req.files.archivo : [req.files.archivo];
  
  for (const file of files) {
    // Validar que el archivo tenga un nombre
    if (!file.name) {
      return res.badRequest('Todos los archivos deben tener un nombre');
    }
    
    // Validar tamaño del archivo (máximo 10MB por defecto)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      return res.badRequest(`El archivo ${file.name} excede el tamaño máximo permitido de 10MB`);
    }
    
    // Validar extensión del archivo (básico)
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return res.badRequest(`La extensión ${fileExtension} no está permitida para el archivo ${file.name}`);
    }
  }
  
  // Convertir IDs a números
  req.body.id_solicitud = parseInt(id_solicitud);
  req.body.id_tipo_archivo = parseInt(id_tipo_archivo);
  
  next();
};

/**
 * Middleware para validación de ID de archivo
 */
export const validateArchivoId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.badRequest('El ID del archivo es requerido');
  }
  
  if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.badRequest('El ID debe ser un número válido mayor a 0');
  }
  
  req.params.id = parseInt(id);
  next();
};

/**
 * Middleware para validación de ID de cliente
 */
export const validateClienteId = (req, res, next) => {
  const { idCliente } = req.params;
  
  if (!idCliente) {
    return res.badRequest('El ID del cliente es requerido');
  }
  
  if (isNaN(parseInt(idCliente)) || parseInt(idCliente) <= 0) {
    return res.badRequest('El ID del cliente debe ser un número válido mayor a 0');
  }
  
  req.params.idCliente = parseInt(idCliente);
  next();
};

/**
 * Middleware para validación de búsqueda de archivos
 */
export const validateSearchArchivo = (req, res, next) => {
  const { query, tipo_archivo, fecha_inicio, fecha_fin } = req.query;
  
  // Validar que al menos un parámetro de búsqueda esté presente
  if (!query && !tipo_archivo && !fecha_inicio && !fecha_fin) {
    return res.badRequest('Debe proporcionar al menos un parámetro de búsqueda');
  }
  
  // Validar tipos de datos
  if (query && typeof query !== 'string') {
    return res.badRequest('El parámetro query debe ser una cadena de texto');
  }
  
  if (tipo_archivo && (isNaN(parseInt(tipo_archivo)) || parseInt(tipo_archivo) <= 0)) {
    return res.badRequest('El parámetro tipo_archivo debe ser un ID válido');
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
  
  // Convertir tipo_archivo a número si está presente
  if (tipo_archivo) {
    req.query.tipo_archivo = parseInt(tipo_archivo);
  }
  
  next();
};
