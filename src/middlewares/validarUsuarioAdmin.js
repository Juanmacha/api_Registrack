import { Op } from "sequelize";
import User from "../models/user.js";
import { Rol } from "../models/user_rol.js";

// Middleware para validar creación de usuario por administrador
export const validarCrearUsuarioPorAdmin = async (req, res, next) => {
  const {
    tipo_documento,
    documento,
    nombre,
    apellido,
    correo,
    contrasena,
    id_rol,
  } = req.body;

  // Validar campos obligatorios (incluyendo id_rol)
  if (
    !tipo_documento ||
    !documento ||
    !nombre ||
    !apellido ||
    !correo ||
    !contrasena ||
    !id_rol
  ) {
    return res.status(400).json({
      mensaje:
        "Todos los campos son obligatorios (tipo_documento, documento, nombre, apellido, correo, contrasena, id_rol)",
    });
  }

  // Validar documento entre 6 y 10 dígitos
  if (!/^\d{6,10}$/.test(documento)) {
    return res
      .status(400)
      .json({ mensaje: "El documento debe tener entre 6 y 10 números" });
  }

  // Validar correo
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return res.status(400).json({ mensaje: "El correo no es válido" });
  }

  // Validar contraseña segura
  if (
    !/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}/.test(
      contrasena
    )
  ) {
    return res.status(400).json({
      mensaje:
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial",
    });
  }

  // Validar que el correo no exista
  const existeCorreo = await User.findOne({ where: { correo } });
  if (existeCorreo) {
    return res.status(400).json({ mensaje: "El correo ya está registrado" });
  }

  // Validar que el documento no exista
  const existeDocumento = await User.findOne({ where: { documento } });
  if (existeDocumento) {
    return res.status(400).json({ mensaje: "El documento ya está registrado" });
  }

  // Validar que el rol exista
  const rolValido = await Rol.findByPk(id_rol);
  if (!rolValido) {
    return res.status(400).json({ mensaje: "El rol especificado no existe" });
  }

  // Validar que el rol sea válido (solo admin, empleado, cliente)
  const rolesValidos = ["administrador", "empleado", "cliente"];
  if (!rolesValidos.includes(rolValido.nombre)) {
    return res.status(400).json({
      mensaje:
        "Rol no válido. Solo se pueden asignar roles: administrador, empleado, cliente",
    });
  }

  // Validar que el id_rol sea un número
  if (typeof id_rol !== "number" || id_rol <= 0) {
    return res
      .status(400)
      .json({ mensaje: "El id_rol debe ser un número válido" });
  }

  next();
};
