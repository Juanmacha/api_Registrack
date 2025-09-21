import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Empresa = sequelize.define("Empresa", {
  id_empresa: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nit: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: true,
    validate: {
      min: 1000000000,
      max: 9999999999,
    },
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  tipo_empresa: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: "empresas",
  timestamps: false,
});

export default Empresa;
