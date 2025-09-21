import User from "./user.js";
import Rol from "./Role.js";
import Permiso from "./Permiso.js";
import Privilegio from "./Privilegio.js";
import RolPermisoPrivilegio from "./rol_permiso_privilegio.js";

// Definir asociaciones después de crear los modelos
Rol.hasMany(User, { foreignKey: "id_rol", as: "usuarios" });
User.belongsTo(Rol, { foreignKey: "id_rol", as: "rol" });

// Asociaciones Role <-> Permiso mediante tabla intermedia
Rol.belongsToMany(Permiso, {
  through: RolPermisoPrivilegio,
  foreignKey: "id_rol",
  otherKey: "id_permiso",
  as: "permisos",
});
Permiso.belongsToMany(Rol, {
  through: RolPermisoPrivilegio,
  foreignKey: "id_permiso",
  otherKey: "id_rol",
  as: "roles",
});

// Asociaciones Role <-> Privilegio mediante la misma tabla intermedia
Rol.belongsToMany(Privilegio, {
  through: RolPermisoPrivilegio,
  foreignKey: "id_rol",
  otherKey: "id_privilegio",
  as: "privilegios",
});
Privilegio.belongsToMany(Rol, {
  through: RolPermisoPrivilegio,
  foreignKey: "id_privilegio",
  otherKey: "id_rol",
  as: "roles",
});

export { User, Rol };
