import * as userService from "../services/user.services.js";
import { createUserWithRole } from "../services/auth.services.js";

// Crear usuario por administrador (con rol específico)
export const createUserByAdmin = async (req, res) => {
  try {
    // ✅ RESTRICCIÓN: Solo admin/empleado pueden crear usuarios
    if (req.user.rol === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes permiso para crear usuarios",
        error: {
          code: 'PERMISSION_DENIED',
          details: 'Solo administradores y empleados pueden crear usuarios'
        }
      });
    }

    console.log('📥 [Backend] Creando usuario por administrador:', {
      tipo_documento: req.body.tipo_documento,
      documento: req.body.documento,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      correo: req.body.correo,
      id_rol: req.body.id_rol,
      telefono: req.body.telefono || 'No proporcionado'
    });
    
    const nuevoUsuario = await createUserWithRole(req.body);
    
    console.log('✅ [Backend] Usuario creado exitosamente:', nuevoUsuario.id_usuario);
    
    res.status(201).json({
      success: true,
      mensaje: "Usuario creado exitosamente por administrador",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error('❌ [Backend] Error al crear usuario:', error.message);
    console.error('❌ [Backend] Stack:', error.stack);
    console.error('❌ [Backend] Body recibido:', req.body);
    
    // Mejorar mensajes de error
    let statusCode = 400;
    let errorMessage = error.message;
    let errorDetails = null;
    
    // Identificar tipos de error comunes
    if (error.message.includes('correo') || error.message.includes('email')) {
      errorDetails = {
        campo: 'correo',
        valor: req.body.correo,
        mensaje: 'El correo electrónico ya está registrado o es inválido'
      };
    } else if (error.message.includes('documento')) {
      errorDetails = {
        campo: 'documento',
        valor: req.body.documento,
        mensaje: 'El documento ya está registrado o es inválido'
      };
    } else if (error.message.includes('rol')) {
      errorDetails = {
        campo: 'id_rol',
        valor: req.body.id_rol,
        mensaje: 'El rol especificado no existe o no es válido'
      };
    } else if (error.message.includes('contraseña') || error.message.includes('password')) {
      errorDetails = {
        campo: 'contrasena',
        mensaje: 'La contraseña no cumple con los requisitos de seguridad'
      };
    } else if (error.name === 'SequelizeValidationError') {
      errorDetails = {
        errores: error.errors.map(err => ({
          campo: err.path,
          mensaje: err.message,
          valor: err.value
        }))
      };
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      statusCode = 409;
      const field = error.errors[0]?.path || 'campo';
      errorDetails = {
        campo: field,
        valor: error.errors[0]?.value,
        mensaje: `El valor '${error.errors[0]?.value}' ya existe para el campo '${field}'`
      };
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      detalles: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
};

export const getUsuarios = async (req, res) => {
  try {
    // ✅ RESTRICCIÓN: Clientes no pueden listar usuarios
    if (req.user.rol === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes permiso para listar usuarios",
        error: {
          code: 'PERMISSION_DENIED',
          details: 'Solo administradores y empleados pueden listar usuarios'
        }
      });
    }

    const usuarios = await userService.getAllUsuarios();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ VALIDAR PROPIEDAD: Si es cliente, solo puede ver su propio usuario
    if (req.user.rol === 'cliente' && req.user.id_usuario != id) {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes permiso para ver este usuario",
        error: {
          code: 'PERMISSION_DENIED',
          details: 'Solo puedes ver tu propio perfil de usuario'
        }
      });
    }

    const usuario = await userService.getUsuarioById(id);
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
    // ✅ RESTRICCIÓN: Clientes no pueden eliminar usuarios
    if (req.user.rol === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes permiso para eliminar usuarios",
        error: {
          code: 'PERMISSION_DENIED',
          details: 'Solo administradores y empleados pueden eliminar usuarios'
        }
      });
    }

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
    // ✅ RESTRICCIÓN: Clientes no pueden cambiar estados de usuarios
    if (req.user.rol === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes permiso para cambiar el estado de usuarios",
        error: {
          code: 'PERMISSION_DENIED',
          details: 'Solo administradores y empleados pueden cambiar el estado de usuarios'
        }
      });
    }

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
