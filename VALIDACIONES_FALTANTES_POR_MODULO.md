# 📋 Validaciones Faltantes por Módulo - API Registrack

**Fecha:** Enero 2026  
**Estado:** 📋 **ORGANIZACIÓN DE VALIDACIONES PENDIENTES**  
**Última Actualización:** Enero 2026

---

## 📊 Resumen Ejecutivo

Este documento organiza las validaciones faltantes del documento `VALIDACIONES_FALTANTES_Y_RECOMENDACIONES.md` por módulos del sistema para facilitar la implementación gradual.

### **Validaciones Ya Implementadas:**
- ✅ Rate Limiting (login, registro, recuperación/reset de contraseña)
- ✅ Validación de contraseñas comunes
- ✅ Validación de fortaleza de contraseña
- ✅ Sanitización de inputs en autenticación
- ✅ Validación de estado del usuario en JWT
- ✅ Sistema de permisos granular (usuarios, solicitudes, citas, empleados, clientes, empresas, pagos, servicios)
- ✅ Validaciones de citas (días hábiles, duración, horarios, XSS, rangos de fechas, integridad de datos)
- ✅ Validaciones de empleados (validación de IDs, sistema de permisos granular, validación de integridad)
- ✅ Validaciones de clientes (validación de IDs, sistema de permisos granular, validación de propiedad de recursos)
- ✅ Validaciones de empresas (validación de IDs, sistema de permisos granular, validación de unicidad de NIT)
- ✅ Validaciones de pagos (validación de IDs, sistema de permisos granular, validación de montos, validación de relaciones foreign key)
- ✅ Validaciones de servicios (validación de IDs, sistema de permisos granular, validación de precios)

---

## 🔐 Módulo: Autenticación y Usuarios

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ Rate limiting en login, registro, recuperación y reset de contraseña
- ✅ Validación de contraseñas comunes (50+ contraseñas prohibidas)
- ✅ Validación de fortaleza de contraseña (8+ caracteres, mayúscula, número, especial)
- ✅ Sanitización de inputs (correo, contraseña)
- ✅ Validación de estado del usuario en cada request con JWT
- ✅ Manejo mejorado de errores (códigos HTTP correctos: 401, 403, 429)

#### **Validaciones Faltantes:**

**1. ⚠️ Revocación de Tokens JWT**
- **Prioridad:** 🟡 Media
- **Estado:** ⚠️ No implementado
- **Descripción:** Implementar sistema de revocación de tokens (blacklist)
- **Archivos:** `src/middlewares/auth.middleware.js`, crear `src/models/TokenRevoked.js`
- **Acción:** Crear tabla `token_revoked` y validar tokens revocados en middleware

**2. ⚠️ Historial de Contraseñas**
- **Prioridad:** 🟡 Media
- **Estado:** ⚠️ No implementado
- **Descripción:** Validar que la nueva contraseña sea diferente a las últimas N contraseñas
- **Archivos:** `src/utils/passwordValidator.js`, crear `src/models/PasswordHistory.js`
- **Acción:** Crear tabla `password_history` y validar en cambio de contraseña

**3. ⚠️ Validación de Unicidad (Mejora)**
- **Prioridad:** 🟢 Baja
- **Estado:** ⚠️ Parcialmente implementado
- **Descripción:** Validar unicidad antes de crear/actualizar (mejorar mensajes de error)
- **Archivos:** `src/controllers/auth.controller.js`, `src/controllers/user.controller.js`
- **Acción:** Validar antes de intentar crear, mensajes descriptivos

---

## 📅 Módulo: Citas

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ Días hábiles (lunes a viernes)
- ✅ Duración (1 hora ±5 minutos)
- ✅ Horarios de atención (7:00 AM - 6:00 PM)
- ✅ Sanitización XSS (campo `observacion`)
- ✅ Rango de fechas (máximo 1 año en el futuro)
- ✅ Integridad de datos con documento
- ✅ Solapamiento de horarios
- ✅ Disponibilidad de empleados

#### **Validaciones Faltantes:**

**Ninguna crítica pendiente** - Todas las validaciones principales están implementadas.

---

## 📝 Módulo: Solicitudes (Órdenes de Servicio)

### **Estado:** ⚠️ **Parcialmente Implementado**

#### **Validaciones Implementadas:**
- ✅ Sistema de permisos granular (`checkPermiso`)
- ✅ Validación básica de estados

#### **Validaciones Faltantes:**

**1. ⚠️ Validación de Transiciones de Estado**
- **Prioridad:** 🟡 Media
- **Estado:** ⚠️ No implementado
- **Descripción:** Validar que las transiciones de estado sean válidas según reglas de negocio
- **Archivos:** `src/controllers/solicitudes.controller.js`, `src/controllers/detalleOrden.controller.js`
- **Acción:** Crear matriz de transiciones permitidas:
  ```javascript
  const estadosPermitidos = {
    'Pendiente de Pago': ['Pagado', 'Anulado'],
    'Pagado': ['En Proceso', 'Anulado'],
    'En Proceso': ['Finalizado', 'Anulado'],
    'Finalizado': [],  // No se puede cambiar
    'Anulado': []  // No se puede cambiar
  };
  ```

**2. ⚠️ Sanitización XSS en Campos de Texto Libre**
- **Prioridad:** 🔴 Alta
- **Estado:** ⚠️ No implementado
- **Descripción:** Sanitizar todos los campos de texto libre (descripciones, observaciones, etc.)
- **Archivos:** `src/controllers/solicitudes.controller.js`
- **Campos a sanitizar:** `descripcion`, `observaciones`, `argumentos_respuesta`, `descripcion_nuevos_productos_servicios`, etc.

**3. ⚠️ Validación de Relaciones Foreign Key**
- **Prioridad:** 🟡 Media
- **Estado:** ⚠️ Parcialmente implementado
- **Descripción:** Validar existencia de `id_cliente`, `id_servicio`, `id_empresa`, `id_empleado_asignado` antes de crear/actualizar
- **Archivos:** `src/controllers/solicitudes.controller.js`
- **Acción:** Verificar que todas las relaciones existan y estén activas antes de crear/actualizar

**4. ⚠️ Validación de Propiedad de Recursos**
- **Prioridad:** 🟡 Media
- **Estado:** ⚠️ No implementado
- **Descripción:** Los clientes solo pueden ver/editar sus propias solicitudes
- **Archivos:** `src/controllers/solicitudes.controller.js`
- **Acción:** Agregar validación en GET, PUT, PATCH para verificar `solicitud.id_cliente === req.user.id_usuario` si el rol es 'cliente'

---

## 👥 Módulo: Empleados

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ Validación básica de creación (usuario existe, rol correcto, no tiene empleado existente)
- ✅ **Validación de Integridad (Asignaciones Activas)** - Previene eliminación/desactivación de empleados con asignaciones activas (citas programadas/reprogramadas y solicitudes activas)
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes rechazados explícitamente
- ✅ **Validación de IDs en Parámetros** - Protección contra SQL injection con validación estricta de formato numérico (`/^\d+$/`)

#### **Validaciones Faltantes:**

**Ninguna crítica pendiente** - Todas las validaciones principales están implementadas.

---

## 👤 Módulo: Clientes

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ Validación básica de datos
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes pueden acceder a sus propios recursos
- ✅ **Validación de Propiedad de Recursos** - Los clientes solo pueden ver/editar sus propios datos (implementado en `obtenerCliente`, `editarCliente`, `editarUsuarioCliente`, `editarEmpresaCliente`)
- ✅ **Validación de IDs en Parámetros** - Protección contra SQL injection con validación estricta de formato numérico (`/^\d+$/`)

#### **Validaciones Faltantes:**

**Ninguna crítica pendiente** - Todas las validaciones principales están implementadas.

---

## 🏢 Módulo: Empresas

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes rechazados explícitamente
- ✅ **Validación de Unicidad (NIT)** - Valida unicidad de NIT antes de crear/actualizar (mejorar mensajes de error)
- ✅ **Validación de IDs en Parámetros** - Agregado `validateId` middleware a todos los endpoints con `:id`

#### **Validaciones Faltantes:**

**Ninguna crítica pendiente** - Todas las validaciones principales están implementadas.

---

## 💰 Módulo: Pagos

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ **Validación de Montos (Rangos y Precisión)** - Valida que los montos sean positivos, tengan máximo 2 decimales y no excedan límites
- ✅ **Validación de Relaciones Foreign Key** - Valida existencia de `id_orden_servicio` antes de crear/actualizar
- ✅ **Sistema de Permisos Granular** - Reemplazado `roleMiddleware` con `checkPermiso` para control granular
- ✅ **Validación de IDs en Parámetros** - Agregado `validateId` middleware a todos los endpoints con `:id`

#### **Validaciones Faltantes:**

**Ninguna crítica pendiente** - Todas las validaciones principales están implementadas.

---

## 🛠️ Módulo: Servicios

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ **Validación de Precios (Rangos y Precisión)** - Valida que los precios sean positivos, tengan máximo 2 decimales y no excedan límites
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes rechazados explícitamente
- ✅ **Validación de IDs en Parámetros** - Agregado `validateId` middleware a todos los endpoints con `:id` y `:idServicio`

#### **Validaciones Faltantes:**

**Ninguna crítica pendiente** - Todas las validaciones principales están implementadas.

---

## 📊 Módulo: Dashboard

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes rechazados explícitamente. Todos los endpoints requieren permiso `leer` (módulo de solo lectura)

#### **Validaciones Faltantes:**

**Validaciones pendientes (baja/media prioridad):**
- ⚠️ Validación de filtros de fechas (rangos y formato)
- ⚠️ Validación de paginación (límites)
- ⚠️ Validación de filtros (valores permitidos)
- ⚠️ Validación de ordenamiento
- ⚠️ Sanitización de query parameters

---

## 📁 Módulo: Archivos

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ **Validación de IDs en Parámetros** - Agregado `validateId` middleware a todos los endpoints con `:id` y `:idCliente`
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes pueden acceder con validación de propiedad de recursos
- ✅ **Validación de Upload** - Validación de archivos reales usando `multipart/form-data`, tamaño (10MB), extensiones permitidas, campos requeridos

#### **Validaciones Faltantes:**

**1. ⚠️ Validación de Archivos Base64 (Formato, Tamaño, Tipo MIME)**
- **Prioridad:** 🔴 Alta
- **Estado:** ⚠️ Parcialmente implementado
- **Descripción:** Validar formato Base64, tipo MIME, tamaño máximo y dimensiones de imagen
- **Archivos:** `src/controllers/solicitudes.controller.js`, `src/controllers/archivo.controller.js`
- **Acción:** Crear función `validateBase64` que valide:
  - Formato Base64 válido
  - Tipo MIME permitido (PNG, JPEG, JPG, GIF, WEBP para imágenes)
  - Tamaño máximo (ej: 5MB)
  - Dimensiones de imagen (si aplica)

---

## 📋 Módulo: Seguimiento

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ **Validación de IDs en Parámetros** - Agregado `validateId` middleware a todos los endpoints con `:id` y `:idOrdenServicio`
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes rechazados explícitamente

#### **Validaciones Faltantes:**

**1. ⚠️ Sanitización XSS en Campo `observaciones`**
- **Prioridad:** 🔴 Alta
- **Estado:** ⚠️ No implementado
- **Descripción:** Sanitizar el campo `observaciones` para prevenir ataques XSS
- **Archivos:** `src/controllers/seguimiento.controller.js`
- **Acción:** Usar `xss()` en el campo `observaciones` antes de guardar

**2. ⚠️ Validación de Relaciones Foreign Key**
- **Prioridad:** 🟡 Media
- **Estado:** ⚠️ Parcialmente implementado
- **Descripción:** Validar existencia de `id_orden_servicio` y `registrado_por` antes de crear
- **Archivos:** `src/controllers/seguimiento.controller.js`
- **Acción:** Verificar que la orden de servicio y el usuario existan y estén activos

---

## 🔐 Módulo: Roles, Permisos y Privilegios

### **Estado:** ✅ **Mayormente Implementado**

#### **Validaciones Implementadas:**
- ✅ **Validación básica de creación/actualización** - Validaciones de campos requeridos y formatos
- ✅ **Validación de roles básicos** - No se pueden eliminar roles básicos (administrador, empleado, cliente)
- ✅ **Validación de IDs en Parámetros** - Agregado `validateId` middleware a todos los endpoints con `:id` en roles, permisos y privilegios
- ✅ **Sistema de Permisos Granular** - Control híbrido implementado: roles principales usan `roleMiddleware` + `checkPermiso`, roles personalizados solo `checkPermiso`, clientes rechazados explícitamente. Implementado en:
  - `src/routes/role.routes.js` - 6 endpoints protegidos
  - `src/routes/permiso.routes.js` - 5 endpoints protegidos
  - `src/routes/privilegio.routes.js` - 5 endpoints protegidos

#### **Validaciones Faltantes:**

**Ninguna crítica pendiente** - Todas las validaciones principales están implementadas.

---

## 🔄 Validaciones Transversales (Aplican a Múltiples Módulos)

### **1. ⚠️ Validación de IDs en Parámetros**
- **Prioridad:** 🔴 Alta
- **Estado:** ✅ **Mayormente Implementado** (✅ Implementado en módulos de empleados, clientes, empresas, pagos, servicios, roles, permisos, privilegios, seguimiento y archivos)
- **Descripción:** Agregar `validateId` middleware a TODOS los endpoints con `:id` en módulos restantes
- **Archivos:** `src/routes/*.routes.js` - Algunos módulos menores aún pueden requerir validación
- **Acción:** Revisar cada archivo de rutas y agregar `validateId('id')` antes de controladores que usen `req.params.id`

### **2. ⚠️ Sanitización de Query Parameters (SQL Injection Prevention)**
- **Prioridad:** 🔴 Alta
- **Estado:** ⚠️ Parcialmente protegido
- **Descripción:** Sanitizar todos los query parameters antes de usar en consultas
- **Archivos:** 
  - `src/controllers/dashboard.controller.js`
  - `src/controllers/solicitudes.controller.js`
  - `src/repositories/dashboard.repository.js`
- **Acción:** Usar `validator.escape()` o `xss` en todos los query params antes de usar en consultas Sequelize

### **3. ⚠️ Validación de Fechas (Rangos y Lógica)**
- **Prioridad:** 🟡 Media
- **Estado:** ⚠️ Parcialmente implementado (implementado en citas)
- **Descripción:** Validar rangos de fechas y lógica de negocio en todos los módulos que usen fechas
- **Archivos:** 
  - `src/controllers/solicitudes.controller.js` - Fechas de solicitudes
  - `src/controllers/dashboard.controller.js` - Filtros de fechas
- **Acción:** Validar formato, rangos razonables y lógica de negocio (fechas pasadas/futuras según contexto)

### **4. ⚠️ Mensajes de Error Descriptivos y Estandarizados**
- **Prioridad:** 🟢 Baja
- **Estado:** ⚠️ Parcialmente implementado
- **Descripción:** Estandarizar formato de mensajes de error en todos los módulos
- **Formato sugerido:**
  ```javascript
  {
    success: false,
    error: {
      message: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: {
        field: 'campo',
        message: 'Mensaje específico',
        value: valor
      },
      timestamp: new Date().toISOString()
    }
  }
  ```

### **5. ⚠️ Validación Centralizada**
- **Prioridad:** 🟢 Baja
- **Estado:** ⚠️ Parcialmente implementado
- **Descripción:** Crear validadores centralizados reutilizables
- **Acción:** Crear archivos en `src/validators/` para cada módulo (ej: `usuario.validator.js`, `solicitud.validator.js`)

---

## 📊 Resumen por Prioridad

### 🔴 **Alta Prioridad (Seguridad Crítica)**
1. ✅ Rate Limiting - **IMPLEMENTADO**
2. ✅ Sanitización de inputs en autenticación - **IMPLEMENTADO**
3. ✅ Validación de IDs en parámetros (módulos de empleados, clientes, empresas, pagos y servicios) - **IMPLEMENTADO**
4. ⚠️ Validación de IDs en parámetros (módulos restantes: roles, permisos, privilegios, seguimiento, archivos)
5. ⚠️ Sanitización de query parameters (SQL injection prevention)
6. ⚠️ Sanitización XSS en campos de texto libre (solicitudes, seguimiento)
7. ⚠️ Validación de archivos Base64 (formato, tamaño, tipo MIME)

### 🟡 **Media Prioridad (Negocio y Datos)**
1. ✅ Validaciones de citas - **IMPLEMENTADO**
2. ✅ Validación de integridad de empleados (asignaciones activas) - **IMPLEMENTADO**
3. ✅ Sistema de permisos granular (módulo de empleados) - **IMPLEMENTADO**
4. ⚠️ Validación de transiciones de estado (solicitudes)
5. ✅ Validación de propiedad de recursos (módulo de clientes) - **IMPLEMENTADO**
6. ✅ Sistema de permisos granular (módulo de clientes) - **IMPLEMENTADO**
7. ✅ Sistema de permisos granular (módulos de empresas, pagos y servicios) - **IMPLEMENTADO**
8. ✅ Validación de relaciones foreign key (módulo de pagos) - **IMPLEMENTADO**
9. ✅ Validación de montos/precios (rangos y precisión) - **IMPLEMENTADO (módulos de pagos y servicios)**
10. ✅ Validación de unicidad (NIT) - **IMPLEMENTADO (módulo de empresas)**
11. ⚠️ Sistema de permisos granular (módulos restantes: roles, permisos, privilegios, seguimiento, archivos)
12. ⚠️ Validación de relaciones foreign key (todos los módulos restantes)
13. ⚠️ Revocación de tokens JWT
14. ⚠️ Historial de contraseñas

### 🟢 **Baja Prioridad (Mejoras)**
1. ⚠️ Validación de paginación (límites)
2. ⚠️ Validación de filtros (valores permitidos)
3. ⚠️ Validación de ordenamiento (columnas y dirección)
4. ⚠️ Mensajes de error descriptivos y estandarizados
5. ⚠️ Validación centralizada (validadores reutilizables)
6. ⚠️ Validación de unicidad (mejorar mensajes de error)

---

## 📈 Progreso de Implementación

| Módulo | Validaciones Implementadas | Validaciones Faltantes | Progreso |
|--------|---------------------------|------------------------|----------|
| **Autenticación** | 6 | 3 | 67% ✅ |
| **Citas** | 8 | 0 | 100% ✅ |
| **Solicitudes** | 2 | 4 | 33% ⚠️ |
| **Empleados** | 4 | 0 | 100% ✅ |
| **Clientes** | 4 | 0 | 100% ✅ |
| **Empresas** | 3 | 0 | 100% ✅ |
| **Pagos** | 4 | 0 | 100% ✅ |
| **Servicios** | 3 | 0 | 100% ✅ |
| **Dashboard** | 0 | 5 | 0% ⚠️ |
| **Archivos** | 0 | 2 | 0% ⚠️ |
| **Seguimiento** | 0 | 3 | 0% ⚠️ |
| **Roles/Permisos** | 2 | 2 | 50% ⚠️ |
| **Transversales** | 1 | 4 | 20% ⚠️ |

**Total:** 35 implementadas / 24 faltantes = **59% completado**

---

## 🎯 Próximos Pasos Recomendados

### **Fase 1: Seguridad Crítica (Semana 1)**
1. Validación de IDs en parámetros (módulos restantes)
2. Sanitización de query parameters (SQL injection prevention)
3. Sanitización XSS en campos de texto libre (solicitudes, seguimiento)
4. Validación de archivos Base64 (formato, tamaño, tipo MIME)

### **Fase 2: Validaciones de Negocio (Semana 2)**
1. Validación de transiciones de estado (solicitudes)
2. Validación de relaciones foreign key (todos los módulos)

### **Fase 3: Sistema de Permisos (Semana 3)**
1. Aplicar `checkPermiso` a módulos restantes (roles, permisos, privilegios, seguimiento, archivos)

### **Fase 4: Mejoras y Optimizaciones (Semana 4)**
1. Validación de paginación, filtros y ordenamiento
2. Mensajes de error descriptivos y estandarizados
3. Validación centralizada (validadores reutilizables)
4. Revocación de tokens JWT
5. Historial de contraseñas

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

