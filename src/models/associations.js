import OrdenServicio from "./OrdenServicio.js";
import Servicio from "./Servicio.js";
import Cliente from "./Cliente.js";
import User from "./user.js";
import Empresa from "./Empresa.js";
import Cita from "./citas.js";
import EmpresaCliente from "./EmpresaCliente.js";
import Seguimiento from "./Seguimiento.js";

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

// Relaciones Many-to-Many: Cliente <-> Empresa
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

// Relaciones Seguimiento
Seguimiento.belongsTo(OrdenServicio, {
  foreignKey: 'id_orden_servicio',
  as: 'orden_servicio'
});

Seguimiento.belongsTo(User, {
  foreignKey: 'registrado_por',
  as: 'usuario_registro'
});

OrdenServicio.hasMany(Seguimiento, {
  foreignKey: 'id_orden_servicio',
  as: 'seguimientos'
});

User.hasMany(Seguimiento, {
  foreignKey: 'registrado_por',
  as: 'seguimientos_registrados'
});

export { OrdenServicio, Servicio, Cliente, User, Empresa, Cita, EmpresaCliente, Seguimiento };
