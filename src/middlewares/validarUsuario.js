import { Op } from 'sequelize';
import User from '../models/user.js';
import Role from '../models/role.js';

// Middleware para validar el registro de un nuevo usuario
export const validarNuevoUsuario = async (req, res, next) => {
  const { tipo_documento, documento, nombre, apellido, correo, contrasena, id_rol } = req.body;

  // Validar campos obligatorios
  if (!tipo_documento || !documento || !nombre || !apellido || !correo || !contrasena || !id_rol) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  // Validar documento entre 6 y 10 dígitos
  if (!/^\d{6,10}$/.test(documento)) {
    return res.status(400).json({ mensaje: 'El documento debe tener entre 6 y 10 números' });
  }

  // Validar correo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ mensaje: 'El correo no es válido' });
  }

  // Validar contraseña segura
  if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}/.test(contrasena)) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial' });
  }

  // Validar que el correo no exista
  const existeCorreo = await User.findOne({ where: { correo } });
  if (existeCorreo) {
    return res.status(400).json({ mensaje: 'El correo ya está registrado' });
  }

  // Validar que el documento no exista
  const existeDocumento = await User.findOne({ where: { documento } });
  if (existeDocumento) {
    return res.status(400).json({ mensaje: 'El documento ya está registrado' });
  }

  // Validar que el rol exista
  const rolValido = await Role.findByPk(id_rol);
  if (!rolValido) {
    return res.status(400).json({ mensaje: 'El rol no existe' });
  }

  next();
};

// Middleware para validar actualización de usuario
export const validarActualizarUsuario = async (req, res, next) => {
  const { correo, documento, id_rol } = req.body;
  const { id } = req.params;

  // Si se actualiza el correo, validar formato y unicidad
  if (correo) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ mensaje: 'El correo no es válido' });
    }
    const existeCorreo = await User.findOne({
      where: {
        correo,
        id_usuario: { [Op.ne]: id }
      }
    });
    if (existeCorreo) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado por otro usuario' });
    }
  }

  // Si se actualiza el documento, validar formato y unicidad
  if (documento) {
    if (!/^\d{6,10}$/.test(documento)) {
      return res.status(400).json({ mensaje: 'El documento debe tener entre 6 y 10 números' });
    }
    const existeDocumento = await User.findOne({
      where: {
        documento,
        id_usuario: { [Op.ne]: id }
      }
    });
    if (existeDocumento) {
      return res.status(400).json({ mensaje: 'El documento ya está registrado por otro usuario' });
    }
  }

  // Si se actualiza el rol, validar existencia
  if (id_rol) {
    const rolValido = await Role.findByPk(id_rol);
    if (!rolValido) {
      return res.status(400).json({ mensaje: 'El rol no existe' });
    }
  }

  next();
};