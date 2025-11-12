# ✅ Ejemplo Práctico: Roles con Permisos Específicos Funcionando

**Fecha:** Enero 2026  
**Versión:** 1.0

---

## 🎯 Objetivo

Demostrar que cuando creas un nuevo rol y le asignas permisos + privilegios específicos, ese rol **SOLO podrá hacer las acciones que se le asignaron** y **NO podrá hacer acciones que no se le dieron**.

---

## 📝 Escenario Completo: Rol "Empleado Básico"

### **Paso 1: Crear Rol "empleado_basico" con Permisos Limitados**

```json
POST /api/roles
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "nombre": "empleado_basico",
  "estado": true,
  "permisos": {
    "solicitudes": {
      "crear": false,      // ← NO puede crear
      "leer": true,        // ← SÍ puede leer
      "actualizar": false, // ← NO puede actualizar
      "eliminar": false    // ← NO puede eliminar
    },
    "citas": {
      "crear": true,       // ← SÍ puede crear
      "leer": true,        // ← SÍ puede leer
      "actualizar": true,  // ← SÍ puede actualizar
      "eliminar": false    // ← NO puede eliminar
    },
    "clientes": {
      "crear": false,      // ← NO puede crear
      "leer": true,        // ← SÍ puede leer
      "actualizar": false, // ← NO puede actualizar
      "eliminar": false    // ← NO puede eliminar
    }
  }
}
```

**Resultado en Base de Datos:**

**Tabla `roles`:**
```
id_rol: 7
nombre: "empleado_basico"
estado: true
```

**Tabla `permisos`:**
```
id_permiso: 1, nombre: "gestion_solicitudes"
id_permiso: 2, nombre: "gestion_citas"
id_permiso: 3, nombre: "gestion_clientes"
```

**Tabla `privilegios`:**
```
id_privilegio: 1, nombre: "crear"
id_privilegio: 2, nombre: "leer"
id_privilegio: 3, nombre: "actualizar"
id_privilegio: 4, nombre: "eliminar"
```

**Tabla `rol_permisos_privilegios`:**
```
id_rol: 7, id_permiso: 1, id_privilegio: 2  // gestion_solicitudes + leer ✅
id_rol: 7, id_permiso: 2, id_privilegio: 1  // gestion_citas + crear ✅
id_rol: 7, id_permiso: 2, id_privilegio: 2  // gestion_citas + leer ✅
id_rol: 7, id_permiso: 2, id_privilegio: 3  // gestion_citas + actualizar ✅
id_rol: 7, id_permiso: 3, id_privilegio: 2  // gestion_clientes + leer ✅

// ❌ NO tiene:
// - gestion_solicitudes + crear
// - gestion_solicitudes + actualizar
// - gestion_solicitudes + eliminar
// - gestion_citas + eliminar
// - gestion_clientes + crear
// - gestion_clientes + actualizar
// - gestion_clientes + eliminar
```

---

### **Paso 2: Crear Usuario con Rol "empleado_basico"**

```json
POST /api/usuarios/crear
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "tipo_documento": "CC",
  "documento": "1111111111",
  "nombre": "María",
  "apellido": "López",
  "correo": "maria.lopez@example.com",
  "telefono": "3001111111",
  "contrasena": "Password123!",
  "id_rol": 7  // ← Rol "empleado_basico"
}
```

**Resultado:**
- ✅ Usuario creado con `id_rol = 7`
- ✅ Usuario tiene rol "empleado_basico"

---

### **Paso 3: Usuario Hace Login**

```json
POST /api/usuarios/login
Content-Type: application/json

{
  "correo": "maria.lopez@example.com",
  "contrasena": "Password123!"
}
```

**Token Generado:**
```json
{
  "id_usuario": 150,
  "rol": "empleado_basico",
  "id_rol": 7
}
```

**Cuando se usa el token, `authMiddleware` carga:**
```javascript
req.user = {
  id_usuario: 150,
  rol: "empleado_basico",
  id_rol: 7,
  permisos: ["gestion_solicitudes", "gestion_citas", "gestion_clientes"],
  privilegios: ["leer", "crear", "actualizar"]  // Pero solo para citas
}
```

---

## 🚫 Acciones DENEGADAS (No Tiene Permisos)

### **1. Intentar Crear Solicitud (DENEGADO)**

**Request:**
```bash
POST /api/gestion-solicitudes/crear/1
Authorization: Bearer TOKEN_EMPLEADO_BASICO
Content-Type: application/json

{
  "tipo_solicitante": "Natural",
  "nombre_completo": "Juan Pérez",
  "tipo_documento": "CC",
  "numero_documento": "1234567890",
  "correo_electronico": "juan@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111"
}
```

**Flujo de Validación:**

1. **`authMiddleware` carga permisos:**
   ```javascript
   req.user = {
     id_usuario: 150,
     rol: "empleado_basico",
     id_rol: 7,
     permisos: ["gestion_solicitudes", "gestion_citas", "gestion_clientes"],
     privilegios: ["leer", "crear", "actualizar"]
   }
   ```

2. **`roleMiddleware(["cliente", "administrador", "empleado"])` valida:**
   ```javascript
   // ✅ El rol "empleado_basico" pasa (es un tipo de empleado)
   // Pero esto solo valida el nombre del rol, no los permisos específicos
   ```

3. **`checkPermiso('gestion_solicitudes', 'crear')` valida:**
   ```javascript
   // ✅ BYPASS PARA ADMINISTRADOR? No, es "empleado_basico"
   // ✅ MANTENER LÓGICA PARA CLIENTE? No, es "empleado_basico"
   // ✅ VALIDACIÓN GRANULAR PARA EMPLEADO? Sí
   
   // Buscar en tabla intermedia:
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 7,
       id_permiso: 1,      // gestion_solicitudes
       id_privilegio: 1    // crear
     }
   });
   
   // Resultado: null (NO existe esta combinación)
   // ❌ El rol "empleado_basico" NO tiene: gestion_solicitudes + crear
   ```

4. **Respuesta:**
   ```json
   {
     "success": false,
     "mensaje": "No tienes permiso para crear en solicitudes",
     "permiso_requerido": "gestion_solicitudes",
     "privilegio_requerido": "crear",
     "rol": "empleado_basico",
     "id_rol": 7,
     "detalles": "Tu rol no tiene esta combinación específica de permiso y privilegio asignada. Contacta al administrador para obtener los permisos necesarios."
   }
   ```
   **Status:** `403 Forbidden`

---

### **2. Intentar Actualizar Solicitud (DENEGADO)**

**Request:**
```bash
PUT /api/gestion-solicitudes/editar/123
Authorization: Bearer TOKEN_EMPLEADO_BASICO
Content-Type: application/json

{
  "observaciones": "Actualización de datos"
}
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_solicitudes', 'actualizar')` valida:**
   ```javascript
   // Buscar en tabla intermedia:
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 7,
       id_permiso: 1,      // gestion_solicitudes
       id_privilegio: 3    // actualizar
     }
   });
   
   // Resultado: null (NO existe esta combinación)
   // ❌ El rol "empleado_basico" NO tiene: gestion_solicitudes + actualizar
   ```

2. **Respuesta:**
   ```json
   {
     "success": false,
     "mensaje": "No tienes permiso para actualizar en solicitudes",
     "permiso_requerido": "gestion_solicitudes",
     "privilegio_requerido": "actualizar",
     "rol": "empleado_basico",
     "id_rol": 7
   }
   ```
   **Status:** `403 Forbidden`

---

### **3. Intentar Eliminar Solicitud (DENEGADO)**

**Request:**
```bash
PUT /api/gestion-solicitudes/anular/123
Authorization: Bearer TOKEN_EMPLEADO_BASICO
Content-Type: application/json

{
  "motivo_anulacion": "Solicitud duplicada"
}
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_solicitudes', 'eliminar')` valida:**
   ```javascript
   // Buscar en tabla intermedia:
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 7,
       id_permiso: 1,      // gestion_solicitudes
       id_privilegio: 4    // eliminar
     }
   });
   
   // Resultado: null (NO existe esta combinación)
   // ❌ El rol "empleado_basico" NO tiene: gestion_solicitudes + eliminar
   ```

2. **Respuesta:**
   ```json
   {
     "success": false,
     "mensaje": "No tienes permiso para eliminar en solicitudes",
     "permiso_requerido": "gestion_solicitudes",
     "privilegio_requerido": "eliminar",
     "rol": "empleado_basico",
     "id_rol": 7
   }
   ```
   **Status:** `403 Forbidden`

---

### **4. Intentar Crear Cliente (DENEGADO)**

**Request:**
```bash
POST /api/gestion-clientes
Authorization: Bearer TOKEN_EMPLEADO_BASICO
Content-Type: application/json

{
  "nombre": "Nuevo Cliente",
  "correo": "cliente@example.com"
}
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_clientes', 'crear')` valida:**
   ```javascript
   // Buscar en tabla intermedia:
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 7,
       id_permiso: 3,      // gestion_clientes
       id_privilegio: 1    // crear
     }
   });
   
   // Resultado: null (NO existe esta combinación)
   // ❌ El rol "empleado_basico" NO tiene: gestion_clientes + crear
   ```

2. **Respuesta:**
   ```json
   {
     "success": false,
     "mensaje": "No tienes permiso para crear en clientes",
     "permiso_requerido": "gestion_clientes",
     "privilegio_requerido": "crear",
     "rol": "empleado_basico",
     "id_rol": 7
   }
   ```
   **Status:** `403 Forbidden`

---

### **5. Intentar Eliminar Cita (DENEGADO)**

**Request:**
```bash
PUT /api/gestion-citas/123/anular
Authorization: Bearer TOKEN_EMPLEADO_BASICO
Content-Type: application/json

{
  "motivo": "Cliente canceló"
}
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_citas', 'eliminar')` valida:**
   ```javascript
   // Buscar en tabla intermedia:
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 7,
       id_permiso: 2,      // gestion_citas
       id_privilegio: 4    // eliminar
     }
   });
   
   // Resultado: null (NO existe esta combinación)
   // ❌ El rol "empleado_basico" NO tiene: gestion_citas + eliminar
   ```

2. **Respuesta:**
   ```json
   {
     "success": false,
     "mensaje": "No tienes permiso para eliminar en citas",
     "permiso_requerido": "gestion_citas",
     "privilegio_requerido": "eliminar",
     "rol": "empleado_basico",
     "id_rol": 7
   }
   ```
   **Status:** `403 Forbidden`

---

## ✅ Acciones PERMITIDAS (Tiene Permisos)

### **1. Leer Solicitudes (PERMITIDO)**

**Request:**
```bash
GET /api/gestion-solicitudes
Authorization: Bearer TOKEN_EMPLEADO_BASICO
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_solicitudes', 'leer')` valida:**
   ```javascript
   // Buscar en tabla intermedia:
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 7,
       id_permiso: 1,      // gestion_solicitudes
       id_privilegio: 2    // leer
     }
   });
   
   // Resultado: { id_rol: 7, id_permiso: 1, id_privilegio: 2 }
   // ✅ El rol "empleado_basico" SÍ tiene: gestion_solicitudes + leer
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "solicitudes": [/* lista de solicitudes */]
     }
   }
   ```
   **Status:** `200 OK`

---

### **2. Crear Cita (PERMITIDO)**

**Request:**
```bash
POST /api/gestion-citas
Authorization: Bearer TOKEN_EMPLEADO_BASICO
Content-Type: application/json

{
  "fecha": "2026-02-15",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 50,
  "id_empleado": 10
}
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_citas', 'crear')` valida:**
   ```javascript
   // Buscar en tabla intermedia:
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 7,
       id_permiso: 2,      // gestion_citas
       id_privilegio: 1    // crear
     }
   });
   
   // Resultado: { id_rol: 7, id_permiso: 2, id_privilegio: 1 }
   // ✅ El rol "empleado_basico" SÍ tiene: gestion_citas + crear
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "cita": {
         "id_cita": 200,
         "fecha": "2026-02-15",
         "hora_inicio": "09:00:00",
         "hora_fin": "10:00:00",
         "tipo": "General",
         "modalidad": "Presencial",
         "estado": "Programada"
       }
     }
   }
   ```
   **Status:** `201 Created`

---

### **3. Leer Citas (PERMITIDO)**

**Request:**
```bash
GET /api/gestion-citas
Authorization: Bearer TOKEN_EMPLEADO_BASICO
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_citas', 'leer')` valida:**
   ```javascript
   // ✅ El rol "empleado_basico" SÍ tiene: gestion_citas + leer
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "citas": [/* lista de citas */]
     }
   }
   ```
   **Status:** `200 OK`

---

### **4. Actualizar Cita (PERMITIDO)**

**Request:**
```bash
PUT /api/gestion-citas/200/reprogramar
Authorization: Bearer TOKEN_EMPLEADO_BASICO
Content-Type: application/json

{
  "fecha": "2026-02-16",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00"
}
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_citas', 'actualizar')` valida:**
   ```javascript
   // ✅ El rol "empleado_basico" SÍ tiene: gestion_citas + actualizar
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "cita": {
         "id_cita": 200,
         "fecha": "2026-02-16",
         "hora_inicio": "10:00:00",
         "hora_fin": "11:00:00",
         "estado": "Reprogramada"
       }
     }
   }
   ```
   **Status:** `200 OK`

---

### **5. Leer Clientes (PERMITIDO)**

**Request:**
```bash
GET /api/gestion-clientes
Authorization: Bearer TOKEN_EMPLEADO_BASICO
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_clientes', 'leer')` valida:**
   ```javascript
   // ✅ El rol "empleado_basico" SÍ tiene: gestion_clientes + leer
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "clientes": [/* lista de clientes */]
     }
   }
   ```
   **Status:** `200 OK`

---

## 📊 Resumen: Permisos del Rol "empleado_basico"

| Módulo | Crear | Leer | Actualizar | Eliminar | Resultado |
|--------|-------|------|------------|----------|-----------|
| **Solicitudes** | ❌ | ✅ | ❌ | ❌ | Solo lectura |
| **Citas** | ✅ | ✅ | ✅ | ❌ | Gestión completa excepto eliminar |
| **Clientes** | ❌ | ✅ | ❌ | ❌ | Solo lectura |

---

## 🔍 Comparación: Antes vs Después

### **ANTES (Sin Validación de Permisos):**

Si el rol "empleado_basico" solo tenía `roleMiddleware(["administrador", "empleado"])`:

| Acción | Resultado | ¿Correcto? |
|--------|-----------|------------|
| Crear Solicitud | ✅ **PERMITIDO** | ❌ **NO** (no debería poder) |
| Leer Solicitudes | ✅ PERMITIDO | ✅ Sí |
| Actualizar Solicitud | ✅ **PERMITIDO** | ❌ **NO** (no debería poder) |
| Eliminar Solicitud | ✅ **PERMITIDO** | ❌ **NO** (no debería poder) |
| Crear Cita | ✅ PERMITIDO | ✅ Sí |
| Eliminar Cita | ✅ **PERMITIDO** | ❌ **NO** (no debería poder) |

**Problema:** El empleado podía hacer TODO, aunque el rol solo tenía permisos limitados.

---

### **DESPUÉS (Con Validación de Permisos):**

Con `checkPermiso` validando permisos específicos:

| Acción | Resultado | ¿Correcto? |
|--------|-----------|------------|
| Crear Solicitud | ❌ **DENEGADO** | ✅ **SÍ** (correcto) |
| Leer Solicitudes | ✅ PERMITIDO | ✅ Sí |
| Actualizar Solicitud | ❌ **DENEGADO** | ✅ **SÍ** (correcto) |
| Eliminar Solicitud | ❌ **DENEGADO** | ✅ **SÍ** (correcto) |
| Crear Cita | ✅ PERMITIDO | ✅ Sí |
| Eliminar Cita | ❌ **DENEGADO** | ✅ **SÍ** (correcto) |

**Resultado:** El empleado solo puede hacer las acciones que se le asignaron al rol.

---

## ✅ Respuesta a tu Pregunta

### **¿Con este plan, al crear un nuevo rol y asignarle permisos + privilegios, ya NO permitirá hacer acciones que no se le dieron?**

**✅ SÍ, EXACTAMENTE ESO.**

### **Cómo Funciona:**

1. **Crear rol con permisos específicos:**
   - Rol "empleado_basico" tiene:
     - ✅ `gestion_solicitudes` + `leer`
     - ❌ **NO tiene:** `gestion_solicitudes` + `crear`
     - ❌ **NO tiene:** `gestion_solicitudes` + `actualizar`
     - ❌ **NO tiene:** `gestion_solicitudes` + `eliminar`

2. **Asignar rol a usuario:**
   - Usuario tiene `id_rol = 7` (rol "empleado_basico")

3. **Usuario intenta crear solicitud:**
   - `checkPermiso('gestion_solicitudes', 'crear')` busca en `rol_permisos_privilegios`
   - Busca: `id_rol=7, id_permiso=gestion_solicitudes, id_privilegio=crear`
   - ❌ **No encuentra** → **DENEGADO** (403 Forbidden)

4. **Usuario intenta leer solicitudes:**
   - `checkPermiso('gestion_solicitudes', 'leer')` busca en `rol_permisos_privilegios`
   - Busca: `id_rol=7, id_permiso=gestion_solicitudes, id_privilegio=leer`
   - ✅ **Encuentra** → **PERMITIDO** (200 OK)

### **Ventajas:**

- ✅ **Control granular:** Cada acción requiere un permiso específico
- ✅ **Seguridad:** Los usuarios solo pueden hacer lo que su rol permite
- ✅ **Flexibilidad:** Puedes crear roles personalizados con permisos específicos
- ✅ **Auditoría:** Sabes exactamente qué puede hacer cada rol

---

## 🎯 Ejemplo Adicional: Rol "Empleado Supervisor"

### **Crear Rol con Más Permisos:**

```json
POST /api/roles
{
  "nombre": "empleado_supervisor",
  "estado": true,
  "permisos": {
    "solicitudes": {
      "crear": true,       // ← SÍ puede crear
      "leer": true,        // ← SÍ puede leer
      "actualizar": true,  // ← SÍ puede actualizar
      "eliminar": true     // ← SÍ puede eliminar
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": true     // ← SÍ puede eliminar
    },
    "usuarios": {
      "crear": false,      // ← NO puede crear
      "leer": true,        // ← SÍ puede leer
      "actualizar": true,  // ← SÍ puede actualizar
      "eliminar": false    // ← NO puede eliminar
    }
  }
}
```

**Resultado:**
- ✅ Puede crear, leer, actualizar y eliminar solicitudes
- ✅ Puede crear, leer, actualizar y eliminar citas
- ✅ Puede leer y actualizar usuarios (pero NO crear ni eliminar)
- ❌ No puede crear usuarios
- ❌ No puede eliminar usuarios

---

## 🔒 Seguridad Garantizada

### **Validación en 3 Niveles:**

1. **Nivel 1: Autenticación (`authMiddleware`)**
   - Verifica que el usuario esté autenticado
   - Carga permisos/privilegios del rol

2. **Nivel 2: Rol (`roleMiddleware`)**
   - Valida que el usuario tenga el rol correcto
   - Mantiene compatibilidad con sistema actual

3. **Nivel 3: Permisos (`checkPermiso`)**
   - Valida combinación específica de permiso + privilegio
   - Bypass automático para administrador
   - Validación granular para empleados

### **Garantías:**

- ✅ **Administrador:** Acceso total (bypass automático)
- ✅ **Cliente:** Permisos actuales mantenidos (sin cambios)
- ✅ **Empleado:** Solo puede hacer lo que su rol permite
- ✅ **Seguridad:** No se pueden hacer acciones no autorizadas

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

