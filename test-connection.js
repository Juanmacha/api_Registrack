import dotenv from "dotenv";
import { Sequelize } from "sequelize";

// Cargar variables de entorno
dotenv.config();

console.log("🔧 Probando conexión a la base de datos...");
console.log("Configuración:", {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log
  }
);

try {
  console.log("🔄 Intentando conectar...");
  await sequelize.authenticate();
  console.log("✅ Conexión exitosa!");
  await sequelize.close();
  console.log("🔒 Conexión cerrada");
} catch (err) {
  console.error("❌ Error de conexión:", err.message);
  console.error("❌ Detalles:", err);
} finally {
  process.exit(0);
}
