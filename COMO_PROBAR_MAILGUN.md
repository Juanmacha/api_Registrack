# 🧪 Cómo Probar Mailgun - Guía Rápida

## ✅ Paso 1: Verificar que las dependencias estén instaladas

Ejecuta en la terminal (en la carpeta `api_Registrack`):

```bash
npm install mailgun.js form-data
```

O si estás en Windows PowerShell y tienes problemas, usa CMD:

```cmd
npm install mailgun.js form-data
```

---

## ✅ Paso 2: Verificar que el servidor esté corriendo

Inicia tu servidor:

```bash
npm start
```

O en modo desarrollo:

```bash
npm run dev
```

**Busca en los logs al iniciar:**
- Debe aparecer: `✅ [EMAIL] Configurado Mailgun como proveedor de email`
- Debe mostrar: `Dominio: tu_dominio`
- Debe mostrar: `Email remitente: tu_email`

Si ves estos mensajes, Mailgun está configurado correctamente.

---

## 🧪 Paso 3: Probar el envío de emails

### **Opción A: Usar Postman (Recomendado)**

**Endpoint:** `POST http://localhost:3000/api/usuarios/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "correo": "tu_email@example.com"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "success": true,
  "message": "Código de verificación enviado a tu correo"
}
```

**⚠️ IMPORTANTE:** 
- Si usas el dominio **sandbox** de Mailgun, el email debe estar en "Authorized Recipients"
- Ve a Mailgun Dashboard → Sending → Authorized Recipients y agrega el email

---

### **Opción B: Usar cURL**

```bash
curl -X POST http://localhost:3000/api/usuarios/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"correo\": \"tu_email@example.com\"}"
```

---

### **Opción C: Probar con otro endpoint que envíe emails**

Puedes probar creando una solicitud, una cita, o cualquier acción que envíe emails automáticamente.

---

## ✅ Paso 4: Verificar que funcionó

### **1. Revisar los logs del servidor**

Debes ver en la consola:

```
✅ [EMAIL] Email enviado exitosamente con Mailgun a: tu_email@example.com
✅ Código de restablecimiento enviado a: tu_email@example.com
```

Si ves errores, revisa la sección de "Solución de problemas" más abajo.

---

### **2. Revisar tu bandeja de entrada**

- Revisa tu email (incluyendo spam/correo no deseado)
- Debe llegar un email con el código de verificación
- El remitente debe ser el email configurado en `MAILGUN_FROM_EMAIL`

---

### **3. Verificar en Mailgun Dashboard**

1. **Ve a:** https://app.mailgun.com/
2. **Click en:** Sending → Logs
3. **Deberías ver:**
   - El email que enviaste
   - Estado: "delivered" (entregado) o "failed" (fallido)
   - Detalles del envío

---

## 🔧 Solución de problemas

### ❌ Error: "Mailgun configurado" no aparece en los logs

**Problema:** Las variables de entorno no están configuradas correctamente.

**Solución:**
1. Verifica tu archivo `.env`:
   ```env
   EMAIL_PROVIDER=mailgun
   MAILGUN_API_KEY=tu_api_key
   MAILGUN_DOMAIN=tu_dominio
   MAILGUN_FROM_EMAIL=tu_email
   ```

2. Reinicia el servidor después de cambiar el `.env`

---

### ❌ Error: "API Key is invalid" o "401 Unauthorized"

**Problema:** La API Key es incorrecta.

**Solución:**
1. Ve a Mailgun Dashboard → Sending → API Keys
2. Copia la **Private API Key** (no la Public)
3. Verifica que no hay espacios antes o después
4. Actualiza `MAILGUN_API_KEY` en tu `.env`
5. Reinicia el servidor

---

### ❌ Error: "Domain not found" o "Domain is not verified"

**Problema:** El dominio no está configurado o verificado.

**Solución:**
1. Si usas dominio **sandbox:**
   - Ve a Mailgun Dashboard → Sending → Domains
   - Copia el dominio completo (ej: `sandbox1234567890abcdef.mailgun.org`)
   - Úsalo en `MAILGUN_DOMAIN`

2. Si usas tu propio dominio:
   - Verifica que está verificado en Mailgun
   - Debe aparecer como "Active" en Mailgun Dashboard
   - Verifica que `MAILGUN_DOMAIN` es correcto

---

### ❌ Error: "Forbidden to send from this address"

**Problema:** El email remitente no es del dominio verificado.

**Solución:**
1. Si usas dominio **sandbox:**
   - El email debe ser: `noreply@sandboxXXXXX.mailgun.org`
   - Actualiza `MAILGUN_FROM_EMAIL` con este formato

2. Si usas tu propio dominio:
   - El email debe ser del dominio verificado
   - Ejemplo: Si tu dominio es `mg.tudominio.com`, el email puede ser `noreply@tudominio.com` o `noreply@mg.tudominio.com`

---

### ❌ El email no llega (pero no hay errores en logs)

**Solución:**
1. **Revisa la carpeta de spam**
2. **Si usas dominio sandbox:**
   - El email debe estar en "Authorized Recipients"
   - Ve a Mailgun Dashboard → Sending → Authorized Recipients
   - Agrega el email de destino
3. **Verifica en Mailgun Logs:**
   - Ve a Sending → Logs
   - Verás el estado del email (delivered, failed, etc.)
   - Si falló, verás el motivo

---

### ❌ Error: "Module not found: mailgun.js" o "Module not found: form-data"

**Solución:**
```bash
npm install mailgun.js form-data
```

---

## 📋 Checklist de verificación

- [ ] Dependencias instaladas (`mailgun.js` y `form-data`)
- [ ] Variables de entorno configuradas en `.env`
- [ ] Servidor iniciado y muestra "Mailgun configurado" en logs
- [ ] Email de prueba enviado (endpoint `/api/usuarios/forgot-password`)
- [ ] Logs muestran "Email enviado exitosamente con Mailgun"
- [ ] Email recibido en bandeja de entrada (o spam)
- [ ] Mailgun Dashboard muestra el email como "delivered"

---

## 🎯 Prueba rápida con Postman

1. **Abre Postman**
2. **Crea nueva request:**
   - Método: `POST`
   - URL: `http://localhost:3000/api/usuarios/forgot-password`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "correo": "tu_email@example.com"
   }
   ```
5. **Click en Send**
6. **Verifica:**
   - Respuesta: `{"success": true, "message": "..."}`
   - Logs del servidor: `✅ [EMAIL] Email enviado exitosamente con Mailgun`
   - Tu email: Debe llegar el código de verificación

---

## 💡 Tips

1. **Para desarrollo:** Usa el dominio sandbox de Mailgun (más rápido de configurar)
2. **Para producción:** Verifica tu propio dominio (mejor deliverability)
3. **Si usas sandbox:** Recuerda agregar emails en "Authorized Recipients"
4. **Revisa siempre los logs** en Mailgun Dashboard para ver el estado real de los emails

---

**¿Todo funcionó?** 🎉 ¡Mailgun está configurado correctamente!

**¿Tienes problemas?** Revisa la sección de "Solución de problemas" o los logs del servidor para más detalles.

