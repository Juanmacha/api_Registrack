# 💳 Ejemplo Postman - Procesar Pago con Mock

## 📋 Información General

**Endpoint:** `POST /api/gestion-pagos/process-mock`  
**Autenticación:** Requerida (Bearer Token)  
**Roles permitidos:** `administrador`, `empleado`, `cliente`

---

## 🔐 Paso 0: Registrarse (Crear Cuenta)

### Request: Registro de Usuario
```
POST http://localhost:3000/api/usuarios/registrar
Content-Type: application/json

{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@example.com",
  "contrasena": "MiPassword123!",
  "telefono": "3001234567"
}
```

### Parámetros del Body:

| Campo | Tipo | Requerido | Descripción | Valores Permitidos |
|-------|------|-----------|-------------|-------------------|
| `tipo_documento` | String | ✅ Sí | Tipo de documento | `CC`, `CE`, `TI`, `RC`, `NIT`, `PAS` |
| `documento` | Number/String | ✅ Sí | Número de documento | 6-10 caracteres |
| `nombre` | String | ✅ Sí | Nombre del usuario | 2-50 caracteres |
| `apellido` | String | ✅ Sí | Apellido del usuario | 2-50 caracteres |
| `correo` | String | ✅ Sí | Correo electrónico | Formato email válido |
| `contrasena` | String | ✅ Sí | Contraseña | Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial |
| `telefono` | String | ⚠️ Opcional | Teléfono de contacto | 7-20 caracteres |

### Response Exitosa (201):
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "usuario": {
      "id_usuario": 1,
      "tipo_documento": "CC",
      "documento": "1234567890",
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan.perez@example.com",
      "telefono": "3001234567",
      "id_rol": 1,
      "estado": true,
      "fecha_creacion": "2025-01-13T10:00:00.000Z"
    }
  },
  "meta": {
    "timestamp": "2025-01-13T10:00:00.000Z",
    "nextSteps": [
      "Inicie sesión con sus credenciales",
      "Complete su perfil de cliente si es necesario",
      "Explore los servicios disponibles"
    ]
  }
}
```

### Response de Error (409) - Correo ya existe:
```json
{
  "success": false,
  "error": {
    "message": "El correo electrónico ya está registrado",
    "code": "DUPLICATE_VALUE",
    "details": {
      "field": "correo",
      "value": "juan.perez@example.com"
    },
    "timestamp": "2025-01-13T10:00:00.000Z"
  }
}
```

### Response de Error (409) - Documento ya existe:
```json
{
  "success": false,
  "error": {
    "message": "El documento ya está registrado",
    "code": "DUPLICATE_VALUE",
    "details": {
      "field": "documento",
      "value": "1234567890"
    },
    "timestamp": "2025-01-13T10:00:00.000Z"
  }
}
```

### Ejemplos de Body para Registro:

#### Ejemplo 1: Registro Completo
```json
{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "María",
  "apellido": "González",
  "correo": "maria.gonzalez@example.com",
  "contrasena": "MiPassword123!",
  "telefono": "3009876543"
}
```

#### Ejemplo 2: Registro sin Teléfono (Opcional)
```json
{
  "tipo_documento": "CE",
  "documento": "9876543210",
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "correo": "carlos.rodriguez@example.com",
  "contrasena": "SecurePass456@"
}
```

#### Ejemplo 3: Registro con Cédula de Extranjería
```json
{
  "tipo_documento": "CE",
  "documento": "CE123456",
  "nombre": "Ana",
  "apellido": "Martínez",
  "correo": "ana.martinez@example.com",
  "contrasena": "AnaPass789!",
  "telefono": "+57 300 123 4567"
}
```

**📝 Notas Importantes:**
- El rol se asigna automáticamente como `cliente`
- El usuario queda activo (`estado: true`) por defecto
- La contraseña debe tener al menos 8 caracteres, incluir mayúscula, número y carácter especial
- El correo y documento deben ser únicos en el sistema

---

## 🔐 Paso 1: Obtener Token de Autenticación (Login)

### Request: Login
```
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json

{
  "correo": "juan.perez@example.com",
  "contrasena": "MiPassword123!"
}
```

### Response Exitosa (200):
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan.perez@example.com",
      "telefono": "3001234567",
      "rol": "cliente",
      "estado": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1h"
  },
  "meta": {
    "timestamp": "2025-01-13T10:00:00.000Z",
    "permissions": "Acceso limitado a datos propios"
  }
}
```

### Response de Error (401) - Credenciales Inválidas:
```json
{
  "success": false,
  "error": {
    "message": "Credenciales inválidas",
    "code": "INVALID_CREDENTIALS",
    "details": {
      "attempts": "Verifique sus credenciales e intente nuevamente"
    },
    "timestamp": "2025-01-13T10:00:00.000Z"
  }
}
```

**⚠️ IMPORTANTE:** Copia el `token` del campo `data.token` para usarlo en el siguiente paso.

---

## 📝 Paso 2: Crear Solicitud (Orden de Servicio)

**⚠️ IMPORTANTE:** Necesitas crear una solicitud antes de poder procesar un pago, ya que el pago requiere un `id_orden_servicio`.

### Request: Crear Solicitud - Búsqueda de Antecedentes
```
POST http://localhost:3000/api/gestion-solicitudes/crear/1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "CC",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan.perez@example.com",
  "pais": "Colombia",
  "nombre_a_buscar": "Mi Marca",
  "tipo_producto_servicio": "Productos",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

### Parámetros del Body (Búsqueda de Antecedentes):

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `nombres_apellidos` | String | ✅ Sí | Nombre completo del solicitante |
| `tipo_documento` | String | ✅ Sí | Tipo de documento (CC, CE, TI, etc.) |
| `numero_documento` | String | ✅ Sí | Número de documento |
| `direccion` | String | ✅ Sí | Dirección del solicitante |
| `telefono` | String | ✅ Sí | Teléfono de contacto |
| `correo` | String | ✅ Sí | Correo electrónico |
| `pais` | String | ✅ Sí | País de residencia |
| `nombre_a_buscar` | String | ✅ Sí | Nombre de la marca a buscar |
| `tipo_producto_servicio` | String | ✅ Sí | Tipo: "Productos" o "Servicios" |
| `logotipo` | String | ✅ Sí | Logotipo en base64 (data:image/...) |

### IDs de Servicios Disponibles y Precios:

| ID | Nombre del Servicio | Precio Base (COP) | Precio Formateado |
|----|---------------------|-------------------|-------------------|
| 1 | Búsqueda de Antecedentes | $150,000.00 | $150.000 |
| 2 | Certificación de Marca | $1,848,000.00 | $1.848.000 |
| 3 | Renovación de Marca | $1,352,000.00 | $1.352.000 |
| 4 | Presentación de Oposición | $1,400,000.00 | $1.400.000 |
| 5 | Cesión de Marca | $865,000.00 | $865.000 |
| 6 | Ampliación de Alcance | $750,000.00 | $750.000 |
| 7 | Respuesta a Oposición | $1,200,000.00 | $1.200.000 |

**💡 Nota:** Los precios están en Pesos Colombianos (COP). El `total_estimado` de la solicitud se calcula automáticamente basado en el `precio_base` del servicio.

### Response Exitosa (201):
```json
{
  "success": true,
  "message": "Solicitud creada exitosamente",
  "data": {
    "id_orden_servicio": 1,
    "numero_expediente": "EXP-2025-001",
    "estado": "Pendiente de Pago",
    "total_estimado": 150000.00,
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes",
      "precio_base": 150000.00
    },
    "cliente": {
      "id_cliente": 1,
      "nombre": "Juan",
      "apellido": "Pérez"
    }
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `id_orden_servicio` de la respuesta para usarlo en el siguiente paso.

### Ejemplo Alternativo: Crear Solicitud - Certificación de Marca (Persona Natural)
```
POST http://localhost:3000/api/gestion-solicitudes/crear/2
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "María González",
  "tipo_documento": "CC",
  "numero_documento": "9876543210",
  "direccion": "Carrera 50 #80-90",
  "telefono": "3009876543",
  "correo": "maria.gonzalez@example.com",
  "pais": "Colombia",
  "numero_nit_cedula": "9876543210",
  "nombre_marca": "Mi Marca Premium",
  "tipo_producto_servicio": "Servicios",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCjUgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNzEgMDAwMDAgbiAKMDAwMDAwMDMyOCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgNi9Sb290IDEgMCBSL0luZm8gMyAwIFI+PgpzdGFydHhyZWYKNDI0CiUlRU9GCg=="
}
```

---

## 💰 Paso 3: Procesar Pago con Mock

### Request: Procesar Pago (Monto Automático)
```
POST http://localhost:3000/api/gestion-pagos/process-mock
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "metodo_pago": "Transferencia",
  "id_orden_servicio": 1
}
```

**💡 IMPORTANTE:** El `monto` es **OPCIONAL**. Si no lo envías, el sistema automáticamente usará el `total_estimado` de la orden de servicio (precio del servicio).

### Request Alternativo: Procesar Pago (Monto Manual)
```
POST http://localhost:3000/api/gestion-pagos/process-mock
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "monto": 150000.00,
  "metodo_pago": "Transferencia",
  "id_orden_servicio": 1
}
```

**⚠️ VALIDACIÓN:** Si envías `monto`, debe coincidir exactamente con el `total_estimado` de la orden. Si no coincide, recibirás un error.

### Parámetros del Body:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `monto` | Number | ⚠️ Opcional | Monto del pago. Si no se envía, se usa automáticamente el `total_estimado` de la orden |
| `metodo_pago` | String | ✅ Sí | Método: `Efectivo`, `Transferencia`, `Tarjeta`, `Cheque` |
| `id_orden_servicio` | Number | ✅ Sí | ID de la orden de servicio a pagar |

**💡 Recomendación:** En demo, **NO envíes el campo `monto`** para que el sistema use automáticamente el precio correcto del servicio.

---

## ✅ Response Exitosa (201)

```json
{
  "success": true,
  "message": "Pago procesado exitosamente. Solicitud activada.",
  "data": {
    "pago": {
      "id_pago": 1,
      "monto_pagado": 150000.00,
      "metodo_pago": "Transferencia",
      "estado": "Pagado",
      "transaction_id": "MOCK_1704123456789_abc123xyz",
      "gateway": "mock",
      "comprobante_url": null,
      "numero_comprobante": null,
      "fecha_pago": "2025-01-13T10:30:00.000Z",
      "verified_at": "2025-01-13T10:30:00.000Z"
    },
    "solicitud": {
      "id_orden_servicio": 1,
      "numero_expediente": "EXP-2025-001",
      "fecha_creacion": "2025-01-10T08:00:00.000Z",
      "estado": "En Proceso",
      "total_orden_servicio": 150000.00,
      "pais": "Colombia",
      "ciudad": "Bogotá",
      "codigo_postal": "110111"
    },
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes",
      "descripcion": "Verifica la disponibilidad de tu marca...",
      "precio_base": 150000.00
    },
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "cliente@example.com",
      "telefono": "3001234567",
      "tipo_documento": "CC",
      "documento": "1234567890"
    },
    "empresa": {
      "id_empresa": 1,
      "nombre": "Mi Empresa S.A.S",
      "nit": "900123456",
      "tipo_empresa": "SAS",
      "direccion": "Calle 123 #45-67",
      "telefono": "6012345678",
      "email": "contacto@miempresa.com",
      "ciudad": "Bogotá",
      "pais": "Colombia"
    },
    "precios": {
      "precio_base_servicio": 150000.00,
      "total_orden_servicio": 150000.00,
      "monto_pagado": 150000.00,
      "diferencia": 0.00
    },
    "solicitud_activada": true,
    "usuario_que_pago": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "cliente@example.com",
      "rol": "cliente"
    }
  }
}
```

---

## ❌ Response de Error (400)

### Error: Datos Incompletos
```json
{
  "success": false,
  "error": "Datos incompletos. Requiere: metodo_pago, id_orden_servicio (monto es opcional, se toma del servicio)"
}
```

### Error: Orden No Encontrada
```json
{
  "success": false,
  "error": "Orden de servicio no encontrada"
}
```

### Error: Monto No Coincide
```json
{
  "success": false,
  "error": "El monto enviado (200000) no coincide con el total estimado de la orden (150000). Use el monto correcto o omita el campo 'monto' para usar el precio automático.",
  "total_estimado": 150000,
  "monto_enviado": 200000
}
```

---

## 📝 Ejemplos de Body para Diferentes Casos

### Ejemplo 1: Pago Automático (Recomendado) - Sin monto
```json
{
  "metodo_pago": "Transferencia",
  "id_orden_servicio": 1
}
```
**✅ El sistema usará automáticamente $150.000 (precio de Búsqueda de Antecedentes)**

### Ejemplo 2: Pago Automático - Certificación de Marca
```json
{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": 2
}
```
**✅ El sistema usará automáticamente $1.848.000 (precio de Certificación de Marca)**

### Ejemplo 3: Pago Automático - Renovación de Marca
```json
{
  "metodo_pago": "Efectivo",
  "id_orden_servicio": 3
}
```
**✅ El sistema usará automáticamente $1.352.000 (precio de Renovación de Marca)**

### Ejemplo 4: Pago Manual - Con monto explícito
```json
{
  "monto": 865000.00,
  "metodo_pago": "Cheque",
  "id_orden_servicio": 5
}
```
**⚠️ El monto debe coincidir exactamente con el total_estimado de la orden**

### Ejemplo 5: Pago Automático - Ampliación de Alcance
```json
{
  "metodo_pago": "Transferencia",
  "id_orden_servicio": 6
}
```
**✅ El sistema usará automáticamente $750.000 (precio de Ampliación de Alcance)**

### Ejemplo 6: Pago Automático - Respuesta a Oposición
```json
{
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": 7
}
```
**✅ El sistema usará automáticamente $1.200.000 (precio de Respuesta a Oposición)**

---

## 🔍 Verificar Pago Creado

### Request: Obtener Pago por ID
```
GET http://localhost:3000/api/gestion-pagos/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (con información completa):
```json
{
  "pago": {
    "id_pago": 1,
    "monto_pagado": 150000.00,
    "metodo_pago": "Transferencia",
    "estado": "Pagado",
    "fecha_pago": "2025-01-13T10:30:00.000Z",
    "transaction_id": "MOCK_1704123456789_abc123xyz",
    "gateway": "mock",
    "comprobante_url": null,
    "numero_comprobante": null,
    "verified_at": "2025-01-13T10:30:00.000Z",
    "verification_method": "mock"
  },
  "solicitud": {
    "id_orden_servicio": 1,
    "numero_expediente": "EXP-2025-001",
    "fecha_creacion": "2025-01-10T08:00:00.000Z",
    "estado": "En Proceso",
    "total_orden_servicio": 150000.00,
    "pais": "Colombia",
    "ciudad": "Bogotá",
    "codigo_postal": "110111",
    "nombre_completo": "Juan Pérez",
    "correo": "juan.perez@example.com",
    "telefono": "3001234567"
  },
  "servicio": {
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    "descripcion": "Verifica la disponibilidad de tu marca...",
    "precio_base": 150000.00
  },
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan.perez@example.com",
    "telefono": "3001234567",
    "tipo_documento": "CC",
    "documento": "1234567890"
  },
  "cliente": {
    "id_cliente": 1,
    "marca": null,
    "tipo_persona": "Natural"
  },
  "empresa": null
}
```

---

## 📊 Listar Todos los Pagos

### Request: Listar Pagos
```
GET http://localhost:3000/api/gestion-pagos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (con información completa):
```json
[
  {
    "pago": {
      "id_pago": 1,
      "monto_pagado": 150000.00,
      "metodo_pago": "Transferencia",
      "estado": "Pagado",
      "fecha_pago": "2025-01-13T10:30:00.000Z",
      "transaction_id": "MOCK_1704123456789_abc123xyz",
      "gateway": "mock",
      "comprobante_url": null,
      "numero_comprobante": null,
      "verified_at": "2025-01-13T10:30:00.000Z",
      "verification_method": "mock",
      "created_at": "2025-01-13T10:30:00.000Z",
      "updated_at": "2025-01-13T10:30:00.000Z"
    },
    "solicitud": {
      "id_orden_servicio": 1,
      "numero_expediente": "EXP-2025-001",
      "fecha_creacion": "2025-01-10T08:00:00.000Z",
      "estado": "En Proceso",
      "total_orden_servicio": 150000.00,
      "pais": "Colombia",
      "ciudad": "Bogotá",
      "codigo_postal": "110111",
      "nombre_completo": "Juan Pérez",
      "correo": "juan.perez@example.com",
      "telefono": "3001234567"
    },
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes",
      "descripcion": "Verifica la disponibilidad de tu marca...",
      "precio_base": 150000.00
    },
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan.perez@example.com",
      "telefono": "3001234567",
      "tipo_documento": "CC",
      "documento": "1234567890"
    },
    "cliente": {
      "id_cliente": 1,
      "marca": null,
      "tipo_persona": "Natural"
    },
    "empresa": null
  },
  {
    "pago": {
      "id_pago": 2,
      "monto_pagado": 1848000.00,
      "metodo_pago": "Tarjeta",
      "estado": "Pagado",
      "fecha_pago": "2025-01-13T11:15:00.000Z",
      "transaction_id": "MOCK_1704126900000_def456uvw",
      "gateway": "mock",
      "comprobante_url": null,
      "numero_comprobante": null,
      "verified_at": "2025-01-13T11:15:00.000Z",
      "verification_method": "mock",
      "created_at": "2025-01-13T11:15:00.000Z",
      "updated_at": "2025-01-13T11:15:00.000Z"
    },
    "solicitud": {
      "id_orden_servicio": 2,
      "numero_expediente": "EXP-2025-002",
      "fecha_creacion": "2025-01-11T09:00:00.000Z",
      "estado": "En Proceso",
      "total_orden_servicio": 1848000.00,
      "pais": "Colombia",
      "ciudad": "Medellín",
      "codigo_postal": "050001",
      "nombre_completo": "María González",
      "correo": "maria.gonzalez@example.com",
      "telefono": "3009876543"
    },
    "servicio": {
      "id_servicio": 2,
      "nombre": "Certificación de Marca",
      "descripcion": "Acompañamiento completo...",
      "precio_base": 1848000.00
    },
    "usuario": {
      "id_usuario": 2,
      "nombre": "María",
      "apellido": "González",
      "correo": "maria.gonzalez@example.com",
      "telefono": "3009876543",
      "tipo_documento": "CC",
      "documento": "9876543210"
    },
    "cliente": {
      "id_cliente": 2,
      "marca": null,
      "tipo_persona": "Natural"
    },
    "empresa": {
      "id_empresa": 1,
      "nombre": "Mi Empresa S.A.S",
      "nit": "900123456",
      "tipo_empresa": "SAS"
    }
  }
]
```

---

## 🎯 Notas Importantes

1. **💰 Monto Automático:** El campo `monto` es **OPCIONAL**. Si no lo envías, el sistema automáticamente usa el `total_estimado` de la orden de servicio (precio del servicio). Esto asegura que siempre se pague el precio correcto.

2. **✅ Validación de Monto:** Si envías el campo `monto`, debe coincidir exactamente con el `total_estimado` de la orden. Si no coincide, recibirás un error con ambos valores para que puedas corregirlo.

3. **Mock de Pago:** Este endpoint usa un servicio mock que simula una pasarela de pago. El pago siempre se marca como "Pagado" automáticamente.

4. **Activación de Solicitud:** Si el pago es exitoso, la solicitud asociada se activa automáticamente (cambia de estado "Pendiente de Pago" a "En Proceso").

5. **Fecha de Pago:** La `fecha_pago` se establece automáticamente cuando el estado es "Pagado". Si no se establece, se usa `created_at`.

6. **Transaction ID:** Se genera automáticamente con formato `MOCK_[timestamp]_[random]`.

7. **Verificación:** El pago se verifica automáticamente con `verification_method: 'mock'`.

8. **Comprobante:** El comprobante se genera y envía por email automáticamente (si está configurado).

---

## 🧪 Testing en Postman

### Collection de Postman:

1. **Crear nueva Collection:** "API Registrack - Pagos"

2. **Agregar Variables de Entorno:**
   - `base_url`: `http://localhost:3000`
   - `token`: (se actualiza después del login)
   - `user_email`: (correo del usuario registrado)
   - `user_password`: (contraseña del usuario)

3. **Agregar Requests:**
   - `Registrar Usuario` → Crea nueva cuenta
   - `Login` → Guarda token en variable `token`
   - `Crear Solicitud` → Crea orden de servicio, guarda `id_orden_servicio`
   - `Procesar Pago Mock` → Usa variable `{{token}}` y `{{id_orden_servicio}}`
   - `Obtener Pago` → Usa variable `{{token}}`
   - `Listar Pagos` → Usa variable `{{token}}`

4. **Script de Pre-request (Login):**
   ```javascript
   pm.sendRequest({
       url: pm.variables.get("base_url") + "/api/usuarios/login",
       method: 'POST',
       header: { 'Content-Type': 'application/json' },
       body: {
           mode: 'raw',
           raw: JSON.stringify({
               correo: pm.variables.get("user_email"),
               contrasena: pm.variables.get("user_password")
           })
       }
   }, function (err, res) {
       if (err) {
           console.log(err);
       } else {
           const jsonData = res.json();
           if (jsonData.success && jsonData.data.token) {
               pm.environment.set("token", jsonData.data.token);
           }
       }
   });
   ```

5. **Script de Test (Registro):**
   ```javascript
   // Guardar datos del usuario registrado para usar en login
   if (pm.response.code === 201) {
       const jsonData = pm.response.json();
       if (jsonData.success && jsonData.data.usuario) {
           pm.environment.set("user_email", jsonData.data.usuario.correo);
           pm.environment.set("user_id", jsonData.data.usuario.id_usuario);
       }
   }
   ```

6. **Script de Test (Crear Solicitud):**
   ```javascript
   // Guardar id_orden_servicio para usar en el pago
   if (pm.response.code === 201) {
       const jsonData = pm.response.json();
       if (jsonData.success && jsonData.data.id_orden_servicio) {
           pm.environment.set("id_orden_servicio", jsonData.data.id_orden_servicio);
           console.log("✅ Solicitud creada - ID:", jsonData.data.id_orden_servicio);
       }
   }
   ```

---

## ✅ Checklist de Pruebas

### Registro y Autenticación:
- [ ] Registro exitoso con todos los campos requeridos
- [ ] Registro exitoso sin teléfono (opcional)
- [ ] Error al registrar con correo duplicado
- [ ] Error al registrar con documento duplicado
- [ ] Error al registrar con contraseña débil
- [ ] Login exitoso con credenciales válidas
- [ ] Error al login con credenciales inválidas
- [ ] Token JWT se genera correctamente

### Creación de Solicitudes:
- [ ] Crear solicitud de "Búsqueda de Antecedentes" exitosamente
- [ ] Verificar que se asigna estado "Pendiente de Pago"
- [ ] Verificar que se genera `id_orden_servicio`
- [ ] Verificar que se calcula `total_estimado` correctamente
- [ ] Crear solicitud de "Certificación de Marca" (Persona Natural)
- [ ] Crear solicitud de "Certificación de Marca" (Persona Jurídica)
- [ ] Error al crear solicitud con campos faltantes
- [ ] Error al crear solicitud con servicio inexistente

### Procesamiento de Pagos:
- [ ] Procesar pago **SIN monto** (automático) - Debe usar precio del servicio
- [ ] Procesar pago **CON monto** que coincide con total_estimado
- [ ] Error al procesar pago con monto incorrecto (no coincide)
- [ ] Verificar que `fecha_pago` se establece correctamente
- [ ] Verificar que `estado` es "Pagado"
- [ ] Verificar que `transaction_id` se genera
- [ ] Verificar que la solicitud se activa después del pago
- [ ] Verificar que el monto pagado coincide con total_estimado
- [ ] Obtener pago por ID y verificar datos
- [ ] Listar todos los pagos
- [ ] Probar con diferentes métodos de pago (Efectivo, Transferencia, Tarjeta, Cheque)
- [ ] Probar con diferentes servicios (cada uno tiene precio diferente)
- [ ] Verificar que `fecha_pago` aparece en la respuesta

---

**Fecha de creación:** Enero 2026  
**Última actualización:** Enero 2026

