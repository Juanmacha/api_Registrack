import * as userService from "../services/user.services.js";
import { createUserWithRole } from "../services/auth.services.js";

// Crear usuario por administrador (con rol específico)
export const createUserByAdmin = async (req, res) => {
  try {
    const nuevoUsuario = await createUserWithRole(req.body);
    res.status(201).json({
      mensaje: "Usuario creado exitosamente por administrador",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await userService.getAllUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuarioPorId = async (req, res) => {
  try {
    const usuario = await userService.getUsuarioById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req; // Datos del usuario autenticado desde el token

    // Si es cliente, solo puede actualizar sus propios datos
    if (user.rol === "cliente" && user.id_usuario != id) {
      return res.status(403).json({
        mensaje:
          "No tienes permisos para actualizar este usuario. Solo puedes actualizar tu propio perfil.",
      });
    }

    // Si es cliente, no puede cambiar su rol
    if (user.rol === "cliente" && req.body.id_rol) {
      return res.status(403).json({
        mensaje: "No tienes permisos para cambiar el rol de usuario.",
      });
    }

    const usuarioActualizado = await userService.updateUsuarioById(
      id,
      req.body
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario actualizado", usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUsuario = async (req, res) => {
  try {
    const deleted = await userService.deleteUsuarioById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para cambiar el estado del usuario (activar/desactivar)
export const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body; // Nuevo estado (true/false)
    const usuarioActualizado = await userService.changeUserStatus(id, estado);
    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json({
      mensaje: "Estado del usuario actualizado",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
