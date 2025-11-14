import { validarContraseñaCompleta } from '../utils/passwordValidator.js';

export const validarForgotPassword = (req, res, next) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ mensaje: 'El campo correo es obligatorio.' });
  }

  if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(correo)) {
    return res.status(400).json({ mensaje: 'El formato del correo no es válido.' });
  }

  next();
};

export const validarResetPassword = (req, res, next) => {
  const { code, token, newPassword } = req.body;
  
  // Aceptar 'code' o 'token' por compatibilidad
  const resetCode = code || token;

  if (!resetCode || !newPassword) {
    return res.status(400).json({ mensaje: 'El código de verificación y la nueva contraseña son obligatorios.' });
  }

  // Validar que el código sea numérico de 6 dígitos
  if (!/^\d{6}$/.test(resetCode)) {
    return res.status(400).json({ mensaje: 'El código de verificación debe ser un número de 6 dígitos.' });
  }

  // ✅ Validar contraseña (común + fortaleza)
  const errorContraseña = validarContraseñaCompleta(newPassword);
  if (errorContraseña) {
    return res.status(400).json({
      success: false,
      error: {
        message: errorContraseña.message,
        code: errorContraseña.code,
        details: errorContraseña.details || errorContraseña.requisitos || errorContraseña.sugerencias,
        ...(errorContraseña.minLength && { minLength: errorContraseña.minLength, actualLength: errorContraseña.actualLength }),
        ...(errorContraseña.maxLength && { maxLength: errorContraseña.maxLength, actualLength: errorContraseña.actualLength })
      },
      timestamp: new Date().toISOString()
    });
  }

  next();
};