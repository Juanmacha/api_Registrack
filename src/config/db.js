import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import path from "path";

// Asegurar que .env se cargue desde la raíz del proyecto (api_Registrack/api_Registrack)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

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

try {
  await sequelize.authenticate();
  console.log("✅ Conexión a MySQL exitosa");
} catch (err) {
  console.error("❌ Error de conexión:", err);
}

export default sequelize;
