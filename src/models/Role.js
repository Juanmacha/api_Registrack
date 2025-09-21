import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Rol = sequelize.define("Rol", {
  id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
}, {
  tableName: "roles",
  timestamps: false
});


export default Rol;
