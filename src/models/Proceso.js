import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

const Proceso = sequelize.define(
  "Proceso",
  {
    id_proceso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: {
          args: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/,
          msg: "El nombre solo puede contener letras y espacios",
        },
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "procesos",
    timestamps: false,
  }
);

export default Proceso;

