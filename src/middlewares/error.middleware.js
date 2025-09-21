import { 
  ERROR_CODES, 
  ERROR_MESSAGES, 
  createErrorResponse 
} from '../constants/messages.js';

// Middleware para manejo centralizado de errores
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Error de validación de JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    const response = createErrorResponse(
      "JSON inválido en el body de la petición",
      ERROR_CODES.VALIDATION_ERROR,
      { details: "Formato de JSON incorrecto" }
    );
    return res.status(400).json(response);
  }

  // Error de validación de datos
  if (err.name === "ValidationError") {
    const response = createErrorResponse(
      ERROR_MESSAGES.VALIDATION_FAILED,
      ERROR_CODES.VALIDATION_ERROR,
      { details: err.message }
    );
    return res.status(400).json(response);
  }

  // Error de base de datos
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value,
      validator: error.validatorKey
    }));
    
    const response = createErrorResponse(
      ERROR_MESSAGES.VALIDATION_FAILED,
      ERROR_CODES.VALIDATION_ERROR,
      { errors }
    );
    return res.status(400).json(response);
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || 'campo';
    const value = err.errors[0]?.value || 'valor';
    const message = `El valor '${value}' ya existe para el campo '${field}'`;
    
    const response = createErrorResponse(
      message,
      ERROR_CODES.DUPLICATE_VALUE,
      { field, value }
    );
    return res.status(409).json(response);
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    const response = createErrorResponse(
      "Violación de restricción de clave foránea. Verifique que los IDs relacionados existan.",
      ERROR_CODES.VALIDATION_ERROR,
      { details: err.message }
    );
    return res.status(400).json(response);
  }

  // Error de conexión a base de datos
  if (err.name === "SequelizeConnectionError") {
    const response = createErrorResponse(
      ERROR_MESSAGES.CONNECTION_ERROR,
      ERROR_CODES.CONNECTION_ERROR,
      { details: "Servicio temporalmente no disponible" }
    );
    return res.status(503).json(response);
  }

  if (err.name === "SequelizeDatabaseError") {
    const response = createErrorResponse(
      ERROR_MESSAGES.DATABASE_ERROR,
      ERROR_CODES.DATABASE_ERROR,
      { details: process.env.NODE_ENV === "development" ? err.message : "Error en la base de datos" }
    );
    return res.status(500).json(response);
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    const response = createErrorResponse(
      ERROR_MESSAGES.TOKEN_INVALID,
      ERROR_CODES.TOKEN_INVALID
    );
    return res.status(401).json(response);
  }

  if (err.name === "TokenExpiredError") {
    const response = createErrorResponse(
      ERROR_MESSAGES.TOKEN_EXPIRED,
      ERROR_CODES.TOKEN_EXPIRED
    );
    return res.status(401).json(response);
  }

  // Error genérico
  const response = createErrorResponse(
    ERROR_MESSAGES.INTERNAL_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    { 
      details: process.env.NODE_ENV === "development" ? err.message : "Error interno del servidor",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    }
  );
  
  res.status(500).json(response);
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req, res) => {
  const response = createErrorResponse(
    `La ruta ${req.originalUrl} no existe`,
    ERROR_CODES.NOT_FOUND,
    { 
      path: req.originalUrl,
      method: req.method,
      availableEndpoints: [
        "GET /api/servicios",
        "POST /api/usuarios/login",
        "POST /api/usuarios/registrar",
        "GET /api/citas",
        "POST /api/solicitudes/crear/:servicio"
      ]
    }
  );
  
  res.status(404).json(response);
};
