import bcrypt from "bcryptjs";
import sequelize from "./src/config/db.js";
import { User, Rol } from "./src/models/user_rol.js";
import { createAdminFixed } from "./create-admin-fixed.js";

// Función para verificar si la base de datos está inicializada
async function isDatabaseInitialized() {
  try {
    const userCount = await User.count();
    const roleCount = await Rol.count();
    
    console.log(`📊 Base de datos - Usuarios: ${userCount}, Roles: ${roleCount}`);
    
    // Si hay al menos un usuario y roles, consideramos que está inicializada
    return userCount > 0 && roleCount > 0;
  } catch (error) {
    console.log("⚠️ Error verificando inicialización:", error.message);
    return false;
  }
}

// Función para crear roles básicos
async function seedRoles() {
  try {
    console.log("🌱 Inicializando roles básicos...");

    const rolesBasicos = [
      { nombre: "cliente" },
      { nombre: "administrador" },
      { nombre: "empleado" },
    ];

    for (const rol of rolesBasicos) {
      const [rolCreado, created] = await Rol.findOrCreate({
        where: { nombre: rol.nombre },
        defaults: rol,
      });

      if (created) {
        console.log(`✅ Rol creado: ${rol.nombre}`);
      } else {
        console.log(`ℹ️ Rol ya existe: ${rol.nombre}`);
      }
    }

    console.log("✅ Roles inicializados correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error creando roles:", error);
    return false;
  }
}

// Función para crear usuario administrador
async function createAdmin() {
  try {
    console.log("👤 Verificando usuario administrador...");
    
    // Verificar si ya existe el usuario
    const usuarioExistente = await User.findOne({
      where: { correo: "admin@registrack.com" }
    });

    if (usuarioExistente) {
      console.log("ℹ️ Usuario administrador ya existe");
      return true;
    }

    // Buscar el rol de administrador
    const rolAdmin = await Rol.findOne({
      where: { nombre: "administrador" }
    });

    if (!rolAdmin) {
      console.error("❌ No se encontró el rol de administrador");
      return false;
    }

    console.log(`🔍 Rol administrador encontrado con ID: ${rolAdmin.id}`);

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Admin123!", saltRounds);

    // Crear usuario administrador
    const adminData = {
      tipo_documento: "CC",
      documento: 1234567890,
      nombre: "Admin",
      apellido: "Sistema",
      correo: "admin@registrack.com",
      contrasena: hashedPassword,
      id_rol: rolAdmin.id,
    };

    console.log("📝 Creando usuario administrador con datos:", {
      ...adminData,
      contrasena: "[HASHED]"
    });

    const nuevoAdmin = await User.create(adminData);
    console.log("✅ Usuario administrador creado exitosamente");
    console.log(`📧 Email: admin@registrack.com`);
    console.log(`🔑 Password: Admin123!`);
    console.log(`🆔 ID del usuario: ${nuevoAdmin.id}`);
    
    return true;
  } catch (error) {
    console.error("❌ Error creando administrador:", error);
    console.error("❌ Detalles del error:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
}

// Función principal de inicialización
export async function initializeDatabase() {
  try {
    console.log("🚀 Iniciando verificación de base de datos...");
    
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log("✅ Conexión a base de datos establecida");

    // Sincronizar modelos con la base de datos
    console.log("🔄 Sincronizando modelos con la base de datos...");
    await sequelize.sync({ force: false });
    console.log("✅ Modelos sincronizados");

    // Verificar si ya está inicializada
    const isInitialized = await isDatabaseInitialized();
    
    if (isInitialized) {
      console.log("✅ Base de datos ya está inicializada");
      return true;
    }

    console.log("🔧 Base de datos no inicializada, configurando...");

    // Crear roles primero
    console.log("📋 Paso 1: Creando roles básicos...");
    const rolesCreated = await seedRoles();
    if (!rolesCreated) {
      console.error("❌ Error creando roles, abortando inicialización");
      return false;
    }

    // Esperar un poco para asegurar que los roles se crearon
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Crear administrador
    console.log("👤 Paso 2: Creando usuario administrador...");
    const adminCreated = await createAdminFixed();
    if (!adminCreated) {
      console.error("❌ Error creando administrador, abortando inicialización");
      return false;
    }

    console.log("🎉 Base de datos inicializada correctamente");
    console.log("📊 Resumen:");
    console.log("  - Roles creados: cliente, administrador, empleado");
    console.log("  - Admin creado: admin@registrack.com");
    console.log("  - Password: Admin123!");
    
    return true;
    
  } catch (error) {
    console.error("❌ Error en inicialización de base de datos:", error);
    console.error("❌ Detalles del error:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then((success) => {
      if (success) {
        console.log("✅ Inicialización completada");
        process.exit(0);
      } else {
        console.log("❌ Inicialización falló");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Error fatal:", error);
      process.exit(1);
    });
}
