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
  },

  // Actualizar rol con permisos y privilegios
  updateRoleWithDetails: async (id, data) => {
    const sequelize = Role.sequelize;
    const transaction = await sequelize.transaction();

    try {
      // Buscar el rol existente
      const rolExistente = await Role.findByPk(id, { transaction });
      if (!rolExistente) {
        await transaction.rollback();
        throw new Error('Rol no encontrado');
      }

      // Actualizar nombre si se proporciona
      if (data.nombre !== undefined) {
        rolExistente.nombre = data.nombre;
      }

      // Actualizar estado si se proporciona
      if (data.estado !== undefined) {
        rolExistente.estado = data.estado;
      }

      await rolExistente.save({ transaction });

      // Si se proporcionan permisos, actualizar las relaciones
      if (data.permisos !== undefined || data.privilegios !== undefined) {
        // Validar que sean arrays (pueden estar vacíos para quitar todos los permisos)
        if (data.permisos !== undefined && !Array.isArray(data.permisos)) {
          await transaction.rollback();
          throw new Error('Los permisos deben ser un array');
        }
        if (data.privilegios !== undefined && !Array.isArray(data.privilegios)) {
          await transaction.rollback();
          throw new Error('Los privilegios deben ser un array');
        }

        // Usar arrays proporcionados o vacíos por defecto
        const permisosArray = data.permisos || [];
        const privilegiosArray = data.privilegios || [];

        // Eliminar todas las relaciones existentes
        await RolPermisoPrivilegio.destroy({ 
          where: { id_rol: id },
          transaction 
        });

        // Si hay permisos y privilegios, crear nuevas relaciones
        if (permisosArray.length > 0 && privilegiosArray.length > 0) {
          // Crear o buscar permisos
          const permisosCreados = [];
          for (const nombrePermiso of permisosArray) {
            const [permiso] = await Permiso.findOrCreate({ 
              where: { nombre: nombrePermiso },
              transaction
            });
            permisosCreados.push(permiso);
          }

          // Crear o buscar privilegios
          const privilegiosCreados = [];
          for (const nombrePrivilegio of privilegiosArray) {
            const [privilegio] = await Privilegio.findOrCreate({ 
              where: { nombre: nombrePrivilegio },
              transaction
            });
            privilegiosCreados.push(privilegio);
          }

          // Crear nuevas relaciones
          const relaciones = [];
          for (const permiso of permisosCreados) {
            for (const privilegio of privilegiosCreados) {
              relaciones.push({
                id_rol: id,
                id_permiso: permiso.id_permiso,
                id_privilegio: privilegio.id_privilegio
              });
            }
          }

          if (relaciones.length > 0) {
            await RolPermisoPrivilegio.bulkCreate(relaciones, { transaction });
          }
        }
        // Si los arrays están vacíos, simplemente no se crean relaciones (rol sin permisos)
      }

      await transaction.commit();

      // Retornar el rol actualizado con todas sus relaciones
      return await Role.findByPk(id, {
        include: [
          { model: Permiso, as: 'permisos', attributes: ['id_permiso', 'nombre'], through: { attributes: [] } },
          { model: Privilegio, as: 'privilegios', attributes: ['id_privilegio', 'nombre'], through: { attributes: [] } }
        ],
        attributes: ['id_rol', 'nombre', 'estado']
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

export default roleService;
