/**
 * Middlewares de validación específicos para autenticación
 */

import { 
  validateRequiredFields, 
  validateFieldTypes, 
  validateFieldRanges,
  validateAllowedValues 
} from '../response.middleware.js';
import { VALIDATION_MESSAGES, ERROR_CODES } from '../../constants/messages.js';

// Validación para registro de usuario
export const validateUserRegistration = [
  validateRequiredFields(['tipo_documento', 'documento', 'nombre', 'apellido', 'correo', 'contrasena']),
  validateFieldTypes({
    tipo_documento: 'string',
    documento: 'document',
    nombre: 'string',
    apellido: 'string',
    correo: 'email',
    contrasena: 'password'
  }),
  validateFieldRanges({
    documento: { minLength: 6, maxLength: 10 },
    nombre: { minLength: 2, maxLength: 50 },
    apellido: { minLength: 2, maxLength: 50 },
    contrasena: { minLength: 8, maxLength: 128 }
  }),
  validateAllowedValues({
    tipo_documento: ['CC', 'CE', 'TI', 'RC', 'NIT', 'PAS']
  })
];

// Validación para login
export const validateUserLogin = [
  validateRequiredFields(['correo', 'contrasena']),
  validateFieldTypes({
    correo: 'email',
    contrasena: 'string'
  })
];

// Validación para forgot password
export const validateForgotPassword = [
  validateRequiredFields(['correo']),
  validateFieldTypes({
    correo: 'email'
  })
];

// Validación para reset password
export const validateResetPassword = [
  validateRequiredFields(['token', 'newPassword']),
  validateFieldTypes({
    token: 'string',
    newPassword: 'password'
  }),
  validateFieldRanges({
    newPassword: { minLength: 8, maxLength: 128 }
  })
];

// Validación para crear usuario por administrador
export const validateCreateUserByAdmin = [
  validateRequiredFields(['tipo_documento', 'documento', 'nombre', 'apellido', 'correo', 'contrasena', 'id_rol']),
  validateFieldTypes({
    tipo_documento: 'string',
    documento: 'document',
    nombre: 'string',
    apellido: 'string',
    correo: 'email',
    contrasena: 'password',
    id_rol: 'number'
  }),
  validateFieldRanges({
    documento: { minLength: 6, maxLength: 10 },
    nombre: { minLength: 2, maxLength: 50 },
    apellido: { minLength: 2, maxLength: 50 },
    contrasena: { minLength: 8, maxLength: 128 },
    id_rol: { min: 1, max: 10 }
  }),
  validateAllowedValues({
    tipo_documento: ['CC', 'CE', 'TI', 'RC', 'NIT', 'PAS']
  })
];

// Validación para actualizar usuario
export const validateUpdateUser = [
  validateFieldTypes({
    correo: 'email',
    documento: 'document',
    nombre: 'string',
    apellido: 'string',
    id_rol: 'number',
    estado: 'boolean'
  }),
  validateFieldRanges({
    documento: { minLength: 6, maxLength: 10 },
    nombre: { minLength: 2, maxLength: 50 },
    apellido: { minLength: 2, maxLength: 50 },
    id_rol: { min: 1, max: 10 }
  }),
  validateAllowedValues({
    tipo_documento: ['CC', 'CE', 'TI', 'RC', 'NIT', 'PAS']
  })
];

// Validación para cambio de estado de usuario
export const validateChangeUserStatus = [
  validateRequiredFields(['estado']),
  validateFieldTypes({
    estado: 'boolean'
  })
];
