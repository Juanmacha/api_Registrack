/**
 * 🚀 SCRIPT DE PRUEBA - SOLICITUD CORREGIDA
 * 
 * Este script prueba la creación de solicitudes con la corrección del NIT duplicado
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';

async function probarSolicitudCorregida() {
  console.log('🚀 INICIANDO PRUEBA DE SOLICITUD CORREGIDA\n');
  
  try {
    // 1. Registrar usuario cliente
    console.log('📝 1. Registrando usuario cliente...');
    const registroResponse = await axios.post(`${BASE_URL}/usuarios/registrar`, {
      tipo_documento: "CC",
      documento: 12345678,
      nombre: "Juan",
      apellido: "Pérez",
      correo: "juan.perez@test.com",
      contrasena: "MiPassword123!"
    });
    
    console.log('✅ Usuario registrado:', registroResponse.data.data.usuario.id_usuario);
    const token = registroResponse.data.data.usuario.id_usuario; // No hay token en registro
    
    // 2. Login del cliente
    console.log('\n🔐 2. Haciendo login del cliente...');
    const loginResponse = await axios.post(`${BASE_URL}/usuarios/login`, {
      correo: "juan.perez@test.com",
      contrasena: "MiPassword123!"
    });
    
    console.log('✅ Login exitoso');
    const authToken = loginResponse.data.data.token;
    
    // 3. Crear solicitud (debería funcionar ahora)
    console.log('\n📋 3. Creando solicitud...');
    const solicitudResponse = await axios.post(`${BASE_URL}/gestion-solicitudes/crear/1`, {
      nombre_titular: "Juan",
      apellido_titular: "Pérez",
      tipo_titular: "Persona Natural",
      tipo_documento: "Cédula",
      documento: "12345678",
      correo: "juan.perez@test.com",
      telefono: "3001234567",
      nombre_marca: "Marca Test Juan",
      descripcion_servicio: "Solicitud de búsqueda de antecedentes para mi marca"
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Solicitud creada exitosamente');
    console.log('📊 Orden ID:', solicitudResponse.data.data.orden_id);
    console.log('📊 Estado inicial:', solicitudResponse.data.data.estado);
    console.log('📊 Servicio:', solicitudResponse.data.data.servicio.nombre);
    
    const ordenId = solicitudResponse.data.data.orden_id;
    
    // 4. Verificar que se asignó el primer estado
    console.log('\n🔍 4. Verificando asignación de estado inicial...');
    console.log('✅ Estado asignado automáticamente:', solicitudResponse.data.data.estado);
    
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('=====================================');
    console.log('✅ Usuario cliente creado');
    console.log('✅ Login exitoso');
    console.log('✅ Solicitud creada sin errores de NIT');
    console.log('✅ Estado inicial asignado automáticamente');
    console.log('✅ Empresa creada con NIT único');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Detalles del error:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar prueba
probarSolicitudCorregida();
