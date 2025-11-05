# 💰 Solución: Pago Antes de Activar Solicitud

## 📋 Situación Actual

**Problema identificado:**
- Actualmente las solicitudes se crean y se activan inmediatamente
- El pago se procesa DESPUÉS de crear la solicitud
- Se necesita que el pago sea REQUERIDO antes de que la solicitud se active

**Estado del sistema:**
- ✅ Sistema de pagos con mock implementado
- ✅ Pasarela de pago planeada pero no implementada
- ✅ Los pagos requieren `id_orden_servicio` (la solicitud debe existir primero)

---

## 🎯 Solución Propuesta: Estado "Pendiente de Pago"

### Estrategia

**Flujo propuesto:**
1. Usuario completa formulario → **Crear solicitud con estado "Pendiente de Pago"**
2. Sistema NO asigna procesos ni empleados aún
3. Sistema devuelve `id_orden_servicio` y `monto` a pagar
4. Frontend redirige a página de pago (mock por ahora)
5. Usuario procesa pago → **Sistema verifica pago exitoso**
6. Si pago exitoso → **Activar solicitud** (asignar primer estado del proceso)
7. Si pago falla → Mantener en "Pendiente de Pago"

### Ventajas de esta solución

✅ **Mínimos cambios** en la estructura actual  
✅ **Compatibilidad** con sistema mock actual  
✅ **Fácil migración** a pasarela real (solo cambiar verificación)  
✅ **Trazabilidad** completa (solicitud existe desde el inicio)  
✅ **Admin puede ver** solicitudes pendientes de pago  
✅ **No rompe** relaciones existentes (pago → solicitud)

---

## 🔧 Implementación

### Cambio 1: Modificar `crearSolicitud` - Estado inicial

**Archivo:** `src/controllers/solicitudes.controller.js`

**Cambio en la función `crearSolicitud`:**

```javascript
// Línea ~758: Crear orden con estado "Pendiente de Pago"
const ordenData = {
  // ... campos existentes ...
  estado: "Pendiente de Pago", // ⚠️ CAMBIO: No asignar primer proceso aún
  // ... resto de campos ...
};

const nuevaOrden = await OrdenServicio.create(ordenData);

// ⚠️ CAMBIO: NO asignar primer estado del servicio automáticamente
// Esto se hará cuando se confirme el pago

// ⚠️ CAMBIO: NO crear DetalleOrdenServicio aún
// Se creará cuando se confirme el pago
```

**Respuesta modificada:**

```javascript
return res.status(201).json({
  success: true,
  mensaje: "Solicitud creada. Pendiente de pago para activar.",
  data: {
    orden_id: nuevaOrden.id_orden_servicio,
    servicio: servicioEncontrado,
    estado: "Pendiente de Pago", // ⚠️ Estado especial
    monto_a_pagar: servicioEncontrado.precio_base, // ⚠️ Nuevo campo
    fecha_solicitud: nuevaOrden.fecha_creacion,
    requiere_pago: true, // ⚠️ Nuevo campo
    cliente: { ... },
    empresa: { ... }
  },
  meta: {
    nextSteps: [
      "Complete el pago para activar la solicitud",
      "Una vez pagado, la solicitud será procesada automáticamente"
    ]
  }
});
```

---

### Cambio 2: Crear función para activar solicitud después del pago

**Archivo:** `src/controllers/solicitudes.controller.js` o `src/services/solicitudes.service.js`

**Nueva función:**

```javascript
/**
 * Activa una solicitud después de confirmar el pago
 * Asigna el primer estado del proceso y crea el detalle inicial
 */
export const activarSolicitudDespuesPago = async (idOrdenServicio) => {
  try {
    console.log('🔄 Activando solicitud después de pago:', idOrdenServicio);
    
    // 1. Verificar que la solicitud existe y está en "Pendiente de Pago"
    const orden = await OrdenServicio.findByPk(idOrdenServicio, {
      include: [{ model: Servicio, as: 'servicio' }]
    });
    
    if (!orden) {
      throw new Error('Solicitud no encontrada');
    }
    
    if (orden.estado !== 'Pendiente de Pago') {
      console.log('⚠️ Solicitud ya está activa o en otro estado:', orden.estado);
      return { 
        success: false, 
        mensaje: `La solicitud ya está en estado: ${orden.estado}` 
      };
    }
    
    // 2. Obtener el primer proceso del servicio
    const procesos = await Proceso.findAll({
      where: { servicio_id: orden.id_servicio },
      order: [['order_number', 'ASC']]
    });
    
    if (procesos.length === 0) {
      // Si no hay procesos, usar estado por defecto
      await orden.update({ estado: 'Pendiente' });
      await DetalleOrdenServicio.create({
        id_orden_servicio: orden.id_orden_servicio,
        id_servicio: orden.id_servicio,
        estado: 'Pendiente',
        fecha_estado: new Date()
      });
      
      return {
        success: true,
        mensaje: 'Solicitud activada con estado por defecto',
        estado: 'Pendiente'
      };
    }
    
    // 3. Asignar primer proceso
    const primerProceso = procesos[0];
    
    // Crear registro en DetalleOrdenServicio
    await DetalleOrdenServicio.create({
      id_orden_servicio: orden.id_orden_servicio,
      id_servicio: orden.id_servicio,
      estado: primerProceso.nombre,
      fecha_estado: new Date()
    });
    
    // Actualizar estado de la orden
    await orden.update({ estado: primerProceso.nombre });
    
    console.log('✅ Solicitud activada con estado:', primerProceso.nombre);
    
    // 4. Enviar email de confirmación (si aplica)
    // (El email de nueva solicitud ya se envió al crear, pero podrías enviar uno de confirmación de pago)
    
    return {
      success: true,
      mensaje: 'Solicitud activada exitosamente',
      estado: primerProceso.nombre,
      orden_id: orden.id_orden_servicio
    };
    
  } catch (error) {
    console.error('❌ Error al activar solicitud:', error);
    throw error;
  }
};
```

---

### Cambio 3: Modificar `procesarPagoMock` para activar solicitud

**Archivo:** `src/services/pago.service.js`

**Modificar función `procesarPagoMock`:**

```javascript
async procesarPagoMock(paymentData) {
  try {
    console.log('💰 Procesando pago con mock...', paymentData);
    
    // 1. Procesar pago con mock (código existente)
    const paymentResult = await this.paymentGateway.processPayment(paymentData);
    
    if (!paymentResult.success) {
      return {
        success: false,
        error: paymentResult.error || 'Error al procesar pago',
        payment: null
      };
    }

    // 2. Crear registro de pago (código existente)
    const pago = await this.crearPago({
      ...paymentData,
      transaction_id: paymentResult.transaction_id,
      gateway: paymentResult.gateway || 'mock',
      estado: paymentResult.status === 'paid' ? 'Pagado' : 'Pendiente',
      verified_at: paymentResult.verified ? new Date() : null,
      verification_method: 'mock'
    });

    // 3. ⚠️ NUEVO: Si pago exitoso, activar la solicitud
    if (paymentResult.success && paymentResult.verified && paymentData.id_orden_servicio) {
      try {
        const { activarSolicitudDespuesPago } = await import('../controllers/solicitudes.controller.js');
        const activacion = await activarSolicitudDespuesPago(paymentData.id_orden_servicio);
        
        if (activacion.success) {
          console.log('✅ Solicitud activada después de pago:', activacion.estado);
        } else {
          console.log('⚠️ No se pudo activar solicitud:', activacion.mensaje);
        }
      } catch (activacionError) {
        console.error('❌ Error al activar solicitud:', activacionError);
        // No fallar el pago si falla la activación (se puede activar manualmente después)
      }
    }

    // 4. Si pago exitoso, generar comprobante y enviar email (código existente)
    if (paymentResult.success && paymentResult.verified) {
      try {
        await this.generarYEnviarComprobante(pago.id_pago);
      } catch (error) {
        console.error('⚠️ Error al generar comprobante/email:', error);
      }
    }

    return {
      success: true,
      payment: pago,
      transaction_id: paymentResult.transaction_id,
      solicitud_activada: paymentResult.success && paymentResult.verified ? true : false // ⚠️ Nuevo campo
    };

  } catch (error) {
    console.error('❌ Error al procesar pago:', error);
    throw error;
  }
}
```

---

### Cambio 4: Actualizar documentación del flujo

**Archivo:** `FORMULARIOS_COMPLETOS_SOLICITUDES_SERVICIO.md`

**Agregar sección de flujo de pago:**

```markdown
## 💰 Flujo de Pago Requerido

### Paso 1: Crear Solicitud
La solicitud se crea con estado "Pendiente de Pago" y NO se activa aún.

**Respuesta:**
```json
{
  "success": true,
  "mensaje": "Solicitud creada. Pendiente de pago para activar.",
  "data": {
    "orden_id": 123,
    "estado": "Pendiente de Pago",
    "monto_a_pagar": 500000.00,
    "requiere_pago": true
  }
}
```

### Paso 2: Procesar Pago
El frontend debe redirigir al usuario a procesar el pago usando el `orden_id`.

**Endpoint:** `POST /api/gestion-pagos/process-mock`

**Body:**
```json
{
  "monto": 500000.00,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": 123
}
```

### Paso 3: Confirmación Automática
Si el pago es exitoso, la solicitud se activa automáticamente con el primer estado del proceso.

**Respuesta:**
```json
{
  "success": true,
  "message": "Pago procesado exitosamente",
  "data": {
    "payment": { ... },
    "solicitud_activada": true
  }
}
```
```

---

## 📱 Cambios en el Frontend

### Flujo actualizado

1. **Usuario completa formulario** → Enviar a `POST /api/gestion-solicitudes/crear/:servicio`
2. **Sistema responde** con `orden_id`, `monto_a_pagar` y `requiere_pago: true`
3. **Frontend muestra modal/página de pago** con:
   - Monto a pagar
   - Métodos de pago disponibles
   - Botón "Procesar Pago"
4. **Usuario hace clic en "Procesar Pago"** → `POST /api/gestion-pagos/process-mock`
5. **Si pago exitoso:**
   - Mostrar confirmación
   - Redirigir a detalle de solicitud (ya activa)
   - Mostrar mensaje: "Solicitud activada. Proceso iniciado."
6. **Si pago falla:**
   - Mostrar error
   - Permitir reintentar
   - Mantener solicitud en "Pendiente de Pago"

### Ejemplo de código React

```jsx
const crearSolicitudConPago = async (formData, servicioId) => {
  try {
    // 1. Crear solicitud
    const response = await fetch(`/api/gestion-solicitudes/crear/${servicioId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const solicitudData = await response.json();
    
    if (!response.ok) {
      throw new Error(solicitudData.mensaje || 'Error al crear solicitud');
    }
    
    // 2. Si requiere pago, mostrar modal de pago
    if (solicitudData.data.requiere_pago) {
      setModalPago({
        mostrar: true,
        ordenId: solicitudData.data.orden_id,
        monto: solicitudData.data.monto_a_pagar
      });
    }
    
    return solicitudData;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const procesarPago = async (ordenId, monto, metodoPago) => {
  try {
    const response = await fetch('/api/gestion-pagos/process-mock', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        monto,
        metodo_pago: metodoPago,
        id_orden_servicio: ordenId
      })
    });
    
    const pagoData = await response.json();
    
    if (pagoData.success && pagoData.data.solicitud_activada) {
      // Solicitud activada exitosamente
      showSuccess('Pago procesado. Solicitud activada.');
      navigate(`/solicitudes/${ordenId}`);
    } else {
      throw new Error(pagoData.error || 'Error al procesar pago');
    }
    
    return pagoData;
    
  } catch (error) {
    console.error('Error al procesar pago:', error);
    throw error;
  }
};
```

---

## 🔄 Migración a Pasarela Real

Cuando implementen la pasarela real (PayPal, Stripe, Wompi), solo necesitan:

1. **Cambiar el método de verificación de pago:**
   - En lugar de `paymentGateway.processPayment()` mock
   - Usar la pasarela real
   - La función `activarSolicitudDespuesPago()` sigue igual

2. **Manejar webhooks de confirmación:**
   - Cuando la pasarela confirme el pago vía webhook
   - Llamar a `activarSolicitudDespuesPago(ordenId)`

3. **No cambiar** la estructura de estados ni la lógica de activación

---

## ✅ Checklist de Implementación

- [ ] Modificar `crearSolicitud` para crear con estado "Pendiente de Pago"
- [ ] Crear función `activarSolicitudDespuesPago`
- [ ] Modificar `procesarPagoMock` para activar solicitud después de pago
- [ ] Actualizar documentación de formularios
- [ ] Actualizar README.md con nuevo flujo
- [ ] Probar flujo completo: crear → pagar → activar
- [ ] Probar caso de pago fallido
- [ ] Actualizar frontend para mostrar modal de pago
- [ ] Agregar validación: verificar que no haya pago previo antes de activar

---

## 🚨 Consideraciones Importantes

### 1. Validación de Pago Duplicado
Antes de activar, verificar que no haya otro pago ya procesado para esa solicitud:

```javascript
// En activarSolicitudDespuesPago, antes de activar:
const pagosExistentes = await PagoRepository.findByOrdenServicio(idOrdenServicio);
const pagoPagado = pagosExistentes.find(p => p.estado === 'Pagado' && p.verified_at);

if (pagoPagado && orden.estado !== 'Pendiente de Pago') {
  return { 
    success: false, 
    mensaje: 'Solicitud ya tiene un pago procesado' 
  };
}
```

### 2. Timeout de Solicitudes Pendientes
Considerar agregar un job que:
- Detecte solicitudes en "Pendiente de Pago" por más de X días
- Envíe recordatorio al cliente
- Opcional: cancelar automáticamente después de Y días

### 3. Estado en el Dashboard
Agregar filtro/vista para solicitudes "Pendientes de Pago" en el dashboard administrativo.

---

## 📊 Estados de Solicitud

### Estados posibles:
- **"Pendiente de Pago"** - Recién creada, esperando pago
- **[Nombre del proceso]** - Estados dinámicos según el servicio (ej: "Solicitud Recibida", "Revisión de Documentos")
- **"Anulada"** - Cancelada por admin/cliente
- **"Finalizada"** - Proceso completado

---

**Fecha de propuesta:** Enero 2025  
**Versión:** 1.0  
**Estado:** Pendiente de implementación

