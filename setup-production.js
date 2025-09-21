/**
 * Script de configuración para producción
 * Configura el sistema de mensajes mejorado en el entorno de producción
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

// Configuración de producción
const PRODUCTION_CONFIG = {
  environment: 'production',
  logLevel: 'info',
  enableMonitoring: true,
  enableMessageValidation: true,
  enableResponseLogging: false, // Deshabilitado en producción por rendimiento
  enableDetailedErrors: false, // Solo errores básicos en producción
  monitoringInterval: 300000, // 5 minutos
  maxLogFileSize: '10MB',
  logRetentionDays: 30
};

// Función para crear archivo de configuración de producción
async function createProductionConfig() {
  logSection('CREANDO CONFIGURACIÓN DE PRODUCCIÓN');
  
  const configContent = `/**
 * Configuración de producción para el sistema de mensajes
 * Generado automáticamente por setup-production.js
 */

export const PRODUCTION_MESSAGE_CONFIG = {
  // Configuración de entorno
  environment: '${PRODUCTION_CONFIG.environment}',
  logLevel: '${PRODUCTION_CONFIG.logLevel}',
  
  // Configuración de mensajes
  enableDetailedErrors: ${PRODUCTION_CONFIG.enableDetailedErrors},
  enableResponseLogging: ${PRODUCTION_CONFIG.enableResponseLogging},
  enableMessageValidation: ${PRODUCTION_CONFIG.enableMessageValidation},
  
  // Configuración de monitoreo
  enableMonitoring: ${PRODUCTION_CONFIG.enableMonitoring},
  monitoringInterval: ${PRODUCTION_CONFIG.monitoringInterval},
  
  // Configuración de logs
  maxLogFileSize: '${PRODUCTION_CONFIG.maxLogFileSize}',
  logRetentionDays: ${PRODUCTION_CONFIG.logRetentionDays},
  
  // Configuración de seguridad
  hideInternalErrors: true,
  sanitizeErrorMessages: true,
  
  // Configuración de rendimiento
  enableResponseCaching: true,
  maxResponseCacheSize: '50MB',
  responseCacheTTL: 300000, // 5 minutos
  
  // Configuración de alertas
  enableAlerts: true,
  alertThresholds: {
    errorRate: 0.1, // 10%
    responseTime: 5000, // 5 segundos
    messageQuality: 0.9 // 90%
  }
};

export default PRODUCTION_MESSAGE_CONFIG;
`;

  try {
    await fs.writeFile(
      path.join(__dirname, 'src', 'config', 'production-messages.js'),
      configContent
    );
    log('✅ Archivo de configuración de producción creado', 'green');
  } catch (error) {
    log(`❌ Error creando configuración: ${error.message}`, 'red');
    throw error;
  }
}

// Función para crear archivo de variables de entorno de producción
async function createProductionEnv() {
  logSection('CREANDO VARIABLES DE ENTORNO DE PRODUCCIÓN');
  
  const envContent = `# Configuración de producción para el sistema de mensajes
# Generado automáticamente por setup-production.js

# Entorno
NODE_ENV=production

# Configuración de mensajes
MESSAGE_LOG_LEVEL=info
ENABLE_MESSAGE_VALIDATION=true
ENABLE_RESPONSE_LOGGING=false
ENABLE_DETAILED_ERRORS=false

# Configuración de monitoreo
ENABLE_MESSAGE_MONITORING=true
MONITORING_INTERVAL=300000
MONITORING_LOG_FILE=message-monitoring.log

# Configuración de logs
MAX_LOG_FILE_SIZE=10MB
LOG_RETENTION_DAYS=30

# Configuración de seguridad
HIDE_INTERNAL_ERRORS=true
SANITIZE_ERROR_MESSAGES=true

# Configuración de rendimiento
ENABLE_RESPONSE_CACHING=true
MAX_RESPONSE_CACHE_SIZE=50MB
RESPONSE_CACHE_TTL=300000

# Configuración de alertas
ENABLE_ALERTS=true
ALERT_ERROR_RATE_THRESHOLD=0.1
ALERT_RESPONSE_TIME_THRESHOLD=5000
ALERT_MESSAGE_QUALITY_THRESHOLD=0.9

# URLs de monitoreo
MONITORING_WEBHOOK_URL=
ALERT_EMAIL=
SLACK_WEBHOOK_URL=
`;

  try {
    await fs.writeFile(
      path.join(__dirname, '.env.production'),
      envContent
    );
    log('✅ Archivo .env.production creado', 'green');
  } catch (error) {
    log(`❌ Error creando .env.production: ${error.message}`, 'red');
    throw error;
  }
}

// Función para crear script de inicio de producción
async function createProductionStartScript() {
  logSection('CREANDO SCRIPT DE INICIO DE PRODUCCIÓN');
  
  const startScriptContent = `#!/bin/bash

# Script de inicio para producción con sistema de mensajes mejorado
# Generado automáticamente por setup-production.js

echo "🚀 Iniciando API Registrack en modo producción..."

# Cargar variables de entorno de producción
if [ -f .env.production ]; then
    export \$(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Variables de entorno de producción cargadas"
else
    echo "⚠️  Archivo .env.production no encontrado, usando configuración por defecto"
fi

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --production
fi

# Verificar conexión a la base de datos
echo "🔌 Verificando conexión a la base de datos..."
node -e "
import('./src/config/db.js').then(() => {
  console.log('✅ Conexión a la base de datos exitosa');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error de conexión a la base de datos:', err.message);
  process.exit(1);
});
"

if [ $? -ne 0 ]; then
    echo "❌ No se pudo conectar a la base de datos"
    exit 1
fi

# Sincronizar base de datos
echo "🔄 Sincronizando base de datos..."
npm run sync-db

if [ $? -ne 0 ]; then
    echo "❌ Error sincronizando base de datos"
    exit 1
fi

# Iniciar monitoreo en segundo plano si está habilitado
if [ "$ENABLE_MESSAGE_MONITORING" = "true" ]; then
    echo "📊 Iniciando monitoreo de mensajes..."
    nohup node monitor-messages.js > monitoring.log 2>&1 &
    echo $! > monitoring.pid
    echo "✅ Monitoreo iniciado (PID: \$(cat monitoring.pid))"
fi

# Iniciar servidor
echo "🌐 Iniciando servidor..."
node server.js

# Limpiar procesos en caso de cierre
cleanup() {
    echo "\\n👋 Cerrando servidor..."
    if [ -f monitoring.pid ]; then
        kill \$(cat monitoring.pid) 2>/dev/null
        rm monitoring.pid
        echo "✅ Monitoreo detenido"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM
`;

  try {
    await fs.writeFile(
      path.join(__dirname, 'start-production.sh'),
      startScriptContent
    );
    
    // Hacer el script ejecutable
    await fs.chmod(path.join(__dirname, 'start-production.sh'), '755');
    log('✅ Script de inicio de producción creado', 'green');
  } catch (error) {
    log(`❌ Error creando script de inicio: ${error.message}`, 'red');
    throw error;
  }
}

// Función para crear script de Docker
async function createDockerfile() {
  logSection('CREANDO DOCKERFILE PARA PRODUCCIÓN');
  
  const dockerfileContent = `# Dockerfile para API Registrack con sistema de mensajes mejorado
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para logs
RUN mkdir -p logs

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Cambiar permisos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV MESSAGE_LOG_LEVEL=info
ENV ENABLE_MESSAGE_VALIDATION=true
ENV ENABLE_RESPONSE_LOGGING=false
ENV ENABLE_DETAILED_ERRORS=false

# Script de inicio
CMD ["sh", "start-production.sh"]
`;

  try {
    await fs.writeFile(
      path.join(__dirname, 'Dockerfile.production'),
      dockerfileContent
    );
    log('✅ Dockerfile de producción creado', 'green');
  } catch (error) {
    log(`❌ Error creando Dockerfile: ${error.message}`, 'red');
    throw error;
  }
}

// Función para crear docker-compose de producción
async function createDockerCompose() {
  logSection('CREANDO DOCKER-COMPOSE PARA PRODUCCIÓN');
  
  const dockerComposeContent = `version: '3.8'

services:
  api-registrack:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=registrack_db
      - DB_USER=registrack_user
      - DB_PASS=registrack_password
      - JWT_SECRET=your-super-secret-jwt-key
      - MESSAGE_LOG_LEVEL=info
      - ENABLE_MESSAGE_VALIDATION=true
      - ENABLE_RESPONSE_LOGGING=false
      - ENABLE_DETAILED_ERRORS=false
      - ENABLE_MESSAGE_MONITORING=true
    depends_on:
      - mysql
      - redis
    volumes:
      - ./logs:/app/logs
      - ./monitoring.log:/app/monitoring.log
    restart: unless-stopped
    networks:
      - registrack-network

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=registrack_db
      - MYSQL_USER=registrack_user
      - MYSQL_PASSWORD=registrack_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema_completo.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    restart: unless-stopped
    networks:
      - registrack-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - registrack-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api-registrack
    restart: unless-stopped
    networks:
      - registrack-network

volumes:
  mysql_data:
  redis_data:

networks:
  registrack-network:
    driver: bridge
`;

  try {
    await fs.writeFile(
      path.join(__dirname, 'docker-compose.production.yml'),
      dockerComposeContent
    );
    log('✅ Docker Compose de producción creado', 'green');
  } catch (error) {
    log(`❌ Error creando Docker Compose: ${error.message}`, 'red');
    throw error;
  }
}

// Función para crear documentación de despliegue
async function createDeploymentDocs() {
  logSection('CREANDO DOCUMENTACIÓN DE DESPLIEGUE');
  
  const docsContent = `# Guía de Despliegue en Producción - Sistema de Mensajes Mejorado

## 🚀 Despliegue Rápido

### Opción 1: Script de Inicio
\`\`\`bash
# Hacer ejecutable el script
chmod +x start-production.sh

# Iniciar en producción
./start-production.sh
\`\`\`

### Opción 2: Docker
\`\`\`bash
# Construir y ejecutar con Docker Compose
docker-compose -f docker-compose.production.yml up -d

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
\`\`\`

## 📋 Configuración Previa

### 1. Variables de Entorno
Copiar y configurar \`.env.production\`:
\`\`\`bash
cp .env.production .env
# Editar variables según tu entorno
\`\`\`

### 2. Base de Datos
\`\`\`bash
# Sincronizar base de datos
npm run sync-db

# Crear roles y usuario administrador
npm run seed-roles
npm run create-admin
\`\`\`

## 🔧 Configuración del Sistema de Mensajes

### Variables de Entorno Importantes
- \`MESSAGE_LOG_LEVEL\`: Nivel de logging (debug, info, warn, error)
- \`ENABLE_MESSAGE_VALIDATION\`: Habilitar validaciones mejoradas
- \`ENABLE_RESPONSE_LOGGING\`: Habilitar logging de respuestas
- \`ENABLE_DETAILED_ERRORS\`: Mostrar errores detallados
- \`ENABLE_MESSAGE_MONITORING\`: Habilitar monitoreo automático

### Monitoreo
\`\`\`bash
# Ejecutar test único
node monitor-messages.js --test

# Monitoreo continuo
node monitor-messages.js
\`\`\`

## 📊 Métricas y Alertas

### Métricas Disponibles
- Tasa de éxito de requests
- Tiempo promedio de respuesta
- Calidad de mensajes
- Tipos de errores más comunes

### Configuración de Alertas
Editar \`monitor-messages.js\` para configurar:
- Webhooks de Slack
- Emails de alerta
- Umbrales de error

## 🔍 Troubleshooting

### Problemas Comunes
1. **Error de conexión a BD**: Verificar variables de entorno
2. **Mensajes inconsistentes**: Verificar configuración de validación
3. **Monitoreo no funciona**: Verificar permisos de archivos

### Logs
- \`message-monitoring.log\`: Logs de monitoreo
- \`monitoring.log\`: Logs del proceso de monitoreo
- Logs de aplicación en \`logs/\`

## 🛡️ Seguridad

### Configuración de Producción
- \`HIDE_INTERNAL_ERRORS=true\`: Ocultar errores internos
- \`SANITIZE_ERROR_MESSAGES=true\`: Sanitizar mensajes de error
- \`ENABLE_RESPONSE_CACHING=true\`: Habilitar caché de respuestas

### Recomendaciones
- Usar HTTPS en producción
- Configurar firewall apropiadamente
- Monitorear logs regularmente
- Mantener dependencias actualizadas

## 📈 Escalabilidad

### Configuración de Caché
- \`MAX_RESPONSE_CACHE_SIZE\`: Tamaño máximo de caché
- \`RESPONSE_CACHE_TTL\`: Tiempo de vida del caché

### Monitoreo de Rendimiento
- Configurar alertas de tiempo de respuesta
- Monitorear uso de memoria
- Configurar auto-scaling según métricas
`;

  try {
    await fs.writeFile(
      path.join(__dirname, 'DEPLOYMENT.md'),
      docsContent
    );
    log('✅ Documentación de despliegue creada', 'green');
  } catch (error) {
    log(`❌ Error creando documentación: ${error.message}`, 'red');
    throw error;
  }
}

// Función principal
async function setupProduction() {
  logSection('CONFIGURANDO SISTEMA DE MENSAJES PARA PRODUCCIÓN');
  
  try {
    await createProductionConfig();
    await createProductionEnv();
    await createProductionStartScript();
    await createDockerfile();
    await createDockerCompose();
    await createDeploymentDocs();
    
    logSection('CONFIGURACIÓN COMPLETADA');
    log('✅ Todos los archivos de producción han sido creados', 'green');
    log('\n📋 Archivos creados:', 'blue');
    log('  - src/config/production-messages.js', 'green');
    log('  - .env.production', 'green');
    log('  - start-production.sh', 'green');
    log('  - Dockerfile.production', 'green');
    log('  - docker-compose.production.yml', 'green');
    log('  - DEPLOYMENT.md', 'green');
    
    log('\n🚀 Próximos pasos:', 'yellow');
    log('  1. Revisar y configurar .env.production', 'blue');
    log('  2. Ejecutar: chmod +x start-production.sh', 'blue');
    log('  3. Probar: ./start-production.sh', 'blue');
    log('  4. O usar Docker: docker-compose -f docker-compose.production.yml up -d', 'blue');
    
  } catch (error) {
    log(`❌ Error en configuración: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar configuración
setupProduction();
