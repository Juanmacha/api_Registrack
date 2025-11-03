# ✅ Correcciones: Problema de Asignación de Empleados

## 📋 Resumen

Se corrigió el problema donde el sistema guardaba `id_empleado` cuando debería guardar `id_usuario` del empleado. Esto causaba que a veces se asignaran clientes en vez de empleados.

**Fecha de corrección:** 1 de Noviembre de 2025

---

## 🔧 Cambios Realizados

### 1. **Controlador: `solicitudes.controller.js`**

#### Función: `asignarEmpleado`

**Línea 1428 - ANTES:**
```javascript
await solicitud.update({ id_empleado_asignado: id_empleado });
```

**Línea 1428 - DESPUÉS:**
```javascript
await solicitud.update({ id_empleado_asignado: empleado.id_usuario });
```

**Línea 1466 - ANTES:**
```javascript
if (empleadoAnterior && empleadoAnterior.id_usuario !== id_empleado) {
```

**Línea 1466 - DESPUÉS:**
```javascript
if (empleadoAnterior && empleadoAnterior.id_usuario !== empleado.id_usuario) {
```

---

### 2. **Controlador: `solicitud_cita.controller.js`**

#### Función: `gestionarSolicitud`

**Import agregado:**
```javascript
import Empleado from "../models/Empleado.js";
```

**Validación agregada (líneas 136-148):**
```javascript
// ✅ VALIDAR que el id_empleado_asignado corresponda a un empleado válido
const empleado = await Empleado.findByPk(id_empleado_asignado, {
  include: [{ model: User, as: 'usuario' }]
});

if (!empleado || !empleado.usuario || !empleado.usuario.estado) {
  return res.status(400).json({ 
    message: "El empleado asignado no es válido o está inactivo" 
  });
}

// Convertir id_empleado a id_usuario del empleado
const id_usuario_empleado = empleado.id_usuario;
```

**Usado en:**
- Búsqueda de solapamiento (línea 154): `id_empleado: id_usuario_empleado`
- Creación de cita (línea 172): `id_empleado: id_usuario_empleado`
- Guardado en solicitud (línea 176): `solicitud.id_empleado_asignado = id_usuario_empleado`

---

### 3. **Controlador: `citas.controller.js`**

#### Función: `createCita`

**Import agregado:**
```javascript
import Empleado from "../models/Empleado.js";
```

**Validación agregada (líneas 103-115):**
```javascript
// ✅ VALIDAR que id_empleado corresponda a un empleado válido
const empleado = await Empleado.findByPk(id_empleado, {
  include: [{ model: User, as: 'usuario' }]
});

if (!empleado || !empleado.usuario || !empleado.usuario.estado) {
  return res.status(400).json({ 
    message: "El empleado no es válido o está inactivo" 
  });
}

// Convertir id_empleado a id_usuario del empleado
const id_usuario_empleado = empleado.id_usuario;
```

**Usado en:**
- Búsqueda de solapamiento (línea 168): `id_empleado: id_usuario_empleado`
- Creación de cita (línea 193): `id_empleado: id_usuario_empleado`

---

#### Función: `crearCitaDesdeSolicitud`

**Validación agregada (líneas 666-682):**
```javascript
// ✅ VALIDAR que id_empleado corresponda a un empleado válido
let id_usuario_empleado = null;
if (id_empleado) {
  const empleado = await Empleado.findByPk(id_empleado, {
    include: [{ model: User, as: 'usuario' }]
  });

  if (!empleado || !empleado.usuario || !empleado.usuario.estado) {
    return res.status(400).json({ 
      success: false,
      message: "El empleado no es válido o está inactivo" 
    });
  }

  // Convertir id_empleado a id_usuario del empleado
  id_usuario_empleado = empleado.id_usuario;
}
```

**Usado en:**
- Búsqueda de solapamiento (línea 689): `id_empleado: id_usuario_empleado`
- Creación de cita (línea 725): `id_empleado: id_usuario_empleado`
- Obtención de datos (línea 747): `if (id_usuario_empleado)`

---

## 📁 Archivos Creados

### 1. `database/migrations/corregir_relaciones_empleados.sql`

Script SQL para migrar datos existentes que tenían referencias incorrectas.

**Funciones:**
- Verifica datos incorrectos pre-migración
- Convierte `id_empleado` a `id_usuario` en:
  - `ordenes_de_servicios.id_empleado_asignado`
  - `citas.id_empleado`
  - `solicitudes_citas.id_empleado_asignado`
- Verifica datos corregidos post-migración

---

### 2. `DIAGNOSTICO_CORRECTO_ASIGNACION_EMPLEADOS.md`

Diagnóstico del problema con análisis, errores, flujos y soluciones propuestas.

---

### 3. `RESPUESTA_TECNICA_SEGUIMIENTO.md`

Documentación técnica del endpoint `POST /api/seguimiento/crear` para el frontend.

---

## 🎯 Flujo Correcto Después de las Correcciones

### Asignar Empleado a Solicitud

1. **Frontend envía:** `{ "id_empleado": 2 }`
2. **Backend valida:** Busca en tabla `empleados` con `id = 2`
3. **Backend convierte:** `id_empleado = 2` → `id_usuario = 12`
4. **Backend guarda:** `ordenes_de_servicios.id_empleado_asignado = 12`
5. ✅ **Resultado:** Asignación correcta al empleado

---

### Agendar Cita

1. **Frontend envía:** `{ "id_empleado": 2 }`
2. **Backend valida:** Busca en tabla `empleados` con `id = 2`
3. **Backend convierte:** `id_empleado = 2` → `id_usuario = 12`
4. **Backend guarda:** `citas.id_empleado = 12`
5. ✅ **Resultado:** Cita asignada al empleado correcto

---

## 🔄 Cómo Aplicar las Correcciones

### 1. **Backend (ya aplicado)**

Todas las correcciones en el código ya están implementadas.

---

### 2. **Base de Datos**

```bash
# Ejecutar el script de migración
mysql -u root -p registrack_db < database/migrations/corregir_relaciones_empleados.sql
```

**O ejecutar manualmente en MySQL:**

```sql
USE registrack_db;
SOURCE database/migrations/corregir_relaciones_empleados.sql;
```

---

### 3. **Frontend**

No requiere cambios. El frontend continúa enviando `id_empleado` como siempre.

---

## ✅ Validaciones Agregadas

Todas las funciones ahora:

1. ✅ Buscan el `id_empleado` en la tabla `empleados`
2. ✅ Verifican que el empleado exista
3. ✅ Verifican que el empleado esté activo
4. ✅ Convierten `id_empleado` → `id_usuario`
5. ✅ Guardan el `id_usuario` correcto en la base de datos

---

## 🚨 Impacto de los Cambios

### **Antes de las correcciones:**
- ❌ Se asignaban clientes como empleados
- ❌ Las citas se asignaban incorrectamente
- ❌ No había validación de que el usuario fuera un empleado

### **Después de las correcciones:**
- ✅ Solo se asignan empleados válidos
- ✅ Las citas se asignan correctamente
- ✅ Validación completa de que el usuario sea un empleado activo

---

## 📝 Notas Importantes

1. **Base de datos oficial:** No requiere cambios, ya tenía las foreign keys correctas.
2. **Datos existentes:** El script de migración corrige los datos existentes.
3. **Nuevos datos:** El código corrige automáticamente los nuevos datos.
4. **Compatibilidad:** El frontend no requiere cambios.

---

## 🧪 Cómo Probar

### 1. **Probar asignar empleado a solicitud**

```bash
# Endpoint
PUT /api/gestion-solicitudes/asignar-empleado/:id

# Body
{
  "id_empleado": 2
}

# Validar en BD
SELECT os.id_orden_servicio, os.id_empleado_asignado, u.nombre, u.apellido
FROM ordenes_de_servicios os
JOIN usuarios u ON os.id_empleado_asignado = u.id_usuario
JOIN empleados e ON e.id_usuario = u.id_usuario
WHERE os.id_empleado_asignado IS NOT NULL;
```

### 2. **Probar agendar cita**

```bash
# Endpoint
POST /api/gestion-citas/desde-solicitud/:idOrdenServicio

# Body
{
  "fecha": "2025-11-15",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "modalidad": "Presencial",
  "id_empleado": 2
}

# Validar en BD
SELECT c.id_cita, c.fecha, c.id_empleado, u.nombre, u.apellido
FROM citas c
JOIN usuarios u ON c.id_empleado = u.id_usuario
JOIN empleados e ON e.id_usuario = u.id_usuario
WHERE c.id_empleado IS NOT NULL;
```

### 3. **Probar con empleado inválido (debe fallar)**

```bash
# Intentar asignar un id_empleado inexistente
PUT /api/gestion-solicitudes/asignar-empleado/:id

# Body
{
  "id_empleado": 999999
}

# Resultado esperado: 400 Bad Request
{
  "success": false,
  "mensaje": "Empleado no encontrado o inactivo"
}
```

---

**Última actualización:** 1 de Noviembre de 2025  
**Estado:** ✅ Todas las correcciones implementadas y probadas

