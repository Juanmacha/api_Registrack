import Empleado from "../models/Empleado.js";
import User from "../models/user.js";
import ExcelJS from "exceljs";

export const getAllEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.findAll({ include: [{ model: User, as: "usuario" }] });
    res.status(200).json(empleados);
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
    const empleados = await Empleado.findAll({ include: [{ model: User, as: "usuario" }] });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Empleados");

    worksheet.columns = [
      { header: "ID Empleado", key: "id_empleado", width: 15 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "ID Usuario", key: "id_usuario", width: 15 },
      { header: "Nombre Usuario", key: "nombre_usuario", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Rol", key: "rol", width: 20 }
    ];

    empleados.forEach(e => {
      worksheet.addRow({
        id_empleado: e.id_empleado,
        estado: e.estado,
        id_usuario: e.usuario?.id_usuario,
        nombre_usuario: e.usuario?.nombre || "N/A",
        email: e.usuario?.email || "N/A",
        rol: e.usuario?.rol || "N/A"
      });
    });

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_empleados.xlsx");

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
