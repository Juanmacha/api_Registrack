import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import OrdenServicio from "./OrdenServicio.js";
import Servicio from "./Servicio.js";

const DetalleOrdenServicio = sequelize.define(
  "DetalleOrdenServicio",
  {
    id_detalle_orden: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_orden_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("Pendiente", "En Proceso", "Finalizado", "Anulado"),
      allowNull: false,
      defaultValue: "Pendiente",
    },
    fecha_estado: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "detalles_ordenes_servicio",
    timestamps: false,
  }
);

DetalleOrdenServicio.belongsTo(OrdenServicio, { foreignKey: "id_orden_servicio", as: "orden" });
DetalleOrdenServicio.belongsTo(Servicio, { foreignKey: "id_servicio", as: "servicio" });

export default DetalleOrdenServicio;


