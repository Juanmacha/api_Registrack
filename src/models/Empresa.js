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
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  pais: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Colombia',
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: "empresas",
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Empresa;
