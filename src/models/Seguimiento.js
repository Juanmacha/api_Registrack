import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import OrdenServicio from "./OrdenServicio.js";
import User from "./user.js";

const Seguimiento = sequelize.define(
  "Seguimiento",
  {
    id_seguimiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_orden_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    documentos_adjuntos: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_registro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    registrado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // 🚀 NUEVOS CAMPOS: Para manejo de estados
    nuevo_estado: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado_anterior: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    // Campo para observaciones/comentarios
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "seguimientos",
    timestamps: false,
  }
);

// Nota: Las asociaciones se definen en el archivo que importa este modelo
// para evitar dependencias circulares y duplicados

export default Seguimiento;
