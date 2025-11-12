# 🎯 Plan de Implementación Pragmático: Sistema de Permisos y Privilegios

**Fecha:** Enero 2026  
**Versión:** 1.0  
**Enfoque:** Implementación Gradual y Realista

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Análisis Completo del Sistema](#análisis-completo-del-sistema)
3. [Estrategia de Implementación](#estrategia-de-implementación)
4. [Plan por Fases](#plan-por-fases)
5. [Mapeo de Permisos Actuales](#mapeo-de-permisos-actuales)
6. [Implementación Técnica](#implementación-técnica)
7. [Consideraciones Especiales](#consideraciones-especiales)

---

## 🎯 Resumen Ejecutivo

### **Objetivo:**
Implementar un sistema de permisos granular de forma **gradual y pragmática**, sin romper el sistema actual, con:
- ✅ **Administrador:** Acceso total (bypass automático)
- ✅ **Cliente:** Mantiene permisos actuales (sin cambios)
- ✅ **Empleados:** Permisos granulares según rol asignado
- ✅ **Implementación gradual:** Por módulos, sin afectar funcionalidad existente

### **Principios:**
1. **No romper lo que funciona:** Mantener compatibilidad con sistema actual
2. **Implementación gradual:** Módulo por módulo, probando cada uno
3. **Bypass para administrador:** Acceso total sin validaciones
4. **Cliente sin cambios:** Mantener lógica actual de permisos
5. **Empleados con control:** Permisos granulares solo para empleados

---

## 📊 Análisis Completo del Sistema

### **Módulos Identificados en el Proyecto**

| # | Módulo | Ruta Base | Endpoints | Protección Actual | Prioridad |
|---|--------|-----------|-----------|-------------------|-----------|
| 1 | **Usuarios** | `/api/usuarios` | 7 | `roleMiddleware(["administrador", "empleado"])` | 🔴 Alta |
| 2 | **Empleados** | `/api/gestion-empleados` | 7 | `roleMiddleware(["administrador"])` | 🔴 Alta |
| 3 | **Clientes** | `/api/gestion-clientes` | 6 | `roleMiddleware(["administrador", "empleado"])` | 🟡 Media |
| 4 | **Empresas** | `/api/gestion-empresas` | 3 | `roleMiddleware(["administrador", "empleado"])` | 🟡 Media |
| 5 | **Solicitudes** | `/api/gestion-solicitudes` | 15 | `roleMiddleware(["cliente", "administrador", "empleado"])` | 🔴 Alta |
| 6 | **Citas** | `/api/gestion-citas` | 9 | `roleMiddleware(["administrador", "empleado", "cliente"])` | 🔴 Alta |
| 7 | **Pagos** | `/api/gestion-pagos` | 9 | `roleMiddleware(["administrador", "empleado"])` | 🔴 Alta |
| 8 | **Seguimiento** | `/api/seguimiento` | 7 | `roleMiddleware(["administrador", "empleado"])` | 🟡 Media |
| 9 | **Servicios** | `/api/servicios` | 8 | Público/`roleMiddleware(["administrador", "empleado"])` | 🟢 Baja |
| 10 | **Dashboard** | `/api/dashboard` | 8 | `roleMiddleware(["administrador"])` | 🔴 Alta |
| 11 | **Roles** | `/api/gestion-roles` | 6 | `roleMiddleware(["administrador"])` | 🔴 Alta |
| 12 | **Permisos** | `/api/gestion-permisos` | 5 | `roleMiddleware(["administrador"])` | 🔴 Alta |
| 13 | **Privilegios** | `/api/gestion-privilegios` | 5 | `roleMiddleware(["administrador"])` | 🔴 Alta |
| 14 | **Archivos** | `/api/gestion-archivos` | 3 | `roleMiddleware(["administrador", "empleado", "cliente"])` | 🟡 Media |
| 15 | **Tipo Archivos** | `/api/gestion-tipo-archivos` | 4 | `roleMiddleware(["administrador", "empleado"])` | 🟢 Baja |
| 16 | **Solicitud Cita** | `/api/gestion-solicitud-cita` | 4 | `roleMiddleware(["cliente", "administrador", "empleado"])` | 🟡 Media |
| 17 | **Detalle Orden** | `/api/detalles-orden` | 3 | `roleMiddleware(["administrador", "empleado", "cliente"])` | 🟡 Media |
| 18 | **Detalle Proceso** | `/api/detalles-procesos` | 4 | `roleMiddleware(["administrador", "empleado", "cliente"])` | 🟡 Media |
| 19 | **Servicio Proceso** | `/api/gestion-servicios-procesos` | 3 | `roleMiddleware(["administrador", "empleado", "cliente"])` | 🟢 Baja |
| 20 | **Formularios Dinámicos** | `/api/formularios-dinamicos` | 5 | Público | 🟢 Baja |

**Total:** 20 módulos, ~130 endpoints

---

## 🎯 Estrategia de Implementación

### **Enfoque: Híbrido (Mejor de Ambos Mundos)**

#### **1. Middleware Híbrido:**
```javascript
// Combinar roleMiddleware + checkPermiso
// - Administrador: Bypass total (no valida permisos)
// - Cliente: Mantiene lógica actual (roleMiddleware)
// - Empleado: Validación granular (checkPermiso)
```

#### **2. Implementación por Módulos:**
- **Fase 1:** Módulos críticos (Usuarios, Empleados, Solicitudes)
- **Fase 2:** Módulos importantes (Citas, Pagos, Dashboard)
- **Fase 3:** Módulos secundarios (Clientes, Empresas, Seguimiento)
- **Fase 4:** Módulos opcionales (Archivos, Tipo Archivos, etc.)

#### **3. Compatibilidad hacia atrás:**
- Mantener `roleMiddleware` funcionando
- Agregar `checkPermiso` como capa adicional
- No romper endpoints existentes

---

## 📅 Plan por Fases

### **FASE 1: Fundamentos (Semana 1)**
**Objetivo:** Crear infraestructura base sin romper nada

#### **1.1. Modificar Login (Incluir `id_rol` en Token)**
- ✅ Archivo: `src/services/auth.services.js`
- ✅ Cambio mínimo: Agregar `id_rol` al token
- ✅ Impacto: Bajo (solo agrega campo al token)
- ✅ Compatibilidad: 100% (no rompe nada)

#### **1.2. Modificar Auth Middleware (Cargar Permisos)**
- ✅ Archivo: `src/middlewares/auth.middleware.js`
- ✅ Cambio: Cargar permisos/privilegios del rol
- ✅ Impacto: Medio (consulta adicional a BD)
- ✅ Compatibilidad: 100% (agrega datos a `req.user`, no quita)

#### **1.3. Crear Middleware de Permisos (Con Bypass para Admin)**
- ✅ Archivo: `src/middlewares/permiso.middleware.js` (NUEVO)
- ✅ Funcionalidad:
  - Bypass automático para administrador
  - Validación granular para empleados
  - Mantener lógica actual para clientes
- ✅ Impacto: Bajo (nuevo archivo, no modifica existentes)

**Resultado Fase 1:**
- ✅ Infraestructura lista
- ✅ Sistema actual sigue funcionando
- ✅ No se rompe nada
- ✅ Listo para aplicar en módulos específicos

---

### **FASE 2: Módulos Críticos (Semana 2)**
**Objetivo:** Implementar permisos en módulos más importantes

#### **2.1. Módulo Usuarios** 🔴
- **Endpoints a proteger:**
  - `GET /api/usuarios` → `gestion_usuarios` + `leer`
  - `GET /api/usuarios/:id` → `gestion_usuarios` + `leer`
  - `POST /api/usuarios/crear` → `gestion_usuarios` + `crear`
  - `PUT /api/usuarios/:id` → `gestion_usuarios` + `actualizar`
  - `DELETE /api/usuarios/:id` → `gestion_usuarios` + `eliminar`
- **Estrategia:**
  - Mantener `roleMiddleware(["administrador", "empleado"])`
  - Agregar `checkPermiso` después
  - Administrador: Bypass automático
  - Cliente: No aplica (ya está protegido por roleMiddleware)

#### **2.2. Módulo Empleados** 🔴
- **Endpoints a proteger:**
  - `GET /api/gestion-empleados` → `gestion_empleados` + `leer`
  - `GET /api/gestion-empleados/:id` → `gestion_empleados` + `leer`
  - `POST /api/gestion-empleados` → `gestion_empleados` + `crear`
  - `PUT /api/gestion-empleados/:id` → `gestion_empleados` + `actualizar`
  - `DELETE /api/gestion-empleados/:id` → `gestion_empleados` + `eliminar`
- **Estrategia:**
  - Mantener `roleMiddleware(["administrador"])`
  - Agregar `checkPermiso` después
  - Solo administradores pueden acceder (sin cambios)

#### **2.3. Módulo Solicitudes** 🔴
- **Endpoints a proteger:**
  - `POST /api/gestion-solicitudes/crear/:servicio` → `gestion_solicitudes` + `crear`
  - `GET /api/gestion-solicitudes` → `gestion_solicitudes` + `leer`
  - `GET /api/gestion-solicitudes/:id` → `gestion_solicitudes` + `leer`
  - `PUT /api/gestion-solicitudes/editar/:id` → `gestion_solicitudes` + `actualizar`
  - `PUT /api/gestion-solicitudes/anular/:id` → `gestion_solicitudes` + `eliminar`
- **Estrategia:**
  - Cliente: Mantener lógica actual (puede crear y ver sus propias solicitudes)
  - Empleado: Validación granular
  - Administrador: Bypass automático

**Resultado Fase 2:**
- ✅ 3 módulos críticos protegidos
- ✅ Sistema sigue funcionando
- ✅ Clientes no afectados
- ✅ Empleados con control granular

---

### **FASE 3: Módulos Importantes (Semana 3)**
**Objetivo:** Extender permisos a módulos de uso frecuente

#### **3.1. Módulo Citas** 🔴
- **Endpoints a proteger:**
  - `GET /api/gestion-citas` → `gestion_citas` + `leer`
  - `POST /api/gestion-citas` → `gestion_citas` + `crear`
  - `PUT /api/gestion-citas/:id/reprogramar` → `gestion_citas` + `actualizar`
  - `PUT /api/gestion-citas/:id/anular` → `gestion_citas` + `eliminar`
- **Estrategia:**
  - Cliente: Mantener lógica actual (puede ver/crear sus citas)
  - Empleado: Validación granular
  - Administrador: Bypass automático

#### **3.2. Módulo Pagos** 🔴
- **Endpoints a proteger:**
  - `GET /api/gestion-pagos` → `gestion_pagos` + `leer`
  - `POST /api/gestion-pagos` → `gestion_pagos` + `crear`
  - `PUT /api/gestion-pagos/:id` → `gestion_pagos` + `actualizar`
- **Estrategia:**
  - Solo administradores y empleados (sin cambios)
  - Empleado: Validación granular
  - Administrador: Bypass automático

#### **3.3. Módulo Dashboard** 🔴
- **Endpoints a proteger:**
  - `GET /api/dashboard/ingresos` → `gestion_dashboard` + `leer`
  - `GET /api/dashboard/servicios` → `gestion_dashboard` + `leer`
  - `GET /api/dashboard/resumen` → `gestion_dashboard` + `leer`
- **Estrategia:**
  - Solo administradores (sin cambios)
  - Administrador: Bypass automático
  - Empleados: Opcional (si se quiere dar acceso limitado)

**Resultado Fase 3:**
- ✅ 3 módulos importantes protegidos
- ✅ Sistema completo funcional
- ✅ Control granular en módulos críticos

---

### **FASE 4: Módulos Secundarios (Semana 4 - Opcional)**
**Objetivo:** Completar implementación en módulos restantes

#### **4.1. Módulos con Prioridad Media:**
- Clientes
- Empresas
- Seguimiento
- Archivos
- Detalle Orden
- Detalle Proceso

#### **4.2. Módulos con Prioridad Baja:**
- Tipo Archivos
- Servicio Proceso
- Formularios Dinámicos (público, no requiere permisos)

**Resultado Fase 4:**
- ✅ Sistema completo con permisos granulares
- ✅ Todos los módulos protegidos
- ✅ Control total del sistema

---

## 🔐 Mapeo de Permisos Actuales

### **Rol: Administrador**
**Estrategia:** Bypass Total (Acceso Completo)

```javascript
// En checkPermiso middleware
if (req.user.rol === 'administrador') {
  return next(); // Bypass automático
}
```

**Permisos Implícitos:**
- ✅ Todos los módulos
- ✅ Todas las acciones (crear, leer, actualizar, eliminar)
- ✅ Sin validaciones adicionales

---

### **Rol: Cliente**
**Estrategia:** Mantener Lógica Actual (Sin Cambios)

**Permisos Actuales (Mantener):**

| Módulo | Acción | Endpoint | Lógica Actual |
|--------|--------|----------|---------------|
| **Solicitudes** | Crear | `POST /api/gestion-solicitudes/crear/:servicio` | ✅ Puede crear sus propias solicitudes |
| **Solicitudes** | Leer | `GET /api/gestion-solicitudes/mias` | ✅ Puede ver solo sus solicitudes |
| **Solicitudes** | Leer | `GET /api/gestion-solicitudes/mis/:id/estado-actual` | ✅ Puede ver estado de sus solicitudes |
| **Citas** | Crear | `POST /api/gestion-citas` | ✅ Puede crear sus propias citas |
| **Citas** | Leer | `GET /api/gestion-citas` | ✅ Puede ver sus propias citas |
| **Archivos** | Subir | `POST /api/gestion-archivos/upload` | ✅ Puede subir archivos |
| **Archivos** | Descargar | `GET /api/gestion-archivos/:id/download` | ✅ Puede descargar sus archivos |
| **Detalle Orden** | Leer | `GET /api/detalles-orden/:id` | ✅ Puede ver detalles de sus órdenes |
| **Detalle Proceso** | Leer | `GET /api/detalles-procesos/:id` | ✅ Puede ver procesos de sus órdenes |

**Implementación:**
```javascript
// En checkPermiso middleware
if (req.user.rol === 'cliente') {
  // Mantener lógica actual (validaciones en controladores)
  // No aplicar checkPermiso para clientes
  return next();
}
```

---

### **Rol: Empleado**
**Estrategia:** Permisos Granulares (Nuevo Sistema)

**Mapeo de Permisos por Módulo:**

| Módulo | Permiso API | Privilegios Típicos | Notas |
|--------|-------------|---------------------|-------|
| **Usuarios** | `gestion_usuarios` | `leer`, `actualizar` | No crear/eliminar por defecto |
| **Empleados** | `gestion_empleados` | `leer` | Solo lectura (admin crea) |
| **Clientes** | `gestion_clientes` | `leer`, `actualizar` | Gestión de clientes |
| **Solicitudes** | `gestion_solicitudes` | `crear`, `leer`, `actualizar` | Gestión completa |
| **Citas** | `gestion_citas` | `crear`, `leer`, `actualizar` | Gestión de citas |
| **Pagos** | `gestion_pagos` | `leer`, `crear` | Ver y registrar pagos |
| **Seguimiento** | `gestion_seguimiento` | `crear`, `leer`, `actualizar` | Agregar seguimientos |
| **Dashboard** | `gestion_dashboard` | `leer` | Ver dashboard (opcional) |

**Ejemplo de Rol "Empleado Básico":**
```json
{
  "nombre": "empleado_basico",
  "permisos": {
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
    "clientes": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    }
  }
}
```

**Ejemplo de Rol "Empleado Supervisor":**
```json
{
  "nombre": "empleado_supervisor",
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
      "eliminar": true
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": true
    },
    "pagos": {
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

---

## 🔧 Implementación Técnica

### **1. Middleware Híbrido (Con Bypass para Admin)**

**Archivo:** `src/middlewares/permiso.middleware.js`

```javascript
import { RolPermisoPrivilegio, Permiso, Privilegio } from '../models/index.js';

/**
 * Middleware híbrido: Combina validación de roles con permisos granulares
 * - Administrador: Bypass total (acceso completo)
 * - Cliente: Mantiene lógica actual (no valida permisos aquí)
 * - Empleado: Validación granular de permisos
 * 
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

    // ✅ BYPASS AUTOMÁTICO PARA ADMINISTRADOR
    if (req.user.rol === 'administrador') {
      console.log('✅ [Permisos] Administrador - Bypass automático');
      return next();
    }

    // ✅ MANTENER LÓGICA ACTUAL PARA CLIENTE
    // Los clientes tienen validaciones específicas en los controladores
    // No aplicamos validación granular aquí para mantener compatibilidad
    if (req.user.rol === 'cliente') {
      console.log('✅ [Permisos] Cliente - Manteniendo lógica actual');
      return next();
    }

    // ✅ VALIDACIÓN GRANULAR SOLO PARA EMPLEADOS
    // (Y otros roles personalizados que no sean administrador ni cliente)
    try {
      // Obtener IDs de permiso y privilegio
      const permisoObj = await Permiso.findOne({ where: { nombre: permiso } });
      const privilegioObj = await Privilegio.findOne({ where: { nombre: privilegio } });

      if (!permisoObj || !privilegioObj) {
        return res.status(500).json({ 
          success: false,
          mensaje: "Error en la configuración del sistema",
          detalles: `Permiso "${permiso}" o privilegio "${privilegio}" no encontrado en la base de datos`
        });
      }

      // Verificar combinación específica en tabla intermedia
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
      console.log(`✅ [Permisos] ${req.user.rol} - Permiso ${permiso} + ${privilegio} validado`);
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

### **2. Modificar Auth Middleware (Cargar Permisos)**

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
    
    // ✅ CARGAR ROL CON PERMISOS Y PRIVILEGIOS (solo si hay id_rol)
    const idRol = decoded.id_rol;
    if (!idRol) {
      // Si no hay id_rol en el token, cargar solo el rol básico
      req.user = {
        id_usuario: decoded.id_usuario,
        rol: decoded.rol
      };
      return next();
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

    // Extraer nombres de permisos y privilegios
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
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};
```

---

### **3. Modificar Login (Incluir `id_rol` en Token)**

**Archivo:** `src/services/auth.services.js`

```javascript
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
  const idRol = usuario.id_rol || (usuario.rol ? usuario.rol.id_rol : null);

  // ✅ AGREGAR id_rol al token
  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      rol: rolUsuario,
      id_rol: idRol  // ← NUEVO
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  const { contrasena: _, ...usuarioSinPass } = usuario.toJSON();
  return { usuario: usuarioSinPass, token };
};
```

---

### **4. Ejemplo de Uso en Rutas (Módulo Usuarios)**

**Archivo:** `src/routes/usuario.routes.js`

```javascript
import { checkPermiso } from '../middlewares/permiso.middleware.js';

// ANTES:
router.get('/', 
  authMiddleware, 
  roleMiddleware(["administrador", "empleado"]), 
  getUsuarios
);

// DESPUÉS (Híbrido):
router.get('/', 
  authMiddleware, 
  roleMiddleware(["administrador", "empleado"]),  // ← Mantener (compatibilidad)
  checkPermiso('gestion_usuarios', 'leer'),      // ← Agregar (granular)
  getUsuarios
);

// Explicación:
// - roleMiddleware: Valida que sea administrador o empleado (compatibilidad)
// - checkPermiso: Valida permiso granular (bypass para admin, granular para empleado)
// - Cliente: No llega aquí (ya bloqueado por roleMiddleware)
```

---

## ⚠️ Consideraciones Especiales

### **1. Compatibilidad hacia atrás**
- ✅ Mantener `roleMiddleware` funcionando
- ✅ Agregar `checkPermiso` como capa adicional
- ✅ No eliminar validaciones existentes
- ✅ Probar cada módulo antes de pasar al siguiente

### **2. Performance**
- ⚠️ Consulta adicional a BD en cada request (cargar permisos)
- 💡 **Solución:** Cachear permisos por rol (Redis o memoria)
- 💡 **Alternativa:** Cargar permisos solo cuando se necesiten (lazy loading)

### **3. Testing**
- ✅ Probar cada módulo individualmente
- ✅ Verificar que administrador tenga bypass
- ✅ Verificar que cliente mantenga permisos actuales
- ✅ Verificar que empleado respete permisos granulares

### **4. Migración de Datos**
- ✅ Crear roles por defecto para empleados existentes
- ✅ Asignar permisos básicos a roles existentes
- ✅ Documentar permisos actuales antes de cambiar

---

## 📝 Checklist de Implementación

### **Fase 1: Fundamentos**
- [ ] Modificar `loginUser` para incluir `id_rol` en token
- [ ] Modificar `authMiddleware` para cargar permisos/privilegios
- [ ] Crear `checkPermiso` middleware con bypass para admin
- [ ] Probar que sistema actual sigue funcionando
- [ ] Probar que administrador tiene bypass
- [ ] Probar que cliente mantiene permisos actuales

### **Fase 2: Módulos Críticos**
- [ ] Implementar en módulo Usuarios
- [ ] Implementar en módulo Empleados
- [ ] Implementar en módulo Solicitudes
- [ ] Probar cada módulo individualmente
- [ ] Documentar cambios

### **Fase 3: Módulos Importantes**
- [ ] Implementar en módulo Citas
- [ ] Implementar en módulo Pagos
- [ ] Implementar en módulo Dashboard
- [ ] Probar cada módulo individualmente
- [ ] Documentar cambios

### **Fase 4: Módulos Secundarios (Opcional)**
- [ ] Implementar en módulos restantes
- [ ] Probar sistema completo
- [ ] Documentar sistema completo

---

## 🎯 Resumen de Ventajas

### **✅ Ventajas de este Enfoque:**
1. **No rompe nada:** Sistema actual sigue funcionando
2. **Implementación gradual:** Módulo por módulo, probando cada uno
3. **Bypass para admin:** Acceso total sin complicaciones
4. **Cliente sin cambios:** Mantiene lógica actual
5. **Empleados con control:** Permisos granulares solo donde se necesita
6. **Realista:** No requiere cambios masivos de una vez
7. **Reversible:** Fácil deshacer cambios si hay problemas

### **⚠️ Consideraciones:**
1. **Performance:** Consulta adicional a BD (solucionable con cache)
2. **Complejidad:** Dos capas de validación (roleMiddleware + checkPermiso)
3. **Mantenimiento:** Necesita documentar qué módulos tienen permisos granulares

---

## 📚 Archivos a Modificar/Crear

### **Archivos a Modificar:**
1. `src/services/auth.services.js` - Agregar `id_rol` al token
2. `src/middlewares/auth.middleware.js` - Cargar permisos/privilegios
3. `src/routes/usuario.routes.js` - Agregar `checkPermiso` (Fase 2)
4. `src/routes/empleado.routes.js` - Agregar `checkPermiso` (Fase 2)
5. `src/routes/solicitudes.routes.js` - Agregar `checkPermiso` (Fase 2)
6. `src/routes/citas.routes.js` - Agregar `checkPermiso` (Fase 3)
7. `src/routes/pago.routes.js` - Agregar `checkPermiso` (Fase 3)
8. `src/routes/dashboard.routes.js` - Agregar `checkPermiso` (Fase 3)
9. (Otros módulos según fases)

### **Archivos a Crear:**
1. `src/middlewares/permiso.middleware.js` - Middleware híbrido con bypass

---

## 🚀 Próximos Pasos

1. **Revisar este plan** y ajustar según necesidades
2. **Implementar Fase 1** (Fundamentos)
3. **Probar Fase 1** exhaustivamente
4. **Implementar Fase 2** (Módulos críticos)
5. **Probar Fase 2** módulo por módulo
6. **Continuar con fases siguientes** según prioridad

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

