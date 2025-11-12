# 📋 Instrucciones para Ejecutar Scripts SQL

**Fecha:** Enero 2026  
**Objetivo:** Ejecutar scripts SQL necesarios para el sistema de permisos granular

---

## ⚠️ IMPORTANTE

**Estos scripts DEBEN ejecutarse ANTES de probar el sistema de permisos.**

---

## 📁 Scripts Disponibles

### **1. Script: Crear Permisos y Privilegios Básicos**
📁 `database/migrations/001_crear_permisos_privilegios_basicos.sql`

**Qué hace:**
- Inserta 4 privilegios básicos: `crear`, `leer`, `actualizar`, `eliminar`
- Inserta 19 permisos por módulo: `gestion_usuarios`, `gestion_solicitudes`, `gestion_citas`, etc.

**Estado:** ✅ Idempotente (se puede ejecutar múltiples veces sin problemas)

---

### **2. Script: Asignar Permisos al Rol Empleado (Ejemplo)**
📁 `database/migrations/002_asignar_permisos_rol_empleado_ejemplo.sql`

**Qué hace:**
- Asigna permisos específicos al rol `empleado` como ejemplo
- Permisos asignados:
  - `gestion_usuarios` + `leer`
  - `gestion_solicitudes` + `leer`
  - `gestion_citas` + `crear`, `leer`
  - `gestion_seguimiento` + `leer`, `crear`, `actualizar`
  - `gestion_dashboard` + `leer`

**Estado:** ⚠️ Ejemplo - Ajusta los permisos según tus necesidades

---

## 🚀 Cómo Ejecutar los Scripts

### **Opción 1: MySQL Command Line**

```bash
# 1. Conectar a MySQL
mysql -u root -p

# 2. Seleccionar la base de datos
USE registrack_db;

# 3. Ejecutar Script 1: Crear Permisos y Privilegios
SOURCE database/migrations/001_crear_permisos_privilegios_basicos.sql;

# 4. Verificar que se insertaron correctamente
SELECT 'Privilegios:' as tipo, nombre, descripcion FROM privilegios ORDER BY nombre;
SELECT 'Permisos:' as tipo, nombre, descripcion FROM permisos ORDER BY nombre;

# 5. Ejecutar Script 2: Asignar Permisos al Rol Empleado (Opcional)
SOURCE database/migrations/002_asignar_permisos_rol_empleado_ejemplo.sql;

# 6. Verificar permisos asignados al rol empleado
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

---

### **Opción 2: MySQL Workbench / phpMyAdmin**

1. **Abrir MySQL Workbench o phpMyAdmin**
2. **Seleccionar la base de datos `registrack_db`**
3. **Ejecutar Script 1:**
   - Abrir el archivo `001_crear_permisos_privilegios_basicos.sql`
   - Ejecutar el script completo
   - Verificar que se insertaron los datos

4. **Ejecutar Script 2 (Opcional):**
   - Abrir el archivo `002_asignar_permisos_rol_empleado_ejemplo.sql`
   - Ejecutar el script completo
   - Verificar que se asignaron los permisos

---

### **Opción 3: Desde el Código (Node.js)**

```javascript
// Ejecutar scripts SQL desde Node.js
import fs from 'fs';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'registrack_db'
});

// Ejecutar Script 1
const script1 = fs.readFileSync('database/migrations/001_crear_permisos_privilegios_basicos.sql', 'utf8');
await connection.query(script1);

// Ejecutar Script 2 (Opcional)
const script2 = fs.readFileSync('database/migrations/002_asignar_permisos_rol_empleado_ejemplo.sql', 'utf8');
await connection.query(script2);

await connection.end();
```

---

## ✅ Verificación

### **Verificar que se insertaron los Privilegios:**
```sql
SELECT * FROM privilegios;
```

**Resultado esperado:** 4 privilegios
- `crear`
- `leer`
- `actualizar`
- `eliminar`

---

### **Verificar que se insertaron los Permisos:**
```sql
SELECT * FROM permisos ORDER BY nombre;
```

**Resultado esperado:** 19 permisos
- `gestion_archivos`
- `gestion_citas`
- `gestion_clientes`
- `gestion_dashboard`
- `gestion_detalles_orden`
- `gestion_detalles_procesos`
- `gestion_empleados`
- `gestion_empresas`
- `gestion_pagos`
- `gestion_permisos`
- `gestion_privilegios`
- `gestion_roles`
- `gestion_seguimiento`
- `gestion_servicios`
- `gestion_servicios_procesos`
- `gestion_solicitudes`
- `gestion_solicitud_cita`
- `gestion_tipo_archivos`
- `gestion_usuarios`

---

### **Verificar Permisos Asignados al Rol Empleado (si ejecutaste Script 2):**
```sql
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

**Resultado esperado:** Permisos asignados al rol empleado (según el script de ejemplo)

---

## 🔧 Personalizar Permisos del Rol Empleado

Si quieres asignar permisos diferentes al rol empleado, puedes modificar el Script 2 o ejecutar consultas SQL manuales:

### **Ejemplo: Asignar todos los permisos a un rol**
```sql
-- Asignar todos los permisos a un rol específico
SET @id_rol = (SELECT id_rol FROM roles WHERE nombre = 'empleado' LIMIT 1);

INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre LIKE 'gestion_%' 
  AND pr.nombre IN ('crear', 'leer', 'actualizar', 'eliminar')
ON DUPLICATE KEY UPDATE id_rol=id_rol;
```

### **Ejemplo: Asignar solo permisos de lectura**
```sql
-- Asignar solo permisos de lectura a un rol específico
SET @id_rol = (SELECT id_rol FROM roles WHERE nombre = 'empleado' LIMIT 1);

INSERT INTO rol_permisos_privilegios (id_rol, id_permiso, id_privilegio)
SELECT @id_rol, p.id_permiso, pr.id_privilegio
FROM permisos p, privilegios pr
WHERE p.nombre LIKE 'gestion_%' 
  AND pr.nombre = 'leer'
ON DUPLICATE KEY UPDATE id_rol=id_rol;
```

---

## ⚠️ Notas Importantes

1. **Scripts Idempotentes:** Los scripts son idempotentes (se pueden ejecutar múltiples veces sin problemas)
2. **Rol Administrador:** El rol `administrador` NO necesita permisos (tiene bypass automático)
3. **Rol Cliente:** El rol `cliente` mantiene su lógica actual (no requiere permisos aquí)
4. **Rol Empleado:** El rol `empleado` SÍ requiere permisos asignados para funcionar correctamente

---

## 🚀 Después de Ejecutar los Scripts

1. **Reiniciar el servidor** (si está corriendo)
2. **Hacer login nuevamente** para obtener tokens con `id_rol`
3. **Probar el sistema** con diferentes roles
4. **Verificar que los permisos funcionan correctamente**

---

**Documento creado:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para ejecutar
