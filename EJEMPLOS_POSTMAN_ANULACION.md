# 📮 Ejemplos de Postman: Anulación de Solicitudes

## 🎯 Endpoints de Anulación

---

## ✅ **Ejemplo 1: Anulación Exitosa (Administrador)**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/1
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMINISTRADOR>
```

### **Body:**
```json
{
  "motivo": "El cliente solicitó la cancelación del servicio debido a que ya no requiere el trámite legal en este momento."
}
```

### **Response Esperada (200 OK):**
```json
{
  "success": true,
  "mensaje": "La solicitud 1 ha sido anulada correctamente.",
  "data": {
    "id_orden_servicio": 1,
    "numero_expediente": "EXP-2025-001",
    "estado": "Anulado",
    "fecha_anulacion": "2025-10-27T20:30:00.000Z",
    "motivo": "El cliente solicitó la cancelación del servicio debido a que ya no requiere el trámite legal en este momento.",
    "anulado_por": 1
  }
}
```

### **Efectos:**
- ✅ Estado cambia a "Anulado" en `ordenes_de_servicios`
- ✅ Se crea registro en `detalles_ordenes_servicio`
- ✅ Se crea registro en `seguimientos` con auditoría
- ✅ Email enviado al cliente
- ✅ Email enviado al empleado asignado (si existe)

---

## ❌ **Ejemplo 2: Error - Sin Motivo**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/1
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMINISTRADOR>
```

### **Body:**
```json
{
  "motivo": ""
}
```

### **Response Esperada (400 Bad Request):**
```json
{
  "success": false,
  "mensaje": "El motivo de anulación es obligatorio",
  "detalles": "Debe proporcionar un motivo claro de por qué se anula la solicitud (mínimo 10 caracteres)",
  "timestamp": "2025-10-27T20:30:00.000Z"
}
```

---

## ❌ **Ejemplo 3: Error - Motivo Muy Corto**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/1
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMINISTRADOR>
```

### **Body:**
```json
{
  "motivo": "Cancelar"
}
```

### **Response Esperada (400 Bad Request):**
```json
{
  "success": false,
  "mensaje": "El motivo debe tener al menos 10 caracteres",
  "timestamp": "2025-10-27T20:30:00.000Z"
}
```

---

## ❌ **Ejemplo 4: Error - Solicitud Ya Anulada**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/1
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMINISTRADOR>
```

### **Body:**
```json
{
  "motivo": "Duplicado, el cliente ya tiene otro proceso activo para la misma marca."
}
```

### **Response Esperada (400 Bad Request):**
```json
{
  "success": false,
  "mensaje": "La solicitud ya está anulada",
  "detalles": "No se puede anular una solicitud que ya ha sido anulada previamente",
  "timestamp": "2025-10-27T20:30:00.000Z"
}
```

---

## ❌ **Ejemplo 5: Error - Solicitud Finalizada**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/2
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMINISTRADOR>
```

### **Body:**
```json
{
  "motivo": "El cliente desea cancelar el proceso porque encontró otra opción más económica."
}
```

### **Response Esperada (400 Bad Request):**
```json
{
  "success": false,
  "mensaje": "No se puede anular una solicitud finalizada",
  "detalles": "Las solicitudes finalizadas no pueden ser anuladas",
  "timestamp": "2025-10-27T20:30:00.000Z"
}
```

---

## ❌ **Ejemplo 6: Error - Solicitud No Encontrada**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/999
Content-Type: application/json
Authorization: Bearer <TOKEN_ADMINISTRADOR>
```

### **Body:**
```json
{
  "motivo": "Error en la documentación presentada por el cliente."
}
```

### **Response Esperada (404 Not Found):**
```json
{
  "success": false,
  "mensaje": "Solicitud no encontrada",
  "timestamp": "2025-10-27T20:30:00.000Z"
}
```

---

## ❌ **Ejemplo 7: Error - Cliente Sin Permisos**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/1
Content-Type: application/json
Authorization: Bearer <TOKEN_CLIENTE>
```

### **Body:**
```json
{
  "motivo": "Ya no requiero el servicio."
}
```

### **Response Esperada (403 Forbidden):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para acceder a este recurso",
  "timestamp": "2025-10-27T20:30:00.000Z"
}
```

---

## ✅ **Ejemplo 8: Anulación con Empleado (Verifica Email)**

### **Request:**
```http
PUT http://localhost:3000/api/gestion-solicitudes/anular/3
Content-Type: application/json
Authorization: Bearer <TOKEN_EMPLEADO>
```

### **Body:**
```json
{
  "motivo": "Documentación incompleta. El cliente no proporcionó los documentos de poder requeridos dentro del plazo establecido."
}
```

### **Response Esperada (200 OK):**
```json
{
  "success": true,
  "mensaje": "La solicitud 3 ha sido anulada correctamente.",
  "data": {
    "id_orden_servicio": 3,
    "numero_expediente": "EXP-2025-003",
    "estado": "Anulado",
    "fecha_anulacion": "2025-10-27T20:45:00.000Z",
    "motivo": "Documentación incompleta. El cliente no proporcionó los documentos de poder requeridos dentro del plazo establecido.",
    "anulado_por": 2
  }
}
```

---

## 🧪 **Cómo Probar en Postman**

### **Paso 1: Configurar Variables de Entorno**

Crear un Environment en Postman:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `base_url` | `http://localhost:3000` | URL base del API |
| `admin_token` | `eyJhbGc...` | Token JWT de administrador |
| `employee_token` | `eyJhbGc...` | Token JWT de empleado |
| `client_token` | `eyJhbGc...` | Token JWT de cliente |

### **Paso 2: Crear Collection**

**Collection Name:** "Anulación de Solicitudes"

**Requests:**
1. ✅ Anular Solicitud - Éxito
2. ❌ Anular Sin Motivo
3. ❌ Anular Motivo Corto
4. ❌ Anular Ya Anulada
5. ❌ Anular Finalizada
6. ❌ Anular No Existe
7. ❌ Cliente Sin Permisos
8. ✅ Empleado Anula

### **Paso 3: Configurar Request Base**

```http
PUT {{base_url}}/api/gestion-solicitudes/anular/:id
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Path Variables:**
- `id`: ID de la solicitud a anular

---

## 🔍 **Verificación de Resultados**

### **1. Verificar en Base de Datos:**

```sql
-- Ver solicitudes anuladas
SELECT 
    id_orden_servicio,
    numero_expediente,
    estado,
    fecha_anulacion,
    anulado_por,
    motivo_anulacion
FROM ordenes_de_servicios
WHERE estado = 'Anulado'
ORDER BY fecha_anulacion DESC;
```

### **2. Verificar Historial:**

```sql
-- Ver registro en detalles_ordenes_servicio
SELECT *
FROM detalles_ordenes_servicio
WHERE id_orden_servicio = 1
  AND estado = 'Anulado'
ORDER BY fecha_estado DESC;
```

### **3. Verificar Seguimiento:**

```sql
-- Ver seguimiento con auditoría
SELECT 
    s.id_seguimiento,
    s.id_orden_servicio,
    s.nuevo_estado,
    s.estado_anterior,
    s.observaciones,
    s.fecha_seguimiento,
    u.nombre,
    u.apellido
FROM seguimientos s
LEFT JOIN usuarios u ON s.id_usuario = u.id_usuario
WHERE s.id_orden_servicio = 1
  AND s.nuevo_estado = 'Anulado'
ORDER BY s.fecha_seguimiento DESC;
```

### **4. Verificar Notificaciones:**

```sql
-- Ver notificaciones enviadas
SELECT *
FROM notificaciones
WHERE id_orden_servicio = 1
  AND tipo_notificacion = 'anulacion_solicitud'
ORDER BY fecha_envio DESC;
```

---

## 📧 **Verificar Emails Enviados**

### **Email al Cliente:**
**Asunto:** `❌ Solicitud Anulada - Orden #1`

**Contenido incluye:**
- Orden ID y expediente
- Servicio
- Fecha de anulación
- Motivo completo
- Información de contacto

### **Email al Empleado:**
**Asunto:** `⚠️ Solicitud Anulada - Orden #1`

**Contenido incluye:**
- Orden ID
- Servicio
- Motivo de anulación
- Nota de que ya no debe trabajar en ella

---

## 📊 **Tests Automatizados (Postman)**

### **Test Script para Response Exitosa:**

```javascript
pm.test("Status code es 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Respuesta contiene success: true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Respuesta contiene datos de solicitud", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('id_orden_servicio');
    pm.expect(jsonData.data).to.have.property('estado');
    pm.expect(jsonData.data.estado).to.eql('Anulado');
});

pm.test("Respuesta contiene fecha_anulacion", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('fecha_anulacion');
});

pm.test("Respuesta contiene motivo", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('motivo');
    pm.expect(jsonData.data.motivo.length).to.be.at.least(10);
});
```

### **Test Script para Errores:**

```javascript
pm.test("Status code es 400, 403, o 404", function () {
    pm.expect(pm.response.code).to.be.oneOf([400, 403, 404]);
});

pm.test("Respuesta contiene success: false", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(false);
});

pm.test("Respuesta contiene mensaje de error", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('mensaje');
});
```

---

## ✅ **Checklist de Pruebas**

- [ ] Anulación exitosa como administrador
- [ ] Anulación exitosa como empleado
- [ ] Error al anular sin motivo
- [ ] Error al anular con motivo corto (<10 caracteres)
- [ ] Error al anular solicitud ya anulada
- [ ] Error al anular solicitud finalizada
- [ ] Error al anular solicitud inexistente
- [ ] Error cuando cliente intenta anular (403)
- [ ] Email enviado al cliente
- [ ] Email enviado al empleado
- [ ] Registro creado en `detalles_ordenes_servicio`
- [ ] Registro creado en `seguimientos`
- [ ] Registro creado en `notificaciones`

---

**🎉 ¡Sistema de Anulación Completamente Implementado!**

