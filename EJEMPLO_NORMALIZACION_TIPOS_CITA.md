# 📋 Ejemplos de Uso: Normalización de Tipos de Cita

**Fecha:** Enero 2026  
**Funcionalidad:** Normalización automática de tipos de cita con acentos y variaciones

---

## 🎯 Descripción

El sistema ahora acepta variaciones comunes de tipos de cita (con acentos, espacios adicionales, etc.) y las normaliza automáticamente a los valores exactos que espera la base de datos.

---

## ✅ Ejemplos de Uso

### **Ejemplo 1: Crear Cita con Tipo "Certificación" (con acento)**

**Request:**
```bash
POST /api/gestion-citas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2026-02-15",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "tipo": "Certificación",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 2,
  "observacion": "Cliente necesita asesoría para certificar su marca"
}
```

**Resultado:** ✅ Se normaliza automáticamente a `"Certificacion"` y se acepta

**Response (201 Created):**
```json
{
  "message": "Cita creada exitosamente",
  "cita": {
    "id_cita": 15,
    "fecha": "2026-02-15",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "tipo": "Certificacion",
    "modalidad": "Presencial",
    "estado": "Programada",
    "id_cliente": 1,
    "id_empleado": 2,
    "observacion": "Cliente necesita asesoría para certificar su marca"
  }
}
```

---

### **Ejemplo 2: Crear Cita con Tipo "Búsqueda de Antecedentes" (con acento y texto completo)**

**Request:**
```bash
POST /api/gestion-citas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2026-02-16",
  "hora_inicio": "14:00:00",
  "hora_fin": "15:00:00",
  "tipo": "Búsqueda de Antecedentes",
  "modalidad": "Virtual",
  "documento": 1234567890,
  "id_empleado": 2
}
```

**Resultado:** ✅ Se normaliza automáticamente a `"Busqueda"` y se acepta

**Response (201 Created):**
```json
{
  "message": "Cita creada exitosamente",
  "cita": {
    "id_cita": 16,
    "fecha": "2026-02-16",
    "hora_inicio": "14:00:00",
    "hora_fin": "15:00:00",
    "tipo": "Busqueda",
    "modalidad": "Virtual",
    "estado": "Programada",
    "id_cliente": 1,
    "id_empleado": 2
  }
}
```

---

### **Ejemplo 3: Crear Cita con Tipo "Renovación" (con acento)**

**Request:**
```bash
POST /api/gestion-citas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2026-02-17",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "Renovación",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 2
}
```

**Resultado:** ✅ Se normaliza automáticamente a `"Renovacion"` y se acepta

---

### **Ejemplo 4: Crear Cita con Tipo "Respuesta de oposición" (con acento)**

**Request:**
```bash
POST /api/gestion-citas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2026-02-18",
  "hora_inicio": "11:00:00",
  "hora_fin": "12:00:00",
  "tipo": "Respuesta de oposición",
  "modalidad": "Virtual",
  "id_cliente": 1,
  "id_empleado": 2
}
```

**Resultado:** ✅ Se normaliza automáticamente a `"Respuesta de oposicion"` y se acepta

---

### **Ejemplo 5: Crear Cita con Tipo Exacto (sin normalización necesaria)**

**Request:**
```bash
POST /api/gestion-citas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2026-02-19",
  "hora_inicio": "15:00:00",
  "hora_fin": "16:00:00",
  "tipo": "Busqueda",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 2
}
```

**Resultado:** ✅ Se acepta directamente sin normalización

---

### **Ejemplo 6: Error - Tipo Inválido**

**Request:**
```bash
POST /api/gestion-citas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2026-02-20",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "tipo": "Consulta",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 2
}
```

**Resultado:** ❌ Error 400 - Tipo no válido

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Tipo de cita no válido",
  "error": {
    "campo": "tipo",
    "valor_recibido": "Consulta",
    "valores_permitidos": [
      "General",
      "Busqueda",
      "Ampliacion",
      "Certificacion",
      "Renovacion",
      "Cesion",
      "Oposicion",
      "Respuesta de oposicion"
    ],
    "nota": "Los valores deben ser exactamente: General, Busqueda, Ampliacion, Certificacion, Renovacion, Cesion, Oposicion, Respuesta de oposicion"
  }
}
```

---

## 📊 Tabla de Variaciones Aceptadas

| Valor Enviado | Valor Normalizado | Estado |
|---------------|-------------------|--------|
| `"General"` | `"General"` | ✅ |
| `"general"` | `"General"` | ✅ |
| `"Busqueda"` | `"Busqueda"` | ✅ |
| `"Búsqueda"` | `"Busqueda"` | ✅ |
| `"Búsqueda de Antecedentes"` | `"Busqueda"` | ✅ |
| `"Ampliacion"` | `"Ampliacion"` | ✅ |
| `"Ampliación"` | `"Ampliacion"` | ✅ |
| `"Ampliación de Alcance"` | `"Ampliacion"` | ✅ |
| `"Certificacion"` | `"Certificacion"` | ✅ |
| `"Certificación"` | `"Certificacion"` | ✅ |
| `"Certificación de Marca"` | `"Certificacion"` | ✅ |
| `"Renovacion"` | `"Renovacion"` | ✅ |
| `"Renovación"` | `"Renovacion"` | ✅ |
| `"Renovación de Marca"` | `"Renovacion"` | ✅ |
| `"Cesion"` | `"Cesion"` | ✅ |
| `"Cesión"` | `"Cesion"` | ✅ |
| `"Cesión de Marca"` | `"Cesion"` | ✅ |
| `"Oposicion"` | `"Oposicion"` | ✅ |
| `"Oposición"` | `"Oposicion"` | ✅ |
| `"Presentación de Oposición"` | `"Oposicion"` | ✅ |
| `"Respuesta de oposicion"` | `"Respuesta de oposicion"` | ✅ |
| `"Respuesta de oposición"` | `"Respuesta de oposicion"` | ✅ |
| `"Respuesta a oposición"` | `"Respuesta de oposicion"` | ✅ |
| `"Consulta"` | ❌ Error | ❌ |
| `"Otro"` | ❌ Error | ❌ |

---

## 🔍 Ejemplo con Postman

### **Collection JSON para Postman:**

```json
{
  "info": {
    "name": "Citas - Normalización de Tipos",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Crear Cita - Certificación (con acento)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fecha\": \"2026-02-15\",\n  \"hora_inicio\": \"10:00:00\",\n  \"hora_fin\": \"11:00:00\",\n  \"tipo\": \"Certificación\",\n  \"modalidad\": \"Presencial\",\n  \"id_cliente\": 1,\n  \"id_empleado\": 2\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/gestion-citas",
          "host": ["{{base_url}}"],
          "path": ["api", "gestion-citas"]
        }
      }
    },
    {
      "name": "Crear Cita - Búsqueda (con acento)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"fecha\": \"2026-02-16\",\n  \"hora_inicio\": \"14:00:00\",\n  \"hora_fin\": \"15:00:00\",\n  \"tipo\": \"Búsqueda de Antecedentes\",\n  \"modalidad\": \"Virtual\",\n  \"documento\": 1234567890,\n  \"id_empleado\": 2\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/gestion-citas",
          "host": ["{{base_url}}"],
          "path": ["api", "gestion-citas"]
        }
      }
    }
  ]
}
```

---

## 🧪 Testing con cURL

### **Test 1: Tipo con Acento**
```bash
curl -X POST "http://localhost:3000/api/gestion-citas" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2026-02-15",
    "hora_inicio": "10:00:00",
    "hora_fin": "11:00:00",
    "tipo": "Certificación",
    "modalidad": "Presencial",
    "id_cliente": 1,
    "id_empleado": 2
  }'
```

### **Test 2: Tipo con Texto Completo**
```bash
curl -X POST "http://localhost:3000/api/gestion-citas" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2026-02-16",
    "hora_inicio": "14:00:00",
    "hora_fin": "15:00:00",
    "tipo": "Búsqueda de Antecedentes",
    "modalidad": "Virtual",
    "documento": 1234567890,
    "id_empleado": 2
  }'
```

### **Test 3: Tipo Exacto (sin normalización)**
```bash
curl -X POST "http://localhost:3000/api/gestion-citas" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2026-02-17",
    "hora_inicio": "09:00:00",
    "hora_fin": "10:00:00",
    "tipo": "Busqueda",
    "modalidad": "Presencial",
    "id_cliente": 1,
    "id_empleado": 2
  }'
```

---

## ✅ Beneficios

1. **Flexibilidad:** El frontend puede enviar valores con acentos sin preocuparse
2. **Tolerancia:** Acepta variaciones comunes automáticamente
3. **Claridad:** Mensajes de error descriptivos cuando el tipo es inválido
4. **Compatibilidad:** Funciona con valores exactos y variaciones

---

**Última actualización:** Enero 2026  
**Versión:** 1.0

