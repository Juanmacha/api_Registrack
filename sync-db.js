#!/usr/bin/env node

import sequelize from "./src/config/db.js";
import { fileURLToPath } from "url";
import path from "path";

// Obtener argumentos de línea de comandos
const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');
const alter = args.includes('--alter') || args.includes('-a');
const help = args.includes('--help') || args.includes('-h');

// Mostrar ayuda si se solicita
if (help) {
  console.log(`
🔄 Sync Database - API Registrack

Uso: node sync-db.js [opciones]

Opciones:
  --force, -f     Forzar recreación de todas las tablas (¡CUIDADO: elimina datos!)
  --alter, -a     Modificar tablas existentes para coincidir con modelos
  --help, -h      Mostrar esta ayuda

Ejemplos:
  node sync-db.js              # Sincronización normal (recomendado)
  node sync-db.js --alter      # Modificar tablas existentes
  node sync-db.js --force      # Recrear todas las tablas (¡pérdida de datos!)

⚠️  ADVERTENCIA: --force eliminará TODOS los datos existentes
`);
  process.exit(0);
}

// Importar todos los modelos para asegurar que las asociaciones se definan
console.log("📦 Cargando modelos...");

// Modelos principales
import "./src/models/user.js";
import "./src/models/user_rol.js";
import "./src/models/Role.js";
import "./src/models/Permiso.js";
import "./src/models/Privilegio.js";
import "./src/models/rol_permiso_privilegio.js";

// Modelos de negocio
import "./src/models/Servicio.js";
import "./src/models/Proceso.js";
import "./src/models/ServicioProceso.js";
import "./src/models/OrdenServicio.js";
import "./src/models/DetalleOrdenServicio.js";
import "./src/models/DetalleServicioOrdenProceso.js";

// Modelos de usuarios y clientes
import "./src/models/Empleado.js";
import "./src/models/Cliente.js";
import "./src/models/Empresa.js";
import "./src/models/EmpresaCliente.js";

// Modelos de operaciones
import "./src/models/citas.js";
import "./src/models/solicitud_cita.js";
import "./src/models/Seguimiento.js";
import "./src/models/pago.model.js";

// Modelos de archivos
import "./src/models/Archivo.js";
import "./src/models/TipoArchivo.js";

// Importar el modelo de orden_servico_Servicio (relación intermedia)
import "./src/models/orden_servico_Servicio.js";

console.log("✅ Modelos cargados correctamente");

async function syncDatabase() {
  const startTime = Date.now();
  
  try {
    console.log("\n🔄 Iniciando sincronización de la base de datos...");
    console.log(`📊 Configuración: ${force ? 'FORCE (recrear tablas)' : alter ? 'ALTER (modificar tablas)' : 'NORMAL (crear si no existen)'}`);
    
    if (force) {
      console.log("⚠️  ADVERTENCIA: Se eliminarán TODOS los datos existentes");
      console.log("⏳ Esperando 5 segundos... (Ctrl+C para cancelar)");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Verificar conexión a la base de datos
    console.log("🔌 Verificando conexión a la base de datos...");
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos establecida");

    // Obtener información de la base de datos
    const [results] = await sequelize.query("SELECT DATABASE() as db_name");
    const dbName = results[0].db_name;
    console.log(`📋 Base de datos: ${dbName}`);

    // Sincronizar todos los modelos
    console.log("🔄 Sincronizando modelos...");
    
    const syncOptions = {
      force: force,
      alter: alter && !force,
      logging: false // Deshabilitar logs de Sequelize para mayor claridad
    };

    await sequelize.sync(syncOptions);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n✅ Base de datos sincronizada exitosamente");
    console.log(`⏱️  Tiempo de sincronización: ${duration}s`);

    // Mostrar información de las tablas creadas
    console.log("\n📋 Tablas en la base de datos:");
    
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${dbName}' 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

    if (tables.length > 0) {
      console.log("┌─────────────────────────────────┬─────────────┬─────────────┬─────────────┐");
      console.log("│ Tabla                           │ Filas       │ Datos (KB)  │ Índices (KB)│");
      console.log("├─────────────────────────────────┼─────────────┼─────────────┼─────────────┤");
      
      tables.forEach(table => {
        const name = table.TABLE_NAME.padEnd(31);
        const rows = (table.TABLE_ROWS || 0).toString().padStart(11);
        const dataSize = ((table.DATA_LENGTH || 0) / 1024).toFixed(0).padStart(11);
        const indexSize = ((table.INDEX_LENGTH || 0) / 1024).toFixed(0).padStart(11);
        console.log(`│ ${name} │ ${rows} │ ${dataSize} │ ${indexSize} │`);
      });
      
      console.log("└─────────────────────────────────┴─────────────┴─────────────┴─────────────┘");
    }

    // Mostrar resumen de modelos sincronizados
    console.log("\n🎯 Modelos sincronizados:");
    const modelNames = [
      "👤 Usuarios y Roles",
      "🏢 Empresas y Clientes", 
      "👨‍💼 Empleados",
      "🛍️ Servicios y Procesos",
      "📋 Órdenes de Servicio",
      "📅 Citas y Solicitudes",
      "📊 Seguimiento",
      "💰 Pagos",
      "📁 Archivos y Tipos",
      "🔐 Permisos y Privilegios"
    ];

    modelNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });

    // Verificar integridad de las asociaciones
    console.log("\n🔗 Verificando asociaciones...");
    const models = Object.values(sequelize.models);
    let associationCount = 0;
    
    models.forEach(model => {
      const associations = Object.keys(model.associations || {});
      associationCount += associations.length;
    });
    
    console.log(`✅ ${associationCount} asociaciones definidas correctamente`);

    // Mostrar próximos pasos
    console.log("\n📝 Próximos pasos recomendados:");
    console.log("  1. Ejecutar: npm run seed-roles");
    console.log("  2. Ejecutar: npm run create-admin");
    console.log("  3. Iniciar servidor: npm run dev");
    
    if (force) {
      console.log("\n⚠️  IMPORTANTE: Se recrearon todas las tablas");
      console.log("   - Ejecuta los scripts de seed para restaurar datos básicos");
      console.log("   - Crea un nuevo usuario administrador");
    }

    console.log("\n🎉 Proceso de sincronización completado exitosamente");

  } catch (error) {
    console.error("\n❌ Error durante la sincronización:");
    console.error("─".repeat(50));
    
    if (error.name === 'SequelizeConnectionError') {
      console.error("🔌 Error de conexión a la base de datos:");
      console.error("   - Verifica que MySQL esté ejecutándose");
      console.error("   - Comprueba las credenciales en .env");
      console.error("   - Asegúrate de que la base de datos exista");
    } else if (error.name === 'SequelizeValidationError') {
      console.error("📝 Error de validación en los modelos:");
      console.error("   - Revisa las definiciones de los modelos");
      console.error("   - Verifica los tipos de datos y restricciones");
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error("🗄️ Error de base de datos:");
      console.error("   - Verifica los permisos del usuario de BD");
      console.error("   - Comprueba la versión de MySQL (requiere 8.0+)");
    } else {
      console.error("🚨 Error inesperado:");
      console.error(`   Tipo: ${error.name}`);
      console.error(`   Mensaje: ${error.message}`);
    }
    
    console.error("\n📚 Para más ayuda:");
    console.error("   - Revisa la documentación en README.md");
    console.error("   - Verifica la configuración de .env");
    console.error("   - Consulta los logs de MySQL");
    
    process.exit(1);
  } finally {
    console.log("\n🔌 Cerrando conexión a la base de datos...");
    await sequelize.close();
    console.log("✅ Conexión cerrada");
  }
}

// Manejar señales de interrupción
process.on('SIGINT', async () => {
  console.log("\n\n⚠️  Sincronización interrumpida por el usuario");
  console.log("🔌 Cerrando conexión...");
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log("\n\n⚠️  Sincronización terminada");
  console.log("🔌 Cerrando conexión...");
  await sequelize.close();
  process.exit(0);
});

// Ejecutar sincronización
syncDatabase();