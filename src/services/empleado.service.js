// src/services/empleado.service.js
import empleadoRepository from "../repositories/empleado.repository.js";

export const getAllEmpleados = async () => {
    return await empleadoRepository.getAllEmpleados();
};

export const getEmpleadoById = async (id) => {
    return await empleadoRepository.getEmpleadoById(id);
};

export const createEmpleado = async (data) => {
    return await empleadoRepository.createEmpleado(data);
};

export const updateEmpleado = async (id, data) => {
    return await empleadoRepository.updateEmpleado(id, data);
};

export const changeEmpleadoState = async (id, estado) => {
    return await empleadoRepository.changeEmpleadoState(id, estado);
};

export const deleteEmpleado = async (id) => {
    return await empleadoRepository.deleteEmpleado(id);
};

export default {
    getAllEmpleados,
    getEmpleadoById,
    createEmpleado,
    updateEmpleado,
    changeEmpleadoState,
    deleteEmpleado
};