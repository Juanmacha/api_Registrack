# 🧪 Ejemplos Postman - Validaciones de Login y Autenticación

**Fecha:** Enero 2026  
**Versión:** 1.0  
**Objetivo:** Probar todas las validaciones implementadas en el sistema de autenticación

---

## 📋 Tabla de Contenidos

1. [Rate Limiting](#1-rate-limiting)
2. [Validación de Contraseñas Comunes](#2-validación-de-contraseñas-comunes)
3. [Validación de Estado del Usuario](#3-validación-de-estado-del-usuario)
4. [Sanitización de Inputs](#4-sanitización-de-inputs)
5. [Validación de Fortaleza de Contraseña](#5-validación-de-fortaleza-de-contraseña)

---

## 🔧 Configuración Base

### Variables de Entorno en Postman

Crea las siguientes variables en tu colección de Postman:

```
base_url: http://localhost:3000 (o tu URL de producción)
token: (se llenará automáticamente después del login)
```

### Headers Comunes

Para todas las solicitudes de autenticación:
```
Content-Type: application/json
```

Para solicitudes protegidas (después de login):
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

---

## 1. Rate Limiting

### 1.1. Rate Limiting en Login (5 intentos / 15 minutos)

**Endpoint:** `POST {{base_url}}/api/usuarios/login`

#### Test 1: Login Exitoso (No cuenta para rate limit si skipSuccessfulRequests = false)
```json
{
  "correo": "usuario@ejemplo.com",
  "contrasena": "Password123!"
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": { ... },
    "token": "...",
    "expiresIn": "1h"
  }
}
```

#### Test 2-6: Intentos Fallidos (5 intentos máximo)

**Intento 2: Credenciales Incorrectas**
```json
{
  "correo": "usuario@ejemplo.com",
  "contrasena": "PasswordIncorrecta123!"
}
```

**Respuesta Esperada (401):**
```json
{
  "success": false,
  "error": {
    "message": "Credenciales inválidas",
    "code": "INVALID_CREDENTIALS"
  }
}
```

**Intento 3-6:** Repetir el mismo request con contraseña incorrecta

**Intento 7: Rate Limit Excedido**
```json
{
  "correo": "usuario@ejemplo.com",
  "contrasena": "PasswordIncorrecta123!"
}
```

**Respuesta Esperada (429):**
```json
{
  "success": false,
  "error": {
    "message": "Demasiados intentos de login. Por favor, intenta nuevamente en 15 minutos.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": "15 minutos",
    "details": "Has excedido el límite de 5 intentos de login por IP. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente."
  }
}
```

**Headers de Respuesta (429):**
```
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: [timestamp en segundos]
```

---

### 1.2. Rate Limiting en Registro (3 intentos / 15 minutos)

**Endpoint:** `POST {{base_url}}/api/usuarios/registrar`

#### Test 1-3: Registros Exitosos (No cuentan si skipSuccessfulRequests = true)

**Intento 1: Registro Exitoso**
```json
{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@ejemplo.com",
  "telefono": "3001234567",
  "contrasena": "Password123!"
}
```

**Intento 2-3:** Repetir con diferentes correos y documentos

#### Test 4: Rate Limit Excedido

**Intento 4: Cuarto Registro (Rate Limit)**
```json
{
  "tipo_documento": "CC",
  "documento": "9876543210",
  "nombre": "María",
  "apellido": "González",
  "correo": "maria.gonzalez@ejemplo.com",
  "telefono": "3009876543",
  "contrasena": "Password123!"
}
```

**Respuesta Esperada (429):**
```json
{
  "success": false,
  "error": {
    "message": "Demasiados intentos de registro. Por favor, intenta nuevamente en 15 minutos.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": "15 minutos"
  }
}
```

---

### 1.3. Rate Limiting en Recuperación de Contraseña (3 intentos / 15 minutos)

**Endpoint:** `POST {{base_url}}/api/usuarios/forgot-password`

#### Test 1-3: Solicitudes de Recuperación

**Intento 1: Solicitud Exitosa**
```json
{
  "correo": "usuario@ejemplo.com"
}
```

**Intento 2-3:** Repetir con el mismo correo

#### Test 4: Rate Limit Excedido

**Intento 4: Cuarta Solicitud**
```json
{
  "correo": "usuario@ejemplo.com"
}
```

**Respuesta Esperada (429):**
```json
{
  "success": false,
  "error": {
    "message": "Demasiadas solicitudes de recuperación de contraseña. Por favor, intenta nuevamente en 15 minutos.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

### 1.4. Rate Limiting en Reset de Contraseña (5 intentos / 15 minutos)

**Endpoint:** `POST {{base_url}}/api/usuarios/reset-password`

#### Test 1-5: Intentos de Reset

**Intento 1: Reset con Código Incorrecto**
```json
{
  "code": "000000",
  "newPassword": "NewPassword123!"
}
```

**Respuesta Esperada (400):**
```json
{
  "mensaje": "Código de verificación inválido o expirado"
}
```

**Intento 2-5:** Repetir con diferentes códigos incorrectos

#### Test 6: Rate Limit Excedido

**Intento 6: Sexto Intento**
```json
{
  "code": "000000",
  "newPassword": "NewPassword123!"
}
```

**Respuesta Esperada (429):**
```json
{
  "success": false,
  "error": {
    "message": "Demasiados intentos de reset de contraseña. Por favor, intenta nuevamente en 15 minutos.",
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## 2. Validación de Contraseñas Comunes

### 2.1. Registro con Contraseña Común

**Endpoint:** `POST {{base_url}}/api/usuarios/registrar`

#### Test 1: Contraseña "123456"
```json
{
  "tipo_documento": "CC",
  "documento": "1111111111",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test1@ejemplo.com",
  "telefono": "3001111111",
  "contrasena": "123456"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña es demasiado común y no es segura. Por favor, elija una contraseña más segura.",
    "code": "COMMON_PASSWORD",
    "details": "Esta contraseña está en la lista de contraseñas más comunes y es vulnerable a ataques. Por favor, use una contraseña única y segura.",
    "sugerencias": [
      "Use al menos 8 caracteres",
      "Combine letras mayúsculas y minúsculas",
      "Incluya números y caracteres especiales",
      "Evite palabras comunes o patrones simples",
      "Use una frase única o combinación de palabras"
    ]
  },
  "timestamp": "2026-01-XX..."
}
```

#### Test 2: Contraseña "password"
```json
{
  "tipo_documento": "CC",
  "documento": "2222222222",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test2@ejemplo.com",
  "telefono": "3002222222",
  "contrasena": "password"
}
```

**Respuesta Esperada (400):** Similar al Test 1

#### Test 3: Contraseña "admin123"
```json
{
  "tipo_documento": "CC",
  "documento": "3333333333",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test3@ejemplo.com",
  "telefono": "3003333333",
  "contrasena": "admin123"
}
```

**Respuesta Esperada (400):** Similar al Test 1

---

### 2.2. Reset de Contraseña con Contraseña Común

**Endpoint:** `POST {{base_url}}/api/usuarios/reset-password`

#### Test: Reset con Contraseña Común
```json
{
  "code": "123456",
  "newPassword": "123456"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña es demasiado común y no es segura. Por favor, elija una contraseña más segura.",
    "code": "COMMON_PASSWORD",
    "details": "...",
    "sugerencias": [...]
  }
}
```

---

## 3. Validación de Estado del Usuario

### 3.1. Login con Usuario Inactivo

**Endpoint:** `POST {{base_url}}/api/usuarios/login`

#### Test: Login con Usuario Desactivado
```json
{
  "correo": "usuario.inactivo@ejemplo.com",
  "contrasena": "Password123!"
}
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "error": {
    "message": "Su cuenta está inactiva. Contacte al administrador.",
    "code": "ACCESS_DENIED",
    "details": {
      "reason": "Cuenta inactiva"
    }
  }
}
```

---

### 3.2. Token con Usuario Inactivo

**Endpoint:** `GET {{base_url}}/api/usuarios` (o cualquier endpoint protegido)

**Headers:**
```
Authorization: Bearer [token_de_usuario_inactivo]
```

**Respuesta Esperada (403):**
```json
{
  "success": false,
  "mensaje": "Usuario inactivo",
  "error": "El usuario está inactivo. Por favor, contacte al administrador.",
  "code": "USER_INACTIVE",
  "detalles": "Su cuenta ha sido desactivada. No puede acceder al sistema hasta que sea reactivada."
}
```

---

### 3.3. Token con Usuario Eliminado

**Endpoint:** `GET {{base_url}}/api/usuarios`

**Headers:**
```
Authorization: Bearer [token_de_usuario_eliminado]
```

**Respuesta Esperada (401):**
```json
{
  "success": false,
  "mensaje": "Usuario no encontrado",
  "error": "El usuario asociado al token no existe en el sistema.",
  "code": "USER_NOT_FOUND"
}
```

---

## 4. Sanitización de Inputs

### 4.1. Login con Caracteres Especiales en Correo

**Endpoint:** `POST {{base_url}}/api/usuarios/login`

#### Test 1: Correo con Caracteres Peligrosos
```json
{
  "correo": "usuario<script>alert('xss')</script>@ejemplo.com",
  "contrasena": "Password123!"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "El correo electrónico contiene caracteres inválidos",
    "code": "INVALID_EMAIL_FORMAT",
    "details": "El correo no puede contener caracteres especiales peligrosos"
  }
}
```

#### Test 2: Correo con SQL Injection
```json
{
  "correo": "usuario' OR '1'='1'@ejemplo.com",
  "contrasena": "Password123!"
}
```

**Respuesta Esperada (400):** Similar al Test 1

#### Test 3: Correo Normal (Debe Funcionar)
```json
{
  "correo": "usuario@ejemplo.com",
  "contrasena": "Password123!"
}
```

**Respuesta Esperada (200):** Login exitoso

---

### 4.2. Login con Espacios en Correo

**Endpoint:** `POST {{base_url}}/api/usuarios/login`

#### Test: Correo con Espacios (Debe ser Trimmed)
```json
{
  "correo": "  usuario@ejemplo.com  ",
  "contrasena": "Password123!"
}
```

**Respuesta Esperada (200):** Login exitoso (el correo se sanitiza automáticamente)

---

## 5. Validación de Fortaleza de Contraseña

### 5.1. Registro con Contraseña Débil

**Endpoint:** `POST {{base_url}}/api/usuarios/registrar`

#### Test 1: Contraseña Muy Corta (< 8 caracteres)
```json
{
  "tipo_documento": "CC",
  "documento": "4444444444",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test4@ejemplo.com",
  "telefono": "3004444444",
  "contrasena": "Pass1!"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña debe tener mínimo 8 caracteres",
    "code": "PASSWORD_TOO_SHORT",
    "minLength": 8,
    "actualLength": 6
  }
}
```

#### Test 2: Contraseña Sin Mayúsculas
```json
{
  "tipo_documento": "CC",
  "documento": "5555555555",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test5@ejemplo.com",
  "telefono": "3005555555",
  "contrasena": "password123!"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña debe contener al menos una letra mayúscula",
    "code": "PASSWORD_NO_UPPERCASE",
    "requisitos": ["Al menos una letra mayúscula (A-Z)"]
  }
}
```

#### Test 3: Contraseña Sin Números
```json
{
  "tipo_documento": "CC",
  "documento": "6666666666",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test6@ejemplo.com",
  "telefono": "3006666666",
  "contrasena": "Password!"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña debe contener al menos un número",
    "code": "PASSWORD_NO_NUMBER",
    "requisitos": ["Al menos un número (0-9)"]
  }
}
```

#### Test 4: Contraseña Sin Caracteres Especiales
```json
{
  "tipo_documento": "CC",
  "documento": "7777777777",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test7@ejemplo.com",
  "telefono": "3007777777",
  "contrasena": "Password123"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña debe contener al menos un carácter especial",
    "code": "PASSWORD_NO_SPECIAL",
    "requisitos": ["Al menos un carácter especial (!@#$%^&*()_+-=[]{}|;':\"\\,.<>/?"]
  }
}
```

#### Test 5: Contraseña Muy Larga (> 128 caracteres)
```json
{
  "tipo_documento": "CC",
  "documento": "8888888888",
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test8@ejemplo.com",
  "telefono": "3008888888",
  "contrasena": "A".repeat(129) + "1!"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña no puede exceder 128 caracteres",
    "code": "PASSWORD_TOO_LONG",
    "maxLength": 128,
    "actualLength": 131
  }
}
```

---

### 5.2. Reset de Contraseña con Contraseña Débil

**Endpoint:** `POST {{base_url}}/api/usuarios/reset-password`

#### Test: Reset con Contraseña Débil
```json
{
  "code": "123456",
  "newPassword": "weak"
}
```

**Respuesta Esperada (400):**
```json
{
  "success": false,
  "error": {
    "message": "La contraseña debe tener mínimo 8 caracteres",
    "code": "PASSWORD_TOO_SHORT"
  }
}
```

---

## 6. Casos de Éxito

### 6.1. Registro Exitoso con Contraseña Segura

**Endpoint:** `POST {{base_url}}/api/usuarios/registrar`

```json
{
  "tipo_documento": "CC",
  "documento": "9999999999",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@ejemplo.com",
  "telefono": "3009999999",
  "contrasena": "MySecureP@ssw0rd2024!"
}
```

**Respuesta Esperada (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "usuario": {
      "id_usuario": 123,
      "tipo_documento": "CC",
      "documento": "9999999999",
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan.perez@ejemplo.com",
      "telefono": "3009999999",
      "id_rol": 1,
      "estado": true
    }
  }
}
```

---

### 6.2. Login Exitoso

**Endpoint:** `POST {{base_url}}/api/usuarios/login`

```json
{
  "correo": "juan.perez@ejemplo.com",
  "contrasena": "MySecureP@ssw0rd2024!"
}
```

**Respuesta Esperada (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "usuario": {
      "id_usuario": 123,
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan.perez@ejemplo.com",
      "telefono": "3009999999",
      "rol": "cliente",
      "estado": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1h"
  }
}
```

---

## 📝 Notas Importantes

1. **Rate Limiting:**
   - Los límites se resetean después de 15 minutos
   - Cada IP tiene su propio contador
   - Los headers `RateLimit-*` muestran el estado actual

2. **Contraseñas Comunes:**
   - La lista incluye más de 50 contraseñas comunes
   - Se valida en minúsculas (case-insensitive)
   - Se aplica tanto en registro como en reset de contraseña

3. **Sanitización:**
   - Los correos se convierten a minúsculas automáticamente
   - Se remueven espacios al inicio y final
   - Se bloquean caracteres peligrosos (`<>\"'%;()&+`)

4. **Estado del Usuario:**
   - Se valida en cada request con token JWT
   - Si el usuario es desactivado, todos sus tokens quedan inválidos
   - Si el usuario es eliminado, el token retorna error 401

---

## 🚀 Scripts de Postman (Opcional)

### Script Pre-request para Auto-guardar Token

En la pestaña "Tests" del request de login exitoso:

```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.token) {
        pm.environment.set("token", jsonData.data.token);
        console.log("Token guardado:", jsonData.data.token);
    }
}
```

### Script para Verificar Rate Limit

En la pestaña "Tests" de cualquier request:

```javascript
if (pm.response.code === 429) {
    const rateLimitReset = pm.response.headers.get("RateLimit-Reset");
    const resetDate = new Date(parseInt(rateLimitReset) * 1000);
    console.log("Rate limit excedido. Se resetea en:", resetDate);
}
```

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

