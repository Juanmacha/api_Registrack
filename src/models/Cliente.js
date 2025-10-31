import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Cliente = sequelize.define("Cliente", {
  id_cliente: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  marca: {
    type: DataTypes.STRING(50),
  },
  tipo_persona: {
    type: DataTypes.ENUM("Natural", "Jurídica"),
    allowNull: false,
  },
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  origen: {
    type: DataTypes.ENUM("solicitud", "directo", "importado"),
    allowNull: false,
    defaultValue: "directo",
  },
}, {
  tableName: "clientes",
  timestamps: false,
});

// Asociaciones definidas en associations.js para evitar duplicados

export default Cliente;
