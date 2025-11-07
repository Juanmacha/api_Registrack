# 📋 Documentación Técnica: POST /api/gestion-solicitudes/crear/2
## Certificación de Marca (Registro de Marca)

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Estado:** ⚠️ **PROBLEMAS CRÍTICOS IDENTIFICADOS**

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **Límite de Payload (CAUSA ERROR 500)**
- **Problema:** Express tiene un límite por defecto de **100KB** para `express.json()`
- **Tu payload:** ~2.5MB (con archivos base64)
- **Solución requerida:** Aumentar el límite en `app.js` línea 47

```javascript
// ACTUAL (app.js línea 47):
app.use(express.json());

// DEBE SER:
app.use(express.json({ limit: '10mb' })); // o '50mb' si es necesario
```

### 2. **Campo `certificado_camara_comercio` para Persona Natural**
- **Problema:** El campo está marcado como **REQUERIDO** incluso para `tipo_solicitante: "Natural"`
- **Ubicación del bug:** `src/config/tiposFormularios.js` línea 34
- **Comportamiento actual:** El backend rechazará solicitudes de personas naturales sin este campo
- **Solución requerida:** Hacer el campo condicional según `tipo_solicitante`

### 3. **Errores 500 sin Detalles**
- **Problema:** Los errores 500 solo muestran detalles en modo `development`
- **Ubicación:** `src/controllers/solicitudes.controller.js` línea 911
- **Solución requerida:** Mejorar manejo de errores para producción

---

## 📌 INFORMACIÓN GENERAL DEL ENDPOINT

### **URL Base**
```
POST /api/gestion-solicitudes/crear/2
```

### **Parámetro URL**
- `:servicio` = `2` (ID numérico del servicio "Registro de Marca (Certificación de marca)")
- **NO usar el nombre del servicio**, solo el ID numérico

### **Headers Requeridos**
```http
Authorization: Bearer {token_jwt}
Content-Type: application/json
```

### **Autenticación**
- Token JWT **obligatorio**
- Roles permitidos: `cliente`, `administrador`, `empleado`
- Si falta autenticación: **401 Unauthorized**

---

## 📋 ESTRUCTURA JSON EXACTA

### **Campos Requeridos (Según Código Actual)**

⚠️ **NOTA:** El código actual marca `certificado_camara_comercio` como requerido para TODOS los tipos, pero esto es un **BUG**. Ver sección de validaciones condicionales.

```javascript
[
  "tipo_solicitante",           // "Natural" o "Jurídica"
  "nombres_apellidos",
  "tipo_documento",
  "numero_documento",
  "direccion",
  "telefono",
  "correo",
  "pais",
  "numero_nit_cedula",
  "nombre_marca",
  "tipo_producto_servicio",
  "certificado_camara_comercio", // ⚠️ BUG: Requerido incluso para Natural
  "logotipo",
  "poder_autorizacion",
  "tipo_entidad",               // ⚠️ Requerido incluso para Natural
  "razon_social",               // ⚠️ Requerido incluso para Natural
  "nit_empresa",                // ⚠️ Requerido incluso para Natural
  "representante_legal",        // ⚠️ Requerido incluso para Natural
  "direccion_domicilio"         // ⚠️ Requerido incluso para Natural
]
```

**Ubicación en código:** `src/config/tiposFormularios.js` líneas 22-43

---

## 🔍 RESPUESTAS A PREGUNTAS CRÍTICAS

### **1. ¿El campo `certificado_camara_comercio` es REQUERIDO u OPCIONAL para tipo_solicitante "Natural"?**

#### **Respuesta Técnica (Basada en Código):**

**ACTUALMENTE ES REQUERIDO** (pero es un BUG):

```javascript
// src/config/tiposFormularios.js línea 34
"Registro de Marca (Certificación de marca)": [
  // ... otros campos ...
  "certificado_camara_comercio",  // ⚠️ Está en la lista de requeridos
  // ...
]
```

**Validación en el controlador:**
```javascript
// src/controllers/solicitudes.controller.js líneas 411-422
const camposFaltantes = camposRequeridos.filter(
  (campo) => !req.body[campo] || req.body[campo].toString().trim() === ""
);

if (camposFaltantes.length > 0) {
  return res.status(400).json({
    mensaje: "Campos requeridos faltantes",
    camposFaltantes: camposFaltantes,
    camposRequeridos: camposRequeridos,
  });
}
```

**Comportamiento actual:**
- ❌ Si envías `tipo_solicitante: "Natural"` **SIN** `certificado_camara_comercio` → **Error 400**
- ✅ Si envías `tipo_solicitante: "Natural"` **CON** `certificado_camara_comercio` → Se acepta (se guarda en BD)

**¿Qué debería ser?**
- **Persona Natural:** `certificado_camara_comercio` debería ser **OPCIONAL**
- **Persona Jurídica:** `certificado_camara_comercio` debería ser **REQUERIDO**

**Solución propuesta:**
El backend necesita validación condicional. Actualmente NO existe esta lógica en el código.

---

### **2. ¿El tamaño del payload (~2.5MB con archivos base64) es demasiado grande?**

#### **Respuesta Técnica:**

**SÍ, ES DEMASIADO GRANDE** (causa error 500):

**Límite actual de Express:**
```javascript
// app.js línea 47
app.use(express.json());  // ⚠️ Límite por defecto: 100KB
```

**Tu payload:**
- Logotipo: ~195KB (base64)
- Poder autorización: ~1.16MB (base64)
- Certificado cámara: ~1.16MB (base64)
- **Total: ~2.5MB**

**Error que recibes:**
```
Error 500: "Error interno del servidor"
```

**Causa raíz:**
Express rechaza el payload antes de que llegue al controlador porque excede 100KB.

**Solución inmediata:**
```javascript
// app.js - Modificar línea 47
app.use(express.json({ limit: '10mb' })); // Aumentar a 10MB
```

**Límites recomendados:**
- **Payload total:** 10MB máximo
- **Por archivo:** 5MB máximo (recomendado)
- **Base64 aumenta el tamaño ~33%:** Un PDF de 1MB se convierte en ~1.33MB en base64

---

### **3. ¿Qué estructura JSON EXACTA espera el backend?**

#### **3.1. Para Tipo "Natural" (Con el bug actual):**

```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Gómez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "465788",
  "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
  "telefono": "3001234567",
  "correo": "juanmanuelmachadomaturana1@gmail.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "numero_nit_cedula": "23456789",
  "nombre_marca": "DEsports",
  "tipo_producto_servicio": "Venta de ropa",
  "clase_niza": "34",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  
  // ⚠️ BUG: Estos campos están marcados como requeridos pero no deberían serlo para Natural
  "certificado_camara_comercio": "data:application/pdf;base64,...",  // ⚠️ Actualmente requerido
  "tipo_entidad": "",  // ⚠️ Actualmente requerido (puede ser string vacío)
  "razon_social": "",  // ⚠️ Actualmente requerido (puede ser string vacío)
  "nit_empresa": "",   // ⚠️ Actualmente requerido (puede ser string vacío)
  "representante_legal": "",  // ⚠️ Actualmente requerido (puede ser string vacío)
  "direccion_domicilio": "CL 56 # 92 - 108 TORRE 37 APTO 9804"  // ⚠️ Actualmente requerido
}
```

**⚠️ WORKAROUND ACTUAL:**
Para que funcione con persona Natural, debes enviar los campos de empresa como strings vacíos `""` o `null`, pero **NO omitirlos**.

#### **3.2. Para Tipo "Natural" (Ideal - después del fix):**

```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Gómez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "465788",
  "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
  "telefono": "3001234567",
  "correo": "juanmanuelmachadomaturana1@gmail.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "numero_nit_cedula": "23456789",
  "nombre_marca": "DEsports",
  "tipo_producto_servicio": "Venta de ropa",
  "clase_niza": "34",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,..."
  
  // ✅ Después del fix: Estos campos NO serían requeridos
  // "certificado_camara_comercio": null,  // Opcional para Natural
  // "tipo_entidad": null,  // Opcional para Natural
  // "razon_social": null,  // Opcional para Natural
  // "nit_empresa": null,  // Opcional para Natural
  // "representante_legal": null,  // Opcional para Natural
  // "direccion_domicilio": null  // Opcional para Natural
}
```

#### **3.3. Para Tipo "Jurídica":**

```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez Martínez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "direccion_domicilio": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos.rodriguez@email.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "clase_niza": "42",
  "logotipo": "data:image/jpeg;base64,...",
  "poder_autorizacion": "data:application/pdf;base64,...",
  "certificado_camara_comercio": "data:application/pdf;base64,...",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez Martínez"
}
```

---

### **4. ¿Cómo podemos obtener más detalles sobre los errores 500?**

#### **Problema Actual:**

```javascript
// src/controllers/solicitudes.controller.js líneas 907-913
} catch (error) {
  console.error('💥 Error en crearSolicitud:', error);
  return res.status(500).json({
    mensaje: "Error interno del servidor",
    error: process.env.NODE_ENV === 'development' ? error.message : "Error interno",
  });
}
```

**Comportamiento:**
- **En desarrollo (`NODE_ENV=development`):** Muestra `error.message`
- **En producción:** Solo muestra "Error interno"

#### **Solución Temporal (Para Debugging):**

1. **Revisar logs del servidor:**
   - Los errores se imprimen en consola con `console.error('💥 Error en crearSolicitud:', error)`
   - Buscar en los logs del servidor el mensaje completo

2. **Activar modo desarrollo temporalmente:**
   ```bash
   NODE_ENV=development node server.js
   ```

3. **Mejorar manejo de errores (Recomendado):**

   El backend debería modificar el catch para incluir más información:

   ```javascript
   } catch (error) {
     console.error('💥 Error en crearSolicitud:', error);
     console.error('💥 Stack:', error.stack);
     console.error('💥 Request body keys:', Object.keys(req.body));
     console.error('💥 Request body size:', JSON.stringify(req.body).length);
     
     return res.status(500).json({
       mensaje: "Error interno del servidor",
       error: error.message,
       tipo: error.name,
       detalles: process.env.NODE_ENV === 'development' ? error.stack : undefined,
       timestamp: new Date().toISOString()
     });
   }
   ```

#### **Ubicación de Logs:**

- **Desarrollo local:** Consola donde se ejecuta `node server.js` o `npm start`
- **Producción (Render/Heroku/etc):** Dashboard de la plataforma → Logs
- **Docker:** `docker logs <container_id>`

---

## 📊 TABLA DE CAMPOS: REQUERIDOS vs OPCIONALES

| Campo | Natural (Actual) | Natural (Ideal) | Jurídica | Tipo | Validaciones |
|-------|------------------|-----------------|----------|------|--------------|
| `tipo_solicitante` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | "Natural" o "Jurídica" |
| `nombres_apellidos` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Min: 3 caracteres |
| `tipo_documento` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Ej: "Cédula de Ciudadanía" |
| `numero_documento` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Max: 20 caracteres |
| `direccion` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | TEXT (sin límite) |
| `telefono` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Max: 20 caracteres |
| `correo` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Formato email válido |
| `pais` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Max: 50 caracteres |
| `ciudad` | ⚠️ Opcional | ⚠️ Opcional | ⚠️ Opcional | `string` | Max: 50 caracteres |
| `numero_nit_cedula` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Max: 20 caracteres |
| `nombre_marca` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Max: 100 caracteres |
| `tipo_producto_servicio` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Max: 50 caracteres |
| `clase_niza` | ⚠️ Opcional | ⚠️ Opcional | ⚠️ Opcional | `string` | Max: 50 caracteres |
| `logotipo` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Base64 (TEXT) |
| `poder_autorizacion` | ✅ Requerido | ✅ Requerido | ✅ Requerido | `string` | Base64 (TEXT) |
| `certificado_camara_comercio` | ⚠️ **Requerido (BUG)** | ❌ Opcional | ✅ Requerido | `string` | Base64 (TEXT) |
| `tipo_entidad` | ⚠️ **Requerido (BUG)** | ❌ Opcional | ✅ Requerido | `string` | Max: 50 caracteres |
| `razon_social` | ⚠️ **Requerido (BUG)** | ❌ Opcional | ✅ Requerido | `string` | Max: 100 caracteres |
| `nit_empresa` | ⚠️ **Requerido (BUG)** | ❌ Opcional | ✅ Requerido | `number` | 10 dígitos (1000000000-9999999999) |
| `representante_legal` | ⚠️ **Requerido (BUG)** | ❌ Opcional | ✅ Requerido | `string` | Max: 100 caracteres |
| `direccion_domicilio` | ⚠️ **Requerido (BUG)** | ❌ Opcional | ✅ Requerido | `string` | TEXT (sin límite) |

**Leyenda:**
- ✅ = Requerido
- ❌ = Opcional (puede omitirse)
- ⚠️ = Requerido actualmente pero no debería serlo (BUG)

---

## 🔧 VALIDACIONES ESPECÍFICAS POR CAMPO

### **Validaciones de Tipo de Dato:**

```javascript
// Ubicación: src/controllers/solicitudes.controller.js líneas 411-422
const camposFaltantes = camposRequeridos.filter(
  (campo) => !req.body[campo] || req.body[campo].toString().trim() === ""
);
```

**Comportamiento:**
- Si el campo es `null`, `undefined`, `""` o solo espacios → Se considera faltante
- Si el campo es `0` o `false` → Se considera válido

### **Validaciones de NIT:**

```javascript
// Ubicación: src/controllers/solicitudes.controller.js líneas 143-150
if (empresaData.nit < 1000000000 || empresaData.nit > 9999999999) {
  errores.push('NIT debe tener entre 10 y 10 dígitos');
}
```

**Requisitos:**
- Debe ser un número entero
- Debe tener exactamente 10 dígitos
- Rango: 1000000000 - 9999999999
- **NO incluir dígito de verificación con guión**

### **Validaciones de Email:**

```javascript
// Ubicación: src/controllers/solicitudes.controller.js líneas 156-158
if (empresaData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(empresaData.email)) {
  errores.push('Email de empresa no tiene formato válido');
}
```

**Formato esperado:** `usuario@dominio.extension`

### **Validaciones de Archivos Base64:**

**Formato aceptado:**
- Con prefijo: `"data:image/jpeg;base64,/9j/4AAQSkZJRg..."`
- Sin prefijo: `"/9j/4AAQSkZJRg..."`

**Tipos de archivo:**
- `logotipo`: JPG, JPEG, PNG (imágenes)
- `poder_autorizacion`: PDF
- `certificado_camara_comercio`: PDF

**Tamaño máximo recomendado:**
- Por archivo: 5MB (antes de base64)
- Payload total: 10MB (después de base64)

---

## 📝 EJEMPLOS JSON FUNCIONALES

### **Ejemplo 1: Persona Natural (Workaround Actual)**

```json
{
  "tipo_solicitante": "Natural",
  "nombres_apellidos": "Juan Gómez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "465788",
  "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
  "telefono": "3001234567",
  "correo": "juanmanuelmachadomaturana1@gmail.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "numero_nit_cedula": "23456789",
  "nombre_marca": "DEsports",
  "tipo_producto_servicio": "Venta de ropa",
  "clase_niza": "34",
  "logotipo": "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "certificado_camara_comercio": "",
  "tipo_entidad": "",
  "razon_social": "",
  "nit_empresa": "",
  "representante_legal": "",
  "direccion_domicilio": "CL 56 # 92 - 108 TORRE 37 APTO 9804"
}
```

**⚠️ Nota:** Enviamos campos de empresa como strings vacíos para evitar el error 400.

### **Ejemplo 2: Persona Jurídica (Completo)**

```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "Carlos Rodríguez Martínez",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12",
  "direccion_domicilio": "Carrera 78 #90-12",
  "telefono": "3109876543",
  "correo": "carlos.rodriguez@email.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "numero_nit_cedula": "9001234567",
  "nombre_marca": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "clase_niza": "42",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez Martínez"
}
```

---

## 🚀 SOLUCIONES INMEDIATAS

### **Solución 1: Aumentar Límite de Payload (CRÍTICO)**

**Archivo:** `api_Registrack/app.js`  
**Línea:** 47

**Cambiar:**
```javascript
app.use(express.json());
```

**Por:**
```javascript
app.use(express.json({ limit: '10mb' }));
```

**O si necesitas más espacio:**
```javascript
app.use(express.json({ limit: '50mb' }));
```

### **Solución 2: Validación Condicional de `certificado_camara_comercio` (CRÍTICO)**

**Archivo:** `api_Registrack/src/config/tiposFormularios.js`  
**Líneas:** 22-43

**Cambiar la lista de campos requeridos para hacer condicional:**

```javascript
// Opción 1: Remover de la lista y validar en el controlador
"Registro de Marca (Certificación de marca)": [
  "tipo_solicitante",
  "nombres_apellidos",
  // ... otros campos ...
  // "certificado_camara_comercio",  // ⚠️ Remover de aquí
  // "tipo_entidad",  // ⚠️ Remover de aquí
  // "razon_social",  // ⚠️ Remover de aquí
  // "nit_empresa",  // ⚠️ Remover de aquí
  // "representante_legal",  // ⚠️ Remover de aquí
  // "direccion_domicilio"  // ⚠️ Remover de aquí
]
```

**Y agregar validación condicional en el controlador:**

**Archivo:** `api_Registrack/src/controllers/solicitudes.controller.js`  
**Después de línea 422:**

```javascript
// Validación condicional para Certificación de Marca
if (servicioEncontrado.nombre === "Registro de Marca (Certificación de marca)") {
  const tipoSolicitante = req.body.tipo_solicitante;
  
  if (tipoSolicitante === "Jurídica") {
    // Para jurídica, estos campos son requeridos
    const camposJuridica = [
      "certificado_camara_comercio",
      "tipo_entidad",
      "razon_social",
      "nit_empresa",
      "representante_legal",
      "direccion_domicilio"
    ];
    
    const camposFaltantesJuridica = camposJuridica.filter(
      (campo) => !req.body[campo] || req.body[campo].toString().trim() === ""
    );
    
    if (camposFaltantesJuridica.length > 0) {
      return res.status(400).json({
        mensaje: "Campos requeridos faltantes para persona jurídica",
        camposFaltantes: camposFaltantesJuridica,
        tipo_solicitante: tipoSolicitante
      });
    }
  }
  // Para Natural, estos campos son opcionales (no se validan)
}
```

### **Solución 3: Mejorar Manejo de Errores 500**

**Archivo:** `api_Registrack/src/controllers/solicitudes.controller.js`  
**Líneas:** 907-913

**Cambiar:**
```javascript
} catch (error) {
  console.error('💥 Error en crearSolicitud:', error);
  return res.status(500).json({
    mensaje: "Error interno del servidor",
    error: process.env.NODE_ENV === 'development' ? error.message : "Error interno",
  });
}
```

**Por:**
```javascript
} catch (error) {
  console.error('💥 Error en crearSolicitud:', error);
  console.error('💥 Stack:', error.stack);
  console.error('💥 Request body size:', JSON.stringify(req.body || {}).length);
  console.error('💥 Request body keys:', Object.keys(req.body || {}));
  
  // Detectar errores comunes
  let mensajeError = "Error interno del servidor";
  let detalles = {};
  
  if (error.message && error.message.includes('request entity too large')) {
    mensajeError = "El payload es demasiado grande. Límite actual: 100KB. Se requiere aumentar el límite en app.js";
    detalles = {
      tipo: "PayloadTooLarge",
      limite_actual: "100KB",
      solucion: "Aumentar express.json({ limit: '10mb' }) en app.js"
    };
  } else if (error.name === 'SequelizeValidationError') {
    mensajeError = "Error de validación en base de datos";
    detalles = {
      tipo: "ValidationError",
      errores: error.errors.map(e => ({
        campo: e.path,
        mensaje: e.message
      }))
    };
  } else {
    detalles = {
      tipo: error.name || "UnknownError",
      mensaje: error.message
    };
  }
  
  return res.status(500).json({
    mensaje: mensajeError,
    error: error.message,
    detalles: detalles,
    timestamp: new Date().toISOString()
  });
}
```

---

## 📞 ACCESO A LOGS PARA DEBUGGING

### **Ubicación de Logs:**

1. **Desarrollo Local:**
   - Consola donde ejecutas `npm start` o `node server.js`
   - Buscar líneas que empiezan con `💥`, `❌`, `🚀`, `🔍`

2. **Producción (Render.com):**
   - Dashboard → Tu servicio → Logs
   - O usar CLI: `render logs <service-name>`

3. **Producción (Heroku):**
   - Dashboard → Tu app → More → View logs
   - O usar CLI: `heroku logs --tail -a <app-name>`

4. **Producción (Docker):**
   ```bash
   docker logs <container_id>
   docker logs -f <container_id>  # Seguimiento en tiempo real
   ```

### **Qué Buscar en los Logs:**

```
💥 Error en crearSolicitud: [mensaje del error]
💥 Stack: [stack trace completo]
🚀 Iniciando creación de solicitud...
🔍 ID de servicio: 2
✅ Servicio encontrado: Registro de Marca (Certificación de marca)
❌ Campos requeridos faltantes: ["certificado_camara_comercio"]
```

---

## 📊 RESUMEN DE PROBLEMAS Y SOLUCIONES

| Problema | Causa | Impacto | Solución | Prioridad |
|----------|-------|---------|----------|-----------|
| Error 500 genérico | Payload > 100KB | Bloquea todas las solicitudes con archivos | Aumentar `express.json({ limit: '10mb' })` | 🔴 CRÍTICA |
| `certificado_camara_comercio` requerido para Natural | Lista de campos no es condicional | Personas naturales no pueden crear solicitudes | Validación condicional en controlador | 🔴 CRÍTICA |
| Errores 500 sin detalles | Solo muestra detalles en development | Dificulta debugging | Mejorar manejo de errores | 🟡 ALTA |
| Campos de empresa requeridos para Natural | Lista de campos no es condicional | Personas naturales deben enviar campos vacíos | Validación condicional en controlador | 🟡 ALTA |

---

## ✅ CHECKLIST PARA EL EQUIPO DE BACKEND

- [ ] **Aumentar límite de payload en `app.js` línea 47**
- [ ] **Implementar validación condicional para `certificado_camara_comercio`**
- [ ] **Implementar validación condicional para campos de empresa**
- [ ] **Mejorar manejo de errores 500 con más detalles**
- [ ] **Probar con payload de 2.5MB**
- [ ] **Probar con persona Natural sin `certificado_camara_comercio`**
- [ ] **Probar con persona Jurídica con todos los campos**
- [ ] **Actualizar documentación con los cambios**

---

## 📚 REFERENCIAS DE CÓDIGO

- **Controlador:** `src/controllers/solicitudes.controller.js` (líneas 356-914)
- **Configuración de campos:** `src/config/tiposFormularios.js` (líneas 22-43)
- **Rutas:** `src/routes/solicitudes.routes.js` (líneas 27-31)
- **App principal:** `app.js` (línea 47)
- **Modelo:** `src/models/OrdenServicio.js` (líneas 143-147)
- **Manejo de errores:** `src/middlewares/error.middleware.js`

---

**Última actualización:** Enero 2026  
**Versión del documento:** 1.0  
**Estado:** ⚠️ Requiere correcciones críticas en el backend

