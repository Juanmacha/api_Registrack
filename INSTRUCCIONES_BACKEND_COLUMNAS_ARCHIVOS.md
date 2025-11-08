# 🔧 INSTRUCCIONES PARA BACKEND: Corregir Columnas de Archivos

## 🚨 Problema Crítico

**Error actual:** `Data too long for column 'logotipo' at row 1`

**Causa:** Las columnas que almacenan archivos Base64 son demasiado pequeñas (VARCHAR(255)) pero los archivos pueden tener 200,000+ caracteres.

---

## ✅ Solución Rápida (5 minutos)

### Paso 1: Conectar a la base de datos

```bash
mysql -u [usuario] -p [nombre_base_datos]
```

### Paso 2: Ejecutar estos comandos SQL

```sql
-- Cambiar logotipo (USADO EN TODOS LOS SERVICIOS)
ALTER TABLE orden_servicios 
MODIFY COLUMN logotipo LONGTEXT;

-- Cambiar poder_autorizacion (USADO EN MÚLTIPLES SERVICIOS)
ALTER TABLE orden_servicios 
MODIFY COLUMN poder_autorizacion LONGTEXT;

-- Cambiar certificado_camara_comercio
ALTER TABLE orden_servicios 
MODIFY COLUMN certificado_camara_comercio LONGTEXT;

-- Cambiar otros campos de archivos (si existen)
ALTER TABLE orden_servicios 
MODIFY COLUMN poderparaelregistrodelamarca LONGTEXT;

ALTER TABLE orden_servicios 
MODIFY COLUMN poderdelrepresentanteautorizado LONGTEXT;

ALTER TABLE orden_servicios 
MODIFY COLUMN certificado_renovacion LONGTEXT;

ALTER TABLE orden_servicios 
MODIFY COLUMN documento_cesion LONGTEXT;

ALTER TABLE orden_servicios 
MODIFY COLUMN soportes LONGTEXT;
```

### Paso 3: Verificar cambios

```sql
-- Ver todas las columnas de archivos
SHOW COLUMNS FROM orden_servicios 
WHERE Field IN (
  'logotipo',
  'poder_autorizacion',
  'certificado_camara_comercio',
  'poderparaelregistrodelamarca',
  'poderdelrepresentanteautorizado',
  'certificado_renovacion',
  'documento_cesion',
  'soportes'
);
```

**Resultado esperado:** Todas deben mostrar `Type: longtext`

---

## 🔍 Verificar Nombres Exactos de Columnas

Si algunos comandos fallan porque las columnas no existen, verificar nombres exactos:

```sql
-- Ver todas las columnas
SHOW COLUMNS FROM orden_servicios;

-- Buscar columnas con palabras clave
SHOW COLUMNS FROM orden_servicios 
WHERE Field LIKE '%logotipo%' 
   OR Field LIKE '%poder%' 
   OR Field LIKE '%certificado%'
   OR Field LIKE '%documento%'
   OR Field LIKE '%soporte%';
```

---

## 📋 Lista de Columnas que DEBEN Cambiarse

### Columnas Críticas (usadas en todos/múltiples servicios):

1. ✅ **`logotipo`** - ⚠️ **CRÍTICO** - Usado en TODOS los servicios
2. ✅ **`poder_autorizacion`** - ⚠️ **CRÍTICO** - Usado en Certificación, Renovación, Oposición, Cesión, Respuesta

### Columnas Específicas:

3. ✅ **`certificado_camara_comercio`** - Certificación (Jurídica)
4. ✅ **`poderparaelregistrodelamarca`** - Certificación (verificar si existe)
5. ✅ **`poderdelrepresentanteautorizado`** - Certificación (verificar si existe)
6. ✅ **`certificado_renovacion`** - Renovación
7. ✅ **`documento_cesion`** - Cesión
8. ✅ **`soportes`** - Ampliación

---

## ⚠️ Importante

1. **Hacer backup** antes de ejecutar los comandos
2. **Verificar nombres** de columnas exactos en tu base de datos
3. **Ejecutar todos** los comandos, incluso si algunos fallan (columnas que no existen)
4. **Verificar cambios** después de ejecutar
5. **Probar** con un formulario después de los cambios

---

## 🎯 Resultado

Después de ejecutar estos comandos:

- ✅ Todos los formularios funcionarán correctamente
- ✅ Los archivos Base64 se almacenarán sin problemas
- ✅ No habrá más errores de "Data too long"
- ✅ Los usuarios podrán completar todos los formularios

---

## 📞 Si Tienes Problemas

1. Verificar que la tabla se llama `orden_servicios` (puede ser diferente)
2. Verificar nombres exactos de columnas
3. Verificar permisos de usuario de base de datos
4. Verificar que la base de datos esté en uso (no bloqueada)

---

**Prioridad:** 🔴 **CRÍTICA**  
**Tiempo estimado:** 5 minutos  
**Impacto:** Resuelve el error en TODOS los formularios

