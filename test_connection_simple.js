/**
 * 🔍 TEST SIMPLE DE CONEXIÓN
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testConnection() {
  try {
    console.log('🔍 Probando conexión con el servidor...');
    
    // Test básico de conexión
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Servidor respondiendo:', response.data);
    
    // Test de servicios
    console.log('\n📋 Probando endpoint de servicios...');
    const serviciosResponse = await axios.get(`${BASE_URL}/servicios`);
    console.log('✅ Servicios encontrados:', serviciosResponse.data.data?.length || 0);
    
    if (serviciosResponse.data.data && serviciosResponse.data.data.length > 0) {
      const servicio1 = serviciosResponse.data.data[0];
      console.log('📊 Primer servicio:', servicio1.nombre);
      console.log('📊 Process states:', servicio1.process_states?.length || 0);
      
      if (servicio1.process_states) {
        console.log('📋 Estados disponibles:');
        servicio1.process_states.forEach((estado, index) => {
          console.log(`   ${index + 1}. ${estado.nombre} (order: ${estado.order_number})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 El servidor no está corriendo. Ejecuta: npm start');
    }
  }
}

testConnection();
