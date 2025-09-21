// src/middlewares/empleado.middleware.js
import Empleado from "../models/Empleado.js";
import User from "../models/user.js";

export const validateEmpleado = async (req, res, next) => {
  const { id_usuario } = req.body;
    if (!id_usuario) {
        return res.status(400).json({ message: "El campo id_usuario es obligatorio." });
    }
    try {
        const user = await User.findByPk(id_usuario);
        if (!user) {
            return res.status(404).json({ message: "El usuario con el id proporcionado no existe." });
        }
        const existingEmpleado = await Empleado.findOne({ where: { id_usuario } });
        if (existingEmpleado) {
            return res.status(400).json({ message: "El usuario ya está asociado a un empleado." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Error al validar el empleado.", error: error.message });
    }
};


export default {
  validateEmpleado
};