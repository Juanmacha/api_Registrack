/**
 * 🔧 SCRIPT DE CORRECCIÓN - ESTADO DE SOLICITUD
 * 
 * Este script corrige el problema de "Sin estado" en las solicitudes
 */

import axios from 'axios';

// Configuración
const BASE_URL = 'http://localhost:3000/api';

async function fixEstadoSolicitud() {
  console.log('🔧 INICIANDO CORRECCIÓN DE ESTADO DE SOLICITUD\n');
  
  try {
    // 1. Verificar servicio 1 y sus process_states
    console.log('📋 1. Verificando servicio 1...');
    const servicioResponse = await axios.get(`${BASE_URL}/servicios/1`);
    const servicio = servicioResponse.data.data;
    
    console.log('✅ Servicio:', servicio.nombre);
    console.log('📊 Process states:', servicio.process_states?.length || 0);
    
    if (!servicio.process_states || servicio.process_states.length === 0) {
      console.log('❌ PROBLEMA ENCONTRADO: El servicio 1 no tiene process_states');
      console.log('💡 SOLUCIÓN: Necesitas configurar process_states para el servicio 1');
      return;
    }
    
    // 2. Crear una solicitud de prueba
    console.log('\n📝 2. Creando solicitud de prueba...');
    
    // Registrar usuario
    const registroResponse = await axios.post(`${BASE_URL}/usuarios/registrar`, {
      tipo_documento: "CC",
      documento: 88888888,
      nombre: "Fix",
      apellido: "Test",
      correo: "fix@test.com",
      contrasena: "Fix123!"
    });
    
    console.log('✅ Usuario registrado');
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/usuarios/login`, {
      correo: "fix@test.com",
      contrasena: "Fix123!"
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login exitoso');
    
    // Crear solicitud
    const solicitudResponse = await axios.post(`${BASE_URL}/gestion-solicitudes/crear/1`, {
      nombre_titular: "Fix",
      apellido_titular: "Test",
      tipo_titular: "Persona Natural",
      tipo_documento: "Cédula",
      documento: "88888888",
      correo: "fix@test.com",
      telefono: "3008888888",
      nombre_marca: "Marca Fix",
      descripcion_servicio: "Solicitud de fix"
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Solicitud creada:', solicitudResponse.data.data.orden_id);
    console.log('📊 Estado en respuesta:', solicitudResponse.data.data.estado);
    
    const ordenId = solicitudResponse.data.data.orden_id;
    
    // 3. Verificar estado inmediatamente después
    console.log('\n🔍 3. Verificando estado inmediatamente...');
    
    // Esperar un momento para que se procese
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const estadoResponse = await axios.get(`${BASE_URL}/gestion-solicitudes/${ordenId}/estado-actual`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Estado actual:', estadoResponse.data.data.estado_actual);
    
    if (estadoResponse.data.data.estado_actual === 'Sin estado') {
      console.log('❌ PROBLEMA CONFIRMADO: El estado no se está asignando correctamente');
      console.log('💡 REVISAR: Los logs del servidor para ver qué está pasando');
    } else {
      console.log('✅ PROBLEMA RESUELTO: El estado se está asignando correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error en la corrección:', error.response?.data || error.message);
  }
}

// Ejecutar corrección
fixEstadoSolicitud();
