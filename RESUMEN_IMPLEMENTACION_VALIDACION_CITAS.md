# ✅ Resumen de Implementación: Validación y Autocompletado de Citas

**Fecha:** Enero 2026  
**Estado:** ✅ **IMPLEMENTADO**  
**Archivos Modificados:** 2

---

## 📋 Cambios Implementados

### **1. Nuevo Endpoint: Buscar Usuario por Documento**

**Ruta:** `GET /api/gestion-citas/buscar-usuario/:documento`

**Funcionalidad:**
- Busca usuario por documento
- Retorna datos completos del usuario (nombre, apellido, correo, etc.)
- Verifica que el usuario sea un cliente registrado
- Retorna citas activas del usuario

**Archivo:** `src/controllers/citas.controller.js`  
**Función:** `buscarUsuarioPorDocumento` (líneas 1187-1307)

**Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id_usuario": 1,
      "tipo_documento": "Cédula de Ciudadanía",
      "documento": "1234567890",
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@email.com",
      "id_rol": 1,
      "rol": "cliente",
      "estado": true
    },
    "cliente": {
      "id_cliente": 1,
      "tipo_persona": "Natural",
      "estado": true
    },
    "tiene_citas_activas": true,
    "citas_activas": [
      {
        "id_cita": 5,
        "fecha": "2026-01-20",
        "hora_inicio": "10:00:00",
        "hora_fin": "11:00:00",
        "tipo": "General",
        "modalidad": "Presencial",
        "estado": "Programada"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-15T10:30:00.000Z",
    "total_citas_activas": 1
  }
}
```

---

### **2. Validación de Citas Duplicadas**

**Modificación:** Función `createCita` en `src/controllers/citas.controller.js`

**Funcionalidad:**
- Valida que el cliente no tenga una cita activa en el mismo horario
- Verifica estados: "Programada" o "Reprogramada"
- Retorna error 400 con información de la cita existente si hay duplicado

**Código Agregado:** Líneas 196-232

**Validación:**
```javascript
// Validar que el cliente no tenga una cita activa en ese horario
const citaExistenteCliente = await Cita.findOne({
  where: {
    id_cliente: clienteId,
    fecha: fecha,
    estado: {
      [Op.in]: ['Programada', 'Reprogramada']
    },
    hora_inicio: {
      [Op.lt]: hora_fin
    },
    hora_fin: {
      [Op.gt]: hora_inicio
    }
  }
});

if (citaExistenteCliente) {
  return res.status(400).json({
    success: false,
    message: "El usuario ya tiene una cita activa en ese horario",
    data: {
      cita_existente: {
        id_cita: citaExistenteCliente.id_cita,
        fecha: citaExistenteCliente.fecha,
        hora_inicio: citaExistenteCliente.hora_inicio,
        hora_fin: citaExistenteCliente.hora_fin,
        tipo: citaExistenteCliente.tipo,
        modalidad: citaExistenteCliente.modalidad,
        estado: citaExistenteCliente.estado
      }
    }
  });
}
```

---

### **3. Soporte para Crear Cita con Documento**

**Modificación:** Función `createCita` en `src/controllers/citas.controller.js`

**Funcionalidad:**
- Permite crear cita usando `documento` en lugar de solo `id_cliente`
- Busca automáticamente el usuario por documento
- Valida que el usuario exista y sea un cliente

**Código Agregado:** Líneas 148-194

**Validación de Campos:**
```javascript
// Validar que se proporcione id_cliente O documento (no ambos requeridos)
if (!id_cliente && !documento) {
    missingFields.push('id_cliente o documento');
}
```

**Búsqueda de Usuario:**
```javascript
if (documento && !id_cliente) {
    const usuario = await User.findOne({
        where: { documento: BigInt(documento) }
    });
    
    if (!usuario) {
        return res.status(400).json({ 
            success: false,
            message: "No se encontró un usuario con ese documento"
        });
    }
    
    // Verificar que el usuario sea un cliente
    const cliente = await Cliente.findOne({
        where: { id_usuario: usuario.id_usuario }
    });
    
    if (!cliente) {
        return res.status(400).json({ 
            success: false,
            message: "El usuario no es un cliente registrado"
        });
    }
    
    clienteId = usuario.id_usuario;
}
```

---

## 📝 Archivos Modificados

### **1. `src/controllers/citas.controller.js`**

**Cambios:**
- ✅ Agregado import de `Rol` (línea 4)
- ✅ Modificada función `createCita`:
  - Acepta `documento` como parámetro (línea 86)
  - Valida campos (acepta `documento` o `id_cliente`) (líneas 89-109)
  - Busca usuario por documento si se proporciona (líneas 148-194)
  - Valida citas duplicadas (líneas 196-232)
  - Usa `clienteId` en lugar de `id_cliente` (líneas 286, 294)
- ✅ Agregada función `buscarUsuarioPorDocumento` (líneas 1187-1307)

### **2. `src/routes/citas.routes.js`**

**Cambios:**
- ✅ Agregado import de `buscarUsuarioPorDocumento` (línea 2)
- ✅ Agregada ruta `GET /buscar-usuario/:documento` (líneas 91-101)

---

## 🧪 Casos de Prueba

### **Test 1: Buscar Usuario por Documento**

**Request:**
```
GET /api/gestion-citas/buscar-usuario/1234567890
Authorization: Bearer TOKEN
```

**Respuesta Esperada:**
- ✅ Status 200
- ✅ Datos del usuario
- ✅ Citas activas (si existen)

---

### **Test 2: Crear Cita con Documento**

**Request:**
```
POST /api/gestion-citas
{
  "fecha": "2026-01-20",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "documento": 1234567890,
  "id_empleado": 2
}
```

**Respuesta Esperada:**
- ✅ Status 201
- ✅ Cita creada correctamente

---

### **Test 3: Intentar Crear Cita Duplicada**

**Request:**
```
POST /api/gestion-citas
{
  "fecha": "2026-01-20",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_cliente": 1,
  "id_empleado": 2
}
```

**Si ya existe una cita activa:**
- ✅ Status 400
- ✅ Mensaje: "El usuario ya tiene una cita activa en ese horario"
- ✅ Información de la cita existente

---

## ✅ Checklist de Implementación

- [x] **Paso 1:** Crear función `buscarUsuarioPorDocumento` en `citas.controller.js`
- [x] **Paso 2:** Agregar ruta `GET /buscar-usuario/:documento` en `citas.routes.js`
- [x] **Paso 3:** Modificar función `createCita` para validar citas duplicadas
- [x] **Paso 4:** Modificar función `createCita` para aceptar `documento` en lugar de solo `id_cliente`
- [x] **Paso 5:** Agregar import de `Rol` en `citas.controller.js`
- [x] **Paso 6:** Verificar que no hay errores de linting

---

## 🚀 Próximos Pasos (Frontend)

1. **Implementar Autocompletado:**
   - Cuando el usuario ingrese el documento, llamar a `GET /api/gestion-citas/buscar-usuario/:documento`
   - Autocompletar campos: nombre, apellido, correo
   - Mostrar citas activas si existen

2. **Mostrar Validación:**
   - Si el usuario ya tiene una cita activa, mostrar un mensaje informativo
   - Permitir ver los detalles de la cita existente

3. **Manejo de Errores:**
   - Si el documento no existe, mostrar mensaje de error
   - Si el usuario no es un cliente, mostrar mensaje apropiado

---

## 📊 Resumen de Funcionalidades

| Funcionalidad | Estado | Endpoint |
|---------------|--------|----------|
| Buscar usuario por documento | ✅ | `GET /api/gestion-citas/buscar-usuario/:documento` |
| Validar citas duplicadas | ✅ | `POST /api/gestion-citas` |
| Crear cita con documento | ✅ | `POST /api/gestion-citas` |
| Crear cita con id_cliente | ✅ | `POST /api/gestion-citas` |

---

## ⚠️ Notas Importantes

1. **BigInt para documento:** Los documentos son BIGINT en la BD, usar `BigInt(documento)` al buscar
2. **Estados de cita:** Solo considerar "Programada" y "Reprogramada" como activas
3. **Horarios:** Validar solapamiento de horarios, no solo fecha
4. **Permisos:** Solo administradores y empleados pueden buscar usuarios
5. **Rol:** Se obtiene el rol del usuario de forma separada para evitar problemas de relaciones

---

## 🎯 Resultados Esperados

1. ✅ **No se pueden crear citas duplicadas** para el mismo usuario en el mismo horario
2. ✅ **Autocompletado funcional** cuando se busca por documento
3. ✅ **Flexibilidad** para crear citas con `documento` o `id_cliente`
4. ✅ **Mensajes de error claros** y descriptivos

---

**Última actualización:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ **IMPLEMENTACIÓN COMPLETA**

