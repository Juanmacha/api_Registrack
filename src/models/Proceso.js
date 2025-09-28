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
    servicio_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicios',
        key: 'id_servicio'
      }
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
    order_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "procesos",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default Proceso;

