import { Role, Permiso, Privilegio, RolPermisoPrivilegio } from '../models/index.js';

const roleService = {
  // Crear rol con permisos y privilegios
  createRoleWithDetails: async (data) => {
    if (!data.nombre) throw new Error('El nombre del rol es obligatorio');
    if (!Array.isArray(data.permisos) || data.permisos.length === 0) 
      throw new Error('Debe especificar al menos un permiso');
    if (!Array.isArray(data.privilegios) || data.privilegios.length === 0) 
      throw new Error('Debe especificar al menos un privilegio');

    // Crear el rol
    const nuevoRol = await Role.create({ nombre: data.nombre });

    // Crear o buscar permisos
    const permisosCreados = [];
    for (const nombrePermiso of data.permisos) {
      const [permiso] = await Permiso.findOrCreate({ where: { nombre: nombrePermiso } });
      permisosCreados.push(permiso);
    }

    // Crear o buscar privilegios
    const privilegiosCreados = [];
    for (const nombrePrivilegio of data.privilegios) {
      const [privilegio] = await Privilegio.findOrCreate({ where: { nombre: nombrePrivilegio } });
      privilegiosCreados.push(privilegio);
    }

    // Insertar en tabla intermedia
    for (const permiso of permisosCreados) {
      for (const privilegio of privilegiosCreados) {
        await RolPermisoPrivilegio.create({
          id_rol: nuevoRol.id_rol,
          id_permiso: permiso.id_permiso,
          id_privilegio: privilegio.id_privilegio
        });
      }
    }

    // Retornar el rol completo limpio
    const rolCompleto = await Role.findByPk(nuevoRol.id_rol, {
      include: [
        { model: Permiso, as: 'permisos', attributes: ['id_permiso', 'nombre'], through: { attributes: [] } },
        { model: Privilegio, as: 'privilegios', attributes: ['id_privilegio', 'nombre'], through: { attributes: [] } }
      ],
      attributes: ['id_rol', 'nombre', 'estado']
    });

    return rolCompleto;
  },

  // Obtener todos los roles con permisos y privilegios
  getAllRoles: async () => {
    return await Role.findAll({
      include: [
        { model: Permiso, as: 'permisos', attributes: ['id_permiso', 'nombre'], through: { attributes: [] } },
        { model: Privilegio, as: 'privilegios', attributes: ['id_privilegio', 'nombre'], through: { attributes: [] } }
      ],
      attributes: ['id_rol', 'nombre', 'estado']
    });
  },

  // Obtener rol por ID
  getRoleById: async (id) => {
    return await Role.findByPk(id, {
      include: [
        { model: Permiso, as: 'permisos', attributes: ['id_permiso', 'nombre'], through: { attributes: [] } },
        { model: Privilegio, as: 'privilegios', attributes: ['id_privilegio', 'nombre'], through: { attributes: [] } }
      ],
      attributes: ['id_rol', 'nombre', 'estado']
    });
  }
};

export default roleService;
