/**
 * Middleware de Rate Limiting para protección contra ataques de fuerza bruta
 * 
 * Implementa límites de solicitudes por IP para endpoints críticos:
 * - Login: 5 intentos por 15 minutos
 * - Registro: 3 intentos por 15 minutos
 * - Recuperación de contraseña: 3 intentos por 15 minutos
 * - Reset de contraseña: 5 intentos por 15 minutos
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter para Login
 * Protege contra ataques de fuerza bruta en inicio de sesión
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP en 15 minutos
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de login. Por favor, intenta nuevamente en 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true, // Retorna información de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // No retorna `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Contar todos los intentos, incluso los exitosos
  skipFailedRequests: false, // Contar todos los intentos, incluso los fallidos
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de login. Por favor, intenta nuevamente en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 5 intentos de login por IP. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente.'
      }
    });
  }
});

/**
 * Rate Limiter para Registro
 * Protege contra creación masiva de cuentas
 */
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // 3 registros por IP en 15 minutos
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de registro. Por favor, intenta nuevamente en 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar registros exitosos
  skipFailedRequests: false, // Contar intentos fallidos
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de registro. Por favor, intenta nuevamente en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 3 intentos de registro por IP. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente.'
      }
    });
  }
});

/**
 * Rate Limiter para Recuperación de Contraseña (Forgot Password)
 * Protege contra spam de emails de recuperación
 * 
 * IMPORTANTE: Cuenta TODAS las solicitudes (exitosas y fallidas) porque
 * el endpoint siempre retorna 200 para no revelar si el email existe.
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // 3 solicitudes por IP en 15 minutos
  message: {
    success: false,
    error: {
      message: 'Demasiadas solicitudes de recuperación de contraseña. Por favor, intenta nuevamente en 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // ✅ CONTAR TODAS las solicitudes (exitosas y fallidas)
  skipFailedRequests: false,    // ✅ CONTAR TODAS las solicitudes
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas solicitudes de recuperación de contraseña. Por favor, intenta nuevamente en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 3 solicitudes de recuperación por IP. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente.'
      }
    });
  }
});

/**
 * Rate Limiter para Reset de Contraseña
 * Protege contra intentos de fuerza bruta en reset de contraseña
 */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP en 15 minutos
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de reset de contraseña. Por favor, intenta nuevamente en 15 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutos',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de reset de contraseña. Por favor, intenta nuevamente en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 5 intentos de reset por IP. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente.'
      }
    });
  }
});

/**
 * Rate Limiter Genérico para Endpoints Críticos
 * Usar para endpoints que requieren protección adicional
 */
export const createGenericLimiter = (maxRequests = 10, windowMinutes = 15) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      error: {
        message: `Demasiadas solicitudes. Por favor, intenta nuevamente en ${windowMinutes} minutos.`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: `${windowMinutes} minutos`,
        timestamp: new Date().toISOString()
      }
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

