import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Privilegio = sequelize.define('Privilegio', {
  id_privilegio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING
}, {
  tableName: 'privilegios',
  timestamps: false
});

export default Privilegio;
