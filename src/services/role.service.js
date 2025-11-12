import { Role, Permiso, Privilegio, RolPermisoPrivilegio } from '../models/index.js';

const roleService = {
  // Crear rol con permisos y privilegios
  createRoleWithDetails: async (data) => {
    if (!data.nombre) throw new Error('El nombre del rol es obligatorio');
    
    // ✅ Validar que haya combinaciones o permisos/privilegios
    if (!data.combinaciones && (!data.permisos || !data.privilegios || data.permisos.length === 0 || data.privilegios.length === 0)) {
      throw new Error('Debe especificar al menos una combinación de permiso y privilegio');
    }

    // Crear el rol
    const nuevoRol = await Role.create({ nombre: data.nombre });

    // ✅ Usar combinaciones específicas si están disponibles (método preferido)
    if (data.combinaciones && Array.isArray(data.combinaciones) && data.combinaciones.length > 0) {
      // Crear relaciones específicas usando combinaciones
      for (const comb of data.combinaciones) {
        const permiso = await Permiso.findOne({ where: { nombre: comb.permiso } });
        if (!permiso) {
          throw new Error(`Permiso "${comb.permiso}" no encontrado en la base de datos`);
        }

        const privilegio = await Privilegio.findOne({ where: { nombre: comb.privilegio } });
        if (!privilegio) {
          throw new Error(`Privilegio "${comb.privilegio}" no encontrado en la base de datos`);
        }

        await RolPermisoPrivilegio.create({
          id_rol: nuevoRol.id_rol,
          id_permiso: permiso.id_permiso,
          id_privilegio: privilegio.id_privilegio
        });
      }
    } else {
      // ✅ Fallback: Usar arrays de permisos y privilegios (crear todas las combinaciones)
      // Crear o buscar permisos
      const permisosCreados = [];
      for (const nombrePermiso of data.permisos) {
        const permiso = await Permiso.findOne({ where: { nombre: nombrePermiso } });
        if (!permiso) {
          throw new Error(`Permiso "${nombrePermiso}" no encontrado en la base de datos`);
        }
        permisosCreados.push(permiso);
      }

      // Crear o buscar privilegios
      const privilegiosCreados = [];
      for (const nombrePrivilegio of data.privilegios) {
        const privilegio = await Privilegio.findOne({ where: { nombre: nombrePrivilegio } });
        if (!privilegio) {
          throw new Error(`Privilegio "${nombrePrivilegio}" no encontrado en la base de datos`);
        }
        privilegiosCreados.push(privilegio);
      }

      // Insertar en tabla intermedia (todas las combinaciones)
      for (const permiso of permisosCreados) {
        for (const privilegio of privilegiosCreados) {
          await RolPermisoPrivilegio.create({
            id_rol: nuevoRol.id_rol,
            id_permiso: permiso.id_permiso,
            id_privilegio: privilegio.id_privilegio
          });
        }
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
      // ✅ data.permisos y data.privilegios vienen del controlador después de transformPermisosToAPI
      // data.combinaciones contiene las combinaciones específicas (permiso + privilegio)
      if (data.permisos !== undefined || data.privilegios !== undefined || data.combinaciones !== undefined) {
        // ✅ ELIMINAR: Todas las relaciones existentes
        await RolPermisoPrivilegio.destroy({ 
          where: { id_rol: id },
          transaction 
        });

        // ✅ CREAR: Nuevas relaciones específicas usando combinaciones
        // Si hay combinaciones específicas, usarlas (más preciso)
        // Si no, usar arrays de permisos y privilegios (compatibilidad)
        if (data.combinaciones && Array.isArray(data.combinaciones) && data.combinaciones.length > 0) {
          // ✅ Usar combinaciones específicas (método preferido)
          const relaciones = [];
          
          for (const comb of data.combinaciones) {
            const permiso = await Permiso.findOne({ 
              where: { nombre: comb.permiso },
              transaction
            });
            if (!permiso) {
              await transaction.rollback();
              throw new Error(`Permiso "${comb.permiso}" no encontrado en la base de datos`);
            }

            const privilegio = await Privilegio.findOne({ 
              where: { nombre: comb.privilegio },
              transaction
            });
            if (!privilegio) {
              await transaction.rollback();
              throw new Error(`Privilegio "${comb.privilegio}" no encontrado en la base de datos`);
            }

            relaciones.push({
              id_rol: id,
              id_permiso: permiso.id_permiso,
              id_privilegio: privilegio.id_privilegio
            });
          }

          if (relaciones.length > 0) {
            await RolPermisoPrivilegio.bulkCreate(relaciones, { transaction });
          }
        } else if (data.permisos && data.privilegios && Array.isArray(data.permisos) && Array.isArray(data.privilegios)) {
          // ✅ Fallback: Usar arrays de permisos y privilegios (crear todas las combinaciones)
          // NOTA: Esto crea TODAS las combinaciones posibles entre permisos y privilegios
          // Se usa solo si no hay combinaciones específicas (compatibilidad hacia atrás)
          const permisosArray = data.permisos || [];
          const privilegiosArray = data.privilegios || [];

          if (permisosArray.length > 0 && privilegiosArray.length > 0) {
            const permisosCreados = [];
            for (const nombrePermiso of permisosArray) {
              const permiso = await Permiso.findOne({ 
                where: { nombre: nombrePermiso },
                transaction
              });
              if (!permiso) {
                await transaction.rollback();
                throw new Error(`Permiso "${nombrePermiso}" no encontrado en la base de datos`);
              }
              permisosCreados.push(permiso);
            }

            const privilegiosCreados = [];
            for (const nombrePrivilegio of privilegiosArray) {
              const privilegio = await Privilegio.findOne({ 
                where: { nombre: nombrePrivilegio },
                transaction
              });
              if (!privilegio) {
                await transaction.rollback();
                throw new Error(`Privilegio "${nombrePrivilegio}" no encontrado en la base de datos`);
              }
              privilegiosCreados.push(privilegio);
            }

            // Crear todas las combinaciones posibles
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
        }
        // ✅ Si no hay combinaciones ni arrays, no se crean relaciones (rol sin permisos)
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
