import { SeguimientoService } from "../services/seguimiento.service.js";

const seguimientoService = new SeguimientoService();

// Obtener historial de seguimiento de una solicitud
export const obtenerHistorialSeguimiento = async (req, res) => {
  try {
    const { idOrdenServicio } = req.params;
    const seguimientos = await seguimientoService.obtenerHistorialSeguimiento(
      idOrdenServicio
    );
    res.json(seguimientos);
  } catch (error) {
    console.error("Error al obtener historial de seguimiento:", error);
    if (error.message.includes("Orden de servicio no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Crear nuevo registro de seguimiento
export const crearSeguimiento = async (req, res) => {
  try {
    // Verificar que el usuario esté autenticado y tenga ID
    if (!req.user || !req.user.id_usuario) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado o ID de usuario no válido.",
      });
    }

    const seguimientoData = {
      ...req.body,
      registrado_por: req.user.id_usuario, // Asignar automáticamente el usuario que registra
    };

    const resultado = await seguimientoService.crearSeguimiento(
      seguimientoData
    );
    res.status(201).json(resultado);
  } catch (error) {
    console.error("Error al crear seguimiento:", error);
    if (error.message.includes("es requerido")) {
      res.status(400).json({ mensaje: error.message });
    } else if (error.message.includes("Orden de servicio no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else if (error.message.includes("El título no puede exceder")) {
      res.status(400).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Obtener seguimiento por ID
export const obtenerSeguimientoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const seguimiento = await seguimientoService.obtenerSeguimientoPorId(id);
    res.json(seguimiento);
  } catch (error) {
    console.error("Error al obtener seguimiento:", error);
    if (error.message.includes("Seguimiento no encontrado")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Actualizar seguimiento
export const actualizarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    const resultado = await seguimientoService.actualizarSeguimiento(
      id,
      datosActualizados
    );
    res.json(resultado);
  } catch (error) {
    console.error("Error al actualizar seguimiento:", error);
    if (error.message.includes("Seguimiento no encontrado")) {
      res.status(404).json({ mensaje: error.message });
    } else if (error.message.includes("Debe proporcionar al menos un campo")) {
      res.status(400).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Eliminar seguimiento
export const eliminarSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await seguimientoService.eliminarSeguimiento(id);
    res.json(resultado);
  } catch (error) {
    console.error("Error al eliminar seguimiento:", error);
    if (error.message.includes("Seguimiento no encontrado")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

// Buscar seguimientos por título
export const buscarPorTitulo = async (req, res) => {
  try {
    const { idOrdenServicio } = req.params;
    const { titulo } = req.query;

    if (!titulo) {
      return res
        .status(400)
        .json({ mensaje: "El parámetro titulo es requerido." });
    }

    const seguimientos = await seguimientoService.buscarPorTitulo(
      idOrdenServicio,
      titulo
    );
    res.json(seguimientos);
  } catch (error) {
    console.error("Error al buscar seguimientos por título:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};
