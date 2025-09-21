import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

// Tabla intermedia para relacionar Roles, Permisos y Privilegios
const RolPermisoPrivilegio = sequelize.define('RolPermisoPrivilegio', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_rol: { type: DataTypes.INTEGER, allowNull: false },
  id_permiso: { type: DataTypes.INTEGER, allowNull: false },
  id_privilegio: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'rol_permisos_privilegios',
  timestamps: false
});

export default RolPermisoPrivilegio;