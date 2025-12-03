import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

// Calcular la ruta del archivo .env
// Este archivo está en: api_Registrack/src/config/env.js
// El .env está en: api_Registrack/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

// En plataformas cloud (Render, Heroku, etc.), NO cargar archivo .env (usa variables de entorno del panel)
const isCloud = process.env.RENDER === 'true' || 
                process.env.RENDER || 
                process.env.HEROKU || 
                process.env.DYNO || // Heroku siempre tiene esta variable
                process.env.NODE_ENV === 'production';

if (isCloud) {
  const platform = process.env.RENDER ? 'Render' : process.env.DYNO ? 'Heroku' : 'Cloud';
  console.log(`ℹ️ [ENV] ${platform} detectado - usando variables de entorno del panel (no archivo .env)`);
  // No intentar cargar .env en plataformas cloud
} else {
  // Verificar si el archivo existe (solo en desarrollo/local)
  const envExists = fs.existsSync(envPath);
  
  if (!envExists) {
    console.warn('⚠️ [ENV] El archivo .env NO existe en:', envPath);
    console.warn('   Por favor, crea el archivo .env en la raíz del proyecto (api_Registrack/.env)');
    console.warn('   O configura las variables de entorno en tu sistema');
    // No intentar cargar si no existe
  } else {
    console.log('✅ [ENV] Archivo .env encontrado en:', envPath);
    
    // Cargar el .env solo en desarrollo/local
    // Usar override: false para no sobrescribir variables ya cargadas
    const result = dotenv.config({ path: envPath });

    // Log para verificar qué archivo .env está usando (solo en desarrollo/local)
    if (result.error) {
      console.error('❌ [ENV] Error cargando archivo .env:', result.error);
    } else {
      const variablesCount = Object.keys(result.parsed || {}).length;
      console.log(`📁 [ENV] Archivo .env cargado correctamente`);
      console.log(`   Ruta: ${envPath}`);
      console.log(`   Variables cargadas: ${variablesCount}`);
      
      // Mostrar algunas variables importantes (sin valores sensibles)
      if (result.parsed) {
        console.log('   Variables detectadas:');
        console.log(`     - DB_NAME: ${result.parsed.DB_NAME || '❌ No definido'}`);
        console.log(`     - DB_USER: ${result.parsed.DB_USER || '❌ No definido'}`);
        console.log(`     - DB_HOST: ${result.parsed.DB_HOST || '❌ No definido'}`);
        console.log(`     - EMAIL_PROVIDER: ${result.parsed.EMAIL_PROVIDER || '❌ No definido (usará Gmail por defecto)'}`);
        console.log(`     - MAILGUN_API_KEY: ${result.parsed.MAILGUN_API_KEY ? '✅ Configurado' : '❌ No configurado'}`);
        console.log(`     - MAILGUN_DOMAIN: ${result.parsed.MAILGUN_DOMAIN || '❌ No configurado'}`);
      }
    }
  }
}

export default envPath;

