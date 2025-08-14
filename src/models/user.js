import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tipo_documento: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El tipo de documento es obligatorio' }
    }
  },
  documento: {
    type: DataTypes.BIGINT,
    allowNull: false,
    unique: { msg: 'El documento ya está registrado' },
    validate: {
      isInt: { msg: 'El documento debe ser numérico' },
      min: { args: [100000], msg: 'El documento debe tener al menos 10 dígitos' },
      max: { args: [9999999999], msg: 'El documento no puede tener más de 10 dígitos' }
    }
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es obligatorio' },
      is: {
        args: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/i,
        msg: 'El nombre solo puede contener letras y espacios'
      }
    }
  },
  apellido: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El apellido es obligatorio' },
      is: {
        args: /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/i,
        msg: 'El apellido solo puede contener letras y espacios'
      }
    }
  },
  correo: {
    type: DataTypes.STRING(225),
    allowNull: false,
    unique: { msg: 'El correo ya está registrado' },
    validate: {
      notEmpty: { msg: 'El correo es obligatorio' },
      isEmail: { msg: 'El formato del correo no es válido' }
    }
  },
  contrasena: {
    type: DataTypes.STRING(225),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La contraseña es obligatoria' },
      len: {
        args: [8, 255],
        msg: 'La contraseña debe tener al menos 8 caracteres'
      },
      isStrongPassword(value) {
        const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&()_\-+=[\]{};:'"\\|,.<>\/?]).{8,}$/;
        if (!regex.test(value)) {
          throw new Error('La contraseña debe contener al menos una mayúscula, un número y un carácter especial');
        }
      }
    }
  },
  id_rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isInt: { msg: 'El rol debe ser un número entero' }
    }
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

export default User;
