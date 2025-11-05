# 💰 Ejemplo Postman: Flujo Completo de Solicitud con Pago

## 📋 Flujo Completo

0. **Registrar Usuario** (Opcional - solo si no tienes cuenta)
1. **Login** → Obtener token
2. **Crear Solicitud** → Se crea con estado "Pendiente de Pago"
3. **Procesar Pago** → Activa automáticamente la solicitud
4. **Verificar Solicitud** → Confirmar que está activa

---

## 👤 Paso 0: Registrar Usuario (Opcional)

**⚠️ Este paso solo es necesario si no tienes una cuenta. Si ya tienes cuenta, ve directamente al Paso 1 (Login).**

### Request
```http
POST http://localhost:3000/api/usuarios/registrar
Content-Type: application/json
```

### Body
```json
{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez García",
  "correo": "juan.perez@email.com",
  "contrasena": "MiPassword123!"
}
```

### Validaciones Requeridas

**Campos Obligatorios:**
- `tipo_documento`: String (valores válidos: `CC`, `CE`, `TI`, `RC`, `NIT`, `PAS`)
- `documento`: String con 6-10 dígitos numéricos
- `nombre`: String (2-50 caracteres)
- `apellido`: String (2-50 caracteres)
- `correo`: Email válido y único
- `contrasena`: Mínimo 8 caracteres, debe incluir:
  - Al menos una letra mayúscula
  - Al menos un número
  - Al menos un carácter especial (`!@#$%^&*()_+-=[]{}|;':",./<>?`)

### Response (201) - Registro Exitoso
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id_usuario": 35,
    "tipo_documento": "CC",
    "documento": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez García",
    "correo": "juan.perez@email.com",
    "rol": "cliente",
    "estado": true
  }
}
```

**⚠️ NOTA:** El rol se asigna automáticamente como `"cliente"`. No es necesario especificarlo.

### Response (400) - Error de Validación
```json
{
  "mensaje": "El correo ya está registrado"
}
```

**Otros posibles errores:**
- `"El documento ya está registrado"`
- `"El documento debe tener entre 6 y 10 números"`
- `"El correo no es válido"`
- `"La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial"`
- `"Todos los campos son obligatorios"`

### Ejemplo de Body con Diferentes Tipos de Documento

**Cédula de Ciudadanía (CC):**
```json
{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@email.com",
  "contrasena": "MiPassword123!"
}
```

**Cédula de Extranjería (CE):**
```json
{
  "tipo_documento": "CE",
  "documento": "9876543210",
  "nombre": "María",
  "apellido": "González",
  "correo": "maria.gonzalez@email.com",
  "contrasena": "MiPassword123!"
}
```

**Pasaporte (PAS):**
```json
{
  "tipo_documento": "PAS",
  "documento": "AB1234567",
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "correo": "carlos.rodriguez@email.com",
  "contrasena": "MiPassword123!"
}
```

**⚠️ IMPORTANTE:** 
- El `documento` debe ser numérico para `CC`, `CE`, `TI`, `RC`, `NIT`
- Para `PAS` puede contener letras y números
- El correo debe ser único en el sistema
- La contraseña debe cumplir con los requisitos de seguridad

---

## 🔐 Paso 1: Login (Obtener Token)

### Request
```http
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json
```

### Body
```json
{
  "correo": "cliente@example.com",
  "contrasena": "tu_contraseña"
}
```

### Response (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 31,
    "rol": "cliente"
  }
}
```

**⚠️ Guardar el token en la variable Postman `{{token}}`**

---

## 📝 Paso 2: Crear Solicitud (Búsqueda de Antecedentes)

### ⚠️ IMPORTANTE: Diferencias por Rol

**El mismo endpoint se usa, pero el body cambia según el rol:**

#### 👤 Como CLIENTE (Rol: cliente)

**NO necesitas enviar `id_cliente`** - Se toma automáticamente del token.

### Request
```http
POST http://localhost:3000/api/gestion-solicitudes/crear/1
Authorization: Bearer {{token}}
Content-Type: application/json
```

### Body (Cliente)
```json
{
  "nombres_apellidos": "Juan Pérez García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67, Bogotá",
  "telefono": "3001234567",
  "correo": "juan.perez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombre_a_buscar": "Mi Marca Innovadora",
  "tipo_producto_servicio": "Productos alimenticios",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**⚠️ NOTA:** Como cliente, `id_cliente` NO se envía. El sistema usa automáticamente tu `id_usuario` del token.

---

#### 👨‍💼 Como ADMINISTRADOR/EMPLEADO (Rol: administrador o empleado)

**DEBES enviar `id_cliente`** - Requerido para crear solicitud para otro cliente.
**✅ La solicitud se activa automáticamente** - NO requiere pago por API (pago físico posterior)

### Request
```http
POST http://localhost:3000/api/gestion-solicitudes/crear/1
Authorization: Bearer {{token}}
Content-Type: application/json
```

### Body (Administrador/Empleado)
```json
{
  "id_cliente": 45,
  "id_empresa": 12,
  "nombres_apellidos": "Juan Pérez García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67, Bogotá",
  "telefono": "3001234567",
  "correo": "juan.perez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombre_a_buscar": "Mi Marca Innovadora",
  "tipo_producto_servicio": "Productos alimenticios",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**⚠️ NOTA:** Como administrador/empleado:
- `id_cliente` es **OBLIGATORIO** (error 400 si falta)
- `id_empresa` es opcional
- Permite crear solicitudes para cualquier cliente del sistema
- **✅ La solicitud se activa automáticamente** con el primer estado del proceso
- **💰 NO requiere pago por API** - El pago puede gestionarse físicamente después

---

### Tabla Comparativa

| Aspecto | Cliente | Administrador/Empleado |
|---------|---------|------------------------|
| `id_cliente` en body | ❌ No enviar (se toma del token) | ✅ **OBLIGATORIO** |
| `id_empresa` en body | ⚪ Opcional | ⚪ Opcional |
| Estado inicial | "Pendiente de Pago" | Primer estado del proceso (activa) |
| Requiere pago | ✅ Sí (por API) | ❌ No (pago físico posterior) |
| Activación | Al procesar pago | Automática al crear |
| Otros campos | ✅ Iguales | ✅ Iguales |

---

### Response (201) - Cliente (Estado "Pendiente de Pago")
```json
{
  "success": true,
  "mensaje": "Solicitud creada. Pendiente de pago para activar.",
  "data": {
    "orden_id": 123,
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes",
      "precio_base": 100000.00
    },
    "estado": "Pendiente de Pago",
    "monto_a_pagar": 100000.00,
    "requiere_pago": true,
    "fecha_solicitud": "2025-01-15T10:30:00.000Z",
    "cliente": {
      "id_cliente": 45,
      "marca": "Mi Marca Innovadora",
      "tipo_persona": "Natural",
      "estado": true
    },
    "empresa": {
      "id_empresa": 12,
      "nombre": "Empresa del Cliente",
      "nit": "9001234567",
      "tipo_empresa": "SAS"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "version": "2.3",
    "nextSteps": [
      "Complete el pago para activar la solicitud",
      "Una vez pagado, la solicitud será procesada automáticamente",
      "Puede consultar el estado en cualquier momento"
    ]
  }
}
```

**⚠️ IMPORTANTE:**
- Guardar `orden_id` (ej: 123) para el siguiente paso
- Guardar `monto_a_pagar` (ej: 100000.00)
- El estado es `"Pendiente de Pago"` (NO está activa aún)
- Solo aplica para **clientes**

---

### Response (201) - Administrador/Empleado (Estado Activo)

**✅ La solicitud se activa automáticamente** - No requiere pago por API

```json
{
  "success": true,
  "mensaje": "Solicitud creada y activada exitosamente.",
  "data": {
    "orden_id": 123,
    "servicio": {
      "id_servicio": 1,
      "nombre": "Búsqueda de Antecedentes",
      "precio_base": 100000.00
    },
    "estado": "Solicitud Recibida",
    "monto_a_pagar": null,
    "requiere_pago": false,
    "fecha_solicitud": "2025-01-15T10:30:00.000Z",
    "cliente": {
      "id_cliente": 45,
      "marca": "Mi Marca Innovadora",
      "tipo_persona": "Natural",
      "estado": true
    },
    "empresa": {
      "id_empresa": 12,
      "nombre": "Empresa del Cliente",
      "nit": "9001234567",
      "tipo_empresa": "SAS"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "version": "2.4",
    "rol": "administrador",
    "nextSteps": [
      "La solicitud está activa y lista para procesar",
      "Se notificará por email el estado de la solicitud",
      "Puede consultar el estado en cualquier momento"
    ]
  }
}
```

**⚠️ IMPORTANTE:**
- La solicitud ya está **activa** con el primer estado del proceso
- `monto_a_pagar` es `null` y `requiere_pago` es `false`
- **NO requiere procesar pago por API** (pago físico posterior si es necesario)
- El estado será el primer proceso del servicio (ej: "Solicitud Recibida")

---

## 💳 Paso 3: Procesar Pago (Mock) - ⚠️ SOLO PARA CLIENTES

**👨‍💼 IMPORTANTE:** Este paso **NO aplica** para solicitudes creadas por administradores/empleados, ya que se activan automáticamente.

**👤 Si eres cliente:** Continúa con este paso para activar tu solicitud.

### Request
```http
POST http://localhost:3000/api/gestion-pagos/process-mock
Authorization: Bearer {{token}}
Content-Type: application/json
```

### Body
```json
{
  "monto": 100000.00,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": 123
}
```

**⚠️ Usar los valores del paso anterior:**
- `monto`: `{{monto_a_pagar}}` o el valor de `data.monto_a_pagar`
- `id_orden_servicio`: `{{orden_id}}` o el valor de `data.orden_id`

### Response (201) - ⚠️ NUEVO: Solicitud Activada
```json
{
  "success": true,
  "message": "Pago procesado exitosamente. Solicitud activada.",
  "data": {
    "success": true,
    "payment": {
      "id_pago": 456,
      "monto": 100000.00,
      "metodo_pago": "Tarjeta",
      "estado": "Pagado",
      "id_orden_servicio": 123,
      "transaction_id": "mock_txn_1234567890",
      "gateway": "mock",
      "verified_at": "2025-01-15T10:35:00.000Z",
      "verification_method": "mock"
    },
    "transaction_id": "mock_txn_1234567890",
    "solicitud_activada": true
  }
}
```

**⚠️ IMPORTANTE:**
- `solicitud_activada: true` indica que la solicitud fue activada automáticamente
- El estado de la solicitud cambió de "Pendiente de Pago" al primer estado del proceso

---

## ✅ Paso 4: Verificar Solicitud Activada

### Request
```http
GET http://localhost:3000/api/gestion-solicitudes/123
Authorization: Bearer {{token}}
```

### Response (200)
```json
{
  "id": "123",
  "expediente": "EXP-123",
  "titular": "Juan Pérez García",
  "marca": "Mi Marca Innovadora",
  "tipoSolicitud": "Búsqueda de Antecedentes",
  "encargado": "Sin asignar",
  "estado": "Solicitud Recibida",
  "email": "juan.perez@email.com",
  "telefono": "3001234567",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "direccion": "Calle 123 #45-67, Bogotá",
  "codigo_postal": "110111",
  "tipoDocumento": "Cédula de Ciudadanía",
  "numeroDocumento": "1234567890",
  "tipoPersona": "Natural",
  "nombreCompleto": "Juan Pérez García",
  "nombreMarca": "Mi Marca Innovadora",
  "categoria": "25",
  "clase_niza": "25",
  "tipoProductoServicio": "Productos alimenticios",
  "fechaCreacion": "2025-01-15T10:30:00.000Z",
  "id_cliente": 45,
  "id_empresa": 12,
  "id_servicio": 1
}
```

**⚠️ NOTA:** 
- El estado ahora es `"Solicitud Recibida"` (primer estado del proceso)
- Ya NO es `"Pendiente de Pago"`
- La solicitud está activa y lista para ser procesada

---

## 📋 Ejemplo Completo: Registro de Marca

### Paso 2: Crear Solicitud (Registro de Marca)

#### Request
```http
POST http://localhost:3000/api/gestion-solicitudes/crear/2
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body
```json
{
  "tipo_solicitante": "Jurídica",
  "nombres_apellidos": "María González López",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "numero_nit_cedula": "9001234567",
  "direccion": "Avenida 68 #45-30",
  "direccion_domicilio": "Carrera 7 #32-16, Bogotá",
  "telefono": "3109876543",
  "correo": "maria.gonzalez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "tipo_entidad": "Sociedad por Acciones Simplificada",
  "razon_social": "Mi Empresa S.A.S.",
  "nit_empresa": 9001234567,
  "representante_legal": "Carlos Rodríguez Martínez",
  "nombre_marca": "Mi Marca Registrada",
  "tipo_producto_servicio": "Servicios de consultoría",
  "clase_niza": "35",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "certificado_camara_comercio": "data:application/pdf;base64,JVBERi0x...",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0x..."
}
```

#### Response (201)
```json
{
  "success": true,
  "mensaje": "Solicitud creada. Pendiente de pago para activar.",
  "data": {
    "orden_id": 124,
    "servicio": {
      "id_servicio": 2,
      "nombre": "Registro de Marca (Certificación de marca)",
      "precio_base": 500000.00
    },
    "estado": "Pendiente de Pago",
    "monto_a_pagar": 500000.00,
    "requiere_pago": true,
    "fecha_solicitud": "2025-01-15T11:00:00.000Z"
  }
}
```

### Paso 3: Procesar Pago

#### Request
```http
POST http://localhost:3000/api/gestion-pagos/process-mock
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body
```json
{
  "monto": 500000.00,
  "metodo_pago": "Transferencia",
  "id_orden_servicio": 124
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "Pago procesado exitosamente. Solicitud activada.",
  "data": {
    "payment": {
      "id_pago": 457,
      "monto": 500000.00,
      "metodo_pago": "Transferencia",
      "estado": "Pagado",
      "id_orden_servicio": 124,
      "transaction_id": "mock_txn_9876543210",
      "gateway": "mock",
      "verified_at": "2025-01-15T11:05:00.000Z",
      "verification_method": "mock"
    },
    "solicitud_activada": true
  }
}
```

---

## 🔄 Flujo Alternativo: Pago Fallido

### Paso 3: Procesar Pago (Simular Error)

#### Request
```http
POST http://localhost:3000/api/gestion-pagos/process-mock
Authorization: Bearer {{token}}
Content-Type: application/json
```

#### Body (con monto incorrecto para simular error)
```json
{
  "monto": 0,
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": 123
}
```

#### Response (400) - Error
```json
{
  "success": false,
  "message": "Error al procesar pago",
  "error": "Error en la pasarela de pago"
}
```

**⚠️ En este caso:**
- El pago NO se procesa
- La solicitud permanece en estado "Pendiente de Pago"
- El usuario puede intentar pagar nuevamente

### Verificar Estado (Sigue en "Pendiente de Pago")

#### Request
```http
GET http://localhost:3000/api/gestion-solicitudes/123
Authorization: Bearer {{token}}
```

#### Response (200)
```json
{
  "id": "123",
  "estado": "Pendiente de Pago",
  "monto_a_pagar": 100000.00,
  "requiere_pago": true,
  // ... otros campos
}
```

---

## 📊 Variables de Postman Recomendadas

### Variables de Colección
```
{{BASE_URL}} = http://localhost:3000
{{token}} = (se llena automáticamente después del login)
```

### Variables de Request (para el flujo completo)
```
{{orden_id}} = 123 (se llena después de crear solicitud)
{{monto_a_pagar}} = 100000.00 (se llena después de crear solicitud)
```

### Script Pre-request (Opcional - Auto-login)
```javascript
// En la colección, agregar script pre-request para auto-login
if (!pm.collectionVariables.get("token")) {
    pm.sendRequest({
        url: pm.collectionVariables.get("BASE_URL") + "/api/usuarios/login",
        method: 'POST',
        header: {
            'Content-Type': 'application/json'
        },
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                correo: "cliente@example.com",
                contrasena: "tu_contraseña"
            })
        }
    }, function (err, res) {
        if (!err && res.code === 200) {
            var jsonData = res.json();
            pm.collectionVariables.set("token", jsonData.token);
        }
    });
}
```

### Script Post-request para Registrar (Opcional - Auto-login después de registro)
```javascript
// En el request de "Registrar Usuario", agregar script post-request
// para hacer login automático después del registro exitoso
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    if (jsonData.usuario && jsonData.usuario.correo) {
        // Hacer login automático con las credenciales registradas
        pm.sendRequest({
            url: pm.collectionVariables.get("BASE_URL") + "/api/usuarios/login",
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: {
                mode: 'raw',
                raw: JSON.stringify({
                    correo: jsonData.usuario.correo,
                    contrasena: pm.request.body.raw // La contraseña del body original
                })
            }
        }, function (err, res) {
            if (!err && res.code === 200) {
                var loginData = res.json();
                pm.collectionVariables.set("token", loginData.token);
                console.log("✅ Usuario registrado y autenticado automáticamente");
            }
        });
    }
}
```

### Script Post-request (Extraer orden_id y monto)
```javascript
// En el request de "Crear Solicitud", agregar script post-request
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.orden_id) {
        pm.collectionVariables.set("orden_id", jsonData.data.orden_id);
        pm.collectionVariables.set("monto_a_pagar", jsonData.data.monto_a_pagar);
        console.log("✅ Variables guardadas: orden_id=" + jsonData.data.orden_id + ", monto=" + jsonData.data.monto_a_pagar);
    }
}
```

---

---

## 🎯 Ejemplos Completos para Postman - NUEVA IMPLEMENTACIÓN

### 📋 Variables de Entorno Postman

Crea estas variables en tu colección de Postman:

```json
{
  "BASE_URL": "http://localhost:3000",
  "token_cliente": "",
  "token_admin": "",
  "orden_id": "",
  "monto_a_pagar": "",
  "id_cliente": ""
}
```

---

### 🔄 FLUJO 1: CLIENTE - Crear Solicitud y Pagar

#### Paso 1: Login (Cliente)

**Request:**
```http
POST {{BASE_URL}}/api/usuarios/login
Content-Type: application/json
```

**Body:**
```json
{
  "correo": "cliente@email.com",
  "contrasena": "Cliente123!"
}
```

**Tests (Postman):**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token_cliente", jsonData.token);
    console.log("✅ Token guardado");
}
```

---

#### Paso 2: Crear Solicitud (Cliente)

**⚠️ IMPORTANTE:** Como cliente, NO envíes `id_cliente` - se toma automáticamente del token.

**Request:**
```http
POST {{BASE_URL}}/api/gestion-solicitudes/crear/1
Authorization: Bearer {{token_cliente}}
Content-Type: application/json
```

**Body:**
```json
{
  "nombres_apellidos": "Juan Pérez García",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "1234567890",
  "direccion": "Calle 123 #45-67, Bogotá",
  "telefono": "3001234567",
  "correo": "juan.perez@email.com",
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombre_a_buscar": "Mi Marca Innovadora",
  "tipo_producto_servicio": "Productos alimenticios",
  "clase_niza": "25",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**Tests (Postman):**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    
    // Verificar que requiere pago
    pm.test("Requiere pago", function () {
        pm.expect(jsonData.data.requiere_pago).to.be.true;
    });
    
    pm.test("Estado es Pendiente de Pago", function () {
        pm.expect(jsonData.data.estado).to.eql("Pendiente de Pago");
    });
    
    // Guardar variables
    pm.environment.set("orden_id", jsonData.data.orden_id);
    pm.environment.set("monto_a_pagar", jsonData.data.monto_a_pagar);
    
    console.log("✅ Solicitud creada - ID: " + jsonData.data.orden_id);
    console.log("💰 Monto a pagar: " + jsonData.data.monto_a_pagar);
}
```

**Response Esperado (201):**
```json
{
  "success": true,
  "mensaje": "Solicitud creada. Pendiente de pago para activar.",
  "data": {
    "orden_id": 123,
    "estado": "Pendiente de Pago",
    "monto_a_pagar": 100000.00,
    "requiere_pago": true
  }
}
```

---

#### Paso 3: Procesar Pago (Cliente)

**Request:**
```http
POST {{BASE_URL}}/api/gestion-pagos/process-mock
Authorization: Bearer {{token_cliente}}
Content-Type: application/json
```

**Body:**
```json
{
  "monto": {{monto_a_pagar}},
  "metodo_pago": "Tarjeta",
  "id_orden_servicio": {{orden_id}}
}
```

**Tests (Postman):**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    
    pm.test("Solicitud activada", function () {
        pm.expect(jsonData.data.solicitud_activada).to.be.true;
    });
    
    pm.test("Pago exitoso", function () {
        pm.expect(jsonData.data.payment.estado).to.eql("Pagado");
    });
    
    console.log("✅ Pago procesado - Solicitud activada");
    console.log("📄 ID Pago: " + jsonData.data.payment.id_pago);
}
```

**Response Esperado (201):**
```json
{
  "success": true,
  "message": "Pago procesado exitosamente. Solicitud activada.",
  "data": {
    "payment": {
      "id_pago": 456,
      "monto": 100000.00,
      "estado": "Pagado",
      "id_orden_servicio": 123
    },
    "solicitud_activada": true
  }
}
```

---

#### Paso 4: Verificar Solicitud Activada (Cliente)

**Request:**
```http
GET {{BASE_URL}}/api/gestion-solicitudes/{{orden_id}}
Authorization: Bearer {{token_cliente}}
```

**Tests (Postman):**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    
    pm.test("Solicitud activa", function () {
        pm.expect(jsonData.data.estado).to.not.eql("Pendiente de Pago");
    });
    
    console.log("✅ Estado actual: " + jsonData.data.estado);
}
```

---

### 🔄 FLUJO 2: ADMINISTRADOR - Crear Solicitud (Sin Pago)

#### Paso 1: Login (Administrador)

**Request:**
```http
POST {{BASE_URL}}/api/usuarios/login
Content-Type: application/json
```

**Body:**
```json
{
  "correo": "admin@registrack.com",
  "contrasena": "Admin123!"
}
```

**Tests (Postman):**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token_admin", jsonData.token);
    console.log("✅ Token admin guardado");
}
```

---

#### Paso 2: Crear Solicitud (Administrador)

**⚠️ IMPORTANTE:** Como administrador, DEBES enviar `id_cliente` - La solicitud se activa automáticamente.

**Request:**
```http
POST {{BASE_URL}}/api/gestion-solicitudes/crear/1
Authorization: Bearer {{token_admin}}
Content-Type: application/json
```

**Body:**
```json
{
  "id_cliente": 45,
  "id_empresa": 12,
  "nombres_apellidos": "María González López",
  "tipo_documento": "Cédula de Ciudadanía",
  "numero_documento": "9876543210",
  "direccion": "Carrera 78 #90-12, Medellín",
  "telefono": "3109876543",
  "correo": "maria.gonzalez@email.com",
  "pais": "Colombia",
  "ciudad": "Medellín",
  "codigo_postal": "050001",
  "nombre_a_buscar": "Marca Premium",
  "tipo_producto_servicio": "Servicios tecnológicos",
  "clase_niza": "42",
  "logotipo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD..."
}
```

**Tests (Postman):**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    
    pm.test("NO requiere pago", function () {
        pm.expect(jsonData.data.requiere_pago).to.be.false;
    });
    
    pm.test("Estado activo (no Pendiente de Pago)", function () {
        pm.expect(jsonData.data.estado).to.not.eql("Pendiente de Pago");
    });
    
    pm.test("Monto a pagar es null", function () {
        pm.expect(jsonData.data.monto_a_pagar).to.be.null;
    });
    
    // Guardar variables
    pm.environment.set("orden_id", jsonData.data.orden_id);
    
    console.log("✅ Solicitud creada y ACTIVADA automáticamente");
    console.log("📋 Estado: " + jsonData.data.estado);
    console.log("👤 ID Orden: " + jsonData.data.orden_id);
}
```

**Response Esperado (201):**
```json
{
  "success": true,
  "mensaje": "Solicitud creada y activada exitosamente.",
  "data": {
    "orden_id": 124,
    "estado": "Solicitud Recibida",
    "monto_a_pagar": null,
    "requiere_pago": false,
    "fecha_solicitud": "2025-01-15T10:30:00.000Z"
  },
  "meta": {
    "rol": "administrador",
    "nextSteps": [
      "La solicitud está activa y lista para procesar",
      "Se notificará por email el estado de la solicitud",
      "Puede consultar el estado en cualquier momento"
    ]
  }
}
```

**⚠️ NOTA:** Como administrador, NO necesitas procesar pago. La solicitud ya está activa y lista para procesar.

---

### 📊 Comparación de Flujos

| Aspecto | Cliente | Administrador/Empleado |
|---------|---------|------------------------|
| **Login** | `POST /api/usuarios/login` | `POST /api/usuarios/login` |
| **Body crear solicitud** | Sin `id_cliente` | Con `id_cliente` (obligatorio) |
| **Estado inicial** | "Pendiente de Pago" | Primer estado del proceso |
| **Procesar pago** | ✅ Requerido | ❌ No necesario |
| **Activación** | Al pagar | Automática al crear |

---

## 🧪 Colección Postman Completa

### Estructura de Carpetas

```
📁 Registrack API
├── 📁 Autenticación
│   ├── 👤 Registrar Usuario
│   └── 🔐 Login
│
├── 📁 Solicitudes
│   ├── 📝 Crear Solicitud - Búsqueda
│   ├── 📝 Crear Solicitud - Registro Marca
│   ├── 📋 Listar Solicitudes
│   ├── 🔍 Ver Solicitud por ID
│   └── 🔍 Buscar Solicitudes
│
├── 📁 Pagos
│   ├── 💳 Procesar Pago (Mock)
│   ├── 📄 Ver Pago por ID
│   ├── 📋 Listar Pagos
│   └── ✅ Verificar Pago Manual
│
└── 📁 Flujo Completo
    ├── 🔄 Flujo 1: Crear → Pagar → Verificar
    └── 🔄 Flujo 2: Crear → Pago Fallido → Reintentar
```

---

## 📝 Ejemplo de Request Completo (Postman JSON)

### Request: Registrar Usuario
```json
{
  "name": "Registrar Usuario",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json",
        "type": "text"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"tipo_documento\": \"CC\",\n  \"documento\": \"1234567890\",\n  \"nombre\": \"Juan\",\n  \"apellido\": \"Pérez García\",\n  \"correo\": \"juan.perez@email.com\",\n  \"contrasena\": \"MiPassword123!\"\n}"
    },
    "url": {
      "raw": "{{BASE_URL}}/api/usuarios/registrar",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "usuarios", "registrar"]
    }
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "if (pm.response.code === 201) {",
          "    var jsonData = pm.response.json();",
          "    console.log(\"✅ Usuario registrado: \" + jsonData.usuario.correo);",
          "    console.log(\"👤 ID Usuario: \" + jsonData.usuario.id_usuario);",
          "    console.log(\"📧 Correo: \" + jsonData.usuario.correo);",
          "}"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

### Request: Crear Solicitud y Procesar Pago
```json
{
  "name": "Flujo Completo: Crear Solicitud y Pagar",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{token}}",
        "type": "text"
      },
      {
        "key": "Content-Type",
        "value": "application/json",
        "type": "text"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"nombres_apellidos\": \"Juan Pérez García\",\n  \"tipo_documento\": \"Cédula de Ciudadanía\",\n  \"numero_documento\": \"1234567890\",\n  \"direccion\": \"Calle 123 #45-67\",\n  \"telefono\": \"3001234567\",\n  \"correo\": \"juan.perez@email.com\",\n  \"pais\": \"Colombia\",\n  \"nombre_a_buscar\": \"Mi Marca\",\n  \"tipo_producto_servicio\": \"Productos alimenticios\",\n  \"logotipo\": \"data:image/jpeg;base64,...\"\n}"
    },
    "url": {
      "raw": "{{BASE_URL}}/api/gestion-solicitudes/crear/1",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "gestion-solicitudes", "crear", "1"]
    }
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "if (pm.response.code === 201) {",
          "    var jsonData = pm.response.json();",
          "    pm.collectionVariables.set(\"orden_id\", jsonData.data.orden_id);",
          "    pm.collectionVariables.set(\"monto_a_pagar\", jsonData.data.monto_a_pagar);",
          "    console.log(\"✅ Solicitud creada: \" + jsonData.data.orden_id);",
          "    console.log(\"💰 Monto a pagar: \" + jsonData.data.monto_a_pagar);",
          "}"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

### Request: Procesar Pago
```json
{
  "name": "Procesar Pago y Activar Solicitud",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{token}}",
        "type": "text"
      },
      {
        "key": "Content-Type",
        "value": "application/json",
        "type": "text"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"monto\": {{monto_a_pagar}},\n  \"metodo_pago\": \"Tarjeta\",\n  \"id_orden_servicio\": {{orden_id}}\n}"
    },
    "url": {
      "raw": "{{BASE_URL}}/api/gestion-pagos/process-mock",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "gestion-pagos", "process-mock"]
    }
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "if (pm.response.code === 201) {",
          "    var jsonData = pm.response.json();",
          "    if (jsonData.data.solicitud_activada) {",
          "        console.log(\"✅ Pago procesado y solicitud activada\");",
          "    } else {",
          "        console.log(\"⚠️ Pago procesado pero solicitud no activada\");",
          "    }",
          "}"
        ],
        "type": "text/javascript"
      }
    }
  ]
}
```

---

## ✅ Checklist de Pruebas

### 🔄 Flujo 1: Cliente (Con Pago)

- [ ] **Paso 0 (Opcional):** Registrar usuario exitoso
- [ ] **Paso 0 (Opcional):** Verificar que el correo/documento no esté duplicado
- [ ] **Paso 1:** Login cliente exitoso y token guardado
- [ ] **Paso 2:** Crear solicitud como cliente (SIN `id_cliente` en body)
- [ ] **Paso 2:** Respuesta retorna estado "Pendiente de Pago"
- [ ] **Paso 2:** Respuesta incluye `monto_a_pagar` y `requiere_pago: true`
- [ ] **Paso 3:** Procesar pago exitoso con mock
- [ ] **Paso 3:** Respuesta incluye `solicitud_activada: true`
- [ ] **Paso 4:** Verificar solicitud tiene nuevo estado (no "Pendiente de Pago")
- [ ] **Prueba:** Pago fallido mantiene solicitud en "Pendiente de Pago"
- [ ] **Prueba:** Reintentar pago después de fallo

### 🔄 Flujo 2: Administrador/Empleado (Sin Pago)

- [ ] **Paso 1:** Login administrador/empleado exitoso y token guardado
- [ ] **Paso 2:** Crear solicitud como administrador (CON `id_cliente` en body)
- [ ] **Paso 2:** Respuesta retorna estado activo (NO "Pendiente de Pago")
- [ ] **Paso 2:** Respuesta incluye `monto_a_pagar: null` y `requiere_pago: false`
- [ ] **Paso 2:** Verificar que la solicitud está activa inmediatamente
- [ ] **Prueba:** Verificar que NO se requiere procesar pago
- [ ] **Prueba:** Verificar que el estado es el primer proceso del servicio

---

## 🚨 Errores Comunes

### Error: "Solicitud no encontrada"
- Verificar que el `id_orden_servicio` sea correcto
- Verificar que la solicitud existe en la base de datos

### Error: "La solicitud ya está en estado: [estado]"
- La solicitud ya fue activada anteriormente
- Verificar el estado actual de la solicitud

### Error: "Campos requeridos faltantes"
- Revisar que todos los campos requeridos del servicio estén presentes
- Verificar `GUIA_CAMPOS_SERVICIOS_POSTMAN.md` para campos específicos

### Error: "Para administradores/empleados se requiere id_cliente"
- **Causa:** Intentaste crear una solicitud como administrador/empleado sin enviar `id_cliente`
- **Solución:** Agrega `"id_cliente": 45` al body de la solicitud
- **Nota:** Los clientes NO deben enviar `id_cliente` (se toma del token)

### Error: "Usuario no autenticado"
- Verificar que el token esté en el header `Authorization: Bearer {{token}}`
- Verificar que el token no haya expirado (hacer login nuevamente)

### Error: "Rol no autorizado para crear solicitudes"
- Verificar que tu usuario tenga rol `cliente`, `administrador` o `empleado`
- Contactar al administrador si necesitas permisos

### ⚠️ Comportamiento Esperado

**Cliente:**
- ✅ Estado inicial: "Pendiente de Pago"
- ✅ `requiere_pago: true`
- ✅ Debe procesar pago para activar

**Administrador/Empleado:**
- ✅ Estado inicial: Primer proceso del servicio (ej: "Solicitud Recibida")
- ✅ `requiere_pago: false`
- ✅ NO necesita procesar pago

---

**Última actualización:** Enero 2026  
**Versión:** 2.0  
**Estado:** ✅ Implementado con flujos diferenciados por rol - Listo para pruebas

