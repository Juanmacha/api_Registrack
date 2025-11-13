# 🔧 Solución: Timeout de Gmail en Render

## 🎯 Problema Identificado

Al intentar enviar emails con Gmail en Render, se producían errores de timeout:

```
❌ [EMAIL] Error al enviar email con Gmail: Connection timeout
   Código de error: ETIMEDOUT
```

## ✅ Solución Implementada

### 1. **Timeouts Aumentados para Render**

Los timeouts ahora son específicos para Render:

| Entorno | Connection Timeout | Socket Timeout | Greeting Timeout |
|---------|-------------------|----------------|------------------|
| **Render** | 60s | 120s | 30s |
| Producción | 45s | 90s | 25s |
| Desarrollo | 10s | 30s | 10s |

**Código:**
```javascript
const connectionTimeout = isRender ? 60000 : (isProduction ? 45000 : 10000);
const socketTimeout = isRender ? 120000 : (isProduction ? 90000 : 30000);
const greetingTimeout = isRender ? 30000 : (isProduction ? 25000 : 10000);
```

### 2. **Pool de Conexiones Desactivado en Render**

En Render, el pool de conexiones puede causar problemas. Ahora se desactiva automáticamente:

```javascript
pool: !isRender, // Pool solo en desarrollo/producción local
maxConnections: isRender ? 1 : 5, // 1 conexión en Render
maxMessages: isRender ? 1 : 100, // 1 mensaje por conexión en Render
```

### 3. **Reintentos Automáticos con Backoff Exponencial**

Ahora el sistema reintenta automáticamente cuando hay timeouts:

- **Render:** 3 reintentos
- **Otros entornos:** 2 reintentos
- **Delay entre reintentos:** 2s, 4s, 8s (backoff exponencial)

**Ejemplo de logs:**
```
⚠️ [EMAIL] Timeout al enviar email a usuario@example.com (intento 1/3)
   Reintentando en 2 segundos...
   Código de error: ETIMEDOUT
✅ [EMAIL] Email enviado exitosamente con Gmail a: usuario@example.com (intento 2/3)
```

### 4. **Detección Inteligente de Errores de Timeout**

El sistema detecta automáticamente errores de timeout y solo reintenta en esos casos:

```javascript
const isTimeoutError = error.code === 'ETIMEDOUT' || 
                      error.code === 'ECONNRESET' || 
                      error.code === 'ESOCKETTIMEDOUT' ||
                      error.message?.includes('timeout');
```

---

## 📊 Comparación: Antes vs Después

### Antes:
- ❌ Timeouts de 30s/60s (insuficientes para Render)
- ❌ Pool de conexiones activo (puede causar problemas)
- ❌ Sin reintentos automáticos
- ❌ Falla inmediata en timeout

### Después:
- ✅ Timeouts de 60s/120s (optimizados para Render)
- ✅ Pool desactivado en Render (mejor estabilidad)
- ✅ 3 reintentos automáticos con backoff exponencial
- ✅ Manejo inteligente de errores de timeout

---

## 🧪 Cómo Probar

### 1. Verificar Configuración en Logs

Al iniciar el servidor en Render, deberías ver:

```
✅ [EMAIL] Configurado Gmail como proveedor de email
   Email remitente: tu_email@gmail.com
   ⚙️ Configuración optimizada para Render:
      - Connection timeout: 60s
      - Socket timeout: 120s
      - Pool desactivado (mejor para Render)
      - Reintentos automáticos: 3 intentos
```

### 2. Probar Envío de Email

**Endpoint:** `POST /api/auth/forgot-password`

**Body:**
```json
{
  "correo": "destinatario@example.com"
}
```

### 3. Verificar Logs de Reintentos

Si hay un timeout, verás:

```
⚠️ [EMAIL] Timeout al enviar email a destinatario@example.com (intento 1/3)
   Reintentando en 2 segundos...
   Código de error: ETIMEDOUT
✅ [EMAIL] Email enviado exitosamente con Gmail a: destinatario@example.com (intento 2/3)
```

---

## 🔍 Solución de Problemas

### Si aún hay timeouts después de 3 reintentos:

1. **Verifica las variables de entorno en Render:**
   ```
   EMAIL_PROVIDER=gmail
   EMAIL_USER=tu_email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```

2. **Verifica que la contraseña de aplicación sea correcta:**
   - Ve a: https://myaccount.google.com/apppasswords
   - Genera una nueva contraseña si es necesario

3. **Considera usar Mailgun:**
   - Mailgun es más confiable en Render
   - No tiene problemas de timeout
   - Mejor deliverability

### Si los emails no se envían:

1. Revisa los logs completos en Render
2. Verifica que el correo del destinatario sea válido
3. Revisa la carpeta de spam del destinatario
4. Verifica que Gmail no haya bloqueado tu cuenta

---

## 💡 Recomendaciones

### Para Producción en Render:

1. **Usa Mailgun si es posible:**
   - Más confiable
   - Sin problemas de timeout
   - Mejor deliverability
   - Estadísticas de envío

2. **Si usas Gmail:**
   - ✅ Los cambios implementados mejoran significativamente la confiabilidad
   - ✅ Los reintentos automáticos manejan la mayoría de timeouts
   - ⚠️ Puede haber timeouts ocasionales (normal en Render)

3. **Monitorea los logs:**
   - Si ves muchos timeouts, considera cambiar a Mailgun
   - Los reintentos deberían resolver la mayoría de casos

---

## 📝 Cambios en el Código

### Archivo: `src/services/email.service.js`

**Cambios principales:**
1. Timeouts aumentados específicamente para Render
2. Pool de conexiones desactivado en Render
3. Sistema de reintentos automáticos con backoff exponencial
4. Detección inteligente de errores de timeout
5. Logs mejorados para debugging

---

## ✅ Checklist de Verificación

- [x] Timeouts aumentados para Render (60s/120s)
- [x] Pool desactivado en Render
- [x] Reintentos automáticos implementados (3 en Render)
- [x] Backoff exponencial configurado
- [x] Detección inteligente de errores de timeout
- [x] Logs mejorados para debugging
- [x] Documentación actualizada

---

## 🚀 Próximos Pasos

1. **Desplegar los cambios en Render**
2. **Probar el envío de emails**
3. **Monitorear los logs**
4. **Si persisten problemas, considerar Mailgun**

---

**Última actualización:** Enero 2026  
**Versión:** 1.0

