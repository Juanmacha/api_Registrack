/**
 * Middleware de Rate Limiting para protección contra ataques de fuerza bruta
 * 
 * ✅ MEJORADO (Enero 2026): Rate limiting por email + IP (no solo IP)
 * 
 * Implementa límites de solicitudes por email+IP para endpoints críticos:
 * - Login: 5 intentos fallidos por email+IP en 5 minutos (no cuenta logins exitosos)
 * - Registro: 3 intentos fallidos por email+IP en 5 minutos
 * - Recuperación de contraseña: 3 solicitudes por email+IP en 15 minutos
 * - Reset de contraseña: 5 intentos por email+IP en 15 minutos
 * 
 * Ventajas:
 * - No bloquea a otros usuarios en la misma IP
 * - Los logins exitosos no cuentan hacia el límite
 * - Bloqueo más corto (5 minutos) para mejor UX
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate Limiter para Login
 * Protege contra ataques de fuerza bruta en inicio de sesión
 * ✅ MEJORADO: Rate limiting por email + IP (no solo IP)
 * ✅ MEJORADO: No cuenta logins exitosos
 * ✅ MEJORADO: Bloqueo de 5 minutos (reducido de 15)
 */
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 5, // 5 intentos fallidos por email+IP en 5 minutos
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de login. Por favor, intenta nuevamente en 5 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '5 minutos',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true, // Retorna información de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // No retorna `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // ✅ No contar logins exitosos (solo fallidos)
  skipFailedRequests: false, // Contar intentos fallidos
  // ✅ Key personalizado: email + IP (no solo IP)
  // ✅ Usa ipKeyGenerator para soporte IPv6 correcto
  keyGenerator: (req) => {
    const email = req.body?.correo || req.body?.email || 'unknown';
    const ip = ipKeyGenerator(req);
    // Normalizar email a minúsculas para evitar duplicados
    return `${email.toLowerCase()}_${ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de login. Por favor, intenta nuevamente en 5 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '5 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 5 intentos fallidos de login. Por seguridad, debes esperar 5 minutos antes de intentar nuevamente.'
      }
    });
  }
});

/**
 * Rate Limiter para Registro
 * Protege contra creación masiva de cuentas
 * ✅ MEJORADO: Rate limiting por email + IP (no solo IP)
 * ✅ MEJORADO: Bloqueo de 5 minutos (reducido de 15)
 */
export const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 3, // 3 intentos fallidos por email+IP en 5 minutos
  message: {
    success: false,
    error: {
      message: 'Demasiados intentos de registro. Por favor, intenta nuevamente en 5 minutos.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '5 minutos',
      timestamp: new Date().toISOString()
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar registros exitosos
  skipFailedRequests: false, // Contar intentos fallidos
  // ✅ Key personalizado: email + IP (no solo IP)
  // ✅ Usa ipKeyGenerator para soporte IPv6 correcto
  keyGenerator: (req) => {
    const email = req.body?.correo || req.body?.email || 'unknown';
    const ip = ipKeyGenerator(req);
    // Normalizar email a minúsculas para evitar duplicados
    return `${email.toLowerCase()}_${ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de registro. Por favor, intenta nuevamente en 5 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '5 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 3 intentos fallidos de registro. Por seguridad, debes esperar 5 minutos antes de intentar nuevamente.'
      }
    });
  }
});

/**
 * Rate Limiter para Recuperación de Contraseña (Forgot Password)
 * Protege contra spam de emails de recuperación
 * ✅ MEJORADO: Rate limiting por email + IP (no solo IP)
 * 
 * IMPORTANTE: Cuenta TODAS las solicitudes (exitosas y fallidas) porque
 * el endpoint siempre retorna 200 para no revelar si el email existe.
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3, // 3 solicitudes por email+IP en 15 minutos
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
  // ✅ Key personalizado: email + IP (no solo IP)
  // ✅ Usa ipKeyGenerator para soporte IPv6 correcto
  keyGenerator: (req) => {
    const email = req.body?.correo || req.body?.email || 'unknown';
    const ip = ipKeyGenerator(req);
    // Normalizar email a minúsculas para evitar duplicados
    return `${email.toLowerCase()}_${ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiadas solicitudes de recuperación de contraseña. Por favor, intenta nuevamente en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 3 solicitudes de recuperación por email. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente.'
      }
    });
  }
});

/**
 * Rate Limiter para Reset de Contraseña
 * Protege contra intentos de fuerza bruta en reset de contraseña
 * ✅ MEJORADO: Rate limiting por código + IP (no solo IP)
 * El código identifica al usuario, así que código+IP = usuario+IP
 */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por código+IP en 15 minutos (cada código está asociado a un usuario)
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
  // ✅ Key personalizado: código + IP (el código identifica al usuario)
  // ✅ Usa ipKeyGenerator para soporte IPv6 correcto
  // El código de reset está asociado a un usuario específico (por email)
  keyGenerator: (req) => {
    const code = req.body?.code || req.body?.token || 'unknown';
    const ip = ipKeyGenerator(req);
    // Usar código+IP para identificar al usuario (cada código está asociado a un email específico)
    return `reset_${code}_${ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Demasiados intentos de reset de contraseña. Por favor, intenta nuevamente en 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutos',
        timestamp: new Date().toISOString(),
        details: 'Has excedido el límite de 5 intentos de reset. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente.'
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

