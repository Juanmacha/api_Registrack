# 👤 Ejemplo Práctico: Empleado con Permisos Limitados

**Fecha:** Enero 2026  
**Versión:** 1.0

---

## 🎯 Objetivo

Demostrar cómo un empleado con un rol que solo tiene permiso para **ver usuarios** (leer) pero **NO crear usuarios**, no podrá crear usuarios después de implementar la solución propuesta.

---

## 📊 Escenario: Empleado con Permisos Limitados

### **Situación Actual (ANTES de la solución):**

#### **1. Rol "Empleado" con Permisos Limitados**

**Crear rol "empleado_lector" (solo lectura en usuarios):**
```json
POST /api/roles
{
  "nombre": "empleado_lector",
  "estado": true,
  "permisos": {
    "usuarios": {
      "crear": false,      // ← NO puede crear
      "leer": true,        // ← SÍ puede leer
      "actualizar": false, // ← NO puede actualizar
      "eliminar": false    // ← NO puede eliminar
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    }
  }
}
```

**Resultado en BD:**
- Permisos: `["gestion_usuarios", "gestion_solicitudes"]`
- Privilegios: `["leer", "crear", "actualizar"]` (pero solo para solicitudes)
- Relaciones en `rol_permisos_privilegios`:
  - `gestion_usuarios` + `leer` ✅
  - `gestion_solicitudes` + `crear` ✅
  - `gestion_solicitudes` + `leer` ✅
  - `gestion_solicitudes` + `actualizar` ✅
  - ❌ **NO tiene:** `gestion_usuarios` + `crear`

#### **2. Asignar Rol a Empleado**

```json
POST /api/usuarios
{
  "nombre": "Pedro",
  "apellido": "Martínez",
  "correo": "pedro.martinez@example.com",
  "id_rol": 6  // Rol "empleado_lector"
}
```

#### **3. Problema Actual: Empleado PUEDE Crear Usuarios (INCORRECTO)**

**Ruta Actual:**
```javascript
// src/routes/usuario.routes.js
router.post('/usuarios',
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),  // ← Solo valida nombre del rol
  createUsuario
);
```

**Request del Empleado:**
```bash
POST /api/usuarios
Authorization: Bearer TOKEN_EMPLEADO
Content-Type: application/json

{
  "nombre": "Nuevo Usuario",
  "apellido": "Test",
  "correo": "nuevo@example.com",
  "id_rol": 1
}
```

**Resultado Actual:**
- ✅ `roleMiddleware(["administrador", "empleado"])` verifica que el rol sea "administrador" o "empleado"
- ✅ El empleado tiene rol "empleado_lector" → **PERMITE el acceso** (si "empleado_lector" está en el array)
- ⚠️ **PERO:** El empleado NO tiene permiso `gestion_usuarios` + `crear`
- ❌ **PROBLEMA:** El sistema permite crear el usuario aunque no debería

---

## ✅ Solución: Con Validación de Permisos (DESPUÉS)

### **1. Modificar Ruta para Usar Validación de Permisos**

**Ruta Actualizada:**
```javascript
// src/routes/usuario.routes.js
import { checkPermiso } from '../middlewares/permiso.middleware.js';

// Crear usuario - requiere gestion_usuarios + crear
router.post('/usuarios',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'crear'),  // ← NUEVO: Valida permiso específico
  createUsuario
);

// Obtener usuarios - requiere gestion_usuarios + leer
router.get('/usuarios',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'leer'),  // ← NUEVO: Valida permiso específico
  getUsuarios
);
```

### **2. Flujo Completo con Validación**

#### **Escenario A: Empleado Intenta Crear Usuario (DENEGADO)**

**Request:**
```bash
POST /api/usuarios
Authorization: Bearer TOKEN_EMPLEADO
Content-Type: application/json

{
  "nombre": "Nuevo Usuario",
  "apellido": "Test",
  "correo": "nuevo@example.com",
  "id_rol": 1
}
```

**Flujo:**

1. **`authMiddleware` valida token y carga permisos:**
   ```javascript
   req.user = {
     id_usuario: 125,
     rol: "empleado_lector",
     id_rol: 6,
     permisos: ["gestion_usuarios", "gestion_solicitudes"],  // ← Cargados de BD
     privilegios: ["leer", "crear", "actualizar"]  // ← Pero "crear" solo para solicitudes
   }
   ```

2. **`checkPermiso('gestion_usuarios', 'crear')` valida:**
   ```javascript
   // ✅ Verifica que tenga permiso "gestion_usuarios"
   req.user.permisos.includes('gestion_usuarios')  // → true ✅
   
   // ❌ Verifica que tenga privilegio "crear" PARA "gestion_usuarios"
   // Pero el empleado solo tiene:
   // - gestion_usuarios + leer ✅
   // - gestion_solicitudes + crear ✅
   // - NO tiene: gestion_usuarios + crear ❌
   
   // La validación verifica si existe la combinación en la BD:
   // ¿Existe rol_permisos_privilegios con id_rol=6, permiso=gestion_usuarios, privilegio=crear?
   // → NO existe ❌
   ```

3. **Respuesta:**
   ```json
   {
     "success": false,
     "mensaje": "No tienes privilegio para crear en usuarios",
     "privilegio_requerido": "crear",
     "privilegios_disponibles": ["leer"],  // Solo para gestion_usuarios
     "permiso": "gestion_usuarios",
     "rol": "empleado_lector"
   }
   ```
   **Status:** `403 Forbidden`

#### **Escenario B: Empleado Intenta Leer Usuarios (PERMITIDO)**

**Request:**
```bash
GET /api/usuarios
Authorization: Bearer TOKEN_EMPLEADO
```

**Flujo:**

1. **`authMiddleware` carga permisos:**
   ```javascript
   req.user = {
     id_usuario: 125,
     rol: "empleado_lector",
     id_rol: 6,
     permisos: ["gestion_usuarios", "gestion_solicitudes"],
     privilegios: ["leer", "crear", "actualizar"]
   }
   ```

2. **`checkPermiso('gestion_usuarios', 'leer')` valida:**
   ```javascript
   // ✅ Verifica que tenga permiso "gestion_usuarios"
   req.user.permisos.includes('gestion_usuarios')  // → true ✅
   
   // ✅ Verifica que tenga privilegio "leer" PARA "gestion_usuarios"
   // El empleado tiene: gestion_usuarios + leer ✅
   ```

3. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "usuarios": [/* lista de usuarios */]
     }
   }
   ```
   **Status:** `200 OK`

#### **Escenario C: Empleado Intenta Crear Solicitud (PERMITIDO)**

**Request:**
```bash
POST /api/gestion-solicitudes/crear/1
Authorization: Bearer TOKEN_EMPLEADO
```

**Flujo:**

1. **`checkPermiso('gestion_solicitudes', 'crear')` valida:**
   ```javascript
   // ✅ Verifica que tenga permiso "gestion_solicitudes"
   req.user.permisos.includes('gestion_solicitudes')  // → true ✅
   
   // ✅ Verifica que tenga privilegio "crear" PARA "gestion_solicitudes"
   // El empleado tiene: gestion_solicitudes + crear ✅
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "solicitud": {/* solicitud creada */}
     }
   }
   ```
   **Status:** `201 Created`

---

## 🔍 Comparación: Antes vs Después

### **ANTES (Solo Validación por Rol):**

| Acción | Rol Requerido | Empleado con Rol "empleado_lector" | Resultado |
|--------|---------------|-----------------------------------|-----------|
| **Crear Usuario** | `["administrador", "empleado"]` | ✅ Tiene rol "empleado" | ❌ **PERMITE** (INCORRECTO) |
| **Leer Usuarios** | `["administrador", "empleado"]` | ✅ Tiene rol "empleado" | ✅ PERMITE |
| **Actualizar Usuario** | `["administrador", "empleado"]` | ✅ Tiene rol "empleado" | ❌ **PERMITE** (INCORRECTO) |
| **Eliminar Usuario** | `["administrador", "empleado"]` | ✅ Tiene rol "empleado" | ❌ **PERMITE** (INCORRECTO) |

**Problema:** Todos los empleados pueden hacer TODO, sin importar los permisos asignados al rol.

---

### **DESPUÉS (Validación por Permisos/Privilegios):**

| Acción | Permiso Requerido | Empleado con Rol "empleado_lector" | Resultado |
|--------|------------------|-----------------------------------|-----------|
| **Crear Usuario** | `gestion_usuarios` + `crear` | ❌ Solo tiene `leer` | ❌ **DENEGADO** (CORRECTO) |
| **Leer Usuarios** | `gestion_usuarios` + `leer` | ✅ Tiene `leer` | ✅ **PERMITIDO** |
| **Actualizar Usuario** | `gestion_usuarios` + `actualizar` | ❌ No tiene `actualizar` | ❌ **DENEGADO** (CORRECTO) |
| **Eliminar Usuario** | `gestion_usuarios` + `eliminar` | ❌ No tiene `eliminar` | ❌ **DENEGADO** (CORRECTO) |
| **Crear Solicitud** | `gestion_solicitudes` + `crear` | ✅ Tiene `crear` | ✅ **PERMITIDO** |
| **Leer Solicitudes** | `gestion_solicitudes` + `leer` | ✅ Tiene `leer` | ✅ **PERMITIDO** |
| **Actualizar Solicitud** | `gestion_solicitudes` + `actualizar` | ✅ Tiene `actualizar` | ✅ **PERMITIDO** |

**Resultado:** El empleado solo puede hacer las acciones para las que tiene permisos específicos.

---

## 🔧 Corrección Necesaria en la Validación

### **Problema Identificado:**

La validación actual en `checkPermiso` solo verifica si el usuario tiene el permiso y el privilegio por separado, pero **NO verifica la combinación específica** (permiso + privilegio) en la tabla intermedia.

**Ejemplo del Problema:**
- Usuario tiene: `gestion_usuarios` + `leer` ✅
- Usuario tiene: `gestion_solicitudes` + `crear` ✅
- Usuario intenta: `gestion_usuarios` + `crear` ❌
- **Validación actual:** Verifica si tiene `gestion_usuarios` (SÍ) y si tiene `crear` (SÍ) → **PERMITE** (INCORRECTO)

### **Solución: Validar Combinación Específica**

**Middleware Corregido:**
```javascript
// src/middlewares/permiso.middleware.js
import { RolPermisoPrivilegio } from '../models/index.js';

export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    // ✅ VERIFICAR COMBINACIÓN ESPECÍFICA en la tabla intermedia
    const tienePermisoEspecifico = await RolPermisoPrivilegio.findOne({
      where: {
        id_rol: req.user.id_rol
      },
      include: [
        {
          model: Permiso,
          as: 'permiso',
          where: { nombre: permiso }
        },
        {
          model: Privilegio,
          as: 'privilegio',
          where: { nombre: privilegio }
        }
      ]
    });

    if (!tienePermisoEspecifico) {
      return res.status(403).json({ 
        success: false,
        mensaje: `No tienes permiso para ${privilegio} en ${permiso.replace('gestion_', '')}`,
        permiso_requerido: permiso,
        privilegio_requerido: privilegio,
        rol: req.user.rol,
        id_rol: req.user.id_rol
      });
    }

    // ✅ Usuario tiene la combinación específica de permiso + privilegio
    next();
  };
};
```

**Mejor Solución: Usar los Permisos ya Cargados en req.user**

Como ya cargamos los permisos/privilegios en `req.user`, podemos validar directamente usando la información de la tabla intermedia que ya consultamos. Pero necesitamos una forma de verificar la combinación específica.

**Solución Optimizada:**
```javascript
// src/middlewares/permiso.middleware.js
export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    // Cargar el rol completo con las relaciones de permisos/privilegios
    const rol = await Role.findByPk(req.user.id_rol, {
      include: [
        {
          model: Permiso,
          as: 'permisos',
          where: { nombre: permiso },
          required: false,
          through: {
            attributes: []
          }
        },
        {
          model: Privilegio,
          as: 'privilegios',
          where: { nombre: privilegio },
          required: false,
          through: {
            attributes: []
          }
        }
      ]
    });

    // Verificar que el rol tenga el permiso específico
    const tienePermiso = rol.permisos && rol.permisos.length > 0;
    if (!tienePermiso) {
      return res.status(403).json({ 
        success: false,
        mensaje: `No tienes permiso para gestionar ${permiso.replace('gestion_', '')}`,
        permiso_requerido: permiso,
        rol: req.user.rol
      });
    }

    // Verificar que el rol tenga el privilegio específico
    const tienePrivilegio = rol.privilegios && rol.privilegios.length > 0;
    if (!tienePrivilegio) {
      return res.status(403).json({ 
        success: false,
        mensaje: `No tienes privilegio para ${privilegio} en ${permiso.replace('gestion_', '')}`,
        privilegio_requerido: privilegio,
        permiso: permiso,
        rol: req.user.rol
      });
    }

    // ✅ VERIFICAR COMBINACIÓN ESPECÍFICA: Buscar en tabla intermedia
    const tieneCombinacion = await RolPermisoPrivilegio.findOne({
      where: {
        id_rol: req.user.id_rol
      },
      include: [
        {
          model: Permiso,
          as: 'permiso',
          where: { nombre: permiso }
        },
        {
          model: Privilegio,
          as: 'privilegio',
          where: { nombre: privilegio }
        }
      ]
    });

    if (!tieneCombinacion) {
      return res.status(403).json({ 
        success: false,
        mensaje: `No tienes permiso para ${privilegio} en ${permiso.replace('gestion_', '')}`,
        permiso_requerido: permiso,
        privilegio_requerido: privilegio,
        rol: req.user.rol,
        detalles: "Aunque tienes el permiso y el privilegio por separado, no tienes esta combinación específica"
      });
    }

    // ✅ Usuario tiene la combinación específica de permiso + privilegio
    next();
  };
};
```

**Solución Más Eficiente: Consulta Directa a Tabla Intermedia**

```javascript
// src/middlewares/permiso.middleware.js
import { RolPermisoPrivilegio, Permiso, Privilegio } from '../models/index.js';
import { Op } from 'sequelize';

export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id_rol) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    // ✅ CONSULTAR DIRECTAMENTE la tabla intermedia con los nombres
    const relacion = await RolPermisoPrivilegio.findOne({
      where: {
        id_rol: req.user.id_rol
      },
      include: [
        {
          model: Permiso,
          as: 'permiso',
          where: { nombre: permiso },
          attributes: ['id_permiso', 'nombre']
        },
        {
          model: Privilegio,
          as: 'privilegio',
          where: { nombre: privilegio },
          attributes: ['id_privilegio', 'nombre']
        }
      ]
    });

    if (!relacion) {
      return res.status(403).json({ 
        success: false,
        mensaje: `No tienes permiso para ${privilegio} en ${permiso.replace('gestion_', '')}`,
        permiso_requerido: permiso,
        privilegio_requerido: privilegio,
        rol: req.user.rol,
        id_rol: req.user.id_rol,
        detalles: "Verifica que tu rol tenga esta combinación específica de permiso y privilegio asignada"
      });
    }

    // ✅ Usuario tiene la combinación específica de permiso + privilegio
    next();
  };
};
```

**Problema:** Las asociaciones en Sequelize pueden no estar configuradas correctamente para consultar la tabla intermedia de esta forma.

**Solución Final: Usar Consulta SQL Directa o Sequelize Raw Query**

```javascript
// src/middlewares/permiso.middleware.js
import { RolPermisoPrivilegio, Permiso, Privilegio, Role } from '../models/index.js';
import { Op } from 'sequelize';

export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id_rol) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    try {
      // ✅ Obtener IDs de permiso y privilegio
      const permisoObj = await Permiso.findOne({ where: { nombre: permiso } });
      const privilegioObj = await Privilegio.findOne({ where: { nombre: privilegio } });

      if (!permisoObj || !privilegioObj) {
        return res.status(500).json({ 
          success: false,
          mensaje: "Error en la configuración del sistema",
          detalles: `Permiso "${permiso}" o privilegio "${privilegio}" no encontrado en la base de datos`
        });
      }

      // ✅ Verificar combinación específica en tabla intermedia
      const tieneCombinacion = await RolPermisoPrivilegio.findOne({
        where: {
          id_rol: req.user.id_rol,
          id_permiso: permisoObj.id_permiso,
          id_privilegio: privilegioObj.id_privilegio
        }
      });

      if (!tieneCombinacion) {
        return res.status(403).json({ 
          success: false,
          mensaje: `No tienes permiso para ${privilegio} en ${permiso.replace('gestion_', '')}`,
          permiso_requerido: permiso,
          privilegio_requerido: privilegio,
          rol: req.user.rol,
          id_rol: req.user.id_rol,
          detalles: "Tu rol no tiene esta combinación específica de permiso y privilegio asignada. Contacta al administrador para obtener los permisos necesarios."
        });
      }

      // ✅ Usuario tiene la combinación específica de permiso + privilegio
      next();
    } catch (error) {
      console.error('Error al verificar permiso:', error);
      return res.status(500).json({ 
        success: false,
        mensaje: "Error al verificar permisos",
        detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};
```

---

## 📝 Resumen

### **Respuesta a tu Pregunta:**

**✅ SÍ, con la solución propuesta, un empleado con un rol que solo tiene permiso para VER usuarios (leer) pero NO crear, YA NO PODRÁ crear usuarios.**

### **Cómo Funciona:**

1. **Crear rol con permisos limitados:**
   - Rol "empleado_lector" con `gestion_usuarios` + `leer` solamente
   - ❌ NO tiene `gestion_usuarios` + `crear`

2. **Asignar rol a empleado:**
   - Empleado tiene `id_rol = 6` (rol "empleado_lector")

3. **Empleado intenta crear usuario:**
   - `checkPermiso('gestion_usuarios', 'crear')` verifica en la tabla intermedia
   - Busca: `id_rol=6, permiso=gestion_usuarios, privilegio=crear`
   - ❌ No encuentra la combinación → **DENEGADO**

4. **Empleado intenta leer usuarios:**
   - `checkPermiso('gestion_usuarios', 'leer')` verifica en la tabla intermedia
   - Busca: `id_rol=6, permiso=gestion_usuarios, privilegio=leer`
   - ✅ Encuentra la combinación → **PERMITIDO**

### **Ventajas:**

- ✅ Control granular de permisos
- ✅ Cada rol puede tener permisos diferentes
- ✅ Los empleados solo pueden hacer lo que su rol permite
- ✅ Seguridad mejorada
- ✅ Flexibilidad para crear roles personalizados

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

