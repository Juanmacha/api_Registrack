import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const EmpresaCliente = sequelize.define("EmpresaCliente", {
  id_empresa_cliente: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
}, {
  tableName: "empresa_clientes",
  timestamps: false,
});

// Asociaciones definidas en associations.js para evitar duplicados

export default EmpresaCliente;
