# ✅ Corrección Crítica: Mapeo de Campos - poder_autorizacion

**Fecha:** Enero 2026  
**Estado:** ✅ **CORREGIDO**  
**Prioridad:** 🔴 **CRÍTICA**

---

## 📋 Problema Identificado

### **Error:**
```
Data too long for column 'poderdelrepresentanteautorizado' at row 1
```

### **Causa Raíz:**
El backend estaba mapeando incorrectamente el campo `poder_autorizacion`:
- **Campo enviado:** `poder_autorizacion` (poder para el registro de la marca)
- **Campo donde se guardaba:** `poderdelrepresentanteautorizado` (poder del representante legal)
- **Problema:** Para personas **Naturales**, NO existe representante legal y el campo es demasiado pequeño

---

## ✅ Correcciones Implementadas

### **1. Corrección del Mapeo en el Controlador**

**Archivo:** `src/controllers/solicitudes.controller.js`  
**Líneas:** 772-778

**ANTES (Incorrecto):**
```javascript
poderdelrepresentanteautorizado: req.body.poder_representante_autorizado || req.body.poder_autorizacion,
poderparaelregistrodelamarca: req.body.poder_registro_marca,
```

**DESPUÉS (Correcto):**
```javascript
// ✅ CORRECCIÓN: poder_autorizacion SIEMPRE va a poderparaelregistrodelamarca
// poderdelrepresentanteautorizado SOLO para poder_representante_autorizado (Jurídica)
poderparaelregistrodelamarca: req.body.poder_autorizacion || req.body.poder_registro_marca,
// Solo incluir poderdelrepresentanteautorizado si es Jurídica y existe poder_representante_autorizado
...(req.body.tipo_solicitante === 'Jurídica' && req.body.poder_representante_autorizado ? {
  poderdelrepresentanteautorizado: req.body.poder_representante_autorizado
} : {}),
```

### **2. Prevención de Guardado de Campos de Representante para Natural**

**Archivo:** `src/controllers/solicitudes.controller.js`  
**Líneas:** 827-838

**Código agregado:**
```javascript
// ✅ CORRECCIÓN: Para personas Naturales, NO guardar campos de representante/empresa
if (req.body.tipo_solicitante === 'Natural') {
  // Remover campos que NO aplican para personas naturales
  delete ordenData.tipodeentidadrazonsocial;
  delete ordenData.nombredelaempresa;
  delete ordenData.nit;
  delete ordenData.poderdelrepresentanteautorizado;
  delete ordenData.representante_legal;
  delete ordenData.certificado_camara_comercio;
  console.log('✅ Persona Natural - Campos de representante/empresa removidos del ordenData');
}
```

---

## 📊 Mapeo Correcto de Campos

### **Para Persona Natural:**
```
Frontend → Backend → Base de Datos
─────────────────────────────────────
poder_autorizacion → poderparaelregistrodelamarca → poderparaelregistrodelamarca (TEXT)
```

**Campos NO guardados para Natural:**
- ❌ `poderdelrepresentanteautorizado`
- ❌ `representante_legal`
- ❌ `certificado_camara_comercio`
- ❌ `tipo_entidad`
- ❌ `razon_social`
- ❌ `nit_empresa`

### **Para Persona Jurídica:**
```
Frontend → Backend → Base de Datos
─────────────────────────────────────
poder_autorizacion → poderparaelregistrodelamarca → poderparaelregistrodelamarca (TEXT)
poder_representante_autorizado → poderdelrepresentanteautorizado → poderdelrepresentanteautorizado (TEXT)
```

**Campos guardados para Jurídica:**
- ✅ `poder_autorizacion` → `poderparaelregistrodelamarca`
- ✅ `poder_representante_autorizado` → `poderdelrepresentanteautorizado`
- ✅ `certificado_camara_comercio`
- ✅ `representante_legal`
- ✅ `tipo_entidad`
- ✅ `razon_social`
- ✅ `nit_empresa`

---

## 🔧 Scripts SQL para Base de Datos

### **Script 1: Cambiar Columnas a TEXT** (Recomendado)

**Archivo:** `database/migrations/fix_file_columns_to_text.sql`

Este script cambia las columnas de archivos base64 a tipo TEXT (suficiente para la mayoría de casos).

**Ejecutar:**
```bash
mysql -u usuario -p registrack_db < database/migrations/fix_file_columns_to_text.sql
```

### **Script 2: Cambiar Columnas a LONGTEXT** (Opcional - Para archivos muy grandes)

**Archivo:** `database/migrations/fix_file_columns_to_longtext.sql`

Este script cambia las columnas a LONGTEXT (hasta 4GB) para soportar archivos extremadamente grandes.

**Ejecutar solo si:**
- Los archivos que se suben son > 5MB regularmente
- Se prevé que en el futuro se subirán archivos muy grandes

```bash
mysql -u usuario -p registrack_db < database/migrations/fix_file_columns_to_longtext.sql
```

---

## ✅ Verificación Post-Implementación

### **Test 1: Persona Natural con poder_autorizacion**

```json
POST /api/gestion-solicitudes/crear/2
{
  "tipo_solicitante": "Natural",
  "poder_autorizacion": "data:application/pdf;base64,...",
  // ... otros campos
}
```

**Resultado esperado:**
- ✅ Se guarda en `poderparaelregistrodelamarca`
- ❌ NO se intenta guardar en `poderdelrepresentanteautorizado`
- ✅ No hay errores de "Data too long"
- ✅ Status 201 Created

### **Test 2: Persona Jurídica con ambos poderes**

```json
POST /api/gestion-solicitudes/crear/2
{
  "tipo_solicitante": "Jurídica",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "poder_representante_autorizado": "data:application/pdf;base64,...",
  // ... otros campos
}
```

**Resultado esperado:**
- ✅ Se guarda `poder_autorizacion` en `poderparaelregistrodelamarca`
- ✅ Se guarda `poder_representante_autorizado` en `poderdelrepresentanteautorizado`
- ✅ No hay errores de "Data too long"
- ✅ Status 201 Created

---

## 📝 Archivos Modificados

| Archivo | Cambios | Estado |
|---------|---------|--------|
| `src/controllers/solicitudes.controller.js` | Corrección de mapeo de campos | ✅ |
| `database/migrations/fix_file_columns_to_text.sql` | Script SQL para cambiar a TEXT | ✅ |
| `database/migrations/fix_file_columns_to_longtext.sql` | Script SQL para cambiar a LONGTEXT | ✅ |
| `database/database_official_complete.sql` | Comentarios actualizados | ✅ |

---

## ⚠️ Notas Importantes

1. **Ejecutar scripts SQL:** Los scripts SQL deben ejecutarse manualmente en la base de datos
2. **No perder datos:** Los scripts son seguros y no eliminan datos existentes
3. **Reiniciar servidor:** Después de los cambios en el código, reiniciar el servidor Node.js
4. **Probar antes de producción:** Probar en desarrollo antes de aplicar en producción

---

## 🚀 Próximos Pasos

1. ✅ **Código corregido** - Mapeo de campos corregido
2. ⏳ **Ejecutar scripts SQL** - Cambiar columnas a TEXT/LONGTEXT
3. ⏳ **Reiniciar servidor** - Aplicar cambios del código
4. ⏳ **Probar casos de prueba** - Verificar que funciona correctamente
5. ⏳ **Monitorear logs** - Verificar que no hay errores

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ **CORRECCIONES IMPLEMENTADAS - PENDIENTE EJECUTAR SCRIPTS SQL**

