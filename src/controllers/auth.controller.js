import {
  registerUser,
  loginUser,
  handleForgotPassword,
  handleResetPassword,
} from "../services/auth.services.js";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_MESSAGES,
  ERROR_CODES 
} from "../constants/messages.js";
import { sanitizeLoginEmail, sanitizePassword } from '../utils/inputSanitizer.js';

export const register = async (req, res) => {
  try {
    const nuevoUsuario = await registerUser(req.body);
    
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: {
        usuario: {
          id_usuario: nuevoUsuario.id_usuario,
          tipo_documento: nuevoUsuario.tipo_documento,
          documento: nuevoUsuario.documento,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          correo: nuevoUsuario.correo,
          telefono: nuevoUsuario.telefono || null,
          id_rol: nuevoUsuario.id_rol,
          estado: nuevoUsuario.estado,
          fecha_creacion: nuevoUsuario.fecha_creacion
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        nextSteps: [
          "Inicie sesión con sus credenciales",
          "Complete su perfil de cliente si es necesario",
          "Explore los servicios disponibles"
        ]
      }
    });
  } catch (error) {
    console.error("Error en registro de usuario:", error);
    
    if (error.message.includes("correo")) {
      return res.status(409).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
          code: ERROR_CODES.DUPLICATE_VALUE,
          details: { field: "correo", value: req.body.correo },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (error.message.includes("documento")) {
      return res.status(409).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.DOCUMENT_ALREADY_EXISTS,
          code: ERROR_CODES.DUPLICATE_VALUE,
          details: { field: "documento", value: req.body.documento },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al registrar usuario",
        timestamp: new Date().toISOString()
      }
    });
  }
};

export const login = async (req, res) => {
  try {
    // ✅ SANITIZAR INPUTS para prevenir XSS e inyección
    const correoRaw = req.body.correo;
    const contrasenaRaw = req.body.contrasena;
    
    // Validaciones básicas
    if (!correoRaw || !contrasenaRaw) {
      return res.status(400).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.USER.REQUIRED_FIELDS,
          code: ERROR_CODES.REQUIRED_FIELD,
          details: { missingFields: !correoRaw ? ['correo'] : ['contrasena'] },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // ✅ Sanitizar inputs
    const correo = sanitizeLoginEmail(correoRaw);
    const contrasena = sanitizePassword(contrasenaRaw);
    
    // Validar que la sanitización no haya eliminado el contenido
    if (!correo || correo.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'El correo electrónico contiene caracteres inválidos',
          code: 'INVALID_EMAIL_FORMAT',
          details: 'El correo no puede contener caracteres especiales peligrosos',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    const { usuario, token } = await loginUser(correo, contrasena);
    
    // ✅ El usuario ya viene con rol.permisos desde el servicio
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono || null,
          tipo_documento: usuario.tipo_documento || null,
          documento: usuario.documento || null,
          rol: usuario.rol,  // ✅ Ahora incluye permisos en formato granular
          estado: usuario.estado
        },
        token,
        expiresIn: "1h"
      },
      meta: {
        timestamp: new Date().toISOString(),
        permissions: usuario.rol?.nombre === "administrador" ? "Acceso completo" : 
                    usuario.rol?.nombre === "empleado" ? "Acceso operativo" : 
                    "Acceso limitado a datos propios"
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    
    // ✅ Usar código de error si está disponible (más confiable)
    if (error.code === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          code: ERROR_CODES.INVALID_CREDENTIALS,
          details: { 
            hint: "Verifique sus credenciales e intente nuevamente",
            reason: "El correo electrónico o la contraseña son incorrectos"
          },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    if (error.code === "USER_INACTIVE") {
      return res.status(403).json({
        success: false,
        error: {
          message: "Su cuenta está inactiva. Contacte al administrador.",
          code: ERROR_CODES.ACCESS_DENIED,
          details: { reason: "Cuenta inactiva" },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // ✅ Fallback: Normalizar mensaje de error a minúsculas para comparación
    const errorMessage = error.message.toLowerCase();
    
    // Validar credenciales incorrectas (contraseña incorrecta, usuario no encontrado)
    if (
      errorMessage.includes("credenciales") || 
      errorMessage.includes("contraseña") || 
      errorMessage.includes("contraseña incorrecta") ||
      errorMessage.includes("usuario no encontrado") ||
      errorMessage.includes("password") ||
      errorMessage.includes("invalid")
    ) {
      return res.status(401).json({
        success: false,
        error: {
          message: ERROR_MESSAGES.INVALID_CREDENTIALS,
          code: ERROR_CODES.INVALID_CREDENTIALS,
          details: { 
            hint: "Verifique sus credenciales e intente nuevamente",
            reason: "El correo electrónico o la contraseña son incorrectos"
          },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Validar usuario inactivo o bloqueado
    if (
      errorMessage.includes("inactivo") || 
      errorMessage.includes("bloqueado") ||
      errorMessage.includes("inactive") ||
      errorMessage.includes("disabled")
    ) {
      return res.status(403).json({
        success: false,
        error: {
          message: "Su cuenta está inactiva. Contacte al administrador.",
          code: ERROR_CODES.ACCESS_DENIED,
          details: { reason: "Cuenta inactiva" },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Error genérico del servidor (solo para errores inesperados)
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al iniciar sesión",
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Controlador para solicitar restablecimiento de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;
    
    if (!correo) {
      return res.status(400).json({
        success: false,
        error: {
          message: "El correo electrónico es obligatorio",
          code: ERROR_CODES.REQUIRED_FIELD,
          details: { field: "correo" },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    await handleForgotPassword(correo);
    
    // Respuesta neutra para no revelar si el correo existe
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      meta: {
        timestamp: new Date().toISOString(),
        instructions: [
          "Revise su bandeja de entrada",
          "Si no encuentra el correo, revise la carpeta de spam",
          "El código de recuperación expira en 15 minutos"
        ]
      }
    });
  } catch (error) {
    console.error("Error en forgot password:", error);
    
    // Mantener respuesta neutra incluso en caso de error
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      meta: {
        timestamp: new Date().toISOString(),
        instructions: [
          "Revise su bandeja de entrada",
          "Si no encuentra el correo, revise la carpeta de spam",
          "El código de recuperación expira en 15 minutos"
        ]
      }
    });
  }
};

// Controlador para restablecer la contraseña
export const resetPassword = async (req, res) => {
  try {
    const { code, newPassword } = req.body;
    
    // También aceptar 'token' por compatibilidad, pero preferir 'code'
    const resetCode = code || req.body.token;
    
    if (!resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Código de verificación y nueva contraseña son requeridos",
          code: ERROR_CODES.REQUIRED_FIELD,
          details: { missingFields: !resetCode ? ['code'] : ['newPassword'] },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Validar que el código sea numérico de 6 dígitos
    if (!/^\d{6}$/.test(resetCode)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "El código de verificación debe ser un número de 6 dígitos",
          code: ERROR_CODES.INVALID_INPUT,
          details: { field: "code" },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Validar formato de contraseña
    if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.USER.WEAK_PASSWORD,
          code: ERROR_CODES.INVALID_PASSWORD,
          details: { field: "newPassword" },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    await handleResetPassword(resetCode, newPassword);
    
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET,
      meta: {
        timestamp: new Date().toISOString(),
        nextSteps: [
          "Inicie sesión con su nueva contraseña",
          "Considere cambiar su contraseña regularmente",
          "Mantenga sus credenciales seguras"
        ]
      }
    });
  } catch (error) {
    console.error("Error en reset password:", error);
    
    if (error.message.includes("token") || error.message.includes("expired") || error.message.includes("Código") || error.message.includes("código")) {
      return res.status(400).json({
        success: false,
        error: {
          message: "El código de verificación no es válido o ha expirado",
          code: ERROR_CODES.TOKEN_INVALID,
          details: { 
            reason: "Código inválido o expirado",
            solution: "Solicite un nuevo código de recuperación"
          },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al restablecer contraseña",
        timestamp: new Date().toISOString()
      }
    });
  }
};
