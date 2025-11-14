# 📝 Ejemplo Postman: Validaciones del Módulo de Clientes

**Fecha:** Enero 2026  
**Estado:** ✅ **VALIDACIONES IMPLEMENTADAS**  
**Módulo:** Gestión de Clientes (`/api/gestion-clientes`)

---

## 📋 Variables de Entorno

Antes de probar, configura estas variables en Postman:

```javascript
base_url = http://localhost:3000/api
token_admin = <token_de_administrador>
token_cliente = <token_de_cliente>
token_empleado = <token_de_empleado>
id_cliente_test = <id_de_cliente_de_prueba>
id_cliente_propio = <id_cliente_del_usuario_cliente>
```

---

## ✅ Test 1: Validación de IDs en Parámetros (Protección SQL Injection)

### **Objetivo:** Verificar que los IDs inválidos sean rechazados correctamente.

#### ❌ Test 1.1: ID con caracteres especiales
```http
GET {{base_url}}/gestion-clientes/abc
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
GET {{base_url}}/gestion-clientes/1; DROP TABLE clientes;--
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
GET {{base_url}}/gestion-clientes/-1
Authorization: Bearer {{token_admin}}
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
GET {{base_url}}/gestion-clientes/0
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

#### ✅ Test 1.5: ID válido
```http
GET {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Cliente encontrado",
  "data": {
    "cliente": {
      "id_cliente": 1,
      "id_usuario": 5,
      "marca": "...",
      "tipo_persona": "Natural",
      ...
    }
  }
}
```

---

## ✅ Test 2: Sistema de Permisos Granular (Control de Acceso)

### **Objetivo:** Verificar que el sistema de permisos funcione correctamente.

#### ❌ Test 2.1: Cliente intenta listar todos los clientes (SOLO LECTURA)
```http
GET {{base_url}}/gestion-clientes
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen permiso para acceder a clientes",
  "permiso_requerido": "gestion_clientes",
  "privilegio_requerido": "leer",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

**Nota:** Los clientes NO pueden listar todos los clientes, solo pueden ver su propio perfil.

#### ✅ Test 2.2: Cliente ve su propio perfil (PERMITIDO)
```http
GET {{base_url}}/gestion-clientes/{{id_cliente_propio}}
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (200):** Cliente ve su propio perfil correctamente.

#### ❌ Test 2.3: Cliente intenta ver otro cliente
```http
GET {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para ver este cliente",
  "error": {
    "code": "PERMISSION_DENIED",
    "details": "Solo puedes ver tu propio perfil de cliente"
  }
}
```

#### ❌ Test 2.4: Cliente intenta eliminar cliente
```http
DELETE {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):** Error de permisos (clientes no tienen permiso `eliminar`).

#### ✅ Test 2.5: Administrador lista todos los clientes
```http
GET {{base_url}}/gestion-clientes
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):** Lista de todos los clientes.

#### ✅ Test 2.6: Empleado lista todos los clientes
```http
GET {{base_url}}/gestion-clientes
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Lista de todos los clientes (si tiene permiso `leer`).

---

## ✅ Test 3: Validación de Propiedad de Recursos

### **Objetivo:** Verificar que los clientes solo puedan ver/editar sus propios datos.

#### ✅ Test 3.1: Cliente ve su propio perfil (CORRECTO)
```http
GET {{base_url}}/gestion-clientes/{{id_cliente_propio}}
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Cliente encontrado",
  "data": {
    "cliente": {
      "id_cliente": 1,
      "id_usuario": 5,
      ...
    }
  }
}
```

#### ❌ Test 3.2: Cliente intenta ver otro cliente
```http
GET {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para ver este cliente",
  "error": {
    "code": "PERMISSION_DENIED",
    "details": "Solo puedes ver tu propio perfil de cliente"
  }
}
```

#### ✅ Test 3.3: Cliente edita su propio perfil (CORRECTO)
```http
PUT {{base_url}}/gestion-clientes/{{id_cliente_propio}}
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "marca": "Mi Nueva Marca"
}
```

**Respuesta Esperada (200):** Cliente actualizado correctamente.

#### ❌ Test 3.4: Cliente intenta editar otro cliente
```http
PUT {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "marca": "Marca Modificada"
}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para editar este cliente",
  "error": {
    "code": "PERMISSION_DENIED",
    "details": "Solo puedes editar tu propio perfil de cliente"
  }
}
```

#### ✅ Test 3.5: Cliente edita su propio usuario (CORRECTO)
```http
PUT {{base_url}}/gestion-clientes/{{id_cliente_propio}}/usuario
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "telefono": "3001234567",
  "nombre": "Nombre Actualizado"
}
```

**Respuesta Esperada (200):** Usuario del cliente actualizado correctamente.

#### ❌ Test 3.6: Cliente intenta editar usuario de otro cliente
```http
PUT {{base_url}}/gestion-clientes/{{id_cliente_test}}/usuario
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "telefono": "9999999999"
}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para editar este cliente",
  "error": {
    "code": "PERMISSION_DENIED",
    "details": "Solo puedes editar tu propio perfil de cliente"
  }
}
```

#### ✅ Test 3.7: Cliente edita empresa de su propio cliente (CORRECTO)
```http
PUT {{base_url}}/gestion-clientes/{{id_cliente_propio}}/empresa
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "id_empresa": 1,
  "nombre": "Mi Empresa Actualizada"
}
```

**Respuesta Esperada (200):** Empresa del cliente actualizada correctamente.

#### ❌ Test 3.8: Cliente intenta editar empresa de otro cliente
```http
PUT {{base_url}}/gestion-clientes/{{id_cliente_test}}/empresa
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "id_empresa": 1,
  "nombre": "Empresa Modificada"
}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para editar este cliente",
  "error": {
    "code": "PERMISSION_DENIED",
    "details": "Solo puedes editar tu propio perfil de cliente"
  }
}
```

---

## ✅ Test 4: Administradores y Empleados (Acceso Completo)

### **Objetivo:** Verificar que administradores y empleados tengan acceso completo.

#### ✅ Test 4.1: Administrador ve cualquier cliente
```http
GET {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):** Cliente encontrado correctamente.

#### ✅ Test 4.2: Administrador edita cualquier cliente
```http
PUT {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "marca": "Marca Modificada por Admin"
}
```

**Respuesta Esperada (200):** Cliente actualizado correctamente.

#### ✅ Test 4.3: Administrador elimina cliente
```http
DELETE {{base_url}}/gestion-clientes/{{id_cliente_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):** Cliente eliminado correctamente.

#### ✅ Test 4.4: Empleado lista todos los clientes
```http
GET {{base_url}}/gestion-clientes
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Lista de todos los clientes (si tiene permiso `leer`).

---

## 📝 Resumen de Validaciones Probadas

| Validación | Endpoint | Rol Probado | Resultado Esperado |
|-----------|----------|-------------|-------------------|
| **ID Inválido (SQL Injection)** | `GET /:abc` | Admin | 400 Bad Request |
| **ID Inválido (SQL Injection)** | `GET /1; DROP...` | Admin | 400 Bad Request |
| **ID Inválido (Negativo)** | `GET /-1` | Admin | 400 Bad Request |
| **ID Inválido (Cero)** | `GET /0` | Admin | 400 Bad Request |
| **ID Válido** | `GET /1` | Admin | 200 OK |
| **Permisos: Cliente lista todos** | `GET /` | Cliente | 403 Forbidden |
| **Permisos: Cliente ve su perfil** | `GET /:id_propio` | Cliente | 200 OK |
| **Propiedad: Cliente ve otro** | `GET /:id_otro` | Cliente | 403 Forbidden |
| **Propiedad: Cliente edita otro** | `PUT /:id_otro` | Cliente | 403 Forbidden |
| **Propiedad: Cliente edita propio** | `PUT /:id_propio` | Cliente | 200 OK |
| **Propiedad: Cliente edita usuario otro** | `PUT /:id_otro/usuario` | Cliente | 403 Forbidden |
| **Propiedad: Cliente edita empresa otro** | `PUT /:id_otro/empresa` | Cliente | 403 Forbidden |
| **Admin: Acceso completo** | Todas las rutas | Admin | 200 OK |

---

## 🔍 Scripts Postman (Tests Tab)

### **Script para Extraer ID de Cliente Propio:**
```javascript
// En el test de "Cliente ve su propio perfil"
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  if (jsonData.data && jsonData.data.cliente) {
    pm.collectionVariables.set("id_cliente_propio", jsonData.data.cliente.id_cliente);
    console.log("✅ ID Cliente Propio guardado:", jsonData.data.cliente.id_cliente);
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
  pm.expect(jsonData.message).to.include("número válido");
});
```

### **Script para Validar Respuesta de Error 403:**
```javascript
pm.test("Status code es 403", function () {
  pm.response.to.have.status(403);
});

pm.test("Código de error es PERMISSION_DENIED", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData.error.code).to.equal("PERMISSION_DENIED");
});
```

---

## 📚 Notas Importantes

1. **Orden de Rutas:** La ruta `/reporte/excel` debe ir ANTES de `/:id` para evitar conflictos.

2. **Validación de Propiedad:** Los clientes solo pueden ver/editar sus propios recursos. La validación se hace comparando `cliente.id_usuario === req.user.id_usuario`.

3. **Sistema de Permisos Híbrido:**
   - **Roles principales (admin, empleado):** `roleMiddleware` + `checkPermiso`
   - **Clientes:** Solo `checkPermiso` (con validación de propiedad en controlador)
   - **Roles personalizados:** Solo `checkPermiso`

4. **Permisos del Cliente:** Los clientes tienen acceso a `gestion_clientes` con acciones `leer` y `actualizar` (solo para sus propios recursos).

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026

