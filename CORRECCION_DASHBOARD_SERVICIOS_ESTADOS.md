# 🔧 Corrección: Dashboard de Servicios - Estados Reales (Process States)

## 📋 Problema Identificado

El dashboard de servicios estaba usando estados fijos y genéricos (`Pendiente`, `En Proceso`, `Finalizado`, `Anulado`) desde la tabla `ordenes_de_servicios.estado`, cuando en realidad el sistema usa **process_states dinámicos** específicos para cada servicio que se almacenan en `detalles_ordenes_servicio.estado`.

### Problemas:
1. ❌ Los estados mostrados no coincidían con los process_states reales de cada servicio
2. ❌ No se mostraban los estados específicos como "Solicitud Recibida", "Revisión de Documentos", "Publicación", etc.
3. ❌ "Finalizado" y "Anulado" se manejaban de forma confusa (estados diferentes pero relacionados)

## ✅ Solución Implementada

### Cambios Realizados:

#### 1. Repositorio (`dashboard.repository.js`)

**Antes:**
```sql
-- ❌ Usaba estados fijos de ordenes_de_servicios.estado
SUM(CASE WHEN os.estado = 'Pendiente' THEN 1 ELSE 0 END) AS pendientes,
SUM(CASE WHEN os.estado = 'En Proceso' THEN 1 ELSE 0 END) AS en_proceso,
SUM(CASE WHEN os.estado = 'Finalizado' THEN 1 ELSE 0 END) AS finalizados,
SUM(CASE WHEN os.estado = 'Anulado' THEN 1 ELSE 0 END) AS anulados
```

**Después:**
```sql
-- ✅ Obtiene estados reales desde detalles_ordenes_servicio (process_states)
-- Usa el estado más reciente de cada orden de servicio
SELECT 
  os.id_servicio,
  estado_actual.estado,  -- Estado real del process_state
  COUNT(*) AS cantidad
FROM ordenes_de_servicios os
INNER JOIN (
  SELECT 
    dos1.id_orden_servicio,
    dos1.estado
  FROM detalles_ordenes_servicio dos1
  INNER JOIN (
    SELECT 
      id_orden_servicio,
      MAX(fecha_estado) AS max_fecha
    FROM detalles_ordenes_servicio
    GROUP BY id_orden_servicio
  ) dos2 ON dos1.id_orden_servicio = dos2.id_orden_servicio 
    AND dos1.fecha_estado = dos2.max_fecha
) estado_actual ON os.id_orden_servicio = estado_actual.id_orden_servicio
WHERE os.estado != 'Anulado'  -- Excluir anuladas de process_states
GROUP BY os.id_servicio, estado_actual.estado
```

**Lógica:**
1. **Query 1:** Obtiene servicios con totales y anulados (desde `ordenes_de_servicios.estado`)
2. **Query 2:** Obtiene distribución de estados reales desde `detalles_ordenes_servicio` (process_states)
3. **Combinación:** Une ambos resultados, agregando "Anulado" por separado

#### 2. Servicio (`dashboard.service.js`)

**Antes:**
```javascript
estado_distribucion: {
  Pendiente: parseInt(servicio.pendientes || 0),
  'En Proceso': parseInt(servicio.en_proceso || 0),
  Finalizado: parseInt(servicio.finalizados || 0),
  Anulado: parseInt(servicio.anulados || 0)
}
```

**Después:**
```javascript
// estado_distribucion ya viene del repositorio con los estados reales (process_states)
// El repositorio ya incluye "Anulado" si hay solicitudes anuladas
const estadoDistribucion = servicio.estado_distribucion || {};
```

## 🎯 Resultado

### Antes (Estados Fijos):
```json
{
  "estado_distribucion": {
    "Pendiente": 5,
    "En Proceso": 3,
    "Finalizado": 10,
    "Anulado": 2
  }
}
```

### Después (Estados Reales - Process States):
```json
{
  "estado_distribucion": {
    "Solicitud Recibida": 3,
    "Revisión de Documentos": 2,
    "Publicación": 1,
    "Certificado Emitido": 5,
    "Finalizado": 4,
    "Anulado": 2
  }
}
```

## 📊 Ejemplos de Estados Reales por Servicio

### Certificación de Marca:
- "Solicitud Recibida"
- "Revisión de Documentos"
- "Publicación"
- "Certificado Emitido"
- "Finalizado"
- "Anulado" (si aplica)

### Renovación de Marca:
- "Solicitud Recibida"
- "Verificación"
- "Renovación Aprobada"
- "Finalizado"
- "Anulado" (si aplica)

### Búsqueda de Antecedentes:
- "Solicitud Recibida"
- "Búsqueda en Proceso"
- "Informe Generado"
- "Finalizado"
- "Anulado" (si aplica)

## 🔍 Detalles Técnicos

### Manejo de "Anulado":
- **"Anulado"** es un estado especial que se guarda en `ordenes_de_servicios.estado`
- **NO** se guarda en `detalles_ordenes_servicio.estado` (process_states)
- Se cuenta por separado y se agrega a la distribución de estados

### Estados de Process States:
- Los estados reales vienen de `detalles_ordenes_servicio.estado`
- Se usa el estado **más reciente** de cada orden de servicio (último registro)
- Cada servicio tiene sus propios process_states definidos en la tabla `procesos`

### Optimización:
- Se usan 2 queries optimizadas en lugar de múltiples queries por servicio
- Query 1: Obtiene servicios con totales y anulados
- Query 2: Obtiene distribución de estados reales agrupada por servicio
- Se combinan los resultados en memoria (más eficiente)

## ✅ Beneficios

1. ✅ **Estados Reales**: Muestra los estados reales de cada servicio (process_states)
2. ✅ **Dinámico**: Se adapta a los process_states definidos para cada servicio
3. ✅ **Preciso**: Refleja el estado actual real de cada solicitud
4. ✅ **Separación Correcta**: "Anulado" se maneja por separado (estado de orden, no de proceso)
5. ✅ **Optimizado**: Consultas eficientes con solo 2 queries

## 🧪 Pruebas

### Endpoint a Probar:
```
GET /api/dashboard/servicios?periodo=12meses
```

### Respuesta Esperada:
```json
{
  "success": true,
  "data": {
    "periodo": "12meses",
    "total_servicios": 7,
    "total_solicitudes": 43,
    "servicios": [
      {
        "id_servicio": 2,
        "nombre": "Certificación de Marca",
        "total_solicitudes": 12,
        "porcentaje_uso": 27.91,
        "estado_distribucion": {
          "Solicitud Recibida": 2,
          "Revisión de Documentos": 3,
          "Publicación": 1,
          "Certificado Emitido": 4,
          "Finalizado": 2,
          "Anulado": 0
        },
        "precio_base": 1848000
      }
    ]
  }
}
```

## 📝 Notas Importantes

1. **Estados Dinámicos**: Los estados en `estado_distribucion` son dinámicos y dependen de los process_states definidos para cada servicio.

2. **Anulado Separado**: "Anulado" siempre se muestra por separado, ya que es un estado de la orden, no del proceso.

3. **Sin Estados**: Si un servicio no tiene solicitudes o todas están anuladas, `estado_distribucion` será un objeto vacío `{}` o solo tendrá `{"Anulado": X}`.

4. **Estados Vacíos**: Si no hay solicitudes en un estado particular, ese estado no aparecerá en `estado_distribucion`.

5. **Compatibilidad**: El frontend debe manejar estados dinámicos en lugar de estados fijos.

## 🔄 Migración

No se requiere migración de base de datos. Los cambios son solo en la lógica de consulta y procesamiento.

## 📚 Archivos Modificados

1. `api_Registrack/src/repositories/dashboard.repository.js`
   - Método `obtenerResumenServicios()` completamente reescrito
   - Ahora usa estados reales desde `detalles_ordenes_servicio`

2. `api_Registrack/src/services/dashboard.service.js`
   - Método `calcularResumenServicios()` simplificado
   - Ya no construye estados fijos, usa los que vienen del repositorio

---

**Fecha de corrección:** 2025-01-09
**Estado:** ✅ Implementado y listo para pruebas
**Prioridad:** 🔴 Alta - Corrige funcionalidad crítica del dashboard

