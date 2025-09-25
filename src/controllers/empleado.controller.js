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

    // Crear registros de empleados faltantes y obtener información actualizada
    const resultado = [];
    
    for (const usuario of usuarios) {
      let empleadoInfo = empleadosMap.get(usuario.id_usuario);
      
      // Si no existe registro en la tabla empleados, crearlo automáticamente
      if (!empleadoInfo) {
        try {
          const nuevoEmpleado = await Empleado.create({
            id_usuario: usuario.id_usuario,
            estado: true // Estado activo por defecto
          });
          
          // Actualizar el mapa con el nuevo empleado
          empleadosMap.set(usuario.id_usuario, nuevoEmpleado);
          empleadoInfo = nuevoEmpleado;
          
          console.log(`✅ Empleado creado automáticamente para usuario ${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id_usuario})`);
        } catch (createError) {
          console.error(`❌ Error al crear empleado para usuario ${usuario.id_usuario}:`, createError.message);
          // Continuar con el usuario aunque no se haya podido crear el empleado
        }
      }
      
      resultado.push({
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol?.nombre || 'Sin rol',
        id_rol: usuario.id_rol,
        estado_usuario: usuario.estado,
        // Información del empleado (ahora siempre debería existir)
        id_empleado: empleadoInfo?.id_empleado || null,
        estado_empleado: empleadoInfo?.estado || null,
        es_empleado_registrado: !!empleadoInfo
      });
    }

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los empleados.", error: error.message });
  }
};

export const getEmpleadoById = async (req, res) => {
  const { id } = req.params;
  try {
    const empleado = await Empleado.findByPk(id, { 
      include: [
        { 
          model: User, 
          as: "usuario",
          include: [
            {
              model: Rol,
              as: "rol"
            }
          ]
        }
      ] 
    });
    
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    // Formatear respuesta similar al getAllEmpleados
    const resultado = {
      id_usuario: empleado.usuario?.id_usuario,
      nombre: empleado.usuario?.nombre,
      apellido: empleado.usuario?.apellido,
      correo: empleado.usuario?.correo,
      rol: empleado.usuario?.rol?.nombre || 'Sin rol',
      id_rol: empleado.usuario?.id_rol,
      estado_usuario: empleado.usuario?.estado,
      id_empleado: empleado.id_empleado,
      estado_empleado: empleado.estado,
      es_empleado_registrado: true
    };

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el empleado.", error: error.message });
  }
};

export const createEmpleado = async (req, res) => {
  const { id_usuario, estado } = req.body;
  try {
    // Verificar que el usuario existe y tiene rol admin o empleado
    const usuario = await User.findByPk(id_usuario, {
      include: [
        {
          model: Rol,
          as: "rol"
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (![1, 2].includes(usuario.id_rol)) {
      return res.status(400).json({ message: "El usuario debe tener rol administrador o empleado." });
    }

    // Verificar si ya existe un empleado para este usuario
    const empleadoExistente = await Empleado.findOne({ where: { id_usuario } });
    if (empleadoExistente) {
      return res.status(400).json({ message: "Ya existe un empleado para este usuario." });
    }

    const newEmpleado = await Empleado.create({ 
      id_usuario, 
      estado: estado !== undefined ? estado : true 
    });

    // Formatear respuesta similar al getAllEmpleados
    const resultado = {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      rol: usuario.rol?.nombre || 'Sin rol',
      id_rol: usuario.id_rol,
      estado_usuario: usuario.estado,
      id_empleado: newEmpleado.id_empleado,
      estado_empleado: newEmpleado.estado,
      es_empleado_registrado: true
    };

    res.status(201).json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al crear el empleado.", error: error.message });
  }
};

export const updateEmpleado = async (req, res) => {
  const { id } = req.params;
  const { id_usuario, estado } = req.body;
  try {
    const empleado = await Empleado.findByPk(id, {
      include: [
        { 
          model: User, 
          as: "usuario",
          include: [
            {
              model: Rol,
              as: "rol"
            }
          ]
        }
      ]
    });
    
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    // Actualizar campos
    empleado.id_usuario = id_usuario !== undefined ? id_usuario : empleado.id_usuario;
    empleado.estado = estado !== undefined ? estado : empleado.estado;
    await empleado.save();

    // Formatear respuesta similar al getAllEmpleados
    const resultado = {
      id_usuario: empleado.usuario?.id_usuario,
      nombre: empleado.usuario?.nombre,
      apellido: empleado.usuario?.apellido,
      correo: empleado.usuario?.correo,
      rol: empleado.usuario?.rol?.nombre || 'Sin rol',
      id_rol: empleado.usuario?.id_rol,
      estado_usuario: empleado.usuario?.estado,
      id_empleado: empleado.id_empleado,
      estado_empleado: empleado.estado,
      es_empleado_registrado: true
    };

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el empleado.", error: error.message });
  }
};

export const changeEmpleadoState = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const empleado = await Empleado.findByPk(id, {
      include: [
        { 
          model: User, 
          as: "usuario",
          include: [
            {
              model: Rol,
              as: "rol"
            }
          ]
        }
      ]
    });
    
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }
    
    empleado.estado = estado;
    await empleado.save();

    // Formatear respuesta similar al getAllEmpleados
    const resultado = {
      id_usuario: empleado.usuario?.id_usuario,
      nombre: empleado.usuario?.nombre,
      apellido: empleado.usuario?.apellido,
      correo: empleado.usuario?.correo,
      rol: empleado.usuario?.rol?.nombre || 'Sin rol',
      id_rol: empleado.usuario?.id_rol,
      estado_usuario: empleado.usuario?.estado,
      id_empleado: empleado.id_empleado,
      estado_empleado: empleado.estado,
      es_empleado_registrado: true
    };

    res.status(200).json(resultado);
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

    // Crear registros de empleados faltantes
    for (const usuario of usuarios) {
      let empleadoInfo = empleadosMap.get(usuario.id_usuario);
      
      // Si no existe registro en la tabla empleados, crearlo automáticamente
      if (!empleadoInfo) {
        try {
          const nuevoEmpleado = await Empleado.create({
            id_usuario: usuario.id_usuario,
            estado: true // Estado activo por defecto
          });
          
          // Actualizar el mapa con el nuevo empleado
          empleadosMap.set(usuario.id_usuario, nuevoEmpleado);
          
          console.log(`✅ Empleado creado automáticamente para reporte - usuario ${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id_usuario})`);
        } catch (createError) {
          console.error(`❌ Error al crear empleado para reporte - usuario ${usuario.id_usuario}:`, createError.message);
        }
      }
    }

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
      { header: "Estado Empleado", key: "estado_empleado", width: 15 }
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
        estado_empleado: empleadoInfo?.estado ? 'Activo' : (empleadoInfo?.estado === false ? 'Inactivo' : 'N/A')
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
