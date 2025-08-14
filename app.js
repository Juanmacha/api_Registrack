import express from "express";
import cors from "cors";
import usuarioRoutes from "./routes/usuario.routes.js";
import sequelize from "./database/database.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/usuarios", usuarioRoutes);

try {
  await sequelize.authenticate();
  console.log("✅ Conectado a la base de datos");
  await sequelize.sync(); // Crea tablas si no existen
} catch (error) {
  console.error("❌ Error al conectar BD:", error);
}

app.listen(3000, () => console.log("🚀 Servidor en puerto 3000"));
