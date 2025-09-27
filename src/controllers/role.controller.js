import { Role, Permiso, Privilegio, RolPermisoPrivilegio } from '../models/index.js';
import roleService from '../services/role.service.js';
import { 
  transformPermisosToAPI, 
  transformRoleToFrontend, 
  validateFrontendPermissions,
  parseEstado,
  formatEstado
} from '../utils/roleTransformations.js';

// Crear un rol con permisos y privilegios
export const createRole = async (req, res) => {
  try {
    console.log('🆕 [Backend] Creando nuevo rol...');
    console.log('📥 [Backend] Datos recibidos del frontend:', JSON.stringify(req.body, null, 2));
    
    const { nombre, estado, permisos } = req.body;
    
    // Validar datos básicos
    if (!nombre || typeof nombre !== 'string') {
      throw new Error('El nombre del rol es obligatorio y debe ser un string');
    }
    
    if (!permisos || typeof permisos !== 'object') {
      throw new Error('Los permisos son obligatorios y deben ser un objeto');
    }
    
    // Transformar permisos del frontend al formato de la API
    const { permisos: permisosAPI, privilegios } = transformPermisosToAPI(permisos);
    
    console.log('🔄 [Backend] Permisos transformados para la API:', { permisos: permisosAPI, privilegios });
    
    // Crear el rol con los datos transformados
    const rolData = {
      nombre: nombre.toLowerCase().trim(),
      permisos: permisosAPI,
      privilegios: privilegios
    };
    
    const result = await roleService.createRoleWithDetails(rolData);
    console.log('✅ [Backend] Rol creado en la base de datos:', result.id_rol);
    
    // Transformar el resultado al formato del frontend
    const transformedRole = transformRoleToFrontend(result);
    
    console.log('✅ [Backend] Rol transformado para el frontend:', transformedRole.id);
    
    res.status(201).json({
      success: true,
      data: transformedRole
    });
  } catch (error) {
    console.error('❌ [Backend] Error al crear rol:', error);
    res.status(400).json({ 
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener todos los roles con permisos y privilegios
export const getRoles = async (req, res) => {
  try {
    console.log('📋 [Backend] Obteniendo todos los roles...');
    
    const roles = await roleService.getAllRoles();
    console.log('📋 [Backend] Roles obtenidos de la base de datos:', roles.length);
    
    // Transformar cada rol al formato del frontend
    const transformedRoles = roles.map(role => transformRoleToFrontend(role));
    
    console.log('✅ [Backend] Roles transformados al formato frontend:', transformedRoles.length);
    
    res.json({
      success: true,
      data: transformedRoles
    });
  } catch (error) {
    console.error('❌ [Backend] Error al obtener roles:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener roles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res) => {
  try {
    console.log('🔍 [Backend] Obteniendo rol por ID:', req.params.id);
    
    const role = await roleService.getRoleById(req.params.id);
    
    if (!role) {
      console.log('❌ [Backend] Rol no encontrado:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Rol no encontrado',
        details: { id: req.params.id }
      });
    }
    
    console.log('✅ [Backend] Rol encontrado en la base de datos:', role.id_rol);
    
    // Transformar el rol al formato del frontend
    const transformedRole = transformRoleToFrontend(role);
    
    console.log('✅ [Backend] Rol transformado para el frontend:', transformedRole.id);
    
    res.json({
      success: true,
      data: transformedRole
    });
  } catch (error) {
    console.error('❌ [Backend] Error al obtener rol:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener rol',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar un rol (nombre y estado)
export const updateRole = async (req, res) => {
  try {
    console.log('✏️ [Backend] Actualizando rol...');
    console.log('📥 [Backend] ID del rol:', req.params.id);
    console.log('📥 [Backend] Datos recibidos del frontend:', JSON.stringify(req.body, null, 2));
    
    const { nombre, estado, permisos } = req.body;
    
    // Validar datos básicos
    if (!nombre || typeof nombre !== 'string') {
      throw new Error('El nombre del rol es obligatorio y debe ser un string');
    }
    
    if (!permisos || typeof permisos !== 'object') {
      throw new Error('Los permisos son obligatorios y deben ser un objeto');
    }
    
    // Transformar permisos del frontend al formato de la API
    const { permisos: permisosAPI, privilegios } = transformPermisosToAPI(permisos);
    
    console.log('🔄 [Backend] Permisos transformados para la API:', { permisos: permisosAPI, privilegios });
    
    // Actualizar el rol con los datos transformados
    const rolData = {
      nombre: nombre.toLowerCase().trim(),
      permisos: permisosAPI,
      privilegios: privilegios
    };
    
    const result = await roleService.updateRoleWithDetails(req.params.id, rolData);
    console.log('✅ [Backend] Rol actualizado en la base de datos:', result.id_rol);
    
    // Transformar el resultado al formato del frontend
    const transformedRole = transformRoleToFrontend(result);
    
    console.log('✅ [Backend] Rol transformado para el frontend:', transformedRole.id);
    
    res.json({
      success: true,
      data: transformedRole
    });
  } catch (error) {
    console.error('❌ [Backend] Error al actualizar rol:', error);
    res.status(400).json({ 
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Cambiar estado de un rol
export const changeRoleState = async (req, res) => {
  try {
    console.log('🔄 [Backend] Cambiando estado del rol...');
    console.log('📥 [Backend] ID del rol:', req.params.id);
    console.log('📥 [Backend] Estado recibido:', req.body.estado);
    
    const { estado } = req.body;
    
    // Validar que el estado sea válido
    if (typeof estado !== 'boolean' && typeof estado !== 'string') {
      throw new Error('El estado debe ser true/false o "Activo"/"Inactivo"');
    }
    
    // Convertir estado a booleano
    const estadoBoolean = parseEstado(estado);
    
    const rol = await Role.findByPk(req.params.id);
    if (!rol) {
      console.log('❌ [Backend] Rol no encontrado:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Rol no encontrado',
        details: { id: req.params.id }
      });
    }

    console.log('📝 [Backend] Estado anterior:', rol.estado);
    console.log('📝 [Backend] Estado nuevo:', estadoBoolean);

    rol.estado = estadoBoolean;
    await rol.save();

    console.log('✅ [Backend] Estado del rol actualizado en la base de datos');

    // Obtener el rol completo con permisos y privilegios
    const rolCompleto = await roleService.getRoleById(req.params.id);
    
    // Transformar al formato del frontend
    const transformedRole = transformRoleToFrontend(rolCompleto);
    
    console.log('✅ [Backend] Rol transformado para el frontend:', transformedRole.id);

    res.json({
      success: true,
      data: transformedRole
    });
  } catch (error) {
    console.error('❌ [Backend] Error al cambiar estado del rol:', error);
    res.status(400).json({ 
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Eliminar un rol
export const deleteRole = async (req, res) => {
  try {
    const rol = await Role.findByPk(req.params.id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    await rol.destroy();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
