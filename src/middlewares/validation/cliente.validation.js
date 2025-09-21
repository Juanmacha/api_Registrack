/**
 * Middlewares de validación específicos para clientes
 */

import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges,
  validateAllowedValues 
} from '../response.middleware.js';
import { VALIDATION_MESSAGES, ERROR_CODES } from '../../constants/messages.js';

// Validación para crear cliente
export const validateCreateCliente = [
  validateRequiredFields(['id_usuario', 'tipo_persona']),
  validateFieldTypes({
    id_usuario: 'number',
    tipo_persona: 'string',
    marca: 'string'
  }),
  validateFieldRanges({
    id_usuario: { min: 1 },
    marca: { minLength: 2, maxLength: 50 }
  }),
  validateAllowedValues({
    tipo_persona: ['Natural', 'Jurídica']
  })
];

// Validación para actualizar cliente
export const validateUpdateCliente = [
  validateFieldTypes({
    marca: 'string',
    tipo_persona: 'string',
    estado: 'boolean'
  }),
  validateFieldRanges({
    marca: { minLength: 2, maxLength: 50 }
  }),
  validateAllowedValues({
    tipo_persona: ['Natural', 'Jurídica']
  })
];

// Validación para crear empresa
export const validateCreateEmpresa = [
  validateRequiredFields(['nombre', 'nit']),
  validateFieldTypes({
    nombre: 'string',
    nit: 'string',
    direccion: 'string',
    telefono: 'phone',
    correo: 'email'
  }),
  validateFieldRanges({
    nombre: { minLength: 2, maxLength: 100 },
    nit: { minLength: 8, maxLength: 20 },
    direccion: { minLength: 10, maxLength: 200 },
    telefono: { minLength: 7, maxLength: 15 }
  })
];

// Validación para actualizar empresa
export const validateUpdateEmpresa = [
  validateFieldTypes({
    nombre: 'string',
    nit: 'string',
    direccion: 'string',
    telefono: 'phone',
    correo: 'email'
  }),
  validateFieldRanges({
    nombre: { minLength: 2, maxLength: 100 },
    nit: { minLength: 8, maxLength: 20 },
    direccion: { minLength: 10, maxLength: 200 },
    telefono: { minLength: 7, maxLength: 15 }
  })
];
