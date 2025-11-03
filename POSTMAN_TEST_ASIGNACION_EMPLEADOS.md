# 🧪 Ejemplos Postman: Asignación de Empleados

## 📋 Configuración Base

### Variables de Entorno

```
BASE_URL: http://localhost:3000
TOKEN_ADMIN: <token_de_administrador>
TOKEN_CLIENTE: <token_de_cliente>
```

### ⚠️ IMPORTANTE: Valores Permitidos

**Valores permitidos para `tipo` de cita:**
- `General`, `Busqueda`, `Ampliacion`, `Certificacion`, `Renovacion`, `Cesion`, `Oposicion`, `Respuesta de oposicion`

**Valores permitidos para `modalidad`:** `Virtual`, `Presencial`

**Valores permitidos para `estado`:** `Programada`, `Reprogramada`, `Anulada`

---

## 🔐 Paso 1: Login de Administrador

**POST** `{{BASE_URL}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "correo": "admin@registrack.com",
  "password": "Admin123!"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "correo": "admin@registrack.com",
    "id_rol": 1
  }
}
```

**⚠️ Guarda el token en la variable `TOKEN_ADMIN`**

---

## 👤 Paso 2: Obtener Lista de Empleados

**GET** `{{BASE_URL}}/api/gestion-empleados`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Respuesta esperada:**
```json
[
  {
    "id_usuario": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "correo": "admin@registrack.com",
    "tipo_documento": "Cédula de Ciudadanía",
    "documento": 12345678,
    "rol": "administrador",
    "id_rol": 1,
    "estado_usuario": true,
    "id_empleado": 1,
    "estado_empleado": true,
    "es_empleado_registrado": true
  },
  {
    "id_usuario": 12,
    "nombre": "María",
    "apellido": "García López",
    "correo": "maria.garcia@example.com",
    "tipo_documento": "Cédula de Ciudadanía",
    "documento": 87654321,
    "rol": "empleado",
    "id_rol": 2,
    "estado_usuario": true,
    "id_empleado": 2,
    "estado_empleado": true,
    "es_empleado_registrado": true
  }
]
```

**⚠️ Guarda `id_empleado = 2` para usar en las pruebas**

---

## 📋 Paso 3: Obtener Lista de Solicitudes

**GET** `{{BASE_URL}}/api/gestion-solicitudes`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Respuesta esperada:**
```json
[
  {
    "id_orden_servicio": 17,
    "numero_expediente": "EXP-0017",
    "estado": "Pendiente",
    "fecha_creacion": "2025-10-15T10:30:00.000Z",
    "servicio": {
      "nombre": "Registro de Marca",
      "descripcion": "Servicio de registro de marca"
    },
    "empleado_asignado": null
  }
]
```

**⚠️ Guarda `id_orden_servicio = 17` para usar en las pruebas**

---

## ✅ TEST 1: Asignar Empleado a Solicitud (CORREGIDO)

**PUT** `{{BASE_URL}}/api/gestion-solicitudes/asignar-empleado/17`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json
```

**Body:**
```json
{
  "id_empleado": 2
}
```

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "mensaje": "Empleado asignado exitosamente",
  "solicitud": {
    "id_orden_servicio": 17,
    "numero_expediente": "EXP-0017",
    "estado": "Pendiente",
    "empleado_asignado": {
      "id_usuario": 12,
      "nombre": "María",
      "apellido": "García López",
      "correo": "maria.garcia@example.com"
    }
  }
}
```

**✅ Verificación:** El campo `empleado_asignado.id_usuario` debe ser `12` (el id_usuario del empleado 2)

---

## ❌ TEST 2: Intentar Asignar Empleado Inválido (Validación)

**PUT** `{{BASE_URL}}/api/gestion-solicitudes/asignar-empleado/17`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json
```

**Body:**
```json
{
  "id_empleado": 999999
}
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "success": false,
  "mensaje": "Empleado no encontrado o inactivo"
}
```

**✅ Verificación:** El sistema valida que el empleado exista

---

## 📅 TEST 3: Agendar Cita desde Solicitud (CORREGIDO)

**POST** `{{BASE_URL}}/api/gestion-citas/desde-solicitud/17`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2025-11-15",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "modalidad": "Presencial",
  "id_empleado": 2,
  "observacion": "Cita de seguimiento"
}
```

**Respuesta esperada (201 Created):**
```json
{
  "success": true,
  "message": "Cita creada y seguimiento registrado exitosamente",
  "data": {
    "cita": {
      "id_cita": 123,
      "fecha": "2025-11-15",
      "hora_inicio": "10:00:00",
      "hora_fin": "11:00:00",
      "tipo": "General",
      "modalidad": "Presencial",
      "estado": "Programada",
      "observacion": "Cita de seguimiento",
      "id_cliente": 5,
      "id_empleado": 12,
      "id_orden_servicio": 17
    }
  }
}
```

**✅ Verificación:** El campo `cita.id_empleado` debe ser `12` (el id_usuario del empleado 2)

---

## ❌ TEST 4: Intentar Agendar Cita con Empleado Inválido (Validación)

**POST** `{{BASE_URL}}/api/gestion-citas/desde-solicitud/17`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2025-11-16",
  "hora_inicio": "14:00:00",
  "hora_fin": "15:00:00",
  "modalidad": "Virtual",
  "id_empleado": 999999,
  "observacion": "Test con empleado inválido"
}
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "success": false,
  "message": "El empleado no es válido o está inactivo"
}
```

**✅ Verificación:** El sistema valida que el empleado exista antes de crear la cita

---

## 📅 TEST 5: Agendar Cita Directa (CORREGIDO)

**POST** `{{BASE_URL}}/api/gestion-citas`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2025-11-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Virtual",
  "id_cliente": 5,
  "id_empleado": 2,
  "observacion": "Cita directa de prueba"
}
```

**Respuesta esperada (201 Created):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 124,
      "fecha": "2025-11-20",
      "hora_inicio": "09:00:00",
      "hora_fin": "10:00:00",
      "tipo": "General",
      "modalidad": "Virtual",
      "estado": "Programada",
      "observacion": "Cita directa de prueba",
      "id_cliente": 5,
      "id_empleado": 12
    }
  }
}
```

**✅ Verificación:** El campo `cita.id_empleado` debe ser `12` (el id_usuario del empleado 2)

---

## 📋 TEST 6: Verificar Asignación en Base de Datos

**Ejecutar consulta SQL en MySQL:**

```sql
-- Verificar solicitudes con empleados asignados
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    os.id_empleado_asignado,
    u.nombre,
    u.apellido,
    u.correo,
    e.id_empleado
FROM ordenes_de_servicios os
LEFT JOIN usuarios u ON os.id_empleado_asignado = u.id_usuario
LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
WHERE os.id_orden_servicio = 17;

-- Verificar citas con empleados asignados
SELECT 
    c.id_cita,
    c.fecha,
    c.hora_inicio,
    c.id_empleado,
    u.nombre,
    u.apellido,
    e.id_empleado
FROM citas c
LEFT JOIN usuarios u ON c.id_empleado = u.id_usuario
LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
WHERE c.id_empleado IS NOT NULL
ORDER BY c.id_cita DESC
LIMIT 10;
```

**✅ Verificación:** Los campos `id_empleado_asignado` y `id_empleado` deben apuntar al `id_usuario` del empleado, NO al `id_empleado`

---

## 🔍 TEST 7: Solicitud de Cita con Empleado (CORREGIDO)

**Primero: Crear solicitud de cita (Cliente)**

**POST** `{{BASE_URL}}/api/gestion-solicitud-cita`

**Headers:**
```
Authorization: Bearer {{TOKEN_CLIENTE}}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha_solicitada": "2025-11-25",
  "hora_solicitada": "15:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "descripcion": "Consulta general"
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Solicitud de cita creada exitosamente",
  "solicitud": {
    "id": 10,
    "fecha_solicitada": "2025-11-25",
    "hora_solicitada": "15:00:00",
    "tipo": "General",
    "modalidad": "Presencial",
    "estado": "Pendiente",
    "id_cliente": 5,
    "id_empleado_asignado": null
  }
}
```

**⚠️ Guarda `solicitud.id = 10`**

---

**Luego: Aprobar solicitud y asignar empleado (Admin)**

**PUT** `{{BASE_URL}}/api/gestion-solicitud-cita/10/gestionar`

**Headers:**
```
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json
```

**Body:**
```json
{
  "estado": "Aprobada",
  "observacion_admin": "Cita aprobada para seguimiento",
  "id_empleado_asignado": 2,
  "hora_fin": "16:00:00"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "message": "Solicitud aprobada y cita creada exitosamente",
  "solicitud": {
    "id": 10,
    "estado": "Aprobada",
    "id_empleado_asignado": 12
  },
  "cita_creada": {
    "id_cita": 125,
    "fecha": "2025-11-25",
    "hora_inicio": "15:00:00",
    "hora_fin": "16:00:00",
    "tipo": "General",
    "modalidad": "Presencial",
    "estado": "Programada",
    "id_cliente": 5,
    "id_empleado": 12
  }
}
```

**✅ Verificación:** Los campos `solicitud.id_empleado_asignado` y `cita_creada.id_empleado` deben ser `12` (el id_usuario del empleado 2)

---

## 📊 Resumen de Validaciones

### ✅ Casos Exitosos

1. **Asignar empleado válido** → Se guarda `id_usuario` correctamente
2. **Crear cita con empleado válido** → Se guarda `id_usuario` correctamente
3. **Aprobar solicitud con empleado válido** → Se guarda `id_usuario` correctamente

### ❌ Casos de Error

1. **Asignar empleado inexistente** → Error 400 "Empleado no encontrado o inactivo"
2. **Crear cita con empleado inexistente** → Error 400 "El empleado no es válido o está inactivo"
3. **Aprobar solicitud con empleado inexistente** → Error 400 "El empleado asignado no es válido o está inactivo"

---

## 🔍 Verificación Final en Base de Datos

**Consulta completa para verificar todas las asignaciones:**

```sql
-- Verificar TODAS las asignaciones y confirmar que usan id_usuario
SELECT 
    'ordenes_de_servicios' as tabla,
    os.id_orden_servicio as id_registro,
    os.id_empleado_asignado as id_guardado,
    e.id_empleado as id_empleado_correcto,
    u.nombre,
    u.apellido,
    CASE 
        WHEN os.id_empleado_asignado = e.id_usuario THEN '✅ Correcto'
        ELSE '❌ Incorrecto'
    END as estado
FROM ordenes_de_servicios os
LEFT JOIN usuarios u ON os.id_empleado_asignado = u.id_usuario
LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
WHERE os.id_empleado_asignado IS NOT NULL

UNION ALL

SELECT 
    'citas' as tabla,
    c.id_cita as id_registro,
    c.id_empleado as id_guardado,
    e.id_empleado as id_empleado_correcto,
    u.nombre,
    u.apellido,
    CASE 
        WHEN c.id_empleado = e.id_usuario THEN '✅ Correcto'
        ELSE '❌ Incorrecto'
    END as estado
FROM citas c
LEFT JOIN usuarios u ON c.id_empleado = u.id_usuario
LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
WHERE c.id_empleado IS NOT NULL

UNION ALL

SELECT 
    'solicitudes_citas' as tabla,
    sc.id as id_registro,
    sc.id_empleado_asignado as id_guardado,
    e.id_empleado as id_empleado_correcto,
    u.nombre,
    u.apellido,
    CASE 
        WHEN sc.id_empleado_asignado = e.id_usuario THEN '✅ Correcto'
        ELSE '❌ Incorrecto'
    END as estado
FROM solicitudes_citas sc
LEFT JOIN usuarios u ON sc.id_empleado_asignado = u.id_usuario
LEFT JOIN empleados e ON e.id_usuario = u.id_usuario
WHERE sc.id_empleado_asignado IS NOT NULL

ORDER BY tabla, id_registro;
```

**Resultado esperado:** Todas las filas deben mostrar `✅ Correcto`

---

**Última actualización:** 1 de Noviembre de 2025  
**Estado:** Listo para pruebas en Postman

