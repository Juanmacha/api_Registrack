import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import DetalleOrdenServicio from "./DetalleOrdenServicio.js";
import Proceso from "./Proceso.js";
import Servicio from "./Servicio.js";

const DetalleServicioOrdenProceso = sequelize.define(
  "DetalleServicioOrdenProceso",
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_proceso: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_detalle_orden: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    monto_a_pagar: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  },
  {
    tableName: "detalle_servicios_orden_procesos",
    timestamps: false,
  }
);

DetalleServicioOrdenProceso.belongsTo(DetalleOrdenServicio, { foreignKey: "id_detalle_orden", as: "detalleOrden" });
DetalleServicioOrdenProceso.belongsTo(Proceso, { foreignKey: "id_proceso", as: "proceso" });
DetalleServicioOrdenProceso.belongsTo(Servicio, { foreignKey: "id_servicio", as: "servicio" });

export default DetalleServicioOrdenProceso;


