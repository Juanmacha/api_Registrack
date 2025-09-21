/**
 * Middleware para respuestas estandarizadas de la API
 * Proporciona funciones helper para crear respuestas consistentes
 */

import { 
  ERROR_CODES, 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  createErrorResponse, 
  createSuccessResponse,
  formatMessage 
} from '../constants/messages.js';

/**
 * Middleware para respuestas de éxito
 */
export const successResponse = (message, data = null, meta = null) => {
  return (req, res, next) => {
    res.success = (customMessage = message, customData = data, customMeta = meta) => {
      const response = createSuccessResponse(customMessage, customData, customMeta);
      return res.json(response);
    };
    next();
  };
};

/**
 * Middleware para respuestas de error
 */
export const errorResponse = () => {
  return (req, res, next) => {
    res.error = (message, code = ERROR_CODES.INTERNAL_ERROR, details = null, statusCode = 500) => {
      const response = createErrorResponse(message, code, details);
      return res.status(statusCode).json(response);
    };
    
    res.validationError = (errors, message = ERROR_MESSAGES.VALIDATION_FAILED) => {
      const response = createErrorResponse(message, ERROR_CODES.VALIDATION_ERROR, { errors });
      return res.status(400).json(response);
    };
    
    res.notFound = (resource = 'Recurso', customMessage = null) => {
      const message = customMessage || formatMessage(ERROR_MESSAGES.NOT_FOUND, { resource });
      const response = createErrorResponse(message, ERROR_CODES.NOT_FOUND);
      return res.status(404).json(response);
    };
    
    res.unauthorized = (message = ERROR_MESSAGES.UNAUTHORIZED) => {
      const response = createErrorResponse(message, ERROR_CODES.UNAUTHORIZED);
      return res.status(401).json(response);
    };
    
    res.forbidden = (message = ERROR_MESSAGES.ACCESS_DENIED) => {
      const response = createErrorResponse(message, ERROR_CODES.ACCESS_DENIED);
      return res.status(403).json(response);
    };
    
    res.conflict = (message = ERROR_MESSAGES.CONFLICT) => {
      const response = createErrorResponse(message, ERROR_CODES.CONFLICT);
      return res.status(409).json(response);
    };
    
    res.badRequest = (message = ERROR_MESSAGES.VALIDATION_FAILED) => {
      const response = createErrorResponse(message, ERROR_CODES.VALIDATION_ERROR);
      return res.status(400).json(response);
    };
    
    next();
  };
};

/**
 * Middleware para manejo de errores de Sequelize
 */
export const sequelizeErrorHandler = (error, req, res, next) => {
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
      validator: err.validatorKey
    }));
    
    return res.validationError(errors, ERROR_MESSAGES.VALIDATION_FAILED);
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'campo';
    const value = error.errors[0]?.value || 'valor';
    const message = formatMessage(ERROR_MESSAGES.DUPLICATE_VALUE, { field, value });
    
    return res.conflict(message);
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Violación de restricción de clave foránea. Verifique que los IDs relacionados existan.';
    return res.badRequest(message);
  }
  
  if (error.name === 'SequelizeConnectionError') {
    return res.error(ERROR_MESSAGES.CONNECTION_ERROR, ERROR_CODES.CONNECTION_ERROR, null, 503);
  }
  
  if (error.name === 'SequelizeDatabaseError') {
    return res.error(ERROR_MESSAGES.DATABASE_ERROR, ERROR_CODES.DATABASE_ERROR, null, 500);
  }
  
  // Si no es un error de Sequelize, pasar al siguiente middleware
  next(error);
};

/**
 * Middleware para validación de parámetros de ID
 */
export const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.badRequest(`El parámetro ${paramName} es requerido`);
    }
    
    if (isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return res.badRequest(`El ${paramName} debe ser un número válido mayor a 0`);
    }
    
    req.params[paramName] = parseInt(id);
    next();
  };
};

/**
 * Middleware para validación de campos requeridos
 */
export const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    fields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      const message = formatMessage(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, { 
        fields: missingFields.join(', ') 
      });
      return res.badRequest(message);
    }
    
    next();
  };
};

/**
 * Middleware para validación de tipos de datos
 */
export const validateFieldTypes = (fieldTypes) => {
  return (req, res, next) => {
    const invalidFields = [];
    
    Object.keys(fieldTypes).forEach(field => {
      const value = req.body[field];
      const expectedType = fieldTypes[field];
      
      if (value !== undefined && value !== null && value !== '') {
        let isValid = false;
        
        switch (expectedType) {
          case 'string':
            isValid = typeof value === 'string';
            break;
          case 'number':
            isValid = typeof value === 'number' && !isNaN(value);
            break;
          case 'boolean':
            isValid = typeof value === 'boolean';
            break;
          case 'email':
            isValid = typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
          case 'date':
            isValid = typeof value === 'string' && !isNaN(Date.parse(value));
            break;
          case 'phone':
            isValid = typeof value === 'string' && /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''));
            break;
          case 'document':
            isValid = typeof value === 'string' && /^\d{6,10}$/.test(value);
            break;
          case 'password':
            isValid = typeof value === 'string' && /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}/.test(value);
            break;
        }
        
        if (!isValid) {
          invalidFields.push({
            field,
            expectedType,
            actualType: typeof value,
            value
          });
        }
      }
    });
    
    if (invalidFields.length > 0) {
      const message = formatMessage(ERROR_MESSAGES.INVALID_FIELD_VALUES, { 
        fields: invalidFields.map(f => f.field).join(', ') 
      });
      return res.validationError(invalidFields, message);
    }
    
    next();
  };
};

/**
 * Middleware para validación de rangos de valores
 */
export const validateFieldRanges = (fieldRanges) => {
  return (req, res, next) => {
    const invalidFields = [];
    
    Object.keys(fieldRanges).forEach(field => {
      const value = req.body[field];
      const range = fieldRanges[field];
      
      if (value !== undefined && value !== null && value !== '') {
        let isValid = true;
        
        if (range.min !== undefined && value < range.min) {
          isValid = false;
        }
        
        if (range.max !== undefined && value > range.max) {
          isValid = false;
        }
        
        if (range.minLength !== undefined && value.length < range.minLength) {
          isValid = false;
        }
        
        if (range.maxLength !== undefined && value.length > range.maxLength) {
          isValid = false;
        }
        
        if (!isValid) {
          invalidFields.push({
            field,
            value,
            range,
            message: formatMessage(ERROR_MESSAGES.INVALID_RANGE, {
              field,
              min: range.min || range.minLength,
              max: range.max || range.maxLength
            })
          });
        }
      }
    });
    
    if (invalidFields.length > 0) {
      const message = formatMessage(ERROR_MESSAGES.INVALID_FIELD_VALUES, { 
        fields: invalidFields.map(f => f.field).join(', ') 
      });
      return res.validationError(invalidFields, message);
    }
    
    next();
  };
};

/**
 * Middleware para validación de valores permitidos
 */
export const validateAllowedValues = (allowedValues) => {
  return (req, res, next) => {
    const invalidFields = [];
    
    Object.keys(allowedValues).forEach(field => {
      const value = req.body[field];
      const allowed = allowedValues[field];
      
      if (value !== undefined && value !== null && value !== '') {
        if (!allowed.includes(value)) {
          invalidFields.push({
            field,
            value,
            allowed,
            message: formatMessage(ERROR_MESSAGES.INVALID_CHOICE, {
              field,
              value,
              choices: allowed.join(', ')
            })
          });
        }
      }
    });
    
    if (invalidFields.length > 0) {
      const message = formatMessage(ERROR_MESSAGES.INVALID_FIELD_VALUES, { 
        fields: invalidFields.map(f => f.field).join(', ') 
      });
      return res.validationError(invalidFields, message);
    }
    
    next();
  };
};

/**
 * Middleware para logging de respuestas
 */
export const responseLogger = (req, res, next) => {
  // Verificar que req, res y next existen
  if (!req || !res || !next) {
    console.error('responseLogger: req, res o next es undefined');
    return next();
  }
  
  // Verificar que res.json existe antes de intentar modificarlo
  if (res.json && typeof res.json === 'function') {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log de la respuesta
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Response:', JSON.stringify(data, null, 2));
      }
      
      return originalJson.call(this, data);
    };
  }
  
  next();
};
