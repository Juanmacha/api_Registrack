import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Cliente from "./Cliente.js";
import Empresa from "./Empresa.js";

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

// Relaciones Many-to-Many
Cliente.belongsToMany(Empresa, {
  through: EmpresaCliente,
  foreignKey: "id_cliente",
  otherKey: "id_empresa",
  as: 'Empresas'
});

Empresa.belongsToMany(Cliente, {
  through: EmpresaCliente,
  foreignKey: "id_empresa",
  otherKey: "id_cliente",
  as: 'Clientes'
});

export default EmpresaCliente;
