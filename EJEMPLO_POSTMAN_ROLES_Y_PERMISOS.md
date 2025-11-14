# 📮 Ejemplos Postman: Gestión de Roles y Permisos

**Fecha:** Enero 2026  
**Objetivo:** Crear roles, asignar permisos, crear usuarios con roles y verificar permisos

---

## 🔐 **Paso 1: Autenticarse como Administrador**

### **Request: Login**
```
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json

{
  "correo": "admin@example.com",
  "contrasena": "tu_contraseña_admin"
}
```

### **Response:**
```json
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "correo": "admin@example.com",
    "rol": "administrador",
    "id_rol": 2
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ IMPORTANTE:** Copia el `token` para usarlo en los siguientes requests (agregarlo en el header `Authorization: Bearer <token>`)

---

## 🆕 **Paso 2: Crear un Nuevo Rol con Permisos**

### **Request: Crear Rol "Supervisor"**
```
POST http://localhost:3000/api/gestion-roles/
Authorization: Bearer <tu_token_admin>
Content-Type: application/json

{
  "nombre": "supervisor",
  "estado": "Activo",
  "permisos": {
    "usuarios": {
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
    "seguimiento": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "dashboard": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

### **Response Esperado:**
```json
{
  "success": true,
  "data": {
    "id": "4",
    "nombre": "Supervisor",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
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
      "seguimiento": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "dashboard": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      // ... otros módulos en false
    }
  }
}
```

**✅ Verificación:** El rol se crea con los permisos especificados. Guarda el `id` del rol (ej: `4`) para usarlo después.

---

## ✏️ **Paso 3: Actualizar Rol (Añadir/Quitar Permisos)**

### **Request: Actualizar Rol "Supervisor" - Añadir Permiso de Actualizar Usuarios**
```
PUT http://localhost:3000/api/gestion-roles/4
Authorization: Bearer <tu_token_admin>
Content-Type: application/json

{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": true,  // ✅ AÑADIDO: Ahora puede actualizar usuarios
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
    "seguimiento": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "dashboard": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

### **Request: Actualizar Rol "Supervisor" - Quitar Permiso de Crear Citas**
```
PUT http://localhost:3000/api/gestion-roles/4
Authorization: Bearer <tu_token_admin>
Content-Type: application/json

{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": false,  // ❌ QUITADO: Ya no puede crear citas
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "seguimiento": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "dashboard": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**✅ Verificación:** Los permisos se actualizan correctamente. Solo necesitas enviar los módulos que quieres cambiar.

---

## 👤 **Paso 4: Crear un Usuario y Asignarle un Rol**

### **Request: Crear Usuario con Rol "Supervisor"**
```
POST http://localhost:3000/api/usuarios/crear
Authorization: Bearer <tu_token_admin>
Content-Type: application/json

{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@example.com",
  "telefono": "3001234567",
  "contrasena": "Password123!",
  "id_rol": 4
}
```

**⚠️ IMPORTANTE:** 
- `id_rol: 4` es el ID del rol "supervisor" que creamos anteriormente
- Si quieres asignar otro rol, usa:
  - `id_rol: 1` = Cliente
  - `id_rol: 2` = Administrador
  - `id_rol: 3` = Empleado
  - `id_rol: 4` = Supervisor (el que creamos)

### **Response Esperado:**
```json
{
  "success": true,
  "mensaje": "Usuario creado exitosamente por administrador",
  "usuario": {
    "id_usuario": 5,
    "tipo_documento": "CC",
    "documento": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan.perez@example.com",
    "telefono": "3001234567",
    "id_rol": 4,
    "estado": true
  }
}
```

---

## 📋 **Paso 5: Ver Todos los Roles y sus Permisos**

### **Request: Obtener Todos los Roles**
```
GET http://localhost:3000/api/gestion-roles/
Authorization: Bearer <tu_token_admin>
```

### **Response Esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nombre": "Cliente",
      "estado": "Activo",
      "permisos": {
        "usuarios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
        // ... todos en false (cliente tiene restricciones en middleware)
      }
    },
    {
      "id": "2",
      "nombre": "Administrador",
      "estado": "Activo",
      "permisos": {
        "usuarios": { "crear": true, "leer": true, "actualizar": true, "eliminar": true },
        "empleados": { "crear": true, "leer": true, "actualizar": true, "eliminar": true },
        // ... TODOS en true (bypass automático)
      }
    },
    {
      "id": "3",
      "nombre": "Empleado",
      "estado": "Activo",
      "permisos": {
        "usuarios": { "crear": false, "leer": false, "actualizar": false, "eliminar": false },
        // ... todos en false (si no tiene permisos asignados en BD)
      }
    },
    {
      "id": "4",
      "nombre": "Supervisor",
      "estado": "Activo",
      "permisos": {
        "usuarios": { "crear": false, "leer": true, "actualizar": true, "eliminar": false },
        "solicitudes": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
        // ... permisos específicos asignados
      }
    }
  ]
}
```

---

## 🔍 **Paso 6: Ver un Rol Específico**

### **Request: Obtener Rol por ID**
```
GET http://localhost:3000/api/gestion-roles/3
Authorization: Bearer <tu_token_admin>
```

**Nota:** `3` es el ID del rol "empleado". Esto te mostrará los permisos actuales del empleado.

---

## ⚠️ **Problema: Roles Empleado y Cliente Aparecen Todo en False**

### **Causa:**
Los roles "empleado" (id_rol = 3) y "cliente" (id_rol = 1) no tienen permisos asignados en la tabla `rol_permisos_privilegios` de la base de datos.

### **Solución: Ejecutar Scripts SQL**

#### **1. Asignar Permisos al Rol Empleado**

Ejecuta el siguiente script SQL en tu base de datos para asignar permisos al rol empleado:

```sql
USE registrack_db;

-- Obtener ID del rol empleado
SET @id_rol_empleado = (SELECT id_rol FROM roles WHERE nombre = 'empleado' LIMIT 1);

-- Asignar permisos al rol empleado
-- Permiso: Leer usuarios
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_usuarios' AND pr.nombre = 'leer'
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Leer solicitudes
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_solicitudes' AND pr.nombre = 'leer'
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Crear y leer citas
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_citas' AND pr.nombre IN ('crear', 'leer')
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Leer, crear y actualizar seguimiento
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_seguimiento' AND pr.nombre IN ('leer', 'crear', 'actualizar')
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: Leer dashboard
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_empleado, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_dashboard' AND pr.nombre = 'leer'
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Verificar permisos asignados
SELECT 
    r.nombre as rol,
    p.nombre as permiso,
    pr.nombre as privilegio
FROM rol_permisos_privilegios rpp
JOIN roles r ON rpp.id_rol = r.id_rol
JOIN permisos p ON rpp.id_permiso = p.id_permiso
JOIN privilegios pr ON rpp.id_privilegio = pr.id_privilegio
WHERE r.nombre = 'empleado'
ORDER BY p.nombre, pr.nombre;
```

**Alternativa:** También puedes usar el script completo en:
📁 `database/migrations/003_asignar_permisos_rol_empleado.sql`

#### **2. Asignar Permisos al Rol Cliente**

Ejecuta el siguiente script SQL en tu base de datos para asignar permisos al rol cliente:

```sql
USE registrack_db;

-- Obtener ID del rol cliente
SET @id_rol_cliente = (SELECT id_rol FROM roles WHERE nombre = 'cliente' LIMIT 1);

-- Asignar permisos al rol cliente
-- Permiso: gestion_citas - leer, crear, actualizar, eliminar
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_cliente, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_citas' AND pr.nombre IN ('leer', 'crear', 'actualizar', 'eliminar')
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Permiso: gestion_solicitudes - crear, leer
INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol_cliente, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre = 'gestion_solicitudes' AND pr.nombre IN ('crear', 'leer')
ON DUPLICATE KEY UPDATE id_rol=id_rol;

-- Verificar permisos asignados
SELECT 
    r.nombre as rol,
    p.nombre as permiso,
    pr.nombre as privilegio
FROM rol_permisos_privilegios rpp
JOIN roles r ON rpp.id_rol = r.id_rol
JOIN permisos p ON rpp.id_permiso = p.id_permiso
JOIN privilegios pr ON rpp.id_privilegio = pr.id_privilegio
WHERE r.nombre = 'cliente'
ORDER BY p.nombre, pr.nombre;
```

**Alternativa:** También puedes usar el script completo en:
📁 `database/migrations/004_asignar_permisos_rol_cliente.sql`

### **Después de Ejecutar los Scripts:**
1. Vuelve a consultar el rol empleado: `GET /api/gestion-roles/3`
2. Vuelve a consultar el rol cliente: `GET /api/gestion-roles/1`
3. Ahora deberías ver los permisos asignados en `true` para ambos roles

### **Nota Importante sobre el Rol Cliente:**
- Los clientes tienen permisos limitados: solo `gestion_citas` y `gestion_solicitudes`
- Estos permisos se validan adicionalmente en los controladores para asegurar que los clientes solo accedan a sus propios recursos
- Los clientes NO pueden acceder a otros módulos (bloqueados en middleware)

---

## 🧪 **Paso 7: Probar Permisos del Usuario Creado**

### **Request: Login con Usuario "Supervisor"**
```
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json

{
  "correo": "juan.perez@example.com",
  "contrasena": "Password123!"
}
```

### **Response:**
```json
{
  "success": true,
  "usuario": {
    "id_usuario": 5,
    "correo": "juan.perez@example.com",
    "rol": "supervisor",
    "id_rol": 4
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Probar Acceso con Permisos del Supervisor:**

**✅ Debería funcionar (tiene permiso):**
```
GET http://localhost:3000/api/usuarios/
Authorization: Bearer <token_supervisor>
```
→ Debería retornar lista de usuarios (tiene `gestion_usuarios` + `leer`)

**❌ Debería fallar (no tiene permiso):**
```
POST http://localhost:3000/api/usuarios/crear
Authorization: Bearer <token_supervisor>
Content-Type: application/json
{
  "tipo_documento": "CC",
  "documento": "9999999999",
  "nombre": "Test",
  "apellido": "User",
  "correo": "test@example.com",
  "contrasena": "Password123!",
  "id_rol": 1
}
```
→ Debería retornar `403 Forbidden` (no tiene `gestion_usuarios` + `crear`)

---

## 📝 **Resumen de Endpoints**

| Método | Endpoint | Descripción | Permiso Requerido |
|--------|----------|-------------|-------------------|
| `POST` | `/api/gestion-roles/` | Crear nuevo rol | `gestion_roles` + `crear` |
| `GET` | `/api/gestion-roles/` | Listar todos los roles | `gestion_roles` + `leer` |
| `GET` | `/api/gestion-roles/:id` | Ver rol específico | `gestion_roles` + `leer` |
| `PUT` | `/api/gestion-roles/:id` | Actualizar rol | `gestion_roles` + `actualizar` |
| `PATCH` | `/api/gestion-roles/:id/state` | Cambiar estado | `gestion_roles` + `actualizar` |
| `DELETE` | `/api/gestion-roles/:id` | Eliminar rol | `gestion_roles` + `eliminar` |
| `POST` | `/api/usuarios/crear` | Crear usuario | `gestion_usuarios` + `crear` |
| `GET` | `/api/usuarios/` | Listar usuarios | `gestion_usuarios` + `leer` |

---

## ✅ **Checklist de Verificación**

- [ ] ✅ Crear rol con permisos específicos
- [ ] ✅ Actualizar rol añadiendo permisos
- [ ] ✅ Actualizar rol quitando permisos
- [ ] ✅ Crear usuario y asignarle rol
- [ ] ✅ Verificar permisos del rol empleado (ejecutar script SQL si está todo en false)
- [ ] ✅ Probar acceso con usuario del nuevo rol
- [ ] ✅ Verificar que permisos se aplican correctamente

---

**🎉 ¡Listo! Ahora puedes crear roles personalizados y asignar permisos específicos a cada uno.**

