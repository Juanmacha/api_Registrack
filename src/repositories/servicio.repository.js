// servicioRepository.js
import Servicio from "../models/Servicio.js";
import Proceso from "../models/Proceso.js";

const servicioRepository = {
  // Listar todos los servicios con procesos
  getAllServicios: async () => {
    try {
      const servicios = await Servicio.findAll({
        where: { estado: true },
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      });

      // Transformar a formato frontend
      return servicios.map(servicio => ({
        id: servicio.id_servicio.toString(),
        nombre: servicio.nombre,
        descripcion_corta: servicio.descripcion_corta,
        precio_base: servicio.precio_base,
        visible_en_landing: servicio.visible_en_landing,
        landing_data: servicio.landing_data || {},
        info_page_data: servicio.info_page_data || {},
        route_path: servicio.route_path,
        process_states: servicio.process_states.map(estado => ({
          id: estado.id_proceso.toString(),
          name: estado.nombre,
          order: estado.order_number,
          status_key: estado.status_key
        }))
      }));
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  },

  // Obtener servicio por ID con procesos
  getServicioById: async (id) => {
    try {
      const servicio = await Servicio.findByPk(id, {
        where: { estado: true },
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      });

      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      // Transformar a formato frontend
      return {
        id: servicio.id_servicio.toString(),
        nombre: servicio.nombre,
        descripcion_corta: servicio.descripcion_corta,
        precio_base: servicio.precio_base,
        visible_en_landing: servicio.visible_en_landing,
        landing_data: servicio.landing_data || {},
        info_page_data: servicio.info_page_data || {},
        route_path: servicio.route_path,
        process_states: servicio.process_states.map(estado => ({
          id: estado.id_proceso.toString(),
          name: estado.nombre,
          order: estado.order_number,
          status_key: estado.status_key
        }))
      };
    } catch (error) {
      throw new Error(`Error al obtener servicio: ${error.message}`);
    }
  },

  // Obtener detalle completo de servicio
  getDetalleServicio: async (id) => {
    try {
      const servicio = await Servicio.findByPk(id, {
        where: { estado: true },
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      });

      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      return {
        id_servicio: servicio.id_servicio,
        titulo: servicio.nombre,
        descripcion: servicio.descripcion,
        descripcion_informativa: servicio.info_page_data?.descripcion || servicio.descripcion,
        precio_base: servicio.precio_base,
        imagen: servicio.landing_data?.imagen || null,
        procesos: servicio.process_states.map(estado => ({
          id: estado.id_proceso,
          nombre: estado.nombre,
          orden: estado.order_number
        }))
      };
    } catch (error) {
      throw new Error(`Error al obtener detalle de servicio: ${error.message}`);
    }
  },

  // Buscar servicios por nombre
  buscarPorNombre: async (nombre) => {
    try {
      const servicios = await Servicio.findAll({
        where: {
          estado: true,
          nombre: {
            [require('sequelize').Op.like]: `%${nombre}%`
          }
        },
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      });

      return servicios.map(servicio => ({
        id: servicio.id_servicio.toString(),
        nombre: servicio.nombre,
        descripcion_corta: servicio.descripcion_corta,
        precio_base: servicio.precio_base,
        visible_en_landing: servicio.visible_en_landing,
        landing_data: servicio.landing_data || {},
        info_page_data: servicio.info_page_data || {},
        route_path: servicio.route_path,
        process_states: servicio.process_states.map(estado => ({
          id: estado.id_proceso.toString(),
          name: estado.nombre,
          order: estado.order_number,
          status_key: estado.status_key
        }))
      }));
    } catch (error) {
      throw new Error(`Error al buscar servicios: ${error.message}`);
    }
  },

  // Actualizar servicio (datos de landing page)
  actualizarServicio: async (id, datosActualizados) => {
    try {
      const servicio = await Servicio.findByPk(id);
      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      await servicio.update(datosActualizados);
      return await servicioRepository.getServicioById(id);
    } catch (error) {
      throw new Error(`Error al actualizar servicio: ${error.message}`);
    }
  },

  // Obtener procesos de un servicio
  obtenerProcesos: async (idServicio) => {
    try {
      const procesos = await Proceso.findAll({
        where: { servicio_id: idServicio },
        order: [['order_number', 'ASC']]
      });

      return procesos.map(proceso => ({
        id: proceso.id_proceso,
        nombre: proceso.nombre,
        orden: proceso.order_number
      }));
    } catch (error) {
      throw new Error(`Error al obtener procesos: ${error.message}`);
    }
  },

  // Actualizar procesos de un servicio
  actualizarProcesos: async (idServicio, procesos) => {
    try {
      // Eliminar procesos existentes
      await Proceso.destroy({ where: { servicio_id: idServicio } });
      
      // Crear nuevos procesos
      const nuevosProcesos = procesos.map(proceso => ({
        servicio_id: idServicio,
        nombre: proceso.nombre,
        order_number: proceso.orden,
        status_key: proceso.status_key || proceso.nombre.toLowerCase().replace(/\s+/g, '_')
      }));
      
      await Proceso.bulkCreate(nuevosProcesos);
      return await servicioRepository.obtenerProcesos(idServicio);
    } catch (error) {
      throw new Error(`Error al actualizar procesos: ${error.message}`);
    }
  },

  // Ocultar servicio (cambiar estado a false)
  ocultarServicio: async (id) => {
    try {
      const servicio = await Servicio.findByPk(id);
      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      await servicio.update({ estado: false });
      return await servicioRepository.getServicioById(id);
    } catch (error) {
      throw new Error(`Error al ocultar servicio: ${error.message}`);
    }
  },

  // Publicar servicio (cambiar estado a true)
  publicarServicio: async (id) => {
    try {
      const servicio = await Servicio.findByPk(id);
      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      await servicio.update({ estado: true });
      return await servicioRepository.getServicioById(id);
    } catch (error) {
      throw new Error(`Error al publicar servicio: ${error.message}`);
    }
  },

  // Obtener todos los servicios (incluyendo ocultos) - para admin
  getAllServiciosAdmin: async () => {
    try {
      const servicios = await Servicio.findAll({
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      });

      return servicios.map(servicio => ({
        id: servicio.id_servicio.toString(),
        nombre: servicio.nombre,
        descripcion_corta: servicio.descripcion_corta,
        precio_base: servicio.precio_base,
        visible_en_landing: servicio.visible_en_landing,
        landing_data: servicio.landing_data || {},
        info_page_data: servicio.info_page_data || {},
        route_path: servicio.route_path,
        estado: servicio.estado,
        process_states: servicio.process_states.map(estado => ({
          id: estado.id_proceso.toString(),
          name: estado.nombre,
          order: estado.order_number,
          status_key: estado.status_key
        }))
      }));
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  },
};

export default servicioRepository;
