import User from '../models/user.js';

// Buscar usuario por correo
export const findUserByEmail = async (correo) => {
  return await User.findOne({ where: { correo } });
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  return await User.create(userData);
};
