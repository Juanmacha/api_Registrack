import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import OrdenServicio from "./OrdenServicio.js";

const Notificacion = sequelize.define('Notificacion', {
  id_notificacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_orden_servicio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ordenes_de_servicios',
      key: 'id_orden_servicio'
    }
  },
  tipo_notificacion: {
    type: DataTypes.ENUM('asignacion_empleado', 'nueva_solicitud', 'cambio_estado'),
    allowNull: false
  },
  destinatario_email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  asunto: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha_envio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado_envio: {
    type: DataTypes.ENUM('pendiente', 'enviado', 'fallido'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'notificaciones',
  timestamps: false
});

// Relaciones
Notificacion.belongsTo(OrdenServicio, {
  foreignKey: 'id_orden_servicio',
  as: 'orden_servicio'
});

OrdenServicio.hasMany(Notificacion, {
  foreignKey: 'id_orden_servicio',
  as: 'notificaciones'
});

export default Notificacion;
