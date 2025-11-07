# 🧪 Ejemplos de Prueba - Certificación de Marca

**Fecha:** Enero 2026  
**Estado:** ✅ Listo para probar  
**Endpoint:** `POST /api/gestion-solicitudes/crear/2`

---

## 🚀 Pasos Previos

### **1. Obtener Token de Autenticación**

**POST** `http://localhost:3000/api/usuarios/login`

```json
{
  "correo": "tu_email@ejemplo.com",
  "password": "tu_password"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "rol": "cliente"
  }
}
```

**⚠️ Copiar el token y usarlo en los siguientes requests**

---

## ✅ Test 1: Persona Natural (Sin certificado_camara_comercio)

### **Request**

**Method:** `POST`  
**URL:** `http://localhost:3000/api/gestion-solicitudes/crear/2`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Gómez Pérez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67, Barrio Centro",
  "telefono": "3001234567",
  "correo": "juan.gomez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "numero_nit_cedula": "1234567890",
  "nombre_marca": "Mi Marca Natural",
  "tipo_producto_servicio": "Venta de ropa",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDQgMCBSCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvY1NldCBbIC9QREYgL1RleHQgXQovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQVQKMiBURgpURiAvRjEgMTIgVGYKNTAgNzUwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovTmFtZSAvRjEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI3NCAwMDAwMCBuIAowMDAwMDAwMzYzIDAwMDAwIG4gCjAwMDAwMDA0MjggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1MTgKJSVFT0Y="
}
```

### **Respuesta Esperada (201 Created):**

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
      "marca": "Mi Marca Natural",
      "tipo_persona": "Natural",
      "estado": true
    }
  }
}
```

### **✅ Verificaciones:**

- [ ] Status code: 201
- [ ] No hay errores de "Data too long"
- [ ] No hay errores de campos faltantes
- [ ] `estado` es "Pendiente de Pago"
- [ ] `tipo_persona` es "Natural"

---

## ✅ Test 2: Persona Jurídica (Con todos los campos)

### **Request**

**Method:** `POST`  
**URL:** `http://localhost:3000/api/gestion-solicitudes/crear/2`  
**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez Martínez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "direccion_domicilio": "Carrera 78 #90-12, Oficina 501",
  "telefono": "3109876543",
  "correo": "carlos.rodriguez@email.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium SAS",
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

### **Respuesta Esperada (201 Created):**

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
      "marca": "Marca Premium SAS",
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

### **✅ Verificaciones:**

- [ ] Status code: 201
- [ ] No hay errores de "Data too long"
- [ ] No hay errores de campos faltantes
- [ ] `estado` es "Pendiente de Pago"
- [ ] `tipo_persona` es "Jurídica"
- [ ] Se creó la empresa correctamente

---

## 🧪 Test 3: Verificar Base de Datos

### **Verificar que los datos se guardaron correctamente:**

```sql
-- Ver la última solicitud creada
SELECT 
    id_orden_servicio,
    tipodepersona,
    nombrecompleto,
    nombredelamarca,
    -- Verificar que poder_autorizacion está en poderparaelregistrodelamarca
    CASE 
        WHEN poderparaelregistrodelamarca IS NOT NULL THEN '✅ OK'
        ELSE '❌ FALTA'
    END as poder_registro,
    -- Verificar que NO hay datos en poderdelrepresentanteautorizado para Natural
    CASE 
        WHEN tipodepersona = 'Natural' AND poderdelrepresentanteautorizado IS NULL THEN '✅ OK (Natural no tiene representante)'
        WHEN tipodepersona = 'Natural' AND poderdelrepresentanteautorizado IS NOT NULL THEN '❌ ERROR (Natural no debería tener representante)'
        WHEN tipodepersona = 'Jurídica' THEN '✅ OK (Jurídica puede tener representante)'
        ELSE '?'
    END as validacion_representante,
    -- Verificar tamaño de archivos
    LENGTH(poderparaelregistrodelamarca) as tamano_poder,
    LENGTH(logotipo) as tamano_logotipo,
    LENGTH(certificado_camara_comercio) as tamano_certificado
FROM ordenes_de_servicios
ORDER BY id_orden_servicio DESC
LIMIT 5;
```

### **Resultado Esperado:**

- ✅ `poderparaelregistrodelamarca` tiene datos (no NULL)
- ✅ Para Natural: `poderdelrepresentanteautorizado` es NULL
- ✅ Para Jurídica: `certificado_camara_comercio` tiene datos
- ✅ Tamaños de archivos son razonables (> 1000 bytes para archivos reales)

---

## 📝 Ejemplo con cURL (Terminal/CMD)

### **Test 1: Persona Natural**

```bash
curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/2" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_solicitante": "Natural",
    "nombres_apellidos": "Juan Gómez Pérez",
    "tipo_documento": "Cédula de Ciudadanía",
    "numero_documento": "1234567890",
    "direccion": "Calle 123 #45-67",
    "telefono": "3001234567",
    "correo": "juan.gomez@email.com",
    "pais": "Colombia",
    "ciudad": "Bogotá",
    "numero_nit_cedula": "1234567890",
    "nombre_marca": "Mi Marca Natural",
    "tipo_producto_servicio": "Venta de ropa",
    "clase_niza": "25",
    "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDQgMCBSCi9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovUHJvY1NldCBbIC9QREYgL1RleHQgXQovRm9udCA8PAovRjEgNiAwIFIKPj4KPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQVQKMiBURgpURiAvRjEgMTIgVGYKNTAgNzUwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovTmFtZSAvRjEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI3NCAwMDAwMCBuIAowMDAwMDAwMzYzIDAwMDAwIG4gCjAwMDAwMDA0MjggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1MTgKJSVFT0Y="
  }'
```

---

## 🔍 Qué Verificar en los Logs

### **Logs del Servidor (Consola):**

Deberías ver algo como:

```
🚀 Iniciando creación de solicitud...
✅ Usuario autenticado: 1 cliente
🔍 ID de servicio: 2
✅ Servicio encontrado: Registro de Marca (Certificación de marca)
📋 Campos requeridos para Registro de Marca (Certificación de marca): [...]
✅ Todos los campos requeridos están presentes
✅ Validación condicional: tipo_solicitante = Natural
✅ Persona Natural - Campos de representante/empresa removidos del ordenData
📝 Creando orden de servicio...
✅ Orden creada: 123
✅ Solicitud creada exitosamente
```

### **Si hay errores, deberías ver:**

```
💥 Error en crearSolicitud: [detalles del error]
💥 Stack: [stack trace]
💥 Request body size: [tamaño]
💥 Error name: [tipo de error]
💥 Error message: [mensaje específico]
```

---

## ✅ Checklist de Prueba

### **Persona Natural:**
- [ ] Request se envía correctamente
- [ ] Status 201 Created
- [ ] No hay error "Data too long"
- [ ] No hay error de campos faltantes
- [ ] Se crea la solicitud en BD
- [ ] `poder_autorizacion` está en `poderparaelregistrodelamarca`
- [ ] NO hay datos en `poderdelrepresentanteautorizado`
- [ ] NO hay datos en `certificado_camara_comercio`

### **Persona Jurídica:**
- [ ] Request se envía correctamente
- [ ] Status 201 Created
- [ ] No hay error "Data too long"
- [ ] No hay error de campos faltantes
- [ ] Se crea la solicitud en BD
- [ ] `poder_autorizacion` está en `poderparaelregistrodelamarca`
- [ ] `certificado_camara_comercio` tiene datos
- [ ] Se crea la empresa correctamente

### **Verificación en BD:**
- [ ] Columnas son tipo TEXT (verificar con SQL)
- [ ] Datos se guardan correctamente
- [ ] No hay errores de "Data too long" en BD

---

## 🚨 Si Hay Errores

### **Error: "Data too long for column"**

**Causa:** Las columnas aún no son TEXT  
**Solución:** Ejecutar el script SQL nuevamente

```sql
-- Verificar tipo de columna
SHOW COLUMNS FROM ordenes_de_servicios WHERE Field = 'poderparaelregistrodelamarca';
```

### **Error: "Campos requeridos faltantes"**

**Causa:** Faltan campos obligatorios  
**Solución:** Revisar que todos los campos requeridos estén en el request

### **Error: 401 Unauthorized**

**Causa:** Token inválido o expirado  
**Solución:** Obtener nuevo token con el endpoint de login

### **Error: 500 Internal Server Error**

**Causa:** Error en el servidor  
**Solución:** Revisar logs del servidor para ver detalles del error

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs del servidor
2. Verificar que los scripts SQL se ejecutaron
3. Verificar que el servidor se reinició
4. Probar con los ejemplos de este documento

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para probar

