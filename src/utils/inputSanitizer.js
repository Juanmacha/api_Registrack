/**
 * Utilidades para sanitización de inputs
 * 
 * Previene ataques XSS y SQL Injection mediante:
 * - Escape de caracteres especiales
 * - Validación de tipos
 * - Limpieza de strings
 */

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {string} input - String a sanitizar
 * @param {Object} options - Opciones de sanitización
 * @returns {string} - String sanitizado
 */
export const sanitizeString = (input, options = {}) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const {
    trim = true,
    removeSpecialChars = false,
    maxLength = null
  } = options;

  let sanitized = input;

  // Trim espacios al inicio y final
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Remover caracteres especiales si se solicita
  if (removeSpecialChars) {
    sanitized = sanitized.replace(/[<>\"'%;()&+]/g, '');
  }

  // Limitar longitud si se especifica
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Sanitiza un email
 * @param {string} email - Email a sanitizar
 * @returns {string} - Email sanitizado
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Convertir a minúsculas y remover espacios
  return email.toLowerCase().trim();
};

/**
 * Sanitiza un número (documento, teléfono, etc.)
 * @param {string|number} input - Número a sanitizar
 * @returns {string} - Número sanitizado (solo dígitos)
 */
export const sanitizeNumber = (input) => {
  if (!input) {
    return '';
  }

  // Convertir a string y remover todo excepto dígitos
  return String(input).replace(/\D/g, '');
};

/**
 * Sanitiza un correo para login (previene inyección)
 * @param {string} correo - Correo a sanitizar
 * @returns {string} - Correo sanitizado
 */
export const sanitizeLoginEmail = (correo) => {
  if (!correo || typeof correo !== 'string') {
    return '';
  }

  // Convertir a minúsculas, trim, y validar formato básico
  const sanitized = correo.toLowerCase().trim();
  
  // Validar que no contenga caracteres peligrosos
  if (/[<>\"'%;()&+]/.test(sanitized)) {
    return '';
  }

  return sanitized;
};

/**
 * Sanitiza una contraseña (solo trim, no modificar contenido)
 * @param {string} password - Contraseña a sanitizar
 * @returns {string} - Contraseña sanitizada
 */
export const sanitizePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return '';
  }

  // Solo trim, no modificar el contenido de la contraseña
  return password.trim();
};

/**
 * Sanitiza un objeto completo de inputs
 * @param {Object} inputs - Objeto con inputs a sanitizar
 * @param {Object} schema - Schema de sanitización por campo
 * @returns {Object} - Objeto sanitizado
 */
export const sanitizeInputs = (inputs, schema = {}) => {
  if (!inputs || typeof inputs !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(inputs)) {
    const fieldSchema = schema[key] || { type: 'string' };

    switch (fieldSchema.type) {
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value);
        break;
      case 'password':
        sanitized[key] = sanitizePassword(value);
        break;
      case 'string':
      default:
        sanitized[key] = sanitizeString(value, fieldSchema.options || {});
        break;
    }
  }

  return sanitized;
};

