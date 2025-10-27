# 📋 INSTRUCCIONES: Migración de Base de Datos para Anulación Mejorada

## ⚠️ IMPORTANTE: Ejecutar ANTES de probar el código

---

## 🗄️ **PASO 1: Ejecutar Script SQL**

### **Archivo a ejecutar:**
```
api_Registrack/migrate_anulacion_mejorada.sql
```

### **¿Cómo ejecutarlo?**

#### **Opción A: Desde MySQL Workbench (Recomendado)**
1. Abrir MySQL Workbench
2. Conectarse a la base de datos `registrack_db`
3. Abrir el archivo `migrate_anulacion_mejorada.sql` (File → Open SQL Script)
4. Ejecutar todo el script (⚡ Lightning icon o Ctrl+Shift+Enter)
5. Revisar el output en la sección de resultados

#### **Opción B: Desde línea de comandos**
```bash
mysql -u root -p registrack_db < migrate_anulacion_mejorada.sql
```

---

## ✅ **PASO 2: Verificar que se ejecutó correctamente**

### **Ejecutar estas consultas de verificación:**

#### **1. Verificar campos nuevos en `ordenes_de_servicios`:**
```sql
DESCRIBE ordenes_de_servicios;
```

**Debes ver estos campos:**
- `anulado_por` (INT, NULL)
- `fecha_anulacion` (DATETIME, NULL)  
- `motivo_anulacion` (TEXT, NULL)

#### **2. Verificar Foreign Key:**
```sql
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND CONSTRAINT_NAME = 'fk_ordenes_anulado_por';
```

**Debe retornar:**
- CONSTRAINT_NAME: `fk_ordenes_anulado_por`
- COLUMN_NAME: `anulado_por`
- REFERENCED_TABLE_NAME: `usuarios`
- REFERENCED_COLUMN_NAME: `id_usuario`

#### **3. Verificar índices:**
```sql
SHOW INDEX FROM ordenes_de_servicios 
WHERE Key_name IN ('idx_ordenes_estado', 'idx_ordenes_anulado_por', 'idx_ordenes_fecha_anulacion');
```

**Debe mostrar 3 índices creados.**

#### **4. Verificar tipo de notificación:**
```sql
SELECT COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'notificaciones'
  AND COLUMN_NAME = 'tipo_notificacion';
```

**Debe incluir:** `'anulacion_solicitud'` en el ENUM

---

## 🚀 **PASO 3: Reiniciar el servidor Node.js**

Después de ejecutar el script SQL:

```bash
cd api_Registrack
# Detener el servidor actual (Ctrl+C si está corriendo)
node server.js
```

**Deberías ver en consola:**
```
✅ Conexión a la base de datos exitosa
✅ Servidor corriendo en puerto 3000
```

---

## 📊 **Resumen de Cambios en BD**

| Tabla | Cambio | Descripción |
|-------|--------|-------------|
| `ordenes_de_servicios` | +3 columnas | `anulado_por`, `fecha_anulacion`, `motivo_anulacion` |
| `ordenes_de_servicios` | +1 FK | Relación con `usuarios` para auditoría |
| `ordenes_de_servicios` | +3 índices | Optimización de consultas |
| `notificaciones` | ENUM actualizado | Agregado `'anulacion_solicitud'` |

---

## ❓ **Troubleshooting**

### **Error: "Unknown column 'observaciones' in 'ordenes_de_servicios'"**
**Solución:** El script ya está corregido y no usa esta columna.

### **Error: "Duplicate key name 'idx_ordenes_estado'"**
**Solución:** El índice ya existe, el script lo maneja automáticamente con `IF NOT EXISTS`.

### **Error: "Cannot add foreign key constraint"**
**Solución:** Verificar que la tabla `usuarios` existe y tiene la columna `id_usuario` como PRIMARY KEY.

```sql
DESCRIBE usuarios;
```

### **Error: "Table 'registrack_db.notificaciones' doesn't exist"**
**Solución:** La tabla notificaciones no existe. Crear antes:

```sql
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT PRIMARY KEY AUTO_INCREMENT,
  id_orden_servicio INT NOT NULL,
  tipo_notificacion ENUM('asignacion_empleado', 'nueva_solicitud', 'cambio_estado', 'anulacion_solicitud') NOT NULL,
  destinatario_email VARCHAR(255) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  estado_envio ENUM('pendiente', 'enviado', 'fallido') DEFAULT 'pendiente'
);
```

---

## ✅ **Checklist Post-Migración**

- [ ] Script SQL ejecutado sin errores
- [ ] Campos `anulado_por`, `fecha_anulacion`, `motivo_anulacion` visibles en `ordenes_de_servicios`
- [ ] Foreign Key `fk_ordenes_anulado_por` creada
- [ ] 3 índices creados correctamente
- [ ] Tipo de notificación `'anulacion_solicitud'` agregado
- [ ] Servidor Node.js reiniciado
- [ ] Sin errores en consola al iniciar

---

## 🎯 **Próximos Pasos**

Una vez completados todos los checks:
1. ✅ Probar endpoint de anulación con Postman
2. ✅ Verificar que se envían emails
3. ✅ Revisar que se crean registros en `detalles_ordenes_servicio` y `seguimientos`

---

**¿Listo para probar?** 🚀

