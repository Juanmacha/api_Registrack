// servicioRepository.js
import Servicio from "../models/Servicio.js";

// Datos quemados de servicios
const serviciosQuemados = [
  {
    id_servicio: 1,
    nombre: "Búsqueda de Antecedentes",
    descripcion:
      "Verifica la disponibilidad de tu marca antes de iniciar el registro.",
    descripcion_informativa:
      "Este servicio te permite conocer si tu marca ya está registrada o si existe alguna marca similar que pueda generar conflictos legales. Es el primer paso fundamental antes de proceder con el registro de tu marca.",
    precio_base: 150000.0,
    estado: true,
    imagen: null,
    procesos: [
      {
        id: 1,
        nombre: "Solicitud Recibida",
        orden: 1,
      },
      {
        id: 2,
        nombre: "Búsqueda en Proceso",
        orden: 2,
      },
      {
        id: 3,
        nombre: "Informe Generado",
        orden: 3,
      },
    ],
  },
  {
    id_servicio: 2,
    nombre: "Certificación de Marca",
    descripcion:
      "Acompañamiento completo en el proceso de certificación de tu marca.",
    descripcion_informativa:
      "Nuestro equipo de expertos te acompañará durante todo el proceso de certificación de tu marca, desde la evaluación inicial hasta la obtención del certificado oficial. Garantizamos un proceso transparente y eficiente.",
    precio_base: 1848000.0,
    estado: true,
    imagen: null,
    procesos: [
      {
        id: 1,
        nombre: "Evaluación Inicial",
        orden: 1,
      },
      {
        id: 2,
        nombre: "Preparación de Documentos",
        orden: 2,
      },
      {
        id: 3,
        nombre: "Presentación ante Autoridad",
        orden: 3,
      },
      {
        id: 4,
        nombre: "Seguimiento y Certificación",
        orden: 4,
      },
    ],
  },
  {
    id_servicio: 3,
    nombre: "Renovación de Marca",
    descripcion: "Renueva tu marca y mantén tu protección legal vigente.",
    descripcion_informativa:
      "Mantén vigente la protección legal de tu marca realizando la renovación oportuna. Te asesoramos en todo el proceso para asegurar que tu marca mantenga su validez legal sin interrupciones.",
    precio_base: 1352000.0,
    estado: true,
    imagen: null,
    procesos: [],
  },
  {
    id_servicio: 4,
    nombre: "Presentación de Oposición",
    descripcion: "Defiende tus derechos de marca presentando una oposición.",
    descripcion_informativa:
      "Protege tus derechos de marca presentando una oposición legal cuando sea necesario. Nuestros abogados especializados te representarán en todo el proceso legal para defender tus intereses.",
    precio_base: 1400000.0,
    estado: true,
    imagen: null,
    procesos: [],
  },
  {
    id_servicio: 5,
    nombre: "Cesión de Marca",
    descripcion:
      "Gestiona la transferencia de derechos de tu marca de forma segura.",
    descripcion_informativa:
      "Realiza la transferencia de derechos de tu marca de manera segura y legal. Te asesoramos en todo el proceso de cesión, desde la negociación hasta la formalización legal del traspaso.",
    precio_base: 865000.0,
    estado: true,
    imagen: null,
    procesos: [],
  },
  {
    id_servicio: 6,
    nombre: "Ampliación de Alcance",
    descripcion:
      "Extiende la protección de tu marca a nuevas clases o categorías.",
    descripcion_informativa:
      "Amplía la protección de tu marca a nuevas clases o categorías comerciales. Te ayudamos a identificar las mejores oportunidades de expansión y gestionamos todo el proceso de ampliación.",
    precio_base: 750000.0,
    estado: true,
    imagen: null,
    procesos: [],
  },
];

const servicioRepository = {
  // Listar todos los servicios
  getAllServicios: async () => {
    try {
      // Retornar los datos quemados
      return serviciosQuemados.filter((servicio) => servicio.estado === true);
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  },

  // Obtener servicio por ID
  getServicioById: async (id) => {
    try {
      const servicio = serviciosQuemados.find(
        (s) => s.id_servicio === parseInt(id) && s.estado === true
      );
      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }
      return servicio;
    } catch (error) {
      throw new Error(`Error al obtener servicio: ${error.message}`);
    }
  },

  // Obtener detalle completo de servicio
  getDetalleServicio: async (id) => {
    try {
      const servicio = serviciosQuemados.find(
        (s) => s.id_servicio === parseInt(id) && s.estado === true
      );
      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      // Retornar detalle completo con todos los campos requeridos
      return {
        id_servicio: servicio.id_servicio,
        titulo: servicio.nombre,
        descripcion: servicio.descripcion,
        descripcion_informativa: servicio.descripcion_informativa,
        precio_base: servicio.precio_base,
        imagen: servicio.imagen,
        procesos: servicio.procesos || [],
      };
    } catch (error) {
      throw new Error(`Error al obtener detalle de servicio: ${error.message}`);
    }
  },

  // Buscar servicios por nombre
  buscarPorNombre: async (nombre) => {
    try {
      const serviciosEncontrados = serviciosQuemados.filter(
        (servicio) =>
          servicio.estado === true &&
          servicio.nombre.toLowerCase().includes(nombre.toLowerCase())
      );
      return serviciosEncontrados;
    } catch (error) {
      throw new Error(`Error al buscar servicios: ${error.message}`);
    }
  },

  // Actualizar servicio (datos de landing page)
  actualizarServicio: async (id, datosActualizados) => {
    try {
      const index = serviciosQuemados.findIndex(
        (s) => s.id_servicio === parseInt(id)
      );
      if (index === -1) {
        throw new Error("Servicio no encontrado");
      }

      // Actualizar solo los campos permitidos
      if (datosActualizados.nombre) {
        serviciosQuemados[index].nombre = datosActualizados.nombre;
      }
      if (datosActualizados.descripcion !== undefined) {
        serviciosQuemados[index].descripcion = datosActualizados.descripcion;
      }
      if (datosActualizados.precio_base) {
        serviciosQuemados[index].precio_base = datosActualizados.precio_base;
      }
      if (datosActualizados.imagen !== undefined) {
        serviciosQuemados[index].imagen = datosActualizados.imagen;
      }

      return serviciosQuemados[index];
    } catch (error) {
      throw new Error(`Error al actualizar servicio: ${error.message}`);
    }
  },

  // Obtener procesos de un servicio
  obtenerProcesos: async (idServicio) => {
    try {
      const servicio = serviciosQuemados.find(
        (s) => s.id_servicio === parseInt(idServicio)
      );
      if (!servicio) {
        throw new Error("Servicio no encontrado");
      }

      // Retornar procesos del servicio (si no existen, crear array vacío)
      return servicio.procesos || [];
    } catch (error) {
      throw new Error(`Error al obtener procesos: ${error.message}`);
    }
  },

  // Actualizar procesos de un servicio
  actualizarProcesos: async (idServicio, procesos) => {
    try {
      const index = serviciosQuemados.findIndex(
        (s) => s.id_servicio === parseInt(idServicio)
      );
      if (index === -1) {
        throw new Error("Servicio no encontrado");
      }

      // Actualizar procesos del servicio
      serviciosQuemados[index].procesos = procesos;
      return serviciosQuemados[index].procesos;
    } catch (error) {
      throw new Error(`Error al actualizar procesos: ${error.message}`);
    }
  },

  // Ocultar servicio (cambiar estado a false)
  ocultarServicio: async (id) => {
    try {
      const index = serviciosQuemados.findIndex(
        (s) => s.id_servicio === parseInt(id)
      );
      if (index === -1) {
        throw new Error("Servicio no encontrado");
      }

      serviciosQuemados[index].estado = false;
      return serviciosQuemados[index];
    } catch (error) {
      throw new Error(`Error al ocultar servicio: ${error.message}`);
    }
  },

  // Publicar servicio (cambiar estado a true)
  publicarServicio: async (id) => {
    try {
      const index = serviciosQuemados.findIndex(
        (s) => s.id_servicio === parseInt(id)
      );
      if (index === -1) {
        throw new Error("Servicio no encontrado");
      }

      serviciosQuemados[index].estado = true;
      return serviciosQuemados[index];
    } catch (error) {
      throw new Error(`Error al publicar servicio: ${error.message}`);
    }
  },

  // Obtener todos los servicios (incluyendo ocultos) - para admin
  getAllServiciosAdmin: async () => {
    try {
      return serviciosQuemados; // Retorna todos, sin filtrar por estado
    } catch (error) {
      throw new Error(`Error al obtener servicios: ${error.message}`);
    }
  },
};

export default servicioRepository;
