import { obtenerClientesDeEmpresa, obtenerClientesDeEmpresaPorNit, crearEmpresa } from "../services/empresa.services.js";
import { 
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES, 
  VALIDATION_MESSAGES,
  ERROR_CODES 
} from "../constants/messages.js";

// Crear empresa
export const crearEmpresaController = async (req, res) => {
  try {
    // Procesar los datos para convertir NIT a número y agregar tipo_empresa si no viene
    const empresaData = {
      ...req.body,
      tipo_empresa: req.body.tipo_empresa || "Sociedad por Acciones Simplificada", // Valor por defecto
      nit: parseInt(req.body.nit.replace(/[^0-9]/g, '')) // Convertir NIT a número, removiendo caracteres no numéricos
    };

    const empresa = await crearEmpresa(empresaData);
    
    res.status(201).json({
      success: true,
      message: "Empresa creada exitosamente",
      data: {
        empresa: {
          id_empresa: empresa.id_empresa,
          nombre: empresa.nombre,
          nit: empresa.nit,
          tipo_empresa: empresa.tipo_empresa,
          direccion: empresa.direccion,
          telefono: empresa.telefono,
          correo: empresa.correo
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        nextSteps: [
          "La empresa puede ahora asociarse con clientes",
          "Configure los servicios disponibles para la empresa"
        ]
      }
    });
  } catch (error) {
    console.error("Error al crear empresa:", error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: {
          message: "Ya existe una empresa con este NIT",
          code: "DUPLICATE_NIT",
          details: {
            field: "nit",
            value: req.body.nit
          },
          timestamp: new Date().toISOString()
        }
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return res.status(400).json({
        success: false,
        error: {
          message: "Error de validación en los datos enviados",
          code: "VALIDATION_ERROR",
          details: validationErrors,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: {
        message: "Error interno del servidor al crear empresa",
        code: "INTERNAL_ERROR",
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Buscar por ID de empresa
export const listarClientesDeEmpresa = async (req, res) => {
  try {
    const empresa = await obtenerClientesDeEmpresa(req.params.id);
    if (!empresa) return res.status(404).json({ message: "Empresa no encontrada" });
    res.status(200).json({
      empresa: empresa.nombre,
      nit: empresa.nit,
      clientes: empresa.Clientes
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes de empresa", error: error.message });
  }
};

// Buscar por NIT
export const listarClientesDeEmpresaPorNit = async (req, res) => {
  try {
    const empresa = await obtenerClientesDeEmpresaPorNit(req.params.nit);
    if (!empresa) return res.status(404).json({ message: "Empresa no encontrada" });
    res.status(200).json({
      empresa: empresa.nombre,
      nit: empresa.nit,
      clientes: empresa.Clientes
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener clientes de empresa por NIT", error: error.message });
  }
};
