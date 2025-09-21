import bcrypt from "bcryptjs";
import sequelize from "./src/config/db.js";
import { User, Rol } from "./src/models/user_rol.js";

async function createAdmin() {
  try {
    console.log("Creando usuario administrador...");
    // Datos del administrador
    const adminData = {
      tipo_documento: "CC",
      documento: 1234567890, // 10 dígitos para cumplir constraint
      nombre: "Admin",
      apellido: "Sistema",
      correo: "admin@registrack.com", // Añadido el correo electrónico
      contrasena: "Admin123!", // Se hasheará automáticamente
    };

    // Verificar si ya existe el usuario
    console.log("🔍 Verificando si el usuario ya existe...");
    const usuarioExistente = await User.findOne({
      where: { correo: adminData.correo },
    });
    if (usuarioExistente) {
      console.log("El usuario administrador ya existe:");
      console.log(`   Email: ${adminData.correo}`);
      console.log(`   Password: ${adminData.contrasena}`);
      console.log("\n Puedes usar estas credenciales en Postman");
      return;
    }

    // Buscar el rol de administrador
    console.log("Buscando rol de administrador...");
    const rolAdmin = await Rol.findOne({
      where: { nombre: "administrador" },
    });

    if (!rolAdmin) {
      throw new Error(
        " Rol 'administrador' no encontrado. Ejecuta primero: npm run seed-roles"
      );
    }

    console.log(` Rol administrador encontrado (ID: ${rolAdmin.id_rol})`);

    // Hashear la contraseña
    console.log(" Hasheando contraseña...");
    const hashedPassword = await bcrypt.hash(adminData.contrasena, 10);
    // Crear el usuario administrador
    console.log(" Creando usuario administrador...");
    const nuevoAdmin = await User.create({
      tipo_documento: adminData.tipo_documento,
      documento: adminData.documento,
      nombre: adminData.nombre,
      apellido: adminData.apellido,
      correo: adminData.correo,
      contrasena: hashedPassword,
      id_rol: rolAdmin.id_rol,
    });
    console.log(" Usuario administrador creado exitosamente!");
    console.log("\n CREDENCIALES PARA POSTMAN:");
    console.log(`   Email: ${adminData.correo}`);
    console.log(`   Password: ${adminData.contrasena}`);
    console.log(`   Rol: administrador`);
    console.log(`   ID Usuario: ${nuevoAdmin.id_usuario}`);
    console.log(
      "\n Ahora puedes hacer login en Postman con estas credenciales"
    );
    console.log("\n Ejemplo de JSON para login:");
    console.log(`{
  "correo": "${adminData.correo}",
  "contrasena": "${adminData.contrasena}"
}`);
  } catch (error) {
    console.error(" Error al crear usuario administrador:", error.message);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
