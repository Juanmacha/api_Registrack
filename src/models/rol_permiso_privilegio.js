import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Tabla intermedia para relacionar Roles, Permisos y Privilegios
const RolPermisoPrivilegio = sequelize.define('RolPermisoPrivilegio', {
  id_rol: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    primaryKey: true,
    field: 'id_rol'
  },
  id_permiso: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    primaryKey: true,
    field: 'id_permiso'
  },
  id_privilegio: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    primaryKey: true,
    field: 'id_privilegio'
  }
}, {
  tableName: 'rol_permisos_privilegios',
  timestamps: false,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['id_rol', 'id_permiso', 'id_privilegio']
    }
  ]
});

export default RolPermisoPrivilegio;