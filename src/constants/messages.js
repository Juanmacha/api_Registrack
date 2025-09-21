/**
 * Constantes de mensajes para la API Registrack
 * Centraliza todos los mensajes de respuesta para mantener consistencia
 */

// =============================================
// CÓDIGOS DE ERROR ESPECÍFICOS
// =============================================
export const ERROR_CODES = {
  // Errores de validación (400-499)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_TYPE: 'INVALID_TYPE',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE',
  INVALID_RANGE: 'INVALID_RANGE',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_DOCUMENT: 'INVALID_DOCUMENT',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_TIME: 'INVALID_TIME',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_URL: 'INVALID_URL',
  
  // Errores de autenticación (401-403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCESS_DENIED: 'ACCESS_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Errores de recursos (404-409)
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Errores de servidor (500-599)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FILE_DOWNLOAD_ERROR: 'FILE_DOWNLOAD_ERROR',
  REPORT_GENERATION_ERROR: 'REPORT_GENERATION_ERROR',
  
  // Errores de negocio
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  INVALID_APPOINTMENT_TIME: 'INVALID_APPOINTMENT_TIME',
  ORDER_ALREADY_PROCESSED: 'ORDER_ALREADY_PROCESSED',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA'
};

// =============================================
// MENSAJES DE ÉXITO
// =============================================
export const SUCCESS_MESSAGES = {
  // Usuarios
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  USER_ACTIVATED: 'Usuario activado exitosamente',
  USER_DEACTIVATED: 'Usuario desactivado exitosamente',
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  PASSWORD_RESET: 'Contraseña restablecida exitosamente',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente',
  PASSWORD_RESET_EMAIL_SENT: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña',
  
  // Clientes
  CLIENT_CREATED: 'Cliente creado exitosamente',
  CLIENT_UPDATED: 'Cliente actualizado exitosamente',
  CLIENT_DELETED: 'Cliente eliminado exitosamente',
  CLIENT_FOUND: 'Cliente encontrado',
  CLIENTS_FOUND: 'Clientes obtenidos exitosamente',
  
  // Servicios
  SERVICE_CREATED: 'Servicio creado exitosamente',
  SERVICE_UPDATED: 'Servicio actualizado exitosamente',
  SERVICE_DELETED: 'Servicio eliminado exitosamente',
  SERVICE_FOUND: 'Servicio encontrado',
  SERVICES_FOUND: 'Servicios obtenidos exitosamente',
  
  // Solicitudes
  REQUEST_CREATED: 'Solicitud creada exitosamente',
  REQUEST_UPDATED: 'Solicitud actualizada exitosamente',
  REQUEST_DELETED: 'Solicitud eliminada exitosamente',
  REQUEST_CANCELLED: 'Solicitud cancelada exitosamente',
  REQUEST_FOUND: 'Solicitud encontrada',
  REQUESTS_FOUND: 'Solicitudes obtenidas exitosamente',
  
  // Órdenes de Servicio
  ORDER_CREATED: 'Orden de servicio creada exitosamente',
  ORDER_UPDATED: 'Orden de servicio actualizada exitosamente',
  ORDER_DELETED: 'Orden de servicio eliminada exitosamente',
  ORDER_FOUND: 'Orden de servicio encontrada',
  ORDERS_FOUND: 'Órdenes de servicio obtenidas exitosamente',
  
  // Citas
  APPOINTMENT_CREATED: 'Cita creada exitosamente',
  APPOINTMENT_UPDATED: 'Cita actualizada exitosamente',
  APPOINTMENT_DELETED: 'Cita eliminada exitosamente',
  APPOINTMENT_RESCHEDULED: 'Cita reprogramada exitosamente',
  APPOINTMENT_CANCELLED: 'Cita cancelada exitosamente',
  APPOINTMENT_FOUND: 'Cita encontrada',
  APPOINTMENTS_FOUND: 'Citas obtenidas exitosamente',
  
  // Seguimiento
  TRACKING_CREATED: 'Seguimiento creado exitosamente',
  TRACKING_UPDATED: 'Seguimiento actualizado exitosamente',
  TRACKING_DELETED: 'Seguimiento eliminado exitosamente',
  TRACKING_FOUND: 'Seguimiento encontrado',
  TRACKINGS_FOUND: 'Seguimientos obtenidos exitosamente',
  
  // Archivos
  FILE_UPLOADED: 'Archivo subido exitosamente',
  FILE_DELETED: 'Archivo eliminado exitosamente',
  FILE_FOUND: 'Archivo encontrado',
  FILES_FOUND: 'Archivos obtenidos exitosamente',
  FILE_DOWNLOADED: 'Archivo descargado exitosamente',
  
  // Pagos
  PAYMENT_CREATED: 'Pago registrado exitosamente',
  PAYMENT_UPDATED: 'Pago actualizado exitosamente',
  PAYMENT_DELETED: 'Pago eliminado exitosamente',
  PAYMENT_FOUND: 'Pago encontrado',
  PAYMENTS_FOUND: 'Pagos obtenidos exitosamente',
  
  // Reportes
  REPORT_GENERATED: 'Reporte generado exitosamente',
  REPORT_DOWNLOADED: 'Reporte descargado exitosamente',
  
  // Operaciones generales
  OPERATION_SUCCESS: 'Operación realizada exitosamente',
  DATA_RETRIEVED: 'Datos obtenidos exitosamente',
  DATA_UPDATED: 'Datos actualizados exitosamente',
  DATA_DELETED: 'Datos eliminados exitosamente'
};

// =============================================
// MENSAJES DE ERROR
// =============================================
export const ERROR_MESSAGES = {
  // Errores de validación
  VALIDATION_FAILED: 'Error de validación en los datos enviados',
  REQUIRED_FIELD: 'El campo {field} es obligatorio',
  INVALID_FORMAT: 'El formato del campo {field} no es válido',
  INVALID_TYPE: 'El campo {field} debe ser de tipo {type}',
  DUPLICATE_VALUE: 'El valor {value} ya existe para el campo {field}',
  INVALID_RANGE: 'El campo {field} debe estar entre {min} y {max}',
  INVALID_EMAIL: 'El formato del correo electrónico no es válido',
  INVALID_PASSWORD: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial',
  INVALID_DOCUMENT: 'El documento debe tener entre 6 y 10 números',
  INVALID_DATE: 'El formato de fecha no es válido. Use YYYY-MM-DD',
  INVALID_TIME: 'El formato de hora no es válido. Use HH:MM:SS',
  INVALID_PHONE: 'El formato del teléfono no es válido',
  INVALID_URL: 'La URL proporcionada no es válida',
  INVALID_ID: 'El ID proporcionado no es válido',
  INVALID_ROLE: 'El rol especificado no es válido',
  INVALID_STATUS: 'El estado especificado no es válido',
  
  // Errores de autenticación
  UNAUTHORIZED: 'No autorizado. Token de acceso requerido',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  TOKEN_EXPIRED: 'El token de acceso ha expirado',
  TOKEN_INVALID: 'El token de acceso no es válido',
  ACCESS_DENIED: 'Acceso denegado',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes para realizar esta acción',
  LOGIN_REQUIRED: 'Debe iniciar sesión para acceder a este recurso',
  
  // Errores de recursos
  NOT_FOUND: 'Recurso no encontrado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  CLIENT_NOT_FOUND: 'Cliente no encontrado',
  SERVICE_NOT_FOUND: 'Servicio no encontrado',
  ORDER_NOT_FOUND: 'Orden de servicio no encontrada',
  FILE_NOT_FOUND: 'Archivo no encontrado',
  APPOINTMENT_NOT_FOUND: 'Cita no encontrada',
  TRACKING_NOT_FOUND: 'Seguimiento no encontrado',
  PAYMENT_NOT_FOUND: 'Pago no encontrado',
  ROLE_NOT_FOUND: 'Rol no encontrado',
  PERMISSION_NOT_FOUND: 'Permiso no encontrado',
  PRIVILEGE_NOT_FOUND: 'Privilegio no encontrado',
  
  // Errores de conflicto
  CONFLICT: 'Conflicto en los datos enviados',
  ALREADY_EXISTS: 'El recurso ya existe',
  EMAIL_ALREADY_EXISTS: 'El correo electrónico ya está registrado',
  DOCUMENT_ALREADY_EXISTS: 'El documento ya está registrado',
  APPOINTMENT_CONFLICT: 'Ya existe una cita programada en ese horario',
  ORDER_ALREADY_PROCESSED: 'La orden de servicio ya ha sido procesada',
  
  // Errores de servidor
  INTERNAL_ERROR: 'Error interno del servidor',
  DATABASE_ERROR: 'Error en la base de datos',
  CONNECTION_ERROR: 'Error de conexión a la base de datos',
  EMAIL_ERROR: 'Error al enviar el correo electrónico',
  FILE_UPLOAD_ERROR: 'Error al subir el archivo',
  FILE_DOWNLOAD_ERROR: 'Error al descargar el archivo',
  REPORT_GENERATION_ERROR: 'Error al generar el reporte',
  
  // Errores de negocio
  BUSINESS_RULE_VIOLATION: 'Violación de regla de negocio',
  INVALID_APPOINTMENT_TIME: 'El horario de la cita no es válido',
  APPOINTMENT_IN_PAST: 'No se pueden crear citas en fechas pasadas',
  INVALID_APPOINTMENT_DURATION: 'La duración de la cita no es válida',
  INSUFFICIENT_DATA: 'Datos insuficientes para completar la operación',
  INVALID_OPERATION: 'Operación no válida para el estado actual del recurso',
  
  // Errores de validación específicos
  MISSING_REQUIRED_FIELDS: 'Faltan campos obligatorios: {fields}',
  INVALID_FIELD_VALUES: 'Valores inválidos en los campos: {fields}',
  FIELD_TOO_LONG: 'El campo {field} excede la longitud máxima de {max} caracteres',
  FIELD_TOO_SHORT: 'El campo {field} debe tener al menos {min} caracteres',
  INVALID_CHOICE: 'El valor {value} no es válido para el campo {field}. Valores permitidos: {choices}',
  
  // Errores de archivos
  FILE_TOO_LARGE: 'El archivo excede el tamaño máximo permitido',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  FILE_CORRUPTED: 'El archivo está corrupto o no se puede leer',
  
  // Errores de pagos
  PAYMENT_FAILED: 'El pago no pudo ser procesado',
  INVALID_PAYMENT_METHOD: 'Método de pago no válido',
  INSUFFICIENT_FUNDS: 'Fondos insuficientes para completar el pago',
  PAYMENT_ALREADY_PROCESSED: 'El pago ya ha sido procesado'
};

// =============================================
// MENSAJES DE VALIDACIÓN ESPECÍFICOS
// =============================================
export const VALIDATION_MESSAGES = {
  // Usuarios
  USER: {
    REQUIRED_FIELDS: 'Los campos tipo_documento, documento, nombre, apellido, correo y contrasena son obligatorios',
    INVALID_DOCUMENT_FORMAT: 'El documento debe contener solo números y tener entre 6 y 10 dígitos',
    INVALID_EMAIL_FORMAT: 'El formato del correo electrónico no es válido',
    WEAK_PASSWORD: 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial',
    EMAIL_ALREADY_EXISTS: 'El correo electrónico ya está registrado',
    DOCUMENT_ALREADY_EXISTS: 'El documento ya está registrado',
    INVALID_ROLE: 'El rol especificado no existe o no es válido',
    INVALID_USER_ID: 'El ID del usuario no es válido'
  },
  
  // Clientes
  CLIENT: {
    REQUIRED_FIELDS: 'Los campos id_usuario, tipo_persona son obligatorios',
    INVALID_PERSON_TYPE: 'El tipo de persona debe ser "Natural" o "Jurídica"',
    INVALID_USER_ID: 'El ID del usuario no es válido o no existe',
    CLIENT_NOT_FOUND: 'Cliente no encontrado',
    INVALID_CLIENT_ID: 'El ID del cliente no es válido'
  },
  
  // Servicios
  SERVICE: {
    REQUIRED_FIELDS: 'Los campos nombre, precio_base son obligatorios',
    INVALID_NAME: 'El nombre del servicio solo puede contener letras y espacios',
    INVALID_PRICE: 'El precio base debe ser mayor a 0',
    INVALID_SERVICE_ID: 'El ID del servicio no es válido',
    SERVICE_NOT_FOUND: 'Servicio no encontrado'
  },
  
  // Citas
  APPOINTMENT: {
    REQUIRED_FIELDS: 'Los campos fecha, hora_inicio, hora_fin, tipo, modalidad, id_cliente, id_empleado son obligatorios',
    INVALID_DATE_FORMAT: 'El formato de fecha debe ser YYYY-MM-DD',
    INVALID_TIME_FORMAT: 'El formato de hora debe ser HH:MM:SS',
    INVALID_APPOINTMENT_TIME: 'El horario de la cita debe estar entre 07:00:00 y 18:00:00',
    APPOINTMENT_IN_PAST: 'No se pueden crear citas en fechas pasadas',
    INVALID_DURATION: 'La hora de inicio debe ser anterior a la hora de fin',
    APPOINTMENT_CONFLICT: 'Ya existe una cita programada en ese horario para el empleado',
    INVALID_APPOINTMENT_ID: 'El ID de la cita no es válido',
    APPOINTMENT_NOT_FOUND: 'Cita no encontrada',
    CANNOT_RESCHEDULE_CANCELLED: 'No se puede reprogramar una cita cancelada'
  },
  
  // Solicitudes
  REQUEST: {
    REQUIRED_FIELDS: 'Los campos requeridos varían según el tipo de servicio',
    INVALID_SERVICE_TYPE: 'Tipo de servicio no válido',
    INVALID_REQUEST_ID: 'El ID de la solicitud no es válido',
    REQUEST_NOT_FOUND: 'Solicitud no encontrada',
    CANNOT_EDIT_PROCESSED: 'No se puede editar una solicitud ya procesada',
    INSUFFICIENT_DATA: 'Datos insuficientes para el tipo de servicio seleccionado'
  },
  
  // Archivos
  FILE: {
    REQUIRED_FIELDS: 'Los campos url_archivo, id_tipo_archivo, id_cliente son obligatorios',
    INVALID_URL: 'La URL del archivo debe tener al menos 5 caracteres',
    INVALID_FILE_TYPE_ID: 'El ID del tipo de archivo no es válido',
    INVALID_CLIENT_ID: 'El ID del cliente no es válido',
    INVALID_ORDER_ID: 'El ID de la orden de servicio no es válido',
    FILE_NOT_FOUND: 'Archivo no encontrado',
    INVALID_FILE_ID: 'El ID del archivo no es válido'
  },
  
  // Seguimiento
  TRACKING: {
    REQUIRED_FIELDS: 'Los campos id_orden_servicio, titulo, descripcion son obligatorios',
    INVALID_ORDER_ID: 'El ID de la orden de servicio no es válido',
    INVALID_TITLE_LENGTH: 'El título no puede exceder 200 caracteres',
    INVALID_TRACKING_ID: 'El ID del seguimiento no es válido',
    TRACKING_NOT_FOUND: 'Seguimiento no encontrado'
  }
};

// =============================================
// FUNCIONES AUXILIARES
// =============================================

/**
 * Reemplaza placeholders en mensajes con valores reales
 * @param {string} message - Mensaje con placeholders
 * @param {object} replacements - Objeto con los valores de reemplazo
 * @returns {string} - Mensaje con valores reemplazados
 */
export const formatMessage = (message, replacements = {}) => {
  let formattedMessage = message;
  Object.keys(replacements).forEach(key => {
    const placeholder = `{${key}}`;
    formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'g'), replacements[key]);
  });
  return formattedMessage;
};

/**
 * Crea un mensaje de error de validación con detalles
 * @param {string} field - Campo que falló la validación
 * @param {string} message - Mensaje de error específico
 * @param {string} value - Valor que causó el error
 * @returns {object} - Objeto de error de validación
 */
export const createValidationError = (field, message, value = null) => ({
  field,
  message,
  value,
  code: ERROR_CODES.VALIDATION_ERROR
});

/**
 * Crea una respuesta de error estándar
 * @param {string} message - Mensaje de error
 * @param {string} code - Código de error
 * @param {object} details - Detalles adicionales del error
 * @returns {object} - Respuesta de error estandarizada
 */
export const createErrorResponse = (message, code = ERROR_CODES.INTERNAL_ERROR, details = null) => ({
  success: false,
  error: {
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  }
});

/**
 * Crea una respuesta de éxito estándar
 * @param {string} message - Mensaje de éxito
 * @param {object} data - Datos de respuesta
 * @param {object} meta - Metadatos adicionales
 * @returns {object} - Respuesta de éxito estandarizada
 */
export const createSuccessResponse = (message, data = null, meta = null) => ({
  success: true,
  message,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta
  }
});
