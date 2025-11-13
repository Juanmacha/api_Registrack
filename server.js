// Cargar .env PRIMERO, antes de cualquier otro import
import "./src/config/env.js";

import app from "./app.js";
import { initializeDatabase } from "./init-database.js";

const PORT = process.env.PORT || 3000;

// ==========================================
// CONFIGURACIÓN DE TAREAS PROGRAMADAS (CRON)
// ==========================================

/**
 * Cron simple: Verificar cada 24 horas
 * @param {Function} callback - Función a ejecutar
 * @param {number} hours - Horas entre ejecuciones (default: 24)
 * @returns {NodeJS.Timeout} Interval ID
 */
function setCronDaily(callback, hours = 24) {
  const ms = hours * 60 * 60 * 1000; // Convertir horas a milisegundos
  
  const interval = setInterval(async () => {
    console.log(`⏰ Ejecutando tarea programada (cada ${hours} horas)...`);
    try {
      await callback();
    } catch (error) {
      console.error('❌ Error en tarea programada:', error);
    }
  }, ms);

  console.log(`✅ Tarea programada configurada: se ejecutará cada ${hours} horas`);
  return interval;
}

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar base de datos (roles y admin)
    console.log("🔧 Verificando inicialización de base de datos...");
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log('');
      
      // Configurar trabajos programados
      console.log('🕐 Configurando tareas programadas...');
      
      // Job de alertas de renovación (cada 24 horas a las 9:00 AM)
      if (process.env.ENABLE_RENOVATION_ALERTS !== 'false') {
        // Calcular tiempo hasta las 9:00 AM del día siguiente
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(9, 0, 0, 0);
        
        if (targetTime <= now) {
          targetTime.setDate(targetTime.getDate() + 1);
        }
        
        const timeUntil9AM = targetTime.getTime() - now.getTime();
        
        console.log(`⏰ Primera ejecución de alertas de renovación: ${targetTime.toLocaleString('es-CO')}`);
        console.log(`   (en ${Math.round(timeUntil9AM / 1000 / 60)} minutos)`);
        
        // Ejecutar después de la primera espera
        setTimeout(async () => {
          const { RenovationAlertService } = await import('./src/services/renovation-alert.service.js');
          await RenovationAlertService.enviarAlertasDiarias();
        }, timeUntil9AM);
        
        // Luego ejecutar cada 24 horas
        setCronDaily(async () => {
          const { RenovationAlertService } = await import('./src/services/renovation-alert.service.js');
          await RenovationAlertService.enviarAlertasDiarias();
        }, 24);
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
