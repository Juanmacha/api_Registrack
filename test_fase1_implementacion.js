/**
 * 🚀 SCRIPT DE PRUEBA - FASE 1 IMPLEMENTACIÓN
 * 
 * Este script prueba la implementación completa de la Fase 1:
 * 1. Creación de solicitudes con primer estado del servicio
 * 2. Obtención de estados disponibles
 * 3. Cambio de estado a través del seguimiento
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN = 'tu_token_aqui'; // Reemplazar con token válido

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

// Datos de prueba
const datosSolicitud = {
  nombre_titular: "Juan",
  apellido_titular: "Pérez",
  tipo_titular: "Persona Natural",
  tipo_documento: "Cédula",
  documento: "12345678",
  correo: "juan@ejemplo.com",
  telefono: "3001234567",
  nombre_marca: "Marca Test",
  descripcion_servicio: "Descripción de prueba"
};

async function probarImplementacion() {
  console.log('🚀 INICIANDO PRUEBAS DE FASE 1 IMPLEMENTACIÓN\n');
  
  try {
    // 1. Crear solicitud (debería asignar primer estado automáticamente)
    console.log('📝 1. Creando solicitud...');
    const respuestaCreacion = await axios.post(
      `${BASE_URL}/solicitudes/1`, // ID del servicio
      datosSolicitud,
      { headers }
    );
    
    console.log('✅ Solicitud creada:', respuestaCreacion.data.data.orden_id);
    console.log('📊 Estado inicial:', respuestaCreacion.data.data.estado);
    
    const ordenId = respuestaCreacion.data.data.orden_id;
    
    // 2. Obtener estados disponibles
    console.log('\n📋 2. Obteniendo estados disponibles...');
    const estadosDisponibles = await axios.get(
      `${BASE_URL}/solicitudes/${ordenId}/estados-disponibles`,
      { headers }
    );
    
    console.log('✅ Estados disponibles:', estadosDisponibles.data.data.estados_disponibles.length);
    console.log('📊 Estado actual:', estadosDisponibles.data.data.estado_actual);
    
    // 3. Obtener estado actual
    console.log('\n📊 3. Obteniendo estado actual...');
    const estadoActual = await axios.get(
      `${BASE_URL}/solicitudes/${ordenId}/estado-actual`,
      { headers }
    );
    
    console.log('✅ Estado actual:', estadoActual.data.data.estado_actual);
    
    // 4. Crear seguimiento con cambio de estado
    console.log('\n🔄 4. Creando seguimiento con cambio de estado...');
    
    const estados = estadosDisponibles.data.data.estados_disponibles;
    if (estados.length > 1) {
      const nuevoEstado = estados[1].nombre; // Tomar el segundo estado
      
      const seguimientoData = {
        id_orden_servicio: ordenId,
        titulo: "Cambio de estado de prueba",
        descripcion: "Probando cambio de estado desde seguimiento",
        nuevo_estado: nuevoEstado
      };
      
      const seguimientoRespuesta = await axios.post(
        `${BASE_URL}/seguimientos`,
        seguimientoData,
        { headers }
      );
      
      console.log('✅ Seguimiento creado con cambio de estado');
      console.log('📊 Cambio:', seguimientoRespuesta.data.data.cambio_estado);
      
      // 5. Verificar que el estado se cambió
      console.log('\n✅ 5. Verificando cambio de estado...');
      const estadoVerificado = await axios.get(
        `${BASE_URL}/solicitudes/${ordenId}/estado-actual`,
        { headers }
      );
      
      console.log('✅ Nuevo estado:', estadoVerificado.data.data.estado_actual);
      
    } else {
      console.log('⚠️ Solo hay un estado disponible, no se puede probar el cambio');
    }
    
    // 6. Obtener estados disponibles desde seguimiento
    console.log('\n📋 6. Obteniendo estados desde seguimiento...');
    const estadosSeguimiento = await axios.get(
      `${BASE_URL}/seguimientos/${ordenId}/estados-disponibles`,
      { headers }
    );
    
    console.log('✅ Estados desde seguimiento:', estadosSeguimiento.data.data.estados_disponibles.length);
    
    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
probarImplementacion();
