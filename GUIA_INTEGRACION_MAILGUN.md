# 📧 Guía de Integración de Mailgun - API Registrack

**Fecha:** Enero 2026  
**Objetivo:** Integrar Mailgun para envío de correos electrónicos en producción (Render)

---

## 📋 Tabla de Contenidos

1. [¿Por qué Mailgun?](#por-qué-mailgun)
2. [Paso 1: Crear cuenta en Mailgun](#paso-1-crear-cuenta-en-mailgun)
3. [Paso 2: Obtener API Key](#paso-2-obtener-api-key)
4. [Paso 3: Verificar dominio](#paso-3-verificar-dominio)
5. [Paso 4: Instalar dependencias](#paso-4-instalar-dependencias)
6. [Paso 5: Configurar variables de entorno](#paso-5-configurar-variables-de-entorno)
7. [Paso 6: Configurar en Render](#paso-6-configurar-en-render)
8. [Paso 7: Probar la integración](#paso-7-probar-la-integración)
9. [Solución de problemas](#solución-de-problemas)

---

## 🎯 ¿Por qué Mailgun?

### Ventajas de Mailgun sobre Gmail:

1. **✅ Mejor para producción:**
   - Diseñado específicamente para envío masivo de emails
   - No tiene límites estrictos como Gmail (500 emails/día)
   - Mejor deliverability (llegada a inbox)

2. **✅ Más confiable en Render:**
   - API REST simple y rápida
   - No requiere autenticación SMTP compleja
   - Menos problemas de timeout

3. **✅ Plan gratuito generoso:**
   - 5,000 emails/mes gratis (primeros 3 meses)
   - Luego 1,000 emails/mes gratis
   - Suficiente para la mayoría de aplicaciones pequeñas/medianas

4. **✅ Mejor para escalar:**
   - Estadísticas y analytics en tiempo real
   - Tracking de emails (abiertos, clicks, bounces)
   - Templates avanzados
   - Webhooks para eventos

---

## 📝 Paso 1: Crear cuenta en Mailgun

1. **Visita:** https://signup.mailgun.com/
2. **Completa el formulario:**
   - Email
   - Contraseña
   - Nombre de la empresa (opcional)
   - País
3. **Verifica tu email** (revisa tu bandeja de entrada)
4. **Completa el onboarding:**
   - Selecciona tu caso de uso (ej: "Transactional Emails")
   - Selecciona tu lenguaje (Node.js)

---

## 🔑 Paso 2: Obtener API Key

1. **Inicia sesión** en Mailgun: https://app.mailgun.com/
2. **Ve a Sending → API Keys:**
   - Menú lateral izquierdo → **Sending** → **API Keys**
3. **Copia tu Private API Key:**
   - Se muestra en la página principal
   - Formato: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx`
   - **⚠️ IMPORTANTE:** Guarda esta clave en un lugar seguro

**Nota:** Mailgun también tiene una "Public API Key" pero para enviar emails necesitas la "Private API Key".

---

## 🌐 Paso 3: Verificar dominio

### Opción A: Usar dominio de prueba (Solo para desarrollo)

Mailgun proporciona un dominio de prueba (`sandboxXXXXX.mailgun.org`) que puedes usar inmediatamente:

1. **Ve a Sending → Domains:**
   - Verás un dominio tipo `sandboxXXXXX.mailgun.org`
2. **Copia el dominio:**
   - Este es tu `MAILGUN_DOMAIN`
   - Ejemplo: `sandbox1234567890abcdef.mailgun.org`
3. **⚠️ Limitaciones:**
   - Solo puedes enviar a emails autorizados (agregados en Mailgun)
   - No es para producción
   - Ideal para desarrollo y pruebas

### Opción B: Verificar tu propio dominio (Recomendado para producción)

1. **Ve a Sending → Domains:**
   - Click en **"Add New Domain"**
2. **Ingresa tu dominio:**
   - Ejemplo: `mg.tudominio.com` o `mail.tudominio.com`
   - O simplemente `tudominio.com`
3. **Configura registros DNS:**
   - Mailgun te dará registros DNS específicos
   - Debes agregarlos en tu proveedor de DNS (ej: Cloudflare, GoDaddy, etc.)
   - Tipos de registros:
     - **TXT** (para verificación)
     - **MX** (para recepción de emails)
     - **CNAME** (para tracking)
4. **Espera la verificación:**
   - Puede tardar desde minutos hasta 48 horas
   - Mailgun verificará automáticamente cuando los registros DNS estén correctos
5. **Una vez verificado:**
   - El dominio aparecerá como "Active"
   - Usa este dominio como `MAILGUN_DOMAIN`

---

## 📦 Paso 4: Instalar dependencias

En la raíz del proyecto, ejecuta:

```bash
npm install mailgun.js form-data
```

O si estás en Windows PowerShell:

```powershell
npm install mailgun.js form-data
```

**Nota:** `form-data` es una dependencia requerida por `mailgun.js`.

---

## ⚙️ Paso 5: Configurar variables de entorno

### En tu archivo `.env` local (desarrollo):

Agrega estas variables:

```env
# =============================================
# CONFIGURACIÓN DE EMAIL
# =============================================
# Opción 1: Mailgun (Recomendado para producción/Render)
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=tu_api_key_aqui
MAILGUN_DOMAIN=mg.tudominio.com
MAILGUN_FROM_EMAIL=noreply@tudominio.com

# Opción 2: Gmail (Para desarrollo local)
# EMAIL_PROVIDER=gmail
# EMAIL_USER=tu_email@gmail.com
# EMAIL_PASS=tu_contraseña_de_aplicacion
```

### Variables explicadas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `EMAIL_PROVIDER` | Proveedor de email a usar: `mailgun` o `gmail` | `mailgun` |
| `MAILGUN_API_KEY` | Tu Private API Key de Mailgun | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx-xxxxxxxx` |
| `MAILGUN_DOMAIN` | Tu dominio verificado en Mailgun | `mg.tudominio.com` o `sandboxXXXXX.mailgun.org` |
| `MAILGUN_FROM_EMAIL` | Email remitente (debe ser del dominio verificado) | `noreply@tudominio.com` |

**Nota:** Si `EMAIL_PROVIDER` no está definido o es `gmail`, el sistema usará Gmail por defecto (compatibilidad hacia atrás).

---

## 🚀 Paso 6: Configurar en Render

1. **Ve a tu servicio en Render:**
   - https://dashboard.render.com/
   - Selecciona tu servicio (API Registrack)

2. **Ve a Environment:**
   - En el menú lateral, click en **"Environment"**

3. **Agrega las variables de entorno:**
   - Click en **"Add Environment Variable"**
   - Agrega cada una:

   ```
   KEY: EMAIL_PROVIDER
   VALUE: mailgun
   ```

   ```
   KEY: MAILGUN_API_KEY
   VALUE: tu_api_key_aqui
   ```

   ```
   KEY: MAILGUN_DOMAIN
   VALUE: mg.tudominio.com
   ```

   ```
   KEY: MAILGUN_FROM_EMAIL
   VALUE: noreply@tudominio.com
   ```

4. **Guarda los cambios:**
   - Render reiniciará automáticamente tu servicio

---

## 🧪 Paso 7: Probar la integración

### Opción 1: Probar con un endpoint existente

1. **Inicia sesión** en tu aplicación
2. **Crea una solicitud** o **solicita recuperación de contraseña**
3. **Revisa los logs** en Render para ver si el email se envió
4. **Revisa tu bandeja de entrada** (y spam)

### Opción 2: Probar directamente con Postman

**Endpoint:** `POST /api/usuarios/forgot-password`

**Body:**
```json
{
  "correo": "tu_email@example.com"
}
```

**Headers:**
```
Content-Type: application/json
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Código de verificación enviado a tu correo"
}
```

### Opción 3: Verificar logs en Render

1. **Ve a tu servicio en Render**
2. **Click en "Logs"**
3. **Busca mensajes como:**
   - `✅ [EMAIL] Email enviado exitosamente con Mailgun`
   - `✅ Código de restablecimiento enviado a: email@example.com`

### Opción 4: Verificar en Mailgun Dashboard

1. **Ve a Mailgun Dashboard:**
   - https://app.mailgun.com/
2. **Ve a Sending → Logs:**
   - Verás todos los emails enviados
   - Estado de cada email (delivered, failed, etc.)
   - Detalles de entrega

---

## 🔧 Solución de problemas

### Error: "API Key is invalid"

**Solución:**
- Verifica que copiaste la Private API Key completa
- Asegúrate de que no hay espacios antes o después
- Verifica que estás usando la Private API Key (no la Public)

### Error: "Domain not found" o "Domain is not verified"

**Solución:**
- Verifica que `MAILGUN_DOMAIN` es correcto
- Si usas dominio propio, verifica que está verificado en Mailgun
- Si usas dominio sandbox, asegúrate de copiar el dominio completo
- Verifica que el dominio aparece como "Active" en Mailgun

### Error: "Forbidden to send from this address"

**Solución:**
- El email remitente (`MAILGUN_FROM_EMAIL`) debe ser del dominio verificado
- Si usas dominio sandbox, el email debe ser del formato `noreply@sandboxXXXXX.mailgun.org`
- Si usas tu dominio, el email debe ser del formato `noreply@tudominio.com`

### Los emails no llegan

**Solución:**
1. **Revisa la carpeta de spam**
2. **Verifica los logs en Render:**
   - Busca errores relacionados con Mailgun
3. **Verifica en Mailgun:**
   - Ve a **Sending → Logs**
   - Verás el estado de cada email enviado
   - Si hay errores, verás los detalles
4. **Verifica las variables de entorno:**
   - Asegúrate de que están correctamente configuradas en Render
5. **Si usas dominio sandbox:**
   - Solo puedes enviar a emails autorizados
   - Ve a **Sending → Authorized Recipients** y agrega el email

### Error: "Module not found: mailgun.js" o "Module not found: form-data"

**Solución:**
```bash
npm install mailgun.js form-data
```

Y asegúrate de que están en `package.json`:
```json
{
  "dependencies": {
    "mailgun.js": "^11.0.1",
    "form-data": "^4.0.0"
  }
}
```

### El sistema sigue usando Gmail

**Solución:**
- Verifica que `EMAIL_PROVIDER=mailgun` está en tu `.env` o en Render
- Reinicia el servidor después de cambiar las variables de entorno
- Verifica los logs al iniciar el servidor (debe decir "Usando Mailgun")

### Error: "Request failed with status code 401"

**Solución:**
- Verifica que tu API Key es correcta
- Asegúrate de usar la Private API Key (no la Public)
- Verifica que la API Key no ha expirado o sido revocada

---

## 📊 Monitoreo en Mailgun

### Ver estadísticas:

1. **Ve a Mailgun Dashboard:**
   - https://app.mailgun.com/
2. **Ve a Analytics:**
   - Estadísticas de entregas
   - Tasa de apertura
   - Tasa de clicks
   - Bounces y quejas
3. **Ve a Sending → Logs:**
   - Todos los emails enviados
   - Estado de cada email
   - Detalles de entrega

### Webhooks (Opcional):

Mailgun puede enviar webhooks cuando ocurren eventos (delivered, opened, clicked, etc.). Puedes configurarlos en:
- **Sending → Webhooks**

---

## 🔄 Cambiar entre Mailgun y Gmail

### Para usar Mailgun:
```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=tu_api_key
MAILGUN_DOMAIN=mg.tudominio.com
MAILGUN_FROM_EMAIL=noreply@tudominio.com
```

### Para usar Gmail:
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

### Sin especificar (por defecto usa Gmail):
```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
```

---

## ✅ Checklist de integración

- [ ] Cuenta creada en Mailgun
- [ ] API Key obtenida y guardada
- [ ] Dominio verificado en Mailgun (propio o sandbox)
- [ ] `mailgun.js` y `form-data` instalados (`npm install mailgun.js form-data`)
- [ ] Variables de entorno configuradas en `.env` local
- [ ] Variables de entorno configuradas en Render
- [ ] Servicio reiniciado en Render
- [ ] Email de prueba enviado exitosamente
- [ ] Email recibido en bandeja de entrada
- [ ] Logs verificados en Render y Mailgun

---

## 📚 Recursos adicionales

- **Documentación oficial de Mailgun:** https://documentation.mailgun.com/
- **Node.js SDK:** https://github.com/mailgun/mailgun-js
- **API Reference:** https://documentation.mailgun.com/en/latest/api_reference.html
- **Guía de verificación de dominio:** https://documentation.mailgun.com/en/latest/quickstart-sending.html#verify-your-domain

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs** en Render
2. **Revisa Logs** en Mailgun Dashboard
3. **Verifica las variables de entorno**
4. **Consulta la documentación** de Mailgun
5. **Verifica el estado del dominio** en Mailgun

---

## 💡 Tips adicionales

### Usar dominio sandbox para desarrollo:

Si estás en desarrollo, puedes usar el dominio sandbox de Mailgun:

```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=tu_api_key
MAILGUN_DOMAIN=sandbox1234567890abcdef.mailgun.org
MAILGUN_FROM_EMAIL=noreply@sandbox1234567890abcdef.mailgun.org
```

**Nota:** Solo puedes enviar a emails que agregues en "Authorized Recipients" en Mailgun.

### Verificar dominio propio:

Para producción, es recomendable verificar tu propio dominio:

1. Crea un subdominio (ej: `mg.tudominio.com`)
2. Verifícalo en Mailgun
3. Usa emails de ese dominio como remitente

Esto mejora la deliverability y la reputación de tus emails.

---

**Última actualización:** Enero 2026  
**Versión:** 1.0

