import dotenv from "dotenv";
import app from "./app.js";
import { initializeDatabase } from "./init-database.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar base de datos (roles y admin)
    console.log("🔧 Verificando inicialización de base de datos...");
    await initializeDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📱 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
