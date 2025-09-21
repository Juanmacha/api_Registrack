import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import OrdenServicio from "./OrdenServicio.js";
import User from "./user.js";

const Seguimiento = sequelize.define(
  "Seguimiento",
  {
    id_seguimiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_orden_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documentos_adjuntos: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    registrado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "seguimientos",
    timestamps: false,
  }
);

// Relación Seguimiento -> OrdenServicio
Seguimiento.belongsTo(OrdenServicio, {
  foreignKey: "id_orden_servicio",
  as: "orden_servicio",
});
OrdenServicio.hasMany(Seguimiento, {
  foreignKey: "id_orden_servicio",
  as: "seguimientos",
});

// Relación Seguimiento -> Usuario (quien registró)
Seguimiento.belongsTo(User, {
  foreignKey: "registrado_por",
  as: "usuario_registro",
});
User.hasMany(Seguimiento, {
  foreignKey: "registrado_por",
  as: "seguimientos_registrados",
});

export default Seguimiento;
