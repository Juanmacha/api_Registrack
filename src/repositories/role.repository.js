import Role from '../models/Role.js';
import Permiso from '../models/Permiso.js';
import Privilegio from '../models/Privilegio.js';

const roleRepository = {
  getAllRoles: async () => {
    return Role.findAll({
      include: [
        { model: Permiso, as: 'permisos' },
        { model: Privilegio, as: 'privilegios' }
      ]
    });
  },

  getRoleById: async (id) => {
    return Role.findByPk(id, {
      include: [
        { model: Permiso, as: 'permisos' },
        { model: Privilegio, as: 'privilegios' }
      ]
    });
  }
};

export default roleRepository;
