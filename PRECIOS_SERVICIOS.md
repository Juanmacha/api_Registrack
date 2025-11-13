# 💰 Precios de Servicios - API Registrack

## 📋 Tabla de Precios

| ID | Nombre del Servicio | Precio Base (COP) | Precio Formateado |
|----|---------------------|-------------------|-------------------|
| 1 | Búsqueda de Antecedentes | $150,000.00 | $150.000 |
| 2 | Certificación de Marca | $1,848,000.00 | $1.848.000 |
| 3 | Renovación de Marca | $1,352,000.00 | $1.352.000 |
| 4 | Presentación de Oposición | $1,400,000.00 | $1.400.000 |
| 5 | Cesión de Marca | $865,000.00 | $865.000 |
| 6 | Ampliación de Alcance | $750,000.00 | $750.000 |
| 7 | Respuesta a Oposición | $1,200,000.00 | $1.200.000 |

---

## 📊 Resumen por Rango de Precio

### Servicios Económicos (< $1.000.000)
- **Búsqueda de Antecedentes**: $150.000
- **Ampliación de Alcance**: $750.000
- **Cesión de Marca**: $865.000

### Servicios Intermedios ($1.000.000 - $1.500.000)
- **Respuesta a Oposición**: $1.200.000
- **Renovación de Marca**: $1.352.000
- **Presentación de Oposición**: $1.400.000

### Servicios Premium (> $1.500.000)
- **Certificación de Marca**: $1.848.000

---

## 💡 Notas Importantes

1. **Moneda:** Todos los precios están en Pesos Colombianos (COP)
2. **Precio Base:** El `precio_base` se almacena en la base de datos como `DECIMAL(15,2)`
3. **Total Estimado:** Cuando se crea una solicitud, el `total_estimado` se calcula automáticamente basado en el `precio_base` del servicio
4. **Actualización:** Los precios pueden ser actualizados por administradores en la base de datos

---

## 🔍 Consultar Precios desde la API

### Endpoint: Obtener Todos los Servicios
```
GET http://localhost:3000/api/servicios
```

### Response:
```json
[
  {
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    "descripcion": "Verifica la disponibilidad de tu marca...",
    "precio_base": 150000.00,
    "estado": true
  },
  {
    "id_servicio": 2,
    "nombre": "Certificación de Marca",
    "descripcion": "Acompañamiento completo...",
    "precio_base": 1848000.00,
    "estado": true
  }
  // ... más servicios
]
```

### Endpoint: Obtener Servicio por ID
```
GET http://localhost:3000/api/servicios/1
```

---

## 📝 Ejemplos de Uso en Postman

### Crear Solicitud con Precio Automático
Cuando creas una solicitud, el sistema automáticamente asigna el `precio_base` del servicio como `total_estimado`:

```json
POST /api/gestion-solicitudes/crear/1
{
  // ... datos de la solicitud
}

// Response incluye:
{
  "total_estimado": 150000.00,  // Precio automático del servicio
  "servicio": {
    "id_servicio": 1,
    "nombre": "Búsqueda de Antecedentes",
    "precio_base": 150000.00
  }
}
```

### Procesar Pago con Monto Correcto
Usa el `total_estimado` de la solicitud para el monto del pago:

```json
POST /api/gestion-pagos/process-mock
{
  "monto": 150000.00,  // Debe coincidir con total_estimado
  "metodo_pago": "Transferencia",
  "id_orden_servicio": 1
}
```

---

**Última actualización:** Enero 2026  
**Fuente:** `database/database_official_complete.sql`

