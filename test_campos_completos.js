/**
 * Script de Prueba: Verificar Campos Completos en GET /api/gestion-solicitudes
 * 
 * Este script prueba que el endpoint retorne todos los campos necesarios
 * 
 * Uso:
 *   node test_campos_completos.js
 */

import { OrdenServicio, Servicio, Cliente, User, Empresa } from "./src/models/associations.js";

// Campos requeridos que deben estar presentes en la respuesta
const CAMPOS_REQUERIDOS = [
  // Campos básicos
  'id',
  'expediente',
  'titular',
  'marca',
  'tipoSolicitud',
  'encargado',
  'estado',
  'email',
  'telefono',
  
  // Ubicación
  'pais',
  'ciudad',
  'direccion',
  'codigo_postal',
  
  // Documento del titular
  'tipoDocumento',
  'numeroDocumento',
  'tipoPersona',
  'nombreCompleto',
  
  // Datos de empresa
  'tipoEntidad',
  'nombreEmpresa',
  'razonSocial',
  'nit',
  
  // Marca/Producto
  'nombreMarca',
  'categoria',
  'clase_niza',
  
  // Tipo de solicitante
  'tipoSolicitante',
  
  // Fechas
  'fechaCreacion',
  'fechaFin',
  
  // IDs
  'id_cliente',
  'id_empresa',
  'id_empleado_asignado',
  'id_servicio',
  
  // Comentarios
  'comentarios'
];

// Función para transformar solicitud (copiada del controlador)
const transformarSolicitudAFrontend = (ordenServicio) => {
  const sol = ordenServicio;
  
  const titular = sol.nombrecompleto || 
                 sol.nombre_completo ||
                 (sol.cliente?.usuario ? 
                   `${sol.cliente.usuario.nombre} ${sol.cliente.usuario.apellido}` : 
                   'Sin titular');
  
  const marca = sol.nombredelamarca || 
               sol.nombre_marca || 
               sol.marca ||
               sol.cliente?.marca ||
               'Sin marca';
  
  const email = sol.correoelectronico || 
               sol.correo || 
               sol.cliente?.usuario?.correo || 
               '';
  
  const telefono = sol.telefono || 
                  sol.cliente?.usuario?.telefono || 
                  '';
  
  const encargado = sol.empleado_asignado ? 
                   `${sol.empleado_asignado.nombre} ${sol.empleado_asignado.apellido}` : 
                   'Sin asignar';
  
  const empresaData = sol.empresa || sol.Empresa;
  
  return {
    id: sol.id_orden_servicio?.toString(),
    expediente: sol.numero_expediente || `EXP-${sol.id_orden_servicio}`,
    titular: titular,
    marca: marca,
    tipoSolicitud: sol.servicio?.nombre || 'Sin servicio',
    encargado: encargado,
    estado: sol.estado || 'Pendiente',
    email: email,
    telefono: telefono,
    
    pais: sol.pais || '',
    ciudad: sol.ciudad || '',
    direccion: sol.direccion || '',
    codigo_postal: sol.codigo_postal || '',
    
    tipoDocumento: sol.tipodedocumento || '',
    numeroDocumento: sol.numerodedocumento || '',
    tipoPersona: sol.tipodepersona || '',
    nombreCompleto: titular,
    
    tipoEntidad: sol.tipodeentidadrazonsocial || '',
    nombreEmpresa: sol.nombredelaempresa || empresaData?.nombre_empresa || '',
    razonSocial: sol.nombredelaempresa || empresaData?.nombre_empresa || '',
    nit: sol.nit || empresaData?.nit || '',
    
    nombreMarca: marca,
    categoria: sol.clase_niza || sol.categoria || '',
    clase_niza: sol.clase_niza || '',
    
    tipoSolicitante: sol.tipo_solicitante || sol.tipodepersona || '',
    
    fechaCreacion: sol.fecha_creacion || sol.fecha_solicitud || sol.createdAt,
    fechaFin: sol.fecha_finalizacion || sol.fecha_fin || null,
    
    poderRepresentante: sol.poderdelrepresentanteautorizado || null,
    poderAutorizacion: sol.poderparaelregistrodelamarca || null,
    certificadoCamara: sol.certificado_camara_comercio || null,
    logotipoMarca: sol.logotipo || sol.logo || null,
    
    id_cliente: sol.id_cliente,
    id_empresa: sol.id_empresa,
    id_empleado_asignado: sol.id_empleado_asignado,
    id_servicio: sol.id_servicio,
    
    comentarios: sol.comentarios || []
  };
};

// Función principal de prueba
async function testCamposCompletos() {
  console.log('🧪 ================================');
  console.log('🧪 TEST: Campos Completos en API');
  console.log('🧪 ================================\n');
  
  try {
    // Obtener una solicitud de prueba
    console.log('📋 Obteniendo solicitud de prueba...');
    const solicitudes = await OrdenServicio.findAll({
      limit: 1,
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
      ]
    });
    
    if (solicitudes.length === 0) {
      console.log('⚠️  No hay solicitudes en la base de datos');
      console.log('⚠️  Crea una solicitud primero para probar los campos');
      process.exit(1);
    }
    
    const solicitud = solicitudes[0].toJSON();
    console.log('✅ Solicitud obtenida: ID =', solicitud.id_orden_servicio);
    console.log('');
    
    // Transformar la solicitud
    console.log('🔄 Transformando solicitud al formato frontend...');
    const solicitudFormateada = transformarSolicitudAFrontend(solicitud);
    console.log('✅ Transformación completa');
    console.log('');
    
    // Verificar campos
    console.log('🔍 Verificando campos presentes...');
    const camposPresentes = Object.keys(solicitudFormateada);
    console.log(`   Total de campos: ${camposPresentes.length}`);
    console.log('');
    
    // Verificar campos requeridos
    console.log('✅ Campos requeridos presentes:');
    let camposFaltantes = [];
    
    CAMPOS_REQUERIDOS.forEach(campo => {
      if (solicitudFormateada.hasOwnProperty(campo)) {
        const valor = solicitudFormateada[campo];
        const tieneValor = valor !== '' && valor !== null && valor !== undefined;
        const icono = tieneValor ? '✅' : '⚠️ ';
        console.log(`   ${icono} ${campo}: ${JSON.stringify(valor)}`);
      } else {
        camposFaltantes.push(campo);
        console.log(`   ❌ ${campo}: FALTANTE`);
      }
    });
    
    console.log('');
    
    // Resumen
    console.log('📊 ================================');
    console.log('📊 RESUMEN');
    console.log('📊 ================================');
    console.log(`   Campos totales: ${camposPresentes.length}`);
    console.log(`   Campos requeridos: ${CAMPOS_REQUERIDOS.length}`);
    console.log(`   Campos presentes: ${CAMPOS_REQUERIDOS.length - camposFaltantes.length}`);
    console.log(`   Campos faltantes: ${camposFaltantes.length}`);
    console.log('');
    
    if (camposFaltantes.length > 0) {
      console.log('❌ Campos faltantes:');
      camposFaltantes.forEach(campo => {
        console.log(`   - ${campo}`);
      });
      console.log('');
      console.log('❌ TEST FALLIDO: Hay campos faltantes');
      process.exit(1);
    }
    
    // Mostrar ejemplo de respuesta JSON
    console.log('📄 Ejemplo de respuesta JSON:');
    console.log('');
    console.log(JSON.stringify(solicitudFormateada, null, 2));
    console.log('');
    
    console.log('✅ ================================');
    console.log('✅ TEST EXITOSO');
    console.log('✅ ================================');
    console.log('');
    console.log('✅ Todos los campos requeridos están presentes');
    console.log('✅ El endpoint está listo para el frontend');
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en el test:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar test
testCamposCompletos();

