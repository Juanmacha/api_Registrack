// auth.repository.js
import { User, Rol } from "../models/user_rol.js";

// Buscar usuario por correo incluyendo su rol
export const findUserByEmail = async (correo) => {
  return await User.findOne({
    where: { correo },
    include: [
      {
        model: Rol,
        as: "rol",       // debe coincidir con el alias definido en las asociaciones
        attributes: ["id_rol", "nombre"]
      }
    ]
  });
};

// Buscar rol por nombre
export const findRoleByName = async (nombreRol) => {
  return await Rol.findOne({
    where: { nombre: nombreRol }
  });
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  return await User.create(userData);
};

// Buscar usuario por token de restablecimiento
export const findUserByResetToken = async (hashedToken) => {
  return await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
    },
  });
};
