// Centraliza exports de modelos y asociaciones
export { User, Rol } from "./user_rol.js";
// Alias para compatibilidad: exportar como 'Role' (inglés)
export { Rol as Role } from "./user_rol.js";
// Exportar modelos de permisos, privilegios y tabla intermedia
export { default as Permiso } from "./Permiso.js";
export { default as Privilegio } from "./Privilegio.js";
export { default as RolPermisoPrivilegio } from "./rol_permiso_privilegio.js";
