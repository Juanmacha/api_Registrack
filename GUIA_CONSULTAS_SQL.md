# 📊 Guía de Consultas SQL - Registrack

## 🎯 Descripción

Este documento explica cómo usar el archivo `consultas_solicitudes.sql` para ver todos los datos de las solicitudes creadas en el sistema.

---

## 📍 Ubicación de los Datos del Formulario

### ⚠️ IMPORTANTE: ¿Dónde están los datos que ingresé en el formulario?

Los datos que ingresas al crear una solicitud (tipo de persona, tipo de documento, número de documento, nombre completo, etc.) **NO están en una tabla separada**, sino que se almacenan **directamente en la tabla `ordenes_de_servicios`** como columnas individuales.

### 📋 Campos del Formulario en la Base de Datos:

| Campo en BD | Descripción |
|-------------|-------------|
| `tipodepersona` | Tipo de persona (Natural/Jurídica) |
| `tipodedocumento` | Tipo de documento (CC/NIT/Pasaporte/etc) |
| `numerodedocumento` | Número del documento |
| `nombrecompleto` | Nombre completo del solicitante |
| `correoelectronico` | Correo electrónico del formulario |
| `telefono` | Teléfono del formulario |
| `direccion` | Dirección |
| `tipodeentidadrazonsocial` | Tipo de entidad para personas jurídicas |
| `nombredelaempresa` | Nombre de la empresa |
| `nit` | NIT de la empresa |
| `poderdelrepresentanteautorizado` | Poder del representante (base64 o URL) |
| `poderparaelregistrodelamarca` | Poder para registro de marca (base64 o URL) |
| `pais` | País |
| `ciudad` | Ciudad |
| `codigo_postal` | Código postal |

---

## 🚀 Consultas Disponibles

### 1️⃣ **Consulta Más Simple - Ver TODO de una Solicitud**

```sql
SELECT * 
FROM ordenes_de_servicios 
WHERE id_orden_servicio = 1;  -- Cambia el 1 por el ID que necesites
```

**Cuándo usar:** Cuando quieres ver ABSOLUTAMENTE TODO de una solicitud específica, incluidos todos los campos del formulario.

---

### 2️⃣ **Consulta Rápida - Todos los Datos de Formulario**

```sql
SELECT 
    id_orden_servicio AS 'ID',
    numero_expediente AS 'Expediente',
    fecha_creacion AS 'Fecha',
    estado AS 'Estado',
    
    -- TODOS los campos del formulario
    tipodepersona,
    tipodedocumento,
    numerodedocumento,
    nombrecompleto,
    correoelectronico,
    telefono,
    direccion,
    tipodeentidadrazonsocial,
    nombredelaempresa,
    nit,
    poderdelrepresentanteautorizado,
    poderparaelregistrodelamarca,
    pais,
    ciudad,
    codigo_postal,
    total_estimado

FROM ordenes_de_servicios
ORDER BY fecha_creacion DESC;
```

**Cuándo usar:** Cuando quieres ver todos los datos del formulario de todas las solicitudes.

---

### 3️⃣ **Consulta Solo Datos del Formulario (Bonita)**

```sql
SELECT 
    os.id_orden_servicio,
    os.numero_expediente,
    s.nombre AS servicio,
    
    -- Datos Personales del Formulario
    os.tipodepersona AS 'Tipo Persona',
    os.tipodedocumento AS 'Tipo Documento',
    os.numerodedocumento AS 'Número Documento',
    os.nombrecompleto AS 'Nombre Completo',
    os.correoelectronico AS 'Correo',
    os.telefono AS 'Teléfono',
    os.direccion AS 'Dirección',
    
    -- Datos de Empresa (si aplica)
    os.tipodeentidadrazonsocial AS 'Tipo Entidad',
    os.nombredelaempresa AS 'Nombre Empresa',
    os.nit AS 'NIT',
    
    -- Poderes/Documentos Legales
    os.poderdelrepresentanteautorizado AS 'Poder Representante',
    os.poderparaelregistrodelamarca AS 'Poder Registro Marca',
    
    -- Ubicación
    os.pais AS 'País',
    os.ciudad AS 'Ciudad',
    os.codigo_postal AS 'Código Postal',
    
    os.fecha_creacion

FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
ORDER BY os.fecha_creacion DESC;
```

**Cuándo usar:** Cuando quieres una vista limpia y organizada de los datos del formulario con nombres de columna amigables.

---

### 4️⃣ **Consulta Completa - Con Joins a Otras Tablas**

Esta consulta incluye:
- ✅ Información de la solicitud
- ✅ Datos del servicio
- ✅ Información del cliente (de la tabla usuarios)
- ✅ Información de la empresa (de la tabla empresas)
- ✅ Empleado asignado
- ✅ **TODOS los datos del formulario**
- ✅ Información de anulación

```sql
SELECT 
    -- Información de la Solicitud
    os.id_orden_servicio,
    os.numero_expediente,
    os.fecha_creacion,
    os.estado,
    
    -- Información del Servicio
    s.nombre AS nombre_servicio,
    
    -- Información del Cliente
    u_cliente.nombre AS nombre_cliente,
    u_cliente.apellido AS apellido_cliente,
    
    -- *** DATOS DEL FORMULARIO ***
    os.tipodepersona AS tipo_persona,
    os.tipodedocumento AS tipo_documento,
    os.numerodedocumento AS numero_documento,
    os.nombrecompleto AS nombre_completo_formulario,
    os.correoelectronico AS correo_formulario,
    os.telefono AS telefono_formulario,
    os.direccion AS direccion_formulario,
    os.tipodeentidadrazonsocial AS tipo_entidad,
    os.nombredelaempresa AS nombre_empresa_form,
    os.nit AS nit_formulario,
    os.poderdelrepresentanteautorizado AS poder_representante,
    os.poderparaelregistrodelamarca AS poder_marca

FROM ordenes_de_servicios os
JOIN servicios s ON os.id_servicio = s.id_servicio
JOIN clientes c ON os.id_cliente = c.id_cliente
JOIN usuarios u_cliente ON c.id_usuario = u_cliente.id_usuario

ORDER BY os.fecha_creacion DESC;
```

---

### 5️⃣ **Consulta Detallada Vertical (Una Solicitud)**

Esta consulta muestra los datos de una solicitud específica en formato vertical (campo - valor).

```sql
-- Cambia el WHERE id_orden_servicio = 1 por el ID que necesites
SELECT 
    '=== INFORMACIÓN GENERAL ===' AS seccion,
    NULL AS campo,
    NULL AS valor
UNION ALL
SELECT NULL, 'ID Solicitud', CAST(os.id_orden_servicio AS CHAR)
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
UNION ALL
SELECT NULL, 'N° Expediente', os.numero_expediente
FROM ordenes_de_servicios os WHERE os.id_orden_servicio = 1
-- ... continúa en el archivo SQL completo
```

**Cuándo usar:** Cuando quieres revisar en detalle una solicitud específica de manera organizada.

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Ver datos del formulario de la solicitud 5

```sql
SELECT 
    tipodepersona,
    tipodedocumento,
    numerodedocumento,
    nombrecompleto,
    correoelectronico,
    telefono,
    direccion
FROM ordenes_de_servicios 
WHERE id_orden_servicio = 5;
```

### Ejemplo 2: Ver todas las solicitudes de personas naturales

```sql
SELECT 
    id_orden_servicio,
    numero_expediente,
    tipodepersona,
    nombrecompleto,
    tipodedocumento,
    numerodedocumento,
    fecha_creacion
FROM ordenes_de_servicios
WHERE tipodepersona = 'Natural'
ORDER BY fecha_creacion DESC;
```

### Ejemplo 3: Ver todas las solicitudes de personas jurídicas con NIT

```sql
SELECT 
    id_orden_servicio,
    numero_expediente,
    tipodepersona,
    nombredelaempresa,
    nit,
    tipodeentidadrazonsocial,
    fecha_creacion
FROM ordenes_de_servicios
WHERE tipodepersona = 'Jurídica'
  AND nit IS NOT NULL
ORDER BY fecha_creacion DESC;
```

### Ejemplo 4: Buscar por número de documento

```sql
SELECT 
    id_orden_servicio,
    numero_expediente,
    nombrecompleto,
    numerodedocumento,
    estado,
    fecha_creacion
FROM ordenes_de_servicios
WHERE numerodedocumento = '1234567890'
ORDER BY fecha_creacion DESC;
```

---

## 🔍 Otras Consultas Útiles en el Archivo

El archivo `consultas_solicitudes.sql` también incluye:

1. **Estadísticas**:
   - Total de solicitudes por estado
   - Total de solicitudes por servicio
   - Solicitudes por empleado

2. **Consultas Específicas**:
   - Solicitudes pendientes sin empleado asignado
   - Solicitudes anuladas con motivo
   - Historial completo de seguimiento

3. **Notificaciones**:
   - Lista de todas las notificaciones enviadas por solicitud

---

## 📝 Notas Importantes

1. **Todos los datos del formulario están en `ordenes_de_servicios`**: No hay una tabla separada de "formularios" o "datos_formulario".

2. **Los campos pueden ser NULL**: Dependiendo del tipo de servicio y si es persona natural o jurídica, algunos campos pueden estar vacíos (NULL).

3. **Poderes en Base64**: Los campos `poderdelrepresentanteautorizado` y `poderparaelregistrodelamarca` pueden contener strings muy largos si los archivos fueron enviados en base64.

4. **IDs de Solicitud**: El campo `id_orden_servicio` es el identificador único de cada solicitud.

---

## 🎓 Cómo Ejecutar las Consultas

1. Abre **MySQL Workbench** o tu cliente SQL favorito
2. Conéctate a la base de datos `registrack_db`
3. Abre el archivo `consultas_solicitudes.sql`
4. Selecciona la consulta que necesites
5. Ejecuta con `Ctrl+Enter` o el botón ⚡

---

## 🆘 Ayuda Rápida

**¿Necesitas ver los datos que ingresaste en una solicitud?**
```sql
SELECT * FROM ordenes_de_servicios WHERE id_orden_servicio = [TU_ID];
```

**¿Necesitas ver solo los campos del formulario?**
```sql
SELECT 
    tipodepersona, tipodedocumento, numerodedocumento,
    nombrecompleto, correoelectronico, telefono,
    direccion, nombredelaempresa, nit
FROM ordenes_de_servicios 
WHERE id_orden_servicio = [TU_ID];
```

---

**¡Listo! Ahora puedes consultar todos los datos de tus solicitudes de manera fácil y rápida! 🚀**

