import { SolicitudesService } from "../services/solicitudes.service.js";
import { OrdenServicio, Servicio, Cliente, User, Empresa } from "../models/associations.js";
import EmpresaCliente from "../models/EmpresaCliente.js";
import DetalleOrdenServicio from "../models/DetalleOrdenServicio.js";
import Proceso from "../models/Proceso.js";
import { sendNuevaSolicitudCliente, sendAsignacionCliente, sendNuevaAsignacionEmpleado, sendReasignacionEmpleado } from "../services/email.service.js";
import Empleado from "../models/Empleado.js";
import { Op } from "sequelize";

const solicitudesService = new SolicitudesService();

// Función para transformar solicitud a formato frontend con TODOS los campos necesarios
const transformarSolicitudAFrontend = (ordenServicio) => {
  const sol = ordenServicio;
  
  // Extraer nombre del titular de múltiples fuentes
  const titular = sol.nombrecompleto || 
                 sol.nombre_completo ||
                 (sol.cliente?.Usuario ? 
                   `${sol.cliente.Usuario.nombre} ${sol.cliente.Usuario.apellido}` : 
                   'Sin titular');
  
  // Extraer nombre de la marca
  const marca = sol.nombredelamarca || 
               sol.nombre_marca || 
               sol.marca ||
               sol.cliente?.marca ||
               'Sin marca';
  
  // Extraer email
  const email = sol.correoelectronico || 
               sol.correo || 
               sol.cliente?.Usuario?.correo || 
               '';
  
  // Extraer teléfono (solo está disponible en la tabla ordenes_de_servicios)
  const telefono = sol.telefono || '';
  
  // Extraer encargado
  const encargado = sol.empleado_asignado ? 
                   `${sol.empleado_asignado.nombre} ${sol.empleado_asignado.apellido}` : 
                   'Sin asignar';
  
  // Extraer información de empresa (soporte para alias en minúscula y mayúscula)
  const empresaData = sol.empresa || sol.Empresa;
  
  // *** RETORNAR OBJETO CON TODOS LOS CAMPOS ***
  return {
    // Campos básicos
    id: sol.id_orden_servicio?.toString(),
    expediente: sol.numero_expediente || `EXP-${sol.id_orden_servicio}`,
    titular: titular,
    marca: marca,
    tipoSolicitud: sol.servicio?.nombre || 'Sin servicio',
    encargado: encargado,
    estado: sol.estado || 'Pendiente',
    email: email,
    telefono: telefono,
    
    // *** CAMPOS CRÍTICOS PARA EL FRONTEND ***
    
    // Ubicación
    pais: sol.pais || '',
    ciudad: sol.ciudad || '',
    direccion: sol.direccion || '',
    codigo_postal: sol.codigo_postal || '',
    
    // Documento del titular
    tipoDocumento: sol.tipodedocumento || '',
    numeroDocumento: sol.numerodedocumento || '',
    tipoPersona: sol.tipodepersona || '',
    nombreCompleto: titular,
    
    // Datos de empresa (si aplica)
    tipoEntidad: sol.tipodeentidadrazonsocial || '',
    nombreEmpresa: sol.nombredelaempresa || empresaData?.nombre || '',
    razonSocial: sol.nombredelaempresa || empresaData?.nombre || '',
    nit: sol.nit || empresaData?.nit || '',
    
    // Marca/Producto
    nombreMarca: sol.nombredelamarca || marca,
    categoria: sol.clase_niza || sol.categoria || '',
    clase_niza: sol.clase_niza || '',
    tipoProductoServicio: sol.tipo_producto_servicio || '',
    logotipo: sol.logotipo || null,
    
    // Tipo de solicitante
    tipoSolicitante: sol.tipo_solicitante || sol.tipodepersona || '',
    representanteLegal: sol.representante_legal || '',
    
    // Fechas
    fechaCreacion: sol.fecha_creacion || sol.fecha_solicitud || sol.createdAt,
    fechaFin: sol.fecha_finalizacion || sol.fecha_fin || null,
    
    // Archivos/Documentos (si existen)
    poderRepresentante: sol.poderdelrepresentanteautorizado || null,
    poderAutorizacion: sol.poderparaelregistrodelamarca || null,
    certificadoCamara: sol.certificado_camara_comercio || null,
    logotipoMarca: sol.logotipo || sol.logo || null,
    
    // *** FASE 2: CAMPOS IMPORTANTES ***
    certificadoRenovacion: sol.certificado_renovacion || null,
    documentoCesion: sol.documento_cesion || null,
    documentosOposicion: sol.documentos_oposicion || null,
    soportes: sol.soportes || null,
    numeroExpedienteMarca: sol.numero_expediente_marca || '',
    marcaAOponerse: sol.marca_a_oponerse || '',
    marcaOpositora: sol.marca_opositora || '',
    numeroRegistroExistente: sol.numero_registro_existente || '',
    
    // *** FASE 3: CAMPOS ESPECÍFICOS ***
    // Cesionario (objeto anidado)
    cesionario: sol.nombre_razon_social_cesionario ? {
      nombreRazonSocial: sol.nombre_razon_social_cesionario,
      nit: sol.nit_cesionario || '',
      tipoDocumento: sol.tipo_documento_cesionario || '',
      numeroDocumento: sol.numero_documento_cesionario || '',
      correo: sol.correo_cesionario || '',
      telefono: sol.telefono_cesionario || '',
      direccion: sol.direccion_cesionario || '',
      representanteLegal: sol.representante_legal_cesionario || ''
    } : null,
    // Campos adicionales
    argumentosRespuesta: sol.argumentos_respuesta || '',
    descripcionNuevosProductos: sol.descripcion_nuevos_productos_servicios || '',
    claseNizaActual: sol.clase_niza_actual || '',
    nuevasClasesNiza: sol.nuevas_clases_niza || '',
    documentoNitTitular: sol.documento_nit_titular || '',
    numeroNitCedula: sol.numero_nit_cedula || '',
    
    // IDs para relaciones
    id_cliente: sol.id_cliente,
    id_empresa: sol.id_empresa,
    id_empleado_asignado: sol.id_empleado_asignado,
    id_servicio: sol.id_servicio,
    
    // Comentarios/Seguimiento
    comentarios: sol.comentarios || []
  };
};

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
  "Búsqueda de Antecedentes": [
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nombre_a_buscar",
    "tipo_producto_servicio",
    "logotipo",
  ],
  "Registro de Marca (Certificación de marca)": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "numero_nit_cedula",
    "nombre_marca",
    "tipo_producto_servicio",
    "certificado_camara_comercio",
    "logotipo",
    "poder_autorizacion",
    "tipo_entidad",
    "razon_social",
    "nit_empresa",
    "representante_legal",
    "direccion_domicilio",
  ],
  "Renovación de Marca": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nombre_marca",
    "numero_expediente_marca",
    "poder_autorizacion",
    "tipo_entidad",
    "razon_social",
    "nit_empresa",
    "representante_legal",
    "certificado_renovacion",
    "logotipo",
  ],
  "Cesión de Marca": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nombre_marca",
    "numero_expediente_marca",
    "documento_cesion",
    "poder_autorizacion",
    "nombre_razon_social_cesionario",
    "nit_cesionario",
    "representante_legal_cesionario",
    "tipo_documento_cesionario",
    "numero_documento_cesionario",
    "correo_cesionario",
    "telefono_cesionario",
    "direccion_cesionario",
  ],
  "Presentación de Oposición": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nit_empresa",
    "nombre_marca",
    "marca_a_oponerse",
    "poder_autorizacion",
    "tipo_entidad",
    "razon_social",
    "representante_legal",
    "argumentos_respuesta",
    "documentos_oposicion",
  ],
  "Respuesta de Oposición": [
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nit_empresa",
    "nombre_marca",
    "numero_expediente_marca",
    "marca_opositora",
    "poder_autorizacion",
    "razon_social",
    "representante_legal",
  ],
  "Ampliación de Alcance": [
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
    "descripcion_nuevos_productos_servicios",
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

    console.log('✅ Usuario autenticado:', req.user.id_usuario, req.user.rol);
    console.log('🔍 Debug - req.user.id_usuario:', req.user.id_usuario);
    console.log('🔍 Debug - req.user.rol:', req.user.rol);

    // Obtener el ID del servicio
    const servicioId = req.params.servicio;
    if (!servicioId) {
      console.log('❌ ID de servicio no proporcionado');
      return res.status(400).json({
        mensaje: "ID de servicio requerido",
        error: "El parámetro 'servicio' es obligatorio"
      });
    }

    console.log('🔍 ID de servicio:', servicioId);

    // Buscar el servicio por ID en la base de datos
    const servicioService = await import("../services/servicio.service.js");
    let servicioEncontrado;
    
    try {
      const result = await servicioService.default.getServicioById(servicioId);
      servicioEncontrado = result.data;
      console.log('✅ Servicio encontrado:', servicioEncontrado.nombre);
    } catch (error) {
      console.log('❌ Servicio no encontrado:', error.message);
      return res.status(404).json({
        mensaje: "Servicio no encontrado",
        servicio: servicioId,
        error: "El servicio solicitado no está disponible"
      });
    }

    // Obtener campos requeridos específicos para el servicio
    const camposRequeridos = requiredFields[servicioEncontrado.nombre] || [];
    console.log('📋 Campos requeridos para', servicioEncontrado.nombre, ':', camposRequeridos);

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

    // 🚀 NUEVA LÓGICA: Manejo inteligente según el rol del usuario
    let clienteId, empresaId;
    
    if (req.user.rol === 'cliente') {
      // Para clientes: usar automáticamente su ID, no pedir id_cliente/id_empresa
      clienteId = req.user.id_usuario;
      empresaId = req.body.id_empresa; // Opcional para clientes
      console.log('👤 Cliente autenticado - Usando ID automático:', clienteId);
    } else if (req.user.rol === 'administrador' || req.user.rol === 'empleado') {
      // Para administradores/empleados: requerir id_cliente/id_empresa
      if (!req.body.id_cliente) {
        return res.status(400).json({
          success: false,
          mensaje: "Para administradores/empleados se requiere id_cliente",
          timestamp: new Date().toISOString()
        });
      }
      clienteId = req.body.id_cliente;
      empresaId = req.body.id_empresa;
      console.log('👨‍💼 Administrador/Empleado - Usando IDs proporcionados:', { clienteId, empresaId });
    } else {
      return res.status(403).json({
        success: false,
        mensaje: "Rol no autorizado para crear solicitudes",
        timestamp: new Date().toISOString()
      });
    }

    // Usar el servicio que ya encontramos por ID
    const servicio = {
      id_servicio: parseInt(servicioId),
      nombre: servicioEncontrado.nombre
    };

    console.log('✅ Servicio ID:', servicio.id_servicio);

    // Crear o encontrar el cliente primero
    console.log('🔍 Debug - Usando clienteId:', clienteId);
    
    console.log('👤 Verificando/creando cliente...');
    let cliente = await Cliente.findOne({
      where: { id_usuario: clienteId },
      include: [
        { model: Empresa, as: 'Empresas', through: { attributes: [] } },
        { model: User, as: 'Usuario' }
      ]
    });

    if (!cliente) {
      console.log('🔧 Creando cliente...');
      cliente = await Cliente.create({
        id_usuario: clienteId,
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
    
    // 🚀 NUEVO: Verificar si el cliente YA tiene una empresa asociada
    if (cliente.Empresas && cliente.Empresas.length > 0) {
      console.log('🔍 Cliente ya tiene empresa asociada:', cliente.Empresas[0].nombre);
      empresa = cliente.Empresas[0]; // Usar la empresa existente
    }
    
    // Si se proporciona empresaId, buscar por ID primero
    if (!empresa && empresaId) {
      empresa = await Empresa.findByPk(empresaId);
      console.log('🔍 Empresa encontrada por ID:', empresa ? empresa.nombre : 'No encontrada');
    }
    
    // Buscar empresa por NIT si se proporciona y no se encontró por ID
    if (!empresa && req.body.nit) {
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
    if (!empresa && (req.body.razon_social || req.body.nombre_empresa)) {
      console.log('🔧 Creando empresa con datos del formulario...');
      
      // Generar NIT único si no se proporciona
      let nitEmpresa = req.body.nit_empresa || req.body.nit;
      if (!nitEmpresa) {
        // Generar NIT único de exactamente 10 dígitos
        const timestamp = Date.now().toString();
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        // Usar últimos 6 dígitos del timestamp + 4 dígitos aleatorios = 10 dígitos exactos
        nitEmpresa = parseInt((timestamp.slice(-6) + randomPart).padStart(10, '0'));
        console.log('🔧 NIT generado automáticamente:', nitEmpresa);
      }
      
      const empresaData = {
        nit: nitEmpresa,
        nombre: req.body.razon_social || req.body.nombre_empresa || 'Empresa del Cliente',
        tipo_empresa: req.body.tipo_entidad || req.body.tipo_empresa || 'SAS'
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
          // Si el NIT generado también existe, generar uno nuevo
          if (error.errors && error.errors.some(e => e.path === 'nit')) {
            console.log('🔄 NIT duplicado, generando uno nuevo...');
            // Generar NIT único de exactamente 10 dígitos
            const timestamp = Date.now().toString();
            const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            empresaData.nit = parseInt((timestamp.slice(-7) + randomPart).padStart(10, '0'));
            console.log('🔧 Nuevo NIT generado:', empresaData.nit);
            
            try {
              empresa = await Empresa.create(empresaData);
              console.log('✅ Empresa creada con nuevo NIT:', empresa.id_empresa);
            } catch (secondError) {
              console.error('❌ Error al crear empresa con nuevo NIT:', secondError);
              return res.status(500).json({
                success: false,
                mensaje: "Error al crear empresa. Intente nuevamente.",
                error: "Error interno al generar NIT único",
                timestamp: new Date().toISOString()
              });
            }
          } else {
          return res.status(400).json({
            success: false,
            mensaje: "Ya existe una empresa con este NIT",
            error: "NIT duplicado",
            timestamp: new Date().toISOString()
          });
        }
        } else {
        throw error;
        }
      }
    } else {
      console.log('✅ Empresa existente con ID:', empresa.id_empresa, 'Nombre:', empresa.nombre);
    }
    
    // Si NO se encontró empresa por NIT/nombre, usar empresa del cliente si existe
    if (!empresa && cliente.Empresas && cliente.Empresas.length > 0) {
      empresa = cliente.Empresas[0];
      console.log('✅ Usando empresa existente del cliente:', empresa.nombre);
    }
    
    // Si SIGUE sin haber empresa, crear una empresa por defecto
    if (!empresa) {
      console.log('⚠️ No se encontró empresa, creando empresa por defecto...');
      
      // Generar NIT único de exactamente 10 dígitos
      const timestamp = Date.now().toString();
      const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const nitDefecto = parseInt((timestamp.slice(-6) + randomPart).padStart(10, '0'));
      
      empresa = await Empresa.create({
        nit: nitDefecto,
        nombre: 'Empresa del Cliente',
        tipo_empresa: 'SAS'
      });
      
      console.log('✅ Empresa por defecto creada con ID:', empresa.id_empresa);
    }
    
    // Asociar cliente con empresa si no están asociados
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

    // 🚀 MAPEAR CAMPOS DEL FORMULARIO A COLUMNAS DE LA BD
    const ordenData = {
      id_cliente: cliente.id_cliente,
      id_servicio: servicio.id_servicio,
      id_empresa: empresa.id_empresa,
      total_estimado: servicio.precio_base || 100000.00,
      pais: req.body.pais_titular || req.body.pais || req.body.pais_residencia || "Colombia",
      ciudad: req.body.ciudad_titular || req.body.ciudad || req.body.ciudad_residencia || "Bogotá",
      codigo_postal: req.body.codigo_postal || "110111",
      estado: "Pendiente",
      
      // *** MAPEO DE CAMPOS DEL FORMULARIO ***
      tipodepersona: req.body.tipo_solicitante || req.body.tipo_persona,
      tipodedocumento: req.body.tipo_documento,
      numerodedocumento: req.body.numero_documento,
      nombrecompleto: req.body.nombres_apellidos || req.body.nombre_completo || req.body.nombre_representante,
      correoelectronico: req.body.correo || req.body.correo_electronico,
      telefono: req.body.telefono,
      direccion: req.body.direccion || req.body.direccion_domicilio,
      tipodeentidadrazonsocial: req.body.tipo_entidad || req.body.tipo_entidad_razon_social,
      nombredelaempresa: req.body.nombre_empresa || req.body.razon_social,
      nit: req.body.nit_empresa || req.body.nit,
      poderdelrepresentanteautorizado: req.body.poder_representante_autorizado || req.body.poder_autorizacion,
      poderparaelregistrodelamarca: req.body.poder_registro_marca,
      
      // *** FASE 1: CAMPOS CRÍTICOS (28 Oct 2025) ***
      // Campos de Marca/Producto
      nombredelamarca: req.body.nombre_marca || req.body.nombre_a_buscar,
      clase_niza: req.body.clase_niza || req.body.clase_niza_actual,
      tipo_producto_servicio: req.body.tipo_producto_servicio,
      // Campos de Documentos
      logotipo: req.body.logotipo,
      // ✨ Campos de Representantes
      representante_legal: req.body.representante_legal,
      
      // *** FASE 2: CAMPOS IMPORTANTES (28 Oct 2025) ***
      // Documentos adicionales
      certificado_camara_comercio: req.body.certificado_camara_comercio,
      certificado_renovacion: req.body.certificado_renovacion,
      documento_cesion: req.body.documento_cesion,
      documentos_oposicion: req.body.documentos_oposicion,
      soportes: req.body.soportes,
      // Expedientes y referencias
      numero_expediente_marca: req.body.numero_expediente_marca,
      marca_a_oponerse: req.body.marca_a_oponerse,
      marca_opositora: req.body.marca_opositora,
      numero_registro_existente: req.body.numero_registro_existente,
      
      // *** FASE 3: CAMPOS ESPECÍFICOS (28 Oct 2025) ***
      // Campos de Cesionario
      nombre_razon_social_cesionario: req.body.nombre_razon_social_cesionario || req.body.nombre_cesionario,
      nit_cesionario: req.body.nit_cesionario,
      tipo_documento_cesionario: req.body.tipo_documento_cesionario,
      numero_documento_cesionario: req.body.numero_documento_cesionario,
      correo_cesionario: req.body.correo_cesionario,
      telefono_cesionario: req.body.telefono_cesionario,
      direccion_cesionario: req.body.direccion_cesionario,
      representante_legal_cesionario: req.body.representante_legal_cesionario,
      // Campos de Argumentos/Descripción
      argumentos_respuesta: req.body.argumentos_respuesta,
      descripcion_nuevos_productos_servicios: req.body.descripcion_nuevos_productos_servicios,
      // Campos de Clases Niza
      clase_niza_actual: req.body.clase_niza_actual,
      nuevas_clases_niza: req.body.nuevas_clases_niza,
      // Otros campos
      documento_nit_titular: req.body.documento_nit_titular,
      numero_nit_cedula: req.body.numero_nit_cedula || req.body.cedula,
      
      datos_solicitud: JSON.stringify(req.body),
      fecha_solicitud: new Date(),
    };
    
    console.log('🔍 Debug - ordenData:', ordenData);

    console.log('📝 Creando orden de servicio...');
    const nuevaOrden = await OrdenServicio.create(ordenData);
    console.log('✅ Orden creada:', nuevaOrden.id_orden_servicio);

    // 🚀 NUEVA FUNCIONALIDAD: Asignar primer estado del servicio
    console.log('🔄 Asignando primer estado del servicio...');
    console.log('🔍 Debug - Servicio ID:', servicio.id_servicio);
    console.log('🔍 Debug - Orden ID:', nuevaOrden.id_orden_servicio);
    
    try {
      // Obtener los process_states del servicio ordenados por order_number
      const procesos = await Proceso.findAll({
        where: { servicio_id: servicio.id_servicio },
        order: [['order_number', 'ASC']]
      });
      
      console.log('🔍 Debug - Procesos encontrados:', procesos.length);
      procesos.forEach((p, index) => {
        console.log(`   ${index + 1}. ${p.nombre} (order: ${p.order_number})`);
      });
      
      if (procesos.length > 0) {
        const primerProceso = procesos[0];
        console.log('✅ Primer proceso encontrado:', primerProceso.nombre);
        
        // Crear registro en DetalleOrdenServicio con el primer proceso
        const detalleOrden = await DetalleOrdenServicio.create({
          id_orden_servicio: nuevaOrden.id_orden_servicio,
          id_servicio: servicio.id_servicio,
          estado: primerProceso.nombre, // Usar directamente el nombre del proceso
          fecha_estado: new Date()
        });
        
        console.log('✅ Proceso inicial asignado:', detalleOrden.estado);
        console.log('🔍 Debug - DetalleOrden ID:', detalleOrden.id_detalle_orden);
        
        // Actualizar el estado de la orden principal
        await nuevaOrden.update({ estado: primerProceso.nombre });
        console.log('✅ Estado de orden actualizado:', primerProceso.nombre);
        
      } else {
        console.log('⚠️ No se encontraron procesos para el servicio, usando estado por defecto');
        
        // Si no hay procesos, usar estado por defecto
        const detalleOrden = await DetalleOrdenServicio.create({
          id_orden_servicio: nuevaOrden.id_orden_servicio,
          id_servicio: servicio.id_servicio,
          estado: "Pendiente",
          fecha_estado: new Date()
        });
        
        console.log('✅ Estado por defecto asignado: Pendiente');
        console.log('🔍 Debug - DetalleOrden ID:', detalleOrden.id_detalle_orden);
      }
      
    } catch (error) {
      console.error('❌ Error al asignar estado inicial:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      // No fallar la creación de la solicitud por este error
      console.log('⚠️ Continuando sin asignar estado inicial');
    }

    // Cliente ya fue creado/encontrado arriba

    // 🚀 NUEVA FUNCIONALIDAD: Enviar email al cliente
    try {
      // Usar la información del usuario que ya tenemos en cliente.Usuario
      console.log('🔍 Debug - Cliente tiene Usuario:', !!cliente.Usuario);
      if (cliente.Usuario) {
        console.log('🔍 Debug - Usuario correo:', cliente.Usuario.correo);
        console.log('🔍 Debug - Usuario nombre:', cliente.Usuario.nombre);
        console.log('🔍 Debug - Usuario apellido:', cliente.Usuario.apellido);
      }
      
      if (cliente.Usuario && cliente.Usuario.correo) {
        console.log('📧 Enviando email a:', cliente.Usuario.correo);
        await sendNuevaSolicitudCliente(
          cliente.Usuario.correo,
          `${cliente.Usuario.nombre} ${cliente.Usuario.apellido}`,
          {
            orden_id: nuevaOrden.id_orden_servicio,
            servicio_nombre: servicio.nombre,
            empleado_nombre: 'Pendiente de asignación',
            estado_actual: nuevaOrden.estado,
            fecha_creacion: nuevaOrden.fecha_creacion
          }
        );
        console.log('✅ Email enviado al cliente:', cliente.Usuario.correo);
      } else {
        console.log('⚠️ No se pudo obtener información del usuario para enviar email');
        console.log('⚠️ Cliente tiene Usuario:', !!cliente.Usuario);
        console.log('⚠️ Usuario tiene correo:', cliente.Usuario ? !!cliente.Usuario.correo : false);
      }
    } catch (emailError) {
      console.error('❌ Error al enviar email al cliente:', emailError);
      // No fallar la operación por error de email
    }

    console.log('🎉 Solicitud creada exitosamente');
    return res.status(201).json({
      success: true,
      mensaje: "Solicitud creada exitosamente",
      data: {
      orden_id: nuevaOrden.id_orden_servicio,
      servicio: servicioEncontrado,
      estado: nuevaOrden.estado, // Usar el estado actualizado (nombre del proceso)
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

/**
 * GET /api/gestion-solicitudes
 * Lista todas las solicitudes con TODOS los campos necesarios para el frontend
 */
export const listarSolicitudes = async (req, res) => {
  try {
    console.log('📋 [API] Listando solicitudes para rol:', req.user.rol);
    
    let solicitudes;

    if (req.user.rol === "cliente") {
      // Cliente: solo sus solicitudes
      // Primero buscar el cliente asociado al usuario
      const cliente = await Cliente.findOne({
        where: { id_usuario: req.user.id_usuario }
      });
      
      if (!cliente) {
        return res.json([]); // No hay cliente asociado, retornar array vacío
      }
      
      solicitudes = await OrdenServicio.findAll({
        where: { id_cliente: cliente.id_cliente },
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [{ 
              model: User,
              as: 'Usuario',
              attributes: ['nombre', 'apellido', 'correo']
            }]
          },
          {
            model: Servicio,
            as: 'servicio',
            attributes: ['id_servicio', 'nombre', 'descripcion_corta']
          },
          {
            model: User,
            as: 'empleado_asignado',
            required: false,
            attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
          },
          {
            model: Empresa,
            as: 'empresa',
            required: false,
            attributes: ['id_empresa', 'nombre', 'nit', 'direccion']
          }
        ],
        order: [['fecha_creacion', 'DESC']]
      });
    } else {
      // Admin/Empleado: todas las solicitudes
      solicitudes = await OrdenServicio.findAll({
        include: [
          {
            model: Cliente,
            as: 'cliente',
            include: [{ 
              model: User,
              as: 'Usuario',
              attributes: ['nombre', 'apellido', 'correo']
            }]
          },
          {
            model: Servicio,
            as: 'servicio',
            attributes: ['id_servicio', 'nombre', 'descripcion_corta']
          },
          {
            model: User,
            as: 'empleado_asignado',
            required: false,
            attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
          },
          {
            model: Empresa,
            as: 'empresa',
            required: false,
            attributes: ['id_empresa', 'nombre', 'nit', 'direccion']
          }
        ],
        order: [['fecha_creacion', 'DESC']]
      });
    }

    // Convertir a JSON para facilitar el mapeo
    const solicitudesJSON = solicitudes.map(sol => sol.toJSON());

    // Transformar a formato frontend con TODOS los campos
    const solicitudesFormateadas = solicitudesJSON.map(solicitud => 
      transformarSolicitudAFrontend(solicitud)
    );

    // Log para verificación (se puede comentar en producción)
    console.log(`✅ [API] Solicitudes enviadas: ${solicitudesFormateadas.length}`);
    if (solicitudesFormateadas.length > 0) {
      console.log('✅ [API] Campos en primera solicitud:', Object.keys(solicitudesFormateadas[0]).length);
      console.log('✅ [API] Campos incluidos:', Object.keys(solicitudesFormateadas[0]));
    }

    res.json(solicitudesFormateadas);
  } catch (error) {
    console.error("❌ [API] Error al listar solicitudes:", error);
    res.status(500).json({ 
      mensaje: "Error interno del servidor.",
      error: error.message 
    });
  }
};

/**
 * GET /api/gestion-solicitudes/buscar
 * Busca solicitudes con TODOS los campos necesarios para el frontend
 */
export const buscarSolicitud = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.trim() === '') {
      return res.status(400).json({ 
        mensaje: "El parámetro de búsqueda es requerido" 
      });
    }

    console.log('🔍 [API] Buscando solicitudes con término:', search);

    // Buscar solicitudes
    const solicitudes = await OrdenServicio.findAll({
      where: {
        [Op.or]: [
          { numero_expediente: { [Op.like]: `%${search}%` } },
          { nombrecompleto: { [Op.like]: `%${search}%` } },
          { correoelectronico: { [Op.like]: `%${search}%` } },
          { estado: { [Op.like]: `%${search}%` } },
          { nombredelaempresa: { [Op.like]: `%${search}%` } },
          { nit: { [Op.like]: `%${search}%` } }
        ]
      },
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [{ 
            model: User,
            as: 'usuario',
            attributes: ['nombre', 'apellido', 'correo']
          }]
        },
        {
          model: Servicio,
          as: 'servicio',
          attributes: ['id_servicio', 'nombre', 'descripcion_corta']
        },
        {
          model: User,
          as: 'empleado_asignado',
          required: false,
          attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
        },
        {
          model: Empresa,
          as: 'empresa',
          required: false,
          attributes: ['id_empresa', 'nombre', 'nit', 'direccion']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    if (solicitudes.length === 0) {
      return res.status(404).json({ 
        mensaje: "No se encontraron coincidencias para la búsqueda" 
      });
    }

    // Convertir a JSON y transformar al formato frontend
    const solicitudesJSON = solicitudes.map(sol => sol.toJSON());
    const solicitudesFormateadas = solicitudesJSON.map(solicitud => 
      transformarSolicitudAFrontend(solicitud)
    );

    console.log(`✅ [API] Se encontraron ${solicitudesFormateadas.length} solicitudes`);

    res.json(solicitudesFormateadas);
  } catch (error) {
    console.error("❌ [API] Error al buscar solicitudes:", error);
    res.status(500).json({ 
      mensaje: "Error interno del servidor.",
      error: error.message 
    });
  }
};

/**
 * GET /api/gestion-solicitudes/:id
 * Obtiene una solicitud específica con TODOS los campos necesarios
 */
export const verDetalleSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 [API] Obteniendo detalle de solicitud ID:', id);
    
    // Obtener la solicitud con todas las relaciones
    const solicitud = await OrdenServicio.findByPk(id, {
      include: [
        {
          model: Cliente,
          as: 'cliente',
          include: [{ 
            model: User,
            as: 'Usuario',
            attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
          }]
        },
        {
          model: Servicio,
          as: 'servicio',
          attributes: ['id_servicio', 'nombre', 'descripcion_corta', 'precio_base']
        },
        {
          model: User,
          as: 'empleado_asignado',
          required: false,
          attributes: ['id_usuario', 'nombre', 'apellido', 'correo']
        },
        {
          model: Empresa,
          as: 'empresa',
          required: false,
          attributes: ['id_empresa', 'nombre', 'nit', 'direccion', 'telefono', 'email']
        }
      ]
    });

    if (!solicitud) {
      return res.status(404).json({ 
        mensaje: "Solicitud no encontrada" 
      });
    }

    // Verificar permisos para clientes
    if (req.user.rol === "cliente" && solicitud.id_cliente !== req.user.id_usuario) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para ver esta solicitud." });
    }

    // Convertir a JSON y transformar al formato frontend
    const solicitudJSON = solicitud.toJSON();
    const solicitudFormateada = transformarSolicitudAFrontend(solicitudJSON);

    console.log('✅ [API] Detalle de solicitud enviado con', Object.keys(solicitudFormateada).length, 'campos');

    res.json(solicitudFormateada);
  } catch (error) {
    console.error("❌ [API] Error al ver detalle de solicitud:", error);
    if (error.message.includes("Solicitud no encontrada")) {
      res.status(404).json({ mensaje: error.message });
    } else {
      res.status(500).json({ 
        mensaje: "Error interno del servidor.",
        error: error.message 
      });
    }
  }
};

export const anularSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    // Validar que se envió motivo
    if (!motivo || motivo.trim() === '') {
      return res.status(400).json({
        success: false,
        mensaje: "El motivo de anulación es obligatorio",
        detalles: "Debe proporcionar un motivo claro de por qué se anula la solicitud (mínimo 10 caracteres)",
        timestamp: new Date().toISOString()
      });
    }

    // Validar longitud del motivo
    if (motivo.trim().length < 10) {
      return res.status(400).json({
        success: false,
        mensaje: "El motivo debe tener al menos 10 caracteres",
        timestamp: new Date().toISOString()
      });
    }

    if (motivo.trim().length > 500) {
      return res.status(400).json({
        success: false,
        mensaje: "El motivo no puede exceder 500 caracteres",
        timestamp: new Date().toISOString()
      });
    }

    // Preparar datos de anulación
    const datosAnulacion = {
      usuario_id: req.user.id_usuario,
      motivo: motivo.trim()
    };

    console.log('🚫 Anulando solicitud:', { 
      id, 
      usuario: `${req.user.nombre} ${req.user.apellido}`,
      rol: req.user.rol,
      motivo: datosAnulacion.motivo.substring(0, 50) + '...'
    });

    // Anular solicitud
    const resultado = await solicitudesService.anularSolicitud(id, datosAnulacion);
    
    res.json(resultado);
    
  } catch (error) {
    console.error("❌ Error al anular solicitud:", error.message);
    
    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ 
        success: false,
        mensaje: "Solicitud no encontrada",
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.message.includes("ya está anulada")) {
      return res.status(400).json({ 
        success: false,
        mensaje: "La solicitud ya está anulada",
        detalles: "No se puede anular una solicitud que ya ha sido anulada previamente",
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.message.includes("finalizada")) {
      return res.status(400).json({ 
        success: false,
        mensaje: "No se puede anular una solicitud finalizada",
        detalles: "Las solicitudes finalizadas no pueden ser anuladas",
        timestamp: new Date().toISOString()
      });
    }
    
    if (error.message.includes("motivo")) {
      return res.status(400).json({ 
        success: false,
        mensaje: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({ 
      success: false,
      mensaje: "Error interno del servidor al anular la solicitud",
      timestamp: new Date().toISOString()
    });
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

// 🚀 NUEVOS ENDPOINTS: Para manejo de estados

// Obtener estados disponibles de un servicio
export const obtenerEstadosDisponibles = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener la orden de servicio con el servicio asociado
    const ordenServicio = await OrdenServicio.findByPk(id, {
      include: [{
        model: Servicio,
        as: 'servicio',
        include: [{
          model: Proceso,
          as: 'process_states',
          order: [['order_number', 'ASC']]
        }]
      }]
    });
    
    if (!ordenServicio) {
      return res.status(404).json({
        success: false,
        mensaje: "Solicitud no encontrada"
      });
    }
    
    // Obtener el estado actual de la solicitud
    const estadoActual = await DetalleOrdenServicio.findOne({
      where: { id_orden_servicio: id },
      order: [['fecha_estado', 'DESC']]
    });
    
    console.log('🔍 Debug - Orden ID:', id);
    console.log('🔍 Debug - Estado actual encontrado:', estadoActual ? estadoActual.estado : 'No encontrado');
    console.log('🔍 Debug - Fecha estado:', estadoActual ? estadoActual.fecha_estado : 'N/A');
    
    res.json({
      success: true,
      data: {
        solicitud_id: id,
        servicio: ordenServicio.servicio.nombre,
        estado_actual: estadoActual ? estadoActual.estado : 'Sin estado',
        estados_disponibles: ordenServicio.servicio.process_states.map(proceso => ({
          id: proceso.id_proceso,
          nombre: proceso.nombre,
          descripcion: proceso.descripcion,
          order_number: proceso.order_number,
          status_key: proceso.status_key
        }))
      }
    });
    
  } catch (error) {
    console.error("Error al obtener estados disponibles:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor"
    });
  }
};

// Obtener estado actual de una solicitud
export const obtenerEstadoActual = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el estado actual de la solicitud
    const estadoActual = await DetalleOrdenServicio.findOne({
      where: { id_orden_servicio: id },
      order: [['fecha_estado', 'DESC']],
      include: [{
        model: Servicio,
        as: 'servicio'
      }]
    });
    
    if (!estadoActual) {
      return res.status(404).json({
        success: false,
        mensaje: "No se encontró estado para esta solicitud"
      });
    }
    
    res.json({
      success: true,
      data: {
        solicitud_id: id,
        estado_actual: estadoActual.estado,
        fecha_estado: estadoActual.fecha_estado,
        servicio: estadoActual.servicio.nombre
      }
    });
    
  } catch (error) {
    console.error("Error al obtener estado actual:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor"
    });
  }
};

// 🚀 NUEVAS FUNCIONES: Asignación de empleados

// Asignar empleado a solicitud
export const asignarEmpleado = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_empleado } = req.body;

    // Validar que el empleado existe y está activo
    const empleado = await Empleado.findByPk(id_empleado, {
      include: [{ model: User, as: 'usuario' }]
    });

    if (!empleado || !empleado.usuario || !empleado.usuario.estado) {
      return res.status(400).json({
        success: false,
        mensaje: "Empleado no encontrado o inactivo"
      });
    }

    // Obtener la solicitud
    const solicitud = await OrdenServicio.findByPk(id, {
      include: [
        { model: Servicio, as: 'servicio' },
        { 
          model: Cliente, 
          as: 'cliente',
          include: [
            { model: User, as: 'Usuario' }
          ]
        },
        { model: User, as: 'empleado_asignado' }
      ]
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        mensaje: "Solicitud no encontrada"
      });
    }

    // Verificar si ya tiene empleado asignado
    const empleadoAnterior = solicitud.empleado_asignado;

    // Actualizar empleado asignado
    await solicitud.update({ id_empleado_asignado: id_empleado });

    // Enviar emails
    try {
      const clienteCorreo = solicitud.cliente.Usuario?.correo || solicitud.cliente.correo;
      const clienteNombre = `${solicitud.cliente.Usuario?.nombre || solicitud.cliente.nombre} ${solicitud.cliente.Usuario?.apellido || solicitud.cliente.apellido}`;
      
      // Email al cliente sobre la asignación (solo si tiene correo válido)
      if (clienteCorreo && clienteCorreo !== 'undefined') {
        await sendAsignacionCliente(
          clienteCorreo,
          clienteNombre,
          {
            orden_id: solicitud.id_orden_servicio,
            servicio_nombre: solicitud.servicio.nombre,
            empleado_nombre: `${empleado.usuario.nombre} ${empleado.usuario.apellido}`,
            empleado_correo: empleado.usuario.correo,
            estado_actual: solicitud.estado
          }
        );
      } else {
        console.log('⚠️ No se envió email al cliente: correo no válido o undefined');
      }

      // Email al empleado sobre la nueva asignación
      await sendNuevaAsignacionEmpleado(
        empleado.usuario.correo,
        `${empleado.usuario.nombre} ${empleado.usuario.apellido}`,
        {
          orden_id: solicitud.id_orden_servicio,
          servicio_nombre: solicitud.servicio.nombre,
          cliente_nombre: clienteNombre,
          cliente_correo: clienteCorreo,
          estado_actual: solicitud.estado
        }
      );

      // Si había un empleado anterior, notificarle sobre el cambio
      if (empleadoAnterior && empleadoAnterior.id_usuario !== id_empleado) {
        await sendReasignacionEmpleado(
          empleadoAnterior.correo,
          `${empleadoAnterior.nombre} ${empleadoAnterior.apellido}`,
          {
            orden_id: solicitud.id_orden_servicio,
            servicio_nombre: solicitud.servicio.nombre,
            nuevo_empleado: `${empleado.usuario.nombre} ${empleado.usuario.apellido}`
          }
        );
      }

    } catch (emailError) {
      console.error('Error al enviar emails:', emailError);
      // No fallar la operación por error de email
    }

    res.json({
      success: true,
      mensaje: "Empleado asignado exitosamente",
      data: {
        solicitud_id: id,
        empleado_asignado: {
          id_empleado: empleado.id_empleado,
          nombre: `${empleado.usuario.nombre} ${empleado.usuario.apellido}`,
          correo: empleado.usuario.correo
        },
        empleado_anterior: empleadoAnterior ? {
          nombre: `${empleadoAnterior.nombre} ${empleadoAnterior.apellido}`,
          correo: empleadoAnterior.correo
        } : null
      }
    });

  } catch (error) {
    console.error("Error al asignar empleado:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor"
    });
  }
};

// Ver empleado asignado (para clientes)
export const verEmpleadoAsignado = async (req, res) => {
  try {
    const { id } = req.params;

    const solicitud = await OrdenServicio.findByPk(id, {
      include: [
        { model: User, as: 'empleado_asignado' },
        { model: Servicio, as: 'servicio' }
      ]
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        mensaje: "Solicitud no encontrada"
      });
    }

    // Verificar que el cliente solo vea sus propias solicitudes
    if (req.user.rol === "cliente" && solicitud.id_cliente !== req.user.id_usuario) {
      return res.status(403).json({
        success: false,
        mensaje: "No tienes permisos para ver esta solicitud"
      });
    }

    res.json({
      success: true,
      data: {
        solicitud_id: id,
        servicio: solicitud.servicio.nombre,
        empleado_asignado: solicitud.empleado_asignado ? {
          id_empleado: solicitud.empleado_asignado.id_usuario,
          nombre: `${solicitud.empleado_asignado.nombre} ${solicitud.empleado_asignado.apellido}`,
          correo: solicitud.empleado_asignado.correo
        } : null
      }
    });

  } catch (error) {
    console.error("Error al obtener empleado asignado:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error interno del servidor"
    });
  }
};


