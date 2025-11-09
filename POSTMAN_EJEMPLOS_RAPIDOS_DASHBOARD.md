# 🚀 Ejemplos Rápidos Postman - Dashboard Períodos

## ⚡ Inicio Rápido

### 1. Obtener Token JWT (si no lo tienes)
```
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json

{
  "correo": "admin@ejemplo.com",
  "contrasena": "tu_contraseña"
}
```

### 2. Configurar Header de Autorización
En Postman, agrega este header a todas las peticiones:
```
Authorization: Bearer {tu_token_jwt}
```

---

## 📋 Ejemplos Esenciales

### ✅ Ejemplo 1: Obtener Períodos Disponibles
```
GET http://localhost:3000/api/dashboard/periodos
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 2: Ingresos - Último Mes
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=1mes
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 3: Ingresos - Último Año (Por Defecto)
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=12meses
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 4: Ingresos - Todos los Datos
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=todo
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 5: Ingresos - Período Personalizado
```
GET http://localhost:3000/api/dashboard/ingresos?periodo=custom&fecha_inicio=2024-01-01&fecha_fin=2024-12-31
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 6: Servicios - Último Año
```
GET http://localhost:3000/api/dashboard/servicios?periodo=12meses
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 7: Servicios - Todos los Datos
```
GET http://localhost:3000/api/dashboard/servicios?periodo=todo
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 8: Resumen General - Último Año
```
GET http://localhost:3000/api/dashboard/resumen?periodo=12meses
Authorization: Bearer {tu_token_jwt}
```

### ✅ Ejemplo 9: Resumen General - Últimos 3 Años
```
GET http://localhost:3000/api/dashboard/resumen?periodo=3anos
Authorization: Bearer {tu_token_jwt}
```

---

## 🎯 Todos los Períodos Disponibles

| Período | Ejemplo de URL |
|---------|---------------|
| `1mes` | `?periodo=1mes` |
| `3meses` | `?periodo=3meses` |
| `6meses` | `?periodo=6meses` |
| `12meses` | `?periodo=12meses` (por defecto) |
| `18meses` | `?periodo=18meses` |
| `2anos` | `?periodo=2anos` |
| `3anos` | `?periodo=3anos` |
| `5anos` | `?periodo=5anos` |
| `todo` | `?periodo=todo` |
| `custom` | `?periodo=custom&fecha_inicio=2024-01-01&fecha_fin=2024-12-31` |

---

## 📝 Notas Rápidas

1. **Token JWT requerido:** Todas las peticiones necesitan un token válido de un usuario administrador.

2. **Período por defecto:** Si no especificas un período, se usa `12meses`.

3. **Período "todo":** Retorna todos los datos sin filtro de fecha.

4. **Período "custom":** Requiere `fecha_inicio` y `fecha_fin` en formato `YYYY-MM-DD`.

5. **Servicios y custom:** El endpoint de servicios NO soporta período `custom`.

---

## 🔍 Respuesta Esperada

Todas las respuestas exitosas tienen esta estructura:
```json
{
  "success": true,
  "data": {
    "periodo": "12meses",
    "periodo_seleccionado": "12meses",
    // ... otros datos ...
  }
}
```

---

## 📚 Documentación Completa

Para más detalles, ejemplos completos y casos de error, ver:
- `POSTMAN_EJEMPLOS_DASHBOARD_PERIODOS.md` - Documentación completa

---

**¡Listo para probar! 🚀**

