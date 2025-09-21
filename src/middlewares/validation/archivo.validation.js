/**
 * Middlewares de validación específicos para archivos
 */

import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges 
} from '../response.middleware.js';
import { VALIDATION_MESSAGES, ERROR_CODES } from '../../constants/messages.js';

// Validación para subir archivo
export const validateUploadFile = [
  validateRequiredFields(['url_archivo', 'id_tipo_archivo', 'id_cliente']),
  validateFieldTypes({
    url_archivo: 'string',
    id_tipo_archivo: 'number',
    id_cliente: 'number',
    id_orden_servicio: 'number'
  }),
  validateFieldRanges({
    url_archivo: { minLength: 5, maxLength: 500 },
    id_tipo_archivo: { min: 1 },
    id_cliente: { min: 1 },
    id_orden_servicio: { min: 1 }
  })
];

// Validación para crear tipo de archivo
export const validateCreateTipoArchivo = [
  validateRequiredFields(['descripcion']),
  validateFieldTypes({
    descripcion: 'string'
  }),
  validateFieldRanges({
    descripcion: { minLength: 2, maxLength: 50 }
  })
];

// Validación para actualizar tipo de archivo
export const validateUpdateTipoArchivo = [
  validateFieldTypes({
    descripcion: 'string'
  }),
  validateFieldRanges({
    descripcion: { minLength: 2, maxLength: 50 }
  })
];
