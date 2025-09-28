import OrdenServicio from "./OrdenServicio.js";
import Servicio from "./Servicio.js";
import Cliente from "./Cliente.js";
import User from "./User.js";

// Definir relaciones
OrdenServicio.belongsTo(Servicio, {
  foreignKey: 'id_servicio',
  as: 'servicio'
});

OrdenServicio.belongsTo(Cliente, {
  foreignKey: 'id_cliente',
  as: 'cliente'
});

// OrdenServicio.belongsTo(User, {
//   foreignKey: 'id_empleado_asignado',
//   as: 'empleado_asignado'
// });

// Relaciones inversas
Servicio.hasMany(OrdenServicio, {
  foreignKey: 'id_servicio',
  as: 'ordenes'
});

Cliente.hasMany(OrdenServicio, {
  foreignKey: 'id_cliente',
  as: 'ordenes'
});

// User.hasMany(OrdenServicio, {
//   foreignKey: 'id_empleado_asignado',
//   as: 'ordenes_asignadas'
// });

export { OrdenServicio, Servicio, Cliente, User };
