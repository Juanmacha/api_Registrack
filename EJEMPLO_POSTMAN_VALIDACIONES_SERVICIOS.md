# 📝 Ejemplo Postman: Validaciones del Módulo de Servicios

**Fecha:** Enero 2026  
**Estado:** ✅ **VALIDACIONES IMPLEMENTADAS**  
**Módulo:** Gestión de Servicios (`/api/servicios`)

---

## 📋 Variables de Entorno

Antes de probar, configura estas variables en Postman:

```javascript
base_url = http://localhost:3000/api
token_admin = <token_de_administrador>
token_empleado = <token_de_empleado>
token_cliente = <token_de_cliente>
id_servicio_test = <id_de_servicio_de_prueba>
```

### Obtener Tokens

#### Login Administrador
```http
POST {{base_url}}/usuarios/login
Content-Type: application/json

{
  "correo": "admin@registrack.com",
  "contrasena": "Admin123!"
}
```
**Guarda el token en:** `{{token_admin}}`

#### Login Empleado
```http
POST {{base_url}}/usuarios/login
Content-Type: application/json

{
  "correo": "empleado@registrack.com",
  "contrasena": "Empleado123!"
}
```
**Guarda el token en:** `{{token_empleado}}`

#### Login Cliente
```http
POST {{base_url}}/usuarios/login
Content-Type: application/json

{
  "correo": "cliente@registrack.com",
  "contrasena": "Cliente123!"
}
```
**Guarda el token en:** `{{token_cliente}}`

---

## ✅ Test 1: Validación de IDs en Parámetros (Protección SQL Injection)

### **Objetivo:** Verificar que los IDs inválidos sean rechazados correctamente.

#### ❌ Test 1.1: ID con caracteres especiales
```http
PUT {{base_url}}/servicios/abc
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "Servicio de Prueba"
}
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
PUT {{base_url}}/servicios/1; DROP TABLE servicios;--
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "Servicio de Prueba"
}
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
PUT {{base_url}}/servicios/-1
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "Servicio de Prueba"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ❌ Test 1.4: ID cero
```http
PUT {{base_url}}/servicios/0
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "Servicio de Prueba"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ✅ Test 1.5: ID Válido
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "Servicio Actualizado",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "nombre": "Servicio Actualizado",
    ...
  }
}
```

---

## ✅ Test 2: Sistema de Permisos Granular (Control Híbrido)

### **Objetivo:** Verificar que los permisos se validen correctamente según el rol del usuario.

#### ❌ Test 2.1: Cliente intenta actualizar servicio
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "nombre": "Servicio Actualizado"
}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de servicios",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

#### ❌ Test 2.2: Cliente intenta ver servicios admin
```http
GET {{base_url}}/servicios/admin/todos
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de servicios",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

#### ❌ Test 2.3: Cliente intenta ocultar servicio
```http
PATCH {{base_url}}/servicios/{{id_servicio_test}}/ocultar
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de servicios",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

#### ✅ Test 2.4: Administrador actualiza servicio
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "Servicio Actualizado por Admin",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "nombre": "Servicio Actualizado por Admin",
    ...
  }
}
```

#### ✅ Test 2.5: Empleado actualiza servicio
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_empleado}}
Content-Type: application/json

{
  "nombre": "Servicio Actualizado por Empleado",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "nombre": "Servicio Actualizado por Empleado",
    ...
  }
}
```

#### ✅ Test 2.6: Cliente consulta servicios públicos (permítido)
```http
GET {{base_url}}/servicios
```

**Respuesta Esperada (200):**
```json
[
  {
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    ...
  },
  ...
]
```

**Nota:** Las rutas públicas (`GET /servicios`, `GET /servicios/:id`, `GET /servicios/buscar`) no requieren autenticación y están disponibles para todos, incluyendo clientes.

---

## ✅ Test 3: Validación de Precios (Rangos y Precisión)

### **Objetivo:** Verificar que los precios se validen correctamente (positivos, máximo 2 decimales, límite máximo).

**Nota:** El sistema acepta tanto el campo `precio` como `precio_base`, pero siempre normaliza a `precio_base` después de validar.

#### ❌ Test 3.1: Precio negativo (usando campo 'precio')
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio": -1000
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El precio debe ser un número positivo mayor a 0",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "precio",
      "expectedField": "precio_base",
      "value": -1000,
      "receivedValue": -1000
    },
    "timestamp": "2026-01-XX..."
  }
}
```

#### ❌ Test 3.1b: Precio negativo (usando campo 'precio_base')
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": -1000
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El precio debe ser un número positivo mayor a 0",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "precio_base",
      "value": -1000,
      "receivedValue": -1000
    },
    "timestamp": "2026-01-XX..."
  }
}
```

#### ❌ Test 3.1c: Precio cero (usando campo 'precio')
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio": 0
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El precio debe ser un número positivo mayor a 0",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "precio",
      "expectedField": "precio_base",
      "value": 0,
      "receivedValue": 0
    },
    "timestamp": "2026-01-XX..."
  }
}
```

#### ❌ Test 3.2: Precio cero (usando campo 'precio_base')
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": 0
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El precio debe ser un número positivo mayor a 0",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "precio_base",
      "value": 0,
      "receivedValue": 0
    },
    "timestamp": "2026-01-XX..."
  }
}
```

#### ❌ Test 3.3: Precio excede límite máximo (1 billón)
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": 2000000000
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El precio excede el límite permitido de $1,000,000,000 (1 billón). Precio recibido: $2,000,000,000",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "precio_base",
      "value": 2000000000,
      "receivedValue": 2000000000
    },
    "timestamp": "2026-01-XX..."
  }
}
```

#### ❌ Test 3.4: Precio con más de 2 decimales
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": 50000.999
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El precio debe tener máximo 2 decimales. Ejemplo válido: 50000.00 o 50000",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "precio_base",
      "value": 50000.999,
      "receivedValue": 50000.999
    },
    "timestamp": "2026-01-XX..."
  }
}
```

#### ❌ Test 3.5: Precio con formato inválido (string)
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": "abc"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El precio debe ser un número válido",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "precio_base",
      "value": "abc",
      "receivedValue": null
    },
    "timestamp": "2026-01-XX..."
  }
}
```

#### ✅ Test 3.6: Precio válido (sin decimales)
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": 50000
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "precio_base": 50000,
    ...
  }
}
```

#### ✅ Test 3.7: Precio válido (con 2 decimales)
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": 50000.50
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "precio_base": 50000.50,
    ...
  }
}
```

#### ✅ Test 3.8: Precio válido (límite máximo permitido)
```http
PUT {{base_url}}/servicios/{{id_servicio_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "precio_base": 1000000000
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Servicio actualizado exitosamente",
  "data": {
    "id": "1",
    "precio_base": 1000000000,
    ...
  }
}
```

---

## ✅ Test 4: Validación de IDs en Otras Rutas

### **Objetivo:** Verificar que la validación de IDs se aplique en todas las rutas protegidas.

#### ❌ Test 4.1: ID inválido en ocultar servicio
```http
PATCH {{base_url}}/servicios/abc/ocultar
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ❌ Test 4.2: ID inválido en publicar servicio
```http
PATCH {{base_url}}/servicios/1; DROP TABLE servicios;--/publicar
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ❌ Test 4.3: ID inválido en actualizar procesos
```http
PUT {{base_url}}/servicios/-1/procesos
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "procesos": []
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El idServicio debe ser un número válido mayor a 0"
}
```

---

## 📊 Resumen de Validaciones

| Validación | Estado | Endpoints Afectados |
|------------|--------|---------------------|
| **Validación de IDs** | ✅ Implementada | `PUT /:id`, `PATCH /:id/ocultar`, `PATCH /:id/publicar`, `PUT /:idServicio/procesos` |
| **Sistema de Permisos Granular** | ✅ Implementada | `GET /admin/todos`, `PUT /:id`, `PATCH /:id/ocultar`, `PATCH /:id/publicar`, `PUT /:idServicio/procesos` |
| **Validación de Precios** | ✅ Implementada | `PUT /:id` (cuando se proporciona `precio_base`) |

---

## 🔍 Notas Importantes

1. **Rutas Públicas:** Las rutas `GET /servicios`, `GET /servicios/:id`, `GET /servicios/buscar`, `GET /servicios/:id/detalle` y `GET /servicios/:idServicio/procesos` son públicas y no requieren autenticación.

2. **Rutas Protegidas:** Las rutas `GET /servicios/admin/todos`, `PUT /servicios/:id`, `PATCH /servicios/:id/ocultar`, `PATCH /servicios/:id/publicar` y `PUT /servicios/:idServicio/procesos` requieren autenticación y permisos específicos.

3. **Clientes:** Los clientes no tienen acceso a ninguna ruta protegida de servicios. Todas las solicitudes de clientes a rutas protegidas devolverán 403 Forbidden.

4. **Validación de Precios:** La validación de precios se aplica cuando se proporciona el campo `precio` o `precio_base` en la actualización del servicio. El sistema acepta ambos campos, los valida de la misma manera, y siempre normaliza a `precio_base` en la base de datos. Si no se proporciona ninguno de estos campos, no se valida.

5. **Precisión Decimal:** Los precios deben tener máximo 2 decimales. Ejemplos válidos: `50000`, `50000.00`, `50000.50`. Ejemplos inválidos: `50000.999`, `50000.123`.

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

