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

// Verificar si el archivo existe
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error('❌ [ENV] El archivo .env NO existe en:', envPath);
  console.error('   Por favor, crea el archivo .env en la raíz del proyecto (api_Registrack/.env)');
} else {
  console.log('✅ [ENV] Archivo .env encontrado en:', envPath);
}

// Cargar el .env solo una vez
// Usar override: false para no sobrescribir variables ya cargadas
const result = dotenv.config({ path: envPath });

// Log para verificar qué archivo .env está usando
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

export default envPath;

