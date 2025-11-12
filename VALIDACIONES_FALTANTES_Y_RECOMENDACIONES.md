# 🔒 Validaciones Faltantes y Recomendaciones - API Registrack

**Fecha:** Enero 2026  
**Estado:** 📋 **ANÁLISIS COMPLETO - IMPLEMENTACIÓN EN PROGRESO**  
**Última Actualización:** Enero 2026 - Sistema de Permisos Granular Implementado

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Validaciones Críticas Faltantes](#validaciones-críticas-faltantes)
3. [Validaciones de Seguridad](#validaciones-de-seguridad)
4. [Validaciones de Datos](#validaciones-de-datos)
5. [Validaciones de Negocio](#validaciones-de-negocio)
6. [Validaciones de Entrada/Salida](#validaciones-de-entradasalida)
7. [Recomendaciones Generales](#recomendaciones-generales)

---

## 🎯 Resumen Ejecutivo

### **Estado Actual:**
- ✅ Validaciones básicas implementadas en autenticación y usuarios
- ✅ Validaciones de formato en middlewares
- ✅ **Sistema de permisos granular implementado** (Enero 2026) - Activo en módulos críticos (usuarios, solicitudes, citas)
- ✅ **Middleware `checkPermiso` implementado** - Validación de permisos específicos por módulo y acción
- ✅ **Bypass automático para administradores** - Acceso total sin validación adicional
- ⚠️ **Faltan validaciones críticas en varios endpoints**
- ⚠️ **Faltan validaciones de seguridad en algunos controladores**
- ⚠️ **Faltan validaciones de negocio en operaciones críticas**
- ⚠️ **Sistema granular pendiente en módulos restantes** - Aplicar a empleados, clientes, empresas, servicios, pagos, roles, etc.
- ⚠️ **Validación de propiedad de recursos pendiente** - Clientres solo pueden ver/editar sus propios recursos

### **Prioridades:**
- 🔴 **Alta:** Validaciones de seguridad, SQL injection, XSS
- 🟡 **Media:** Validaciones de negocio, reglas de dominio
- 🟢 **Baja:** Validaciones de formato, mensajes de error

---

## 🔴 Validaciones Críticas Faltantes

### **1. Validaciones de Seguridad**

#### **1.1. SQL Injection Prevention**

**Estado Actual:** ⚠️ **PARCIALMENTE PROTEGIDO**
- ✅ Sequelize ORM protege contra SQL injection básico
- ⚠️ **FALTA:** Validación de parámetros en consultas raw
- ⚠️ **FALTA:** Sanitización de inputs en búsquedas

**Recomendaciones:**
```javascript
// ❌ VULNERABLE: Consultas con parámetros no validados
const usuarios = await User.findAll({
  where: {
    nombre: req.query.nombre  // ⚠️ Sin validar
  }
});

// ✅ SEGURO: Validar y sanitizar inputs
import validator from 'validator';

const nombre = validator.escape(req.query.nombre || '');
const usuarios = await User.findAll({
  where: {
    nombre: {
      [Op.like]: `%${nombre}%`
    }
  }
});
```

**Archivos a Revisar:**
- `src/controllers/dashboard.controller.js` - Búsquedas con query params
- `src/controllers/solicitudes.controller.js` - Filtros dinámicos
- `src/repositories/dashboard.repository.js` - Consultas SQL

**Acción Requerida:**
1. ✅ Implementar sanitización de inputs con `validator` o `xss`
2. ✅ Validar todos los query parameters
3. ✅ Evitar consultas SQL raw sin parámetros preparados

---

#### **1.2. XSS (Cross-Site Scripting) Prevention**

**Estado Actual:** ⚠️ **NO IMPLEMENTADO**
- ⚠️ **FALTA:** Sanitización de HTML en inputs
- ⚠️ **FALTA:** Validación de contenido malicioso

**Recomendaciones:**
```javascript
// ❌ VULNERABLE: Contenido sin sanitizar
const observacion = req.body.observacion;  // Puede contener <script>

// ✅ SEGURO: Sanitizar contenido
import xss from 'xss';
const observacion = xss(req.body.observacion || '');
```

**Archivos a Revisar:**
- `src/controllers/citas.controller.js` - Campo `observacion`
- `src/controllers/solicitudes.controller.js` - Campos de texto libre
- `src/controllers/seguimiento.controller.js` - Campo `observaciones`

**Acción Requerida:**
1. ✅ Instalar `xss` o `validator`
2. ✅ Sanitizar todos los campos de texto libre
3. ✅ Validar contenido HTML si se permite

---

#### **1.3. Validación de IDs en Parámetros**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Existe `validateId` middleware
- ⚠️ **FALTA:** Usar en todos los endpoints con parámetros
- ⚠️ **FALTA:** Validar formato de IDs (números, UUIDs)

**Recomendaciones:**
```javascript
// ❌ VULNERABLE: ID sin validar
export const getUsuarioPorId = async (req, res) => {
  const { id } = req.params;  // Puede ser "1; DROP TABLE usuarios;"
  const usuario = await User.findByPk(id);
};

// ✅ SEGURO: Validar ID
import { validateId } from '../middlewares/response.middleware.js';

router.get('/:id', validateId('id'), getUsuarioPorId);
```

**Archivos a Revisar:**
- `src/routes/*.routes.js` - Todos los endpoints con `:id`
- `src/controllers/*.controller.js` - Todos los controladores

**Acción Requerida:**
1. ✅ Agregar `validateId` a todos los endpoints con parámetros
2. ✅ Validar formato de ID (solo números para INT, UUID para UUID)
3. ✅ Validar rango de ID (mayor que 0)

---

#### **1.4. Rate Limiting**

**Estado Actual:** ⚠️ **NO IMPLEMENTADO**
- ⚠️ **FALTA:** Protección contra ataques de fuerza bruta
- ⚠️ **FALTA:** Límite de solicitudes por IP
- ⚠️ **FALTA:** Límite de intentos de login

**Recomendaciones:**
```javascript
// ✅ IMPLEMENTAR: Rate limiting con express-rate-limit
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message: 'Demasiados intentos de login, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
```

**Acción Requerida:**
1. ✅ Instalar `express-rate-limit`
2. ✅ Implementar rate limiting en login
3. ✅ Implementar rate limiting en registro
4. ✅ Implementar rate limiting en endpoints críticos

---

### **2. Validaciones de Datos**

#### **2.1. Validación de Fechas**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Validación básica en citas
- ⚠️ **FALTA:** Validar rangos de fechas
- ⚠️ **FALTA:** Validar fechas futuras/pasadas según contexto

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo valida formato
const fecha = req.body.fecha;  // "2026-01-15"

// ✅ COMPLETO: Validar formato, rango y lógica de negocio
import { isDate, isAfter, isBefore } from 'date-fns';

const fecha = new Date(req.body.fecha);
if (!isDate(fecha) || isNaN(fecha.getTime())) {
  return res.status(400).json({ error: 'Fecha inválida' });
}

// Validar que la fecha no sea en el pasado (para citas)
if (isBefore(fecha, new Date())) {
  return res.status(400).json({ error: 'No se pueden crear citas en el pasado' });
}

// Validar rango de fechas (ej: no más de 1 año en el futuro)
const maxDate = addYears(new Date(), 1);
if (isAfter(fecha, maxDate)) {
  return res.status(400).json({ error: 'La fecha no puede ser más de 1 año en el futuro' });
}
```

**Archivos a Revisar:**
- `src/controllers/citas.controller.js` - Validación de fechas
- `src/controllers/dashboard.controller.js` - Filtros de fechas
- `src/controllers/solicitudes.controller.js` - Fechas de solicitudes

**Acción Requerida:**
1. ✅ Validar formato de fecha (YYYY-MM-DD)
2. ✅ Validar rangos de fechas (mínimo, máximo)
3. ✅ Validar lógica de negocio (fechas pasadas/futuras)

---

#### **2.2. Validación de Números (Montos, IDs, etc.)**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Validación básica en algunos campos
- ⚠️ **FALTA:** Validar rangos de números
- ⚠️ **FALTA:** Validar precisión decimal

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo valida tipo
const monto = req.body.monto;  // Puede ser negativo o muy grande

// ✅ COMPLETO: Validar tipo, rango y precisión
const monto = parseFloat(req.body.monto);
if (isNaN(monto) || monto <= 0) {
  return res.status(400).json({ error: 'El monto debe ser un número positivo' });
}

if (monto > 1000000000) {  // Límite de 1 billón
  return res.status(400).json({ error: 'El monto excede el límite permitido' });
}

// Validar precisión decimal (máximo 2 decimales)
if (monto.toFixed(2) !== monto.toString()) {
  return res.status(400).json({ error: 'El monto debe tener máximo 2 decimales' });
}
```

**Archivos a Revisar:**
- `src/controllers/pago.controller.js` - Validación de montos
- `src/controllers/solicitudes.controller.js` - Validación de precios
- `src/controllers/dashboard.controller.js` - Validación de IDs

**Acción Requerida:**
1. ✅ Validar tipo de número (integer, float)
2. ✅ Validar rangos (mínimo, máximo)
3. ✅ Validar precisión decimal

---

#### **2.3. Validación de Archivos Base64**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Validación de tamaño en algunos campos
- ⚠️ **FALTA:** Validar formato de Base64
- ⚠️ **FALTA:** Validar tipo MIME
- ⚠️ **FALTA:** Validar tamaño máximo

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo valida existencia
const logotipo = req.body.logotipo;  // Puede ser Base64 inválido o muy grande

// ✅ COMPLETO: Validar formato, tamaño y tipo
const validateBase64 = (base64String, maxSizeMB = 5) => {
  // Validar formato Base64
  if (!/^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(base64String)) {
    throw new Error('Formato de imagen inválido. Solo se permiten PNG, JPEG, JPG, GIF, WEBP');
  }

  // Validar tamaño (Base64 es ~33% más grande que el archivo original)
  const base64Data = base64String.split(',')[1];
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > maxSizeMB) {
    throw new Error(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
  }

  // Validar que sea Base64 válido
  try {
    Buffer.from(base64Data, 'base64');
  } catch (error) {
    throw new Error('Formato Base64 inválido');
  }

  return true;
};
```

**Archivos a Revisar:**
- `src/controllers/solicitudes.controller.js` - Archivos Base64
- `src/controllers/archivo.controller.js` - Validación de archivos

**Acción Requerida:**
1. ✅ Validar formato Base64
2. ✅ Validar tipo MIME
3. ✅ Validar tamaño máximo
4. ✅ Validar dimensiones de imagen (si aplica)

---

### **3. Validaciones de Negocio**

#### **3.1. Validación de Estados de Solicitudes**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Validación básica de estados
- ⚠️ **FALTA:** Validar transiciones de estado
- ⚠️ **FALTA:** Validar reglas de negocio

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo valida que el estado exista
const nuevoEstado = req.body.estado;  // Puede ser cualquier estado

// ✅ COMPLETO: Validar transiciones de estado
const estadosPermitidos = {
  'Pendiente de Pago': ['Pagado', 'Anulado'],
  'Pagado': ['En Proceso', 'Anulado'],
  'En Proceso': ['Finalizado', 'Anulado'],
  'Finalizado': [],  // No se puede cambiar
  'Anulado': []  // No se puede cambiar
};

const validarTransicionEstado = (estadoActual, estadoNuevo) => {
  const estadosPermitidos = estadosPermitidos[estadoActual] || [];
  if (!estadosPermitidos.includes(estadoNuevo)) {
    throw new Error(`No se puede cambiar de "${estadoActual}" a "${estadoNuevo}"`);
  }
};
```

**Archivos a Revisar:**
- `src/controllers/solicitudes.controller.js` - Cambios de estado
- `src/controllers/detalleOrden.controller.js` - Actualizaciones de estado

**Acción Requerida:**
1. ✅ Definir matriz de transiciones de estado
2. ✅ Validar transiciones permitidas
3. ✅ Validar reglas de negocio (ej: no se puede anular una solicitud finalizada)

---

#### **3.2. Validación de Permisos por Rol**

**Estado Actual:** ✅ **PARCIALMENTE IMPLEMENTADO - SISTEMA GRANULAR ACTIVO**
- ✅ **Sistema de permisos granular implementado** (Enero 2026)
- ✅ Middleware `checkPermiso(modulo, accion)` implementado
- ✅ Aplicado a módulos críticos: `gestion_usuarios`, `gestion_solicitudes`, `gestion_citas`
- ✅ Bypass automático para administradores
- ✅ Validación de permisos específicos por módulo y acción
- ⚠️ **FALTA:** Aplicar a módulos restantes (empleados, clientes, empresas, servicios, pagos, roles, permisos, privilegios, seguimiento, archivos, etc.)
- ⚠️ **FALTA:** Validar propiedad de recursos en algunos casos (clientes solo pueden ver/editar sus propios recursos)

**Sistema Implementado:**
```javascript
// ✅ IMPLEMENTADO: Sistema granular con checkPermiso
import { checkPermiso } from '../middlewares/permiso.middleware.js';

// Validar permiso específico antes de ejecutar acción
router.post('/crear', 
  authMiddleware, 
  checkPermiso('gestion_usuarios', 'crear'),
  createUserByAdmin
);

router.get('/', 
  authMiddleware, 
  checkPermiso('gestion_solicitudes', 'leer'),
  getSolicitudes
);

router.patch('/:id/finalizar', 
  authMiddleware, 
  checkPermiso('gestion_citas', 'actualizar'),
  finalizarCita
);
```

**Módulos con Permisos Granulares Implementados:**
- ✅ `gestion_usuarios` - Todas las rutas protegidas con `checkPermiso`
- ✅ `gestion_solicitudes` - Rutas de admin/empleado protegidas con `checkPermiso`
- ✅ `gestion_citas` - Todas las rutas protegidas con `checkPermiso`

**Módulos Pendientes de Implementación:**
- ⚠️ `gestion_empleados` - Aún usa `roleMiddleware`
- ⚠️ `gestion_clientes` - Aún usa `roleMiddleware`
- ⚠️ `gestion_empresas` - Aún usa `roleMiddleware`
- ⚠️ `gestion_servicios` - Aún usa `roleMiddleware`
- ⚠️ `gestion_pagos` - Aún usa `roleMiddleware`
- ⚠️ `gestion_roles` - Aún usa `roleMiddleware`
- ⚠️ `gestion_permisos` - Aún usa `roleMiddleware`
- ⚠️ `gestion_privilegios` - Aún usa `roleMiddleware`
- ⚠️ `gestion_seguimiento` - Aún usa `roleMiddleware`
- ⚠️ `gestion_archivos` - Aún usa `roleMiddleware`
- ⚠️ Otros módulos pendientes

**Recomendaciones Adicionales:**
```javascript
// ⚠️ PENDIENTE: Validar propiedad del recurso (clientes solo pueden ver/editar sus propios recursos)
export const updateSolicitud = async (req, res) => {
  const { id } = req.params;
  const solicitud = await OrdenServicio.findByPk(id);

  // Si es cliente, solo puede actualizar sus propias solicitudes
  // Nota: Esto debe implementarse además del checkPermiso
  if (req.user.rol === 'cliente' && solicitud.id_cliente !== req.user.id_usuario) {
    return res.status(403).json({ 
      success: false,
      error: {
        message: 'No tienes permiso para actualizar esta solicitud',
        code: 'RESOURCE_OWNERSHIP_ERROR',
        details: 'Solo puedes actualizar tus propias solicitudes'
      }
    });
  }
};
```

**Archivos a Revisar:**
- `src/routes/usuario.routes.js` - ✅ Ya implementado con `checkPermiso`
- `src/routes/solicitudes.routes.js` - ✅ Ya implementado con `checkPermiso`
- `src/routes/citas.routes.js` - ✅ Ya implementado con `checkPermiso`
- `src/routes/empleado.routes.js` - ⚠️ Pendiente: Reemplazar `roleMiddleware` con `checkPermiso`
- `src/routes/cliente.routes.js` - ⚠️ Pendiente: Reemplazar `roleMiddleware` con `checkPermiso`
- `src/routes/empresa.routes.js` - ⚠️ Pendiente: Reemplazar `roleMiddleware` con `checkPermiso`
- `src/routes/servicio.routes.js` - ⚠️ Pendiente: Reemplazar `roleMiddleware` con `checkPermiso`
- `src/routes/pago.routes.js` - ⚠️ Pendiente: Reemplazar `roleMiddleware` con `checkPermiso`
- `src/routes/role.routes.js` - ⚠️ Pendiente: Reemplazar `roleMiddleware` con `checkPermiso`
- `src/controllers/solicitudes.controller.js` - ⚠️ Pendiente: Agregar validación de propiedad de recursos
- `src/controllers/citas.controller.js` - ⚠️ Pendiente: Agregar validación de propiedad de recursos
- `src/controllers/cliente.controller.js` - ⚠️ Pendiente: Agregar validación de propiedad de recursos

**Acción Requerida:**
1. ✅ **COMPLETADO:** Implementar sistema de permisos granular con `checkPermiso`
2. ✅ **COMPLETADO:** Aplicar a módulos críticos (usuarios, solicitudes, citas)
3. ⚠️ **PENDIENTE:** Aplicar `checkPermiso` a módulos restantes
4. ⚠️ **PENDIENTE:** Validar propiedad de recursos (clientes solo pueden ver/editar sus propios recursos)
5. ⚠️ **PENDIENTE:** Validar reglas de negocio por rol en controladores
6. ⚠️ **PENDIENTE:** Documentar permisos requeridos para cada endpoint

**Nota Importante:**
- El sistema de permisos granular está **activo y funcionando** en módulos críticos
- Los administradores tienen **bypass automático** (acceso total sin validación adicional)
- Los usuarios con roles personalizados solo pueden realizar acciones para las que tienen permisos específicos
- Aún falta aplicar el sistema a los módulos restantes (migración gradual)
- La validación de propiedad de recursos debe implementarse además del `checkPermiso` para casos específicos (ej: clientes solo pueden ver/editar sus propios recursos)

---

#### **3.3. Validación de Horarios de Citas**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Validación básica de horarios
- ✅ Validación de horarios de atención (7:00 AM - 6:00 PM)
- ✅ Validación de solapamiento de horarios
- ⚠️ **FALTA:** Validar días hábiles (lunes a viernes)
- ⚠️ **FALTA:** Validar que las citas duren exactamente 1 hora
- ⚠️ **FALTA:** Validar disponibilidad de empleados (parcialmente implementado)

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo valida formato y rango básico
const horaInicio = req.body.hora_inicio;  // "07:00:00"
const horaFin = req.body.hora_fin;  // "18:00:00"

// ✅ COMPLETO: Validar horarios de atención y disponibilidad
const validarHorarioCita = async (fecha, horaInicio, horaFin, idEmpleado) => {
  // Validar día hábil (lunes a viernes)
  const dia = new Date(fecha).getDay();
  if (dia === 0 || dia === 6) {
    throw new Error('Las citas solo se pueden agendar de lunes a viernes');
  }

  // Validar horario de atención (7:00 AM - 6:00 PM)
  const horaInicioDate = new Date(`1970-01-01T${horaInicio}`);
  const horaFinDate = new Date(`1970-01-01T${horaFin}`);
  const apertura = new Date('1970-01-01T07:00:00');
  const cierre = new Date('1970-01-01T18:00:00');

  if (horaInicioDate < apertura || horaFinDate > cierre) {
    throw new Error('Las citas solo se pueden agendar entre las 7:00 AM y las 6:00 PM');
  }

  // ✅ VALIDAR DURACIÓN: Las citas deben durar aproximadamente 1 hora (60 minutos) con tolerancia de ±5 minutos
  const duracionMs = horaFinDate.getTime() - horaInicioDate.getTime();
  const unaHoraEnMs = 60 * 60 * 1000; // 1 hora en milisegundos (3,600,000 ms)
  const toleranciaMs = 5 * 60 * 1000; // Tolerancia de 5 minutos (300,000 ms)
  
  if (Math.abs(duracionMs - unaHoraEnMs) > toleranciaMs) {
    const duracionMinutos = Math.round(duracionMs / (1000 * 60));
    throw new Error(
      `Las citas deben durar aproximadamente 1 hora (60 minutos) con tolerancia de ±5 minutos (55-65 minutos). ` +
      `La duración proporcionada es de ${duracionMinutos} minutos. ` +
      `Ejemplo válido: 09:00:00 - 10:00:00 (60 minutos) o 09:00:00 - 10:05:00 (65 minutos)`
    );
  }

  // Validar disponibilidad del empleado
  const citasExistentes = await Cita.findAll({
    where: {
      fecha,
      id_empleado: idEmpleado,
      estado: {
        [Op.in]: ['Programada', 'Reprogramada']
      },
      [Op.or]: [
        { hora_inicio: { [Op.between]: [horaInicio, horaFin] } },
        { hora_fin: { [Op.between]: [horaInicio, horaFin] } }
      ]
    }
  });

  if (citasExistentes.length > 0) {
    throw new Error('El empleado ya tiene una cita agendada en ese horario');
  }
};
```

**Archivos a Revisar:**
- `src/controllers/citas.controller.js` - Validación de horarios
- `src/services/citas.service.js` - Lógica de disponibilidad

**Acción Requerida:**
1. ✅ Validar días hábiles (lunes a viernes)
2. ✅ Validar horarios de atención (7:00 AM - 6:00 PM) - **YA IMPLEMENTADO**
3. ✅ Validar disponibilidad de empleados - **PARCIALMENTE IMPLEMENTADO**
4. ⚠️ **VALIDAR DURACIÓN: Las citas deben durar aproximadamente 1 hora (60 minutos) con tolerancia de ±5 minutos (55-65 minutos)** - **FALTA IMPLEMENTAR**
5. ✅ Validar solapamiento de horarios - **YA IMPLEMENTADO**

**Nota Importante sobre Duración de Citas:**
- ⚠️ **REQUERIMIENTO CRÍTICO:** Las citas deben tener una duración de **aproximadamente 1 hora (60 minutos)** con tolerancia de **±5 minutos (55-65 minutos)**
- **Ejemplos válidos (dentro de la tolerancia de ±5 minutos):** 
  - `09:00:00 - 10:00:00` ✅ (1 hora exacta - 60 minutos)
  - `09:00:00 - 10:05:00` ✅ (1 hora y 5 minutos - dentro de tolerancia)
  - `09:05:00 - 10:00:00` ✅ (55 minutos - dentro de tolerancia)
  - `14:30:00 - 15:30:00` ✅ (1 hora exacta - 60 minutos)
  - `11:15:00 - 12:15:00` ✅ (1 hora exacta - 60 minutos)
- **Ejemplos inválidos (fuera de la tolerancia):**
  - `09:00:00 - 10:30:00` ❌ (1.5 horas - 90 minutos, excede tolerancia)
  - `09:00:00 - 09:30:00` ❌ (30 minutos, menor a 55 minutos)
  - `09:00:00 - 11:00:00` ❌ (2 horas - 120 minutos, excede tolerancia)
  - `09:00:00 - 10:06:00` ❌ (66 minutos, excede tolerancia de 5 minutos)
  - `09:00:00 - 09:54:00` ❌ (54 minutos, menor a 55 minutos)
- **Tolerancia:** ±5 minutos (55-65 minutos) para manejar posibles redondeos o ajustes menores
- **Aplicación:** Esta validación debe aplicarse tanto en creación como en reprogramación de citas
- **Ubicación:** `src/controllers/citas.controller.js` - Funciones `createCita` y `reprogramarCita`

---

#### **3.4. Validación de Integridad de Empleados (Asignaciones Activas)**

**Estado Actual:** ⚠️ **NO IMPLEMENTADO**
- ⚠️ **FALTA:** Validar que un empleado no tenga citas asignadas antes de eliminarlo/desactivarlo
- ⚠️ **FALTA:** Validar que un empleado no tenga solicitudes asignadas antes de eliminarlo/desactivarlo
- ⚠️ **FALTA:** Prevenir eliminación/desactivación si tiene asignaciones activas

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Elimina/desactiva sin verificar asignaciones
export const deleteEmpleado = async (req, res) => {
  const { id } = req.params;
  const empleado = await Empleado.findByPk(id);
  await Empleado.destroy({ where: { id_empleado: id } });
  // ⚠️ Puede eliminar empleado con citas/solicitudes asignadas
};

// ❌ INCOMPLETO: Desactiva sin verificar asignaciones activas
export const changeEmpleadoState = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const empleado = await Empleado.findByPk(id);
  empleado.estado = estado; // ⚠️ Puede desactivar con asignaciones activas
  await empleado.save();
};

// ✅ COMPLETO: Validar asignaciones antes de eliminar/desactivar
import { Op } from 'sequelize';
import Cita from '../models/citas.js';
import OrdenServicio from '../models/OrdenServicio.js';

const validarAsignacionesEmpleado = async (idEmpleado, idUsuario) => {
  // Obtener el empleado
  const empleado = await Empleado.findByPk(idEmpleado, {
    include: [{ model: User, as: 'usuario' }]
  });
  
  if (!empleado) {
    throw new Error('Empleado no encontrado');
  }

  const idUsuarioEmpleado = empleado.id_usuario;

  // Verificar citas asignadas (activas: Programada, Reprogramada)
  const citasActivas = await Cita.count({
    where: {
      id_empleado: idUsuarioEmpleado,
      estado: {
        [Op.in]: ['Programada', 'Reprogramada']
      }
    }
  });

  if (citasActivas > 0) {
    throw new Error(
      `No se puede eliminar/desactivar el empleado porque tiene ${citasActivas} ` +
      `cita(s) activa(s) asignada(s). Por favor, reprograme o cancele las citas primero.`
    );
  }

  // Verificar solicitudes asignadas (activas: no Anuladas ni Finalizadas)
  const solicitudesActivas = await OrdenServicio.count({
    where: {
      id_empleado_asignado: idUsuarioEmpleado,
      estado: {
        [Op.notIn]: ['Anulado', 'Finalizado']
      }
    }
  });

  if (solicitudesActivas > 0) {
    throw new Error(
      `No se puede eliminar/desactivar el empleado porque tiene ${solicitudesActivas} ` +
      `solicitud(es) activa(s) asignada(s). Por favor, reasigne las solicitudes o finalice/anule primero.`
    );
  }

  return true;
};

// ✅ IMPLEMENTAR: En deleteEmpleado
export const deleteEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    const empleado = await Empleado.findByPk(id);
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    // ✅ VALIDAR ASIGNACIONES ANTES DE ELIMINAR
    await validarAsignacionesEmpleado(id, empleado.id_usuario);

    const id_usuario = empleado.id_usuario;
    await Empleado.destroy({ where: { id_empleado: id } });
    await User.destroy({ where: { id_usuario: id_usuario } });

    res.status(200).json({ 
      message: "Empleado y usuario asociado eliminados correctamente.",
      id_empleado_eliminado: parseInt(id),
      id_usuario_eliminado: id_usuario
    });
  } catch (error) {
    if (error.message.includes('cita(s) activa(s)') || error.message.includes('solicitud(es) activa(s)')) {
      return res.status(400).json({ 
        success: false,
        message: error.message,
        detalles: "Debe resolver todas las asignaciones activas antes de eliminar el empleado."
      });
    }
    res.status(500).json({ message: "Error al eliminar el empleado y usuario.", error: error.message });
  }
};

// ✅ IMPLEMENTAR: En changeEmpleadoState (solo si se intenta desactivar)
export const changeEmpleadoState = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const empleado = await Empleado.findByPk(id, {
      include: [{ model: User, as: "usuario" }]
    });
    
    if (!empleado) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    // ✅ VALIDAR ASIGNACIONES SOLO SI SE INTENTA DESACTIVAR (estado = false)
    if (estado === false && empleado.estado === true) {
      await validarAsignacionesEmpleado(id, empleado.id_usuario);
    }

    empleado.estado = estado;
    await empleado.save();

    if (empleado.usuario) {
      empleado.usuario.estado = estado;
      await empleado.usuario.save();
    }

    // ... resto del código
  } catch (error) {
    if (error.message.includes('cita(s) activa(s)') || error.message.includes('solicitud(es) activa(s)')) {
      return res.status(400).json({ 
        success: false,
        message: error.message,
        detalles: "Debe resolver todas las asignaciones activas antes de desactivar el empleado."
      });
    }
    res.status(500).json({ message: "Error al cambiar el estado del empleado y usuario.", error: error.message });
  }
};

// ✅ IMPLEMENTAR: En updateEmpleado (si se intenta cambiar estado a false)
export const updateEmpleado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  // ... código existente ...

  // ✅ VALIDAR ASIGNACIONES SI SE INTENTA DESACTIVAR
  if (estado !== undefined && estado === false && empleado.estado === true) {
    await validarAsignacionesEmpleado(id, empleado.id_usuario);
  }

  // ... resto del código
};
```

**Archivos a Revisar:**
- `src/controllers/empleado.controller.js` - Funciones `deleteEmpleado`, `changeEmpleadoState`, `updateEmpleado`
- `src/models/citas.js` - Relación con empleados
- `src/models/OrdenServicio.js` - Relación con empleados

**Acción Requerida:**
1. ✅ Crear función `validarAsignacionesEmpleado` para verificar citas y solicitudes activas
2. ✅ Implementar validación en `deleteEmpleado` antes de eliminar
3. ✅ Implementar validación en `changeEmpleadoState` antes de desactivar (solo si estado cambia a `false`)
4. ✅ Implementar validación en `updateEmpleado` si se intenta cambiar estado a `false`
5. ✅ Proporcionar mensajes de error descriptivos con cantidad de asignaciones activas
6. ✅ Considerar opciones: reasignar automáticamente o requerir acción manual del usuario

**Nota Importante:**
- **Citas activas:** Solo se consideran citas con estado `'Programada'` o `'Reprogramada'` (no `'Anulada'` ni `'Finalizada'`)
- **Solicitudes activas:** Solo se consideran solicitudes con estado diferente a `'Anulado'` o `'Finalizado'`
- **Desactivación vs Eliminación:** 
  - **Desactivación:** Puede ser temporal, pero debe validar asignaciones activas
  - **Eliminación:** Debe validar todas las asignaciones (activas e históricas) o solo activas según política del negocio
- **Alternativas:** 
  - Opción 1: Requerir que el usuario reasigne/cancele manualmente antes de eliminar/desactivar
  - Opción 2: Permitir eliminación/desactivación pero reasignar automáticamente a otro empleado
  - Opción 3: Permitir eliminación/desactivación pero dejar las asignaciones sin empleado (`NULL`)

---

#### **3.5. Validación de Integridad de Datos al Agendar Citas con Documento**

**Estado Actual:** ⚠️ **NO IMPLEMENTADO**
- ⚠️ **FALTA:** Validar que los datos enviados (nombre, apellido, correo, etc.) coincidan con los datos reales del usuario en la base de datos
- ⚠️ **FALTA:** Prevenir agendamiento de citas con datos incorrectos o falsos
- ⚠️ **FALTA:** Validar integridad de datos cuando se usa `documento` en lugar de `id_cliente`

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo busca usuario pero no valida datos
if (documento && !id_cliente) {
    const usuario = await User.findOne({
        where: { documento: BigInt(documento) }
    });
    
    if (!usuario) {
        return res.status(400).json({ 
            message: "No se encontró un usuario con ese documento"
        });
    }
    
    clienteId = usuario.id_usuario;
    // ⚠️ No se valida que los datos enviados coincidan con los datos del usuario
}

// ✅ COMPLETO: Validar que los datos enviados coincidan con los datos reales
const validarDatosUsuarioConDocumento = (usuario, datosEnviados) => {
    const discrepancias = [];
    
    // Validar nombre (si se envía)
    if (datosEnviados.nombre && datosEnviados.nombre.trim().toLowerCase() !== usuario.nombre.trim().toLowerCase()) {
        discrepancias.push({
            campo: 'nombre',
            valor_enviado: datosEnviados.nombre,
            valor_real: usuario.nombre,
            mensaje: `El nombre enviado "${datosEnviados.nombre}" no coincide con el nombre registrado "${usuario.nombre}"`
        });
    }
    
    // Validar apellido (si se envía)
    if (datosEnviados.apellido && datosEnviados.apellido.trim().toLowerCase() !== usuario.apellido.trim().toLowerCase()) {
        discrepancias.push({
            campo: 'apellido',
            valor_enviado: datosEnviados.apellido,
            valor_real: usuario.apellido,
            mensaje: `El apellido enviado "${datosEnviados.apellido}" no coincide con el apellido registrado "${usuario.apellido}"`
        });
    }
    
    // Validar correo (si se envía)
    if (datosEnviados.correo && datosEnviados.correo.trim().toLowerCase() !== usuario.correo.trim().toLowerCase()) {
        discrepancias.push({
            campo: 'correo',
            valor_enviado: datosEnviados.correo,
            valor_real: usuario.correo,
            mensaje: `El correo enviado "${datosEnviados.correo}" no coincide con el correo registrado "${usuario.correo}"`
        });
    }
    
    // Validar tipo_documento (si se envía)
    if (datosEnviados.tipo_documento && datosEnviados.tipo_documento.trim() !== usuario.tipo_documento.trim()) {
        discrepancias.push({
            campo: 'tipo_documento',
            valor_enviado: datosEnviados.tipo_documento,
            valor_real: usuario.tipo_documento,
            mensaje: `El tipo de documento enviado "${datosEnviados.tipo_documento}" no coincide con el tipo registrado "${usuario.tipo_documento}"`
        });
    }
    
    // Validar telefono (si se envía y existe en BD)
    if (datosEnviados.telefono && usuario.telefono) {
        // Normalizar teléfonos (remover espacios, guiones, paréntesis)
        const normalizarTelefono = (tel) => tel.replace(/[\s\-\(\)]/g, '');
        const telefonoEnviadoNormalizado = normalizarTelefono(datosEnviados.telefono);
        const telefonoRealNormalizado = normalizarTelefono(usuario.telefono);
        
        if (telefonoEnviadoNormalizado !== telefonoRealNormalizado) {
            discrepancias.push({
                campo: 'telefono',
                valor_enviado: datosEnviados.telefono,
                valor_real: usuario.telefono,
                mensaje: `El teléfono enviado "${datosEnviados.telefono}" no coincide con el teléfono registrado "${usuario.telefono}"`
            });
        }
    }
    
    return discrepancias;
};

// ✅ IMPLEMENTAR: En createCita
export const createCita = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, tipo, modalidad, id_cliente, id_empleado, observacion, documento, nombre, apellido, correo, tipo_documento, telefono } = req.body;
    
    try {
        let clienteId = id_cliente;
        
        // Si se envía documento, buscar el usuario y validar datos
        if (documento && !id_cliente) {
            console.log('🔍 Buscando usuario por documento:', documento);
            const usuario = await User.findOne({
                where: { documento: BigInt(documento) }
            });
            
            if (!usuario) {
                return res.status(400).json({ 
                    success: false,
                    message: "No se encontró un usuario con ese documento",
                    documento: documento.toString()
                });
            }
            
            // Verificar que el usuario sea un cliente
            const cliente = await Cliente.findOne({
                where: { id_usuario: usuario.id_usuario }
            });
            
            if (!cliente) {
                return res.status(400).json({ 
                    success: false,
                    message: "El usuario no es un cliente registrado",
                    documento: documento.toString(),
                    id_usuario: usuario.id_usuario
                });
            }
            
            // ✅ VALIDAR INTEGRIDAD DE DATOS
            const datosEnviados = {
                nombre: nombre || null,
                apellido: apellido || null,
                correo: correo || null,
                tipo_documento: tipo_documento || null,
                telefono: telefono || null
            };
            
            const discrepancias = validarDatosUsuarioConDocumento(usuario, datosEnviados);
            
            if (discrepancias.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Los datos enviados no coinciden con los datos registrados del usuario",
                    documento: documento.toString(),
                    discrepancias: discrepancias,
                    datos_reales: {
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        correo: usuario.correo,
                        tipo_documento: usuario.tipo_documento,
                        telefono: usuario.telefono || null
                    },
                    instrucciones: "Por favor, verifique los datos y vuelva a intentar. Los datos deben coincidir exactamente con los registrados en el sistema."
                });
            }
            
            clienteId = usuario.id_usuario;
            console.log('✅ Usuario encontrado y datos validados:', usuario.nombre, usuario.apellido, 'ID:', clienteId);
        }
        
        // ... resto del código para crear la cita ...
    } catch (error) {
        // ... manejo de errores ...
    }
};
```

**Archivos a Revisar:**
- `src/controllers/citas.controller.js` - Función `createCita`
- `src/controllers/citas.controller.js` - Función `crearCitaDesdeSolicitud` (si aplica)

**Acción Requerida:**
1. ✅ Crear función `validarDatosUsuarioConDocumento` para comparar datos enviados con datos reales
2. ✅ Implementar validación en `createCita` cuando se usa `documento`
3. ✅ Validar campos: nombre, apellido, correo, tipo_documento, telefono (si se envían)
4. ✅ Retornar mensajes de error descriptivos indicando qué campos no coinciden
5. ✅ Proporcionar datos reales del usuario para referencia
6. ✅ Considerar normalización de datos (mayúsculas/minúsculas, espacios, caracteres especiales)

**Nota Importante:**
- **Campos a validar:** nombre, apellido, correo, tipo_documento, telefono
- **Normalización:** 
  - Nombres y apellidos: comparar en minúsculas y sin espacios extras
  - Correos: comparar en minúsculas
  - Teléfonos: normalizar removiendo espacios, guiones, paréntesis
  - Tipo de documento: comparar exactamente (case-sensitive)
- **Campos opcionales:** Si un campo no se envía, no se valida (solo se valida si se proporciona)
- **Mensajes de error:** Deben ser claros y proporcionar los datos reales para referencia
- **Seguridad:** Esta validación previene que se agenden citas con datos falsos o incorrectos

---

### **4. Validaciones de Entrada/Salida**

#### **4.1. Validación de Paginación**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Validación básica en algunos endpoints
- ⚠️ **FALTA:** Validar límites de paginación
- ⚠️ **FALTA:** Validar valores por defecto

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo valida existencia
const page = req.query.page;  // Puede ser negativo o muy grande
const limit = req.query.limit;  // Puede ser 0 o muy grande

// ✅ COMPLETO: Validar y normalizar paginación
const validatePagination = (page, limit, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  return { page: pageNum, limit: limitNum, offset };
};
```

**Archivos a Revisar:**
- `src/controllers/dashboard.controller.js` - Paginación
- `src/controllers/solicitudes.controller.js` - Paginación
- `src/controllers/citas.controller.js` - Paginación

**Acción Requerida:**
1. ✅ Validar límites de paginación
2. ✅ Validar valores por defecto
3. ✅ Validar rangos (página mínima, límite máximo)

---

#### **4.2. Validación de Filtros**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Validación básica en algunos endpoints
- ⚠️ **FALTA:** Validar valores permitidos en filtros
- ⚠️ **FALTA:** Validar operadores de filtro

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Solo valida existencia
const estado = req.query.estado;  // Puede ser cualquier valor

// ✅ COMPLETO: Validar valores permitidos
const estadosPermitidos = ['Pendiente', 'En Proceso', 'Finalizado', 'Anulado'];
const estado = req.query.estado;

if (estado && !estadosPermitidos.includes(estado)) {
  return res.status(400).json({ 
    error: `Estado inválido. Valores permitidos: ${estadosPermitidos.join(', ')}` 
  });
}
```

**Archivos a Revisar:**
- `src/controllers/dashboard.controller.js` - Filtros
- `src/controllers/solicitudes.controller.js` - Filtros
- `src/controllers/citas.controller.js` - Filtros

**Acción Requerida:**
1. ✅ Validar valores permitidos en filtros
2. ✅ Validar operadores de filtro
3. ✅ Validar formatos de filtro (rangos, fechas, etc.)

---

#### **4.3. Validación de Ordenamiento**

**Estado Actual:** ⚠️ **NO IMPLEMENTADO**
- ⚠️ **FALTA:** Validar columnas de ordenamiento
- ⚠️ **FALTA:** Validar dirección de ordenamiento

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Sin validación
const orderBy = req.query.orderBy;  // Puede ser cualquier columna
const orderDirection = req.query.orderDirection;  // Puede ser cualquier valor

// ✅ COMPLETO: Validar columnas y dirección
const columnasPermitidas = ['fecha', 'estado', 'monto', 'id'];
const orderBy = req.query.orderBy || 'fecha';
const orderDirection = req.query.orderDirection || 'DESC';

if (!columnasPermitidas.includes(orderBy)) {
  return res.status(400).json({ 
    error: `Columna de ordenamiento inválida. Valores permitidos: ${columnasPermitidas.join(', ')}` 
  });
}

if (!['ASC', 'DESC'].includes(orderDirection.toUpperCase())) {
  return res.status(400).json({ 
    error: 'Dirección de ordenamiento inválida. Valores permitidos: ASC, DESC' 
  });
}
```

**Archivos a Revisar:**
- `src/controllers/dashboard.controller.js` - Ordenamiento
- `src/controllers/solicitudes.controller.js` - Ordenamiento
- `src/controllers/citas.controller.js` - Ordenamiento

**Acción Requerida:**
1. ✅ Validar columnas de ordenamiento
2. ✅ Validar dirección de ordenamiento
3. ✅ Validar valores por defecto

---

## 🟡 Validaciones de Seguridad Adicionales

### **5. Validaciones de Autenticación**

#### **5.1. Validación de Tokens JWT**

**Estado Actual:** ✅ **IMPLEMENTADO**
- ✅ Validación básica de tokens
- ⚠️ **FALTA:** Validar expiración de tokens
- ⚠️ **FALTA:** Validar revocación de tokens

**Recomendaciones:**
```javascript
// ✅ IMPLEMENTAR: Validar expiración y revocación
import jwt from 'jsonwebtoken';
import { TokenRevoked } from '../models/TokenRevoked.js';

export const validateToken = async (token) => {
  try {
    // Verificar si el token está revocado
    const revokedToken = await TokenRevoked.findOne({ where: { token } });
    if (revokedToken) {
      throw new Error('Token revocado');
    }

    // Verificar expiración
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe y está activo
    const usuario = await User.findByPk(decoded.id);
    if (!usuario || !usuario.estado) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    return decoded;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};
```

**Acción Requerida:**
1. ✅ Validar expiración de tokens
2. ✅ Implementar revocación de tokens
3. ✅ Validar estado del usuario al validar token

---

#### **5.2. Validación de Contraseñas**

**Estado Actual:** ✅ **IMPLEMENTADO**
- ✅ Validación de fortaleza de contraseña
- ⚠️ **FALTA:** Validar contraseñas comunes
- ⚠️ **FALTA:** Validar historial de contraseñas

**Recomendaciones:**
```javascript
// ✅ IMPLEMENTAR: Validar contraseñas comunes
import bcrypt from 'bcryptjs';

const contraseñasComunes = ['123456', 'password', '123456789', '12345678', '12345'];

const validarContraseñaSegura = (contraseña) => {
  // Validar que no sea una contraseña común
  if (contraseñasComunes.includes(contraseña.toLowerCase())) {
    throw new Error('La contraseña es demasiado común. Por favor, elija una contraseña más segura');
  }

  // Validar fortaleza
  if (!/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}/.test(contraseña)) {
    throw new Error('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial');
  }
};
```

**Acción Requerida:**
1. ✅ Validar contraseñas comunes
2. ✅ Implementar historial de contraseñas
3. ✅ Validar que la nueva contraseña sea diferente a la anterior

---

### **6. Validaciones de Integridad de Datos**

#### **6.1. Validación de Relaciones Foreign Key**

**Estado Actual:** ✅ **IMPLEMENTADO EN BD**
- ✅ Foreign keys en base de datos
- ⚠️ **FALTA:** Validar existencia antes de crear/actualizar
- ⚠️ **FALTA:** Validar integridad referencial en aplicación

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Confía solo en la BD
const nuevaSolicitud = await OrdenServicio.create({
  id_cliente: req.body.id_cliente,  // Puede no existir
  id_servicio: req.body.id_servicio  // Puede no existir
});

// ✅ COMPLETO: Validar existencia antes de crear
const validarRelaciones = async (idCliente, idServicio) => {
  const cliente = await Cliente.findByPk(idCliente);
  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  const servicio = await Servicio.findByPk(idServicio);
  if (!servicio) {
    throw new Error('Servicio no encontrado');
  }

  return { cliente, servicio };
};
```

**Archivos a Revisar:**
- `src/controllers/solicitudes.controller.js` - Validación de relaciones
- `src/controllers/citas.controller.js` - Validación de relaciones
- `src/controllers/pago.controller.js` - Validación de relaciones

**Acción Requerida:**
1. ✅ Validar existencia de relaciones antes de crear/actualizar
2. ✅ Validar integridad referencial en aplicación
3. ✅ Validar reglas de negocio (ej: cliente activo, servicio disponible)

---

#### **6.2. Validación de Unicidad**

**Estado Actual:** ✅ **IMPLEMENTADO EN BD**
- ✅ Unique constraints en base de datos
- ⚠️ **FALTA:** Validar unicidad antes de crear/actualizar
- ⚠️ **FALTA:** Mensajes de error descriptivos

**Recomendaciones:**
```javascript
// ❌ INCOMPLETO: Confía solo en la BD
const nuevoUsuario = await User.create({
  correo: req.body.correo,  // Puede duplicarse
  documento: req.body.documento  // Puede duplicarse
});

// ✅ COMPLETO: Validar unicidad antes de crear
const validarUnicidad = async (correo, documento) => {
  const usuarioExistente = await User.findOne({
    where: {
      [Op.or]: [
        { correo },
        { documento }
      ]
    }
  });

  if (usuarioExistente) {
    if (usuarioExistente.correo === correo) {
      throw new Error('El correo electrónico ya está registrado');
    }
    if (usuarioExistente.documento === documento) {
      throw new Error('El documento ya está registrado');
    }
  }
};
```

**Archivos a Revisar:**
- `src/controllers/auth.controller.js` - Validación de unicidad
- `src/controllers/user.controller.js` - Validación de unicidad
- `src/controllers/empresa.controller.js` - Validación de unicidad

**Acción Requerida:**
1. ✅ Validar unicidad antes de crear/actualizar
2. ✅ Mensajes de error descriptivos
3. ✅ Validar unicidad en actualizaciones (excluir el registro actual)

---

## 🟢 Recomendaciones Generales

### **7. Mejoras en Validaciones Existentes**

#### **7.1. Mensajes de Error Descriptivos**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Algunos mensajes descriptivos
- ⚠️ **FALTA:** Mensajes consistentes
- ⚠️ **FALTA:** Códigos de error estándar

**Recomendaciones:**
```javascript
// ❌ POCO DESCRIPTIVO
return res.status(400).json({ error: 'Error de validación' });

// ✅ DESCRIPTIVO
return res.status(400).json({
  success: false,
  error: {
    message: 'Error de validación',
    code: 'VALIDATION_ERROR',
    details: {
      field: 'correo',
      message: 'El formato del correo electrónico no es válido',
      value: req.body.correo
    },
    timestamp: new Date().toISOString()
  }
});
```

**Acción Requerida:**
1. ✅ Estandarizar mensajes de error
2. ✅ Agregar códigos de error
3. ✅ Agregar detalles de error
4. ✅ Agregar timestamps

---

#### **7.2. Validación Centralizada**

**Estado Actual:** ⚠️ **PARCIALMENTE IMPLEMENTADO**
- ✅ Middlewares de validación
- ⚠️ **FALTA:** Validación centralizada para algunos endpoints
- ⚠️ **FALTA:** Reutilización de validaciones

**Recomendaciones:**
```javascript
// ✅ IMPLEMENTAR: Validación centralizada
// src/validators/usuario.validator.js
export const validarUsuario = {
  correo: (correo) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw new Error('El formato del correo electrónico no es válido');
    }
  },
  documento: (documento) => {
    if (!/^\d{6,10}$/.test(documento)) {
      throw new Error('El documento debe tener entre 6 y 10 dígitos');
    }
  },
  telefono: (telefono) => {
    if (telefono && !/^[\+]?[1-9][\d\s\-\(\)]{6,18}$/.test(telefono)) {
      throw new Error('El formato del teléfono no es válido');
    }
  }
};
```

**Acción Requerida:**
1. ✅ Crear validadores centralizados
2. ✅ Reutilizar validaciones
3. ✅ Estandarizar validaciones

---

#### **7.3. Validación de Tipos de Datos**

**Estado Actual:** ✅ **IMPLEMENTADO**
- ✅ Validación de tipos básicos
- ⚠️ **FALTA:** Validar tipos complejos (arrays, objetos)
- ⚠️ **FALTA:** Validar estructuras de datos

**Recomendaciones:**
```javascript
// ✅ IMPLEMENTAR: Validación de tipos complejos
const validarEstructura = (data, schema) => {
  for (const key in schema) {
    const expectedType = schema[key];
    const value = data[key];

    if (expectedType === 'array' && !Array.isArray(value)) {
      throw new Error(`El campo ${key} debe ser un array`);
    }

    if (expectedType === 'object' && typeof value !== 'object') {
      throw new Error(`El campo ${key} debe ser un objeto`);
    }

    if (expectedType === 'string' && typeof value !== 'string') {
      throw new Error(`El campo ${key} debe ser un string`);
    }
  }
};
```

**Acción Requerida:**
1. ✅ Validar tipos complejos
2. ✅ Validar estructuras de datos
3. ✅ Validar esquemas de datos

---

## 📊 Resumen de Prioridades

| Prioridad | Validación | Estado | Acción Requerida |
|-----------|-----------|--------|------------------|
| 🔴 **Alta** | SQL Injection Prevention | ⚠️ Parcial | Implementar sanitización |
| 🔴 **Alta** | XSS Prevention | ⚠️ No implementado | Implementar sanitización HTML |
| 🔴 **Alta** | Validación de IDs | ⚠️ Parcial | Agregar a todos los endpoints |
| 🔴 **Alta** | Rate Limiting | ⚠️ No implementado | Implementar en login/registro |
| 🟡 **Media** | Validación de Fechas | ⚠️ Parcial | Validar rangos y lógica |
| 🟡 **Media** | Validación de Estados | ⚠️ Parcial | Validar transiciones |
| 🟡 **Media** | Validación de Permisos | ✅ **Parcialmente Implementado** | Sistema granular activo en 3 módulos. Aplicar a módulos restantes y validar propiedad de recursos |
| 🟡 **Media** | Validación de Horarios | ⚠️ Parcial | Validar duración (1 hora ±5 min) y días hábiles |
| 🟡 **Media** | Validación de Integridad de Empleados | ⚠️ No implementado | Validar asignaciones activas antes de eliminar/desactivar |
| 🟡 **Media** | Validación de Integridad de Datos en Citas | ⚠️ No implementado | Validar que datos enviados coincidan con datos reales del usuario |
| 🟢 **Baja** | Validación de Paginación | ⚠️ Parcial | Validar límites |
| 🟢 **Baja** | Validación de Filtros | ⚠️ Parcial | Validar valores permitidos |
| 🟢 **Baja** | Validación de Ordenamiento | ⚠️ No implementado | Validar columnas |

---

## 🚀 Plan de Implementación

### **Fase 1: Seguridad Crítica (Semana 1)**
1. ✅ Implementar sanitización de inputs (SQL injection, XSS)
2. ✅ Implementar rate limiting
3. ✅ Validar IDs en todos los endpoints
4. ✅ Validar tokens JWT

### **Fase 2: Validaciones de Datos (Semana 2)**
1. ✅ Validar fechas (rangos, lógica)
2. ✅ Validar números (rangos, precisión)
3. ✅ Validar archivos Base64 (formato, tamaño)
4. ✅ Validar relaciones foreign key

### **Fase 3: Validaciones de Negocio (Semana 3)**
1. ✅ Validar transiciones de estado
2. ✅ **COMPLETADO (Enero 2026):** Validar permisos por rol - Sistema granular implementado en módulos críticos
3. ⚠️ **PENDIENTE:** Aplicar sistema granular a módulos restantes
4. ⚠️ **PENDIENTE:** Validar propiedad de recursos (clientes solo pueden ver/editar sus propios recursos)
5. ✅ Validar horarios de citas (duración de 1 hora ±5 minutos, días hábiles)
6. ✅ Validar integridad de empleados (asignaciones activas antes de eliminar/desactivar)
7. ✅ Validar integridad de datos en citas (datos enviados vs datos reales del usuario)
8. ✅ Validar reglas de negocio

### **Fase 4: Mejoras (Semana 4)**
1. ✅ Estandarizar mensajes de error
2. ✅ Validación centralizada
3. ✅ Validación de tipos complejos
4. ✅ Documentación de validaciones

---

## 📝 Notas Finales

### **Consideraciones:**
- ✅ Las validaciones deben ser consistentes en todo el proyecto
- ✅ Los mensajes de error deben ser descriptivos y útiles
- ✅ Las validaciones deben ser performantes (no bloquear la aplicación)
- ✅ Las validaciones deben ser mantenibles y reutilizables

### **Próximos Pasos:**
1. ✅ Revisar este documento
2. ✅ Priorizar validaciones según necesidades del negocio
3. ✅ Implementar validaciones críticas primero
4. ✅ Probar validaciones en desarrollo
5. ✅ Documentar validaciones en README.md

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.1

### **📝 Changelog:**

**Versión 1.1 (Enero 2026):**
- ✅ Actualizado estado del sistema de permisos granular
- ✅ Documentado implementación de `checkPermiso` middleware
- ✅ Listado módulos implementados (usuarios, solicitudes, citas)
- ✅ Listado módulos pendientes de implementación
- ✅ Agregadas recomendaciones para validación de propiedad de recursos
- ✅ Actualizado plan de implementación con sistema granular

**Versión 1.0 (Enero 2026):**
- ✅ Documento inicial con análisis completo de validaciones faltantes
- ✅ Priorización de validaciones por criticidad
- ✅ Recomendaciones de implementación

