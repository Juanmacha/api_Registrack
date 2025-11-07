# 📋 Plan de Implementación: Estado "Finalizada" para Citas

**Fecha:** Enero 2026  
**Problema:** Las citas que ya pasaron su fecha/hora no tienen un estado que indique que ya se realizaron

---

## 🎯 Objetivo

Implementar el estado "Finalizada" para citas que ya pasaron su fecha y hora, permitiendo:
1. Actualización automática al consultar citas
2. Marcar manualmente citas como finalizadas
3. Filtrar citas por estado (Programada, Reprogramada, Anulada, Finalizada)

---

## 📊 Cambios Necesarios

### **1. Base de Datos**
- ✅ Agregar `'Finalizada'` al ENUM de estados en la tabla `citas`
- ✅ Migración SQL para actualizar el esquema

### **2. Modelo Sequelize**
- ✅ Actualizar validación de estados en `src/models/citas.js`

### **3. Controlador**
- ✅ Función para verificar y actualizar citas pasadas automáticamente
- ✅ Endpoint para marcar citas como finalizadas manualmente
- ✅ Actualizar `getCitas` para incluir lógica de actualización automática

### **4. Validaciones**
- ✅ Permitir cambiar estado a "Finalizada" solo si la fecha/hora ya pasó
- ✅ No permitir reprogramar o anular citas finalizadas

---

## 🔄 Lógica de Actualización Automática

**Criterios para marcar como "Finalizada":**
- `fecha < fecha_actual` O
- `fecha === fecha_actual AND hora_fin < hora_actual`
- Estado actual NO es "Anulada" (las citas anuladas no se finalizan)

**Cuándo se actualiza:**
- Al consultar todas las citas (`GET /api/gestion-citas`)
- Al consultar una cita específica
- Opcional: Tarea programada (cron job) diaria

---

## 📝 Estados Finales

| Estado | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| `Programada` | Cita creada y pendiente | Cita futura recién creada |
| `Reprogramada` | Cita modificada | Cita que fue reprogramada |
| `Anulada` | Cita cancelada | Cita cancelada antes de su fecha |
| `Finalizada` | Cita realizada | Cita que ya pasó su fecha/hora |

---

## ✅ Implementación

### **Paso 1: Migración SQL**
```sql
ALTER TABLE citas 
MODIFY COLUMN estado ENUM('Programada', 'Reprogramada', 'Anulada', 'Finalizada') 
DEFAULT 'Programada';
```

### **Paso 2: Actualizar Modelo**
```javascript
validate: {
  isIn: [['Programada', 'Reprogramada', 'Anulada', 'Finalizada']]
}
```

### **Paso 3: Función de Actualización Automática**
```javascript
const actualizarCitasFinalizadas = async () => {
  const ahora = new Date();
  const fechaActual = ahora.toISOString().split('T')[0];
  const horaActual = ahora.toTimeString().split(' ')[0];
  
  // Actualizar citas pasadas que no estén anuladas
  await Cita.update(
    { estado: 'Finalizada' },
    {
      where: {
        estado: { [Op.in]: ['Programada', 'Reprogramada'] },
        [Op.or]: [
          { fecha: { [Op.lt]: fechaActual } },
          {
            fecha: fechaActual,
            hora_fin: { [Op.lt]: horaActual }
          }
        ]
      }
    }
  );
};
```

### **Paso 4: Endpoint Manual**
```javascript
PUT /api/gestion-citas/:id/finalizar
```

---

## 🧪 Casos de Prueba

1. **Cita pasada automática:**
   - Crear cita con fecha pasada
   - Consultar citas
   - Verificar que se actualizó a "Finalizada"

2. **Cita pasada manual:**
   - Crear cita con fecha pasada
   - Marcar manualmente como "Finalizada"
   - Verificar que se guardó correctamente

3. **Cita anulada:**
   - Anular una cita
   - Esperar a que pase su fecha
   - Verificar que NO se actualiza a "Finalizada"

4. **Cita futura:**
   - Crear cita futura
   - Verificar que sigue en "Programada"

---

## 📊 Impacto

- ✅ Mejor trazabilidad de citas realizadas
- ✅ Reportes más precisos
- ✅ Filtrado por estado "Finalizada"
- ✅ Distinción entre citas anuladas y finalizadas

---

## ✅ Implementación Completa

### **Archivos Modificados:**
1. ✅ `database/migrations/add_estado_completada_citas.sql` → `add_estado_finalizada_citas.sql`
2. ✅ `src/models/citas.js` - Agregado estado "Finalizada"
3. ✅ `src/controllers/citas.controller.js` - Función `actualizarCitasFinalizadas()` y endpoint `finalizarCita()`
4. ✅ `src/routes/citas.routes.js` - Ruta `PUT /:id/finalizar`

### **Endpoints Nuevos:**
- `PUT /api/gestion-citas/:id/finalizar` - Marcar cita como finalizada manualmente

### **Funcionalidades:**
- ✅ Actualización automática al consultar citas
- ✅ Validación: No se puede reprogramar/anular citas finalizadas
- ✅ Validación: No se puede finalizar citas anuladas
- ✅ Validación: No se puede finalizar citas que aún no terminan

---

**Estado:** ✅ **IMPLEMENTADO**

