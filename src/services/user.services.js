import User from '../models/user.js';
import { Op } from 'sequelize';

// Obtener todos los usuarios
export const getAllUsuarios = async () => {
  return await User.findAll();
};

// Obtener usuario por ID
export const getUsuarioById = async (id) => {
  return await User.findByPk(id);
};

// Actualizar usuario
export const updateUsuarioById = async (id, data) => {
  const [updated] = await User.update(data, { where: { id_usuario: id } });
  if (updated) {
    return await User.findByPk(id);
  }
  return null;
};

// Eliminar usuario
export const deleteUsuarioById = async (id) => {
  return await User.destroy({ where: { id_usuario: id } });
};

// Validaciones de unicidad (pueden ser usadas en middleware también)
export const existeCorreo = async (correo, excludeId = null) => {
  const where = excludeId
    ? { correo, id_usuario: { [Op.ne]: excludeId } }
    : { correo };
  return await User.findOne({ where });
};

export const existeDocumento = async (documento, excludeId = null) => {
  const where = excludeId
    ? { documento, id_usuario: { [Op.ne]: excludeId } }
    : { documento };
  return await User.findOne({ where });
};


//cambiar estado
export const changeUserStatus = async (id, status) => {
  const [updated] = await User.update({ estado: status }, { where: { id_usuario: id } });
  if (updated) {
    return await User.findByPk(id);
  }
  return null;
};
