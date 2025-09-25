import Empleado from "../models/Empleado.js";
import User from "../models/user.js";
import Rol from "../models/Role.js";
import ExcelJS from "exceljs";

export const getAllEmpleados = async (req, res) => {
  try {
    // Obtener usuarios con rol administrador (id_rol = 1) o empleado (id_rol = 2)
    const usuarios = await User.findAll({
      where: {
        id_rol: [1, 2] // 1 = administrador, 2 = empleado
      },
      include: [
        {
          model: Rol,
          as: "rol"
        }
      ]
    });

    // Obtener empleados existentes en la tabla empleados
    const empleados = await Empleado.findAll({ 
      include: [{ model: User, as: "usuario" }] 
    });

    // Crear un mapa de empleados existentes por id_usuario
    const empleadosMap = new Map();
    empleados.forEach(emp => {
      empleadosMap.set(emp.id_usuario, emp);
    });

    // Combinar usuarios con información de empleados
    const resultado = usuarios.map(usuario => {
      const empleadoInfo = empleadosMap.get(usuario.id_usuario);
      
      return {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol?.nombre || 'Sin rol',
        id_rol: usuario.id_rol,
        estado_usuario: usuario.estado,
        // Información del empleado si existe
        id_empleado: empleadoInfo?.id_empleado || null,
        estado_empleado: empleadoInfo?.estado || null,
        es_empleado_registrado: !!empleadoInfo
      };
    });

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los empleados.", error: error.message });
  }
};

export const getEmpleadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const empleado = await Empleado.findByPk(id, { include: [{ model: User, as: "usuario" }] });
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }
    res.status(200).json(empleado);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el empleado.", error: error.message });
  }
};

export const createEmpleado = async (req, res) => {
  const { id_usuario, estado } = req.body;
  try {
    const newEmpleado = await Empleado.create({ id_usuario, estado });
    res.status(201).json(newEmpleado);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el empleado.", error: error.message });
  }
};

export const updateEmpleado = async (req, res) => {
  const { id } = req.params;
  const { id_usuario, estado } = req.body;
  try {
    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }
    empleado.id_usuario = id_usuario !== undefined ? id_usuario : empleado.id_usuario;
    empleado.estado = estado !== undefined ? estado : empleado.estado;
    await empleado.save();
    res.status(200).json(empleado);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el empleado.", error: error.message });
  }
};

export const changeEmpleadoState = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }
    empleado.estado = estado;
    await empleado.save();
    res.status(200).json(empleado);
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar el estado del empleado.", error: error.message });
  }
};

export const deleteEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Empleado.destroy({ where: { id_empleado: id } });
    if (!deleted) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }
    res.status(200).json({ message: "Empleado eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el empleado.", error: error.message });
  }
};

// Nuevo: Reporte en Excel de empleados
export const descargarReporteEmpleados = async (req, res) => {
  try {
    // Obtener usuarios con rol administrador (id_rol = 1) o empleado (id_rol = 2)
    const usuarios = await User.findAll({
      where: {
        id_rol: [1, 2] // 1 = administrador, 2 = empleado
      },
      include: [
        {
          model: Rol,
          as: "rol"
        }
      ]
    });

    // Obtener empleados existentes en la tabla empleados
    const empleados = await Empleado.findAll({ 
      include: [{ model: User, as: "usuario" }] 
    });

    // Crear un mapa de empleados existentes por id_usuario
    const empleadosMap = new Map();
    empleados.forEach(emp => {
      empleadosMap.set(emp.id_usuario, emp);
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Empleados y Administradores");

    worksheet.columns = [
      { header: "ID Usuario", key: "id_usuario", width: 15 },
      { header: "Nombre", key: "nombre", width: 20 },
      { header: "Apellido", key: "apellido", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Rol", key: "rol", width: 20 },
      { header: "Estado Usuario", key: "estado_usuario", width: 15 },
      { header: "ID Empleado", key: "id_empleado", width: 15 },
      { header: "Estado Empleado", key: "estado_empleado", width: 15 },
      { header: "Es Empleado Registrado", key: "es_empleado_registrado", width: 25 }
    ];

    usuarios.forEach(usuario => {
      const empleadoInfo = empleadosMap.get(usuario.id_usuario);
      
      worksheet.addRow({
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.correo,
        rol: usuario.rol?.nombre || 'Sin rol',
        estado_usuario: usuario.estado ? 'Activo' : 'Inactivo',
        id_empleado: empleadoInfo?.id_empleado || 'N/A',
        estado_empleado: empleadoInfo?.estado ? 'Activo' : (empleadoInfo?.estado === false ? 'Inactivo' : 'N/A'),
        es_empleado_registrado: empleadoInfo ? 'Sí' : 'No'
      });
    });

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_empleados_y_administradores.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Error al generar el reporte de empleados.", error: error.message });
  }
};

export default {
  getAllEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  changeEmpleadoState,
  deleteEmpleado,
  descargarReporteEmpleados
};
