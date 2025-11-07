# 🧪 Ejemplos Postman - Certificación de Marca

**Endpoint:** `POST /api/gestion-solicitudes/crear/2`  
**Versión:** 1.0  
**Fecha:** Enero 2026  
**Estado:** ✅ Correcciones implementadas

---

## 📋 Configuración Inicial

### **1. Variables de Entorno en Postman**

Crear las siguientes variables en Postman:

| Variable | Valor Ejemplo | Descripción |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3000` | URL base de la API |
| `auth_token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Token JWT (obtenido del login) |
| `servicio_id` | `2` | ID del servicio (Certificación de Marca) |

### **2. Obtener Token de Autenticación**

Antes de probar, obtener un token JWT:

**POST** `{{base_url}}/api/usuarios/login`

```json
{
  "correo": "usuario@ejemplo.com",
  "password": "tu_password"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan",
    "rol": "cliente"
  }
}
```

Copiar el `token` y asignarlo a la variable `auth_token` en Postman.

---

## ✅ Caso 1: Persona Natural (Éxito)

### **Request**

**Method:** `POST`  
**URL:** `{{base_url}}/api/gestion-solicitudes/crear/{{servicio_id}}`

**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Gómez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "465788",
  "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
  "telefono": "3001234567",
  "correo": "juan.gomez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "numero_nit_cedula": "23456789",
  "nombre_marca": "DEsports",
  "tipo_producto_servicio": "Venta de ropa",
  "clase_niza": "34",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDQgMCBSCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvY1NldCBbIC9QREYgL1RleHQgXQovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQVQKMiBURgpURiAvRjEgMTIgVGYKNTAgNzUwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovTmFtZSAvRjEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI3NCAwMDAwMCBuIAowMDAwMDAwMzYzIDAwMDAwIG4gCjAwMDAwMDA0MjggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1MTgKJSVFT0Y="
}
```

### **Respuesta Esperada (201 Created)**

```json
{
  "success": true,
  "mensaje": "Solicitud creada. Pendiente de pago para activar.",
  "data": {
    "orden_id": 123,
    "servicio": {
      "id_servicio": 2,
      "nombre": "Registro de Marca (Certificación de marca)"
    },
    "estado": "Pendiente de Pago",
    "monto_a_pagar": 1848000.00,
    "requiere_pago": true,
    "fecha_solicitud": "2026-01-15T10:30:00.000Z",
    "cliente": {
      "id_cliente": 45,
      "marca": "DEsports",
      "tipo_persona": "Natural",
      "estado": true
    },
    "empresa": {
      "id_empresa": 10,
      "nombre": "Empresa del Cliente",
      "nit": 1234567890,
      "tipo_empresa": "SAS"
    }
  },
  "meta": {
    "timestamp": "2026-01-15T10:30:00.000Z",
    "version": "2.4",
    "rol": "cliente",
    "nextSteps": [
      "Complete el pago para activar la solicitud",
      "Una vez pagado, la solicitud será procesada automáticamente",
      "Puede consultar el estado en cualquier momento"
    ]
  }
}
```

### **Tests Automatizados (Postman Tests Tab)**

```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has success true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Response has orden_id", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.orden_id).to.exist;
});

pm.test("Estado is Pendiente de Pago", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.estado).to.eql("Pendiente de Pago");
});

pm.test("No contiene campos de empresa (Natural)", function () {
    var jsonData = pm.response.json();
    // Verificar que no se requiere certificado_camara_comercio
    pm.expect(jsonData.data).to.not.have.property("certificado_camara_comercio");
});
```

---

## ✅ Caso 2: Persona Jurídica (Éxito)

### **Request**

**Method:** `POST`  
**URL:** `{{base_url}}/api/gestion-solicitudes/crear/{{servicio_id}}`

**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez Martínez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "direccion_domicilio": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos.rodriguez@email.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "clase_niza": "42",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDQgMCBSCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvY1NldCBbIC9QREYgL1RleHQgXQovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQVQKMiBURgpURiAvRjEgMTIgVGYKNTAgNzUwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovTmFtZSAvRjEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI3NCAwMDAwMCBuIAowMDAwMDAwMzYzIDAwMDAwIG4gCjAwMDAwMDA0MjggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1MTgKJSVFT0Y=",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDQgMCBSCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvY1NldCBbIC9QREYgL1RleHQgXQovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQVQKMiBURgpURiAvRjEgMTIgVGYKNTAgNzUwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovTmFtZSAvRjEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI3NCAwMDAwMCBuIAowMDAwMDAwMzYzIDAwMDAwIG4gCjAwMDAwMDA0MjggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1MTgKJSVFT0Y=",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez Martínez"
}
```

### **Respuesta Esperada (201 Created)**

```json
{
  "success": true,
  "mensaje": "Solicitud creada. Pendiente de pago para activar.",
  "data": {
    "orden_id": 124,
    "servicio": {
      "id_servicio": 2,
      "nombre": "Registro de Marca (Certificación de marca)"
    },
    "estado": "Pendiente de Pago",
    "monto_a_pagar": 1848000.00,
    "requiere_pago": true,
    "cliente": {
      "id_cliente": 46,
      "marca": "Marca Premium",
      "tipo_persona": "Jurídica"
    },
    "empresa": {
      "id_empresa": 11,
      "nombre": "Mi Empresa S.A.S.",
      "nit": 9001234567,
      "tipo_empresa": "Sociedad por Acciones Simplificada"
    }
  }
}
```

### **Tests Automatizados**

```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has success true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Empresa creada correctamente", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.empresa.nombre).to.eql("Mi Empresa S.A.S.");
    pm.expect(jsonData.data.empresa.nit).to.eql(9001234567);
});
```

---

## ❌ Caso 3: Persona Jurídica Sin Campos Requeridos (Error)

### **Request**

**Method:** `POST`  
**URL:** `{{base_url}}/api/gestion-solicitudes/crear/{{servicio_id}}`

**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos@email.com",
  "pais": "Colombia",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,..."
  // ⚠️ Faltan: certificado_camara_comercio, tipo_entidad, razon_social, nit_empresa, representante_legal, direccion_domicilio
}
```

### **Respuesta Esperada (400 Bad Request)**

```json
{
  "mensaje": "Campos requeridos faltantes para persona jurídica",
  "camposFaltantes": [
    "certificado_camara_comercio",
    "tipo_entidad",
    "razon_social",
    "nit_empresa",
    "representante_legal",
    "direccion_domicilio"
  ],
  "tipo_solicitante": "Jurídica",
  "camposRequeridos": [
    "certificado_camara_comercio",
    "tipo_entidad",
    "razon_social",
    "nit_empresa",
    "representante_legal",
    "direccion_domicilio"
  ]
}
```

### **Tests Automatizados**

```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.mensaje).to.include("Campos requeridos faltantes para persona jurídica");
});

pm.test("Campos faltantes listados", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.camposFaltantes).to.be.an('array');
    pm.expect(jsonData.camposFaltantes.length).to.be.greaterThan(0);
});
```

---

## ❌ Caso 4: NIT Inválido (Error)

### **Request**

**Method:** `POST`  
**URL:** `{{base_url}}/api/gestion-solicitudes/crear/{{servicio_id}}`

**Body (raw JSON):**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "direccion_domicilio": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos@email.com",
  "pais": "Colombia",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "certificado_camara_comercio": "data:application/pdf;base64,...",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 123,  // ⚠️ NIT inválido (debe tener 10 dígitos)
  "representante_legal": "Carlos Rodríguez"
}
```

### **Respuesta Esperada (400 Bad Request)**

```json
{
  "mensaje": "NIT de empresa inválido",
  "error": "NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)",
  "valor_recibido": 123,
  "rango_valido": "1000000000 - 9999999999"
}
```

### **Tests Automatizados**

```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message mentions NIT", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.mensaje).to.include("NIT");
});
```

---

## ❌ Caso 5: Tipo Solicitante Inválido (Error)

### **Request**

**Body (raw JSON):**
```json
{
  "tipo_solicitante": "Invalido",  // ⚠️ Valor inválido
  "nombres_apellidos": "Juan Gómez",
  // ... otros campos ...
}
```

### **Respuesta Esperada (400 Bad Request)**

```json
{
  "mensaje": "tipo_solicitante debe ser 'Natural' o 'Jurídica'",
  "valor_recibido": "Invalido",
  "valores_aceptados": ["Natural", "Jurídica"]
}
```

---

## ❌ Caso 6: Sin Autenticación (Error 401)

### **Request**

**Headers:**
```
Content-Type: application/json
// ⚠️ Sin Authorization header
```

### **Respuesta Esperada (401 Unauthorized)**

```json
{
  "mensaje": "Usuario no autenticado",
  "error": "Se requiere autenticación para crear solicitudes"
}
```

---

## 📊 Colección Completa de Postman

### **Importar Colección**

1. Crear nueva colección en Postman
2. Agregar las siguientes requests:

| Nombre | Method | URL | Descripción |
|--------|--------|-----|-------------|
| 1. Login | POST | `{{base_url}}/api/usuarios/login` | Obtener token |
| 2. Certificación Natural - Éxito | POST | `{{base_url}}/api/gestion-solicitudes/crear/2` | Persona Natural |
| 3. Certificación Jurídica - Éxito | POST | `{{base_url}}/api/gestion-solicitudes/crear/2` | Persona Jurídica |
| 4. Certificación Jurídica - Sin Campos | POST | `{{base_url}}/api/gestion-solicitudes/crear/2` | Error 400 |
| 5. Certificación - NIT Inválido | POST | `{{base_url}}/api/gestion-solicitudes/crear/2` | Error 400 |
| 6. Certificación - Sin Auth | POST | `{{base_url}}/api/gestion-solicitudes/crear/2` | Error 401 |

### **Pre-request Script (Para Requests que Requieren Token)**

Agregar este script en la pestaña "Pre-request Script" de la colección:

```javascript
// Verificar que existe token
if (!pm.environment.get("auth_token")) {
    console.log("⚠️ No hay token. Ejecuta primero el request de Login.");
}
```

### **Tests Globales (Para Todos los Requests)**

Agregar este script en la pestaña "Tests" de la colección:

```javascript
// Test básico de respuesta
pm.test("Response time is less than 5000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test("Response has Content-Type header", function () {
    pm.response.to.have.header("Content-Type");
});

// Si hay error, mostrar detalles
if (pm.response.code >= 400) {
    console.log("Error response:", pm.response.json());
}
```

---

## 🔧 Generar Base64 de Archivos para Testing

### **Opción 1: Usar Postman Pre-request Script**

```javascript
// Pre-request Script para convertir archivo a base64
const fs = require('fs');
const path = require('path');

// Ruta al archivo
const filePath = path.join(__dirname, 'test-image.jpg');
const fileBuffer = fs.readFileSync(filePath);
const base64String = fileBuffer.toString('base64');

// Guardar en variable
pm.environment.set("logotipo_base64", `data:image/jpeg;base64,${base64String}`);
```

### **Opción 2: Usar Herramienta Online**

1. Ir a: https://base64.guru/converter/encode/image
2. Subir imagen o PDF
3. Copiar el resultado base64
4. Agregar el prefijo: `data:image/jpeg;base64,` o `data:application/pdf;base64,`

### **Opción 3: Usar Node.js**

```javascript
const fs = require('fs');

// Leer archivo
const imageBuffer = fs.readFileSync('test-image.jpg');
const base64Image = imageBuffer.toString('base64');

// Agregar prefijo
const dataURI = `data:image/jpeg;base64,${base64Image}`;

console.log(dataURI);
```

---

## 📝 Notas Importantes

1. **Token de Autenticación:** Asegúrate de obtener y actualizar el token antes de probar
2. **Base64:** Los archivos deben estar en formato base64 con el prefijo correcto
3. **Tamaño de Payload:** El límite ahora es 10MB, suficiente para archivos grandes
4. **Variables:** Usa variables de entorno en Postman para facilitar el testing
5. **Tests:** Los tests automatizados ayudan a verificar que las correcciones funcionan

---

## 🚀 Quick Start

1. **Importar colección** en Postman
2. **Configurar variables** de entorno (`base_url`, `auth_token`)
3. **Ejecutar Login** para obtener token
4. **Probar casos de éxito** (Persona Natural y Jurídica)
5. **Probar casos de error** para verificar validaciones

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para usar

