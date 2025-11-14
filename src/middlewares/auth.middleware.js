import jwt from 'jsonwebtoken';
import { Role, Permiso, Privilegio } from '../models/index.js';
import User from '../models/user.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ VALIDAR QUE EL USUARIO EXISTA Y ESTÉ ACTIVO
    const usuario = await User.findByPk(decoded.id_usuario);
    if (!usuario) {
      return res.status(401).json({ 
        success: false,
        mensaje: 'Usuario no encontrado',
        error: 'El usuario asociado al token no existe en el sistema.',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!usuario.estado) {
      return res.status(403).json({ 
        success: false,
        mensaje: 'Usuario inactivo',
        error: 'El usuario está inactivo. Por favor, contacte al administrador.',
        code: 'USER_INACTIVE',
        detalles: 'Su cuenta ha sido desactivada. No puede acceder al sistema hasta que sea reactivada.'
      });
    }
    
    // ✅ CARGAR ROL CON PERMISOS Y PRIVILEGIOS (solo si hay id_rol)
    const idRol = decoded.id_rol || usuario.id_rol;
    
    if (!idRol) {
      // Si no hay id_rol en el token (tokens antiguos), cargar solo el rol básico
      req.user = {
        id_usuario: decoded.id_usuario,
        rol: decoded.rol || usuario.rol?.nombre,
        estado: usuario.estado
      };
      return next();
    }

    // Cargar rol con permisos y privilegios
    const rol = await Role.findByPk(idRol, {
      include: [
        { 
          model: Permiso, 
          as: 'permisos', 
          attributes: ['id_permiso', 'nombre'],
          through: { attributes: [] }
        },
        { 
          model: Privilegio, 
          as: 'privilegios', 
          attributes: ['id_privilegio', 'nombre'],
          through: { attributes: [] }
        }
      ]
    });

    if (!rol) {
      return res.status(401).json({ mensaje: 'Rol no encontrado' });
    }

    // Extraer nombres de permisos y privilegios
    const permisos = rol.permisos ? rol.permisos.map(p => p.nombre) : [];
    const privilegios = rol.privilegios ? rol.privilegios.map(p => p.nombre) : [];

    // ✅ AGREGAR A req.user
    req.user = {
      id_usuario: decoded.id_usuario,
      rol: rol.nombre,
      id_rol: rol.id_rol,
      permisos: permisos,        // ← NUEVO: Lista de permisos del rol
      privilegios: privilegios, // ← NUEVO: Lista de privilegios del rol
      estado: usuario.estado     // ← NUEVO: Estado del usuario
    };

    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    
    // Diferenciar entre token expirado y token inválido
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        mensaje: 'Token expirado',
        error: 'El token JWT ha expirado. Por favor, inicie sesión nuevamente.',
        expiredAt: error.expiredAt,
        detalles: 'El token expiró. Necesita autenticarse nuevamente para obtener un nuevo token.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        mensaje: 'Token inválido',
        error: 'El token JWT proporcionado no es válido.',
        detalles: 'Verifique que el token esté correctamente formado y que sea el token correcto.'
      });
    }
    
    // Error genérico
    return res.status(401).json({ 
      success: false,
      mensaje: 'Error de autenticación',
      error: error.message || 'Token inválido',
      detalles: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


