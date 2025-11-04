# 📬 Ejemplos Postman: Crear y Editar Roles con Permisos

## 🔐 Configuración Inicial

### Variables de Entorno Postman
```
base_url: http://localhost:3000
admin_token: [TU_TOKEN_DE_ADMINISTRADOR]
```

---

## 1️⃣ CREAR UN ROL (POST)

### Request
```http
POST {{base_url}}/api/gestion-roles
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### Body (JSON)
```json
{
  "nombre": "Supervisor de Ventas",
  "estado": "Activo",
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "empresas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "archivos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "formularios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

### Response Esperado (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "4",
    "nombre": "Supervisor de ventas",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "clientes": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      // ... todos los demás módulos
    }
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `id` del rol creado para usarlo en las siguientes pruebas (ejemplo: `id: 4`)

---

## 2️⃣ OBTENER ROL POR ID (GET)

### Request
```http
GET {{base_url}}/api/gestion-roles/4
Authorization: Bearer {{admin_token}}
```

### Response Esperado (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "4",
    "nombre": "Supervisor de ventas",
    "estado": "Activo",
    "permisos": {
      // ... permisos del rol
    }
  }
}
```

---

## 3️⃣ ACTUALIZAR SOLO NOMBRE Y ESTADO (PUT)

### Request
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### Body (JSON)
```json
{
  "nombre": "Supervisor Senior de Ventas",
  "estado": true
}
```

**✅ Resultado Esperado:**
- ✅ Solo se actualiza `nombre` y `estado`
- ✅ Los permisos se mantienen igual que antes

### Response Esperado (200 OK)
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Supervisor senior de ventas",
    "estado": "Activo",
    "permisos": {
      // ... permisos se mantienen igual
    }
  }
}
```

---

## 4️⃣ ACTUALIZAR SOLO PERMISOS (PUT)

### Request
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### Body (JSON)
```json
{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "clientes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": true
    },
    "empleados": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "empresas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "archivos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "formularios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**✅ Resultado Esperado:**
- ✅ Solo se actualizan los permisos
- ✅ El `nombre` y `estado` se mantienen igual que antes

### Response Esperado (200 OK)
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Supervisor senior de ventas",
    "estado": "Activo",
    "permisos": {
      // ... nuevos permisos actualizados
    }
  }
}
```

---

## 5️⃣ ACTUALIZAR TODO (NOMBRE, ESTADO Y PERMISOS) (PUT)

### Request
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### Body (JSON)
```json
{
  "nombre": "Director de Ventas",
  "estado": "Activo",
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "empresas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "archivos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "formularios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**✅ Resultado Esperado:**
- ✅ Se actualizan todos los campos proporcionados

### Response Esperado (200 OK)
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Director de ventas",
    "estado": "Activo",
    "permisos": {
      // ... todos los permisos actualizados
    }
  }
}
```

---

## 6️⃣ QUITAR TODOS LOS PERMISOS (PUT)

### Request
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### Body (JSON) - Todos los permisos en false
```json
{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "empresas": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "citas": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "pagos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "archivos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "formularios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**✅ Resultado Esperado:**
- ✅ El rol queda sin permisos asignados
- ✅ Todos los módulos quedan con permisos en `false`

### Response Esperado (200 OK)
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Director de ventas",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      },
      // ... todos los demás módulos con permisos en false
    }
  }
}
```

---

## 7️⃣ ACTUALIZAR SOLO ESTADO (PUT)

### Request
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### Body (JSON) - Diferentes formatos de estado

**Opción 1: Boolean**
```json
{
  "estado": false
}
```

**Opción 2: String**
```json
{
  "estado": "Inactivo"
}
```

**Opción 3: String minúsculas**
```json
{
  "estado": "inactivo"
}
```

**Opción 4: Number**
```json
{
  "estado": 0
}
```

**✅ Resultado Esperado:**
- ✅ Todos los formatos funcionan correctamente
- ✅ Solo se actualiza el estado
- ✅ El nombre y permisos se mantienen igual

---

## 8️⃣ CASOS DE ERROR

### 8.1 Rol No Encontrado (404)
```http
PUT {{base_url}}/api/gestion-roles/999
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{
  "nombre": "Nuevo Rol"
}
```

**Response Esperado (404):**
```json
{
  "success": false,
  "error": "Rol no encontrado",
  "details": {
    "id": "999"
  }
}
```

### 8.2 Sin Campos para Actualizar (400)
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "error": "Debe proporcionar al menos un campo para actualizar (nombre, estado o permisos)"
}
```

### 8.3 Nombre Vacío (400)
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{
  "nombre": ""
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "error": "El nombre del rol debe ser un string no vacío"
}
```

### 8.4 Permisos Inválidos (400)
```http
PUT {{base_url}}/api/gestion-roles/4
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{
  "permisos": {
    "modulo_invalido": {
      "crear": true
    }
  }
}
```

**Response Esperado (400):**
```json
{
  "success": false,
  "error": "Módulo inválido: modulo_invalido. Módulos válidos: usuarios, empleados, clientes, ..."
}
```

---

## 📋 Checklist de Pruebas

- [ ] Crear un rol con permisos completos
- [ ] Obtener el rol por ID
- [ ] Actualizar solo nombre y estado
- [ ] Verificar que los permisos se mantienen igual
- [ ] Actualizar solo permisos
- [ ] Verificar que nombre y estado se mantienen igual
- [ ] Actualizar todo (nombre, estado y permisos)
- [ ] Quitar todos los permisos
- [ ] Verificar que el rol queda sin permisos
- [ ] Probar diferentes formatos de estado
- [ ] Probar casos de error (rol no encontrado, validaciones)

---

## 🔑 Notas Importantes

1. **Token de Autenticación:** Asegúrate de tener un token válido de administrador en la variable `admin_token`

2. **ID del Rol:** Después de crear un rol, guarda el `id` para usarlo en las actualizaciones

3. **Todos los Módulos:** Cuando actualices permisos, incluye todos los 18 módulos para evitar problemas

4. **Formato de Estado:** El estado acepta múltiples formatos:
   - `true` / `false` (boolean)
   - `"Activo"` / `"Inactivo"` (string)
   - `"true"` / `"false"` (string)
   - `1` / `0` (number)

5. **Actualización Parcial:** Solo se actualizan los campos que proporcionas en el body

6. **Permisos Vacíos:** Puedes quitar todos los permisos enviando todos los valores en `false`

---

**Fecha:** 4 de Noviembre de 2025  
**Versión:** 1.0

