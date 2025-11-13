import { Sequelize } from "sequelize";
// Cargar .env desde el archivo centralizado
import "./env.js";

console.log("Conectando a MySQL con:", {
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  pass: process.env.DB_PASS ? "***" : undefined,
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
    logging: false
  }
);

// Función para probar la conexión
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a MySQL exitosa");
    return true;
  } catch (err) {
    console.error("❌ Error de conexión:", err);
    return false;
  }
}

export default sequelize;
