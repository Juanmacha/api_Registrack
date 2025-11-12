# 📅 Flujo de Agendamiento de Citas con Usuarios No Creados

**Fecha:** Enero 2026  
**Versión:** 1.0

---

## 🔍 Resumen Ejecutivo

**⚠️ IMPORTANTE:** El sistema **NO permite agendar citas con usuarios no creados**. El usuario debe existir previamente en el sistema y debe ser un cliente registrado.

---

## 📋 Flujo Actual del Sistema

### **1. Endpoint de Búsqueda de Usuario por Documento**

**Ruta:** `GET /api/gestion-citas/buscar-usuario/:documento`  
**Permisos:** Solo Administrador y Empleado

**Funcionalidad:**
- Busca un usuario por número de documento
- Valida que el usuario exista
- Verifica que el usuario sea un cliente registrado
- Retorna datos del usuario y sus citas activas

**Código:**
```javascript
export const buscarUsuarioPorDocumento = async (req, res) => {
  const { documento } = req.params;
  
  // 1. Buscar usuario por documento
  const usuario = await User.findOne({
    where: { documento: BigInt(documento) }
  });
  
  // 2. Si no existe, retornar error
  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: "Usuario no encontrado con ese documento",
      documento: documento
    });
  }
  
  // 3. Verificar que sea cliente
  const cliente = await Cliente.findOne({
    where: { id_usuario: usuario.id_usuario }
  });
  
  // 4. Si no es cliente, retornar error
  if (!cliente) {
    return res.status(400).json({
      success: false,
      message: "El usuario no es un cliente registrado",
      documento: documento,
      id_usuario: usuario.id_usuario,
      rol: rolUsuario?.nombre || 'No definido'
    });
  }
  
  // 5. Retornar datos del usuario y citas activas
  res.json({
    success: true,
    data: {
      usuario: { /* datos del usuario */ },
      cliente: { /* datos del cliente */ },
      tiene_citas_activas: citasActivas.length > 0,
      citas_activas: citasActivas
    }
  });
};
```

---

### **2. Creación de Cita con Documento**

**Ruta:** `POST /api/gestion-citas`  
**Permisos:** Administrador, Empleado, Cliente

**Parámetros:**
- `documento` (opcional): Número de documento del cliente
- `id_cliente` (opcional): ID del cliente
- **Nota:** Se debe proporcionar `documento` O `id_cliente` (no ambos)

**Flujo:**

#### **Paso 1: Validación de Campos**
```javascript
// Validar que se proporcione id_cliente O documento
if (!id_cliente && !documento) {
    return res.status(400).json({
        message: "Los siguientes campos son obligatorios:",
        campos_faltantes: ['id_cliente o documento'],
        nota: "Debe proporcionar 'id_cliente' o 'documento' (no ambos)"
    });
}
```

#### **Paso 2: Búsqueda de Usuario (si se envía documento)**
```javascript
if (documento && !id_cliente) {
    // 1. Buscar usuario por documento
    const usuario = await User.findOne({
        where: { documento: BigInt(documento) }
    });
    
    // 2. Si no existe, retornar error
    if (!usuario) {
        return res.status(400).json({ 
            success: false,
            message: "No se encontró un usuario con ese documento",
            documento: documento.toString()
        });
    }
    
    // 3. Verificar que sea cliente
    const cliente = await Cliente.findOne({
        where: { id_usuario: usuario.id_usuario }
    });
    
    // 4. Si no es cliente, retornar error
    if (!cliente) {
        return res.status(400).json({ 
            success: false,
            message: "El usuario no es un cliente registrado",
            documento: documento.toString(),
            id_usuario: usuario.id_usuario
        });
    }
    
            // 5. ✅ VALIDAR INTEGRIDAD DE DATOS: Verificar que los datos enviados coincidan con los datos reales
            const datosEnviados = {
                nombre: nombre || null,
                apellido: apellido || null,
                correo: correo || null,
                tipo_documento: tipo_documento || null,
                telefono: telefono || null
            };
            
            const discrepancias = validarDatosUsuarioConDocumento(usuario, datosEnviados);
            
            if (discrepancias.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Los datos enviados no coinciden con los datos registrados del usuario",
                    documento: documento.toString(),
                    discrepancias: discrepancias,
                    datos_reales: {
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        correo: usuario.correo,
                        tipo_documento: usuario.tipo_documento,
                        telefono: usuario.telefono || null
                    },
                    instrucciones: "Por favor, verifique los datos y vuelva a intentar. Los datos deben coincidir exactamente con los registrados en el sistema."
                });
            }
            
            // 6. Usar id_usuario como clienteId
            clienteId = usuario.id_usuario;
            console.log('✅ Usuario encontrado y datos validados:', usuario.nombre, usuario.apellido, 'ID:', clienteId);
        }
```

#### **Paso 3: Validación de Citas Duplicadas**
```javascript
// Validar que el cliente no tenga una cita activa en ese horario
const citaExistenteCliente = await Cita.findOne({
    where: {
        id_cliente: clienteId,
        fecha: fecha,
        estado: {
            [Op.in]: ['Programada', 'Reprogramada']
        },
        hora_inicio: { [Op.lt]: hora_fin },
        hora_fin: { [Op.gt]: hora_inicio }
    }
});

if (citaExistenteCliente) {
    return res.status(400).json({
        success: false,
        message: "El usuario ya tiene una cita activa en ese horario",
        data: {
            cita_existente: { /* datos de la cita */ }
        }
    });
}
```

#### **Paso 4: Creación de la Cita**
```javascript
const newCita = await Cita.create({
    fecha,
    hora_inicio,
    hora_fin,
    tipo: tipo,
    modalidad,
    estado,
    id_cliente: clienteId, // ✅ Usar clienteId (puede venir de documento o id_cliente)
    id_empleado: id_usuario_empleado,
    observacion
});
```

---

## ❌ Limitaciones Actuales

### **1. No se Crea Usuario Automáticamente**
- ❌ Si el usuario no existe, el sistema **NO lo crea automáticamente**
- ❌ Se retorna un error 400: "No se encontró un usuario con ese documento"
- ✅ El usuario debe existir previamente en el sistema

### **2. No se Crea Cliente Automáticamente**
- ❌ Si el usuario existe pero no es cliente, el sistema **NO lo registra como cliente**
- ❌ Se retorna un error 400: "El usuario no es un cliente registrado"
- ✅ El usuario debe estar registrado como cliente previamente

### **3. Validación Estricta de Datos**
- ✅ El sistema valida que el usuario exista
- ✅ El sistema valida que el usuario sea cliente
- ✅ **NUEVO:** El sistema valida que los datos enviados (nombre, apellido, correo, etc.) coincidan con los datos reales del usuario
- ✅ El sistema valida que no haya citas duplicadas

### **4. Validación de Integridad de Datos (NUEVO)**
- ✅ **Campos validados:** nombre, apellido, correo, tipo_documento, telefono
- ✅ **Normalización:** 
  - Nombres y apellidos: comparación en minúsculas (sin espacios extras)
  - Correos: comparación en minúsculas
  - Teléfonos: normalización (remover espacios, guiones, paréntesis)
  - Tipo de documento: comparación exacta (case-sensitive)
- ✅ **Campos opcionales:** Si un campo no se envía, no se valida (solo se valida si se proporciona)
- ✅ **Mensajes de error:** Incluyen datos reales del usuario para referencia
- ✅ **Seguridad:** Previene agendamiento de citas con datos falsos o incorrectos

---

## 🔄 Flujo Completo del Agendamiento

### **Escenario 1: Usuario No Existe**

```
1. Frontend envía: { documento: "1234567890", ... }
2. Backend busca usuario por documento
3. ❌ Usuario no encontrado
4. Backend retorna: Error 400 - "No se encontró un usuario con ese documento"
5. ❌ Cita NO creada
```

### **Escenario 2: Usuario Existe pero No Es Cliente**

```
1. Frontend envía: { documento: "1234567890", ... }
2. Backend busca usuario por documento
3. ✅ Usuario encontrado
4. Backend verifica si es cliente
5. ❌ Usuario no es cliente
6. Backend retorna: Error 400 - "El usuario no es un cliente registrado"
7. ❌ Cita NO creada
```

### **Escenario 3: Usuario Existe y Es Cliente, pero Datos Incorrectos**

```
1. Frontend envía: { documento: "1234567890", nombre: "Juan", apellido: "Pérez", ... }
2. Backend busca usuario por documento
3. ✅ Usuario encontrado
4. Backend verifica si es cliente
5. ✅ Usuario es cliente
6. Backend valida integridad de datos
7. ❌ Datos no coinciden (ej: nombre real es "Juan Carlos", no "Juan")
8. Backend retorna: Error 400 - "Los datos enviados no coinciden con los datos registrados del usuario"
9. ❌ Cita NO creada
```

### **Escenario 4: Usuario Existe y Es Cliente, Datos Correctos (Éxito)**

```
1. Frontend envía: { documento: "1234567890", nombre: "Juan Carlos", apellido: "Pérez", ... }
2. Backend busca usuario por documento
3. ✅ Usuario encontrado
4. Backend verifica si es cliente
5. ✅ Usuario es cliente
6. Backend valida integridad de datos
7. ✅ Datos coinciden
8. Backend valida citas duplicadas
9. ✅ No hay citas duplicadas
10. Backend crea la cita
11. ✅ Cita creada exitosamente
```

---

## 🛠️ Soluciones Propuestas

### **Opción 1: Crear Usuario Automáticamente (NO RECOMENDADO)**

**Descripción:** Crear usuario y cliente automáticamente si no existen.

**Pros:**
- ✅ Permite agendar citas sin registro previo
- ✅ Simplifica el flujo para el usuario

**Contras:**
- ❌ Requiere datos adicionales (nombre, apellido, correo, teléfono)
- ❌ Puede crear usuarios duplicados
- ❌ Requiere validación de datos más compleja
- ❌ Puede generar datos incompletos

**Implementación:**
```javascript
if (documento && !id_cliente) {
    let usuario = await User.findOne({
        where: { documento: BigInt(documento) }
    });
    
    // Si no existe, crear usuario automáticamente
    if (!usuario) {
        // ⚠️ REQUIERE: nombre, apellido, correo, teléfono, tipo_documento
        usuario = await User.create({
            documento: BigInt(documento),
            nombre: req.body.nombre || 'Sin nombre',
            apellido: req.body.apellido || 'Sin apellido',
            correo: req.body.correo || `sin-correo-${documento}@temp.com`,
            telefono: req.body.telefono || null,
            tipo_documento: req.body.tipo_documento || 'CC',
            contrasena: await bcrypt.hash('temp123', 10), // Contraseña temporal
            id_rol: 1 // Rol cliente
        });
        
        // Crear cliente automáticamente
        await Cliente.create({
            id_usuario: usuario.id_usuario,
            tipo_persona: req.body.tipo_persona || 'Natural',
            estado: true
        });
    }
    
    clienteId = usuario.id_usuario;
}
```

---

### **Opción 2: Endpoint de Pre-registro (RECOMENDADO)**

**Descripción:** Crear un endpoint separado para pre-registrar usuarios antes de agendar citas.

**Pros:**
- ✅ Separación de responsabilidades
- ✅ Validación completa de datos
- ✅ Evita crear usuarios incompletos
- ✅ Permite validar datos antes de crear la cita

**Contras:**
- ❌ Requiere un paso adicional en el flujo
- ❌ Puede ser más lento

**Implementación:**
```javascript
// Endpoint: POST /api/usuarios/pre-registro
export const preRegistrarUsuario = async (req, res) => {
    const { documento, nombre, apellido, correo, telefono, tipo_documento, tipo_persona } = req.body;
    
    // Validar campos requeridos
    if (!documento || !nombre || !apellido || !correo) {
        return res.status(400).json({
            success: false,
            message: "Campos requeridos: documento, nombre, apellido, correo"
        });
    }
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({
        where: { documento: BigInt(documento) }
    });
    
    if (usuarioExistente) {
        return res.status(400).json({
            success: false,
            message: "El usuario ya existe",
            id_usuario: usuarioExistente.id_usuario
        });
    }
    
    // Crear usuario
    const nuevoUsuario = await User.create({
        documento: BigInt(documento),
        nombre,
        apellido,
        correo,
        telefono: telefono || null,
        tipo_documento: tipo_documento || 'CC',
        contrasena: await bcrypt.hash('temp123', 10), // Contraseña temporal
        id_rol: 1 // Rol cliente
    });
    
    // Crear cliente
    const nuevoCliente = await Cliente.create({
        id_usuario: nuevoUsuario.id_usuario,
        tipo_persona: tipo_persona || 'Natural',
        estado: true
    });
    
    res.status(201).json({
        success: true,
        message: "Usuario pre-registrado exitosamente",
        data: {
            usuario: {
                id_usuario: nuevoUsuario.id_usuario,
                documento: nuevoUsuario.documento.toString(),
                nombre: nuevoUsuario.nombre,
                apellido: nuevoUsuario.apellido,
                correo: nuevoUsuario.correo
            },
            cliente: {
                id_cliente: nuevoCliente.id_cliente,
                tipo_persona: nuevoCliente.tipo_persona
            }
        }
    });
};
```

---

### **Opción 3: Mantener Comportamiento Actual (ACTUAL)**

**Descripción:** Mantener el comportamiento actual donde el usuario debe existir previamente.

**Pros:**
- ✅ Validación estricta de datos
- ✅ Evita crear usuarios incompletos
- ✅ Mantiene integridad de datos
- ✅ Fuerza registro completo antes de agendar

**Contras:**
- ❌ Requiere registro previo
- ❌ Puede ser más lento para el usuario

---

## 📊 Comparación de Opciones

| Opción | Crear Automáticamente | Pre-registro | Comportamiento Actual |
|--------|----------------------|--------------|----------------------|
| **Velocidad** | ⚡ Rápido | 🐌 Lento (2 pasos) | 🐌 Lento (requiere registro) |
| **Validación** | ⚠️ Básica | ✅ Completa | ✅ Completa |
| **Integridad** | ❌ Baja | ✅ Alta | ✅ Alta |
| **Complejidad** | ⚠️ Media | ✅ Alta | ✅ Baja |
| **Recomendación** | ❌ No | ✅ Sí | ✅ Sí (actual) |

---

## 🎯 Recomendación Final

**✅ MANTENER EL COMPORTAMIENTO ACTUAL** con las siguientes mejoras:

1. **Mejorar Mensajes de Error:**
   - Proporcionar instrucciones claras sobre cómo registrar al usuario
   - Incluir enlaces o referencias a endpoints de registro

2. **Agregar Endpoint de Pre-registro (Opcional):**
   - Crear endpoint `POST /api/usuarios/pre-registro` para pre-registrar usuarios
   - Validar datos completos antes de crear usuario
   - Enviar email de confirmación con contraseña temporal

3. **Validación Mejorada:**
   - Validar formato de documento
   - Validar que el documento no esté duplicado
   - Validar que el correo no esté duplicado

---

## 📝 Ejemplo de Uso Actual

### **Paso 1: Buscar Usuario (Opcional)**
```bash
GET /api/gestion-citas/buscar-usuario/1234567890
Authorization: Bearer TOKEN
```

**Respuesta (Usuario No Existe):**
```json
{
  "success": false,
  "message": "Usuario no encontrado con ese documento",
  "documento": "1234567890"
}
```

**Respuesta (Usuario Existe pero No Es Cliente):**
```json
{
  "success": false,
  "message": "El usuario no es un cliente registrado",
  "documento": "1234567890",
  "id_usuario": 123,
  "rol": "empleado"
}
```

**Respuesta (Usuario Existe y Es Cliente, pero Datos Incorrectos):**
```json
{
  "success": false,
  "message": "Los datos enviados no coinciden con los datos registrados del usuario",
  "documento": "1234567890",
  "discrepancias": [
    {
      "campo": "nombre",
      "valor_enviado": "Juan",
      "valor_real": "Juan Carlos",
      "mensaje": "El nombre enviado \"Juan\" no coincide con el nombre registrado \"Juan Carlos\""
    }
  ],
  "datos_reales": {
    "nombre": "Juan Carlos",
    "apellido": "Pérez",
    "correo": "juan.carlos@example.com",
    "tipo_documento": "CC",
    "telefono": "3001234567"
  },
  "instrucciones": "Por favor, verifique los datos y vuelva a intentar. Los datos deben coincidir exactamente con los registrados en el sistema."
}
```

**Respuesta (Usuario Existe y Es Cliente, Datos Correctos):**
```json
{
  "success": true,
  "data": {
    "usuario": {
      "id_usuario": 123,
      "documento": "1234567890",
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@example.com",
      "telefono": "3001234567"
    },
    "cliente": {
      "id_cliente": 45,
      "tipo_persona": "Natural",
      "estado": true
    },
    "tiene_citas_activas": false,
    "citas_activas": []
  }
}
```

### **Paso 2: Crear Cita**
```bash
POST /api/gestion-citas
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "fecha": "2026-01-20",
  "hora_inicio": "09:00:00",
  "hora_fin": "10:00:00",
  "tipo": "General",
  "modalidad": "Presencial",
  "id_empleado": 2,
  "documento": "1234567890",
  "observacion": "Consulta general"
}
```

**Respuesta (Usuario No Existe):**
```json
{
  "success": false,
  "message": "No se encontró un usuario con ese documento",
  "documento": "1234567890"
}
```

**Respuesta (Usuario Existe pero No Es Cliente):**
```json
{
  "success": false,
  "message": "El usuario no es un cliente registrado",
  "documento": "1234567890",
  "id_usuario": 123
}
```

**Respuesta (Usuario Existe y Es Cliente, pero Datos Incorrectos):**
```json
{
  "success": false,
  "message": "Los datos enviados no coinciden con los datos registrados del usuario",
  "documento": "1234567890",
  "discrepancias": [
    {
      "campo": "nombre",
      "valor_enviado": "Juan",
      "valor_real": "Juan Carlos",
      "mensaje": "El nombre enviado \"Juan\" no coincide con el nombre registrado \"Juan Carlos\""
    },
    {
      "campo": "correo",
      "valor_enviado": "juan@example.com",
      "valor_real": "juan.carlos@example.com",
      "mensaje": "El correo enviado \"juan@example.com\" no coincide con el correo registrado \"juan.carlos@example.com\""
    }
  ],
  "datos_reales": {
    "nombre": "Juan Carlos",
    "apellido": "Pérez",
    "correo": "juan.carlos@example.com",
    "tipo_documento": "CC",
    "telefono": "3001234567"
  },
  "instrucciones": "Por favor, verifique los datos y vuelva a intentar. Los datos deben coincidir exactamente con los registrados en el sistema."
}
```

**Respuesta (Éxito - Datos Correctos):**
```json
{
  "success": true,
  "message": "Cita creada exitosamente",
  "data": {
    "cita": {
      "id_cita": 789,
      "fecha": "2026-01-20",
      "hora_inicio": "09:00:00",
      "hora_fin": "10:00:00",
      "tipo": "General",
      "modalidad": "Presencial",
      "estado": "Programada",
      "id_cliente": 123,
      "id_empleado": 2
    }
  }
}
```

---

## 🔗 Referencias

- **Controlador:** `src/controllers/citas.controller.js`
- **Rutas:** `src/routes/citas.routes.js`
- **Modelos:** `src/models/citas.js`, `src/models/user.js`, `src/models/Cliente.js`

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

