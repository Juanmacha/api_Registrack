import { registrarCliente, obtenerClientes, obtenerClientePorId, actualizarCliente, eliminarCliente } from "../services/cliente.service.js";
import ExcelJS from "exceljs";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_MESSAGES,
  ERROR_CODES 
} from "../constants/messages.js";

// CREATE
export const crearCliente = async (req, res) => {
  try {
    const { cliente, empresa } = await registrarCliente(req.body.cliente, req.body.empresa);
    
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CLIENT_CREATED,
      data: {
        cliente: {
          id_cliente: cliente.id_cliente,
          id_usuario: cliente.id_usuario,
          marca: cliente.marca,
          tipo_persona: cliente.tipo_persona,
          estado: cliente.estado
        },
        empresa: empresa ? {
          id_empresa: empresa.id_empresa,
          nombre: empresa.nombre,
          nit: empresa.nit,
          direccion: empresa.direccion,
          telefono: empresa.telefono,
          correo: empresa.correo
        } : null
      },
      meta: {
        timestamp: new Date().toISOString(),
        nextSteps: [
          "El cliente puede ahora realizar solicitudes",
          "Configure los servicios disponibles para el cliente",
          "Asigne un empleado responsable si es necesario"
        ]
      }
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    
    if (error.message.includes("usuario") || error.message.includes("Usuario")) {
      return res.status(400).json({
        success: false,
        error: {
          message: VALIDATION_MESSAGES.CLIENT.INVALID_USER_ID,
          code: ERROR_CODES.VALIDATION_ERROR,
          details: { field: "id_usuario", value: req.body.cliente?.id_usuario },
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: ERROR_CODES.INTERNAL_ERROR,
        details: process.env.NODE_ENV === "development" ? error.message : "Error al registrar cliente",
        timestamp: new Date().toISOString()
      }
    });
  }
};

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
          usuario: cliente.Usuario ? {
            nombre: cliente.Usuario.nombre,
            apellido: cliente.Usuario.apellido,
            correo: cliente.Usuario.correo,
            telefono: cliente.Usuario.telefono
          } : null,
          empresas: cliente.Empresas || []
        })),
        total: clientes.length
      },
      meta: {
        timestamp: new Date().toISOString(),
        filters: {
          available: "Use query parameters para filtrar por estado, tipo_persona, etc."
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

// UPDATE
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
          estado: cliente.estado
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        changes: Object.keys(req.body).join(', ')
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
