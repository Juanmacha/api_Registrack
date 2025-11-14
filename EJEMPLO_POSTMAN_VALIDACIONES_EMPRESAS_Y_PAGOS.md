# 📝 Ejemplo Postman: Validaciones de Empresas y Pagos

**Fecha:** Enero 2026  
**Estado:** ✅ **VALIDACIONES IMPLEMENTADAS**  
**Módulos:** Gestión de Empresas (`/api/gestion-empresas`) y Gestión de Pagos (`/api/gestion-pagos`)

---

## 📋 Variables de Entorno

Antes de probar, configura estas variables en Postman:

```javascript
base_url = http://localhost:3000/api
token_admin = <token_de_administrador>
token_empleado = <token_de_empleado>
token_cliente = <token_de_cliente>
id_empresa_test = <id_de_empresa_de_prueba>
id_pago_test = <id_de_pago_de_prueba>
id_orden_servicio_test = <id_de_orden_de_servicio_de_prueba>
nit_empresa_test = <nit_de_empresa_de_prueba>
```

---

## 🏢 MÓDULO: EMPRESAS

### ✅ Test 1: Validación de IDs en Parámetros (Protección SQL Injection)

#### ❌ Test 1.1: ID con caracteres especiales
```http
GET {{base_url}}/gestion-empresas/abc/clientes
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ❌ Test 1.2: ID con inyección SQL
```http
GET {{base_url}}/gestion-empresas/1; DROP TABLE empresas;--/clientes
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ❌ Test 1.3: ID negativo
```http
GET {{base_url}}/gestion-empresas/-1/clientes
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ✅ Test 1.4: ID válido
```http
GET {{base_url}}/gestion-empresas/{{id_empresa_test}}/clientes
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):** Lista de clientes de la empresa.

---

### ✅ Test 2: Sistema de Permisos Granular (Control de Acceso)

#### ❌ Test 2.1: Cliente intenta crear empresa
```http
POST {{base_url}}/gestion-empresas
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "nit": "9001234567",
  "nombre": "Mi Empresa",
  "tipo_empresa": "Sociedad por Acciones Simplificada"
}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de empresas",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

#### ❌ Test 2.2: Cliente intenta listar clientes de empresa
```http
GET {{base_url}}/gestion-empresas/{{id_empresa_test}}/clientes
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):** Error de permisos (clientes no tienen acceso).

#### ✅ Test 2.3: Administrador crea empresa
```http
POST {{base_url}}/gestion-empresas
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nit": "9001234567",
  "nombre": "Mi Empresa Nueva",
  "tipo_empresa": "Sociedad por Acciones Simplificada",
  "direccion": "Calle 123",
  "telefono": "3001234567",
  "email": "empresa@example.com"
}
```

**Respuesta Esperada (201):** Empresa creada correctamente.

#### ✅ Test 2.4: Empleado lista clientes de empresa
```http
GET {{base_url}}/gestion-empresas/{{id_empresa_test}}/clientes
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Lista de clientes de la empresa (si tiene permiso `leer`).

---

### ✅ Test 3: Validación de Unicidad de NIT

#### ❌ Test 3.1: Intentar crear empresa con NIT duplicado
```http
POST {{base_url}}/gestion-empresas
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nit": "{{nit_empresa_test}}",
  "nombre": "Empresa Duplicada",
  "tipo_empresa": "Sociedad por Acciones Simplificada"
}
```

**Respuesta Esperada (409):**
```json
{
  "success": false,
  "error": {
    "message": "Ya existe una empresa con este NIT",
    "code": "DUPLICATE_NIT",
    "details": {
      "field": "nit",
      "value": 9001234567,
      "empresa_existente": {
        "id_empresa": 1,
        "nombre": "Mi Empresa Nueva"
      }
    },
    "timestamp": "2026-01-15T10:00:00.000Z"
  }
}
```

#### ✅ Test 3.2: Crear empresa con NIT único
```http
POST {{base_url}}/gestion-empresas
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nit": "9009876543",
  "nombre": "Empresa Única",
  "tipo_empresa": "Sociedad por Acciones Simplificada"
}
```

**Respuesta Esperada (201):** Empresa creada correctamente.

---

## 💰 MÓDULO: PAGOS

### ✅ Test 4: Validación de IDs en Parámetros (Protección SQL Injection)

#### ❌ Test 4.1: ID con caracteres especiales
```http
GET {{base_url}}/gestion-pagos/abc
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ❌ Test 4.2: ID con inyección SQL
```http
GET {{base_url}}/gestion-pagos/1; DROP TABLE pagos;--
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ❌ Test 4.3: ID negativo
```http
GET {{base_url}}/gestion-pagos/-1
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ✅ Test 4.4: ID válido
```http
GET {{base_url}}/gestion-pagos/{{id_pago_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):** Información del pago.

---

### ✅ Test 5: Sistema de Permisos Granular (Control de Acceso)

#### ✅ Test 5.1: Cliente ve sus propios pagos (PERMITIDO)
```http
GET {{base_url}}/gestion-pagos
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (200):** Lista de pagos del cliente (filtrados automáticamente).

#### ✅ Test 5.2: Cliente ve su propio pago por ID (PERMITIDO)
```http
GET {{base_url}}/gestion-pagos/{{id_pago_test}}
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (200):** Información del pago si pertenece al cliente.

#### ❌ Test 5.3: Cliente intenta ver pago de otro cliente
```http
GET {{base_url}}/gestion-pagos/{{id_pago_test}}
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para ver este pago",
  "error": {
    "code": "PERMISSION_DENIED",
    "details": "Solo puedes ver tus propios pagos"
  }
}
```

#### ✅ Test 5.4: Cliente procesa pago (PERMITIDO)
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (200):** Pago procesado correctamente (monto automático).

#### ❌ Test 5.5: Cliente intenta simular pago (NO PERMITIDO)
```http
POST {{base_url}}/gestion-pagos/simular
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "monto": 500000,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (403):** Error de permisos (solo admin/empleado).

#### ✅ Test 5.6: Administrador lista todos los pagos
```http
GET {{base_url}}/gestion-pagos
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):** Lista de todos los pagos.

---

### ✅ Test 6: Validación de Montos (Rangos y Precisión)

#### ❌ Test 6.1: Monto negativo
```http
POST {{base_url}}/gestion-pagos
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "monto": -1000,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El monto debe ser un número positivo mayor a 0",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "monto",
      "value": -1000
    },
    "timestamp": "2026-01-15T10:00:00.000Z"
  }
}
```

#### ❌ Test 6.2: Monto cero
```http
POST {{base_url}}/gestion-pagos
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "monto": 0,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El monto debe ser un número positivo mayor a 0",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "monto",
      "value": 0
    }
  }
}
```

#### ❌ Test 6.3: Monto excede límite (más de 1 billón)
```http
POST {{base_url}}/gestion-pagos/simular
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "monto": 2000000000,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El monto excede el límite permitido de $1,000,000,000 (1 billón). Monto recibido: $2,000,000,000",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "monto",
      "value": 2000000000
    }
  }
}
```

#### ❌ Test 6.4: Monto con más de 2 decimales
```http
POST {{base_url}}/gestion-pagos/simular
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "monto": 50000.123,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El monto debe tener máximo 2 decimales. Ejemplo válido: 50000.00 o 50000",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "monto",
      "value": 50000.123
    }
  }
}
```

#### ✅ Test 6.5: Monto válido con 2 decimales
```http
POST {{base_url}}/gestion-pagos/simular
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "monto": 50000.50,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (201):** Pago simulado correctamente.

#### ✅ Test 6.6: Monto válido sin decimales
```http
POST {{base_url}}/gestion-pagos/simular
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "monto": 50000,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (201):** Pago simulado correctamente.

---

### ✅ Test 7: Validación de Relaciones Foreign Key (id_orden_servicio)

#### ❌ Test 7.1: Orden de servicio no existe
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": 99999
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "Orden de servicio no encontrada con ID: 99999",
    "code": "FOREIGN_KEY_ERROR",
    "details": {
      "field": "id_orden_servicio",
      "value": 99999
    },
    "timestamp": "2026-01-15T10:00:00.000Z"
  }
}
```

#### ❌ Test 7.2: Orden de servicio anulada
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_anulado}}
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "No se puede procesar un pago para una orden de servicio anulada (ID: {{id_orden_servicio_anulado}})",
    "code": "FOREIGN_KEY_ERROR",
    "details": {
      "field": "id_orden_servicio",
      "value": {{id_orden_servicio_anulado}}
    }
  }
}
```

#### ❌ Test 7.3: ID de orden de servicio inválido (string)
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": "abc"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El ID de la orden de servicio debe ser un número válido mayor a 0",
    "code": "FOREIGN_KEY_ERROR",
    "details": {
      "field": "id_orden_servicio",
      "value": "abc"
    }
  }
}
```

#### ✅ Test 7.4: Orden de servicio válida
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (200):** Pago procesado correctamente.

---

### ✅ Test 8: Validación de Monto vs Total Estimado

#### ❌ Test 8.1: Monto no coincide con total estimado
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "monto": 100000,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El monto enviado ($100,000) no coincide con el total estimado de la orden ($500,000). Use el monto correcto o omita el campo 'monto' para usar el precio automático.",
    "code": "AMOUNT_MISMATCH",
    "details": {
      "monto_enviado": 100000,
      "total_estimado": 500000,
      "diferencia": 400000
    },
    "timestamp": "2026-01-15T10:00:00.000Z"
  }
}
```

#### ✅ Test 8.2: Monto coincide con total estimado
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "monto": 500000,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (200):** Pago procesado correctamente.

#### ✅ Test 8.3: Monto omitido (se usa automáticamente)
```http
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}
```

**Respuesta Esperada (200):** Pago procesado correctamente con monto automático del servicio.

---

## 📝 Resumen de Validaciones Probadas

### **Empresas:**
| Validación | Endpoint | Rol Probado | Resultado Esperado |
|-----------|----------|-------------|-------------------|
| **ID Inválido (SQL Injection)** | `GET /:abc/clientes` | Admin | 400 Bad Request |
| **ID Inválido (SQL Injection)** | `GET /1; DROP.../clientes` | Admin | 400 Bad Request |
| **ID Inválido (Negativo)** | `GET /-1/clientes` | Admin | 400 Bad Request |
| **ID Válido** | `GET /1/clientes` | Admin | 200 OK |
| **Permisos: Cliente crea empresa** | `POST /` | Cliente | 403 Forbidden |
| **Permisos: Admin crea empresa** | `POST /` | Admin | 201 Created |
| **Unicidad: NIT duplicado** | `POST /` (NIT existente) | Admin | 409 Conflict |
| **Unicidad: NIT único** | `POST /` (NIT nuevo) | Admin | 201 Created |

### **Pagos:**
| Validación | Endpoint | Rol Probado | Resultado Esperado |
|-----------|----------|-------------|-------------------|
| **ID Inválido (SQL Injection)** | `GET /:abc` | Admin | 400 Bad Request |
| **ID Inválido (SQL Injection)** | `GET /1; DROP...` | Admin | 400 Bad Request |
| **ID Inválido (Negativo)** | `GET /-1` | Admin | 400 Bad Request |
| **ID Válido** | `GET /1` | Admin | 200 OK |
| **Permisos: Cliente ve sus pagos** | `GET /` | Cliente | 200 OK (filtrado) |
| **Permisos: Cliente ve pago ajeno** | `GET /:id_otro` | Cliente | 403 Forbidden |
| **Permisos: Cliente procesa pago** | `POST /process-mock` | Cliente | 200 OK |
| **Permisos: Cliente simula pago** | `POST /simular` | Cliente | 403 Forbidden |
| **Monto: Negativo** | `POST /simular` (monto: -1000) | Admin | 400 Bad Request |
| **Monto: Cero** | `POST /simular` (monto: 0) | Admin | 400 Bad Request |
| **Monto: Excede límite** | `POST /simular` (monto: 2000000000) | Admin | 400 Bad Request |
| **Monto: Más de 2 decimales** | `POST /simular` (monto: 50000.123) | Admin | 400 Bad Request |
| **Monto: Válido** | `POST /simular` (monto: 50000.50) | Admin | 201 Created |
| **FK: Orden no existe** | `POST /process-mock` (id: 99999) | Cliente | 400 Bad Request |
| **FK: Orden anulada** | `POST /process-mock` (id: anulado) | Cliente | 400 Bad Request |
| **FK: Orden válida** | `POST /process-mock` (id: válido) | Cliente | 200 OK |
| **Monto vs Total: No coincide** | `POST /process-mock` (monto diferente) | Cliente | 400 Bad Request |
| **Monto vs Total: Coincide** | `POST /process-mock` (monto correcto) | Cliente | 200 OK |
| **Monto vs Total: Omitido** | `POST /process-mock` (sin monto) | Cliente | 200 OK (automático) |

---

## 🔍 Scripts Postman (Tests Tab)

### **Script para Extraer ID de Orden de Servicio:**
```javascript
// En el test de "Crear solicitud"
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.solicitud) {
    pm.collectionVariables.set("id_orden_servicio_test", jsonData.data.solicitud.id_orden_servicio);
    console.log("✅ ID Orden Servicio guardado:", jsonData.data.solicitud.id_orden_servicio);
  }
}
```

### **Script para Validar Respuesta de Error 400:**
```javascript
pm.test("Status code es 400", function () {
  pm.response.to.have.status(400);
});

pm.test("Mensaje de error correcto", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.error.code).to.be.oneOf(['VALIDATION_ERROR', 'FOREIGN_KEY_ERROR', 'AMOUNT_MISMATCH']);
});
```

### **Script para Validar Respuesta de Error 403:**
```javascript
pm.test("Status code es 403", function () {
  pm.response.to.have.status(403);
});

pm.test("Mensaje de error indica falta de permisos", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.mensaje).to.include("no tienen acceso");
});
```

### **Script para Validar Respuesta de Error 409 (NIT Duplicado):**
```javascript
pm.test("Status code es 409", function () {
  pm.response.to.have.status(409);
});

pm.test("Código de error es DUPLICATE_NIT", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.error.code).to.equal("DUPLICATE_NIT");
});
```

---

## 📚 Notas Importantes

### **Empresas:**
1. **Orden de Rutas:** La ruta `/nit/:nit/clientes` NO requiere `validateId` porque el parámetro es `nit` (no `id`).
2. **Validación de NIT:** La validación de unicidad se realiza ANTES de intentar crear la empresa, proporcionando mensajes descriptivos.
3. **Clientes:** Los clientes NO tienen acceso a ningún endpoint de empresas (rechazo automático).

### **Pagos:**
1. **Orden de Rutas:** La ruta `/reporte/excel` debe ir ANTES de `/:id` para evitar conflictos.
2. **Validación de Monto:** 
   - Los montos deben ser positivos (> 0)
   - Límite máximo: $1,000,000,000 (1 billón)
   - Precisión máxima: 2 decimales
   - Si se omite `monto`, se usa automáticamente el `total_estimado` de la orden
3. **Validación de Orden de Servicio:**
   - Debe existir en la base de datos
   - No debe estar anulada
   - El ID debe ser un número válido
4. **Clientes:** Los clientes pueden crear y leer sus propios pagos (validación de propiedad en controlador).

---

## 🎯 Ejemplos de Uso Común

### **Crear Empresa y Listar Clientes:**
```http
### 1. Crear empresa
POST {{base_url}}/gestion-empresas
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nit": "9001234567",
  "nombre": "Mi Empresa",
  "tipo_empresa": "Sociedad por Acciones Simplificada",
  "direccion": "Calle 123",
  "telefono": "3001234567",
  "email": "empresa@example.com"
}

### 2. Listar clientes de empresa por ID
GET {{base_url}}/gestion-empresas/{{id_empresa_test}}/clientes
Authorization: Bearer {{token_admin}}

### 3. Listar clientes de empresa por NIT
GET {{base_url}}/gestion-empresas/nit/9001234567/clientes
Authorization: Bearer {{token_admin}}
```

### **Procesar Pago (Cliente):**
```http
### 1. Cliente procesa pago (monto automático)
POST {{base_url}}/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{id_orden_servicio_test}}
}

### 2. Cliente ve sus pagos
GET {{base_url}}/gestion-pagos
Authorization: Bearer {{token_cliente}}

### 3. Cliente ve un pago específico
GET {{base_url}}/gestion-pagos/{{id_pago_test}}
Authorization: Bearer {{token_cliente}}
```

### **Administrar Pagos (Admin):**
```http
### 1. Admin lista todos los pagos
GET {{base_url}}/gestion-pagos
Authorization: Bearer {{token_admin}}

### 2. Admin descarga reporte Excel
GET {{base_url}}/gestion-pagos/reporte/excel
Authorization: Bearer {{token_admin}}

### 3. Admin verifica pago manualmente
POST {{base_url}}/gestion-pagos/{{id_pago_test}}/verify-manual
Authorization: Bearer {{token_admin}}
```

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026

