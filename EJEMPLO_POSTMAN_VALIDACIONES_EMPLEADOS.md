# 📋 Ejemplos Postman - Validaciones Nuevas del Módulo de Empleados

**Fecha:** Enero 2026  
**Módulo:** Gestión de Empleados  
**Base URL:** `http://localhost:3000/api/gestion-empleados`

---

## ⚙️ Configuración Inicial

### Variables en Postman
```json
{
  "base_url": "http://localhost:3000/api",
  "token_admin": "",
  "token_empleado": "",
  "token_cliente": ""
}
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

---

## ✅ 1. Validación de IDs en Parámetros

### ❌ Test 1: ID Inválido (String)
```http
GET {{base_url}}/gestion-empleados/abc
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

### ❌ Test 2: ID Negativo
```http
GET {{base_url}}/gestion-empleados/-1
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

### ❌ Test 3: ID Cero
```http
GET {{base_url}}/gestion-empleados/0
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

### ❌ Test 4: Intento de Inyección SQL
```http
GET {{base_url}}/gestion-empleados/1; DROP TABLE empleados;--
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

### ✅ Test 5: ID Válido
```http
GET {{base_url}}/gestion-empleados/1
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200 o 404):**
- **200:** Si existe el empleado
- **404:** Si no existe el empleado

---

## 🔐 2. Validación de Permisos Granulares (Híbrido)

### ✅ Test 1: Administrador - DEBE FUNCIONAR (roleMiddleware + checkPermiso)
```http
GET {{base_url}}/gestion-empleados/
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
[
  {
    "id_usuario": 2,
    "nombre": "Juan",
    ...
  }
]
```

**Explicación:** 
- ✅ Pasa `roleMiddleware` (rol: administrador)
- ✅ Pasa `checkPermiso` (administrador tiene bypass automático)

---

### ⚠️ Test 2: Empleado - DEPENDE DE PERMISOS (roleMiddleware + checkPermiso)
```http
GET {{base_url}}/gestion-empleados/
Authorization: Bearer {{token_empleado}}
```

**Respuesta Posible 1 - Con Permisos (200):**
```json
[
  {
    "id_usuario": 2,
    ...
  }
]
```

**Respuesta Posible 2 - Sin Permisos (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para leer en empleados",
  "permiso_requerido": "gestion_empleados",
  "privilegio_requerido": "leer",
  "rol": "empleado",
  "id_rol": 3
}
```

**Explicación:**
- ✅ Pasa `roleMiddleware` (rol: empleado)
- ⚠️ `checkPermiso` valida si tiene permiso `gestion_empleados` + `leer` en BD

---

### ❌ Test 3: Cliente - DEBE SER RECHAZADO
```http
GET {{base_url}}/gestion-empleados/
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de empleados",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

**Explicación:**
- ❌ Rechazado automáticamente (cliente no tiene acceso a gestión de empleados)
- No pasa por `roleMiddleware` ni `checkPermiso`
- Validación explícita para clientes

---

### ⚠️ Test 4: Rol Personalizado - SOLO checkPermiso (Sin roleMiddleware)
```http
GET {{base_url}}/gestion-empleados/
Authorization: Bearer {{token_rol_personalizado}}
```

**Respuesta Posible 1 - Con Permisos (200):**
```json
[...]
```

**Respuesta Posible 2 - Sin Permisos (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para leer en empleados",
  ...
}
```

**Explicación:**
- ⚠️ Para roles personalizados (id_rol > 3), solo se usa `checkPermiso`
- No pasa por `roleMiddleware`

---

## 🛡️ 3. Validación de Integridad (Asignaciones Activas)

### ❌ Test 1: Eliminar Empleado con Citas Activas

#### Paso 1: Crear Cita Activa para el Empleado
```http
POST {{base_url}}/gestion-citas/
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "fecha": "2026-02-15",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 3,
  "id_empleado": 2,
  "observacion": "Cita de prueba"
}
```

**Guarda el ID del empleado:** `{{id_empleado_test}} = 1` (ajusta según tu BD)

#### Paso 2: Intentar Eliminar el Empleado (DEBE FALLAR)
```http
DELETE {{base_url}}/gestion-empleados/{{id_empleado_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "No se puede eliminar/desactivar el empleado porque tiene 1 cita(s) activa(s) asignada(s). Por favor, reprograme o cancele las citas primero.",
  "detalles": "Debe resolver todas las asignaciones activas antes de eliminar el empleado."
}
```

---

### ❌ Test 2: Eliminar Empleado con Solicitudes Activas

#### Paso 1: Asignar Solicitud Activa al Empleado
```http
PUT {{base_url}}/gestion-solicitudes/asignar-empleado/{{id_solicitud}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "id_empleado": {{id_empleado_test}}
}
```

**Nota:** 
- La ruta es `/asignar-empleado/:id` (con el ID al final), no `/:id/asignar-empleado`
- El campo del body es `id_empleado` (ID de la tabla `empleados`), NO `id_empleado_asignado`
- El `id_empleado` es el ID del registro en la tabla `empleados` (por ejemplo, 2), no el `id_usuario`

#### Paso 2: Intentar Eliminar el Empleado (DEBE FALLAR)
```http
DELETE {{base_url}}/gestion-empleados/{{id_empleado_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "No se puede eliminar/desactivar el empleado porque tiene 1 solicitud(es) activa(s) asignada(s). Por favor, reasigne las solicitudes o finalice/anule primero.",
  "detalles": "Debe resolver todas las asignaciones activas antes de eliminar el empleado."
}
```

---

### ❌ Test 3: Desactivar Empleado con Asignaciones Activas
```http
PATCH {{base_url}}/gestion-empleados/{{id_empleado_test}}/estado
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "estado": false
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "No se puede eliminar/desactivar el empleado porque tiene 1 cita(s) activa(s) asignada(s). Por favor, reprograme o cancele las citas primero.",
  "detalles": "Debe resolver todas las asignaciones activas antes de desactivar el empleado."
}
```

---

### ❌ Test 4: Actualizar Empleado Desactivándolo con Asignaciones Activas
```http
PUT {{base_url}}/gestion-empleados/{{id_empleado_test}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "estado": false,
  "nombre": "Empleado Actualizado"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "No se puede eliminar/desactivar el empleado porque tiene 1 cita(s) activa(s) asignada(s). Por favor, reprograme o cancele las citas primero.",
  "detalles": "Debe resolver todas las asignaciones activas antes de desactivar el empleado."
}
```

---

### ✅ Test 5: Eliminar Empleado SIN Asignaciones Activas (DEBE FUNCIONAR)

#### Paso 1: Cancelar/Finalizar Citas Activas
```http
PATCH {{base_url}}/gestion-citas/{{id_cita}}/anular
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "observacion": "Cancelada para permitir eliminación"
}
```

#### Paso 2: Finalizar/Anular Solicitudes Activas
```http
PUT {{base_url}}/gestion-solicitudes/editar/{{id_solicitud}}
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "estado": "Finalizado"
}
```

**Nota:** La ruta es `/editar/:id` (PUT), no existe una ruta específica para cambiar solo el estado. Se usa `editarSolicitud` con el campo `estado` en el body.

#### Paso 3: Ahora Eliminar el Empleado (DEBE FUNCIONAR)
```http
DELETE {{base_url}}/gestion-empleados/{{id_empleado_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "message": "Empleado y usuario asociado eliminados correctamente.",
  "id_empleado_eliminado": 1,
  "id_usuario_eliminado": 2
}
```

---

### ✅ Test 6: Citas Finalizadas NO Bloquean la Eliminación

**Prerequisito:** El empleado solo tiene citas con estado "Finalizada" o "Anulada"

```http
DELETE {{base_url}}/gestion-empleados/{{id_empleado_test}}
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "message": "Empleado y usuario asociado eliminados correctamente.",
  ...
}
```

**Explicación:**
- ✅ Solo las citas "Programada" o "Reprogramada" se consideran activas
- ✅ Las citas "Finalizada" o "Anulada" NO bloquean la eliminación

---

### ✅ Test 7: Activar Empleado (No Valida Asignaciones)
```http
PATCH {{base_url}}/gestion-empleados/{{id_empleado_test}}/estado
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "estado": true
}
```

**Respuesta Esperada (200):**
```json
{
  "id_usuario": 2,
  ...
  "estado_empleado": true,
  ...
}
```

**Explicación:**
- ✅ La validación solo se ejecuta al intentar desactivar (estado = false)
- ✅ No se valida al activar (estado = true)

---

## 📊 Resumen de Validaciones Nuevas

| Validación | Endpoint | Método | Caso de Prueba | Respuesta Esperada |
|-----------|----------|--------|----------------|-------------------|
| **ID Inválido (String)** | `/:id` | GET | `/abc` | 400 |
| **ID Inválido (Negativo)** | `/:id` | GET | `/-1` | 400 |
| **ID Inválido (Cero)** | `/:id` | GET | `/0` | 400 |
| **Inyección SQL** | `/:id` | GET | `/1; DROP...` | 400 |
| **Permisos (Admin)** | `/` | GET | Token admin | 200 |
| **Permisos (Empleado)** | `/` | GET | Token empleado | 200 o 403 |
| **Permisos (Cliente)** | `/` | GET | Token cliente | 403 |
| **Asignaciones (Citas)** | `/:id` | DELETE | Con citas activas | 400 |
| **Asignaciones (Solicitudes)** | `/:id` | DELETE | Con solicitudes activas | 400 |
| **Desactivar con Asignaciones** | `/:id/estado` | PATCH | Estado false con asignaciones | 400 |
| **Eliminar Sin Asignaciones** | `/:id` | DELETE | Sin asignaciones activas | 200 |

---

## 🔍 Tips Rápidos

1. **Orden de Pruebas:**
   - Primero: Validaciones de ID (rápidas, sin datos previos)
   - Segundo: Permisos (sin datos previos)
   - Tercero: Integridad (requiere crear citas/solicitudes primero)

2. **Variables Útiles:**
   - `{{id_empleado_test}}` - ID del empleado de prueba
   - `{{id_usuario_empleado}}` - ID del usuario asociado al empleado
   - `{{id_cita}}` - ID de cita creada para pruebas
   - `{{id_solicitud}}` - ID de solicitud asignada para pruebas

3. **Scripts Postman (Tests Tab):**
   ```javascript
   // Extraer ID de empleado creado
   if (pm.response.code === 201) {
     const jsonData = pm.response.json();
     pm.collectionVariables.set("id_empleado_test", jsonData.id_empleado);
   }
   ```

---

**Documento creado:** Enero 2026  
**Versión:** 1.0 - Simplificado
