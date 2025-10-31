import { obtenerClientes, obtenerClientePorId, actualizarCliente, eliminarCliente } from "../services/cliente.service.js";
import { getClienteById } from "../repositories/cliente.repository.js";
import ExcelJS from "exceljs";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_MESSAGES,
  ERROR_CODES 
} from "../constants/messages.js";

// READ - todos
export const listarClientes = async (req, res) => {
  try {
    const clientes = await obtenerClientes();
    
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.CLIENTS_FOUND,
      data: {
        clientes: clientes.map(cliente => ({
          id_cliente: cliente.id_cliente,
          id_usuario: cliente.id_usuario,
          marca: cliente.marca,
          tipo_persona: cliente.tipo_persona,
          estado: cliente.estado,
          origen: cliente.origen,
          usuario: cliente.Usuario ? {
            nombre: cliente.Usuario.nombre,
            apellido: cliente.Usuario.apellido,
            correo: cliente.Usuario.correo,
            tipo_documento: cliente.Usuario.tipo_documento,
            documento: cliente.Usuario.documento
          } : null,
          empresas: cliente.Empresas || []
        })),
        total: clientes.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        filters: {
          applied: "Todos los clientes",
          available: "Use query parameters para filtrar por estado, tipo_persona, origen, etc."
        }
      }
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al obtener clientes",
        timestamp: new Date().toISOString()
      }
    });
  }
};

// READ - uno
export const obtenerCliente = async (req, res) => {
  try {
    const cliente = await obtenerClientePorId(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.CLIENT.CLIENT_NOT_FOUND,
          code: ERROR_CODES.CLIENT_NOT_FOUND,
          details: { id: req.params.id },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.CLIENT_FOUND,
      data: {
        cliente: {
          id_cliente: cliente.id_cliente,
          id_usuario: cliente.id_usuario,
          marca: cliente.marca,
          tipo_persona: cliente.tipo_persona,
          estado: cliente.estado,
          origen: cliente.origen,
          usuario: cliente.Usuario ? {
            id_usuario: cliente.Usuario.id_usuario,
            nombre: cliente.Usuario.nombre,
            apellido: cliente.Usuario.apellido,
            correo: cliente.Usuario.correo,
            telefono: cliente.Usuario.telefono,
            tipo_documento: cliente.Usuario.tipo_documento,
            documento: cliente.Usuario.documento
          } : null,
          empresas: cliente.Empresas || []
        }
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al obtener cliente",
        timestamp: new Date().toISOString()
      }
    });
  }
};

// UPDATE - Cliente completo
export const editarCliente = async (req, res) => {
  try {
    const cliente = await actualizarCliente(req.params.id, req.body);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.CLIENT.CLIENT_NOT_FOUND,
          code: ERROR_CODES.CLIENT_NOT_FOUND,
          details: { id: req.params.id },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.CLIENT_UPDATED,
      data: {
        cliente: {
          id_cliente: cliente.id_cliente,
          id_usuario: cliente.id_usuario,
          marca: cliente.marca,
          tipo_persona: cliente.tipo_persona,
          estado: cliente.estado,
          origen: cliente.origen,
          usuario: cliente.Usuario ? {
            id_usuario: cliente.Usuario.id_usuario,
            nombre: cliente.Usuario.nombre,
            apellido: cliente.Usuario.apellido,
            correo: cliente.Usuario.correo,
            telefono: cliente.Usuario.telefono,
            tipo_documento: cliente.Usuario.tipo_documento,
            documento: cliente.Usuario.documento
          } : null,
          empresas: cliente.Empresas || []
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        changes: Object.keys(req.body).join(', '),
        note: "Cliente actualizado exitosamente. Los cambios se reflejan en el sistema."
      }
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al actualizar cliente",
        timestamp: new Date().toISOString()
      }
    });
  }
};

// UPDATE - Usuario asociado al cliente
export const editarUsuarioCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, nombre, apellido, correo, tipo_documento, documento } = req.body;
    
    // Obtener el cliente para acceder al id_usuario
    const cliente = await getClienteById(id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Cliente no encontrado",
          code: ERROR_CODES.NOT_FOUND,
          details: { id },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Preparar datos de actualización del usuario
    const datosUsuario = {};
    if (telefono !== undefined) datosUsuario.telefono = telefono;
    if (nombre !== undefined) datosUsuario.nombre = nombre;
    if (apellido !== undefined) datosUsuario.apellido = apellido;
    if (correo !== undefined) datosUsuario.correo = correo;
    if (tipo_documento !== undefined) datosUsuario.tipo_documento = tipo_documento;
    if (documento !== undefined) datosUsuario.documento = documento;
    
    // Verificar que hay al menos un campo para actualizar
    if (Object.keys(datosUsuario).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Debe proporcionar al menos un campo para actualizar",
          code: ERROR_CODES.VALIDATION_ERROR,
          details: { campos_disponibles: ["telefono", "nombre", "apellido", "correo", "tipo_documento", "documento"] },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Importar el servicio de usuario
    const { updateUsuarioById } = await import("../services/user.services.js");
    
    // Actualizar el usuario
    const usuarioActualizado = await updateUsuarioById(cliente.id_usuario, datosUsuario);
    
    if (!usuarioActualizado) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Usuario asociado no encontrado",
          code: ERROR_CODES.NOT_FOUND,
          details: { id_usuario: cliente.id_usuario },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Obtener el cliente actualizado con todas las relaciones
    const clienteActualizado = await getClienteById(id);
    
    res.status(200).json({
      success: true,
      message: "Usuario del cliente actualizado exitosamente",
      data: {
        cliente: {
          id_cliente: clienteActualizado.id_cliente,
          id_usuario: clienteActualizado.id_usuario,
          marca: clienteActualizado.marca,
          tipo_persona: clienteActualizado.tipo_persona,
          estado: clienteActualizado.estado,
          origen: clienteActualizado.origen,
          usuario: clienteActualizado.Usuario ? {
            id_usuario: clienteActualizado.Usuario.id_usuario,
            nombre: clienteActualizado.Usuario.nombre,
            apellido: clienteActualizado.Usuario.apellido,
            correo: clienteActualizado.Usuario.correo,
            telefono: clienteActualizado.Usuario.telefono,
            tipo_documento: clienteActualizado.Usuario.tipo_documento,
            documento: clienteActualizado.Usuario.documento
          } : null,
          empresas: clienteActualizado.Empresas || []
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        changes: Object.keys(datosUsuario).join(', '),
        note: "Usuario asociado actualizado. Los cambios se reflejan en el sistema."
      }
    });
  } catch (error) {
    console.error("Error al actualizar usuario del cliente:", error);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al actualizar usuario del cliente",
        timestamp: new Date().toISOString()
      }
    });
  }
};

// UPDATE - Empresa asociada
export const editarEmpresaCliente = async (req, res) => {
  try {
    const { id_empresa, ...datosEmpresa } = req.body;
    
    if (!id_empresa) {
      return res.status(400).json({
        success: false,
        error: {
          message: "ID de empresa es requerido",
          code: ERROR_CODES.VALIDATION_ERROR,
          details: { field: "id_empresa", value: id_empresa },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Importar la función de actualización de empresa
    const { updateEmpresa } = await import("../repositories/empresa.repository.js");
    
    // Actualizar la empresa
    const empresaActualizada = await updateEmpresa(id_empresa, datosEmpresa);
    
    if (!empresaActualizada) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Empresa no encontrada",
          code: ERROR_CODES.NOT_FOUND,
          details: { id_empresa },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Obtener el cliente actualizado con todas las relaciones
    const clienteActualizado = await getClienteById(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Empresa del cliente actualizada exitosamente",
      data: {
        cliente: {
          id_cliente: clienteActualizado.id_cliente,
          id_usuario: clienteActualizado.id_usuario,
          marca: clienteActualizado.marca,
          tipo_persona: clienteActualizado.tipo_persona,
          estado: clienteActualizado.estado,
          origen: clienteActualizado.origen,
          usuario: clienteActualizado.Usuario ? {
            id_usuario: clienteActualizado.Usuario.id_usuario,
            nombre: clienteActualizado.Usuario.nombre,
            apellido: clienteActualizado.Usuario.apellido,
            correo: clienteActualizado.Usuario.correo,
            tipo_documento: clienteActualizado.Usuario.tipo_documento,
            documento: clienteActualizado.Usuario.documento
          } : null,
          empresas: clienteActualizado.Empresas || []
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        changes: Object.keys(datosEmpresa).join(', '),
        note: "Empresa asociada actualizada. Los cambios se reflejan en el sistema."
      }
    });
  } catch (error) {
    console.error("Error al actualizar empresa del cliente:", error);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al actualizar empresa del cliente",
        timestamp: new Date().toISOString()
      }
    });
  }
};

// DELETE
export const borrarCliente = async (req, res) => {
  try {
    const cliente = await eliminarCliente(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.CLIENT.CLIENT_NOT_FOUND,
          code: ERROR_CODES.CLIENT_NOT_FOUND,
          details: { id: req.params.id },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.CLIENT_DELETED,
      data: {
        cliente: {
          id_cliente: cliente.id_cliente,
          marca: cliente.marca,
          tipo_persona: cliente.tipo_persona
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        warning: "Esta acción no se puede deshacer"
      }
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al eliminar cliente",
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Reporte Excel de clientes
export const descargarReporteClientes = async (req, res) => {
  try {
    const clientes = await obtenerClientes();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clientes");

    worksheet.columns = [
      { header: "ID Cliente", key: "id_cliente", width: 15 },
      { header: "Tipo Documento", key: "tipo_documento", width: 20 },
      { header: "Documento", key: "documento", width: 20 },
      { header: "Nombre", key: "nombre", width: 25 },
      { header: "Apellido", key: "apellido", width: 25 },
      { header: "Correo", key: "correo", width: 30 },
      { header: "Marca", key: "marca", width: 20 },
      { header: "Tipo Persona", key: "tipo_persona", width: 15 },
      { header: "Estado", key: "estado", width: 15 },
      { header: "Empresa", key: "empresa", width: 30 }
    ];

    clientes.forEach(cliente => {
      const empresaNombre = cliente.Empresas && cliente.Empresas.length > 0 ? 
        cliente.Empresas[0].nombre : 'No asignada';
      
      worksheet.addRow({
        id_cliente: cliente.id_cliente,
        tipo_documento: cliente.Usuario ? cliente.Usuario.tipo_documento : '',
        documento: cliente.Usuario ? cliente.Usuario.documento : '',
        nombre: cliente.Usuario ? cliente.Usuario.nombre : '',
        apellido: cliente.Usuario ? cliente.Usuario.apellido : '',
        correo: cliente.Usuario ? cliente.Usuario.correo : '',
        marca: cliente.marca || '',
        tipo_persona: cliente.tipo_persona,
        estado: cliente.estado ? 'Activo' : 'Inactivo',
        empresa: empresaNombre
      });
    });

    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center" };
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=reporte_clientes.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Error al generar el reporte de clientes", error: error.message });
  }
};
