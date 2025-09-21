import User from '../models/Empleado.js';

export const getAllEmpleados = async () => {
  return await User.findAll();
};

export const getEmpleadoById = async (id) => {
  return await User.findByPk(id);
};  

export const createEmpleado = async (data) => {
  return await User.create(data);
};

export const updateEmpleado = async (id, data) => {
  const [updated] = await User.update(data, { where: { id_empleado: id } });
  if (updated) {
    return await User.findByPk(id);
  }
  return null;
};

export const changeEmpleadoState = async (id, estado) => {
  const empleado = await User.findByPk(id); 
    if (empleado) {
        empleado.estado = estado;
        await empleado.save();
        return empleado;
    }
    return null;
};
export const deleteEmpleado = async (id) => {
  const deleted = await User.destroy({ where: { id_empleado: id } });
  return deleted > 0;
};

export default {
  getAllEmpleados,
  getEmpleadoById,
    createEmpleado, 
    updateEmpleado,
    changeEmpleadoState,
    deleteEmpleado
};