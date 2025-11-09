# 📬 Ejemplos Postman - Dashboard con Períodos Mejorados

## 🔐 Autenticación

Todas las peticiones requieren un token JWT válido en el header `Authorization`.

**Header requerido:**
```
Authorization: Bearer {tu_token_jwt}
```

**Nota:** Reemplaza `{tu_token_jwt}` con el token obtenido al hacer login como administrador.

---

## 📋 Endpoints Disponibles

### 1. Obtener Períodos Disponibles

#### GET `/api/dashboard/periodos`

**Descripción:** Obtiene la lista de todos los períodos disponibles para el dashboard.

**Headers:**
```
Authorization: Bearer {tu_token_jwt}
```

**Query Parameters:** Ninguno

**Ejemplo de Request:**
```
GET http://localhost:3000/api/dashboard/periodos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "periodos": [
      {
        "value": "1mes",
        "label": "1 Mes",
        "tipo": "corto",
        "descripcion": "Último mes"
      },
      {
        "value": "3meses",
        "label": "3 Meses",
        "tipo": "corto",
        "descripcion": "Último trimestre"
      },
      {
        "value": "6meses",
        "label": "6 Meses",
        "tipo": "medio",
        "descripcion": "Último semestre"
      },
      {
        "value": "12meses",
        "label": "12 Meses",
        "tipo": "medio",
        "descripcion": "Último año"
      },
      {
        "value": "18meses",
        "label": "18 Meses",
        "tipo": "medio",
        "descripcion": "Últimos 18 meses"
      },
      {
        "value": "2anos",
        "label": "2 Años",
        "tipo": "largo",
        "descripcion": "Últimos 2 años"
      },
      {
        "value": "3anos",
        "label": "3 Años",
        "tipo": "largo",
        "descripcion": "Últimos 3 años"
      },
      {
        "value": "5anos",
        "label": "5 Años",
        "tipo": "largo",
        "descripcion": "Últimos 5 años"
      },
      {
        "value": "todo",
        "label": "Todos",
        "tipo": "completo",
        "descripcion": "Todos los datos disponibles"
      }
    ]
  }
}
```

---

### 2. Obtener Ingresos por Período

#### GET `/api/dashboard/ingresos`

**Descripción:** Obtiene datos de ingresos para el período especificado.

**Headers:**
```
Authorization: Bearer {tu_token_jwt}
```

**Query Parameters:**
- `periodo` (opcional): Período a consultar. Valores: `1mes`, `3meses`, `6meses`, `12meses`, `18meses`, `2anos`, `3anos`, `5anos`, `todo`, `custom`
- `fecha_inicio` (requerido si `periodo=custom`): Fecha inicio en formato `YYYY-MM-DD`
- `fecha_fin` (requerido si `periodo=custom`): Fecha fin en formato `YYYY-MM-DD`

#### Ejemplo 1: Último mes
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=1mes
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 2: Últimos 3 meses
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=3meses
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 3: Último año (por defecto)
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=12meses
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 4: Últimos 2 años
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=2anos
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 5: Todos los datos
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=todo
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 6: Período personalizado
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=custom&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 7: Sin especificar período (usa por defecto: 12meses)
```
GET http://localhost:3000/api/dashboard/ingresos
Authorization: Bearer {tu_token_jwt}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "periodo": "12meses",
    "periodo_seleccionado": "12meses",
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2025-01-01",
    "total_ingresos": 15000000.00,
    "total_transacciones": 45,
    "promedio_transaccion": 333333.33,
    "crecimiento_mensual": 15.5,
    "ingresos_por_mes": [
      {
        "mes": "2025-01",
        "mes_nombre": "Enero 2025",
        "total": 5000000.00,
        "transacciones": 15,
        "metodos": {
          "Efectivo": 1000000.00,
          "Transferencia": 2000000.00,
          "Tarjeta": 1500000.00,
          "Cheque": 500000.00
        }
      },
      {
        "mes": "2024-12",
        "mes_nombre": "Diciembre 2024",
        "total": 4500000.00,
        "transacciones": 12,
        "metodos": {
          "Efectivo": 900000.00,
          "Transferencia": 1800000.00,
          "Tarjeta": 1200000.00,
          "Cheque": 600000.00
        }
      }
    ],
    "metodos_pago": {
      "Efectivo": 3000000.00,
      "Transferencia": 6000000.00,
      "Tarjeta": 4500000.00,
      "Cheque": 1500000.00
    }
  }
}
```

**Error - Período Inválido:**
Si el período es inválido, se normaliza automáticamente a `12meses` (por defecto).

**Error - Custom sin Fechas (400):**
```json
{
  "success": false,
  "mensaje": "Para periodo \"custom\" se requieren fecha_inicio y fecha_fin",
  "error": "Fechas requeridas para período personalizado"
}
```

---

### 3. Obtener Resumen de Servicios por Período

#### GET `/api/dashboard/servicios`

**Descripción:** Obtiene resumen de servicios para el período especificado.

**Headers:**
```
Authorization: Bearer {tu_token_jwt}
```

**Query Parameters:**
- `periodo` (opcional): Período a consultar. Valores: `1mes`, `3meses`, `6meses`, `12meses`, `18meses`, `2anos`, `3anos`, `5anos`, `todo`
  - **Nota:** El período `custom` NO está disponible para servicios.

#### Ejemplo 1: Último mes
```
GET http://localhost:3000/api/dashboard/servicios?periodo=1mes
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 2: Último trimestre
```
GET http://localhost:3000/api/dashboard/servicios?periodo=3meses
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 3: Último año (por defecto)
```
GET http://localhost:3000/api/dashboard/servicios?periodo=12meses
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 4: Últimos 18 meses
```
GET http://localhost:3000/api/dashboard/servicios?periodo=18meses
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 5: Todos los datos
```
GET http://localhost:3000/api/dashboard/servicios?periodo=todo
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 6: Sin especificar período (usa por defecto: 12meses)
```
GET http://localhost:3000/api/dashboard/servicios
Authorization: Bearer {tu_token_jwt}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "periodo": "12meses",
    "periodo_seleccionado": "12meses",
    "total_servicios": 7,
    "total_solicitudes": 43,
    "servicios": [
      {
        "id_servicio": 1,
        "nombre": "Búsqueda de Antecedentes",
        "total_solicitudes": 18,
        "porcentaje_uso": 41.86,
        "estado_distribucion": {
          "Pendiente": 2,
          "En Proceso": 5,
          "Finalizado": 10,
          "Anulado": 1
        },
        "precio_base": 150000
      },
      {
        "id_servicio": 2,
        "nombre": "Certificación de Marca",
        "total_solicitudes": 12,
        "porcentaje_uso": 27.91,
        "estado_distribucion": {
          "Pendiente": 1,
          "En Proceso": 3,
          "Finalizado": 7,
          "Anulado": 1
        },
        "precio_base": 1848000
      }
    ],
    "servicios_mas_solicitados": [
      {
        "nombre": "Búsqueda de Antecedentes",
        "cantidad": 18
      },
      {
        "nombre": "Certificación de Marca",
        "cantidad": 12
      },
      {
        "nombre": "Renovación de Marca",
        "cantidad": 8
      }
    ],
    "servicios_menos_solicitados": [
      {
        "nombre": "Respuesta a Oposición",
        "cantidad": 2
      },
      {
        "nombre": "Ampliación de Alcance",
        "cantidad": 1
      },
      {
        "nombre": "Cesión de Marca",
        "cantidad": 2
      }
    ]
  }
}
```

---

### 4. Obtener Resumen General por Período

#### GET `/api/dashboard/resumen`

**Descripción:** Obtiene resumen general del dashboard con todos los KPIs para el período especificado.

**Headers:**
```
Authorization: Bearer {tu_token_jwt}
```

**Query Parameters:**
- `periodo` (opcional): Período a consultar. Valores: `1mes`, `3meses`, `6meses`, `12meses`, `18meses`, `2anos`, `3anos`, `5anos`, `todo`, `custom`
- `fecha_inicio` (requerido si `periodo=custom`): Fecha inicio en formato `YYYY-MM-DD`
- `fecha_fin` (requerido si `periodo=custom`): Fecha fin en formato `YYYY-MM-DD`

#### Ejemplo 1: Último mes
```
GET http://localhost:3000/api/dashboard/resumen?periodo=1mes
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 2: Últimos 3 meses
```
GET http://localhost:3000/api/dashboard/resumen?periodo=3meses
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 3: Último año (por defecto)
```
GET http://localhost:3000/api/dashboard/resumen?periodo=12meses
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 4: Últimos 3 años
```
GET http://localhost:3000/api/dashboard/resumen?periodo=3anos
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 5: Todos los datos
```
GET http://localhost:3000/api/dashboard/resumen?periodo=todo
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 6: Período personalizado
```
GET http://localhost:3000/api/dashboard/resumen?periodo=custom&fecha_inicio=2024-06-01&fecha_fin=2024-12-31
Authorization: Bearer {tu_token_jwt}
```

#### Ejemplo 7: Sin especificar período (usa por defecto: 12meses)
```
GET http://localhost:3000/api/dashboard/resumen
Authorization: Bearer {tu_token_jwt}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "periodo": "12meses",
    "periodo_seleccionado": "12meses",
    "kpis": {
      "ingresos_totales": 15000000.00,
      "solicitudes_totales": 43,
      "solicitudes_pendientes": 5,
      "solicitudes_inactivas": 2,
      "tasa_finalizacion": 65.12,
      "clientes_activos": 28
    },
    "alertas": [
      {
        "tipo": "pendientes",
        "nivel": "media",
        "cantidad": 5,
        "mensaje": "5 solicitudes pendientes de atención"
      }
    ],
    "resumen_ingresos": {
      "total": 15000000.00,
      "mes_actual": 5000000.00,
      "mes_anterior": 4500000.00,
      "crecimiento": 11.11
    },
    "resumen_servicios": {
      "total_servicios": 7,
      "total_solicitudes": 43,
      "mas_popular": "Búsqueda de Antecedentes",
      "menos_popular": "Ampliación de Alcance"
    }
  }
}
```

---

## 🧪 Colección de Pruebas Completas

### Prueba 1: Obtener Períodos Disponibles
```
GET /api/dashboard/periodos
```

### Prueba 2: Ingresos - Último Mes
```
GET /api/dashboard/ingresos?periodo=1mes
```

### Prueba 3: Ingresos - Último Trimestre
```
GET /api/dashboard/ingresos?periodo=3meses
```

### Prueba 4: Ingresos - Último Año
```
GET /api/dashboard/ingresos?periodo=12meses
```

### Prueba 5: Ingresos - Últimos 2 Años
```
GET /api/dashboard/ingresos?periodo=2anos
```

### Prueba 6: Ingresos - Todos los Datos
```
GET /api/dashboard/ingresos?periodo=todo
```

### Prueba 7: Ingresos - Período Personalizado
```
GET /api/dashboard/ingresos?periodo=custom&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
```

### Prueba 8: Servicios - Último Mes
```
GET /api/dashboard/servicios?periodo=1mes
```

### Prueba 9: Servicios - Último Año
```
GET /api/dashboard/servicios?periodo=12meses
```

### Prueba 10: Servicios - Todos los Datos
```
GET /api/dashboard/servicios?periodo=todo
```

### Prueba 11: Resumen - Último Mes
```
GET /api/dashboard/resumen?periodo=1mes
```

### Prueba 12: Resumen - Último Año
```
GET /api/dashboard/resumen?periodo=12meses
```

### Prueba 13: Resumen - Últimos 3 Años
```
GET /api/dashboard/resumen?periodo=3anos
```

### Prueba 14: Resumen - Período Personalizado
```
GET /api/dashboard/resumen?periodo=custom&fecha_inicio=2024-06-01&fecha_fin=2024-12-31
```

### Prueba 15: Validación - Período Inválido (debe normalizarse a 12meses)
```
GET /api/dashboard/ingresos?periodo=periodo_invalido
```

### Prueba 16: Error - Custom sin Fechas
```
GET /api/dashboard/ingresos?periodo=custom
```

---

## 📝 Notas Importantes

1. **Autenticación:** Todas las peticiones requieren un token JWT válido de un usuario con rol `administrador`.

2. **Período por Defecto:** Si no se especifica un período o se proporciona uno inválido, el sistema usa `12meses` como valor por defecto.

3. **Período "todo":** Cuando se usa `periodo=todo`, no se aplica ningún filtro de fecha y se retornan todos los datos disponibles.

4. **Período "custom":** Requiere los parámetros `fecha_inicio` y `fecha_fin` en formato `YYYY-MM-DD`. Si faltan, se retorna un error 400.

5. **Servicios y Custom:** El endpoint de servicios NO soporta el período `custom`. Si se intenta usar, se normaliza a `12meses`.

6. **Formato de Fechas:** Las fechas deben estar en formato `YYYY-MM-DD` (ejemplo: `2024-01-01`).

7. **Respuestas Vacías:** Si no hay datos para el período seleccionado, se retornan arrays vacíos `[]` y valores en `0`, no `null`.

---

## 🔍 Códigos de Estado HTTP

- **200 OK:** Petición exitosa
- **400 Bad Request:** Error en los parámetros (ej: custom sin fechas)
- **401 Unauthorized:** Token JWT inválido o faltante
- **403 Forbidden:** Usuario sin permisos (no es administrador)
- **500 Internal Server Error:** Error interno del servidor

---

## 🚀 Configuración en Postman

### 1. Crear Variable de Entorno

En Postman, crea una variable de entorno llamada `base_url` con el valor:
```
http://localhost:3000
```

Y una variable `token` con tu token JWT:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Configurar Headers Globales

En la colección de Postman, configura headers globales:
```
Authorization: {{token}}
Content-Type: application/json
```

### 3. Usar Variables en URLs

Usa las variables en las URLs:
```
GET {{base_url}}/api/dashboard/periodos
GET {{base_url}}/api/dashboard/ingresos?periodo=12meses
```

---

## ✅ Checklist de Pruebas

- [ ] Obtener períodos disponibles
- [ ] Ingresos con período 1mes
- [ ] Ingresos con período 3meses
- [ ] Ingresos con período 6meses
- [ ] Ingresos con período 12meses
- [ ] Ingresos con período 18meses
- [ ] Ingresos con período 2anos
- [ ] Ingresos con período 3anos
- [ ] Ingresos con período 5anos
- [ ] Ingresos con período todo
- [ ] Ingresos con período custom
- [ ] Servicios con diferentes períodos
- [ ] Resumen con diferentes períodos
- [ ] Validación de período inválido
- [ ] Error con custom sin fechas
- [ ] Verificar estructura de respuesta
- [ ] Verificar que periodo_seleccionado esté presente
- [ ] Verificar que fecha_inicio y fecha_fin estén presentes cuando aplica

---

**Fecha de creación:** 2025-01-09
**Versión:** 1.0
**Estado:** ✅ Implementado y listo para pruebas

