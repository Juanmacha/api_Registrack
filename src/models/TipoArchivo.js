import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TipoArchivo = sequelize.define(
  "TipoArchivo",
  {
    id_tipo_archivo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "tipo_archivos",
    timestamps: false,
  }
);

export default TipoArchivo;


