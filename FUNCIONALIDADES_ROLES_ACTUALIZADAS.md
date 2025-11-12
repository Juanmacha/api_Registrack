# ✅ Funcionalidades de Roles - Actualizadas y Mejoradas

**Fecha:** Enero 2026  
**Estado:** ✅ **COMPLETADO**

---

## 📋 Resumen de Funcionalidades

### **✅ 1. Editar Rol**
**Endpoint:** `PUT /api/gestion-roles/:id`

**Funcionalidades:**
- ✅ Actualizar nombre del rol
- ✅ Actualizar estado del rol (activo/inactivo)
- ✅ Actualizar permisos y privilegios del rol
- ✅ Eliminar todos los permisos/privilegios (enviar arrays vacíos)
- ✅ Actualización parcial (solo los campos proporcionados)

**Cómo funciona:**
1. Se pueden enviar `nombre`, `estado` y/o `permisos` (opcionales)
2. Si se envían `permisos`, se eliminan TODAS las relaciones existentes
3. Se crean nuevas relaciones con los permisos/privilegios proporcionados
4. Si los arrays están vacíos, el rol queda sin permisos

**Ejemplo de uso:**
```json
PUT /api/gestion-roles/4
{
  "nombre": "empleado_lector",
  "estado": true,
  "permisos": {
    "usuarios": {
      "leer": true,
      "crear": false,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "leer": true,
      "crear": false,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**Para eliminar todos los permisos:**
```json
PUT /api/gestion-roles/4
{
  "permisos": {}  // Objeto vacío = sin permisos
}
```

---

### **✅ 2. Eliminar Rol**
**Endpoint:** `DELETE /api/gestion-roles/:id`

**Funcionalidades:**
- ✅ Eliminar rol
- ✅ Eliminar automáticamente relaciones de permisos/privilegios (ON DELETE CASCADE)
- ✅ Validar que el rol no sea un rol básico (cliente, administrador, empleado)
- ✅ Validar que el rol no esté siendo usado por usuarios
- ✅ Mensajes de error descriptivos

**Validaciones:**
1. **Rol básico:** No se puede eliminar roles básicos del sistema
2. **Usuarios asignados:** No se puede eliminar si hay usuarios usando el rol
3. **Relaciones:** Se eliminan automáticamente las relaciones de permisos/privilegios

**Ejemplo de respuesta (éxito):**
```json
{
  "success": true,
  "message": "Rol eliminado correctamente",
  "data": {
    "id_rol": 4,
    "nombre": "empleado_lector"
  }
}
```

**Ejemplo de respuesta (error - rol básico):**
```json
{
  "success": false,
  "error": "No se puede eliminar el rol \"administrador\" porque es un rol básico del sistema",
  "detalles": {
    "rol": "administrador",
    "roles_basicos": ["cliente", "administrador", "empleado"],
    "mensaje": "Los roles básicos (cliente, administrador, empleado) no pueden ser eliminados por seguridad del sistema."
  }
}
```

**Ejemplo de respuesta (error - usuarios asignados):**
```json
{
  "success": false,
  "error": "No se puede eliminar el rol \"empleado_lector\" porque está siendo usado por 5 usuario(s)",
  "detalles": {
    "rol": "empleado_lector",
    "id_rol": 4,
    "usuarios_asignados": 5,
    "mensaje": "Debes reasignar los usuarios a otro rol antes de eliminar este rol.",
    "accion_requerida": "Reasigna los usuarios a otro rol y luego intenta eliminar este rol nuevamente."
  }
}
```

---

### **✅ 3. Eliminar Permisos/Privilegios de un Rol**
**Endpoint:** `PUT /api/gestion-roles/:id`

**Funcionalidades:**
- ✅ Eliminar todos los permisos/privilegios de un rol
- ✅ Eliminar permisos/privilegios específicos
- ✅ Actualizar permisos/privilegios del rol

**Cómo eliminar todos los permisos:**
```json
PUT /api/gestion-roles/4
{
  "permisos": {}  // Objeto vacío = sin permisos
}
```

**Cómo eliminar permisos específicos:**
```json
PUT /api/gestion-roles/4
{
  "permisos": {
    "usuarios": {
      "leer": true,
      "crear": false,
      "actualizar": false,
      "eliminar": false
    }
    // Solo se incluyen los permisos que quieres mantener
    // Los que no se incluyen se eliminan
  }
}
```

**Cómo funciona:**
1. Se eliminan TODAS las relaciones existentes de permisos/privilegios
2. Se crean nuevas relaciones con los permisos/privilegios proporcionados
3. Si los arrays están vacíos, el rol queda sin permisos

---

## 🔒 Validaciones Implementadas

### **1. Eliminar Rol Básico**
- ❌ No se puede eliminar: `cliente`, `administrador`, `empleado`
- ✅ Razón: Son roles esenciales del sistema
- ✅ Mensaje de error descriptivo

### **2. Eliminar Rol con Usuarios Asignados**
- ❌ No se puede eliminar si hay usuarios usando el rol
- ✅ Verifica cantidad de usuarios asignados
- ✅ Mensaje de error con cantidad de usuarios
- ✅ Instrucciones para resolver el problema

### **3. Foreign Key Constraints**
- ✅ `rol_permisos_privilegios` tiene `ON DELETE CASCADE` para `id_rol`
- ✅ `usuarios` tiene `ON DELETE RESTRICT` para `id_rol`
- ✅ Las relaciones se eliminan automáticamente
- ✅ Los usuarios previenen la eliminación del rol

---

## 🔄 Flujo de Eliminación de Permisos

### **Cuando se Actualiza un Rol:**

1. **Validar datos:** Verificar que el rol existe
2. **Eliminar relaciones existentes:** `RolPermisoPrivilegio.destroy({ where: { id_rol } })`
3. **Crear nuevas relaciones:** Con los permisos/privilegios proporcionados
4. **Si arrays vacíos:** El rol queda sin permisos

### **Cuando se Elimina un Rol:**

1. **Validar rol básico:** No permitir eliminar roles básicos
2. **Validar usuarios:** Verificar que no hay usuarios usando el rol
3. **Eliminar relaciones:** Se eliminan automáticamente por `ON DELETE CASCADE`
4. **Eliminar rol:** `rol.destroy()`

---

## 📊 Rutas Actualizadas

### **Rutas con Permisos Granulares:**

| Endpoint | Método | Permiso Requerido | Estado |
|----------|--------|-------------------|--------|
| `/` | GET | `gestion_roles` + `leer` | ✅ Implementado |
| `/` | POST | `gestion_roles` + `crear` | ✅ Implementado |
| `/:id` | GET | `gestion_roles` + `leer` | ✅ Implementado |
| `/:id` | PUT | `gestion_roles` + `actualizar` | ✅ Implementado |
| `/:id/state` | PATCH | `gestion_roles` + `actualizar` | ✅ Implementado |
| `/:id` | DELETE | `gestion_roles` + `eliminar` | ✅ Implementado |

**Nota:** El administrador tiene bypass automático (no requiere permisos específicos).

---

## 🧪 Ejemplos de Uso

### **1. Editar Rol (Actualizar Permisos)**
```bash
PUT /api/gestion-roles/4
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "empleado_lector",
  "permisos": {
    "usuarios": {
      "leer": true,
      "crear": false,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "leer": true,
      "crear": false,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Empleado_lector",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "leer": true,
        "crear": false,
        "actualizar": false,
        "eliminar": false
      },
      "solicitudes": {
        "leer": true,
        "crear": false,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

---

### **2. Eliminar Todos los Permisos de un Rol**
```bash
PUT /api/gestion-roles/4
Authorization: Bearer <token>
Content-Type: application/json

{
  "permisos": {}  // Objeto vacío
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Empleado_lector",
    "estado": "Activo",
    "permisos": {
      // Todos los permisos en false
    }
  }
}
```

---

### **3. Eliminar Rol**
```bash
DELETE /api/gestion-roles/4
Authorization: Bearer <token>
```

**Respuesta (éxito):**
```json
{
  "success": true,
  "message": "Rol eliminado correctamente",
  "data": {
    "id_rol": 4,
    "nombre": "empleado_lector"
  }
}
```

**Respuesta (error - rol básico):**
```json
{
  "success": false,
  "error": "No se puede eliminar el rol \"administrador\" porque es un rol básico del sistema",
  "detalles": {
    "rol": "administrador",
    "roles_basicos": ["cliente", "administrador", "empleado"],
    "mensaje": "Los roles básicos (cliente, administrador, empleado) no pueden ser eliminados por seguridad del sistema."
  }
}
```

**Respuesta (error - usuarios asignados):**
```json
{
  "success": false,
  "error": "No se puede eliminar el rol \"empleado_lector\" porque está siendo usado por 5 usuario(s)",
  "detalles": {
    "rol": "empleado_lector",
    "id_rol": 4,
    "usuarios_asignados": 5,
    "mensaje": "Debes reasignar los usuarios a otro rol antes de eliminar este rol.",
    "accion_requerida": "Reasigna los usuarios a otro rol y luego intenta eliminar este rol nuevamente."
  }
}
```

---

## ✅ Respuestas a tus Preguntas

### **1. ¿Se puede editar un rol?**
**✅ SÍ** - Puedes editar:
- Nombre del rol
- Estado del rol (activo/inactivo)
- Permisos y privilegios del rol

**Endpoint:** `PUT /api/gestion-roles/:id`

---

### **2. ¿Se puede eliminar un rol?**
**✅ SÍ, con validaciones:**
- ✅ Se puede eliminar roles personalizados
- ❌ No se puede eliminar roles básicos (cliente, administrador, empleado)
- ❌ No se puede eliminar si hay usuarios usando el rol

**Endpoint:** `DELETE /api/gestion-roles/:id`

---

### **3. ¿Se puede eliminar los permisos y privilegios de un rol?**
**✅ SÍ** - De dos formas:

**Opción 1: Eliminar todos los permisos**
```json
PUT /api/gestion-roles/:id
{
  "permisos": {}  // Objeto vacío
}
```

**Opción 2: Eliminar permisos específicos**
```json
PUT /api/gestion-roles/:id
{
  "permisos": {
    "usuarios": {
      "leer": true
      // Solo incluir los permisos que quieres mantener
    }
  }
}
```

**Cómo funciona:**
- Se eliminan TODAS las relaciones existentes
- Se crean nuevas relaciones con los permisos proporcionados
- Si no se proporcionan permisos, el rol queda sin permisos

---

## 🔒 Seguridad

### **Permisos Requeridos:**
- ✅ **Leer roles:** `gestion_roles` + `leer`
- ✅ **Crear roles:** `gestion_roles` + `crear`
- ✅ **Actualizar roles:** `gestion_roles` + `actualizar`
- ✅ **Eliminar roles:** `gestion_roles` + `eliminar`

### **Bypass de Administrador:**
- ✅ El administrador tiene acceso total automáticamente
- ✅ No requiere permisos específicos

---

## 📝 Notas Importantes

1. **Roles Básicos:** Los roles básicos (cliente, administrador, empleado) no se pueden eliminar por seguridad
2. **Usuarios Asignados:** No se puede eliminar un rol si hay usuarios usando ese rol
3. **Relaciones:** Las relaciones de permisos/privilegios se eliminan automáticamente al eliminar un rol
4. **Actualización de Permisos:** Al actualizar permisos, se eliminan TODAS las relaciones existentes y se crean nuevas

---

**Documento creado:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Completado

