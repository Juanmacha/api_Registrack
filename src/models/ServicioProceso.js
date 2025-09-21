import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Servicio from "./Servicio.js";
import Proceso from "./Proceso.js";

const ServicioProceso = sequelize.define(
  "ServicioProceso",
  {
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    id_proceso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "servicio_procesos",
    timestamps: false,
  }
);

Servicio.belongsToMany(Proceso, { through: ServicioProceso, foreignKey: "id_servicio", otherKey: "id_proceso", as: "procesos" });
Proceso.belongsToMany(Servicio, { through: ServicioProceso, foreignKey: "id_proceso", otherKey: "id_servicio", as: "servicios" });

export default ServicioProceso;


