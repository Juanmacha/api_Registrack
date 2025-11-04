# 🚀 Ejemplo Rápido: Crear y Editar Rol en Postman

## 📋 Configuración Rápida

1. **Variables de Entorno:**
   - `base_url`: `http://localhost:3000`
   - `admin_token`: `[TU_TOKEN_AQUI]`

---

## 1️⃣ CREAR ROL (POST)

**URL:** `POST {{base_url}}/api/gestion-roles`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body (raw JSON):**
```json
{
  "nombre": "Supervisor de Ventas",
  "estado": "Activo",
  "permisos": {
    "usuarios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "clientes": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "empleados": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "empresas": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "servicios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "solicitudes": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "citas": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "pagos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "roles": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "permisos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "privilegios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "seguimiento": { "crear": false, "leer": true, "actualizar": true, "eliminar": false },
    "archivos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "tipo_archivos": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "formularios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "detalles_orden": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "detalles_procesos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "servicios_procesos": { "crear": false, "leer": true, "actualizar": false, "eliminar": false }
  }
}
```

**✅ Guarda el `id` del rol creado (ejemplo: `id: 4`)**

---

## 2️⃣ ACTUALIZAR SOLO PERMISOS (PUT) - NUEVO ✨

**URL:** `PUT {{base_url}}/api/gestion-roles/4`  
*(Reemplaza `4` con el ID del rol que creaste)*

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body (raw JSON):**
```json
{
  "permisos": {
    "usuarios": { "crear": false, "leer": true, "actualizar": true, "eliminar": false },
    "clientes": { "crear": true, "leer": true, "actualizar": true, "eliminar": true },
    "empleados": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "empresas": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "servicios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "solicitudes": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "citas": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "pagos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "roles": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "permisos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "privilegios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "seguimiento": { "crear": false, "leer": true, "actualizar": true, "eliminar": false },
    "archivos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "tipo_archivos": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "formularios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "detalles_orden": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "detalles_procesos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "servicios_procesos": { "crear": false, "leer": true, "actualizar": false, "eliminar": false }
  }
}
```

**✅ Verifica:** El nombre y estado se mantienen igual, solo se actualizan los permisos.

---

## 3️⃣ ACTUALIZAR TODO (PUT) - NUEVO ✨

**URL:** `PUT {{base_url}}/api/gestion-roles/4`

**Body (raw JSON):**
```json
{
  "nombre": "Director de Ventas",
  "estado": "Activo",
  "permisos": {
    "usuarios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "clientes": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "empleados": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "empresas": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "servicios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "solicitudes": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "citas": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "pagos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "roles": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "permisos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "privilegios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "seguimiento": { "crear": false, "leer": true, "actualizar": true, "eliminar": false },
    "archivos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "tipo_archivos": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "formularios": { "crear": false, "leer": true, "actualizar": false, "eliminar": false },
    "detalles_orden": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "detalles_procesos": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
    "servicios_procesos": { "crear": false, "leer": true, "actualizar": false, "eliminar": false }
  }
}
```

**✅ Verifica:** Se actualizan nombre, estado y permisos.

---

## 4️⃣ QUITAR TODOS LOS PERMISOS (PUT) - NUEVO ✨

**URL:** `PUT {{base_url}}/api/gestion-roles/4`

**Body (raw JSON):**
```json
{
  "permisos": {
    "usuarios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "clientes": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "empleados": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "empresas": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "servicios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "solicitudes": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "citas": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "pagos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "roles": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "permisos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "privilegios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "seguimiento": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "archivos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "tipo_archivos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "formularios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "detalles_orden": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "detalles_procesos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
    "servicios_procesos": { "crear": false, "leer": false, "actualizar": false, "eliminar": false }
  }
}
```

**✅ Verifica:** El rol queda sin permisos asignados.

---

## 5️⃣ ACTUALIZAR SOLO NOMBRE Y ESTADO (PUT)

**URL:** `PUT {{base_url}}/api/gestion-roles/4`

**Body (raw JSON):**
```json
{
  "nombre": "Supervisor Senior",
  "estado": true
}
```

**✅ Verifica:** Solo se actualizan nombre y estado, los permisos se mantienen igual.

---

## 📝 Formato de Estado Aceptado

Puedes usar cualquiera de estos formatos:
- `true` / `false` (boolean)
- `"Activo"` / `"Inactivo"` (string)
- `"activo"` / `"inactivo"` (string minúsculas)
- `1` / `0` (number)

---

## ✅ Respuesta Esperada

```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Director de ventas",
    "estado": "Activo",
    "permisos": {
      // ... todos los módulos con sus permisos
    }
  }
}
```

---

**✨ Listo para probar!** Copia y pega estos ejemplos directamente en Postman.

