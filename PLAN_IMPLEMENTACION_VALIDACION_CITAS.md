el re# 📋 Plan de Implementación: Validación y Autocompletado de Citas

**Fecha:** Enero 2026  
**Objetivo:** Validar que no se puedan crear citas duplicadas para usuarios ya registrados y autocompletar datos al buscar por documento

---

## 🎯 Requerimientos

### **1. Validación: No permitir crear cita con documento ya registrado**
- **Problema:** Actualmente se pueden crear múltiples citas para el mismo usuario en la misma fecha/hora
- **Solución:** Validar que el usuario (por documento) no tenga una cita activa (Programada o Reprogramada) en la misma fecha y horario

### **2. Autocompletado: Buscar usuario por documento**
- **Problema:** Al crear una cita, hay que ingresar manualmente todos los datos del usuario
- **Solución:** Crear endpoint para buscar usuario por documento y autocompletar sus datos (nombre, apellido, correo, etc.)

---

## 📝 Cambios Necesarios

### **Cambio 1: Crear Endpoint de Búsqueda de Usuario por Documento**

**Ruta:** `GET /api/gestion-citas/buscar-usuario/:documento`

**Función:** Buscar usuario por documento y retornar sus datos completos

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id_usuario": 1,
      "tipo_documento": "Cédula de Ciudadanía",
      "documento": 1234567890,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@email.com",
      "telefono": "3001234567",
      "id_rol": 1,
      "rol": "cliente",
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
        "estado": "Programada"
      }
    ]
  }
}
```

**Archivo:** `src/controllers/citas.controller.js`
**Función:** `buscarUsuarioPorDocumento`

---

### **Cambio 2: Validar Citas Duplicadas al Crear**

**Modificar función:** `createCita` en `src/controllers/citas.controller.js`

**Lógica:**
1. Cuando se reciba `id_cliente`, obtener el documento del usuario
2. Verificar si el usuario ya tiene una cita activa (estado: "Programada" o "Reprogramada") en la misma fecha y horario
3. Si existe, retornar error 400 con mensaje descriptivo

**Validación:**
```javascript
// Buscar usuario por id_cliente
const usuario = await User.findByPk(id_cliente);
if (!usuario) {
  return res.status(400).json({ 
    message: "El cliente no existe" 
  });
}

// Verificar si ya tiene una cita activa en ese horario
const citaExistente = await Cita.findOne({
  where: {
    id_cliente: id_cliente,
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

if (citaExistente) {
  return res.status(400).json({
    message: "El usuario ya tiene una cita activa en ese horario",
    cita_existente: {
      id_cita: citaExistente.id_cita,
      fecha: citaExistente.fecha,
      hora_inicio: citaExistente.hora_inicio,
      hora_fin: citaExistente.hora_fin,
      estado: citaExistente.estado
    }
  });
}
```

---

### **Cambio 3: Agregar Validación por Documento (Alternativa)**

**Opción adicional:** Permitir buscar por documento directamente en lugar de solo por `id_cliente`

**Endpoint modificado:** `POST /api/gestion-citas`

**Lógica:**
- Si se envía `documento` en lugar de `id_cliente`, buscar el usuario primero
- Validar que el usuario exista y sea un cliente
- Luego crear la cita con el `id_cliente` encontrado

**Body alternativo:**
```json
{
  "fecha": "2026-01-20",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "documento": 1234567890,  // ← En lugar de id_cliente
  "id_empleado": 2,
  "observacion": "Consulta general"
}
```

---

## 🔧 Archivos a Modificar

### **1. `src/controllers/citas.controller.js`**
- ✅ Agregar función `buscarUsuarioPorDocumento`
- ✅ Modificar función `createCita` para validar citas duplicadas
- ✅ Opcional: Modificar `createCita` para aceptar `documento` en lugar de `id_cliente`

### **2. `src/routes/citas.routes.js`**
- ✅ Agregar ruta `GET /buscar-usuario/:documento`

---

## 📊 Flujo de Implementación

### **Paso 1: Crear Endpoint de Búsqueda**

**Archivo:** `src/controllers/citas.controller.js`

**Código:**
```javascript
/**
 * GET /api/gestion-citas/buscar-usuario/:documento
 * Buscar usuario por documento y retornar sus datos para autocompletar
 */
export const buscarUsuarioPorDocumento = async (req, res) => {
  try {
    const { documento } = req.params;

    if (!documento) {
      return res.status(400).json({
        success: false,
        message: "El documento es requerido"
      });
    }

    // Buscar usuario por documento
    const usuario = await User.findOne({
      where: { documento: BigInt(documento) },
      include: [
        {
          model: Rol,
          as: 'rol',
          attributes: ['id_rol', 'nombre']
        }
      ]
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con ese documento"
      });
    }

    // Verificar si es un cliente
    const cliente = await Cliente.findOne({
      where: { id_usuario: usuario.id_usuario }
    });

    if (!cliente) {
      return res.status(400).json({
        success: false,
        message: "El usuario no es un cliente registrado"
      });
    }

    // Buscar citas activas del usuario
    const citasActivas = await Cita.findAll({
      where: {
        id_cliente: usuario.id_usuario,
        estado: {
          [Op.in]: ['Programada', 'Reprogramada']
        }
      },
      order: [['fecha', 'DESC'], ['hora_inicio', 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        usuario: {
          id_usuario: usuario.id_usuario,
          tipo_documento: usuario.tipo_documento,
          documento: usuario.documento.toString(),
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          id_rol: usuario.id_rol,
          rol: usuario.rol?.nombre || null,
          estado: usuario.estado
        },
        cliente: {
          id_cliente: cliente.id_cliente,
          tipo_persona: cliente.tipo_persona,
          estado: cliente.estado
        },
        tiene_citas_activas: citasActivas.length > 0,
        citas_activas: citasActivas.map(cita => ({
          id_cita: cita.id_cita,
          fecha: cita.fecha,
          hora_inicio: cita.hora_inicio,
          hora_fin: cita.hora_fin,
          tipo: cita.tipo,
          modalidad: cita.modalidad,
          estado: cita.estado
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error al buscar usuario por documento:', error);
    res.status(500).json({
      success: false,
      message: "Error al buscar usuario",
      error: error.message
    });
  }
};
```

---

### **Paso 2: Modificar createCita para Validar Duplicados**

**Archivo:** `src/controllers/citas.controller.js`

**Modificación en función `createCita`:**

```javascript
export const createCita = async (req, res) => {
    const { fecha, hora_inicio, hora_fin, tipo, modalidad, id_cliente, id_empleado, observacion, documento } = req.body;
    // ... código existente ...

    try {
        // ✅ NUEVO: Si se envía documento, buscar el usuario primero
        let clienteId = id_cliente;
        if (documento && !id_cliente) {
            const usuario = await User.findOne({
                where: { documento: BigInt(documento) }
            });
            if (!usuario) {
                return res.status(400).json({ 
                    message: "No se encontró un usuario con ese documento" 
                });
            }
            const cliente = await Cliente.findOne({
                where: { id_usuario: usuario.id_usuario }
            });
            if (!cliente) {
                return res.status(400).json({ 
                    message: "El usuario no es un cliente registrado" 
                });
            }
            clienteId = usuario.id_usuario;
        }

        if (!clienteId) {
            return res.status(400).json({ 
                message: "Se requiere id_cliente o documento" 
            });
        }

        // ✅ NUEVO: Validar que el cliente no tenga una cita activa en ese horario
        const citaExistente = await Cita.findOne({
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

        if (citaExistente) {
            return res.status(400).json({
                success: false,
                message: "El usuario ya tiene una cita activa en ese horario",
                data: {
                    cita_existente: {
                        id_cita: citaExistente.id_cita,
                        fecha: citaExistente.fecha,
                        hora_inicio: citaExistente.hora_inicio,
                        hora_fin: citaExistente.hora_fin,
                        tipo: citaExistente.tipo,
                        modalidad: citaExistente.modalidad,
                        estado: citaExistente.estado
                    }
                }
            });
        }

        // ... resto del código existente usando clienteId ...
        
        const newCita = await Cita.create({
            fecha,
            hora_inicio,
            hora_fin,
            tipo,
            modalidad,
            estado,
            id_cliente: clienteId, // ← Usar clienteId
            id_empleado: id_usuario_empleado,
            observacion
        });

        // ... resto del código ...
    } catch (error) {
        // ... manejo de errores ...
    }
};
```

---

### **Paso 3: Agregar Ruta**

**Archivo:** `src/routes/citas.routes.js`

**Agregar:**
```javascript
import { 
    getCitas, 
    createCita, 
    reprogramarCita, 
    anularCita, 
    descargarReporteCitas, 
    validateCreateCita, 
    crearCitaDesdeSolicitud, 
    obtenerCitasDeSolicitud,
    buscarUsuarioPorDocumento  // ← NUEVO
} from "../controllers/citas.controller.js";

// ... código existente ...

// ✅ NUEVO: Buscar usuario por documento
router.get(
  "/buscar-usuario/:documento",
  authMiddleware,
  roleMiddleware(["administrador", "empleado"]),
  buscarUsuarioPorDocumento
);
```

---

## 🧪 Casos de Prueba

### **Test 1: Buscar Usuario por Documento**

**Request:**
```
GET /api/gestion-citas/buscar-usuario/1234567890
Authorization: Bearer TOKEN
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id_usuario": 1,
      "documento": "1234567890",
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@email.com"
    },
    "tiene_citas_activas": false,
    "citas_activas": []
  }
}
```

---

### **Test 2: Intentar Crear Cita Duplicada**

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
```json
{
  "success": false,
  "message": "El usuario ya tiene una cita activa en ese horario",
  "data": {
    "cita_existente": {
      "id_cita": 5,
      "fecha": "2026-01-20",
      "hora_inicio": "10:00:00",
      "hora_fin": "11:00:00",
      "estado": "Programada"
    }
  }
}
```

---

### **Test 3: Crear Cita con Documento (en lugar de id_cliente)**

**Request:**
```
POST /api/gestion-citas
{
  "fecha": "2026-01-20",
  "hora_inicio": "10:00:00",
  "hora_fin": "11:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "documento": 1234567890,  // ← En lugar de id_cliente
  "id_empleado": 2
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 10,
      "fecha": "2026-01-20",
      "hora_inicio": "10:00:00",
      "hora_fin": "11:00:00"
    }
  }
}
```

---

## ✅ Checklist de Implementación

- [ ] **Paso 1:** Crear función `buscarUsuarioPorDocumento` en `citas.controller.js`
- [ ] **Paso 2:** Agregar ruta `GET /buscar-usuario/:documento` en `citas.routes.js`
- [ ] **Paso 3:** Modificar función `createCita` para validar citas duplicadas
- [ ] **Paso 4:** Opcional: Modificar `createCita` para aceptar `documento` en lugar de `id_cliente`
- [ ] **Paso 5:** Agregar import de `Cliente` y `Rol` en `citas.controller.js` si no existen
- [ ] **Paso 6:** Probar endpoint de búsqueda
- [ ] **Paso 7:** Probar validación de citas duplicadas
- [ ] **Paso 8:** Probar creación con documento

---

## 🔍 Validaciones a Implementar

### **1. Validación de Documento**
- ✅ Documento debe ser numérico
- ✅ Usuario debe existir
- ✅ Usuario debe ser un cliente

### **2. Validación de Cita Duplicada**
- ✅ Verificar estado: "Programada" o "Reprogramada"
- ✅ Verificar fecha y horario (solapamiento)
- ✅ Retornar información de la cita existente

### **3. Autocompletado**
- ✅ Retornar datos completos del usuario
- ✅ Retornar citas activas del usuario
- ✅ Formato de respuesta amigable para frontend

---

## 📝 Notas Importantes

1. **BigInt para documento:** Los documentos son BIGINT en la BD, usar `BigInt(documento)` al buscar
2. **Estados de cita:** Solo considerar "Programada" y "Reprogramada" como activas
3. **Horarios:** Validar solapamiento de horarios, no solo fecha
4. **Permisos:** Solo administradores y empleados pueden buscar usuarios
5. **Frontend:** El frontend puede usar el endpoint de búsqueda para autocompletar cuando el usuario ingrese el documento

---

## 🚀 Próximos Pasos

1. Revisar y aprobar el plan
2. Implementar los cambios según el plan
3. Probar los casos de prueba
4. Documentar los nuevos endpoints
5. Actualizar el frontend para usar el autocompletado

---

**¿Estás de acuerdo con este plan? ¿Quieres que lo implemente ahora?**

