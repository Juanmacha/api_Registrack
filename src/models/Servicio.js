import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import OrdenServicio from "./OrdenServicio.js";

const Servicio = sequelize.define(
  "Servicio",
  {
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
    precio_base: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: "El precio base debe ser mayor a 0",
        },
      },
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "servicios",
    timestamps: false,
  }
);


export default Servicio;