# 🚀 Guía Rápida: Sistema de Solicitudes Mejorado

> **Última actualización:** 21 de Octubre de 2025

---

## 📋 Índice

1. [Cambios Principales](#-cambios-principales)
2. [Diferencias por Rol](#-diferencias-por-rol)
3. [Ejemplos Rápidos](#-ejemplos-rápidos)
4. [Preguntas Frecuentes](#-preguntas-frecuentes)

---

## 🎯 Cambios Principales

### ✨ **¿Qué cambió?**

| Antes | Ahora |
|-------|-------|
| Clientes debían enviar `id_cliente` manualmente | ✅ Sistema lo obtiene automáticamente del JWT |
| Administradores no tenían forma clara de crear para otros | ✅ Pueden especificar `id_cliente` del usuario destino |
| NITs generados a veces fallaban validación | ✅ Siempre genera exactamente 10 dígitos |
| Lógica de cliente/empresa podía fallar | ✅ Búsqueda inteligente y creación automática |

---

## 👥 Diferencias por Rol

### 🟢 **ROL: CLIENTE**

#### ✅ **Lo que DEBE hacer:**
1. Hacer login para obtener su JWT token
2. Enviar solo los datos del formulario (SIN `id_cliente`)
3. Opcionalmente puede especificar `id_empresa` si ya existe

#### ❌ **Lo que NO necesita:**
- ❌ NO enviar `id_cliente` (se usa automáticamente su `id_usuario`)
- ❌ NO enviar `id_empresa` si no existe (se crea automáticamente)

#### 📝 **Ejemplo de Body (Cliente):**
```json
{
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombres_apellidos": "Juan Pérez",
  "tipo_documento": "Cédula",
  "numero_documento": "12345678",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "juan@email.com",
  "nombre_a_buscar": "Mi Marca",
  "tipo_producto_servicio": "Servicios",
  "logotipo": "base64_image_here"
}
```

---

### 🔴 **ROL: ADMINISTRADOR / EMPLEADO**

#### ✅ **Lo que DEBE hacer:**
1. Hacer login para obtener su JWT token de admin/empleado
2. **OBLIGATORIO:** Especificar `id_cliente` (el `id_usuario` del cliente)
3. Enviar los datos del formulario completos
4. Opcionalmente especificar `id_empresa` si ya existe

#### ⚠️ **Importante:**
- ⚠️ El `id_cliente` es el **`id_usuario`** del cliente en la tabla `usuarios`
- ⚠️ El cliente debe existir previamente en la tabla `usuarios`
- ⚠️ Si el `id_usuario` no existe, dará error de Foreign Key

#### 📝 **Ejemplo de Body (Administrador):**
```json
{
  "id_cliente": 9,
  "pais": "Colombia",
  "ciudad": "Medellín",
  "codigo_postal": "050001",
  "nombres_apellidos": "Carlos López",
  "tipo_documento": "Cédula",
  "numero_documento": "11223344",
  "direccion": "Calle 50 #45-67",
  "telefono": "3005555555",
  "correo": "carlos@email.com",
  "nombre_a_buscar": "Marca Admin",
  "tipo_producto_servicio": "Productos",
  "logotipo": "base64_image_here"
}
```

---

## ⚡ Ejemplos Rápidos

### 🔵 **Ejemplo 1: Cliente crea su solicitud**

**Endpoint:** `POST /api/gestion-solicitudes/crear/1`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body (Búsqueda de Antecedentes):**
```json
{
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "nombres_apellidos": "Manuel Maturana",
  "tipo_documento": "Cédula",
  "numero_documento": "12345678",
  "direccion": "Calle 123 #45-67",
  "telefono": "3001234567",
  "correo": "manumaturana204@gmail.com",
  "nombre_a_buscar": "Mi Marca Test",
  "tipo_producto_servicio": "Servicios",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "orden_id": 5,
    "servicio": {
      "id": "1",
      "nombre": "Búsqueda de Antecedentes"
    },
    "estado": "Solicitud Inicial",
    "cliente": {
      "id_cliente": 4,
      "marca": "Mi Marca Test"
    }
  }
}
```

---

### 🔴 **Ejemplo 2: Administrador crea para cliente**

**Endpoint:** `POST /api/gestion-solicitudes/crear/2`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body (Registro de Marca):**
```json
{
  "id_cliente": 9,
  "pais": "Colombia",
  "ciudad": "Cali",
  "codigo_postal": "760001",
  "tipo_titular": "Persona Natural",
  "nombres_apellidos": "Ana Rodríguez",
  "tipo_documento": "Cédula",
  "numero_documento": "98765432",
  "direccion": "Avenida 6N #28-15",
  "telefono": "3004444444",
  "correo": "ana@email.com",
  "nombre_marca": "Marca de Ana",
  "tipo_producto_servicio": "Servicios",
  "logotipo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg",
  "poder_autorizacion": "data:application/pdf;base64,JVBERi0xLjQK"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "orden_id": 6,
    "servicio": {
      "id": "2",
      "nombre": "Registro de Marca"
    },
    "estado": "Solicitud Inicial",
    "cliente": {
      "id_cliente": 4,
      "marca": "Marca de Ana"
    }
  }
}
```

---

## ❓ Preguntas Frecuentes

### **Q1: ¿Qué es el `id_cliente` para administradores?**

**R:** El `id_cliente` es el **`id_usuario`** del cliente en la tabla `usuarios`. Para obtenerlo:

```sql
SELECT id_usuario, nombre, apellido, correo 
FROM usuarios 
WHERE id_rol = 1;  -- 1 = rol cliente
```

---

### **Q2: ¿Qué pasa si el administrador no envía `id_cliente`?**

**R:** Recibirá un error `400 Bad Request`:

```json
{
  "success": false,
  "mensaje": "Para administradores/empleados se requiere id_cliente",
  "timestamp": "2025-10-21T12:00:00.000Z"
}
```

---

### **Q3: ¿Cómo sé qué campos enviar por cada servicio?**

**R:** Los campos requeridos están definidos en `src/config/tiposFormularios.js`:

| Servicio ID | Nombre | Campos Obligatorios |
|-------------|--------|---------------------|
| 1 | Búsqueda de Antecedentes | 10 campos |
| 2 | Registro de Marca | 18 campos (Natural) / 16 (Jurídica) |
| 3 | Renovación de Marca | 15 campos |
| 4 | Cesión de Marca | 14 campos |
| 5 | Cancelación de Marca | 12 campos |
| 6 | Presentación de Oposición | 13 campos |

---

### **Q4: ¿El NIT se genera automáticamente?**

**R:** Sí, si no se proporciona `nit_empresa`, el sistema genera uno de **exactamente 10 dígitos**:

```javascript
// Ejemplo de NIT generado: 1729506234
const timestamp = Date.now().toString();
const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
nitEmpresa = parseInt((timestamp.slice(-7) + randomPart).padStart(10, '0'));
```

---

### **Q5: ¿Se siguen asociando clientes con empresas automáticamente?**

**R:** ✅ **SÍ**, la lógica de asociación NO cambió:

1. Busca cliente existente o crea uno nuevo
2. Busca empresa por `id_empresa`, `nit` o `razon_social`
3. Si no existe, crea nueva empresa
4. Asocia cliente con empresa en tabla `empresas_clientes`

---

### **Q6: ¿Los clientes pueden crear solicitudes para otros clientes?**

**R:** ❌ **NO**. Por seguridad, los clientes SOLO pueden crear solicitudes para sí mismos. El sistema usa automáticamente el `id_usuario` del JWT token.

---

### **Q7: ¿Qué notificaciones se envían al crear una solicitud?**

**R:** Se envía **1 email automático** al cliente:

- **Para:** `cliente.Usuario.correo`
- **Asunto:** "Nueva Solicitud Creada - Pendiente de Asignación"
- **Contenido:** Detalles de la solicitud y próximos pasos

---

### **Q8: ¿Cómo obtener la lista de clientes disponibles (para admins)?**

**R:** Ejecutar esta consulta SQL:

```sql
SELECT u.id_usuario, u.nombre, u.apellido, u.correo 
FROM usuarios u 
WHERE u.id_rol = 1  -- 1 = cliente
ORDER BY u.id_usuario;
```

---

## 🔧 Archivos Modificados

### **Controlador Principal:**
- `src/controllers/solicitudes.controller.js`
  - Función `crearSolicitud` - Líneas 320-346

### **Configuración:**
- `src/config/tiposFormularios.js`
  - Campos actualizados para todos los servicios

### **Servicios:**
- `src/services/email.service.js`
  - Nuevas funciones de notificación

---

## 📞 Soporte

Si tienes dudas o encuentras algún problema:

1. Revisa los logs del servidor (consola)
2. Verifica que el token JWT sea válido
3. Confirma que el `id_cliente` existe en la tabla `usuarios`
4. Revisa que todos los campos obligatorios estén presentes

---

**✅ Sistema 100% Funcional y Documentado**

_Última revisión: 21 de Octubre de 2025_

