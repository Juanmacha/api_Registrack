import ValidacionServicioService from "../services/formularioDinamico.service.js";

export class ValidacionServicioController {
  constructor() {
    this.service = new ValidacionServicioService();
  }

  /**
   * Valida los datos de una orden de servicio según el servicio seleccionado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async validarOrdenServicio(req, res) {
    try {
      const { idServicio } = req.params;
      const datos = req.body;

      if (!idServicio || isNaN(parseInt(idServicio))) {
        return res.status(400).json({
          success: false,
          mensaje: "ID de servicio válido es requerido",
        });
      }

      if (!datos || Object.keys(datos).length === 0) {
        return res.status(400).json({
          success: false,
          mensaje: "Datos de la orden de servicio son requeridos",
        });
      }

      const resultado = await this.service.validarOrdenServicio(
        parseInt(idServicio),
        datos
      );

      res.status(200).json({
        success: true,
        mensaje: "Validación completada",
        data: resultado,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        mensaje: "Error al validar orden de servicio",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene todos los servicios con información de sus campos obligatorios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerServiciosConValidacion(req, res) {
    try {
      const servicios = await this.service.obtenerServiciosConValidacion();

      res.status(200).json({
        success: true,
        mensaje: "Servicios obtenidos exitosamente",
        data: servicios,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        mensaje: "Error al obtener servicios",
        error: error.message,
      });
    }
  }

  /**
   * Verifica si un campo es obligatorio para un servicio específico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async verificarCampoObligatorio(req, res) {
    try {
      const { nombreServicio, nombreCampo } = req.params;

      if (!nombreServicio || !nombreCampo) {
        return res.status(400).json({
          success: false,
          mensaje: "Nombre de servicio y nombre de campo son requeridos",
        });
      }

      const esObligatorio = this.service.verificarCampoObligatorio(
        nombreServicio,
        nombreCampo
      );

      res.status(200).json({
        success: true,
        mensaje: "Verificación completada",
        data: {
          servicio: nombreServicio,
          campo: nombreCampo,
          es_obligatorio: esObligatorio,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        mensaje: "Error al verificar campo",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene los campos obligatorios para un servicio específico
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerCamposObligatorios(req, res) {
    try {
      const { nombreServicio } = req.params;

      if (!nombreServicio) {
        return res.status(400).json({
          success: false,
          mensaje: "Nombre de servicio es requerido",
        });
      }

      const campos = this.service.obtenerCamposObligatorios(nombreServicio);

      res.status(200).json({
        success: true,
        mensaje: "Campos obligatorios obtenidos exitosamente",
        data: {
          servicio: nombreServicio,
          campos_obligatorios: campos,
          total_campos: campos.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        mensaje: "Error al obtener campos obligatorios",
        error: error.message,
      });
    }
  }

  /**
   * Obtiene la configuración de todos los servicios
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async obtenerConfiguracionServicios(req, res) {
    try {
      const configuracion = this.service.obtenerConfiguracionServicios();

      res.status(200).json({
        success: true,
        mensaje: "Configuración de servicios obtenida exitosamente",
        data: configuracion,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        mensaje: "Error al obtener configuración de servicios",
        error: error.message,
      });
    }
  }
}

export default ValidacionServicioController;
