import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";


const Cita = sequelize.define("Cita", {
  id_cita: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING(30),
    allowNull: false,
    validate: {
      isIn: [['General', 'Busqueda', 'Ampliacion', 'Certificacion', 'Renovacion', 'Cesion', 'Oposicion', 'Respuesta de oposicion']]
    }
  },
  modalidad: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      isIn: [['Virtual', 'Presencial']]
    }
  },
  estado: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Programada',
    validate: {
      isIn: [['Programada', 'Reprogramada', 'Anulada']]
    }
  },
  observacion: {
    type: DataTypes.STRING(200),
    allowNull: true
  }
}, {
  tableName: "citas",
  timestamps: false
});

Cita.belongsTo(User, {
    foreignKey: 'id_cliente',
    as: 'Cliente',
    onDelete: 'CASCADE'
});

Cita.belongsTo(User, {
    foreignKey: 'id_empleado',
    as: 'Empleado',
    onDelete: 'CASCADE'
});



export default Cita;