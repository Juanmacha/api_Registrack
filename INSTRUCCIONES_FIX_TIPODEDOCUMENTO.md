# 🔧 Solución: Error "Data too long for column 'tipodedocumento'"

## ❌ Problema

Al intentar crear una solicitud, recibes el error:
```
Error: Data too long for column 'tipodedocumento' at row 1
```

**Causa**: La columna `tipodedocumento` en la base de datos está definida como `VARCHAR(10)`, pero valores como "Cédula de Ciudadanía" tienen 23 caracteres.

## ✅ Solución

### Paso 1: Ejecutar la Migración SQL

Ejecuta el siguiente script SQL en tu base de datos MySQL:

```sql
USE registrack_db;

-- Aumentar tamaño de columna tipodedocumento
ALTER TABLE ordenes_de_servicios 
MODIFY COLUMN tipodedocumento VARCHAR(50) NULL COMMENT 'Tipo de documento del solicitante';
```

**O ejecuta el archivo completo:**
```bash
mysql -u tu_usuario -p registrack_db < database/migrations/fix_tipodedocumento_size.sql
```

### Paso 2: Verificar el Cambio

Ejecuta esta consulta para verificar que el cambio se aplicó correctamente:

```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'registrack_db'
  AND TABLE_NAME = 'ordenes_de_servicios'
  AND COLUMN_NAME = 'tipodedocumento';
```

**Resultado esperado:**
- `CHARACTER_MAXIMUM_LENGTH`: `50`
- `IS_NULLABLE`: `YES`

### Paso 3: Reiniciar la Aplicación (si es necesario)

Si tu aplicación está corriendo, no necesitas reiniciarla. El modelo de Sequelize ya fue actualizado para reflejar el nuevo tamaño.

## 📋 Cambios Realizados

1. ✅ **Modelo actualizado**: `api_Registrack/src/models/OrdenServicio.js`
   - Cambiado de `DataTypes.STRING(10)` a `DataTypes.STRING(50)`

2. ✅ **Migración SQL creada**: `database/migrations/fix_tipodedocumento_size.sql`

3. ✅ **Guía actualizada**: `GUIA_CAMPOS_SERVICIOS_POSTMAN.md`
   - Agregada nota sobre valores válidos de `tipo_documento`

## 🧪 Probar la Solución

Después de ejecutar la migración, prueba crear una solicitud con:

```json
{
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  ...
}
```

Ahora debería funcionar correctamente sin errores.

## 📝 Valores Válidos para tipo_documento

Después de la migración, puedes usar valores completos como:
- ✅ `"Cédula de Ciudadanía"` (23 caracteres)
- ✅ `"Cédula de Extranjería"` (24 caracteres)
- ✅ `"Pasaporte"` (9 caracteres)
- ✅ `"NIT"` (3 caracteres)
- ✅ `"Tarjeta de Identidad"` (21 caracteres)
- ✅ O abreviaciones como `"CC"`, `"CE"`, `"PA"`, etc.

---

**Fecha de corrección**: 4 de Noviembre de 2025

