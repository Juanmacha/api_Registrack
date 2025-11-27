# 📮 Ejemplos Postman - Creación de Citas Actualizada ⭐ **ENERO 2026**

## 📋 Tabla de Contenidos
1. [Crear Cita Directa (nuevo formato con `id_usuario`)](#1-crear-cita-directa)
2. [Aprobar Solicitud de Cita (con validación de rol)](#2-aprobar-solicitud-de-cita)

---

## 🔑 Configuración Inicial

### **Variables de Entorno en Postman:**

Crea estas variables en tu colección de Postman:

```
BASE_URL: http://localhost:3000/api
TOKEN_ADMIN: (se obtiene del login)
TOKEN_CLIENTE: (se obtiene del login)
```

### **1. Obtener Token (Login)**

**Request:**
```http
POST {{BASE_URL}}/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "correo": "admin@registrack.com",
  "contrasena": "Admin123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id_usuario": 1,
      "nombre": "Admin",
      "apellido": "Sistema",
      "correo": "admin@registrack.com",
      "rol": {
        "id_rol": 1,
        "nombre": "administrador"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**📝 Nota:** Copia el `token` y guárdalo en la variable `TOKEN_ADMIN`.

---

## 1. Crear Cita Directa

### ✅ **Ejemplo 1.1: Administrador/Empleado crea cita para un cliente**

**Request:**
```http
POST {{BASE_URL}}/gestion-citas
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Body:**
```json
{
  "fecha": "2026-02-15",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_usuario": 5,
  "id_empleado": 2,
  "observacion": "Primera consulta del cliente"
}
```

**Campos requeridos:**
- ✅ `fecha`: Fecha en formato `YYYY-MM-DD`
- ✅ `hora_inicio`: Hora en formato `HH:MM:SS`
- ✅ `hora_fin`: Hora en formato `HH:MM:SS`
- ✅ `tipo`: Tipo de cita (valores permitidos: `General`, `Busqueda`, `Ampliacion`, `Certificacion`, `Renovacion`, `Cesion`, `Oposicion`, `Respuesta de oposicion`)
- ✅ `modalidad`: Modalidad (valores permitidos: `Presencial`, `Virtual`)
- ✅ `id_usuario`: **ID del usuario con rol "cliente"** ⭐ **NUEVO**
- ✅ `id_empleado`: ID del empleado asignado (PK de la tabla `empleados`)
- ⚪ `observacion`: Observaciones adicionales (opcional)

**Response Exitosa (201):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 123,
      "fecha": "2026-02-15",
      "hora_inicio": "09:00:00",
      "hora_fin": "10:00:00",
      "tipo": "General",
      "modalidad": "Presencial",
      "estado": "Programada",
      "observacion": "Primera consulta del cliente",
      "id_cliente": 5,
      "id_empleado": 2,
      "id_orden_servicio": null
    }
  },
  "meta": {
    "timestamp": "2026-01-24T10:30:00.000Z",
    "nextSteps": [
      "La cita ha sido programada exitosamente",
      "Se enviará una confirmación por correo electrónico",
      "Puede reprogramar o cancelar la cita si es necesario"
    ]
  }
}
```

---

### ✅ **Ejemplo 1.2: Cliente crea cita para sí mismo**

**Request:**
```http
POST {{BASE_URL}}/gestion-citas
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body:**
```json
{
  "fecha": "2026-02-20",
  "hora_inicio": "14:00:00",
  "hora_fin": "15:00:00",
  "tipo": "Renovacion",
  "modalidad": "Virtual",
  "id_empleado": 2,
  "observacion": "Consulta sobre renovación de marca"
}
```

**📝 Nota Importante:**
- El cliente **NO necesita** enviar `id_usuario` porque se usa automáticamente su propio `id_usuario` del token
- Si el cliente intenta enviar `id_usuario` de otro usuario, recibirá error 403

**Response Exitosa (201):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 124,
      "fecha": "2026-02-20",
      "hora_inicio": "14:00:00",
      "hora_fin": "15:00:00",
      "tipo": "Renovacion",
      "modalidad": "Virtual",
      "estado": "Programada",
      "id_cliente": 5,
      "id_empleado": 2,
      "observacion": "Consulta sobre renovación de marca"
    }
  }
}
```

---

### ❌ **Ejemplo 1.3: Error - Usuario no tiene rol "cliente"**

**Request:**
```http
POST {{BASE_URL}}/gestion-citas
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Body:**
```json
{
  "fecha": "2026-02-15",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_usuario": 1,
  "id_empleado": 2
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "El usuario proporcionado no tiene rol 'cliente'",
  "id_usuario": 1,
  "rol_actual": "administrador",
  "nota": "Solo se pueden crear citas para usuarios con rol 'cliente'"
}
```

---

### ❌ **Ejemplo 1.4: Error - Usuario cliente inactivo**

**Request:**
```http
POST {{BASE_URL}}/gestion-citas
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Body:**
```json
{
  "fecha": "2026-02-15",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_usuario": 10,
  "id_empleado": 2
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "El usuario cliente está inactivo",
  "id_usuario": 10
}
```

---

### ❌ **Ejemplo 1.5: Error - Cliente intenta crear cita para otro usuario**

**Request:**
```http
POST {{BASE_URL}}/gestion-citas
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body:**
```json
{
  "fecha": "2026-02-15",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_usuario": 8,
  "id_empleado": 2
}
```

**Response Error (403):**
```json
{
  "success": false,
  "message": "No tienes permiso para crear citas para otros clientes",
  "error": {
    "code": "PERMISSION_DENIED",
    "details": "Los clientes solo pueden crear citas para sí mismos"
  }
}
```

---

## 2. Aprobar Solicitud de Cita

### ✅ **Ejemplo 2.1: Aprobar solicitud de cita exitosamente**

**Primero, crear una solicitud de cita (como cliente):**

**Request:**
```http
POST {{BASE_URL}}/gestion-solicitud-cita
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**📝 Nota:** Esta ruta solo está disponible para usuarios con rol "cliente"

**📝 Nota:** La ruta base es `/api/gestion-solicitud-cita` (no `/api/solicitud-cita`)

**Body:**
```json
{
  "fecha_solicitada": "2026-02-18",
  "hora_solicitada": "11:00:00",
  "tipo": "Certificacion",
  "modalidad": "Presencial",
  "descripcion": "Necesito certificación de marca"
}
```

**Response (201):**
```json
{
  "message": "Solicitud de cita creada exitosamente. Queda pendiente de aprobación.",
  "solicitud": {
    "id": 1,
    "fecha_solicitada": "2026-02-18",
    "hora_solicitada": "11:00:00",
    "tipo": "Certificacion",
    "modalidad": "Presencial",
    "estado": "Pendiente",
    "id_cliente": 5
  }
}
```

**Ahora, aprobar la solicitud (como administrador/empleado):**

**Request:**
```http
PUT {{BASE_URL}}/gestion-solicitud-cita/1/gestionar
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**📝 Nota:** La ruta completa es `/api/gestion-solicitud-cita/:id/gestionar`

**Body:**
```json
{
  "estado": "Aprobada",
  "id_empleado_asignado": 2,
  "hora_fin": "12:00:00",
  "observacion_admin": "Cita aprobada, confirmamos disponibilidad"
}
```

**Campos requeridos:**
- ✅ `estado`: Debe ser `"Aprobada"` o `"Rechazada"`
- ✅ `id_empleado_asignado`: ID del empleado (PK de tabla `empleados`)
- ✅ `hora_fin`: Hora de fin de la cita (formato `HH:MM:SS`)
- ⚪ `observacion_admin`: Observaciones del administrador (opcional)

**Response Exitosa (200):**
```json
{
  "message": "Solicitud aprobada y cita creada exitosamente.",
  "solicitud": {
    "id": 1,
    "fecha_solicitada": "2026-02-18",
    "hora_solicitada": "11:00:00",
    "tipo": "Certificacion",
    "modalidad": "Presencial",
    "descripcion": "Necesito certificación de marca",
    "estado": "Aprobada",
    "observacion_admin": "Cita aprobada, confirmamos disponibilidad",
    "id_cliente": 5,
    "id_empleado_asignado": 2
  },
  "cita_creada": {
    "id_cita": 125,
    "fecha": "2026-02-18",
    "hora_inicio": "11:00:00",
    "hora_fin": "12:00:00",
    "tipo": "Certificacion",
    "modalidad": "Presencial",
    "estado": "Programada",
    "observacion": "Necesito certificación de marca",
    "id_cliente": 5,
    "id_empleado": 2,
    "id_orden_servicio": null
  }
}
```

**📝 Nota:** La aprobación ahora valida automáticamente que:
- ✅ El `id_usuario` del cliente tenga rol "cliente"
- ✅ El usuario cliente esté activo

---

### ❌ **Ejemplo 2.2: Error - Usuario cliente no tiene rol "cliente"**

**Request:**
```http
PUT {{BASE_URL}}/gestion-solicitud-cita/1/gestionar
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Body:**
```json
{
  "estado": "Aprobada",
  "id_empleado_asignado": 2,
  "hora_fin": "12:00:00"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "El usuario asociado a la solicitud no tiene rol 'cliente'",
  "id_usuario": 1,
  "rol_actual": "administrador",
  "nota": "No se puede crear una cita para un usuario que no sea cliente"
}
```

---

### ❌ **Ejemplo 2.3: Error - Usuario cliente inactivo**

**Request:**
```http
PUT {{BASE_URL}}/gestion-solicitud-cita/2/gestionar
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Body:**
```json
{
  "estado": "Aprobada",
  "id_empleado_asignado": 2,
  "hora_fin": "12:00:00"
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "El usuario cliente está inactivo",
  "id_usuario": 10,
  "nota": "No se puede crear una cita para un usuario inactivo"
}
```

---

### ❌ **Ejemplo 2.4: Error - Solicitud ya procesada**

**Request:**
```http
PUT {{BASE_URL}}/gestion-solicitud-cita/1/gestionar
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Body:**
```json
{
  "estado": "Aprobada",
  "id_empleado_asignado": 2,
  "hora_fin": "12:00:00"
}
```

**Response Error (400):**
```json
{
  "message": "La solicitud ya ha sido aprobada."
}
```

---

## 📋 Resumen de Validaciones

### **Crear Cita Directa:**
✅ Validación de rol "cliente"  
✅ Validación de usuario activo  
✅ Validación de propiedad (clientes solo para sí mismos)  
✅ Validación de días hábiles (lunes a viernes)  
✅ Validación de horarios (7 AM - 6 PM)  
✅ Validación de duración (1 hora ±5 minutos)  
✅ Validación de solapamiento de horarios  
✅ Validación de citas duplicadas para el cliente  

### **Aprobar Solicitud de Cita:**
✅ Validación de rol "cliente" (nuevo)  
✅ Validación de usuario activo (nuevo)  
✅ Validación de empleado válido  
✅ Validación de solapamiento de horarios  
✅ Validación de estado de solicitud (Pendiente)  

---

## 🔗 Rutas Relacionadas

### **Ver todas las citas:**
```http
GET {{BASE_URL}}/gestion-citas
Authorization: Bearer {{TOKEN_ADMIN}}
```

### **Ver una cita específica:**
```http
GET {{BASE_URL}}/gestion-citas/123
Authorization: Bearer {{TOKEN_ADMIN}}
```

### **Ver solicitudes de cita pendientes:**
```http
GET {{BASE_URL}}/gestion-solicitud-cita
Authorization: Bearer {{TOKEN_ADMIN}}
```

**📝 Nota:** Solo administradores y empleados pueden ver todas las solicitudes. Los clientes usan `/gestion-solicitud-cita/mis-solicitudes`

### **Rechazar solicitud de cita:**
```http
PUT {{BASE_URL}}/gestion-solicitud-cita/1/gestionar
Content-Type: application/json
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Body:**
```json
{
  "estado": "Rechazada",
  "observacion_admin": "No hay disponibilidad en ese horario"
}
```

---

## 📝 Notas Importantes

1. **Cambio Principal:** Ahora se usa `id_usuario` directamente en lugar de `id_cliente` (PK de tabla clientes)
2. **Validación de Rol:** Tanto crear citas directas como aprobar solicitudes valida que el usuario tenga rol "cliente"
3. **Clientes:** Los clientes no necesitan enviar `id_usuario`, se usa automáticamente del token
4. **Emails:** Se envían emails automáticos al cliente y empleado al crear/aprobar citas
5. **Formato de Fechas:** Usar formato `YYYY-MM-DD` para fechas
6. **Formato de Horas:** Usar formato `HH:MM:SS` para horas (ej: `09:00:00`)

---

**Fecha de Actualización:** Enero 2026  
**Versión API:** 2.0

