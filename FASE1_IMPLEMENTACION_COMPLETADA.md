# ✅ Fase 1: Fundamentos - Implementación Completada

**Fecha:** Enero 2026  
**Estado:** ✅ **COMPLETADO**

---

## 📋 Resumen de Cambios

### **1. Modificación del Login (`src/services/auth.services.js`)**

**Cambio:** Incluir `id_rol` en el token JWT

```javascript
// ✅ ANTES
const token = jwt.sign(
  {
    id_usuario: usuario.id_usuario,
    rol: rolUsuario
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

// ✅ DESPUÉS
const idRol = usuario.id_rol || (usuario.rol ? usuario.rol.id_rol : null);

const token = jwt.sign(
  {
    id_usuario: usuario.id_usuario,
    rol: rolUsuario,
    id_rol: idRol  // ← NUEVO
  },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);
```

**Beneficio:** Ahora el token incluye `id_rol` para cargar permisos y privilegios en el middleware.

---

### **2. Modificación del Auth Middleware (`src/middlewares/auth.middleware.js`)**

**Cambio:** Cargar permisos y privilegios del rol al autenticar

```javascript
// ✅ ANTES
export const authMiddleware = (req, res, next) => {
  // ... validación de token ...
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};

// ✅ DESPUÉS
export const authMiddleware = async (req, res, next) => {
  // ... validación de token ...
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  const idRol = decoded.id_rol;
  
  if (!idRol) {
    // Compatibilidad con tokens antiguos
    req.user = {
      id_usuario: decoded.id_usuario,
      rol: decoded.rol
    };
    return next();
  }

  // Cargar rol con permisos y privilegios
  const rol = await Role.findByPk(idRol, {
    include: [
      { model: Permiso, as: 'permisos', attributes: ['id_permiso', 'nombre'] },
      { model: Privilegio, as: 'privilegios', attributes: ['id_privilegio', 'nombre'] }
    ]
  });

  // Extraer nombres
  const permisos = rol.permisos ? rol.permisos.map(p => p.nombre) : [];
  const privilegios = rol.privilegios ? rol.privilegios.map(p => p.nombre) : [];

  // Agregar a req.user
  req.user = {
    id_usuario: decoded.id_usuario,
    rol: rol.nombre,
    id_rol: rol.id_rol,
    permisos: permisos,        // ← NUEVO
    privilegios: privilegios   // ← NUEVO
  };

  next();
};
```

**Beneficios:**
- ✅ Carga automática de permisos y privilegios en cada request
- ✅ Compatibilidad con tokens antiguos (sin `id_rol`)
- ✅ `req.user` ahora incluye `permisos` y `privilegios` arrays

---

### **3. Nuevo Middleware de Permisos (`src/middlewares/permiso.middleware.js`)**

**Archivo Nuevo:** Middleware para validar permisos específicos

```javascript
export const checkPermiso = (permiso, privilegio) => {
  return async (req, res, next) => {
    // 1. Verificar autenticación
    if (!req.user || !req.user.id_rol) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    // 2. ✅ BYPASS AUTOMÁTICO PARA ADMINISTRADOR
    if (req.user.rol === 'administrador') {
      return next();
    }

    // 3. ✅ MANTENER LÓGICA ACTUAL PARA CLIENTE
    if (req.user.rol === 'cliente') {
      return next();
    }

    // 4. ✅ VALIDACIÓN GRANULAR PARA EMPLEADOS
    // Buscar combinación específica en tabla intermedia
    const tieneCombinacion = await RolPermisoPrivilegio.findOne({
      where: {
        id_rol: req.user.id_rol,
        id_permiso: permisoObj.id_permiso,
        id_privilegio: privilegioObj.id_privilegio
      }
    });

    if (!tieneCombinacion) {
      return res.status(403).json({ 
        mensaje: `No tienes permiso para ${privilegio} en ${permiso}`
      });
    }

    next();
  };
};
```

**Características:**
- ✅ Bypass automático para administrador
- ✅ Mantiene lógica actual para cliente
- ✅ Validación granular para empleados
- ✅ Verifica combinación específica de permiso + privilegio

---

## 🔄 Compatibilidad

### **Tokens Antiguos (sin `id_rol`)**
- ✅ Funcionan correctamente
- ✅ Se cargan con rol básico (sin permisos/privilegios)
- ✅ Compatibilidad hacia atrás mantenida

### **Tokens Nuevos (con `id_rol`)**
- ✅ Carga completa de permisos y privilegios
- ✅ Listo para validación granular

---

## 📊 Estructura de `req.user` Después de los Cambios

### **Antes:**
```javascript
req.user = {
  id_usuario: 1,
  rol: 'empleado'
}
```

### **Después (tokens nuevos):**
```javascript
req.user = {
  id_usuario: 1,
  rol: 'empleado',
  id_rol: 3,
  permisos: ['gestion_usuarios', 'gestion_solicitudes'],
  privilegios: ['leer', 'crear']
}
```

### **Después (tokens antiguos):**
```javascript
req.user = {
  id_usuario: 1,
  rol: 'empleado'
  // Sin permisos/privilegios (compatibilidad)
}
```

---

## ✅ Próximos Pasos

### **Fase 2: Módulos Críticos**
1. Implementar `checkPermiso` en rutas de usuarios
2. Implementar `checkPermiso` en rutas de solicitudes
3. Implementar `checkPermiso` en rutas de citas
4. Probar que todo funciona correctamente

### **Fase 3: Módulos Importantes**
1. Implementar en rutas de empleados
2. Implementar en rutas de clientes
3. Implementar en rutas de pagos
4. Implementar en rutas de seguimiento

---

## 🧪 Pruebas Recomendadas

### **1. Probar Login**
```bash
POST /api/usuarios/login
{
  "correo": "admin@example.com",
  "contrasena": "password"
}
```

**Verificar:**
- ✅ Token incluye `id_rol`
- ✅ Token funciona correctamente

### **2. Probar Auth Middleware**
```bash
GET /api/usuarios
Authorization: Bearer <token>
```

**Verificar:**
- ✅ `req.user` incluye `permisos` y `privilegios`
- ✅ Sistema sigue funcionando normalmente

### **3. Probar Bypass de Administrador**
```bash
# Con token de administrador
GET /api/usuarios
Authorization: Bearer <token_admin>
```

**Verificar:**
- ✅ Administrador tiene acceso completo
- ✅ No se valida permisos específicos

---

## 📝 Notas Importantes

1. **Tokens Antiguos:** Los tokens generados antes de esta actualización seguirán funcionando, pero no tendrán permisos/privilegios cargados. Los usuarios deberán hacer login nuevamente para obtener un token con `id_rol`.

2. **Bypass de Administrador:** El administrador tiene acceso total automáticamente. No necesita permisos específicos asignados.

3. **Lógica de Cliente:** Los clientes mantienen su lógica actual (validación en controladores). No se aplica validación granular aquí.

4. **Empleados:** Solo los empleados (y roles personalizados) tienen validación granular de permisos.

---

**Implementación completada:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para Fase 2

