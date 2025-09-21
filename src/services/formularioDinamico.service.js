import Servicio from "../models/Servicio.js";
import {
  obtenerCamposObligatorios,
  esCampoObligatorio,
  obtenerServiciosConCamposObligatorios,
} from "../config/tiposFormularios.js";

export class ValidacionServicioService {
  constructor() {}

  /**
   * Valida los datos de una orden de servicio según el servicio seleccionado
   * @param {number} idServicio - ID del servicio
   * @param {Object} datos - Datos de la orden de servicio
   * @returns {Object} Resultado de la validación
   */
  async validarOrdenServicio(idServicio, datos) {
    try {
      // Obtener el servicio para conocer su nombre
      const servicio = await Servicio.findByPk(idServicio);
      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      // Obtener los campos obligatorios para este servicio
      const camposObligatorios = obtenerCamposObligatorios(servicio.nombre);

      if (camposObligatorios.length === 0) {
        // Si no hay configuración específica, no hay validación
        return {
          es_valido: true,
          errores: [],
          campos_faltantes: [],
          servicio: servicio.nombre,
          mensaje: "Este servicio no tiene campos obligatorios configurados",
        };
      }

      const errores = [];
      const camposFaltantes = [];

      // Validar campos obligatorios
      camposObligatorios.forEach((campo) => {
        if (!datos[campo] || datos[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
          errores.push(
            `El campo '${campo}' es requerido para el servicio '${servicio.nombre}'`
          );
        }
      });

      return {
        es_valido: errores.length === 0,
        errores,
        campos_faltantes: camposFaltantes,
        servicio: servicio.nombre,
        campos_obligatorios: camposObligatorios,
        total_campos_obligatorios: camposObligatorios.length,
      };
    } catch (error) {
      throw new Error(`Error al validar orden de servicio: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los servicios con información de sus campos obligatorios
   * @returns {Array} Lista de servicios con sus configuraciones
   */
  async obtenerServiciosConValidacion() {
    try {
      const servicios = await Servicio.findAll({
        where: { estado: true },
        order: [["nombre", "ASC"]],
      });

      return servicios.map((servicio) => {
        const camposObligatorios = obtenerCamposObligatorios(servicio.nombre);

        return {
          id: servicio.id_servicio,
          nombre: servicio.nombre,
          descripcion: servicio.descripcion,
          precio_base: servicio.precio_base,
          tiene_validacion: camposObligatorios.length > 0,
          campos_obligatorios: camposObligatorios,
          total_campos_obligatorios: camposObligatorios.length,
        };
      });
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  }

  /**
   * Verifica si un campo específico es obligatorio para un servicio
   * @param {string} nombreServicio - Nombre del servicio
   * @param {string} nombreCampo - Nombre del campo
   * @returns {boolean} True si el campo es obligatorio
   */
  verificarCampoObligatorio(nombreServicio, nombreCampo) {
    return esCampoObligatorio(nombreServicio, nombreCampo);
  }

  /**
   * Obtiene los campos obligatorios para un servicio específico
   * @param {string} nombreServicio - Nombre del servicio
   * @returns {Array} Lista de campos obligatorios
   */
  obtenerCamposObligatorios(nombreServicio) {
    return obtenerCamposObligatorios(nombreServicio);
  }

  /**
   * Obtiene la configuración de todos los servicios
   * @returns {Array} Lista de servicios con sus campos obligatorios
   */
  obtenerConfiguracionServicios() {
    return obtenerServiciosConCamposObligatorios();
  }
}

export default ValidacionServicioService;


