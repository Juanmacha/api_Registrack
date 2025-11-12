# 🔐 Guía Completa: Sistema de Roles, Permisos y Privilegios

**Fecha:** Enero 2026  
**Versión:** 1.0

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura del Sistema](#estructura-del-sistema)
3. [Cómo Crear un Rol con Permisos y Privilegios](#cómo-crear-un-rol-con-permisos-y-privilegios)
4. [Cómo Asignar un Rol a un Usuario](#cómo-asignar-un-rol-a-un-usuario)
5. [Estado Actual del Sistema](#estado-actual-del-sistema)
6. [Problema Identificado](#problema-identificado)
7. [Solución Propuesta](#solución-propuesta)
8. [Implementación Completa](#implementación-completa)

---

## 🎯 Resumen Ejecutivo

### **Estado Actual:**
- ✅ **Base de datos:** Sistema completo de roles, permisos y privilegios implementado
- ✅ **Creación de roles:** Se pueden crear roles con permisos y privilegios
- ✅ **Asignación de roles:** Los usuarios pueden tener roles asignados
- ⚠️ **Validación:** Solo se valida el nombre del rol, NO se validan permisos/privilegios específicos
- ❌ **Token JWT:** Solo incluye el nombre del rol, NO incluye permisos ni privilegios

### **Problema Principal:**
**Los permisos y privilegios asignados a un rol NO se están validando en las rutas.** El sistema actual solo verifica el nombre del rol (ej: "administrador", "empleado", "cliente"), pero no valida si el rol tiene permisos específicos como `gestion_usuarios` o privilegios como `crear`, `leer`, `actualizar`, `eliminar`.

---

## 🏗️ Estructura del Sistema

### **1. Tablas de Base de Datos**

#### **Tabla: `roles`**
```sql
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    estado BOOLEAN DEFAULT TRUE
);
```

#### **Tabla: `permisos`**
```sql
CREATE TABLE permisos (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);
```

**Ejemplos de permisos:**
- `gestion_usuarios`
- `gestion_empleados`
- `gestion_clientes`
- `gestion_solicitudes`
- `gestion_citas`
- `gestion_pagos`
- `gestion_roles`
- etc.

#### **Tabla: `privilegios`**
```sql
CREATE TABLE privilegios (
    id_privilegio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);
```

**Ejemplos de privilegios:**
- `crear`
- `leer`
- `actualizar`
- `eliminar`

#### **Tabla Intermedia: `rol_permisos_privilegios`**
```sql
CREATE TABLE rol_permisos_privilegios (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    id_privilegio INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_rol, id_permiso, id_privilegio),
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
    FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso),
    FOREIGN KEY (id_privilegio) REFERENCES privilegios(id_privilegio)
);
```

**Relación:** Un rol puede tener múltiples combinaciones de (permiso, privilegio).

**Ejemplo:**
- Rol "Editor" tiene:
  - `gestion_usuarios` + `leer`
  - `gestion_usuarios` + `actualizar`
  - `gestion_solicitudes` + `crear`
  - `gestion_solicitudes` + `leer`

---

## 📝 Cómo Crear un Rol con Permisos y Privilegios

### **Paso 1: Crear el Rol**

**Endpoint:** `POST /api/roles`

**Request:**
```json
{
  "nombre": "editor",
  "estado": true,
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
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**Proceso Interno:**

1. **Transformación de Permisos:**
   ```javascript
   // Frontend envía:
   {
     "usuarios": { "leer": true, "actualizar": true },
     "solicitudes": { "crear": true, "leer": true, "actualizar": true }
   }
   
   // Se transforma a:
   {
     permisos: ["gestion_usuarios", "gestion_solicitudes"],
     privilegios: ["crear", "leer", "actualizar"]
   }
   ```

2. **Creación en Base de Datos:**
   ```javascript
   // 1. Crear el rol
   const nuevoRol = await Role.create({ nombre: "editor" });
   
   // 2. Crear o buscar permisos
   const permisoUsuarios = await Permiso.findOrCreate({ 
     where: { nombre: "gestion_usuarios" } 
   });
   const permisoSolicitudes = await Permiso.findOrCreate({ 
     where: { nombre: "gestion_solicitudes" } 
   });
   
   // 3. Crear o buscar privilegios
   const privilegioCrear = await Privilegio.findOrCreate({ 
     where: { nombre: "crear" } 
   });
   const privilegioLeer = await Privilegio.findOrCreate({ 
     where: { nombre: "leer" } 
   });
   const privilegioActualizar = await Privilegio.findOrCreate({ 
     where: { nombre: "actualizar" } 
   });
   
   // 4. Crear relaciones en tabla intermedia
   // Para gestion_usuarios: leer y actualizar
   await RolPermisoPrivilegio.create({
     id_rol: nuevoRol.id_rol,
     id_permiso: permisoUsuarios[0].id_permiso,
     id_privilegio: privilegioLeer[0].id_privilegio
   });
   await RolPermisoPrivilegio.create({
     id_rol: nuevoRol.id_rol,
     id_permiso: permisoUsuarios[0].id_permiso,
     id_privilegio: privilegioActualizar[0].id_privilegio
   });
   
   // Para gestion_solicitudes: crear, leer y actualizar
   await RolPermisoPrivilegio.create({
     id_rol: nuevoRol.id_rol,
     id_permiso: permisoSolicitudes[0].id_permiso,
     id_privilegio: privilegioCrear[0].id_privilegio
   });
   await RolPermisoPrivilegio.create({
     id_rol: nuevoRol.id_rol,
     id_permiso: permisoSolicitudes[0].id_permiso,
     id_privilegio: privilegioLeer[0].id_privilegio
   });
   await RolPermisoPrivilegio.create({
     id_rol: nuevoRol.id_rol,
     id_permiso: permisoSolicitudes[0].id_permiso,
     id_privilegio: privilegioActualizar[0].id_privilegio
   });
   ```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "4",
    "nombre": "Editor",
    "estado": "Activo",
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
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

---

## 👤 Cómo Asignar un Rol a un Usuario

### **Paso 1: Crear o Actualizar Usuario con Rol**

**Endpoint:** `POST /api/usuarios` (crear) o `PUT /api/usuarios/:id` (actualizar)

**Request:**
```json
{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@example.com",
  "telefono": "3001234567",
  "contrasena": "Password123!",
  "id_rol": 4  // ← ID del rol "editor" creado anteriormente
}
```

**Proceso:**
```javascript
// El usuario se crea con id_rol = 4
const nuevoUsuario = await User.create({
  // ... otros campos ...
  id_rol: 4  // Rol "editor"
});
```

**Resultado:**
- ✅ Usuario creado con `id_rol = 4`
- ✅ El usuario tiene el rol "editor" asignado
- ⚠️ **PERO:** Los permisos y privilegios del rol NO se validan automáticamente

---

## ⚠️ Estado Actual del Sistema

### **1. Validación Actual (Solo por Rol)**

**Middleware:** `roleMiddleware` en `src/middlewares/role.middleware.js`

```javascript
export const roleMiddleware = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.some(r => r.toLowerCase() === req.user.rol.toLowerCase())) {
      return res.status(403).json({ mensaje: "No tienes permisos" });
    }
    next();
  };
};
```

**Uso en Rutas:**
```javascript
// Solo valida el nombre del rol
router.post('/usuarios', 
  authMiddleware, 
  roleMiddleware(["administrador", "empleado"]),  // ← Solo valida nombre del rol
  createUsuario
);
```

**Problema:**
- ❌ No valida permisos específicos (ej: `gestion_usuarios`)
- ❌ No valida privilegios específicos (ej: `crear`, `leer`, `actualizar`, `eliminar`)
- ❌ Todos los usuarios con el mismo rol tienen los mismos permisos (no se respetan los permisos/privilegios del rol)

### **2. Token JWT Actual**

**Generación del Token:**
```javascript
// src/services/auth.services.js
const token = jwt.sign(
  {
    id_usuario: usuario.id_usuario,
    rol: rolUsuario  // ← Solo incluye el nombre del rol
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
```

**Problema:**
- ❌ El token NO incluye permisos ni privilegios
- ❌ Solo incluye `id_usuario` y `rol` (nombre del rol)
- ❌ No se puede validar permisos/privilegios sin consultar la base de datos

### **3. Flujo Actual**

```
1. Usuario hace login
   ↓
2. Se genera token JWT con { id_usuario, rol }
   ↓
3. Usuario hace request con token
   ↓
4. authMiddleware valida token y carga req.user = { id_usuario, rol }
   ↓
5. roleMiddleware valida que req.user.rol esté en rolesPermitidos
   ↓
6. ❌ NO se validan permisos/privilegios específicos
```

---

## 🔍 Problema Identificado

### **Escenario de Prueba:**

1. **Crear rol "Editor" con permisos limitados:**
   ```json
   {
     "nombre": "editor",
     "permisos": {
       "usuarios": { "leer": true, "actualizar": true },
       "solicitudes": { "crear": true, "leer": true }
     }
   }
   ```

2. **Asignar rol a usuario:**
   ```json
   {
     "nombre": "Juan Pérez",
     "id_rol": 4  // Rol "editor"
   }
   ```

3. **Usuario intenta crear un usuario:**
   ```bash
   POST /api/usuarios
   Authorization: Bearer TOKEN
   ```

4. **Resultado Actual:**
   - ✅ `roleMiddleware(["administrador", "empleado", "editor"])` permite el acceso
   - ❌ **PERO:** El rol "editor" NO tiene permiso `gestion_usuarios` + `crear`
   - ❌ **El sistema permite la acción aunque no debería**

### **Problema:**
**Los permisos y privilegios asignados al rol NO se están validando en las rutas.**

---

## ✅ Solución Propuesta

### **Opción 1: Cargar Permisos/Privilegios en el Middleware de Autenticación (RECOMENDADO)**

**Ventajas:**
- ✅ Permisos disponibles en `req.user` para todas las rutas
- ✅ No requiere modificar el token JWT
- ✅ Permisos siempre actualizados (se cargan de la BD en cada request)

**Implementación:**

#### **1. Modificar `authMiddleware` para cargar permisos/privilegios:**

```javascript
// src/middlewares/auth.middleware.js
import jwt from 'jsonwebtoken';
import { Role, Permiso, Privilegio } from '../models/index.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ CARGAR ROL CON PERMISOS Y PRIVILEGIOS
    const rol = await Role.findByPk(decoded.id_rol || decoded.rol_id, {
      include: [
        { 
          model: Permiso, 
          as: 'permisos', 
          attributes: ['id_permiso', 'nombre'],
          through: { attributes: [] }
        },
        { 
          model: Privilegio, 
          as: 'privilegios', 
          attributes: ['id_privilegio', 'nombre'],
          through: { attributes: [] }
        }
      ]
    });

    if (!rol) {
      return res.status(401).json({ mensaje: 'Rol no encontrado' });
    }

    // ✅ EXTRAER NOMBRES DE PERMISOS Y PRIVILEGIOS
    const permisos = rol.permisos ? rol.permisos.map(p => p.nombre) : [];
    const privilegios = rol.privilegios ? rol.privilegios.map(p => p.nombre) : [];

    // ✅ AGREGAR A req.user
    req.user = {
      id_usuario: decoded.id_usuario,
      rol: rol.nombre,
      id_rol: rol.id_rol,
      permisos: permisos,        // ← NUEVO
      privilegios: privilegios   // ← NUEVO
    };

    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};
```

**Problema:** El token JWT actual no incluye `id_rol`, solo `rol` (nombre). Necesitamos modificar el login para incluir `id_rol`:

```javascript
// src/services/auth.services.js - Modificar loginUser
// El usuario ya tiene id_rol en el modelo, y el rol se carga con include
const idRol = usuario.id_rol || (usuario.rol ? usuario.rol.id_rol : null);

const token = jwt.sign(
  {
    id_usuario: usuario.id_usuario,
    rol: rolUsuario,
    id_rol: idRol  // ← AGREGAR id_rol (disponible en usuario.id_rol)
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
```

#### **2. Crear Middleware de Validación de Permisos:**

```javascript
// src/middlewares/permiso.middleware.js
/**
 * Middleware para validar permisos y privilegios específicos
 * @param {string} permiso - Nombre del permiso requerido (ej: "gestion_usuarios")
 * @param {string} privilegio - Nombre del privilegio requerido (ej: "crear", "leer", "actualizar", "eliminar")
 * @returns {Function} Middleware function
 */
export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    // Verificar que el usuario tenga permisos
    if (!req.user.permisos || !Array.isArray(req.user.permisos)) {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes permisos asignados" 
      });
    }

    // Verificar que el usuario tenga el permiso requerido
    if (!req.user.permisos.includes(permiso)) {
      return res.status(403).json({ 
        success: false,
        mensaje: `No tienes permiso para gestionar ${permiso.replace('gestion_', '')}`,
        permiso_requerido: permiso,
        permisos_disponibles: req.user.permisos
      });
    }

    // Verificar que el usuario tenga el privilegio requerido
    if (!req.user.privilegios || !Array.isArray(req.user.privilegios)) {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes privilegios asignados" 
      });
    }

    if (!req.user.privilegios.includes(privilegio)) {
      return res.status(403).json({ 
        success: false,
        mensaje: `No tienes privilegio para ${privilegio} en ${permiso.replace('gestion_', '')}`,
        privilegio_requerido: privilegio,
        privilegios_disponibles: req.user.privilegios
      });
    }

    // ✅ Usuario tiene el permiso y privilegio requeridos
    next();
  };
};
```

#### **3. Usar el Middleware en las Rutas:**

```javascript
// src/routes/usuarios.routes.js
import { checkPermiso } from '../middlewares/permiso.middleware.js';

// Crear usuario - requiere gestion_usuarios + crear
router.post('/usuarios',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'crear'),  // ← NUEVO
  createUsuario
);

// Obtener usuarios - requiere gestion_usuarios + leer
router.get('/usuarios',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'leer'),  // ← NUEVO
  getUsuarios
);

// Actualizar usuario - requiere gestion_usuarios + actualizar
router.put('/usuarios/:id',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'actualizar'),  // ← NUEVO
  updateUsuario
);

// Eliminar usuario - requiere gestion_usuarios + eliminar
router.delete('/usuarios/:id',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'eliminar'),  // ← NUEVO
  deleteUsuario
);
```

---

### **Opción 2: Incluir Permisos/Privilegios en el Token JWT (NO RECOMENDADO)**

**Desventajas:**
- ❌ Token más grande
- ❌ Permisos desactualizados si se modifican después del login
- ❌ Requiere re-login para actualizar permisos

**Implementación:**
```javascript
// Modificar loginUser para incluir permisos/privilegios en el token
const rolCompleto = await Role.findByPk(usuario.id_rol, {
  include: [
    { model: Permiso, as: 'permisos' },
    { model: Privilegio, as: 'privilegios' }
  ]
});

const token = jwt.sign(
  {
    id_usuario: usuario.id_usuario,
    rol: rolUsuario,
    id_rol: usuario.id_rol,
    permisos: rolCompleto.permisos.map(p => p.nombre),
    privilegios: rolCompleto.privilegios.map(p => p.nombre)
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
```

---

## 🚀 Implementación Completa

### **Paso 1: Modificar Login para Incluir `id_rol` en Token**

**Archivo:** `src/services/auth.services.js`

```javascript
// Modificar la función loginUser
export const loginUser = async (correo, contrasena) => {
  const usuario = await findUserByEmail(correo);
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordValida) {
    throw new Error("Contraseña incorrecta");
  }

  const rolUsuario = usuario.rol ? usuario.rol.nombre : null;
  // El id_rol está disponible directamente en usuario.id_rol (campo del modelo)
  const idRol = usuario.id_rol || (usuario.rol ? usuario.rol.id_rol : null);

  // ✅ AGREGAR id_rol al token
  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      rol: rolUsuario,
      id_rol: idRol  // ← NUEVO (disponible en usuario.id_rol)
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const { contrasena: _, ...usuarioSinPass } = usuario.toJSON();
  return { usuario: usuarioSinPass, token };
};
```

### **Paso 2: Modificar `authMiddleware` para Cargar Permisos/Privilegios**

**Archivo:** `src/middlewares/auth.middleware.js`

```javascript
import jwt from 'jsonwebtoken';
import { Role, Permiso, Privilegio } from '../models/index.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ CARGAR ROL CON PERMISOS Y PRIVILEGIOS
    const idRol = decoded.id_rol;
    if (!idRol) {
      return res.status(401).json({ mensaje: 'Token inválido: falta id_rol' });
    }

    const rol = await Role.findByPk(idRol, {
      include: [
        { 
          model: Permiso, 
          as: 'permisos', 
          attributes: ['id_permiso', 'nombre'],
          through: { attributes: [] }
        },
        { 
          model: Privilegio, 
          as: 'privilegios', 
          attributes: ['id_privilegio', 'nombre'],
          through: { attributes: [] }
        }
      ]
    });

    if (!rol) {
      return res.status(401).json({ mensaje: 'Rol no encontrado' });
    }

    // ✅ EXTRAER NOMBRES DE PERMISOS Y PRIVILEGIOS
    const permisos = rol.permisos ? rol.permisos.map(p => p.nombre) : [];
    const privilegios = rol.privilegios ? rol.privilegios.map(p => p.nombre) : [];

    // ✅ AGREGAR A req.user
    req.user = {
      id_usuario: decoded.id_usuario,
      rol: rol.nombre,
      id_rol: rol.id_rol,
      permisos: permisos,
      privilegios: privilegios
    };

    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};
```

### **Paso 3: Crear Middleware de Validación de Permisos**

**Archivo:** `src/middlewares/permiso.middleware.js` (NUEVO)

```javascript
import { RolPermisoPrivilegio, Permiso, Privilegio } from '../models/index.js';

/**
 * Middleware para validar permisos y privilegios específicos
 * IMPORTANTE: Valida la COMBINACIÓN ESPECÍFICA de permiso + privilegio en la tabla intermedia
 * @param {string} permiso - Nombre del permiso requerido (ej: "gestion_usuarios")
 * @param {string} privilegio - Nombre del privilegio requerido (ej: "crear", "leer", "actualizar", "eliminar")
 * @returns {Function} Middleware function
 */
export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    // Verificar que el usuario esté autenticado
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

      // ✅ VERIFICAR COMBINACIÓN ESPECÍFICA: Buscar en tabla intermedia
      // Esto verifica que el rol tenga EXACTAMENTE esta combinación de permiso + privilegio
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

/**
 * Middleware para validar múltiples permisos (OR lógico)
 * El usuario debe tener al menos uno de los permisos especificados
 * @param {Array<{permiso: string, privilegio: string}>} permisosRequeridos - Array de objetos {permiso, privilegio}
 * @returns {Function} Middleware function
 */
export const checkPermisoMultiple = (permisosRequeridos) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        mensaje: "Usuario no autenticado" 
      });
    }

    // Verificar que el usuario tenga al menos uno de los permisos requeridos
    const tienePermiso = permisosRequeridos.some(({ permiso, privilegio }) => {
      return req.user.permisos?.includes(permiso) && 
             req.user.privilegios?.includes(privilegio);
    });

    if (!tienePermiso) {
      return res.status(403).json({ 
        success: false,
        mensaje: "No tienes los permisos necesarios para realizar esta acción",
        permisos_requeridos: permisosRequeridos,
        permisos_disponibles: req.user.permisos,
        privilegios_disponibles: req.user.privilegios,
        rol: req.user.rol
      });
    }

    next();
  };
};
```

### **Paso 4: Actualizar Rutas para Usar Validación de Permisos**

**Ejemplo: `src/routes/usuarios.routes.js`**

```javascript
import { Router } from 'express';
import { 
  createUsuario, 
  getUsuarios, 
  getUsuarioById, 
  updateUsuario, 
  deleteUsuario 
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkPermiso } from '../middlewares/permiso.middleware.js';

const router = Router();

// Crear usuario - requiere gestion_usuarios + crear
router.post('/',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'crear'),
  createUsuario
);

// Obtener todos los usuarios - requiere gestion_usuarios + leer
router.get('/',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'leer'),
  getUsuarios
);

// Obtener usuario por ID - requiere gestion_usuarios + leer
router.get('/:id',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'leer'),
  getUsuarioById
);

// Actualizar usuario - requiere gestion_usuarios + actualizar
router.put('/:id',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'actualizar'),
  updateUsuario
);

// Eliminar usuario - requiere gestion_usuarios + eliminar
router.delete('/:id',
  authMiddleware,
  checkPermiso('gestion_usuarios', 'eliminar'),
  deleteUsuario
);

export default router;
```

---

## 📊 Flujo Completo Funcionando

### **Escenario: Usuario con Rol "Editor"**

1. **Crear Rol "Editor":**
   ```json
   POST /api/roles
   {
     "nombre": "editor",
     "permisos": {
       "usuarios": { "leer": true, "actualizar": true },
       "solicitudes": { "crear": true, "leer": true, "actualizar": true }
     }
   }
   ```
   **Resultado:** Rol creado con:
   - Permisos: `["gestion_usuarios", "gestion_solicitudes"]`
   - Privilegios: `["leer", "actualizar", "crear"]`
   - Relaciones en `rol_permisos_privilegios`:
     - `gestion_usuarios` + `leer`
     - `gestion_usuarios` + `actualizar`
     - `gestion_solicitudes` + `crear`
     - `gestion_solicitudes` + `leer`
     - `gestion_solicitudes` + `actualizar`

2. **Asignar Rol a Usuario:**
   ```json
   POST /api/usuarios
   {
     "nombre": "Juan Pérez",
     "id_rol": 4  // Rol "editor"
   }
   ```
   **Resultado:** Usuario creado con `id_rol = 4`

3. **Usuario Hace Login:**
   ```json
   POST /api/auth/login
   {
     "correo": "juan.perez@example.com",
     "contrasena": "Password123!"
   }
   ```
   **Token Generado:**
   ```json
   {
     "id_usuario": 123,
     "rol": "editor",
     "id_rol": 4  // ← Incluido en el token
   }
   ```

4. **Usuario Intenta Crear Usuario:**
   ```bash
   POST /api/usuarios
   Authorization: Bearer TOKEN
   ```
   **Flujo:**
   - ✅ `authMiddleware` valida token y carga permisos/privilegios
   - ✅ `req.user` = `{ id_usuario: 123, rol: "editor", permisos: ["gestion_usuarios", "gestion_solicitudes"], privilegios: ["leer", "actualizar", "crear"] }`
   - ✅ `checkPermiso('gestion_usuarios', 'crear')` verifica:
     - ✅ Tiene permiso `gestion_usuarios`? → SÍ
     - ✅ Tiene privilegio `crear`? → ❌ NO (solo tiene `leer`, `actualizar`, `crear` para `gestion_solicitudes`)
   - ❌ **Respuesta:** `403 - No tienes privilegio para crear en usuarios`

5. **Usuario Intenta Leer Usuarios:**
   ```bash
   GET /api/usuarios
   Authorization: Bearer TOKEN
   ```
   **Flujo:**
   - ✅ `checkPermiso('gestion_usuarios', 'leer')` verifica:
     - ✅ Tiene permiso `gestion_usuarios`? → SÍ
     - ✅ Tiene privilegio `leer`? → SÍ
   - ✅ **Respuesta:** `200 - Lista de usuarios`

6. **Usuario Intenta Crear Solicitud:**
   ```bash
   POST /api/gestion-solicitudes/crear/1
   Authorization: Bearer TOKEN
   ```
   **Flujo:**
   - ✅ `checkPermiso('gestion_solicitudes', 'crear')` verifica:
     - ✅ Tiene permiso `gestion_solicitudes`? → SÍ
     - ✅ Tiene privilegio `crear`? → SÍ
   - ✅ **Respuesta:** `201 - Solicitud creada`

---

## 🔧 Archivos a Modificar/Crear

### **Archivos a Modificar:**

1. **`src/services/auth.services.js`**
   - Agregar `id_rol` al token JWT en `loginUser`

2. **`src/middlewares/auth.middleware.js`**
   - Cargar rol con permisos y privilegios
   - Agregar `permisos` y `privilegios` a `req.user`

### **Archivos a Crear:**

3. **`src/middlewares/permiso.middleware.js`** (NUEVO)
   - Función `checkPermiso(permiso, privilegio)`
   - Función `checkPermisoMultiple(permisosRequeridos)`

### **Archivos a Actualizar (Opcional):**

4. **Rutas que requieren validación de permisos:**
   - `src/routes/usuarios.routes.js`
   - `src/routes/empleado.routes.js`
   - `src/routes/cliente.routes.js`
   - `src/routes/solicitudes.routes.js`
   - `src/routes/citas.routes.js`
   - `src/routes/pago.routes.js`
   - etc.

---

## 👤 Ejemplo Práctico: Empleado con Permisos Limitados

### **Escenario: Empleado que Solo Puede VER Usuarios, NO Crear**

#### **Paso 1: Crear Rol "empleado_lector" con Permisos Limitados**

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

**Resultado en Base de Datos:**
- **Permisos creados:** `["gestion_usuarios", "gestion_solicitudes"]`
- **Privilegios creados:** `["leer", "crear", "actualizar"]`
- **Relaciones en `rol_permisos_privilegios`:**
  - ✅ `id_rol=6, id_permiso=gestion_usuarios, id_privilegio=leer`
  - ❌ **NO tiene:** `id_rol=6, id_permiso=gestion_usuarios, id_privilegio=crear`
  - ✅ `id_rol=6, id_permiso=gestion_solicitudes, id_privilegio=crear`
  - ✅ `id_rol=6, id_permiso=gestion_solicitudes, id_privilegio=leer`
  - ✅ `id_rol=6, id_permiso=gestion_solicitudes, id_privilegio=actualizar`

#### **Paso 2: Asignar Rol a Empleado**

```json
POST /api/usuarios/crear
{
  "nombre": "Pedro",
  "apellido": "Martínez",
  "correo": "pedro.martinez@example.com",
  "id_rol": 6  // Rol "empleado_lector"
}
```

#### **Paso 3: Empleado Hace Login**

```json
POST /api/auth/login
{
  "correo": "pedro.martinez@example.com",
  "contrasena": "Password123!"
}
```

**Token Generado:**
```json
{
  "id_usuario": 125,
  "rol": "empleado_lector",
  "id_rol": 6
}
```

#### **Paso 4: Empleado Intenta Crear Usuario (DENEGADO)**

**Request:**
```bash
POST /api/usuarios
Authorization: Bearer TOKEN_EMPLEADO
Content-Type: application/json

{
  "nombre": "Nuevo Usuario",
  "correo": "nuevo@example.com",
  "id_rol": 1
}
```

**Flujo de Validación:**

1. **`authMiddleware` carga permisos/privilegios:**
   ```javascript
   // Consulta a BD:
   const rol = await Role.findByPk(6, {
     include: [
       { model: Permiso, as: 'permisos' },
       { model: Privilegio, as: 'privilegios' }
     ]
   });
   
   // Resultado:
   req.user = {
     id_usuario: 125,
     rol: "empleado_lector",
     id_rol: 6,
     permisos: ["gestion_usuarios", "gestion_solicitudes"],
     privilegios: ["leer", "crear", "actualizar"]  // Pero "crear" solo para solicitudes
   }
   ```

2. **`checkPermiso('gestion_usuarios', 'crear')` valida:**
   ```javascript
   // 1. Obtener IDs
   const permisoObj = await Permiso.findOne({ where: { nombre: 'gestion_usuarios' } });
   // permisoObj.id_permiso = 1
   
   const privilegioObj = await Privilegio.findOne({ where: { nombre: 'crear' } });
   // privilegioObj.id_privilegio = 1
   
   // 2. Buscar combinación específica en tabla intermedia
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 6,
       id_permiso: 1,      // gestion_usuarios
       id_privilegio: 1    // crear
     }
   });
   
   // Resultado: null (NO existe esta combinación)
   // ❌ El empleado NO tiene: gestion_usuarios + crear
   ```

3. **Respuesta:**
   ```json
   {
     "success": false,
     "mensaje": "No tienes permiso para crear en usuarios",
     "permiso_requerido": "gestion_usuarios",
     "privilegio_requerido": "crear",
     "rol": "empleado_lector",
     "id_rol": 6,
     "detalles": "Tu rol no tiene esta combinación específica de permiso y privilegio asignada. Contacta al administrador para obtener los permisos necesarios."
   }
   ```
   **Status:** `403 Forbidden`

#### **Paso 5: Empleado Intenta Leer Usuarios (PERMITIDO)**

**Request:**
```bash
GET /api/usuarios
Authorization: Bearer TOKEN_EMPLEADO
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_usuarios', 'leer')` valida:**
   ```javascript
   // Buscar combinación específica
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 6,
       id_permiso: 1,      // gestion_usuarios
       id_privilegio: 2    // leer
     }
   });
   
   // Resultado: { id_rol: 6, id_permiso: 1, id_privilegio: 2 }
   // ✅ El empleado SÍ tiene: gestion_usuarios + leer
   ```

2. **Respuesta:**
   ```json
   {
     "success": true,
     "data": {
       "usuarios": [/* lista de usuarios */]
     }
   }
   ```
   **Status:** `200 OK`

#### **Paso 6: Empleado Intenta Crear Solicitud (PERMITIDO)**

**Request:**
```bash
POST /api/gestion-solicitudes/crear/1
Authorization: Bearer TOKEN_EMPLEADO
```

**Flujo de Validación:**

1. **`checkPermiso('gestion_solicitudes', 'crear')` valida:**
   ```javascript
   // Buscar combinación específica
   const tieneCombinacion = await RolPermisoPrivilegio.findOne({
     where: {
       id_rol: 6,
       id_permiso: 2,      // gestion_solicitudes
       id_privilegio: 1    // crear
     }
   });
   
   // Resultado: { id_rol: 6, id_permiso: 2, id_privilegio: 1 }
   // ✅ El empleado SÍ tiene: gestion_solicitudes + crear
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

## 📊 Comparación: Antes vs Después

### **ANTES (Solo Validación por Rol):**

| Acción | Ruta | Validación Actual | Resultado para Empleado |
|--------|------|-------------------|------------------------|
| **Crear Usuario** | `POST /api/usuarios` | `roleMiddleware(["administrador", "empleado"])` | ❌ **PERMITE** (INCORRECTO) |
| **Leer Usuarios** | `GET /api/usuarios` | `roleMiddleware(["administrador", "empleado"])` | ✅ PERMITE |
| **Actualizar Usuario** | `PUT /api/usuarios/:id` | `roleMiddleware(["administrador", "empleado"])` | ❌ **PERMITE** (INCORRECTO) |
| **Eliminar Usuario** | `DELETE /api/usuarios/:id` | `roleMiddleware(["administrador", "empleado"])` | ❌ **PERMITE** (INCORRECTO) |

**Problema:** Todos los empleados pueden hacer TODO, sin importar los permisos específicos del rol.

### **DESPUÉS (Validación por Permisos/Privilegios):**

| Acción | Ruta | Validación Nueva | Resultado para Empleado |
|--------|------|------------------|------------------------|
| **Crear Usuario** | `POST /api/usuarios` | `checkPermiso('gestion_usuarios', 'crear')` | ❌ **DENEGADO** (CORRECTO) |
| **Leer Usuarios** | `GET /api/usuarios` | `checkPermiso('gestion_usuarios', 'leer')` | ✅ **PERMITIDO** |
| **Actualizar Usuario** | `PUT /api/usuarios/:id` | `checkPermiso('gestion_usuarios', 'actualizar')` | ❌ **DENEGADO** (CORRECTO) |
| **Eliminar Usuario** | `DELETE /api/usuarios/:id` | `checkPermiso('gestion_usuarios', 'eliminar')` | ❌ **DENEGADO** (CORRECTO) |
| **Crear Solicitud** | `POST /api/gestion-solicitudes/crear/1` | `checkPermiso('gestion_solicitudes', 'crear')` | ✅ **PERMITIDO** |
| **Leer Solicitudes** | `GET /api/gestion-solicitudes` | `checkPermiso('gestion_solicitudes', 'leer')` | ✅ **PERMITIDO** |

**Resultado:** El empleado solo puede hacer las acciones para las que tiene permisos específicos.

---

## ✅ Respuesta a tu Pregunta

### **¿Con la solución, un empleado que solo puede VER usuarios ya NO podrá CREAR usuarios?**

**✅ SÍ, EXACTAMENTE ESO.**

### **Cómo Funciona:**

1. **Rol "empleado_lector" tiene:**
   - ✅ `gestion_usuarios` + `leer`
   - ❌ **NO tiene:** `gestion_usuarios` + `crear`

2. **Empleado intenta crear usuario:**
   - `checkPermiso('gestion_usuarios', 'crear')` busca en `rol_permisos_privilegios`
   - Busca: `id_rol=6, id_permiso=gestion_usuarios, id_privilegio=crear`
   - ❌ **No encuentra** → **DENEGADO** (403 Forbidden)

3. **Empleado intenta leer usuarios:**
   - `checkPermiso('gestion_usuarios', 'leer')` busca en `rol_permisos_privilegios`
   - Busca: `id_rol=6, id_permiso=gestion_usuarios, id_privilegio=leer`
   - ✅ **Encuentra** → **PERMITIDO** (200 OK)

### **Ventajas:**

- ✅ **Control granular:** Cada acción requiere un permiso específico
- ✅ **Seguridad:** Los empleados solo pueden hacer lo que su rol permite
- ✅ **Flexibilidad:** Puedes crear roles personalizados con permisos específicos
- ✅ **Auditoría:** Sabes exactamente qué puede hacer cada rol

---

## 📝 Ejemplo de Uso Completo

### **1. Crear Rol "Supervisor"**

```bash
POST /api/roles
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "nombre": "supervisor",
  "estado": true,
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
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": false,
      "leer": true,
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
  "data": {
    "id": "5",
    "nombre": "Supervisor",
    "estado": "Activo",
    "permisos": {
      "usuarios": { "crear": false, "leer": true, "actualizar": true, "eliminar": false },
      "solicitudes": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
      "citas": { "crear": true, "leer": true, "actualizar": true, "eliminar": false },
      "pagos": { "crear": false, "leer": true, "actualizar": false, "eliminar": false }
    }
  }
}
```

### **2. Crear Usuario con Rol "Supervisor"**

```bash
POST /api/usuarios
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "tipo_documento": "CC",
  "documento": "9876543210",
  "nombre": "María",
  "apellido": "González",
  "correo": "maria.gonzalez@example.com",
  "telefono": "3009876543",
  "contrasena": "Password123!",
  "id_rol": 5
}
```

### **3. Usuario Hace Login**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "correo": "maria.gonzalez@example.com",
  "contrasena": "Password123!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id_usuario": 124,
      "nombre": "María",
      "apellido": "González",
      "correo": "maria.gonzalez@example.com",
      "rol": "supervisor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **4. Usuario Intenta Acciones**

#### **✅ Permitido: Leer Usuarios**
```bash
GET /api/usuarios
Authorization: Bearer TOKEN
```
**Resultado:** `200 OK` - Lista de usuarios

#### **❌ Denegado: Crear Usuario**
```bash
POST /api/usuarios
Authorization: Bearer TOKEN
```
**Resultado:** `403 Forbidden`
```json
{
  "success": false,
  "mensaje": "No tienes privilegio para crear en usuarios",
  "privilegio_requerido": "crear",
  "privilegios_disponibles": ["leer", "actualizar"],
  "permiso": "gestion_usuarios",
  "rol": "supervisor"
}
```

#### **✅ Permitido: Crear Solicitud**
```bash
POST /api/gestion-solicitudes/crear/1
Authorization: Bearer TOKEN
```
**Resultado:** `201 Created` - Solicitud creada

#### **✅ Permitido: Actualizar Solicitud**
```bash
PUT /api/gestion-solicitudes/123
Authorization: Bearer TOKEN
```
**Resultado:** `200 OK` - Solicitud actualizada

#### **❌ Denegado: Eliminar Solicitud**
```bash
DELETE /api/gestion-solicitudes/123
Authorization: Bearer TOKEN
```
**Resultado:** `403 Forbidden`
```json
{
  "success": false,
  "mensaje": "No tienes privilegio para eliminar en solicitudes",
  "privilegio_requerido": "eliminar",
  "privilegios_disponibles": ["crear", "leer", "actualizar"],
  "permiso": "gestion_solicitudes",
  "rol": "supervisor"
}
```

---

## 🎯 Resumen de Pasos para Implementar

### **Paso 1: Modificar Login (Incluir `id_rol` en Token)**
- ✅ Archivo: `src/services/auth.services.js`
- ✅ Agregar `id_rol: usuario.id_rol` al token JWT

### **Paso 2: Modificar Auth Middleware (Cargar Permisos/Privilegios)**
- ✅ Archivo: `src/middlewares/auth.middleware.js`
- ✅ Cargar rol con permisos y privilegios
- ✅ Agregar `permisos` y `privilegios` a `req.user`

### **Paso 3: Crear Middleware de Validación de Permisos**
- ✅ Archivo: `src/middlewares/permiso.middleware.js` (NUEVO)
- ✅ Función `checkPermiso(permiso, privilegio)`
- ✅ Función `checkPermisoMultiple(permisosRequeridos)` (opcional)

### **Paso 4: Actualizar Rutas (Usar Validación de Permisos)**
- ✅ Reemplazar o complementar `roleMiddleware` con `checkPermiso`
- ✅ Especificar permiso y privilegio requeridos en cada ruta

---

## ⚠️ Consideraciones Importantes

### **1. Compatibilidad con Sistema Actual**

El sistema actual usa `roleMiddleware` que valida solo por nombre de rol. Para mantener compatibilidad:

- **Opción A:** Mantener `roleMiddleware` para validación básica y agregar `checkPermiso` para validación específica
- **Opción B:** Reemplazar completamente `roleMiddleware` con `checkPermiso`

**Recomendación:** Opción A (mantener ambos) para transición gradual.

### **2. Performance**

Cargar permisos/privilegios en cada request puede afectar el rendimiento. Consideraciones:

- ✅ Usar caché (Redis) para almacenar permisos por rol
- ✅ Cargar permisos solo cuando se necesiten (lazy loading)
- ✅ Optimizar consulta con `include` en Sequelize

### **3. Actualización de Permisos**

Si se modifican los permisos de un rol:
- ✅ Los cambios se reflejan inmediatamente (se cargan de BD en cada request)
- ✅ No requiere re-login del usuario

### **4. Roles Especiales**

Para roles como "administrador" que deben tener todos los permisos:
- ✅ Opción 1: Asignar todos los permisos/privilegios al rol
- ✅ Opción 2: Agregar lógica especial en `checkPermiso`:
  ```javascript
  // Si es administrador, permitir todo
  if (req.user.rol === 'administrador') {
    return next();
  }
  ```

---

## 📚 Referencias

- **Modelos:** `src/models/Role.js`, `src/models/Permiso.js`, `src/models/Privilegio.js`
- **Controladores:** `src/controllers/role.controller.js`
- **Servicios:** `src/services/role.service.js`
- **Rutas:** `src/routes/role.routes.js`
- **Transformaciones:** `src/utils/roleTransformations.js`

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

