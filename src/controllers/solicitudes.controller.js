import { SolicitudesService } from "../services/solicitudes.service.js";
import { OrdenServicio, Servicio, Cliente, User, Empresa } from "../models/associations.js";
import EmpresaCliente from "../models/EmpresaCliente.js";
import DetalleOrdenServicio from "../models/DetalleOrdenServicio.js";
import Proceso from "../models/Proceso.js";
import { sendNuevaSolicitudCliente, sendAsignacionCliente, sendNuevaAsignacionEmpleado, sendReasignacionEmpleado } from "../services/email.service.js";
import Empleado from "../models/Empleado.js";
import { Op } from "sequelize";
import archiver from "archiver";

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
    comentarios: sol.comentarios || [],
    
    // Campos de anulación
    motivo_anulacion: sol.motivo_anulacion || null,
    fecha_anulacion: sol.fecha_anulacion || null,
    anulado_por: sol.anulado_por || null
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
    "certificado_renovacion",
    "logotipo",
    // ✅ Campos condicionales removidos: tipo_entidad, razon_social,
    //    nit_empresa, representante_legal
    //    Estos se validarán condicionalmente en el controlador según tipo_solicitante
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
    "nit_empresa", // ✅ SIEMPRE requerido (incluso para Natural)
    "nombre_marca",
    "marca_a_oponerse",
    "poder_autorizacion",
    "argumentos_respuesta",
    "documentos_oposicion",
    // ✅ Campos condicionales removidos: tipo_entidad, razon_social,
    //    representante_legal
    //    Estos se validarán condicionalmente en el controlador según tipo_solicitante
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

    // ============================================
    // VALIDACIÓN CONDICIONAL PARA CERTIFICACIÓN DE MARCA
    // ============================================
    if (servicioEncontrado.nombre === "Registro de Marca (Certificación de marca)") {
      const tipoSolicitante = req.body.tipo_solicitante;
      
      // Validar que tipo_solicitante sea válido
      if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
        return res.status(400).json({
          mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
          valor_recibido: tipoSolicitante,
          valores_aceptados: ["Natural", "Jurídica"]
        });
      }
      
      // Si es persona jurídica, validar campos adicionales requeridos
      if (tipoSolicitante === "Jurídica") {
        const camposJuridica = [
          "certificado_camara_comercio",
          "tipo_entidad",
          "razon_social",
          "nit_empresa",
          "representante_legal",
          "direccion_domicilio"
        ];
        
        const camposFaltantesJuridica = camposJuridica.filter(
          (campo) => {
            const valor = req.body[campo];
            // Validar que el campo existe y no está vacío
            if (campo === "nit_empresa") {
              // Para nit_empresa, debe ser un número válido
              return !valor || valor === "" || isNaN(Number(valor));
            }
            return !valor || valor.toString().trim() === "";
          }
        );
        
        if (camposFaltantesJuridica.length > 0) {
          return res.status(400).json({
            mensaje: "Campos requeridos faltantes para persona jurídica",
            camposFaltantes: camposFaltantesJuridica,
            tipo_solicitante: tipoSolicitante,
            camposRequeridos: camposJuridica
          });
        }
        
        // Validación adicional de NIT para jurídica
        const nitEmpresa = Number(req.body.nit_empresa);
        if (nitEmpresa < 1000000000 || nitEmpresa > 9999999999) {
          return res.status(400).json({
            mensaje: "NIT de empresa inválido",
            error: "NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)",
            valor_recibido: req.body.nit_empresa,
            rango_valido: "1000000000 - 9999999999"
          });
        }
      }
      // Para Natural, estos campos son opcionales (no se validan)
    }
    // ============================================

    // ============================================
    // VALIDACIÓN CONDICIONAL PARA RENOVACIÓN DE MARCA
    // ============================================
    if (servicioEncontrado.nombre === "Renovación de Marca") {
      const tipoSolicitante = req.body.tipo_solicitante;
      
      // Validar que tipo_solicitante sea válido
      if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
        return res.status(400).json({
          mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
          valor_recibido: tipoSolicitante,
          valores_aceptados: ["Natural", "Jurídica"]
        });
      }
      
      // Si es persona jurídica, validar campos adicionales requeridos
      if (tipoSolicitante === "Jurídica") {
        const camposJuridica = [
          "tipo_entidad",
          "razon_social",
          "nit_empresa",
          "representante_legal"
        ];
        
        const camposFaltantesJuridica = camposJuridica.filter(
          (campo) => {
            const valor = req.body[campo];
            // Validar que el campo existe y no está vacío
            if (campo === "nit_empresa") {
              // Para nit_empresa, debe ser un número válido
              return !valor || valor === "" || isNaN(Number(valor));
            }
            return !valor || valor.toString().trim() === "";
          }
        );
        
        if (camposFaltantesJuridica.length > 0) {
          return res.status(400).json({
            mensaje: "Campos requeridos faltantes para persona jurídica",
            camposFaltantes: camposFaltantesJuridica,
            tipo_solicitante: tipoSolicitante,
            camposRequeridos: camposJuridica
          });
        }
        
        // Validación adicional de NIT para jurídica
        const nitEmpresa = Number(req.body.nit_empresa);
        if (nitEmpresa < 1000000000 || nitEmpresa > 9999999999) {
          return res.status(400).json({
            mensaje: "NIT de empresa inválido",
            error: "NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)",
            valor_recibido: req.body.nit_empresa,
            rango_valido: "1000000000 - 9999999999"
          });
        }
      }
      // Para Natural, estos campos son opcionales (no se validan)
    }
    // ============================================

    // ============================================
    // VALIDACIÓN CONDICIONAL PARA PRESENTACIÓN DE OPOSICIÓN
    // ============================================
    if (servicioEncontrado.nombre === "Presentación de Oposición") {
      const tipoSolicitante = req.body.tipo_solicitante;
      
      // Validar que tipo_solicitante sea válido
      if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
        return res.status(400).json({
          mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
          valor_recibido: tipoSolicitante,
          valores_aceptados: ["Natural", "Jurídica"]
        });
      }
      
      // ⚠️ IMPORTANTE: En Oposición, nit_empresa es SIEMPRE requerido (incluso para Natural)
      // Validar nit_empresa para ambos tipos
      if (!req.body.nit_empresa || req.body.nit_empresa === "" || isNaN(Number(req.body.nit_empresa))) {
        return res.status(400).json({
          mensaje: "nit_empresa es requerido para Presentación de Oposición (incluso para personas Naturales)",
          tipo_solicitante: tipoSolicitante,
          campo_faltante: "nit_empresa"
        });
      }
      
      // Validación de formato de NIT (debe tener exactamente 10 dígitos)
      const nitEmpresa = Number(req.body.nit_empresa);
      if (nitEmpresa < 1000000000 || nitEmpresa > 9999999999) {
        return res.status(400).json({
          mensaje: "NIT de empresa inválido",
          error: "NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)",
          valor_recibido: req.body.nit_empresa,
          rango_valido: "1000000000 - 9999999999",
          tipo_solicitante: tipoSolicitante
        });
      }
      
      // Si es persona jurídica, validar campos adicionales requeridos
      if (tipoSolicitante === "Jurídica") {
        const camposJuridica = [
          "tipo_entidad",
          "razon_social",
          "representante_legal"
        ];
        
        const camposFaltantesJuridica = camposJuridica.filter(
          (campo) => {
            const valor = req.body[campo];
            return !valor || valor.toString().trim() === "";
          }
        );
        
        if (camposFaltantesJuridica.length > 0) {
          return res.status(400).json({
            mensaje: "Campos requeridos faltantes para persona jurídica",
            camposFaltantes: camposFaltantesJuridica,
            tipo_solicitante: tipoSolicitante,
            camposRequeridos: camposJuridica
          });
        }
      }
      // Para Natural, solo se requiere nit_empresa (ya validado arriba)
      // Los campos tipo_entidad, razon_social, representante_legal son opcionales
    }
    // ============================================

    // ============================================
    // VALIDACIÓN CONDICIONAL PARA CESIÓN DE MARCA
    // ============================================
    if (servicioEncontrado.nombre === "Cesión de Marca") {
      const tipoSolicitante = req.body.tipo_solicitante;
      
      // Validar que tipo_solicitante sea válido
      if (!tipoSolicitante || (tipoSolicitante !== "Natural" && tipoSolicitante !== "Jurídica")) {
        return res.status(400).json({
          mensaje: "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
          valor_recibido: tipoSolicitante,
          valores_aceptados: ["Natural", "Jurídica"]
        });
      }
      
      // ⚠️ IMPORTANTE: En Cesión de Marca, los campos del cesionario son SIEMPRE requeridos
      // Validar campos del cesionario (siempre requeridos, independiente del tipo de cedente)
      const camposCesionario = [
        "nombre_razon_social_cesionario",
        "nit_cesionario",
        "representante_legal_cesionario",
        "tipo_documento_cesionario",
        "numero_documento_cesionario",
        "correo_cesionario",
        "telefono_cesionario",
        "direccion_cesionario"
      ];
      
      const camposFaltantesCesionario = camposCesionario.filter(
        (campo) => {
          const valor = req.body[campo];
          return !valor || valor.toString().trim() === "";
        }
      );
      
      if (camposFaltantesCesionario.length > 0) {
        return res.status(400).json({
          mensaje: "Campos del cesionario requeridos faltantes",
          camposFaltantes: camposFaltantesCesionario,
          tipo_solicitante: tipoSolicitante,
          camposRequeridos: camposCesionario,
          nota: "Los campos del cesionario son siempre requeridos, independiente del tipo de cedente"
        });
      }
      
      // Validar formato de NIT del cesionario (debe tener exactamente 10 dígitos)
      if (req.body.nit_cesionario) {
        const nitCesionario = Number(req.body.nit_cesionario);
        if (isNaN(nitCesionario) || nitCesionario < 1000000000 || nitCesionario > 9999999999) {
          return res.status(400).json({
            mensaje: "NIT del cesionario inválido",
            error: "NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)",
            valor_recibido: req.body.nit_cesionario,
            rango_valido: "1000000000 - 9999999999"
          });
        }
      }
      
      // Si es persona jurídica (cedente), validar campos adicionales requeridos
      if (tipoSolicitante === "Jurídica") {
        const camposJuridica = [
          "tipo_entidad",
          "razon_social",
          "nit_empresa",
          "representante_legal"
        ];
        
        const camposFaltantesJuridica = camposJuridica.filter(
          (campo) => {
            const valor = req.body[campo];
            
            // Para nit_empresa, validar formato
            if (campo === "nit_empresa") {
              if (!valor || isNaN(Number(valor))) {
                return true;
              }
              const nit = Number(valor);
              return nit < 1000000000 || nit > 9999999999;
            }
            
            return !valor || valor.toString().trim() === "";
          }
        );
        
        if (camposFaltantesJuridica.length > 0) {
          return res.status(400).json({
            mensaje: "Campos requeridos faltantes para persona jurídica (cedente)",
            camposFaltantes: camposFaltantesJuridica,
            tipo_solicitante: tipoSolicitante,
            camposRequeridos: camposJuridica
          });
        }
      }
      // Para Natural (cedente), NO se requiere nit_empresa ni campos de empresa
      // Los campos tipo_entidad, razon_social, nit_empresa, representante_legal son opcionales
    }
    // ============================================

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
    } else if (empresa) {
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
    // ⚠️ LÓGICA: Clientes requieren pago, Administradores/Empleados activan directamente
    const estadoInicial = (req.user.rol === 'cliente') 
      ? "Pendiente de Pago"  // Cliente: requiere pago
      : null;  // Admin/Empleado: se activará con primer proceso
    
    const ordenData = {
      id_cliente: cliente.id_cliente,
      id_servicio: servicio.id_servicio,
      id_empresa: empresa.id_empresa,
      total_estimado: servicio.precio_base || 100000.00,
      pais: req.body.pais_titular || req.body.pais || req.body.pais_residencia || "Colombia",
      ciudad: req.body.ciudad_titular || req.body.ciudad || req.body.ciudad_residencia || "Bogotá",
      codigo_postal: req.body.codigo_postal || "110111",
      estado: estadoInicial || "Pendiente", // Temporal, se actualizará después
      
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
      // ✅ CORRECCIÓN: poder_autorizacion SIEMPRE va a poderparaelregistrodelamarca
      // poderdelrepresentanteautorizado SOLO para poder_representante_autorizado (Jurídica)
      poderparaelregistrodelamarca: req.body.poder_autorizacion || req.body.poder_registro_marca,
      // Solo incluir poderdelrepresentanteautorizado si es Jurídica y existe poder_representante_autorizado
      ...(req.body.tipo_solicitante === 'Jurídica' && req.body.poder_representante_autorizado ? {
        poderdelrepresentanteautorizado: req.body.poder_representante_autorizado
      } : {}),
      
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
    
    // ✅ CORRECCIÓN: Para personas Naturales, NO guardar campos de representante/empresa del cedente
    // ⚠️ EXCEPCIÓN: Para "Presentación de Oposición", nit_empresa es SIEMPRE requerido (incluso para Natural)
    // ✅ NOTA: Para "Cesión de Marca", nit_empresa del cedente NO se requiere para Natural (se elimina)
    //    Los campos del cesionario SIEMPRE se guardan (son siempre requeridos)
    if (req.body.tipo_solicitante === 'Natural') {
      // Remover campos que NO aplican para personas naturales (cedente)
      delete ordenData.tipodeentidadrazonsocial;
      delete ordenData.nombredelaempresa;
      delete ordenData.poderdelrepresentanteautorizado;
      delete ordenData.representante_legal;
      delete ordenData.certificado_camara_comercio;
      
      // ⚠️ IMPORTANTE: NO eliminar 'nit' si es "Presentación de Oposición"
      // porque en Oposición, nit_empresa es SIEMPRE requerido (incluso para Natural)
      // Para "Cesión de Marca" y otros servicios, nit_empresa NO se requiere para Natural
      if (servicioEncontrado.nombre !== "Presentación de Oposición") {
        delete ordenData.nit;
      } else {
        console.log('✅ Persona Natural en Oposición - nit_empresa se mantiene (siempre requerido)');
      }
      
      // Nota: Los campos del cesionario (nombre_razon_social_cesionario, nit_cesionario, etc.)
      // NO se eliminan porque son SIEMPRE requeridos, independiente del tipo de cedente
      // Nota: direccion_domicilio no se está usando en ordenData, está bien
      console.log('✅ Persona Natural - Campos de representante/empresa del cedente removidos del ordenData');
    }
    
    console.log('🔍 Debug - ordenData:', ordenData);

    console.log('📝 Creando orden de servicio...');
    const nuevaOrden = await OrdenServicio.create(ordenData);
    console.log('✅ Orden creada:', nuevaOrden.id_orden_servicio);

    // 🚀 LÓGICA DIFERENCIADA POR ROL
    if (req.user.rol === 'cliente') {
      // CLIENTE: Crear con estado "Pendiente de Pago" (requiere pago)
      await nuevaOrden.update({ estado: "Pendiente de Pago" });
      console.log('💰 Estado inicial: Pendiente de Pago (requiere pago para activar)');
      console.log('⚠️ El proceso se asignará cuando se confirme el pago exitosamente');
      // Ver función activarSolicitudDespuesPago()
    } else {
      // ADMINISTRADOR/EMPLEADO: Activar directamente con primer estado del proceso
      console.log('👨‍💼 Administrador/Empleado - Activando solicitud directamente...');
      
      try {
        // Obtener los process_states del servicio ordenados por order_number
        const procesos = await Proceso.findAll({
          where: { servicio_id: servicio.id_servicio },
          order: [['order_number', 'ASC']]
        });
        
        if (procesos.length > 0) {
          const primerProceso = procesos[0];
          console.log('✅ Primer proceso encontrado:', primerProceso.nombre);
          
          // Crear registro en DetalleOrdenServicio con el primer proceso
          await DetalleOrdenServicio.create({
            id_orden_servicio: nuevaOrden.id_orden_servicio,
            id_servicio: servicio.id_servicio,
            estado: primerProceso.nombre,
            fecha_estado: new Date()
          });
          
          // Actualizar el estado de la orden principal
          await nuevaOrden.update({ estado: primerProceso.nombre });
          console.log('✅ Solicitud activada con estado:', primerProceso.nombre);
        } else {
          // Si no hay procesos, usar estado por defecto
          await DetalleOrdenServicio.create({
            id_orden_servicio: nuevaOrden.id_orden_servicio,
            id_servicio: servicio.id_servicio,
            estado: "Pendiente",
            fecha_estado: new Date()
          });
          await nuevaOrden.update({ estado: "Pendiente" });
          console.log('✅ Solicitud activada con estado por defecto: Pendiente');
        }
      } catch (error) {
        console.error('❌ Error al activar solicitud (admin):', error);
        // No fallar la creación, pero dejar en estado pendiente
        await nuevaOrden.update({ estado: "Pendiente" });
      }
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

    // Obtener el estado actualizado
    const ordenActualizada = await OrdenServicio.findByPk(nuevaOrden.id_orden_servicio);
    
    console.log('🎉 Solicitud creada exitosamente');
    
    // Respuesta diferenciada según el rol
    const requierePago = req.user.rol === 'cliente';
    const mensaje = requierePago 
      ? "Solicitud creada. Pendiente de pago para activar."
      : "Solicitud creada y activada exitosamente.";
    
    const nextSteps = requierePago
      ? [
          "Complete el pago para activar la solicitud",
          "Una vez pagado, la solicitud será procesada automáticamente",
          "Puede consultar el estado en cualquier momento"
        ]
      : [
          "La solicitud está activa y lista para procesar",
          "Se notificará por email el estado de la solicitud",
          "Puede consultar el estado en cualquier momento"
        ];
    
    return res.status(201).json({
      success: true,
      mensaje: mensaje,
      data: {
        orden_id: ordenActualizada.id_orden_servicio,
        servicio: servicioEncontrado,
        estado: ordenActualizada.estado,
        monto_a_pagar: requierePago ? (servicioEncontrado.precio_base || servicio.precio_base || 100000.00) : null,
        requiere_pago: requierePago,
        fecha_solicitud: ordenActualizada.fecha_creacion,
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
        version: "2.4",
        rol: req.user.rol,
        nextSteps: nextSteps
      }
    });

  } catch (error) {
    // Logging detallado para debugging
    console.error('💥 Error en crearSolicitud:', error);
    console.error('💥 Stack:', error.stack);
    console.error('💥 Request body size:', JSON.stringify(req.body || {}).length);
    console.error('💥 Request body keys:', Object.keys(req.body || {}));
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    
    // Detectar errores comunes y proporcionar mensajes útiles
    let mensajeError = "Error interno del servidor";
    let detalles = {};
    
    // Error de payload demasiado grande
    if (error.message && (
      error.message.includes('request entity too large') ||
      error.message.includes('PayloadTooLargeError') ||
      error.message.includes('too large')
    )) {
      mensajeError = "El payload es demasiado grande. Límite actual: 100KB. Se requiere aumentar el límite en app.js";
      detalles = {
        tipo: "PayloadTooLarge",
        limite_actual: "100KB",
        solucion: "Aumentar express.json({ limit: '10mb' }) en app.js",
        tamaño_payload: JSON.stringify(req.body || {}).length,
        tamaño_mb: (JSON.stringify(req.body || {}).length / (1024 * 1024)).toFixed(2) + " MB"
      };
    } 
    // Error de validación de Sequelize
    else if (error.name === 'SequelizeValidationError') {
      mensajeError = "Error de validación en base de datos";
      detalles = {
        tipo: "ValidationError",
        errores: error.errors.map(e => ({
          campo: e.path,
          mensaje: e.message,
          valor: e.value,
          tipo: e.type
        }))
      };
    } 
    // Error de base de datos de Sequelize
    else if (error.name === 'SequelizeDatabaseError') {
      mensajeError = "Error de base de datos";
      detalles = {
        tipo: "DatabaseError",
        mensaje: error.message,
        sql: process.env.NODE_ENV === 'development' ? error.sql : undefined,
        codigo: error.parent?.code
      };
    } 
    // Error de conexión a base de datos
    else if (error.name === 'SequelizeConnectionError') {
      mensajeError = "Error de conexión a la base de datos";
      detalles = {
        tipo: "ConnectionError",
        mensaje: error.message
      };
    } 
    // Error de foreign key constraint
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
      mensajeError = "Error de integridad referencial";
      detalles = {
        tipo: "ForeignKeyConstraintError",
        mensaje: error.message,
        tabla: error.table
      };
    } 
    // Otros errores
    else {
      detalles = {
        tipo: error.name || "UnknownError",
        mensaje: error.message
      };
    }
    
    // Respuesta con información detallada
    return res.status(500).json({
      mensaje: mensajeError,
      error: error.message,
      detalles: detalles,
      timestamp: new Date().toISOString(),
      // Solo incluir stack en desarrollo
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * 🔄 Activa una solicitud después de confirmar el pago
 * Asigna el primer estado del proceso y crea el detalle inicial
 * @param {number} idOrdenServicio - ID de la orden de servicio
 * @returns {Promise<Object>} Resultado de la activación
 */
export const activarSolicitudDespuesPago = async (idOrdenServicio) => {
  try {
    console.log('🔄 Activando solicitud después de pago:', idOrdenServicio);
    
    // 1. Verificar que la solicitud existe y está en "Pendiente de Pago"
    const orden = await OrdenServicio.findByPk(idOrdenServicio, {
      include: [{ 
        model: Servicio, 
        as: 'servicio' 
      }]
    });
    
    if (!orden) {
      throw new Error('Solicitud no encontrada');
    }
    
    if (orden.estado !== 'Pendiente de Pago') {
      console.log('⚠️ Solicitud ya está activa o en otro estado:', orden.estado);
      return { 
        success: false, 
        mensaje: `La solicitud ya está en estado: ${orden.estado}`,
        estado_actual: orden.estado
      };
    }
    
    // 2. Verificar que no haya otro pago ya procesado (validación adicional)
    const { PagoRepository } = await import("../repositories/pago.repository.js");
    const pagosExistentes = await PagoRepository.findByOrdenServicio(idOrdenServicio);
    const pagoPagado = pagosExistentes?.find(p => p.estado === 'Pagado' && p.verified_at);
    
    // Si ya hay un pago procesado y la solicitud NO está en "Pendiente de Pago", 
    // significa que ya fue activada antes
    if (pagoPagado && orden.estado !== 'Pendiente de Pago') {
      console.log('⚠️ Solicitud ya tiene un pago procesado y está activa');
      return { 
        success: false, 
        mensaje: 'Solicitud ya tiene un pago procesado y está activa',
        tiene_pago: true,
        estado_actual: orden.estado
      };
    }
    
    // 3. Obtener el primer proceso del servicio
    const procesos = await Proceso.findAll({
      where: { servicio_id: orden.id_servicio },
      order: [['order_number', 'ASC']]
    });
    
    if (procesos.length === 0) {
      // Si no hay procesos, usar estado por defecto
      console.log('⚠️ No se encontraron procesos para el servicio, usando estado por defecto');
      await orden.update({ estado: 'Pendiente' });
      await DetalleOrdenServicio.create({
        id_orden_servicio: orden.id_orden_servicio,
        id_servicio: orden.id_servicio,
        estado: 'Pendiente',
        fecha_estado: new Date()
      });
      
      console.log('✅ Solicitud activada con estado por defecto: Pendiente');
      return {
        success: true,
        mensaje: 'Solicitud activada con estado por defecto',
        estado: 'Pendiente'
      };
    }
    
    // 4. Asignar primer proceso
    const primerProceso = procesos[0];
    console.log('✅ Primer proceso encontrado:', primerProceso.nombre);
    
    // Crear registro en DetalleOrdenServicio
    const detalleOrden = await DetalleOrdenServicio.create({
      id_orden_servicio: orden.id_orden_servicio,
      id_servicio: orden.id_servicio,
      estado: primerProceso.nombre,
      fecha_estado: new Date()
    });
    
    // Actualizar estado de la orden
    await orden.update({ estado: primerProceso.nombre });
    
    console.log('✅ Solicitud activada con estado:', primerProceso.nombre);
    console.log('🔍 Debug - DetalleOrden ID:', detalleOrden.id_detalle_orden);
    
    // 5. Enviar email de confirmación de activación (opcional)
    try {
      const ordenCompleta = await OrdenServicio.findByPk(idOrdenServicio, {
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
            as: 'servicio'
          }
        ]
      });
      
      if (ordenCompleta.cliente?.Usuario?.correo) {
        // Email de confirmación de activación (puedes personalizar este email)
        console.log('📧 Enviando email de confirmación de activación...');
        // Aquí puedes agregar un nuevo tipo de email si lo deseas
        // Por ahora solo logueamos
      }
    } catch (emailError) {
      console.error('⚠️ Error al enviar email de activación:', emailError);
      // No fallar la activación por error de email
    }
    
    return {
      success: true,
      mensaje: 'Solicitud activada exitosamente',
      estado: primerProceso.nombre,
      orden_id: orden.id_orden_servicio,
      detalle_orden_id: detalleOrden.id_detalle_orden
    };
    
  } catch (error) {
    console.error('❌ Error al activar solicitud:', error);
    throw error;
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

    // ✅ VALIDAR PROPIEDAD: Si es cliente, solo puede anular sus propias solicitudes
    if (req.user.rol === 'cliente') {
      const solicitud = await OrdenServicio.findByPk(id);
      if (!solicitud) {
        return res.status(404).json({ mensaje: "Solicitud no encontrada" });
      }
      
      // Buscar el cliente asociado al usuario
      const cliente = await Cliente.findOne({
        where: { id_usuario: req.user.id_usuario }
      });
      
      if (!cliente || solicitud.id_cliente !== cliente.id_cliente) {
        return res.status(403).json({ 
          success: false,
          mensaje: "No tienes permiso para anular esta solicitud",
          error: {
            code: 'PERMISSION_DENIED',
            details: 'Solo puedes anular tus propias solicitudes'
          }
        });
      }
    }

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
    
    // ✅ RESTRICCIÓN: Si es cliente, solo puede editar sus propias solicitudes
    if (req.user.rol === 'cliente') {
      const solicitudVerificacion = await OrdenServicio.findByPk(id);
      if (!solicitudVerificacion) {
        return res.status(404).json({ mensaje: "Solicitud no encontrada" });
      }
      
      // Buscar el cliente asociado al usuario
      const cliente = await Cliente.findOne({
        where: { id_usuario: req.user.id_usuario }
      });
      
      if (!cliente || solicitudVerificacion.id_cliente !== cliente.id_cliente) {
        return res.status(403).json({ 
          success: false,
          mensaje: "No tienes permiso para editar esta solicitud",
          error: {
            code: 'PERMISSION_DENIED',
            details: 'Solo puedes editar tus propias solicitudes'
          }
        });
      }
    }
    
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
    // ✅ RESTRICCIÓN: Solo admin/empleado pueden asignar empleados
    if (req.user.rol === 'cliente') {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes permiso para asignar empleados",
        error: {
          code: 'PERMISSION_DENIED',
          details: 'Solo administradores y empleados pueden asignar empleados a solicitudes'
        }
      });
    }

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

    // Actualizar empleado asignado (guardar id_usuario del empleado, no id_empleado)
    await solicitud.update({ id_empleado_asignado: empleado.id_usuario });

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
      if (empleadoAnterior && empleadoAnterior.id_usuario !== empleado.id_usuario) {
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

// ============================================
// FUNCIÓN: Descargar todos los archivos de una solicitud en ZIP
// ============================================
export const descargarArchivosSolicitud = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📦 [API] Descargando archivos de solicitud ID:', id);

    // Obtener la solicitud con todas las relaciones
    const solicitud = await OrdenServicio.findByPk(id, {
      include: [
        {
          model: Servicio,
          as: 'servicio',
          attributes: ['id_servicio', 'nombre']
        },
        {
          model: Cliente,
          as: 'cliente',
          include: [{ 
            model: User,
            as: 'Usuario',
            attributes: ['id_usuario', 'nombre', 'apellido']
          }]
        }
      ]
    });

    if (!solicitud) {
      return res.status(404).json({ 
        success: false,
        mensaje: "Solicitud no encontrada" 
      });
    }

    // Verificar permisos para clientes
    if (req.user.rol === "cliente" && solicitud.id_cliente !== req.user.id_usuario) {
      return res.status(403).json({
        success: false,
        mensaje: "No tienes permisos para descargar archivos de esta solicitud."
      });
    }

    // Función auxiliar para extraer Base64 y tipo MIME de una cadena Base64
    const extraerBase64YExtension = (base64String) => {
      if (!base64String || typeof base64String !== 'string') return null;
      
      // Si ya incluye el prefijo data: (data:image/png;base64,...)
      if (base64String.includes('data:')) {
        const match = base64String.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          // Determinar extensión desde MIME type
          const extensionMap = {
            'application/pdf': 'pdf',
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/gif': 'gif',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
          };
          const extension = extensionMap[mimeType] || 'bin';
          return { base64Data, extension, mimeType };
        }
      }
      
      // Si es solo Base64 sin prefijo, intentar decodificar y determinar tipo
      // Por defecto, asumimos PDF si no hay prefijo
      return { base64Data: base64String, extension: 'pdf', mimeType: 'application/pdf' };
    };

    // Función auxiliar para convertir Base64 a Buffer
    const base64ToBuffer = (base64String) => {
      try {
        const { base64Data } = extraerBase64YExtension(base64String) || { base64Data: base64String };
        return Buffer.from(base64Data, 'base64');
      } catch (error) {
        console.error('❌ Error al convertir Base64 a Buffer:', error);
        return null;
      }
    };

    // Recopilar todos los archivos de la solicitud
    const archivos = [];
    const nombreBase = `EXP-${solicitud.numero_expediente || solicitud.id_orden_servicio}`;
    const nombreMarca = solicitud.nombredelamarca || 'marca';
    const nombreCarpeta = `${nombreBase}_${nombreMarca}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Lista de campos que contienen archivos Base64
    const camposArchivos = [
      { campo: 'logotipo', nombre: '01_logotipo' },
      { campo: 'poderparaelregistrodelamarca', nombre: '02_poder_registro_marca' },
      { campo: 'poderdelrepresentanteautorizado', nombre: '03_poder_representante' },
      { campo: 'certificado_camara_comercio', nombre: '04_certificado_camara_comercio' },
      { campo: 'certificado_renovacion', nombre: '05_certificado_renovacion' },
      { campo: 'documento_cesion', nombre: '06_documento_cesion' },
      { campo: 'documentos_oposicion', nombre: '07_documentos_oposicion' },
      { campo: 'soportes', nombre: '08_soportes' }
    ];

    // Procesar cada campo de archivo
    for (const { campo, nombre } of camposArchivos) {
      const valor = solicitud[campo];
      if (valor) {
        const infoArchivo = extraerBase64YExtension(valor);
        if (infoArchivo) {
          const buffer = base64ToBuffer(valor);
          if (buffer) {
            archivos.push({
              nombre: `${nombre}.${infoArchivo.extension}`,
              buffer: buffer,
              tamaño: buffer.length
            });
            console.log(`✅ Archivo agregado: ${nombre}.${infoArchivo.extension} (${(buffer.length / 1024).toFixed(2)} KB)`);
          }
        }
      }
    }

    // Si no hay archivos, retornar error
    if (archivos.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: "No se encontraron archivos en esta solicitud",
        detalles: "La solicitud no contiene archivos adjuntos"
      });
    }

    // Crear archivo ZIP
    const archive = archiver('zip', {
      zlib: { level: 9 } // Máxima compresión
    });

    // Configurar headers de respuesta
    const nombreZip = `${nombreCarpeta}_archivos.zip`;
    res.attachment(nombreZip);
    res.setHeader('Content-Type', 'application/zip');

    // Pipe del archivo ZIP a la respuesta
    archive.pipe(res);

    // Agregar cada archivo al ZIP
    archivos.forEach(archivo => {
      archive.append(archivo.buffer, { name: archivo.nombre });
    });

    // Agregar un archivo README con información de la solicitud
    const readmeContent = `
ARCHIVOS DE LA SOLICITUD
========================

Número de Expediente: ${solicitud.numero_expediente || 'N/A'}
ID Solicitud: ${solicitud.id_orden_servicio}
Servicio: ${solicitud.servicio?.nombre || 'N/A'}
Fecha de Creación: ${solicitud.fecha_creacion || 'N/A'}
Estado: ${solicitud.estado || 'N/A'}

Titular: ${solicitud.cliente?.Usuario ? `${solicitud.cliente.Usuario.nombre} ${solicitud.cliente.Usuario.apellido}` : 'N/A'}
Marca: ${solicitud.nombredelamarca || 'N/A'}

ARCHIVOS INCLUIDOS:
${archivos.map((a, i) => `${i + 1}. ${a.nombre} (${(a.tamaño / 1024).toFixed(2)} KB)`).join('\n')}

Total de archivos: ${archivos.length}
Fecha de descarga: ${new Date().toLocaleString('es-CO')}
    `.trim();

    archive.append(readmeContent, { name: 'README.txt' });

    // Finalizar el archivo ZIP
    await archive.finalize();

    console.log(`✅ [API] ZIP creado exitosamente: ${nombreZip} (${archivos.length} archivos)`);

    // El archivo ZIP se enviará automáticamente cuando archive.finalize() complete
    // No necesitamos enviar una respuesta JSON aquí, el ZIP se envía directamente

  } catch (error) {
    console.error("❌ [API] Error al descargar archivos de solicitud:", error);
    
    // Si la respuesta ya fue enviada (por el pipe), no podemos enviar JSON
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        mensaje: "Error al generar archivo ZIP",
        error: process.env.NODE_ENV === "development" ? error.message : "Error interno del servidor"
      });
    }
  }
};
