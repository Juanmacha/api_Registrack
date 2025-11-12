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
    // ✅ Devuelve: { permisos, privilegios, combinaciones }
    const { permisos: permisosAPI, privilegios, combinaciones } = transformPermisosToAPI(permisos);
    
    console.log('🔄 [Backend] Permisos transformados para la API:', { permisos: permisosAPI, privilegios, combinaciones });
    
    // Crear el rol con los datos transformados
    const rolData = {
      nombre: nombre.toLowerCase().trim(),
      permisos: permisosAPI,
      privilegios: privilegios,
      combinaciones: combinaciones  // ✅ NUEVO: Combinaciones específicas
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

// Actualizar un rol (nombre, estado y permisos opcionales)
export const updateRole = async (req, res) => {
  try {
    console.log('✏️ [Backend] Actualizando rol...');
    console.log('📥 [Backend] ID del rol:', req.params.id);
    console.log('📥 [Backend] Datos recibidos del frontend:', JSON.stringify(req.body, null, 2));
    
    const { nombre, estado, permisos } = req.body;
    
    // Validar que el rol existe
    const rolExistente = await roleService.getRoleById(req.params.id);
    if (!rolExistente) {
      console.log('❌ [Backend] Rol no encontrado:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Rol no encontrado',
        details: { id: req.params.id }
      });
    }

    // Preparar datos para actualización (solo los campos que se proporcionan)
    const updateData = {};

    // Actualizar nombre si se proporciona
    if (nombre !== undefined) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre del rol debe ser un string no vacío');
      }
      updateData.nombre = nombre.toLowerCase().trim();
      console.log('📝 [Backend] Nombre a actualizar:', updateData.nombre);
    }

    // Actualizar estado si se proporciona
    if (estado !== undefined) {
      const estadoBoolean = parseEstado(estado);
      updateData.estado = estadoBoolean;
      console.log('📝 [Backend] Estado a actualizar:', estadoBoolean);
    }

    // Actualizar permisos si se proporcionan
    if (permisos !== undefined) {
      if (typeof permisos !== 'object' || permisos === null) {
        throw new Error('Los permisos deben ser un objeto');
      }

      // Transformar permisos del frontend al formato de la API
      // ✅ Devuelve: { permisos, privilegios, combinaciones }
      const { permisos: permisosAPI, privilegios, combinaciones } = transformPermisosToAPI(permisos);
      
      console.log('🔄 [Backend] Permisos transformados para la API:', { permisos: permisosAPI, privilegios, combinaciones });
      
      // ✅ Usar combinaciones específicas (método preferido)
      updateData.combinaciones = combinaciones;
      // Mantener arrays para compatibilidad
      updateData.permisos = permisosAPI;
      updateData.privilegios = privilegios;
    }

    // Validar que al menos se esté actualizando algo
    if (Object.keys(updateData).length === 0) {
      throw new Error('Debe proporcionar al menos un campo para actualizar (nombre, estado o permisos)');
    }

    // Actualizar el rol con los datos transformados
    const result = await roleService.updateRoleWithDetails(req.params.id, updateData);
    console.log('✅ [Backend] Rol actualizado en la base de datos:', result.id_rol);
    
    // Transformar el resultado al formato del frontend
    const transformedRole = transformRoleToFrontend(result);
    
    console.log('✅ [Backend] Rol transformado para el frontend:', transformedRole.id);
    
    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
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
    console.log('🗑️ [Backend] Eliminando rol...');
    console.log('📥 [Backend] ID del rol:', req.params.id);
    
    const rol = await Role.findByPk(req.params.id);
    if (!rol) {
      console.log('❌ [Backend] Rol no encontrado:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Rol no encontrado',
        details: { id: req.params.id }
      });
    }

    // ✅ VALIDAR: Prevenir eliminar roles básicos del sistema
    const rolesBasicos = ['cliente', 'administrador', 'empleado'];
    if (rolesBasicos.includes(rol.nombre.toLowerCase())) {
      console.log('❌ [Backend] Intento de eliminar rol básico:', rol.nombre);
      return res.status(400).json({ 
        success: false,
        error: `No se puede eliminar el rol "${rol.nombre}" porque es un rol básico del sistema`,
        detalles: {
          rol: rol.nombre,
          roles_basicos: rolesBasicos,
          mensaje: 'Los roles básicos (cliente, administrador, empleado) no pueden ser eliminados por seguridad del sistema.'
        }
      });
    }

    // ✅ VALIDAR: Verificar si el rol está siendo usado por usuarios
    const { User } = await import('../models/index.js');
    const usuariosConRol = await User.count({
      where: { id_rol: req.params.id }
    });

    if (usuariosConRol > 0) {
      console.log('❌ [Backend] Rol está siendo usado por usuarios:', usuariosConRol);
      return res.status(400).json({ 
        success: false,
        error: `No se puede eliminar el rol "${rol.nombre}" porque está siendo usado por ${usuariosConRol} usuario(s)`,
        detalles: {
          rol: rol.nombre,
          id_rol: req.params.id,
          usuarios_asignados: usuariosConRol,
          mensaje: 'Debes reasignar los usuarios a otro rol antes de eliminar este rol.',
          accion_requerida: 'Reasigna los usuarios a otro rol y luego intenta eliminar este rol nuevamente.'
        }
      });
    }

    // ✅ ELIMINAR: Las relaciones de permisos/privilegios se eliminan automáticamente por ON DELETE CASCADE
    // Pero las eliminamos explícitamente para ser claros
    await RolPermisoPrivilegio.destroy({
      where: { id_rol: req.params.id }
    });

    // ✅ ELIMINAR: El rol (las relaciones ya fueron eliminadas)
    await rol.destroy();

    console.log('✅ [Backend] Rol eliminado correctamente:', rol.nombre);

    res.json({ 
      success: true,
      message: 'Rol eliminado correctamente',
      data: {
        id_rol: req.params.id,
        nombre: rol.nombre
      }
    });
  } catch (error) {
    console.error('❌ [Backend] Error al eliminar rol:', error);
    
    // Manejar error de foreign key constraint (usuarios usando el rol)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        success: false,
        error: 'No se puede eliminar el rol porque está siendo usado por usuarios',
        detalles: {
          mensaje: 'El rol está siendo referenciado por usuarios en el sistema. Debes reasignar los usuarios a otro rol primero.',
          accion_requerida: 'Reasigna los usuarios a otro rol y luego intenta eliminar este rol nuevamente.'
        }
      });
    }

    res.status(400).json({ 
      success: false,
      error: error.message,
      detalles: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
