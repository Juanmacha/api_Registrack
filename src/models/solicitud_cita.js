import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const SolicitudCita = sequelize.define("SolicitudCita", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_solicitada: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_solicitada: {
    type: DataTypes.TIME,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
        isIn: [['General','Busqueda','Ampliacion','Certificacion','Renovacion','Cesion','Oposicion','Respuesta de oposicion']]
    }
  },
  modalidad: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      isIn: [['Virtual', 'Presencial']]
    }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pendiente',
    validate: {
      isIn: [['Pendiente', 'Aprobada', 'Rechazada']]
    }
  },
  observacion_admin: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "solicitudes_citas",
  timestamps: true // Para saber cuándo se creó y actualizó
});

// Relaciones
SolicitudCita.belongsTo(User, {
  foreignKey: 'id_cliente',
  as: 'cliente'
});

SolicitudCita.belongsTo(User, {
  foreignKey: 'id_empleado_asignado',
  as: 'empleadoAsignado',
  allowNull: true
});

export default SolicitudCita;
