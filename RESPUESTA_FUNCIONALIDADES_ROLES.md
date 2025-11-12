# ✅ Respuesta: Funcionalidades de Roles

**Fecha:** Enero 2026  
**Estado:** ✅ **TODAS LAS FUNCIONALIDADES IMPLEMENTADAS**

---

## ✅ Respuestas a tus Preguntas

### **1. ¿Se puede editar un rol?**
**✅ SÍ** - Puedes editar:
- ✅ **Nombre del rol**
- ✅ **Estado del rol** (activo/inactivo)
- ✅ **Permisos y privilegios del rol**

**Endpoint:** `PUT /api/gestion-roles/:id`

**Ejemplo:**
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
    }
  }
}
```

---

### **2. ¿Se puede eliminar un rol?**
**✅ SÍ, con validaciones:**

**✅ Se puede eliminar:**
- Roles personalizados (no básicos)
- Roles sin usuarios asignados

**❌ NO se puede eliminar:**
- Roles básicos: `cliente`, `administrador`, `empleado`
- Roles con usuarios asignados

**Endpoint:** `DELETE /api/gestion-roles/:id`

**Validaciones implementadas:**
1. ✅ Verifica que el rol no sea un rol básico
2. ✅ Verifica que no haya usuarios usando el rol
3. ✅ Elimina automáticamente las relaciones de permisos/privilegios (ON DELETE CASCADE)

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

### **3. ¿Se puede eliminar los permisos y privilegios de un rol?**
**✅ SÍ** - De dos formas:

#### **Opción 1: Eliminar TODOS los permisos/privilegios**
```json
PUT /api/gestion-roles/4
{
  "permisos": {}  // Objeto vacío = sin permisos
}
```

**Cómo funciona:**
1. Se eliminan TODAS las relaciones existentes de permisos/privilegios
2. No se crean nuevas relaciones
3. El rol queda sin permisos

---

#### **Opción 2: Eliminar permisos/privilegios específicos**
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
1. Se eliminan TODAS las relaciones existentes
2. Se crean nuevas relaciones con los permisos proporcionados
3. Los permisos no incluidos se eliminan

---

## 🔄 Cómo Funciona la Eliminación de Permisos

### **Proceso en `updateRole`:**
1. **Recibe permisos del frontend** (formato granular)
2. **Transforma a formato API** (`transformPermisosToAPI`)
3. **Elimina todas las relaciones existentes** (`RolPermisoPrivilegio.destroy`)
4. **Crea nuevas relaciones** con los permisos proporcionados
5. **Si no se proporcionan permisos**, el rol queda sin permisos

### **Proceso en `deleteRole`:**
1. **Valida que no sea rol básico**
2. **Valida que no haya usuarios asignados**
3. **Elimina relaciones de permisos/privilegios** (explícitamente)
4. **Elimina el rol** (`rol.destroy()`)
5. **Las relaciones se eliminan automáticamente** por `ON DELETE CASCADE`

---

## 📊 Validaciones Implementadas

### **1. Eliminar Rol Básico**
```javascript
const rolesBasicos = ['cliente', 'administrador', 'empleado'];
if (rolesBasicos.includes(rol.nombre.toLowerCase())) {
  return res.status(400).json({ 
    error: 'No se puede eliminar el rol porque es un rol básico del sistema'
  });
}
```

### **2. Eliminar Rol con Usuarios Asignados**
```javascript
const usuariosConRol = await User.count({
  where: { id_rol: req.params.id }
});

if (usuariosConRol > 0) {
  return res.status(400).json({ 
    error: `No se puede eliminar el rol porque está siendo usado por ${usuariosConRol} usuario(s)`
  });
}
```

### **3. Foreign Key Constraints**
- ✅ `rol_permisos_privilegios` tiene `ON DELETE CASCADE` para `id_rol`
- ✅ `usuarios` tiene `ON DELETE RESTRICT` para `id_rol`
- ✅ Las relaciones se eliminan automáticamente al eliminar el rol
- ✅ Los usuarios previenen la eliminación del rol

---

## 🧪 Ejemplos de Uso

### **Ejemplo 1: Editar Rol (Actualizar Permisos)**
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

**Resultado:**
- ✅ El rol tiene `gestion_usuarios` + `leer`
- ✅ El rol tiene `gestion_solicitudes` + `leer`
- ✅ No tiene permisos de crear, actualizar ni eliminar

---

### **Ejemplo 2: Eliminar Todos los Permisos de un Rol**
```bash
PUT /api/gestion-roles/4
Authorization: Bearer <token>
Content-Type: application/json

{
  "permisos": {}  // Objeto vacío
}
```

**Resultado:**
- ✅ Se eliminan TODAS las relaciones de permisos/privilegios
- ✅ El rol queda sin permisos
- ✅ El rol sigue existiendo, pero sin permisos

---

### **Ejemplo 3: Eliminar Rol**
```bash
DELETE /api/gestion-roles/4
Authorization: Bearer <token>
```

**Resultado (éxito):**
- ✅ Se eliminan las relaciones de permisos/privilegios
- ✅ Se elimina el rol
- ✅ Las relaciones se eliminan automáticamente por `ON DELETE CASCADE`

**Resultado (error - rol básico):**
- ❌ Error 400: "No se puede eliminar el rol porque es un rol básico del sistema"

**Resultado (error - usuarios asignados):**
- ❌ Error 400: "No se puede eliminar el rol porque está siendo usado por X usuario(s)"

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
3. **Relaciones:** Las relaciones de permisos/privilegios se eliminan automáticamente al eliminar el rol
4. **Actualización de Permisos:** Al actualizar permisos, se eliminan TODAS las relaciones existentes y se crean nuevas
5. **Eliminar Permisos:** Para eliminar todos los permisos, envía un objeto vacío `{}` en `permisos`

---

## ✅ Resumen

| Funcionalidad | Estado | Endpoint | Validaciones |
|---------------|--------|----------|--------------|
| **Editar rol** | ✅ Implementado | `PUT /api/gestion-roles/:id` | - |
| **Eliminar rol** | ✅ Implementado | `DELETE /api/gestion-roles/:id` | Rol básico, usuarios asignados |
| **Eliminar permisos/privilegios** | ✅ Implementado | `PUT /api/gestion-roles/:id` | - |
| **Actualizar permisos/privilegios** | ✅ Implementado | `PUT /api/gestion-roles/:id` | - |

---

**Documento creado:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Todas las funcionalidades implementadas y funcionando

