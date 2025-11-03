# 📝 Ejemplo Postman: Crear Solicitud de Servicio

## 📋 Configuración Base

### Variables de Entorno

```
BASE_URL: http://localhost:3000
TOKEN_CLIENTE: <token_de_cliente>
```

### ⚠️ IMPORTANTE: Campos del Body

Los nombres de los campos en el body **DEBEN** coincidir exactamente con los nombres esperados por el backend. Ver la configuración en `src/controllers/solicitudes.controller.js` líneas 179-303.

Los campos mostrados en los ejemplos están **verificados** contra el código actual.

**📌 Valores Permitidos para `tipo_documento`:** `CC`, `CE`, `TI`, `RC`, `NIT`, `PAS`
- CC = Cédula de Ciudadanía
- CE = Cédula de Extranjería
- TI = Tarjeta de Identidad
- RC = Registro Civil
- NIT = Número de Identificación Tributaria
- PAS = Pasaporte

---

## 🔐 Paso 1: Login de Cliente

**POST** `{{BASE_URL}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "correo": "cliente@example.com",
  "password": "Cliente123!"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 5,
    "nombre": "Juan Carlos",
    "apellido": "Pérez López",
    "correo": "cliente@example.com",
    "id_rol": 3
  }
}
```

**⚠️ Guarda el token en la variable `TOKEN_CLIENTE`**

---

## 📋 Paso 2: Obtener Lista de Servicios Disponibles

**GET** `{{BASE_URL}}/api/servicios`

**Headers:**
```
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Respuesta esperada:**
```json
[
  {
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    "descripcion": "Verifica la disponibilidad de tu marca antes de iniciar el registro."
  },
  {
    "id_servicio": 2,
    "nombre": "Certificación de Marca",
    "descripcion": "Acompañamiento completo en el proceso de certificación de tu marca."
  },
  {
    "id_servicio": 3,
    "nombre": "Renovación de Marca",
    "descripcion": "Renueva tu marca y mantén tu protección legal vigente."
  }
]
```

**⚠️ Guarda el `id_servicio` del servicio que quieras solicitar**

---

## 📝 TEST 1: Crear Solicitud de Búsqueda de Antecedentes (Servicio 1)

**POST** `{{BASE_URL}}/api/gestion-solicitudes/crear/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body:**
```json
{
  "nombres_apellidos": "Juan Carlos Pérez López",
  "tipo_documento": "CC",
  "numero_documento": "12345678",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan@example.com",
  "pais": "Colombia",
  "nombre_a_buscar": "TechSolutions",
  "tipo_producto_servicio": "Productos",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

**Respuesta esperada (201 Created):**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "orden_id": 17,
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes",
      "descripcion": "Verifica la disponibilidad de tu marca antes de iniciar el registro."
    },
    "estado": "Solicitud Recibida",
    "fecha_solicitud": "2025-11-01T15:30:00.000Z",
    "cliente": {
      "id_cliente": 5,
      "marca": "TechSolutions",
      "tipo_persona": "Natural",
      "estado": true
    },
    "empresa": null
  },
  "meta": {
    "timestamp": "2025-11-01T15:30:00.000Z",
    "version": "2.2",
    "nextSteps": [
      "La solicitud está pendiente de revisión",
      "Se notificará por email el estado de la solicitud",
      "Puede consultar el estado en cualquier momento"
    ]
  }
}
```

**⚠️ Guarda el `orden_id` para usar en pruebas posteriores**

---

## 📝 TEST 2: Crear Solicitud de Certificación de Marca (Servicio 2)

**POST** `{{BASE_URL}}/api/gestion-solicitudes/crear/2`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body:**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "María Elena García",
  "tipo_documento": "CC",
  "numero_documento": "87654321",
  "direccion": "Carrera 15 #30-45",
  "telefono": "3007654321",
  "correo": "maria@example.com",
  "pais": "Colombia",
  "numero_nit_cedula": "87654321",
  "nombre_marca": "EcoProducts",
  "tipo_producto_servicio": "Productos",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "EcoProducts SAS",
  "nit_empresa": "9007654321",
  "representante_legal": "María Elena García",
  "direccion_domicilio": "Carrera 15 #30-45"
}
```

**Respuesta esperada (201 Created):**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "orden_id": 18,
    "servicio": {
      "id_servicio": 2,
      "nombre": "Certificación de Marca"
    },
    "estado": "Solicitud Recibida",
    "fecha_solicitud": "2025-11-01T15:35:00.000Z",
    "cliente": {
      "id_cliente": 5,
      "marca": "EcoProducts",
      "tipo_persona": "Jurídica"
    },
    "empresa": {
      "id_empresa": 4,
      "nombre": "EcoProducts SAS",
      "nit": 9007654321
    }
  }
}
```

---

## 📝 TEST 3: Crear Solicitud de Renovación de Marca (Servicio 3)

**POST** `{{BASE_URL}}/api/gestion-solicitudes/crear/3`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body:**
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Carlos Alberto Rodríguez",
  "tipo_documento": "CC",
  "numero_documento": "11223344",
  "direccion": "Avenida 7 #20-30",
  "telefono": "3001122334",
  "correo": "carlos@example.com",
  "pais": "Colombia",
  "nombre_marca": "StyleFashion",
  "numero_expediente_marca": "EXP-0015",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...",
  "tipo_entidad": "",
  "razon_social": "",
  "nit_empresa": "",
  "representante_legal": "",
  "certificado_renovacion": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

**Respuesta esperada (201 Created):**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "orden_id": 19,
    "servicio": {
      "id_servicio": 3,
      "nombre": "Renovación de Marca"
    },
    "estado": "Solicitud Recibida",
    "fecha_solicitud": "2025-11-01T15:40:00.000Z",
    "cliente": {
      "id_cliente": 5,
      "marca": "StyleFashion"
    },
    "empresa": null
  }
}
```

---

## 📝 TEST 4: Crear Otra Solicitud de Búsqueda (Solo Campos Básicos)

**POST** `{{BASE_URL}}/api/gestion-solicitudes/crear/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body:**
```json
{
  "nombres_apellidos": "Ana Sofía Martínez",
  "tipo_documento": "CC",
  "numero_documento": "99887766",
  "direccion": "Calle 50 #10-20",
  "telefono": "3009988776",
  "correo": "ana@example.com",
  "pais": "Colombia",
  "nombre_a_buscar": "SimpleBrand",
  "tipo_producto_servicio": "Productos",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

**Respuesta esperada (201 Created):**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "orden_id": 20,
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes"
    },
    "estado": "Solicitud Recibida",
    "fecha_solicitud": "2025-11-01T15:45:00.000Z",
    "cliente": {
      "id_cliente": 5,
      "marca": "SimpleBrand"
    },
    "empresa": null
  }
}
```

---

## 👀 TEST 5: Ver Mis Solicitudes (Cliente)

**GET** `{{BASE_URL}}/api/gestion-solicitudes/mias`

**Headers:**
```
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Respuesta esperada (200 OK):**
```json
[
  {
    "id_orden_servicio": 17,
    "numero_expediente": "EXP-0017",
    "titular": "Juan Carlos Pérez López",
    "marca": "TechSolutions",
    "tipoSolicitud": "Búsqueda de Antecedentes",
    "encargado": "Sin asignar",
    "estado": "Solicitud Recibida",
    "email": "juan@example.com",
    "telefono": "3001234567",
    "comentarios": [],
    "fechaCreacion": "2025-11-01T15:30:00.000Z",
    "fechaFin": null
  },
  {
    "id_orden_servicio": 18,
    "numero_expediente": "EXP-0018",
    "titular": "María Elena García",
    "marca": "EcoProducts",
    "tipoSolicitud": "Certificación de Marca",
    "encargado": "Sin asignar",
    "estado": "Solicitud Recibida",
    "email": "maria@example.com",
    "telefono": "3007654321",
    "comentarios": [],
    "fechaCreacion": "2025-11-01T15:35:00.000Z",
    "fechaFin": null
  },
  {
    "id_orden_servicio": 19,
    "numero_expediente": "EXP-0019",
    "titular": "Carlos Alberto Rodríguez",
    "marca": "StyleFashion",
    "tipoSolicitud": "Renovación de Marca",
    "encargado": "Sin asignar",
    "estado": "Solicitud Recibida",
    "email": "carlos@example.com",
    "telefono": "3001122334",
    "comentarios": [],
    "fechaCreacion": "2025-11-01T15:40:00.000Z",
    "fechaFin": null
  },
  {
    "id_orden_servicio": 20,
    "numero_expediente": "EXP-0020",
    "titular": "Ana Sofía Martínez",
    "marca": "SimpleBrand",
    "tipoSolicitud": "Búsqueda de Antecedentes",
    "encargado": "Sin asignar",
    "estado": "Solicitud Recibida",
    "email": "ana@example.com",
    "telefono": "3009988776",
    "comentarios": [],
    "fechaCreacion": "2025-11-01T15:45:00.000Z",
    "fechaFin": null
  }
]
```

---

## 📄 TEST 6: Ver Detalle de Una Solicitud

**GET** `{{BASE_URL}}/api/gestion-solicitudes/17`

**Headers:**
```
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Respuesta esperada (200 OK):**
```json
{
  "id_orden_servicio": 17,
  "numero_expediente": "EXP-0017",
  "titular": "Juan Carlos Pérez López",
  "marca": "TechSolutions",
  "tipoSolicitud": "Búsqueda de Antecedentes",
  "encargado": "Sin asignar",
  "estado": "Solicitud Recibida",
  "email": "juan@example.com",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "fechaCreacion": "2025-11-01T15:30:00.000Z",
  "fechaFin": null,
  "comentarios": [],
  "campos_dinamicos": {
    "nombre_a_buscar": "TechSolutions",
    "tipo_producto_servicio": "Productos",
    "logotipo": "..."
  }
}
```

---

## ❌ TEST 7: Intentar Crear Solicitud sin Campos Requeridos

**POST** `{{BASE_URL}}/api/gestion-solicitudes/crear/1`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body (Incompleto):**
```json
{
  "nombre_a_buscar": "TestBrand"
}
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "mensaje": "Campos requeridos faltantes",
  "camposFaltantes": [
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "tipo_producto_servicio",
    "logotipo"
  ],
  "camposRequeridos": [
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nombre_a_buscar",
    "tipo_producto_servicio",
    "logotipo"
  ]
}
```

---

## ❌ TEST 8: Intentar Crear Solicitud sin Autenticación

**POST** `{{BASE_URL}}/api/gestion-solicitudes/crear/1`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "nombre_a_buscar": "UnauthorizedBrand"
}
```

**Respuesta esperada (401 Unauthorized):**
```json
{
  "mensaje": "Token no válido"
}
```

---

## ❌ TEST 9: Intentar Crear Solicitud con Servicio Inexistente

**POST** `{{BASE_URL}}/api/gestion-solicitudes/crear/999999`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{TOKEN_CLIENTE}}
```

**Body:**
```json
{
  "nombre_a_buscar": "InvalidBrand"
}
```

**Respuesta esperada (404 Not Found):**
```json
{
  "mensaje": "Servicio no encontrado"
}
```

---

## 🔍 TEST 10: Verificar Solicitud Creada en Base de Datos

**Ejecutar consulta SQL en MySQL:**

```sql
-- Ver solicitud recién creada
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    os.estado,
    s.nombre as servicio,
    os.nombredelamarca,
    os.clase_niza,
    os.nombrecompleto as titular,
    os.correoelectronico as email,
    os.telefono,
    os.fecha_creacion,
    c.nombre as empresa
FROM ordenes_de_servicios os
LEFT JOIN servicios s ON os.id_servicio = s.id_servicio
LEFT JOIN empresas c ON os.id_empresa = c.id_empresa
WHERE os.id_orden_servicio = 17;
```

---

## 📊 Resumen de Campos de Solicitud

### Campos Requeridos por Servicio

#### Para "Búsqueda de Antecedentes" (Servicio 1)
| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `nombres_apellidos` | string | Nombre completo del solicitante | "Juan Carlos Pérez López" |
| `tipo_documento` | string | Tipo de documento (CC, CE, TI, RC, NIT, PAS) | "CC" |
| `numero_documento` | string | Número de documento | "12345678" |
| `direccion` | string | Dirección | "Calle 123 #45-67" |
| `telefono` | string | Teléfono | "3001234567" |
| `correo` | string | Correo electrónico | "juan@example.com" |
| `pais` | string | País de residencia | "Colombia" |
| `nombre_a_buscar` | string | Nombre de la marca a buscar | "TechSolutions" |
| `tipo_producto_servicio` | string | Tipo de producto/servicio | "Productos" o "Servicios" |
| `logotipo` | string | Logo en base64 | "data:image/png;base64,..." |

#### Para "Certificación de Marca" (Servicio 2)
| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `tipo_solicitante` | string | Tipo de solicitante | "Natural" o "Jurídica" |
| `nombres_apellidos` | string | Nombre completo del solicitante | "Juan Carlos Pérez López" |
| `tipo_documento` | string | Tipo de documento (CC, CE, TI, RC, NIT, PAS) | "CC" |
| `numero_documento` | string | Número de documento | "12345678" |
| `direccion` | string | Dirección | "Calle 123 #45-67" |
| `telefono` | string | Teléfono | "3001234567" |
| `correo` | string | Correo electrónico | "juan@example.com" |
| `pais` | string | País de residencia | "Colombia" |
| `numero_nit_cedula` | string | NIT o cédula | "12345678" |
| `nombre_marca` | string | Nombre de la marca | "TechSolutions" |
| `tipo_producto_servicio` | string | Tipo de producto/servicio | "Productos" o "Servicios" |
| `certificado_camara_comercio` | string | Certificado en base64 | "data:application/pdf;base64,..." |
| `logotipo` | string | Logo en base64 | "data:image/png;base64,..." |
| `poder_autorizacion` | string | Poder de autorización en base64 | "data:application/pdf;base64,..." |
| `tipo_entidad` | string | Tipo de entidad jurídica | "Sociedad por Acciones Simplificada" |
| `razon_social` | string | Razón social | "TechSolutions SAS" |
| `nit_empresa` | string | NIT de la empresa | "9001234567" |
| `representante_legal` | string | Nombre del representante legal | "Juan Carlos Pérez López" |
| `direccion_domicilio` | string | Dirección de domicilio | "Calle 123 #45-67" |

---

## ✅ Validaciones del Sistema

### Al Crear Solicitud

1. ✅ Verifica que el usuario esté autenticado
2. ✅ Verifica que el servicio exista
3. ✅ Verifica que todos los campos requeridos estén presentes
4. ✅ Crea automáticamente o asocia la empresa
5. ✅ Asigna automáticamente el primer estado del proceso
6. ✅ Genera número de expediente único

### Estados Iniciales por Servicio

- **Búsqueda de Antecedentes**: "Solicitud Recibida"
- **Certificación de Marca**: "Solicitud Recibida"
- **Renovación de Marca**: "Solicitud Recibida"
- **Presentación de Oposición**: "Oposición Presentada"
- **Cesión de Marca**: "Solicitud Recibida"
- **Ampliación de Alcance**: "Solicitud Recibida"
- **Respuesta de Oposición**: "Solicitud Recibida"

---

**Última actualización:** 1 de Noviembre de 2025  
**Estado:** Listo para pruebas en Postman

