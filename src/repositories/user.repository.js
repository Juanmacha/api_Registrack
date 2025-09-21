import User from '../models/user.js';

export const getAllUsers = async () => {
  return await User.findAll();
};

export const getUserById = async (id) => {
  return await User.findByPk(id);
};

export const updateUserById = async (id, data) => {
  const [updated] = await User.update(data, { where: { id_usuario: id } });
  if (updated) {
    return await User.findByPk(id);
  }
  return null;
};

export const deleteUserById = async (id) => {
  const deleted = await User.destroy({ where: { id_usuario: id } });
  return deleted > 0;
};

//cambiar estado
export const changeUserStatus = async (id, status) => {
  const [updated] = await User.update({ estado: status }, { where: { id_usuario: id } });
  if (updated) {
    return await User.findByPk(id);
  }
  return null;
};