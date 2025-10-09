/**
 * 🔍 SCRIPT DE DEBUG - ESTADO DE SOLICITUD
 * 
 * Este script ayuda a debuggear por qué no se está asignando el estado inicial
 */

import axios from 'axios';

// Configuración
const BASE_URL = 'http://localhost:3000/api';

async function debugEstadoSolicitud() {
  console.log('🔍 INICIANDO DEBUG DE ESTADO DE SOLICITUD\n');
  
  try {
    // 1. Verificar que el servicio 1 existe y tiene process_states
    console.log('📋 1. Verificando servicio 1...');
    const servicioResponse = await axios.get(`${BASE_URL}/servicios/1`);
    console.log('✅ Servicio encontrado:', servicioResponse.data.data.nombre);
    console.log('📊 Process states:', servicioResponse.data.data.process_states?.length || 0);
    
    if (servicioResponse.data.data.process_states) {
      console.log('📋 Estados disponibles:');
      servicioResponse.data.data.process_states.forEach((estado, index) => {
        console.log(`   ${index + 1}. ${estado.nombre} (order: ${estado.order_number})`);
      });
    }
    
    // 2. Crear una solicitud y ver los logs
    console.log('\n📝 2. Creando solicitud de prueba...');
    
    // Primero registrar usuario
    const registroResponse = await axios.post(`${BASE_URL}/usuarios/registrar`, {
      tipo_documento: "CC",
      documento: 99999999,
      nombre: "Debug",
      apellido: "Test",
      correo: "debug@test.com",
      contrasena: "Debug123!"
    });
    
    console.log('✅ Usuario registrado:', registroResponse.data.data.usuario.id_usuario);
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/usuarios/login`, {
      correo: "debug@test.com",
      contrasena: "Debug123!"
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Crear solicitud
    const solicitudResponse = await axios.post(`${BASE_URL}/gestion-solicitudes/crear/1`, {
      nombre_titular: "Debug",
      apellido_titular: "Test",
      tipo_titular: "Persona Natural",
      tipo_documento: "Cédula",
      documento: "99999999",
      correo: "debug@test.com",
      telefono: "3009999999",
      nombre_marca: "Marca Debug",
      descripcion_servicio: "Solicitud de debug"
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Solicitud creada:', solicitudResponse.data.data.orden_id);
    console.log('📊 Estado en respuesta:', solicitudResponse.data.data.estado);
    
    const ordenId = solicitudResponse.data.data.orden_id;
    
    // 3. Verificar estado actual
    console.log('\n🔍 3. Verificando estado actual...');
    const estadoResponse = await axios.get(`${BASE_URL}/gestion-solicitudes/${ordenId}/estado-actual`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Estado actual:', estadoResponse.data.data.estado_actual);
    
    // 4. Verificar estados disponibles
    console.log('\n🔍 4. Verificando estados disponibles...');
    const estadosResponse = await axios.get(`${BASE_URL}/gestion-solicitudes/${ordenId}/estados-disponibles`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Estados disponibles:', estadosResponse.data.data.estados_disponibles.length);
    console.log('📊 Estado actual en respuesta:', estadosResponse.data.data.estado_actual);
    
    // 5. Verificar directamente en la base de datos (simulando)
    console.log('\n🔍 5. Verificando registros en DetalleOrdenServicio...');
    console.log('   (Esto requeriría acceso directo a la BD)');
    console.log('   Orden ID:', ordenId);
    console.log('   Servicio ID: 1');
    
  } catch (error) {
    console.error('❌ Error en debug:', error.response?.data || error.message);
    
    if (error.response?.status) {
      console.log('📊 Status:', error.response.status);
      console.log('📊 Headers:', error.response.headers);
    }
  }
}

// Ejecutar debug
debugEstadoSolicitud();
