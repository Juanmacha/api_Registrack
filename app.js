import express from "express";
import cors from "cors";

import pagoRoutes from "./src/routes/pago.routes.js";
import UsuarioRoutes from "./src/routes/usuario.routes.js";
import EmpleadoRoutes from "./src/routes/empleado.routes.js";
import RolesRoutes from "./src/routes/role.routes.js";
import PermisoRoutes from "./src/routes/permiso.routes.js";
import PrivilegioRoutes from "./src/routes/privilegio.routes.js";
import CitasRoutes from "./src/routes/citas.routes.js";
import ServicioRoutes from "./src/routes/servicio.routes.js";
import SeguimientoRoutes from "./src/routes/seguimiento.routes.js";
import SolicitudesRoutes from "./src/routes/solicitudes.routes.js";
import SolicitudCitaRoutes from "./src/routes/solicitud_cita.routes.js";
import ClienteRoutes from "./src/routes/cliente.routes.js";
import EmpresaRoutes from "./src/routes/empresa.routes.js";
import FormularioDinamicoRoutes from "./src/routes/formularioDinamico.routes.js";
import TipoArchivoRoutes from "./src/routes/tipoArchivo.routes.js";
import ArchivoRoutes from "./src/routes/archivo.routes.js";
import DetalleOrdenRoutes from "./src/routes/detalleOrden.routes.js";
import DetalleProcesoRoutes from "./src/routes/detalleProceso.routes.js";
import ServicioProcesoRoutes from "./src/routes/servicioProceso.routes.js";

import {
  errorHandler,
  notFoundHandler,
} from "./src/middlewares/error.middleware.js";

// Importar nuevos middlewares de respuesta
import { 
  successResponse, 
  errorResponse, 
  responseLogger,
  sequelizeErrorHandler 
} from "./src/middlewares/response.middleware.js";

import "./src/config/db.js";

//  Importaremos los middlewares de seguridad
import { authMiddleware } from "./src/middlewares/auth.middleware.js";
import { roleMiddleware } from "./src/middlewares/role.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint para Render
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API Registrack is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint manual para inicializar base de datos
app.post('/api/admin/init-database', async (req, res) => {
  try {
    const { initializeDatabase } = await import('./init-database.js');
    
    console.log("🔧 Inicialización manual de base de datos solicitada...");
    const success = await initializeDatabase();
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Base de datos inicializada correctamente',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error inicializando base de datos',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("❌ Error en inicialización manual:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para crear admin específicamente
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { createAdminFixed } = await import('./create-admin-fixed.js');
    
    console.log("👤 Creación manual de administrador solicitada...");
    const success = await createAdminFixed();
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Administrador creado correctamente',
        credentials: {
          email: 'admin@registrack.com',
          password: 'Admin123!'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error creando administrador',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("❌ Error en creación manual de admin:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Aplicar middlewares de respuesta estandarizada
app.use(successResponse());
app.use(errorResponse());
app.use(responseLogger);

// Usuarios: aquí suele estar el login/registro (NO necesita auth globalmente)
app.use("/api/usuarios", UsuarioRoutes);

// Servicios: rutas públicas para consultar servicios
app.use("/api/servicios", ServicioRoutes);

// Formularios dinámicos: rutas públicas para validación
app.use("/api/formularios-dinamicos", FormularioDinamicoRoutes);

// Rutas protegidas
app.use("/api/gestion-empleados", authMiddleware, EmpleadoRoutes);
app.use("/api/gestion-pagos", authMiddleware, pagoRoutes);
app.use("/api/gestion-roles", authMiddleware, RolesRoutes);
app.use("/api/gestion-permisos", authMiddleware, PermisoRoutes);
app.use("/api/gestion-privilegios", authMiddleware, PrivilegioRoutes);
app.use("/api/gestion-citas", authMiddleware, CitasRoutes);
app.use("/api/gestion-solicitudes", authMiddleware, SolicitudesRoutes);
app.use("/api/gestion-solicitud-cita", authMiddleware, SolicitudCitaRoutes);
app.use("/api/seguimiento", authMiddleware, SeguimientoRoutes);
app.use("/api/gestion-clientes", authMiddleware, ClienteRoutes);
app.use("/api/gestion-empresas", authMiddleware, EmpresaRoutes);
app.use("/api/gestion-tipo-archivos", TipoArchivoRoutes);
app.use("/api/gestion-archivos", ArchivoRoutes);
app.use("/api/detalles-orden", DetalleOrdenRoutes);
app.use("/api/detalles-procesos", DetalleProcesoRoutes);
app.use("/api/gestion-servicios-procesos", ServicioProcesoRoutes);

// Middleware para manejar rutas no encontradas (debe ir antes del error handler)
app.use(notFoundHandler);

// Middleware para manejo de errores de Sequelize (antes del error handler general)
app.use(sequelizeErrorHandler);

// Middleware para manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
