/**
 * Script de prueba para validar la corrección del bug en updateServicio
 * Fecha: 28 de Septiembre de 2025
 */

const testServicioUpdate = async () => {
  const baseUrl = 'http://localhost:3000';
  const servicioId = 1; // Cambiar por el ID del servicio a probar
  
  console.log('🧪 [TEST] Iniciando prueba de actualización de servicio...');
  console.log('🧪 [TEST] URL:', `${baseUrl}/api/servicios/${servicioId}`);
  
  // Datos de prueba que deberían detectar cambios
  const testData = {
    landing_data: {
      titulo: "Nuevo Título de Prueba - " + new Date().toISOString(),
      resumen: "Nuevo resumen de prueba actualizado",
      imagen: "nueva_imagen_test.jpg"
    },
    visible_en_landing: true
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
      console.log('✅ [TEST] ¡PRUEBA EXITOSA! El servicio se actualizó correctamente');
      console.log('✅ [TEST] Datos actualizados:', result.data);
    } else {
      console.log('❌ [TEST] PRUEBA FALLIDA');
      console.log('❌ [TEST] Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en la petición:', error.message);
  }
};

// Ejecutar la prueba
testServicioUpdate();
