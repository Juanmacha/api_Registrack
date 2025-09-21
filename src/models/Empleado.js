// src/models/Empleado.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Empleado = sequelize.define("Empleado", {
  id_empleado: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: "id_usuario"
    }
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: "empleados",
  timestamps: false
});

// Asociaciones
Empleado.belongsTo(User, { foreignKey: "id_usuario", as: "usuario" });


export default Empleado;
