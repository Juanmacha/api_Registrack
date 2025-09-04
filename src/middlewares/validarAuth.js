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
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ mensaje: 'El token y la nueva contraseña son obligatorios.' });
  }

  // Validar contraseña segura
  if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&()_+\-=\[\]{};':"\|,.<>\/?]).{8,}/.test(newPassword)) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial.' });
  }

  next();
};