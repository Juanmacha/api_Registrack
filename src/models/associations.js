import OrdenServicio from "./OrdenServicio.js";
import Servicio from "./Servicio.js";
import Cliente from "./Cliente.js";
import User from "./user.js";
import Empresa from "./Empresa.js";
import Cita from "./citas.js";

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

// Relación OrdenServicio -> Empresa
OrdenServicio.belongsTo(Empresa, {
  foreignKey: 'id_empresa',
  as: 'empresa'
});

// Relación para usuario que anuló la solicitud
OrdenServicio.belongsTo(User, {
  foreignKey: 'anulado_por',
  as: 'usuario_anulo'
});

// Relación Cliente -> User
Cliente.belongsTo(User, {
  foreignKey: 'id_usuario',
  as: 'Usuario'
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

Empresa.hasMany(OrdenServicio, {
  foreignKey: 'id_empresa',
  as: 'ordenes'
});

// ✅ Relación OrdenServicio -> Citas
OrdenServicio.hasMany(Cita, {
  foreignKey: 'id_orden_servicio',
  as: 'citas'
});

// Relación inversa Cita -> OrdenServicio
Cita.belongsTo(OrdenServicio, {
  foreignKey: 'id_orden_servicio',
  as: 'ordenServicio',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

export { OrdenServicio, Servicio, Cliente, User, Empresa, Cita };
