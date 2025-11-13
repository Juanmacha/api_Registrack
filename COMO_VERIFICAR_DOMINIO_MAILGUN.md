# 🌐 Cómo Verificar tu Propio Dominio en Mailgun

**Problema:** El dominio sandbox solo permite enviar a emails autorizados. Para enviar a cualquier usuario que se registre, necesitas verificar tu propio dominio.

---

## 🎯 ¿Por qué verificar tu propio dominio?

### Dominio Sandbox (Actual):
- ❌ Solo puedes enviar a emails en "Authorized Recipients"
- ❌ No puedes enviar a usuarios nuevos automáticamente
- ✅ Funciona inmediatamente sin configuración

### Dominio Verificado (Recomendado):
- ✅ Puedes enviar a **cualquier email** sin restricciones
- ✅ Mejor deliverability (llegada a inbox)
- ✅ Más profesional (emails desde tu dominio)
- ⚠️ Requiere configuración DNS

---

## 📝 Paso a Paso: Verificar tu Dominio

### Paso 1: Acceder a Mailgun Dashboard

1. Ve a: https://app.mailgun.com/
2. Inicia sesión con tu cuenta

---

### Paso 2: Agregar Nuevo Dominio

1. **Ve a:** Sending → Domains
2. **Click en:** "Add New Domain"
3. **Ingresa tu dominio:**
   - Opción A: Subdominio (Recomendado)
     - Ejemplo: `mg.tudominio.com` o `mail.tudominio.com`
   - Opción B: Dominio principal
     - Ejemplo: `tudominio.com`
4. **Click en:** "Add Domain"

---

### Paso 3: Configurar Registros DNS

Mailgun te mostrará los registros DNS que debes agregar. Ejemplo:

#### **Registros TXT (Verificación):**

```
Tipo: TXT
Nombre: @ (o tu_dominio.com)
Valor: v=spf1 include:mailgun.org ~all
```

```
Tipo: TXT
Nombre: @ (o tu_dominio.com)
Valor: [código de verificación que Mailgun te da]
```

#### **Registros MX (Recepción - Opcional):**

```
Tipo: MX
Nombre: @ (o tu_dominio.com)
Prioridad: 10
Valor: mxa.mailgun.org
```

```
Tipo: MX
Nombre: @ (o tu_dominio.com)
Prioridad: 10
Valor: mxb.mailgun.org
```

#### **Registros CNAME (Tracking - Opcional pero recomendado):**

```
Tipo: CNAME
Nombre: email.mg.tudominio.com (o el que Mailgun te indique)
Valor: mailgun.org
```

---

### Paso 4: Agregar Registros en tu Proveedor DNS

**Proveedores comunes:**

#### **Cloudflare:**
1. Ve a tu dominio en Cloudflare
2. Click en "DNS"
3. Click en "Add record"
4. Agrega cada registro (TXT, MX, CNAME)
5. Guarda

#### **GoDaddy:**
1. Ve a "My Products" → Tu dominio → "DNS"
2. Click en "Add"
3. Agrega cada registro
4. Guarda

#### **Namecheap:**
1. Ve a "Domain List" → "Manage" → "Advanced DNS"
2. Agrega cada registro
3. Guarda

#### **Otros proveedores:**
- Busca la sección "DNS" o "DNS Management"
- Agrega los registros que Mailgun te proporcionó

---

### Paso 5: Esperar la Verificación

1. **Tiempo de propagación:** 5 minutos a 48 horas (normalmente 1-2 horas)
2. **Verificar estado en Mailgun:**
   - Ve a Sending → Domains
   - El dominio aparecerá como "Unverified" (amarillo) hasta que se verifique
   - Una vez verificado, aparecerá como "Active" (verde) ✅

---

### Paso 6: Actualizar Variables de Entorno

Una vez que el dominio esté verificado, actualiza tu `.env`:

```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=tu_api_key (la misma)
MAILGUN_DOMAIN=mg.tudominio.com (tu nuevo dominio verificado)
MAILGUN_FROM_EMAIL=noreply@tudominio.com (email del dominio verificado)
```

**⚠️ IMPORTANTE:** El `MAILGUN_FROM_EMAIL` debe ser del dominio verificado:
- ✅ `noreply@tudominio.com` (si verificaste `tudominio.com`)
- ✅ `noreply@mg.tudominio.com` (si verificaste `mg.tudominio.com`)
- ❌ `noreply@gmail.com` (NO funciona, no es tu dominio)

---

## 🔄 Alternativa: Usar Subdominio

Si no quieres modificar los registros DNS de tu dominio principal, puedes usar un subdominio:

### Ejemplo:
- **Dominio principal:** `tudominio.com`
- **Subdominio para Mailgun:** `mg.tudominio.com` o `mail.tudominio.com`

**Ventajas:**
- No afecta tu dominio principal
- Más fácil de gestionar
- Puedes tener múltiples subdominios para diferentes servicios

---

## ✅ Verificación de que Funciona

### 1. Verificar en Mailgun:
- El dominio aparece como "Active" (verde) ✅

### 2. Probar envío:
- Envía un email a cualquier dirección (no necesita estar en Authorized Recipients)
- Debe llegar correctamente

### 3. Verificar logs:
```
✅ [EMAIL] Email enviado exitosamente con Mailgun a: cualquier@email.com
```

---

## 🆘 Solución de Problemas

### El dominio no se verifica después de 48 horas:

**Posibles causas:**
1. **Registros DNS incorrectos:**
   - Verifica que copiaste los valores exactos de Mailgun
   - Verifica que no hay espacios extra
   - Verifica que el tipo de registro es correcto (TXT, MX, CNAME)

2. **Propagación DNS lenta:**
   - Usa herramientas como https://dnschecker.org/ para verificar propagación
   - Espera más tiempo (hasta 48 horas)

3. **Proveedor DNS bloqueando:**
   - Algunos proveedores tienen restricciones
   - Contacta a tu proveedor DNS

### Error: "Domain verification failed"

**Solución:**
- Verifica que todos los registros TXT están correctos
- Asegúrate de que el registro de verificación tiene el valor exacto que Mailgun te dio
- Espera a que los DNS se propaguen completamente

---

## 📚 Recursos

- **Documentación oficial:** https://documentation.mailgun.com/en/latest/quickstart-sending.html#verify-your-domain
- **Verificar propagación DNS:** https://dnschecker.org/
- **Guía de Mailgun:** https://documentation.mailgun.com/en/latest/user_manual.html#verifying-your-domain

---

## 💡 Recomendación

**Para producción:** Verifica tu propio dominio. Es la única forma de enviar emails a cualquier usuario sin restricciones.

**Para desarrollo/pruebas:** Puedes seguir usando el sandbox, pero recuerda agregar los emails de prueba a "Authorized Recipients".

---

**Última actualización:** Enero 2026

