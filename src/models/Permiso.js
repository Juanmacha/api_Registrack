import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Permiso = sequelize.define('Permiso', {
  id_permiso: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING
}, {
  tableName: 'permisos',
  timestamps: false
});

export default Permiso;
