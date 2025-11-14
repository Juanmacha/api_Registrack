# 🧪 Ejemplos Postman: Validaciones de Citas

## 🎯 Endpoints

1. **Crear Cita:** `POST /api/gestion-citas`
2. **Reprogramar Cita:** `PUT /api/gestion-citas/:id/reprogramar`
3. **Anular Cita:** `PUT /api/gestion-citas/:id/anular`
4. **Finalizar Cita:** `PUT /api/gestion-citas/:id/finalizar`
5. **Listar Citas:** `GET /api/gestion-citas`
6. **Crear Cita desde Solicitud:** `POST /api/gestion-citas/desde-solicitud/:idOrdenServicio`

---

## 📋 Validaciones a Probar

### **1. ✅ Validar Días Hábiles (Lunes a Viernes)**
### **2. ✅ Validar Duración (1 hora ±5 minutos)**
### **3. ✅ Validar Rango de Fechas (Máximo 1 año)**
### **4. ✅ XSS Prevention (Campo observacion)**
### **5. ✅ Validaciones Existentes (Horarios, Solapamiento, etc.)**

---

## 🔴 Validación 1: Días Hábiles (Lunes a Viernes)

### **Caso 1.1: Crear Cita en Sábado (❌ Debe Fallar)**

**Request:**
```
POST http://localhost:3000/api/gestion-citas
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "fecha": "2026-01-18",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "Las citas solo se pueden agendar de lunes a viernes. La fecha seleccionada es sábado.",
  "code": "INVALID_WEEKDAY",
  "dia": "sábado"
}
```

---

### **Caso 1.2: Crear Cita en Domingo (❌ Debe Fallar)**

**Body:**
```json
{
  "fecha": "2026-01-19",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "Las citas solo se pueden agendar de lunes a viernes. La fecha seleccionada es domingo.",
  "code": "INVALID_WEEKDAY",
  "dia": "domingo"
}
```

---

### **Caso 1.3: Crear Cita en Lunes (✅ Debe Funcionar)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (201):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 123,
      "fecha": "2026-01-20",
      "hora_inicio": "09:00:00",
      "hora_fin": "10:00:00",
      ...
    }
  }
}
```

---

## 🔴 Validación 2: Duración de Citas (1 hora ±5 minutos)

### **Caso 2.1: Duración de 90 minutos (❌ Debe Fallar)**

**Request:**
```
POST http://localhost:3000/api/gestion-citas
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:30:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "Las citas deben durar aproximadamente 1 hora (60 minutos) con tolerancia de ±5 minutos (55-65 minutos). La duración proporcionada es de 90 minutos.",
  "code": "INVALID_DURATION",
  "duracion_minutos": 90,
  "duracion_esperada": "55-65 minutos",
  "ejemplos_validos": [
    "09:00:00 - 10:00:00 (60 minutos)",
    "09:00:00 - 10:05:00 (65 minutos)",
    "09:05:00 - 10:00:00 (55 minutos)"
  ]
}
```

---

### **Caso 2.2: Duración de 30 minutos (❌ Debe Fallar)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "09:30:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "Las citas deben durar aproximadamente 1 hora (60 minutos) con tolerancia de ±5 minutos (55-65 minutos). La duración proporcionada es de 30 minutos.",
  "code": "INVALID_DURATION",
  "duracion_minutos": 30,
  "duracion_esperada": "55-65 minutos",
  "ejemplos_validos": [
    "09:00:00 - 10:00:00 (60 minutos)",
    "09:00:00 - 10:05:00 (65 minutos)",
    "09:05:00 - 10:00:00 (55 minutos)"
  ]
}
```

---

### **Caso 2.3: Duración de 60 minutos exactos (✅ Debe Funcionar)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (201):** ✅ Cita creada exitosamente

---

### **Caso 2.4: Duración de 65 minutos (✅ Debe Funcionar - Dentro de Tolerancia)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:05:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (201):** ✅ Cita creada exitosamente

---

### **Caso 2.5: Duración de 55 minutos (✅ Debe Funcionar - Dentro de Tolerancia)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:05:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (201):** ✅ Cita creada exitosamente

---

### **Caso 2.6: Duración de 66 minutos (❌ Debe Fallar - Fuera de Tolerancia)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:06:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):** ❌ Error de duración

---

## 🔴 Validación 3: Rango de Fechas (Máximo 1 año)

### **Caso 3.1: Fecha más de 1 año en el futuro (❌ Debe Fallar)**

**Request:**
```
POST http://localhost:3000/api/gestion-citas
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "fecha": "2028-01-15",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "La fecha no puede ser más de 1 año en el futuro. La fecha máxima permitida es 2027-01-13.",
  "code": "DATE_TOO_FAR",
  "fecha_maxima": "2027-01-13"
}
```

---

### **Caso 3.2: Fecha dentro del rango válido (✅ Debe Funcionar)**

**Body:**
```json
{
  "fecha": "2026-12-31",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (201):** ✅ Cita creada exitosamente

---

## 🔴 Validación 4: XSS Prevention (Campo observacion)

### **Caso 4.1: Observación con Script Malicioso (✅ Se Sanitiza)**

**Request:**
```
POST http://localhost:3000/api/gestion-citas
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1,
  "observacion": "<script>alert('XSS Attack')</script>Hola mundo"
}
```

**Response Esperado (201):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 123,
      "observacion": "&lt;script&gt;alert('XSS Attack')&lt;/script&gt;Hola mundo",
      ...
    }
  }
}
```

**Nota:** El script se sanitiza automáticamente y se guarda de forma segura.

---

### **Caso 4.2: Observación Normal (✅ Debe Funcionar)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1,
  "observacion": "Cliente requiere atención especial"
}
```

**Response Esperado (201):** ✅ Cita creada exitosamente

---

### **Caso 4.3: Anular Cita con Observación con XSS**

**Request:**
```
PUT http://localhost:3000/api/gestion-citas/123/anular
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "observacion": "<img src=x onerror=alert('XSS')>Cancelación solicitada"
}
```

**Resultado:** La observación se sanitiza automáticamente antes de guardarse.

---

## 🔴 Validación 5: Validaciones Existentes

### **Caso 5.1: Horario Fuera de Rango (Antes de 7:00 AM) (❌ Debe Fallar)**

**Request:**
```
POST http://localhost:3000/api/gestion-citas
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "06:00:00",
  "hora_fin": "07:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "Las citas solo se pueden agendar entre las 7:00 AM y las 6:00 PM.",
  "code": "INVALID_TIME_RANGE"
}
```

---

### **Caso 5.2: Horario Fuera de Rango (Después de 6:00 PM) (❌ Debe Fallar)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "18:00:00",
  "hora_fin": "19:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):** ❌ Error de horario

---

### **Caso 5.3: Hora de Inicio Mayor que Hora de Fin (❌ Debe Fallar)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "10:00:00",
  "hora_fin": "09:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "La hora de inicio debe ser anterior a la hora de fin.",
  "code": "INVALID_TIME_ORDER"
}
```

---

### **Caso 5.4: Fecha en el Pasado (❌ Debe Fallar)**

**Body:**
```json
{
  "fecha": "2025-01-01",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "No se puede crear una cita en una fecha anterior a hoy.",
  "code": "DATE_IN_PAST"
}
```

---

### **Caso 5.5: Solapamiento de Horarios (❌ Debe Fallar)**

**Paso 1:** Crear primera cita (✅ Debe funcionar)

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1
}
```

**Paso 2:** Intentar crear segunda cita en el mismo horario (❌ Debe fallar)

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:30:00",
  "hora_fin": "10:30:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 2,
  "id_empleado": 1
}
```

**Response Esperado (400):**
```json
{
  "message": "Ya existe una cita agendada en ese horario para el empleado seleccionado."
}
```

---

## 🔄 Validación 6: Reprogramar Cita

### **Caso 6.1: Reprogramar a Sábado (❌ Debe Fallar)**

**Request:**
```
PUT http://localhost:3000/api/gestion-citas/123/reprogramar
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "fecha": "2026-01-18",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00"
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "Las citas solo se pueden agendar de lunes a viernes. La fecha seleccionada es sábado.",
  "code": "INVALID_WEEKDAY",
  "dia": "sábado"
}
```

---

### **Caso 6.2: Reprogramar con Duración Inválida (❌ Debe Fallar)**

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "11:00:00"
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "message": "Las citas deben durar aproximadamente 1 hora (60 minutos) con tolerancia de ±5 minutos (55-65 minutos). La duración proporcionada es de 120 minutos.",
  "code": "INVALID_DURATION",
  "duracion_minutos": 120,
  "duracion_esperada": "55-65 minutos",
  "ejemplos_validos": [
    "09:00:00 - 10:00:00 (60 minutos)",
    "09:00:00 - 10:05:00 (65 minutos)",
    "09:05:00 - 10:00:00 (55 minutos)"
  ]
}
```

---

### **Caso 6.3: Reprogramar Correctamente (✅ Debe Funcionar)**

**Body:**
```json
{
  "fecha": "2026-01-21",
  "hora_inicio": "14:00:00",
  "hora_fin": "15:00:00"
}
```

**Response Esperado (200):** ✅ Cita reprogramada exitosamente

---

## 📋 Checklist de Pruebas

### **Validación de Días Hábiles:**
- [ ] Crear cita en sábado → Error 400
- [ ] Crear cita en domingo → Error 400
- [ ] Crear cita en lunes → Éxito 201
- [ ] Crear cita en viernes → Éxito 201
- [ ] Reprogramar a sábado → Error 400

### **Validación de Duración:**
- [ ] Duración de 30 minutos → Error 400
- [ ] Duración de 90 minutos → Error 400
- [ ] Duración de 60 minutos → Éxito 201
- [ ] Duración de 65 minutos → Éxito 201
- [ ] Duración de 55 minutos → Éxito 201
- [ ] Duración de 66 minutos → Error 400
- [ ] Duración de 54 minutos → Error 400

### **Validación de Rango de Fechas:**
- [ ] Fecha > 1 año en el futuro → Error 400
- [ ] Fecha dentro del rango → Éxito 201
- [ ] Fecha exactamente 1 año → Éxito 201

### **XSS Prevention:**
- [ ] Observación con `<script>` → Se sanitiza
- [ ] Observación con `<img onerror>` → Se sanitiza
- [ ] Observación normal → Funciona correctamente
- [ ] Anular cita con XSS → Se sanitiza

### **Validaciones Existentes:**
- [ ] Horario antes de 7:00 AM → Error 400
- [ ] Horario después de 6:00 PM → Error 400
- [ ] Hora inicio > hora fin → Error 400
- [ ] Fecha en el pasado → Error 400
- [ ] Solapamiento de horarios → Error 400

---

## 🎬 Ejemplo Completo: Cita Válida

**Request:**
```
POST http://localhost:3000/api/gestion-citas
Content-Type: application/json
Authorization: Bearer {tu_token}
```

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1,
  "observacion": "Cliente requiere atención especial"
}
```

**Response Esperado (201):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 123,
      "fecha": "2026-01-20",
      "hora_inicio": "09:00:00",
      "hora_fin": "10:00:00",
      "tipo": "General",
      "modalidad": "Presencial",
      "estado": "Programada",
      "observacion": "Cliente requiere atención especial",
      "id_cliente": 1,
      "id_empleado": 1
    }
  },
  "meta": {
    "timestamp": "2026-01-13T10:00:00.000Z"
  }
}
```

---

## 🔧 Variables de Entorno en Postman

**Crea variables en Postman para facilitar las pruebas:**

```
base_url = http://localhost:3000
# O en Render:
base_url = https://api-registrack-2.onrender.com

token = {tu_token_jwt}
id_cliente = 1
id_empleado = 1
id_cita = 123
```

**Uso en requests:**
```
POST {{base_url}}/api/gestion-citas
Authorization: Bearer {{token}}
```

---

## 📝 Scripts de Postman (Opcional)

### **Script Pre-request para Generar Fechas:**

```javascript
// Pre-request Script
// Generar fecha de lunes (próximo lunes)
const hoy = new Date();
const diasHastaLunes = (1 + 7 - hoy.getDay()) % 7 || 7;
const proximoLunes = new Date(hoy);
proximoLunes.setDate(hoy.getDate() + diasHastaLunes);
const fechaLunes = proximoLunes.toISOString().split('T')[0];

// Generar fecha de sábado (próximo sábado)
const diasHastaSabado = (6 + 7 - hoy.getDay()) % 7 || 7;
const proximoSabado = new Date(hoy);
proximoSabado.setDate(hoy.getDate() + diasHastaSabado);
const fechaSabado = proximoSabado.toISOString().split('T')[0];

pm.environment.set("fecha_lunes", fechaLunes);
pm.environment.set("fecha_sabado", fechaSabado);
```

**Uso en Body:**
```json
{
  "fecha": "{{fecha_lunes}}",
  ...
}
```

---

### **Script Test para Validar Respuestas:**

```javascript
// Test Script
pm.test("Status code is 400 for invalid weekday", function () {
    pm.response.to.have.status(400);
});

pm.test("Response has error code INVALID_WEEKDAY", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.code).to.eql('INVALID_WEEKDAY');
});

pm.test("Response message mentions weekday", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include('lunes a viernes');
});
```

---

## 🎯 Casos de Prueba por Validación

### **1. Días Hábiles:**

| Fecha | Día | Resultado Esperado |
|-------|-----|-------------------|
| 2026-01-18 | Sábado | ❌ Error 400 |
| 2026-01-19 | Domingo | ❌ Error 400 |
| 2026-01-20 | Lunes | ✅ Éxito 201 |
| 2026-01-21 | Martes | ✅ Éxito 201 |
| 2026-01-22 | Miércoles | ✅ Éxito 201 |
| 2026-01-23 | Jueves | ✅ Éxito 201 |
| 2026-01-24 | Viernes | ✅ Éxito 201 |

---

### **2. Duración:**

| Hora Inicio | Hora Fin | Duración | Resultado |
|-------------|----------|----------|-----------|
| 09:00:00 | 09:30:00 | 30 min | ❌ Error 400 |
| 09:00:00 | 09:54:00 | 54 min | ❌ Error 400 |
| 09:05:00 | 10:00:00 | 55 min | ✅ Éxito 201 |
| 09:00:00 | 10:00:00 | 60 min | ✅ Éxito 201 |
| 09:00:00 | 10:05:00 | 65 min | ✅ Éxito 201 |
| 09:00:00 | 10:06:00 | 66 min | ❌ Error 400 |
| 09:00:00 | 10:30:00 | 90 min | ❌ Error 400 |
| 09:00:00 | 11:00:00 | 120 min | ❌ Error 400 |

---

### **3. Rango de Fechas:**

| Fecha | Diferencia | Resultado |
|-------|------------|-----------|
| 2025-01-01 | Pasado | ❌ Error 400 (DATE_IN_PAST) |
| 2026-01-13 | Hoy | ✅ Éxito 201 |
| 2026-12-31 | < 1 año | ✅ Éxito 201 |
| 2027-01-13 | Exactamente 1 año | ✅ Éxito 201 |
| 2027-01-14 | > 1 año | ❌ Error 400 (DATE_TOO_FAR) |
| 2028-01-15 | > 1 año | ❌ Error 400 (DATE_TOO_FAR) |

---

## 💡 Tips para Probar

1. **Usa variables de entorno en Postman:**
   - `{{base_url}}` para la URL base
   - `{{token}}` para el token JWT
   - `{{fecha_lunes}}` para fechas válidas

2. **Guarda los IDs de citas creadas:**
   - Úsalos para probar `reprogramarCita` y `anularCita`

3. **Prueba combinaciones:**
   - Fecha válida + duración inválida
   - Día hábil + horario fuera de rango
   - Múltiples validaciones fallando

4. **Verifica en la BD:**
   - Después de crear una cita, verifica que `observacion` esté sanitizada
   - Verifica que las fechas y horarios se guarden correctamente

---

## 📊 Resumen de Códigos de Error

| Código | Descripción | HTTP Status |
|--------|-------------|-------------|
| `INVALID_WEEKDAY` | Fecha en sábado o domingo | 400 |
| `INVALID_DURATION` | Duración fuera de 55-65 minutos | 400 |
| `DATE_TOO_FAR` | Fecha > 1 año en el futuro | 400 |
| `DATE_IN_PAST` | Fecha en el pasado | 400 |
| `INVALID_TIME_RANGE` | Horario fuera de 7:00 AM - 6:00 PM | 400 |
| `INVALID_TIME_ORDER` | Hora inicio >= hora fin | 400 |

---

## ✅ Caso de Éxito Completo

**Request:**
```
POST {{base_url}}/api/gestion-citas
Content-Type: application/json
Authorization: Bearer {{token}}
```

**Body:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 1,
  "observacion": "Cliente requiere atención especial"
}
```

**Validaciones que pasan:**
- ✅ Fecha es día hábil (lunes)
- ✅ Duración es 60 minutos (válida)
- ✅ Fecha está dentro del rango (menos de 1 año)
- ✅ Horario está dentro del rango (7:00 AM - 6:00 PM)
- ✅ Observación se sanitiza (si tiene XSS)
- ✅ No hay solapamiento de horarios
- ✅ Empleado y cliente son válidos

**Response (201):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 123,
      "fecha": "2026-01-20",
      "hora_inicio": "09:00:00",
      "hora_fin": "10:00:00",
      "tipo": "General",
      "modalidad": "Presencial",
      "estado": "Programada",
      "observacion": "Cliente requiere atención especial",
      "id_cliente": 1,
      "id_empleado": 1
    }
  }
}
```

---

**Última actualización:** Enero 2026

