import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import TipoArchivo from "./TipoArchivo.js";
import Cliente from "./Cliente.js";
import OrdenServicio from "./OrdenServicio.js";

const Archivo = sequelize.define(
  "Archivo",
  {
    id_archivo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    url_archivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    fecha_subida: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    id_tipo_archivo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_orden_servicio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "archivos",
    timestamps: false,
  }
);

Archivo.belongsTo(TipoArchivo, { foreignKey: "id_tipo_archivo", as: "tipo" });
Archivo.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
Archivo.belongsTo(OrdenServicio, { foreignKey: "id_orden_servicio", as: "orden" });

export default Archivo;


