import { SolicitudesService } from "../services/solicitudes.service.js";
import { OrdenServicio, Servicio } from "../models/orden_servico_Servicio.js";
import Cliente from "../models/Cliente.js";
import Empresa from "../models/Empresa.js";
import EmpresaCliente from "../models/EmpresaCliente.js";
import { Op } from "sequelize";

const solicitudesService = new SolicitudesService();

// Función para validar datos de empresa
const validarDatosEmpresa = (empresaData) => {
  const errores = [];
  
  if (!empresaData.nit) {
    errores.push('NIT es requerido');
  } else if (empresaData.nit < 1000000000 || empresaData.nit > 9999999999) {
    errores.push('NIT debe tener entre 10 y 10 dígitos');
  }
  
  if (!empresaData.nombre || empresaData.nombre.trim().length < 2) {
    errores.push('Nombre de empresa es requerido (mínimo 2 caracteres)');
  }
  
  if (empresaData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empresaData.email)) {
    errores.push('Email de empresa no tiene formato válido');
  }
  
  return errores;
};

// Función para validar datos de cliente
const validarDatosCliente = (clienteData) => {
  const errores = [];
  
  if (clienteData.marca && clienteData.marca.length > 50) {
    errores.push('Marca no puede exceder 50 caracteres');
  }
  
  if (clienteData.tipo_persona && !['Natural', 'Jurídica'].includes(clienteData.tipo_persona)) {
    errores.push('Tipo de persona debe ser Natural o Jurídica');
  }
  
  return errores;
};

// Configuración de campos requeridos por servicio
const requiredFields = {
  "Búsqueda de antecedentes": [
    "nombre_solicitante",
    "documento_solicitante",
    "correo_electronico",
    "telefono",
    "marca_a_buscar",
    "clase_niza",
    "descripcion_adicional",
  ],
  "Certificación de marca": [
    "tipo_titular",
    "nombre_marca",
    "clase_niza",
    "descripcion_marca",
    "logo",
    "nombre_completo_titular",
    "documento_identidad_titular",
    "direccion_titular",
    "ciudad_titular",
    "pais_titular",
    "correo_titular",
    "telefono_titular",
    "razon_social",
    "nit",
    "representante_legal",
    "documento_representante_legal",
    "nombre_representante",
    "documento_representante",
    "poder",
  ],
  "Renovación de marca": [
    "tipo_titular",
    "numero_registro_marca",
    "nombre_marca",
    "clase_niza",
    "nombre_razon_social",
    "documento_nit",
    "direccion",
    "ciudad",
    "pais",
    "correo",
    "telefono",
    "nombre_representante",
    "documento_representante",
    "poder",
    "logo_marca",
  ],
  "Cesión de derechos": [
    "titular_actual",
    "documento_nit_titular_actual",
    "nuevo_titular",
    "documento_nit_nuevo_titular",
    "direccion_nuevo_titular",
    "correo_nuevo_titular",
    "telefono_nuevo_titular",
    "numero_registro_marca",
    "clase_niza",
    "nombre_marca",
    "documento_cesion",
  ],
  "Oposición de marca": [
    "nombre_opositor",
    "documento_nit_opositor",
    "direccion",
    "ciudad",
    "pais",
    "correo",
    "telefono",
    "marca_en_conflicto",
    "numero_solicitud_opuesta",
    "clase_niza",
    "argumentos_oposicion",
    "soportes",
  ],
  "Respuesta a oposición": [
    "nombre_titular_que_responde",
    "documento_nit_titular",
    "direccion",
    "ciudad",
    "pais",
    "correo",
    "telefono",
    "numero_solicitud_registro",
    "clase_niza",
    "argumentos_respuesta",
    "soportes",
  ],
  "Ampliación de cobertura": [
    "titular",
    "documento_nit_titular",
    "direccion",
    "ciudad",
    "pais",
    "correo",
    "telefono",
    "numero_registro_existente",
    "nombre_marca",
    "clase_niza_actual",
    "nuevas_clases_niza",
    "descripcion_ampliacion",
    "soportes",
  ],
};

// Función para normalizar texto de forma robusta
const normalizarTexto = (texto) => {
  if (!texto || typeof texto !== 'string') return '';
  
  return texto
    .toLowerCase()
    .replace(/[ó]/g, "o")
    .replace(/[í]/g, "i")
    .replace(/[á]/g, "a")
    .replace(/[é]/g, "e")
    .replace(/[ú]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/\s+/g, ' ') // Normalizar espacios múltiples
    .trim();
};

// Función para buscar servicio de forma robusta
const buscarServicio = (nombreServicio, serviciosDisponibles) => {
  console.log(`🔍 Buscando servicio: "${nombreServicio}"`);
  console.log(`🔍 Servicios disponibles:`, Object.keys(serviciosDisponibles));
  
  const nombreNormalizado = normalizarTexto(nombreServicio);
  console.log(`🔍 Nombre normalizado: "${nombreNormalizado}"`);
  
  // Primero intentar búsqueda exacta
  for (const [key, value] of Object.entries(serviciosDisponibles)) {
    const keyNormalizada = normalizarTexto(key);
    console.log(`🔍 Comparando exacta: "${keyNormalizada}" vs "${nombreNormalizado}"`);
    
    if (keyNormalizada === nombreNormalizado) {
      console.log(`✅ Encontrado por búsqueda exacta: "${key}"`);
      return key;
    }
  }
  
  // Si no se encuentra, intentar búsqueda parcial
  for (const [key, value] of Object.entries(serviciosDisponibles)) {
    const keyNormalizada = normalizarTexto(key);
    
    // Buscar si el nombre del servicio está contenido en la clave
    if (keyNormalizada.includes(nombreNormalizado) || nombreNormalizado.includes(keyNormalizada)) {
      console.log(`✅ Encontrado por búsqueda parcial: "${key}"`);
      return key;
    }
  }
  
  console.log(`❌ Servicio no encontrado`);
  return null;
};

// Función principal para crear solicitud
export const crearSolicitud = async (req, res) => {
  try {
    console.log('🚀 Iniciando creación de solicitud...');
    
    // Verificar autenticación
    console.log('🔍 Debug - req.user:', req.user);
    console.log('🔍 Debug - req.user type:', typeof req.user);
    console.log('🔍 Debug - req.user keys:', req.user ? Object.keys(req.user) : 'req.user is null/undefined');
    
    if (!req.user) {
      console.log('❌ Usuario no autenticado');
      return res.status(401).json({
        mensaje: "Usuario no autenticado",
        error: "Se requiere autenticación para crear solicitudes"
      });
    }

    console.log('✅ Usuario autenticado:', req.user.id, req.user.role);
    console.log('🔍 Debug - req.user.id:', req.user.id);
    console.log('🔍 Debug - req.user.role:', req.user.role);

    // Obtener y decodificar el nombre del servicio
    let nombreServicio = req.params.servicio;
    if (!nombreServicio) {
      console.log('❌ Nombre de servicio no proporcionado');
      return res.status(400).json({
        mensaje: "Nombre de servicio requerido",
        error: "El parámetro 'servicio' es obligatorio"
      });
    }

    // Decodificar URL
    nombreServicio = decodeURIComponent(nombreServicio).trim();
    console.log('🔍 Servicio decodificado:', nombreServicio);

    // Buscar el servicio
    const servicioEncontrado = buscarServicio(nombreServicio, requiredFields);
    
    if (!servicioEncontrado) {
      console.log('❌ Servicio no encontrado');
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
        servicio: nombreServicio,
        serviciosDisponibles: Object.keys(requiredFields),
      });
    }

    console.log('✅ Servicio encontrado:', servicioEncontrado);

    // Determinar campos requeridos según el rol del usuario
    let camposRequeridos = [...requiredFields[servicioEncontrado]];
    console.log('📋 Campos requeridos:', camposRequeridos);

    // Si es cliente, agregar campos de pago como obligatorios
    if (req.user.role === "cliente") {
      camposRequeridos.push("metodo_pago", "monto_pago");
      console.log('💰 Campos de pago agregados para cliente');
    }

    // Validar campos requeridos en el body
    const camposFaltantes = camposRequeridos.filter(
      (campo) => !req.body[campo] || req.body[campo].toString().trim() === ""
    );

    if (camposFaltantes.length > 0) {
      console.log('❌ Campos faltantes:', camposFaltantes);
      return res.status(400).json({
        mensaje: "Campos requeridos faltantes",
        camposFaltantes: camposFaltantes,
        camposRequeridos: camposRequeridos,
      });
    }

    console.log('✅ Todos los campos requeridos están presentes');

    // Buscar el servicio en la base de datos
    let servicio = await Servicio.findOne({
      where: {
        nombre: {
          [Op.like]: `%${servicioEncontrado}%`
        }
      }
    });

    // Si no se encuentra, intentar búsqueda exacta
    if (!servicio) {
      console.log('🔍 Intentando búsqueda exacta...');
      servicio = await Servicio.findOne({
        where: {
          nombre: servicioEncontrado
        }
      });
    }

    // Si aún no se encuentra, crear el servicio
    if (!servicio) {
      console.log('🔧 Creando servicio en la base de datos...');
      try {
        servicio = await Servicio.create({
          nombre: servicioEncontrado,
          descripcion: `Servicio de ${servicioEncontrado}`,
          precio_base: 100000.00, // Precio por defecto
          estado: true
        });
        console.log('✅ Servicio creado:', servicio.nombre);
      } catch (error) {
        console.log('❌ Error al crear servicio:', error.message);
        return res.status(500).json({
          mensaje: "Error al crear servicio en la base de datos",
          error: error.message,
        });
      }
    } else {
      console.log('✅ Servicio encontrado en BD:', servicio.nombre);
    }

    console.log('✅ Servicio ID:', servicio.id_servicio);

    // Crear o encontrar el cliente primero
    const userId = req.user.id || req.user.id_usuario || 1;
    console.log('🔍 Debug - Usando userId:', userId);
    
    console.log('👤 Verificando/creando cliente...');
    let cliente = await Cliente.findOne({
      where: { id_usuario: userId },
      include: [{ model: Empresa, through: { attributes: [] } }]
    });

    if (!cliente) {
      console.log('🔧 Creando cliente...');
      cliente = await Cliente.create({
        id_usuario: userId,
        marca: req.body.nombre_marca || 'Pendiente',
        tipo_persona: req.body.tipo_titular === 'Persona Natural' ? 'Natural' : 'Jurídica',
        estado: true,
        origen: 'solicitud'
      });
      console.log('✅ Cliente creado con ID:', cliente.id_cliente, 'Origen: solicitud');
    } else {
      console.log('✅ Cliente existente con ID:', cliente.id_cliente);
      
      // Actualizar datos del cliente existente si se proporcionan
      const datosActualizacion = {};
      
      if (req.body.nombre_marca && req.body.nombre_marca !== 'Pendiente' && req.body.nombre_marca !== cliente.marca) {
        datosActualizacion.marca = req.body.nombre_marca;
      }
      
      if (req.body.tipo_titular && req.body.tipo_titular !== cliente.tipo_persona) {
        datosActualizacion.tipo_persona = req.body.tipo_titular === 'Persona Natural' ? 'Natural' : 'Jurídica';
      }
      
      // Validar datos del cliente antes de actualizar
      if (Object.keys(datosActualizacion).length > 0) {
        const erroresCliente = validarDatosCliente(datosActualizacion);
        if (erroresCliente.length > 0) {
          console.log('❌ Errores de validación en cliente:', erroresCliente);
          return res.status(400).json({
            success: false,
            mensaje: "Errores de validación en datos de cliente",
            errores: erroresCliente,
            timestamp: new Date().toISOString()
          });
        }
        
        try {
          await cliente.update(datosActualizacion);
          console.log('✅ Cliente actualizado:', datosActualizacion);
        } catch (error) {
          console.error('❌ Error al actualizar cliente:', error);
          return res.status(500).json({
            success: false,
            mensaje: "Error al actualizar datos del cliente",
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // Verificar/crear empresa basada en datos del formulario
    console.log('🏢 Verificando/creando empresa...');
    let empresa = null;
    
    // Buscar empresa por NIT si se proporciona
    if (req.body.nit) {
      empresa = await Empresa.findOne({
        where: { nit: req.body.nit }
      });
      console.log('🔍 Empresa encontrada por NIT:', empresa ? empresa.nombre : 'No encontrada');
    }
    
    // Si no se encuentra empresa por NIT, buscar por nombre
    if (!empresa && req.body.razon_social) {
      empresa = await Empresa.findOne({
        where: { nombre: req.body.razon_social }
      });
      console.log('🔍 Empresa encontrada por nombre:', empresa ? empresa.nombre : 'No encontrada');
    }
    
    // Si no existe empresa, crear una nueva con datos del formulario
    if (!empresa) {
      console.log('🔧 Creando empresa con datos del formulario...');
      const empresaData = {
        nit: req.body.nit || 9001234561,
        nombre: req.body.razon_social || req.body.nombre_empresa || 'Empresa del Cliente',
        tipo_empresa: req.body.tipo_empresa || 'SAS'
      };
      
      // Agregar campos adicionales si existen en el formulario
      if (req.body.direccion_empresa) empresaData.direccion = req.body.direccion_empresa;
      if (req.body.telefono_empresa) empresaData.telefono = req.body.telefono_empresa;
      if (req.body.correo_empresa) empresaData.email = req.body.correo_empresa;
      if (req.body.ciudad_empresa) empresaData.ciudad = req.body.ciudad_empresa;
      if (req.body.pais_empresa) empresaData.pais = req.body.pais_empresa;
      
      // Validar datos de empresa
      const erroresEmpresa = validarDatosEmpresa(empresaData);
      if (erroresEmpresa.length > 0) {
        console.log('❌ Errores de validación en empresa:', erroresEmpresa);
        return res.status(400).json({
          success: false,
          mensaje: "Errores de validación en datos de empresa",
          errores: erroresEmpresa,
          timestamp: new Date().toISOString()
        });
      }
      
      try {
        empresa = await Empresa.create(empresaData);
        console.log('✅ Empresa creada con ID:', empresa.id_empresa, 'Nombre:', empresa.nombre);
      } catch (error) {
        console.error('❌ Error al crear empresa:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({
            success: false,
            mensaje: "Ya existe una empresa con este NIT",
            error: "NIT duplicado",
            timestamp: new Date().toISOString()
          });
        }
        throw error;
      }
    } else {
      console.log('✅ Empresa existente con ID:', empresa.id_empresa, 'Nombre:', empresa.nombre);
    }
    
    // Asociar cliente con empresa si no están asociados
    if (empresa) {
      const asociacionExistente = await EmpresaCliente.findOne({
        where: {
          id_cliente: cliente.id_cliente,
          id_empresa: empresa.id_empresa
        }
      });
      
      if (!asociacionExistente) {
        await EmpresaCliente.create({
          id_cliente: cliente.id_cliente,
          id_empresa: empresa.id_empresa
        });
        console.log('✅ Asociación cliente-empresa creada');
      } else {
        console.log('✅ Asociación cliente-empresa ya existe');
      }
    }

    const ordenData = {
      id_cliente: cliente.id_cliente, // Usar el ID del cliente creado/encontrado
      id_servicio: servicio.id_servicio, // Usar el ID correcto del servicio
      id_empresa: empresa.id_empresa, // Usar el ID de la empresa creada/encontrada
      total_estimado: servicio.precio_base || 100000.00,
      pais: req.body.pais_titular || req.body.pais || "Colombia",
      ciudad: req.body.ciudad_titular || req.body.ciudad || "Bogotá",
      codigo_postal: req.body.codigo_postal || "110111",
      estado: "Pendiente",
      datos_solicitud: JSON.stringify(req.body), // Convertir a JSON string
      fecha_solicitud: new Date(),
    };
    
    console.log('🔍 Debug - ordenData:', ordenData);

    console.log('📝 Creando orden de servicio...');
    const nuevaOrden = await OrdenServicio.create(ordenData);
    console.log('✅ Orden creada:', nuevaOrden.id_orden_servicio);

    // Cliente ya fue creado/encontrado arriba

    console.log('🎉 Solicitud creada exitosamente');
    return res.status(201).json({
      success: true,
      mensaje: "Solicitud creada exitosamente",
      data: {
        orden_id: nuevaOrden.id_orden_servicio,
        servicio: servicioEncontrado,
        estado: "Pendiente",
        fecha_solicitud: nuevaOrden.fecha_solicitud,
        cliente: {
          id_cliente: cliente.id_cliente,
          marca: cliente.marca,
          tipo_persona: cliente.tipo_persona,
          estado: cliente.estado
        },
        empresa: empresa ? {
          id_empresa: empresa.id_empresa,
          nombre: empresa.nombre,
          nit: empresa.nit,
          tipo_empresa: empresa.tipo_empresa
        } : null
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "2.2",
        nextSteps: [
          "La solicitud está pendiente de revisión",
          "Se notificará por email el estado de la solicitud",
          "Puede consultar el estado en cualquier momento"
        ]
      }
    });

  } catch (error) {
    console.error('💥 Error en crearSolicitud:', error);
    return res.status(500).json({
      mensaje: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : "Error interno",
    });
  }
};

// Exportar las demás funciones del controlador original
export const listarSolicitudes = async (req, res) => {
  try {
    let solicitudes;

    if (req.user.role === "cliente") {
      solicitudes = await solicitudesService.listarSolicitudesPorUsuario(req.user.id);
    } else {
      solicitudes = await solicitudesService.listarSolicitudes();
    }

    res.json(solicitudes);
  } catch (error) {
    console.error("Error al listar solicitudes:", error);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
};

export const buscarSolicitud = async (req, res) => {
  try {
    const { search } = req.query;
    const solicitudes = await solicitudesService.buscarSolicitud(search);
    res.json(solicitudes);
  } catch (error) {
    console.error("Error al buscar solicitudes:", error);
    if (error.message.includes("El parámetro de búsqueda es requerido")) {
      res.status(400).json({ mensaje: error.message });
    } else if (error.message.includes("No se encontraron coincidencias")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

export const verDetalleSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesService.verDetalleSolicitud(id);

    if (req.user.role === "cliente" && solicitud.usuario_id !== req.user.id) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para ver esta solicitud." });
    }

    res.json(solicitud);
  } catch (error) {
    console.error("Error al ver detalle de solicitud:", error);
    if (error.message.includes("Solicitud no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

export const anularSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesService.anularSolicitud(id);
    res.json(solicitud);
  } catch (error) {
    console.error("Error al anular solicitud:", error);
    if (error.message.includes("Solicitud no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};

export const editarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await solicitudesService.editarSolicitud(id, req.body);
    res.json(solicitud);
  } catch (error) {
    console.error("Error al editar solicitud:", error);
    if (error.message.includes("Solicitud no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ mensaje: "Error interno del servidor." });
    }
  }
};
