import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";
import OrdenServicio from "./OrdenServicio.js";
import Proceso from "./Proceso.js";

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
    descripcion_corta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    visible_en_landing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    landing_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    info_page_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    route_path: {
      type: DataTypes.STRING(255),
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
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Configurar asociaciones
// Un servicio tiene muchos procesos (process_states)
Servicio.hasMany(Proceso, {
  foreignKey: 'servicio_id',
  as: 'process_states'
});

// Un proceso pertenece a un servicio
Proceso.belongsTo(Servicio, {
  foreignKey: 'servicio_id',
  as: 'servicio'
});

export default Servicio;