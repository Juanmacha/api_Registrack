# 📋 Ejemplos Postman - Validaciones de Archivos, Seguimiento, Roles, Permisos, Privilegios y Dashboard

**Fecha:** Enero 2026  
**Propósito:** Probar las nuevas validaciones implementadas en los módulos de Archivos, Seguimiento, Roles, Permisos, Privilegios y Dashboard

---

## 🔧 Configuración Inicial

### Variables de Entorno en Postman

```http
base_url = http://localhost:3000/api
token_admin = (token JWT de administrador)
token_empleado = (token JWT de empleado)
token_cliente = (token JWT de cliente)
token_rol_personalizado = (token JWT de rol personalizado con permisos específicos)
```

---

## 📁 MÓDULO: ARCHIVOS (`gestion_archivos`)

**⚠️ IMPORTANTE:** La ruta base es `/api/gestion-archivos` (no `/api/archivos`)

### ✅ Test 1: Subir Archivo (Administrador) - Debe funcionar

**⚠️ IMPORTANTE:** Este endpoint espera un archivo real usando `multipart/form-data`

En Postman:
1. Cambia el método a `POST`
2. Selecciona la pestaña `Body`
3. Selecciona `form-data`
4. Agrega los siguientes campos:
   - `archivo` (type: File) - Selecciona un archivo desde tu computadora
   - `id_solicitud` (type: Text) - Valor: `1`
   - `id_tipo_archivo` (type: Text) - Valor: `1`
   - `descripcion` (type: Text) - Valor: `Archivo de prueba para validaciones`

```http
POST {{base_url}}/gestion-archivos/upload
Authorization: Bearer {{token_admin}}
Content-Type: multipart/form-data

Body (form-data):
- archivo: [Seleccionar archivo desde tu computadora]
- id_solicitud: 1
- id_tipo_archivo: 1
- descripcion: Archivo de prueba para validaciones
```

**Respuesta Esperada (201):**
```json
{
  "success": true,
  "message": "Archivo subido exitosamente"
}
```

---

### ✅ Test 2: Subir Archivo (Cliente) - Debe funcionar (con permiso)

**⚠️ NOTA:** Usa `form-data` en Postman, no JSON

En Postman:
1. Selecciona `form-data` en Body
2. Agrega:
   - `archivo` (File)
   - `id_solicitud` (Text): `1`
   - `id_tipo_archivo` (Text): `1`
   - `descripcion` (Text): `Mi archivo de prueba`

```http
POST {{base_url}}/gestion-archivos/upload
Authorization: Bearer {{token_cliente}}
Content-Type: multipart/form-data
```

**Respuesta Esperada (201):** Si el cliente tiene permiso `gestion_archivos` + `crear`

---

### ❌ Test 3: Cliente sin Permiso - Debe rechazar

**⚠️ NOTA:** Usa `form-data` en Postman

```http
POST {{base_url}}/gestion-archivos/upload
Authorization: Bearer {{token_cliente}}
Content-Type: multipart/form-data

Body (form-data):
- archivo: [Archivo]
- id_solicitud: 1
- id_tipo_archivo: 1
- descripcion: Archivo de prueba
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para realizar esta acción",
  "modulo": "gestion_archivos",
  "accion": "crear"
}
```

---

### ❌ Test 3.1: Sin Archivo - Debe rechazar

```http
POST {{base_url}}/gestion-archivos/upload
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "id_solicitud": 1,
  "id_tipo_archivo": 1,
  "descripcion": "Descripción sin archivo"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "Debe enviar al menos un archivo",
    "code": "VALIDATION_ERROR",
    "details": null,
    "timestamp": "2025-11-14T04:44:06.859Z"
  }
}
```

---

### ❌ Test 3.2: Campos Faltantes - Debe rechazar

En Postman (form-data):
- `archivo`: [Archivo seleccionado]
- (Sin id_solicitud)
- (Sin id_tipo_archivo)
- (Sin descripcion)

```http
POST {{base_url}}/gestion-archivos/upload
Authorization: Bearer {{token_admin}}
Content-Type: multipart/form-data
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El ID de la solicitud es requerido"
}
```

---

### ❌ Test 3.3: Archivo Muy Grande (>10MB) - Debe rechazar

```http
POST {{base_url}}/gestion-archivos/upload
Authorization: Bearer {{token_admin}}
Content-Type: multipart/form-data

Body (form-data):
- archivo: [Archivo mayor a 10MB]
- id_solicitud: 1
- id_tipo_archivo: 1
- descripcion: Archivo grande de prueba
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El archivo [nombre] excede el tamaño máximo permitido de 10MB"
}
```

---

### ❌ Test 3.4: Extensión No Permitida - Debe rechazar

```http
POST {{base_url}}/gestion-archivos/upload
Authorization: Bearer {{token_admin}}
Content-Type: multipart/form-data

Body (form-data):
- archivo: [archivo.exe] (extensión no permitida)
- id_solicitud: 1
- id_tipo_archivo: 1
- descripcion: Archivo con extensión no permitida
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "La extensión .exe no está permitida para el archivo archivo.exe"
}
```

---

### ✅ Test 4: Descargar Archivo (Empleado) - Debe funcionar
```http
GET {{base_url}}/gestion-archivos/1/descargar
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Archivo descargado

---

### ❌ Test 5: Intento de Inyección SQL en ID - Debe rechazar
```http
GET {{base_url}}/gestion-archivos/1; DROP TABLE archivos;--/descargar
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ✅ Test 6: Listar Archivos por Cliente (Administrador) - Debe funcionar
```http
GET {{base_url}}/gestion-archivos/cliente/1
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

## 📊 MÓDULO: SEGUIMIENTO (`gestion_seguimiento`)

### ✅ Test 1: Obtener Historial de Seguimiento (Administrador) - Debe funcionar
```http
GET {{base_url}}/seguimiento/historial/1
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### ❌ Test 2: Cliente Intentando Acceder - Debe rechazar
```http
GET {{base_url}}/seguimiento/historial/1
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de seguimiento",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

---

### ✅ Test 3: Crear Seguimiento (Empleado) - Debe funcionar
```http
POST {{base_url}}/seguimiento/crear
Authorization: Bearer {{token_empleado}}
Content-Type: application/json

{
  "id_orden_servicio": 1,
  "titulo": "Seguimiento de prueba",
  "descripcion": "Descripción del seguimiento",
  "nuevo_estado": "En Proceso",
  "observaciones": "Observaciones del seguimiento"
}
```

**Respuesta Esperada (201):**
```json
{
  "success": true,
  "message": "Seguimiento creado exitosamente"
}
```

---

### ❌ Test 4: Validación de ID - Inyección SQL - Debe rechazar
```http
GET {{base_url}}/seguimiento/1; DROP TABLE seguimientos;--
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ❌ Test 5: Rol Personalizado sin Permiso - Debe rechazar
```http
GET {{base_url}}/seguimiento/historial/1
Authorization: Bearer {{token_rol_personalizado}}
```

**Respuesta Esperada (403):** Si el rol personalizado no tiene permiso `gestion_seguimiento` + `leer`

---

### ✅ Test 6: Actualizar Seguimiento (Administrador) - Debe funcionar
```http
PUT {{base_url}}/seguimiento/1
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "titulo": "Título actualizado",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Seguimiento actualizado exitosamente"
}
```

---

### ❌ Test 7: Eliminar Seguimiento con ID Inválido - Debe rechazar
```http
DELETE {{base_url}}/seguimiento/abc
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

## 🔐 MÓDULO: ROLES (`gestion_roles`)

### ✅ Test 1: Listar Roles (Administrador) - Debe funcionar
```http
GET {{base_url}}/roles
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### ❌ Test 2: Cliente Intentando Acceder - Debe rechazar
```http
GET {{base_url}}/roles
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de roles",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

---

### ✅ Test 3: Crear Rol (Administrador) - Debe funcionar
```http
POST {{base_url}}/roles
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "rol_prueba",
  "descripcion": "Rol de prueba para validaciones"
}
```

**Respuesta Esperada (201):**
```json
{
  "success": true,
  "message": "Rol creado exitosamente"
}
```

---

### ❌ Test 4: Validación de ID - Inyección SQL - Debe rechazar
```http
GET {{base_url}}/roles/1; DROP TABLE roles;--
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ✅ Test 5: Obtener Rol por ID (Empleado con permiso) - Debe funcionar
```http
GET {{base_url}}/roles/1
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Si el empleado tiene permiso `gestion_roles` + `leer`

---

### ❌ Test 6: Actualizar Rol con ID Negativo - Debe rechazar
```http
PUT {{base_url}}/roles/-1
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "rol_actualizado",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ✅ Test 7: Cambiar Estado de Rol (Administrador) - Debe funcionar
```http
PATCH {{base_url}}/roles/1/state
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "estado": false
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Estado del rol actualizado exitosamente"
}
```

---

### ❌ Test 8: Eliminar Rol con ID Cero - Debe rechazar
```http
DELETE {{base_url}}/roles/0
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

## 🔑 MÓDULO: PERMISOS (`gestion_permisos`)

### ✅ Test 1: Listar Permisos (Administrador) - Debe funcionar
```http
GET {{base_url}}/permisos
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### ❌ Test 2: Cliente Intentando Acceder - Debe rechazar
```http
GET {{base_url}}/permisos
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de permisos",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

---

### ✅ Test 3: Crear Permiso (Administrador) - Debe funcionar
```http
POST {{base_url}}/permisos
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "gestion_prueba",
  "descripcion": "Permiso de prueba"
}
```

**Respuesta Esperada (201):**
```json
{
  "success": true,
  "message": "Permiso creado exitosamente"
}
```

---

### ❌ Test 4: Validación de ID - Inyección SQL - Debe rechazar
```http
GET {{base_url}}/permisos/1'; DROP TABLE permisos;--
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ✅ Test 5: Obtener Permiso por ID (Empleado con permiso) - Debe funcionar
```http
GET {{base_url}}/permisos/1
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Si el empleado tiene permiso `gestion_permisos` + `leer`

---

### ❌ Test 6: Actualizar Permiso con ID No Numérico - Debe rechazar
```http
PUT {{base_url}}/permisos/abc123
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "permiso_actualizado",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ❌ Test 7: Eliminar Permiso sin Autenticación - Debe rechazar
```http
DELETE {{base_url}}/permisos/1
```

**Respuesta Esperada (401):**
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

---

## 🎯 MÓDULO: PRIVILEGIOS (`gestion_privilegios`)

### ✅ Test 1: Listar Privilegios (Administrador) - Debe funcionar
```http
GET {{base_url}}/privilegios
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### ❌ Test 2: Cliente Intentando Acceder - Debe rechazar
```http
GET {{base_url}}/privilegios
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso a la gestión de privilegios",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

---

### ✅ Test 3: Crear Privilegio (Administrador) - Debe funcionar
```http
POST {{base_url}}/privilegios
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "privilegio_prueba",
  "descripcion": "Privilegio de prueba"
}
```

**Respuesta Esperada (201):**
```json
{
  "success": true,
  "message": "Privilegio creado exitosamente"
}
```

---

### ❌ Test 4: Validación de ID - Inyección SQL - Debe rechazar
```http
GET {{base_url}}/privilegios/1 OR 1=1--
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ✅ Test 5: Obtener Privilegio por ID (Empleado con permiso) - Debe funcionar
```http
GET {{base_url}}/privilegios/1
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Si el empleado tiene permiso `gestion_privilegios` + `leer`

---

### ❌ Test 6: Actualizar Privilegio con ID Inválido - Debe rechazar
```http
PUT {{base_url}}/privilegios/1.5
Authorization: Bearer {{token_admin}}
Content-Type: application/json

{
  "nombre": "privilegio_actualizado",
  "descripcion": "Descripción actualizada"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

### ❌ Test 7: Eliminar Privilegio con Caracteres Especiales - Debe rechazar
```http
DELETE {{base_url}}/privilegios/1@#$%
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "message": "El id debe ser un número válido mayor a 0"
}
```

---

## 📊 MÓDULO: DASHBOARD (`gestion_dashboard`)

### ✅ Test 1: Obtener Ingresos (Administrador) - Debe funcionar
```http
GET {{base_url}}/dashboard/ingresos?periodo=6meses
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": {...}
}
```

---

### ❌ Test 2: Cliente Intentando Acceder - Debe rechazar
```http
GET {{base_url}}/dashboard/ingresos
Authorization: Bearer {{token_cliente}}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Los clientes no tienen acceso al dashboard",
  "rol": "cliente",
  "detalles": "Este módulo está restringido para administradores y empleados únicamente."
}
```

---

### ✅ Test 3: Obtener Resumen (Empleado con permiso) - Debe funcionar
```http
GET {{base_url}}/dashboard/resumen?periodo=12meses
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Si el empleado tiene permiso `gestion_dashboard` + `leer`

---

### ✅ Test 4: Obtener Servicios (Administrador) - Debe funcionar
```http
GET {{base_url}}/dashboard/servicios?periodo=todo
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": {...}
}
```

---

### ✅ Test 5: Obtener Pendientes (Administrador) - Debe funcionar
```http
GET {{base_url}}/dashboard/pendientes?format=json&dias_minimos=0
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### ✅ Test 6: Obtener Inactivas (Administrador) - Debe funcionar
```http
GET {{base_url}}/dashboard/inactivas?format=json&dias_minimos=30
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": [...]
}
```

---

### ✅ Test 7: Obtener Renovaciones Próximas (Empleado) - Debe funcionar
```http
GET {{base_url}}/dashboard/renovaciones-proximas?format=json&dias_anticipacion=90
Authorization: Bearer {{token_empleado}}
```

**Respuesta Esperada (200):** Si el empleado tiene permiso `gestion_dashboard` + `leer`

---

### ✅ Test 8: Obtener Períodos (Administrador) - Debe funcionar
```http
GET {{base_url}}/dashboard/periodos
Authorization: Bearer {{token_admin}}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "data": {
    "periodos": ["1mes", "3meses", "6meses", "12meses", ...]
  }
}
```

---

### ❌ Test 9: Rol Personalizado sin Permiso - Debe rechazar
```http
GET {{base_url}}/dashboard/ingresos
Authorization: Bearer {{token_rol_personalizado}}
```

**Respuesta Esperada (403):** Si el rol personalizado no tiene permiso `gestion_dashboard` + `leer`

---

### ❌ Test 10: Sin Autenticación - Debe rechazar
```http
GET {{base_url}}/dashboard/resumen
```

**Respuesta Esperada (401):**
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

---

## 🧪 TESTS DE INTEGRACIÓN: Sistema Híbrido

### ✅ Test 1: Administrador con Doble Validación - Debe funcionar
```http
GET {{base_url}}/roles
Authorization: Bearer {{token_admin}}
```

**Comportamiento Esperado:**
1. ✅ `authMiddleware` valida token
2. ✅ `roleMiddleware` valida que sea administrador/empleado
3. ✅ `checkPermiso` valida permiso `gestion_roles` + `leer`
4. ✅ Acceso permitido

---

### ✅ Test 2: Rol Personalizado con Permiso - Debe funcionar
```http
GET {{base_url}}/roles
Authorization: Bearer {{token_rol_personalizado}}
```

**Comportamiento Esperado:**
1. ✅ `authMiddleware` valida token
2. ⏭️ `roleMiddleware` se omite (rol personalizado)
3. ✅ `checkPermiso` valida permiso `gestion_roles` + `leer`
4. ✅ Acceso permitido (si tiene el permiso)

---

### ❌ Test 3: Rol Personalizado sin Permiso - Debe rechazar
```http
GET {{base_url}}/roles
Authorization: Bearer {{token_rol_personalizado}}
```

**Comportamiento Esperado:**
1. ✅ `authMiddleware` valida token
2. ⏭️ `roleMiddleware` se omite (rol personalizado)
3. ❌ `checkPermiso` rechaza (no tiene permiso)
4. ❌ Acceso denegado (403)

---

### ❌ Test 4: Cliente - Rechazo Explícito - Debe rechazar
```http
GET {{base_url}}/seguimiento/historial/1
Authorization: Bearer {{token_cliente}}
```

**Comportamiento Esperado:**
1. ✅ `authMiddleware` valida token
2. ❌ Rechazo inmediato (cliente detectado)
3. ❌ No se ejecuta `roleMiddleware` ni `checkPermiso`
4. ❌ Acceso denegado (403) con mensaje específico

---

## 📝 Notas Importantes

1. **Tokens Requeridos:**
   - Asegúrate de tener tokens válidos para cada rol
   - Los tokens deben estar activos y no expirados

2. **IDs de Prueba:**
   - Reemplaza los IDs de ejemplo (1, 2, etc.) con IDs reales de tu base de datos
   - Para tests de inyección SQL, usa los ejemplos proporcionados

3. **Permisos de Roles Personalizados:**
   - Los roles personalizados deben tener los permisos asignados en la base de datos
   - Verifica en `rol_permisos_privilegios` que el rol tenga los permisos necesarios

4. **Validación de Propiedad (Archivos):**
   - Los clientes solo pueden acceder a sus propios archivos
   - La validación de propiedad se realiza en el controlador

5. **Orden de Middlewares:**
   - `authMiddleware` siempre primero
   - `validateId` antes de `validateAccess` (si aplica)
   - `validateAccess` antes del controlador

---

## ✅ Checklist de Validaciones

### Archivos
- [ ] Sistema granular de permisos (híbrido)
- [ ] Clientes pueden acceder con permiso
- [ ] Validación de IDs (protección SQL injection)

### Seguimiento
- [ ] Sistema granular de permisos (híbrido)
- [ ] Clientes rechazados explícitamente
- [ ] Validación de IDs en todos los parámetros

### Roles
- [ ] Sistema granular de permisos (híbrido)
- [ ] Clientes rechazados explícitamente
- [ ] Validación de IDs en todos los parámetros

### Permisos
- [ ] Sistema granular de permisos (híbrido)
- [ ] Clientes rechazados explícitamente
- [ ] Validación de IDs en todos los parámetros

### Privilegios
- [ ] Sistema granular de permisos (híbrido)
- [ ] Clientes rechazados explícitamente
- [ ] Validación de IDs en todos los parámetros

### Dashboard
- [ ] Sistema granular de permisos (híbrido)
- [ ] Clientes rechazados explícitamente
- [ ] Todos los endpoints requieren permiso `leer`

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026

