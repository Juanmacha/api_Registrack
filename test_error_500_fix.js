/**
 * Script de prueba para validar la corrección del error 500
 * Fecha: 28 de Septiembre de 2025
 */

const testError500Fix = async () => {
  const baseUrl = 'http://localhost:3000';
  const servicioId = 1; // Cambiar por el ID del servicio a probar
  
  console.log('🧪 [TEST] Iniciando prueba de corrección del error 500...');
  console.log('🧪 [TEST] URL:', `${baseUrl}/api/servicios/${servicioId}`);
  
  // Datos de prueba simples
  const testData = {
    visible_en_landing: false
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
      console.log('✅ [TEST] ¡CORRECCIÓN EXITOSA! El error 500 ha sido solucionado');
      console.log('✅ [TEST] Servicio actualizado:', result.data);
    } else if (response.status === 500) {
      console.log('❌ [TEST] ERROR 500 PERSISTE');
      console.log('❌ [TEST] Error details:', result.error);
      console.log('❌ [TEST] Stack trace:', result.error?.stack);
    } else {
      console.log('⚠️ [TEST] Respuesta inesperada');
      console.log('⚠️ [TEST] Status:', response.status);
      console.log('⚠️ [TEST] Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en la petición:', error.message);
    console.error('❌ [TEST] Stack trace:', error.stack);
  }
};

// Ejecutar la prueba
testError500Fix();
