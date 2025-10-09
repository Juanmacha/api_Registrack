import OrdenServicio from "./OrdenServicio.js";
import Servicio from "./Servicio.js";
import Cliente from "./Cliente.js";
import User from "./user.js";

// Definir relaciones
OrdenServicio.belongsTo(Servicio, {
  foreignKey: 'id_servicio',
  as: 'servicio'
});

OrdenServicio.belongsTo(Cliente, {
  foreignKey: 'id_cliente',
  as: 'cliente'
});

OrdenServicio.belongsTo(User, {
  foreignKey: 'id_empleado_asignado',
  as: 'empleado_asignado'
});

// Relación Cliente -> User
Cliente.belongsTo(User, {
  foreignKey: 'id_usuario',
  as: 'usuario'
});

User.hasOne(Cliente, {
  foreignKey: 'id_usuario',
  as: 'cliente'
});

// Relaciones inversas
Servicio.hasMany(OrdenServicio, {
  foreignKey: 'id_servicio',
  as: 'ordenes'
});

Cliente.hasMany(OrdenServicio, {
  foreignKey: 'id_cliente',
  as: 'ordenes'
});

User.hasMany(OrdenServicio, {
  foreignKey: 'id_empleado_asignado',
  as: 'ordenes_asignadas'
});

export { OrdenServicio, Servicio, Cliente, User };
