# 📋 Instrucciones para Ejecutar Scripts SQL

**Fecha:** Enero 2026  
**Objetivo:** Corregir columnas de archivos base64 en la base de datos

---

## 🚀 Pasos para Ejecutar los Scripts

### **Paso 1: Hacer Backup de la Base de Datos**

**⚠️ IMPORTANTE: Siempre hacer backup antes de modificar la base de datos**

```bash
# Backup completo de la base de datos
mysqldump -u usuario -p registrack_db > backup_registrack_$(date +%Y%m%d_%H%M%S).sql

# O usando MySQL Workbench:
# 1. Click derecho en la base de datos
# 2. Data Export
# 3. Seleccionar todas las tablas
# 4. Export to Self-Contained File
```

---

### **Paso 2: Ejecutar Script de Corrección (TEXT)**

**Opción A: Desde línea de comandos**

```bash
# Conectar a MySQL
mysql -u usuario -p

# Seleccionar base de datos
USE registrack_db;

# Copiar y pegar el contenido del archivo:
# database/migrations/fix_file_columns_to_text.sql

# O ejecutar directamente:
mysql -u usuario -p registrack_db < database/migrations/fix_file_columns_to_text.sql
```

**Opción B: Desde MySQL Workbench**

1. Abrir MySQL Workbench
2. Conectar a la base de datos
3. Abrir el archivo: `database/migrations/fix_file_columns_to_text.sql`
4. Ejecutar el script (⚡ Execute o F5)

**Opción C: Script SQL Directo (Copiar y Pegar)**

```sql
USE registrack_db;

-- Cambiar poderparaelregistrodelamarca a TEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderparaelregistrodelamarca TEXT NULL 
COMMENT 'Poder para el registro de la marca (base64)';

-- Cambiar poderdelrepresentanteautorizado a TEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderdelrepresentanteautorizado TEXT NULL 
COMMENT 'Poder del representante autorizado (base64) - Solo para personas jurídicas';

-- Cambiar certificado_camara_comercio a TEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_camara_comercio TEXT NULL 
COMMENT 'Certificado de cámara de comercio (base64)';

-- Cambiar logotipo a TEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN logotipo TEXT NULL 
COMMENT 'Logotipo de la marca (base64)';

-- Cambiar otros campos de documentos a TEXT
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_renovacion TEXT NULL 
COMMENT 'Certificado de renovación (base64)';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documento_cesion TEXT NULL 
COMMENT 'Documento de cesión (base64)';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documentos_oposicion TEXT NULL 
COMMENT 'Documentos de oposición (base64)';

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN soportes TEXT NULL 
COMMENT 'Documentos adicionales de soporte (base64)';
```

---

### **Paso 3: Verificar Cambios**

```sql
-- Verificar estructura de columnas modificadas
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND COLUMN_NAME IN (
    'poderparaelregistrodelamarca',
    'poderdelrepresentanteautorizado',
    'certificado_camara_comercio',
    'logotipo',
    'certificado_renovacion',
    'documento_cesion',
    'documentos_oposicion',
    'soportes'
  )
ORDER BY COLUMN_NAME;
```

**Resultado esperado:**
- Todas las columnas deben ser `DATA_TYPE = 'text'`
- `CHARACTER_MAXIMUM_LENGTH` debe ser `NULL` (TEXT no tiene límite fijo)

---

### **Paso 4: (Opcional) Cambiar a LONGTEXT**

**Solo ejecutar si necesitas soportar archivos muy grandes (> 5MB)**

```sql
USE registrack_db;

-- Cambiar a LONGTEXT (hasta 4GB)
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderparaelregistrodelamarca LONGTEXT NULL;

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN poderdelrepresentanteautorizado LONGTEXT NULL;

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_camara_comercio LONGTEXT NULL;

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN logotipo LONGTEXT NULL;

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN certificado_renovacion LONGTEXT NULL;

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documento_cesion LONGTEXT NULL;

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN documentos_oposicion LONGTEXT NULL;

ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN soportes LONGTEXT NULL;
```

---

## ✅ Verificación Post-Ejecución

### **1. Verificar Estructura de Tabla**

```sql
DESCRIBE ordenes_de_servicios;
```

### **2. Probar Inserción de Datos**

```sql
-- Probar con un registro de prueba (opcional)
-- Esto verifica que los cambios funcionan correctamente
```

### **3. Probar desde el Backend**

1. Reiniciar el servidor Node.js
2. Probar crear una solicitud de Persona Natural
3. Verificar que no hay errores de "Data too long"

---

## 🔍 Troubleshooting

### **Error: "Table doesn't exist"**

```sql
-- Verificar que la tabla existe
SHOW TABLES LIKE 'ordenes_de_servicios';

-- Verificar nombre exacto de la tabla (puede tener prefijo)
SHOW TABLES;
```

### **Error: "Column doesn't exist"**

```sql
-- Verificar nombres de columnas
SHOW COLUMNS FROM ordenes_de_servicios;
```

### **Error: "Access denied"**

- Verificar que el usuario tiene permisos de ALTER TABLE
- Conectar con un usuario administrador

```sql
-- Verificar permisos
SHOW GRANTS;
```

---

## 📊 Resumen de Cambios

| Columna | Tipo Anterior | Tipo Nuevo | Tamaño Máximo |
|---------|---------------|------------|---------------|
| `poderparaelregistrodelamarca` | VARCHAR(?) | TEXT | 64KB |
| `poderdelrepresentanteautorizado` | VARCHAR(?) | TEXT | 64KB |
| `certificado_camara_comercio` | VARCHAR(?) | TEXT | 64KB |
| `logotipo` | VARCHAR(?) | TEXT | 64KB |
| `certificado_renovacion` | VARCHAR(?) | TEXT | 64KB |
| `documento_cesion` | VARCHAR(?) | TEXT | 64KB |
| `documentos_oposicion` | VARCHAR(?) | TEXT | 64KB |
| `soportes` | VARCHAR(?) | TEXT | 64KB |

**Nota:** Si necesitas más espacio, usar LONGTEXT (hasta 4GB).

---

## ⚠️ Notas Importantes

1. **Backup obligatorio:** Siempre hacer backup antes de ejecutar scripts
2. **Horario de mantenimiento:** Ejecutar en horario de bajo tráfico si es posible
3. **Tiempo de ejecución:** Los scripts son rápidos (< 1 segundo normalmente)
4. **No hay pérdida de datos:** Los cambios solo modifican el tipo de columna, no eliminan datos
5. **Reiniciar servidor:** Después de los cambios, reiniciar el servidor Node.js

---

## 📞 Soporte

Si encuentras problemas al ejecutar los scripts:

1. Verificar que tienes permisos de ALTER TABLE
2. Verificar que la base de datos existe y está activa
3. Revisar los logs de MySQL para ver errores específicos
4. Verificar que el nombre de la tabla es correcto

---

**Última actualización:** Enero 2026  
**Versión:** 1.0

