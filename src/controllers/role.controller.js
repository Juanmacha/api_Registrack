import { Role, Permiso, Privilegio, RolPermisoPrivilegio } from '../models/index.js';
import roleService from '../services/role.service.js';

// Crear un rol con permisos y privilegios
export const createRole = async (req, res) => {
  try {
    const result = await roleService.createRoleWithDetails(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los roles con permisos y privilegios
export const getRoles = async (req, res) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener rol' });
  }
};

// Actualizar un rol (nombre y estado)
export const updateRole = async (req, res) => {
  try {
    const result = await roleService.updateRole(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Cambiar estado de un rol
export const changeRoleState = async (req, res) => {
  try {
    const { estado } = req.body;
    if (typeof estado !== 'boolean') throw new Error('El estado debe ser true o false');

    const rol = await Role.findByPk(req.params.id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    rol.estado = estado;
    await rol.save();

    res.json(rol);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Eliminar un rol
export const deleteRole = async (req, res) => {
  try {
    const rol = await Role.findByPk(req.params.id);
    if (!rol) return res.status(404).json({ error: 'Rol no encontrado' });

    await rol.destroy();
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};
