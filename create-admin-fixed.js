import bcrypt from "bcryptjs";
import sequelize from "./src/config/db.js";
import { User, Rol } from "./src/models/user_rol.js";

async function createAdminFixed() {
  try {
    console.log("🔧 Creando usuario administrador con estructura corregida...");
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log("✅ Conexión a base de datos establecida");

    // Sincronizar modelos
    await sequelize.sync({ force: false });
    console.log("✅ Modelos sincronizados");

    // Verificar si ya existe el usuario
    const usuarioExistente = await User.findOne({
      where: { correo: "admin@registrack.com" }
    });

    if (usuarioExistente) {
      console.log("ℹ️ Usuario administrador ya existe");
      console.log("📧 Email:", usuarioExistente.correo);
      console.log("🆔 ID:", usuarioExistente.id_usuario);
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

    console.log(`🔍 Rol administrador encontrado con ID: ${rolAdmin.id_rol}`);

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash("Admin123!", saltRounds);

    // Crear usuario administrador con la estructura correcta
    const adminData = {
      tipo_documento: "CC",
      documento: 1234567890,
      nombre: "Admin",
      apellido: "Sistema",
      correo: "admin@registrack.com",
      contrasena: hashedPassword,
      id_rol: rolAdmin.id_rol, // Usar id_rol del modelo Rol
      estado: true // Campo estado requerido
    };

    console.log("📝 Creando usuario administrador con datos:", {
      ...adminData,
      contrasena: "[HASHED]"
    });

    const nuevoAdmin = await User.create(adminData);
    console.log("✅ Usuario administrador creado exitosamente");
    console.log(`📧 Email: admin@registrack.com`);
    console.log(`🔑 Password: Admin123!`);
    console.log(`🆔 ID del usuario: ${nuevoAdmin.id_usuario}`);
    console.log(`👤 Rol ID: ${nuevoAdmin.id_rol}`);
    
    // Verificar que se creó correctamente
    const usuarioVerificado = await User.findOne({
      where: { correo: "admin@registrack.com" },
      include: [
        {
          model: Rol,
          as: "rol",
          attributes: ["id_rol", "nombre"]
        }
      ]
    });

    if (usuarioVerificado) {
      console.log("✅ Verificación exitosa - Usuario encontrado en base de datos");
      console.log("📊 Datos del usuario:", {
        id: usuarioVerificado.id_usuario,
        nombre: usuarioVerificado.nombre,
        correo: usuarioVerificado.correo,
        rol: usuarioVerificado.rol?.nombre,
        estado: usuarioVerificado.estado
      });
    } else {
      console.error("❌ Error: Usuario no se encontró después de crear");
    }
    
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

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createAdminFixed()
    .then((success) => {
      if (success) {
        console.log("✅ Creación de admin completada");
        process.exit(0);
      } else {
        console.log("❌ Creación de admin falló");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Error fatal:", error);
      process.exit(1);
    });
}

export { createAdminFixed };
