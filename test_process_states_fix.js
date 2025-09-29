/**
 * Script de prueba para validar la corrección de process_states
 * Fecha: 29 de Septiembre de 2025
 */

const testProcessStatesFix = async () => {
  const baseUrl = 'http://localhost:3000';
  const servicioId = 1; // Cambiar por el ID del servicio a probar
  
  console.log('🧪 [TEST] Iniciando prueba de corrección de process_states...');
  console.log('🧪 [TEST] URL:', `${baseUrl}/api/servicios/${servicioId}`);
  
  // Datos de prueba con process_states
  const testData = {
    visible_en_landing: true,
    landing_data: {
      titulo: "Test Process States",
      resumen: "Prueba de corrección de process_states"
    },
    process_states: [
      {
        id: "test1",
        name: "Solicitud Inicial",
        order: 1,
        status_key: "solicitud_inicial"
      },
      {
        id: "test2",
        name: "Verificación de Documentos",
        order: 2,
        status_key: "verificacion_documentos"
      },
      {
        id: "test3",
        name: "Aprobación Final",
        order: 3,
        status_key: "aprobacion_final"
      }
    ]
  };
  
  console.log('🧪 [TEST] Datos de prueba:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(`${baseUrl}/api/servicios/${servicioId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Reemplazar con token válido
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log('🧪 [TEST] Status Code:', response.status);
    console.log('🧪 [TEST] Response:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('✅ [TEST] ¡CORRECCIÓN EXITOSA! Process_states guardados correctamente');
      console.log('✅ [TEST] Process_states recibidos:', result.data.process_states.length);
      console.log('✅ [TEST] Process_states:', result.data.process_states);
      
      // Verificar que los process_states coincidan
      if (result.data.process_states.length === testData.process_states.length) {
        console.log('✅ [TEST] ¡PERFECTO! Número de estados coincide');
      } else {
        console.log('⚠️ [TEST] Número de estados no coincide:', 
          `Esperado: ${testData.process_states.length}, Recibido: ${result.data.process_states.length}`);
      }
    } else {
      console.log('❌ [TEST] PRUEBA FALLIDA');
      console.log('❌ [TEST] Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en la petición:', error.message);
    console.error('❌ [TEST] Stack trace:', error.stack);
  }
};

// Ejecutar la prueba
testProcessStatesFix();
