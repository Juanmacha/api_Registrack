import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Servicio from "./Servicio.js";

const OrdenServicio = sequelize.define(
  "OrdenServicio",
  {
    id_orden_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero_expediente: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    total_estimado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    pais: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    ciudad: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    codigo_postal: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // Campos editables para "¿Quién solicita el servicio?"
    tipodepersona: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    tipodedocumento: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    numerodedocumento: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    nombrecompleto: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    correoelectronico: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Campos editables para información de la empresa
    tipodeentidadrazonsocial: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nombredelaempresa: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    nit: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Campos editables para documentos de poder
    poderdelrepresentanteautorizado: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    poderparaelregistrodelamarca: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ordenes_de_servicios",
    timestamps: false,
  }
);

export default OrdenServicio;
