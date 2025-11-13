# 📧 Guía Rápida: Configurar Gmail con Nodemailer

## ✅ Estado Actual

- ✅ **Nodemailer instalado** (`nodemailer@^7.0.6`)
- ✅ **Código implementado** y optimizado para Render
- ✅ **Soporte automático** para Gmail y Mailgun

---

## 🚀 Configuración en 3 Pasos

### Paso 1: Crear Contraseña de Aplicación en Gmail

1. **Ve a:** https://myaccount.google.com/apppasswords
   - Si no ves esta opción, primero habilita la verificación en 2 pasos: https://myaccount.google.com/security

2. **Selecciona:**
   - Aplicación: `Correo`
   - Dispositivo: `Otro (nombre personalizado)`
   - Nombre: `Registrack API`

3. **Click en "Generar"**

4. **Copia la contraseña** (16 caracteres, formato: `xxxx xxxx xxxx xxxx`)
   - ⚠️ **IMPORTANTE:** Esta contraseña solo se muestra una vez. Guárdala bien.

---

### Paso 2: Configurar Variables de Entorno

#### En Desarrollo Local (`.env`):

```env
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

**Ejemplo:**
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=juan@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

#### En Render (Environment Variables):

1. Ve a tu servicio en Render
2. Click en **"Environment"** en el menú lateral
3. Agrega estas variables:

```
EMAIL_PROVIDER = gmail
EMAIL_USER = tu_email@gmail.com
EMAIL_PASS = xxxx xxxx xxxx xxxx
```

4. Click en **"Save Changes"**
5. Render reiniciará automáticamente

---

### Paso 3: Verificar que Funciona

#### En Desarrollo Local:

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Busca en los logs:
   ```
   ✅ [EMAIL] Configurado Gmail como proveedor de email
      Email remitente: tu_email@gmail.com
   ✅ [EMAIL] Configuración de email verificada correctamente
   ```

#### En Render:

1. Ve a los **Logs** de tu servicio
2. Busca:
   ```
   ✅ [EMAIL] Configurado Gmail como proveedor de email
      Email remitente: tu_email@gmail.com
   ```

3. Si ves un timeout (normal en Render):
   ```
   ⚠️ [EMAIL] Timeout al verificar conexión (normal en Render/producción)
      Los emails se enviarán cuando se necesiten.
   ```
   - ✅ **Esto es normal** - Los emails funcionarán igual

---

## 🧪 Probar el Envío de Emails

### Opción 1: Probar con Postman (Forgot Password)

**Endpoint:** `POST /api/auth/forgot-password`

**Body:**
```json
{
  "correo": "destinatario@example.com"
}
```

**Response esperado:**
```json
{
  "success": true,
  "message": "Si el correo existe, se envió un enlace de recuperación"
}
```

### Opción 2: Crear una Cita

Cuando creas una cita, se envían emails automáticamente al cliente y al empleado.

---

## ✅ Verificación de Configuración

### Checklist:

- [ ] Contraseña de aplicación creada en Gmail
- [ ] `EMAIL_PROVIDER=gmail` en `.env` o Render
- [ ] `EMAIL_USER` configurado con tu email completo
- [ ] `EMAIL_PASS` configurado con la contraseña de aplicación (16 caracteres)
- [ ] Servidor iniciado sin errores
- [ ] Logs muestran "✅ Configurado Gmail como proveedor de email"
- [ ] Email de prueba enviado correctamente

---

## 🔧 Solución de Problemas

### Error: "Invalid login"

**Causa:** Contraseña incorrecta o no es una contraseña de aplicación.

**Solución:**
1. Verifica que `EMAIL_PASS` sea la contraseña de aplicación (16 caracteres)
2. Asegúrate de no usar tu contraseña normal de Gmail
3. Genera una nueva contraseña de aplicación si es necesario

### Error: "Timeout al verificar conexión"

**Causa:** Normal en Render debido a la latencia de red.

**Solución:**
- ✅ **No es un error** - Los emails funcionarán igual
- El código está optimizado para manejar esto
- Los emails se enviarán cuando se necesiten

### Error: "EMAIL_USER o EMAIL_PASS no están definidas"

**Causa:** Variables de entorno no configuradas.

**Solución:**
1. Verifica que el archivo `.env` existe en la raíz del proyecto
2. Verifica que las variables estén escritas correctamente (sin espacios extra)
3. En Render, verifica que las variables estén en "Environment"

### Los emails no se envían

**Verificaciones:**
1. Revisa los logs del servidor para ver errores
2. Verifica que el correo del destinatario sea válido
3. Revisa la carpeta de spam del destinatario
4. Verifica que `EMAIL_USER` y `EMAIL_PASS` estén correctos

---

## 📊 Límites de Gmail

- **Límite diario:** ~500 emails/día
- **Límite por segundo:** ~14 emails/segundo
- **Si excedes:** Gmail puede bloquear temporalmente (24 horas)

**Nota:** Estos límites son suficientes para la mayoría de aplicaciones.

---

## 🔄 Cambiar a Mailgun (Futuro)

Si necesitas cambiar a Mailgun en el futuro:

1. Actualiza las variables de entorno:
   ```env
   EMAIL_PROVIDER=mailgun
   MAILGUN_API_KEY=tu_api_key
   MAILGUN_DOMAIN=mg.tudominio.com
   MAILGUN_FROM_EMAIL=noreply@tudominio.com
   ```

2. Reinicia el servidor

**Sin cambios en el código** - El sistema detecta automáticamente el cambio.

---

## 📝 Variables de Entorno Completas

### Mínimas para Gmail:

```env
EMAIL_PROVIDER=gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
```

### Opcionales:

```env
# Para Render (se detecta automáticamente)
RENDER=true

# Entorno
NODE_ENV=production
```

---

## ✅ Resumen

1. ✅ **Nodemailer ya está instalado**
2. ✅ **Código ya está implementado**
3. ✅ **Solo necesitas configurar las variables de entorno**
4. ✅ **Funciona en desarrollo y Render**

**Tiempo estimado:** 5 minutos

---

**Última actualización:** Enero 2026

