# 📋 Guía Completa de Campos Requeridos por Servicio - Ejemplos Postman

## 🔗 Endpoint Base
```
POST {{BASE_URL}}/api/gestion-solicitudes/crear/:servicio
```

**Variables Postman:**
- `BASE_URL`: `http://localhost:3000`
- `token`: Token JWT obtenido del login

**Headers requeridos:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## 📊 Tabla Resumen de Servicios

| # | Servicio | ID* | Campos Requeridos |
|---|----------|-----|-------------------|
| 1 | Búsqueda de Antecedentes | 1 | 10 campos |
| 2 | Registro de Marca (Certificación de marca) | 2 | 19 campos |
| 3 | Renovación de Marca | 3 | 17 campos |
| 4 | Cesión de Marca | 4 | 20 campos |
| 5 | Presentación de Oposición | 5 | 17 campos |
| 6 | Respuesta de Oposición | 6 | 14 campos |
| 7 | Ampliación de Alcance | 7 | 12 campos |

*⚠️ **IMPORTANTE**: Los IDs mostrados son ejemplos. Verifica los IDs reales en tu base de datos usando `GET /api/servicios`

---

## 📌 Servicios Disponibles

### 1. Búsqueda de Antecedentes
**ID Servicio**: `1` (verificar en base de datos)

**Campos Requeridos:**
- `nombres_apellidos`
- `tipo_documento`
- `numero_documento`
- `direccion`
- `telefono`
- `correo`
- `pais`
- `nombre_a_buscar`
- `tipo_producto_servicio`
- `logotipo`

**Ejemplo Postman:**
```json
POST {{BASE_URL}}/api/gestion-solicitudes/crear/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nombres_apellidos": "Juan Pérez García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan.perez@email.com",
  "pais": "Colombia",
  "nombre_a_buscar": "Mi Marca",
  "tipo_producto_servicio": "Productos alimenticios",
  "logotipo": "base64_encoded_image_string_here"
}
```

---

### 2. Registro de Marca (Certificación de marca)
**ID Servicio**: `2` (verificar en base de datos)

**Campos Requeridos:**
- `tipo_solicitante`
- `nombres_apellidos`
- `tipo_documento`
- `numero_documento`
- `direccion`
- `telefono`
- `correo`
- `pais`
- `numero_nit_cedula`
- `nombre_marca`
- `tipo_producto_servicio`
- `certificado_camara_comercio`
- `logotipo`
- `poder_autorizacion`
- `tipo_entidad`
- `razon_social`
- `nit_empresa`
- `representante_legal`
- `direccion_domicilio`

**Ejemplo Postman:**
```json
POST {{BASE_URL}}/api/gestion-solicitudes/crear/2
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "María González López",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Avenida 68 #45-30",
  "telefono": "3109876543",
  "correo": "maria.gonzalez@email.com",
  "pais": "Colombia",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Mi Marca Registrada",
  "tipo_producto_servicio": "Servicios de consultoría",
  "certificado_camara_comercio": "base64_encoded_pdf_string_here",
  "logotipo": "base64_encoded_image_string_here",
  "poder_autorizacion": "base64_encoded_pdf_string_here",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": "9001234567",
  "representante_legal": "Carlos Rodríguez Martínez",
  "direccion_domicilio": "Carrera 7 #32-16, Bogotá"
}
```

---

### 3. Renovación de Marca
**ID Servicio**: `3` (verificar en base de datos)

**Campos Requeridos:**
- `tipo_solicitante`
- `nombres_apellidos`
- `tipo_documento`
- `numero_documento`
- `direccion`
- `telefono`
- `correo`
- `pais`
- `nombre_marca`
- `numero_expediente_marca`
- `poder_autorizacion`
- `tipo_entidad`
- `razon_social`
- `nit_empresa`
- `representante_legal`
- `certificado_renovacion`
- `logotipo`

**Ejemplo Postman:**
```json
POST {{BASE_URL}}/api/gestion-solicitudes/crear/3
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Ana Martínez Díaz",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1122334455",
  "direccion": "Calle 100 #50-20",
  "telefono": "3201112233",
  "correo": "ana.martinez@email.com",
  "pais": "Colombia",
  "nombre_marca": "Marca a Renovar",
  "numero_expediente_marca": "2020-123456",
  "poder_autorizacion": "base64_encoded_pdf_string_here",
  "tipo_entidad": "Sociedad Limitada",
  "razon_social": "Empresa Renovadora Ltda.",
  "nit_empresa": "8009876543",
  "representante_legal": "Luis Fernando Herrera",
  "certificado_renovacion": "base64_encoded_pdf_string_here",
  "logotipo": "base64_encoded_image_string_here"
}
```

---

### 4. Cesión de Marca
**ID Servicio**: `4` (verificar en base de datos)

**Campos Requeridos:**
- `tipo_solicitante`
- `nombres_apellidos`
- `tipo_documento`
- `numero_documento`
- `direccion`
- `telefono`
- `correo`
- `pais`
- `nombre_marca`
- `numero_expediente_marca`
- `documento_cesion`
- `poder_autorizacion`
- `nombre_razon_social_cesionario`
- `nit_cesionario`
- `representante_legal_cesionario`
- `tipo_documento_cesionario`
- `numero_documento_cesionario`
- `correo_cesionario`
- `telefono_cesionario`
- `direccion_cesionario`

**Ejemplo Postman:**
```json
POST {{BASE_URL}}/api/gestion-solicitudes/crear/4
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Pedro Sánchez Ruiz",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "5566778899",
  "direccion": "Carrera 15 #95-40",
  "telefono": "3155566778",
  "correo": "pedro.sanchez@email.com",
  "pais": "Colombia",
  "nombre_marca": "Marca a Ceder",
  "numero_expediente_marca": "2019-789012",
  "documento_cesion": "base64_encoded_pdf_string_here",
  "poder_autorizacion": "base64_encoded_pdf_string_here",
  "nombre_razon_social_cesionario": "Empresa Cesionaria S.A.",
  "nit_cesionario": "7005554443",
  "representante_legal_cesionario": "Diego Andrés Morales",
  "tipo_documento_cesionario": "Cédula de Ciudadanía",
  "numero_documento_cesionario": "9988776655",
  "correo_cesionario": "diego.morales@email.com",
  "telefono_cesionario": "3188997766",
  "direccion_cesionario": "Avenida 19 #120-50, Bogotá"
}
```

---

### 5. Presentación de Oposición
**ID Servicio**: `5` (verificar en base de datos)

**Campos Requeridos:**
- `tipo_solicitante`
- `nombres_apellidos`
- `tipo_documento`
- `numero_documento`
- `direccion`
- `telefono`
- `correo`
- `pais`
- `nit_empresa`
- `nombre_marca`
- `marca_a_oponerse`
- `poder_autorizacion`
- `tipo_entidad`
- `razon_social`
- `representante_legal`
- `argumentos_respuesta`
- `documentos_oposicion`

**Ejemplo Postman:**
```json
POST {{BASE_URL}}/api/gestion-solicitudes/crear/5
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Laura Restrepo Mejía",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "3344556677",
  "direccion": "Calle 72 #10-15",
  "telefono": "3112233445",
  "correo": "laura.restrepo@email.com",
  "pais": "Colombia",
  "nit_empresa": "6003344556",
  "nombre_marca": "Mi Marca Protegida",
  "marca_a_oponerse": "Marca Similar Confusa",
  "poder_autorizacion": "base64_encoded_pdf_string_here",
  "tipo_entidad": "Sociedad Anónima",
  "razon_social": "Empresa Oponente S.A.",
  "representante_legal": "Andrés Felipe Vargas",
  "argumentos_respuesta": "La marca solicitada es similar fonética y visualmente a nuestra marca registrada, lo que puede causar confusión en el público consumidor.",
  "documentos_oposicion": "base64_encoded_pdf_string_here"
}
```

---

### 6. Respuesta de Oposición
**ID Servicio**: `6` (verificar en base de datos)

**Campos Requeridos:**
- `nombres_apellidos`
- `tipo_documento`
- `numero_documento`
- `direccion`
- `telefono`
- `correo`
- `pais`
- `nit_empresa`
- `nombre_marca`
- `numero_expediente_marca`
- `marca_opositora`
- `poder_autorizacion`
- `razon_social`
- `representante_legal`

**Ejemplo Postman:**
```json
POST {{BASE_URL}}/api/gestion-solicitudes/crear/6
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "nombres_apellidos": "Roberto Camacho Torres",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "7788990011",
  "direccion": "Transversal 23 #45-89",
  "telefono": "3123344556",
  "correo": "roberto.camacho@email.com",
  "pais": "Colombia",
  "nit_empresa": "5007788990",
  "nombre_marca": "Mi Marca Original",
  "numero_expediente_marca": "2021-345678",
  "marca_opositora": "Marca que se Opuso",
  "poder_autorizacion": "base64_encoded_pdf_string_here",
  "razon_social": "Empresa Respondiente Ltda.",
  "representante_legal": "Sandra Milena Ramírez"
}
```

---

### 7. Ampliación de Alcance
**ID Servicio**: `7` (verificar en base de datos)

**Campos Requeridos:**
- `documento_nit_titular`
- `direccion`
- `ciudad`
- `pais`
- `correo`
- `telefono`
- `numero_registro_existente`
- `nombre_marca`
- `clase_niza_actual`
- `nuevas_clases_niza`
- `descripcion_nuevos_productos_servicios`
- `soportes`

**Ejemplo Postman:**
```json
POST {{BASE_URL}}/api/gestion-solicitudes/crear/7
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "documento_nit_titular": "9001122334",
  "direccion": "Carrera 11 #93-50",
  "ciudad": "Bogotá",
  "pais": "Colombia",
  "correo": "ampliacion@email.com",
  "telefono": "3134455667",
  "numero_registro_existente": "2020-567890",
  "nombre_marca": "Marca con Alcance Ampliado",
  "clase_niza_actual": "25",
  "nuevas_clases_niza": "28, 35",
  "descripcion_nuevos_productos_servicios": "Ampliación para incluir prendas de vestir (clase 25), juegos y juguetes (clase 28) y servicios de publicidad (clase 35)",
  "soportes": "base64_encoded_pdf_string_here"
}
```

---

## 🔐 Autenticación

Antes de crear solicitudes, debes autenticarte:

### Login
```json
POST {{BASE_URL}}/api/usuarios/login
Content-Type: application/json

{
  "correo": "tu_email@email.com",
  "contrasena": "tu_contraseña"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 31,
    "rol": "cliente"
  }
}
```

**Guardar el token en la variable Postman `{{token}}`**

---

## ⚠️ Notas Importantes

1. **ID de Servicio**: El parámetro `:servicio` en la URL debe ser el **ID numérico** del servicio, no el nombre. Verifica los IDs en tu base de datos consultando la tabla `servicios`.

2. **Campos Base64**: Los campos que requieren archivos (como `logotipo`, `certificado_camara_comercio`, `poder_autorizacion`, etc.) deben enviarse como strings en formato Base64.

3. **Rol del Usuario**: 
   - Si eres **cliente**: El `id_cliente` se toma automáticamente del token JWT
   - Si eres **administrador/empleado**: Debes incluir `id_cliente` en el body

4. **Validación de Campos**: Todos los campos listados son **OBLIGATORIOS**. Si falta alguno, recibirás un error 400 con la lista de campos faltantes.

5. **NIT**: El campo `nit_empresa` debe ser un número entero de 10 dígitos (sin guión ni dígito de verificación). Ejemplo: `9001234567`

6. **Tipo de Documento**: El campo `tipo_documento` acepta valores completos como:
   - `"Cédula de Ciudadanía"` (recomendado)
   - `"Cédula de Extranjería"`
   - `"Pasaporte"`
   - `"NIT"`
   - `"Tarjeta de Identidad"`
   - También puedes usar abreviaciones como `"CC"`, `"CE"`, `"PA"`, etc.

---

## 🧪 Colección Postman

Para facilitar las pruebas, puedes crear una colección Postman con estas variables:

**Variables de Colección:**
- `BASE_URL`: `http://localhost:3000`
- `token`: (se llena automáticamente después del login)

**Pre-request Script para Login (opcional):**
```javascript
pm.sendRequest({
    url: pm.variables.get("BASE_URL") + "/api/usuarios/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            correo: "tu_email@email.com",
            contrasena: "tu_contraseña"
        })
    }
}, function (err, res) {
    if (err) {
        console.log(err);
    } else {
        var jsonData = res.json();
        pm.collectionVariables.set("token", jsonData.token);
    }
});
```

---

## 📝 Verificación de IDs de Servicios

Para verificar los IDs de los servicios, puedes usar:

```json
GET {{BASE_URL}}/api/servicios
Authorization: Bearer {{token}}
```

Esto te devolverá la lista de servicios con sus IDs correspondientes.

