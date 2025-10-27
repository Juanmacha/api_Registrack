# 🧪 Test: Crear Solicitud con Nuevos Formularios

## 📋 Información del Test

Este test creará una solicitud nueva con todos los campos del formulario para verificar que los datos se guarden correctamente en la base de datos.

---

## 🔐 Paso 1: Login como Cliente

**Endpoint:** `POST http://localhost:4000/api/auth/login`

**Body:**
```json
{
  "correo": "manumaturana204@gmail.com",
  "contrasena": "tu_contraseña"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Juan Manuel",
    "rol": "cliente"
  }
}
```

✅ **Copia el token para usarlo en el siguiente paso**

---

## 📝 Paso 2: Crear Solicitud con Datos del Formulario

**Endpoint:** `POST http://localhost:4000/api/gestion-solicitudes/crear`

**Headers:**
```
Authorization: Bearer [TU_TOKEN_AQUI]
Content-Type: application/json
```

**Body (Ejemplo para Búsqueda de Antecedentes - Persona Natural):**
```json
{
  "id_servicio": 1,
  "id_empresa": 1,
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "formulario": {
    "tipo_solicitante": "Natural",
    "nombres_apellidos": "Juan Manuel Maturana López",
    "tipo_documento": "CC",
    "numero_documento": "1234567890",
    "correo_electronico": "manumaturana204@gmail.com",
    "telefono": "3001234567",
    "direccion": "Calle 123 #45-67, Bogotá",
    "pais_residencia": "Colombia",
    "ciudad_residencia": "Bogotá"
  }
}
```

**Body Alternativo (Persona Jurídica):**
```json
{
  "id_servicio": 1,
  "id_empresa": 1,
  "pais": "Colombia",
  "ciudad": "Bogotá",
  "codigo_postal": "110111",
  "formulario": {
    "tipo_solicitante": "Juridica",
    "tipo_entidad_razon_social": "S.A.S",
    "nombre_empresa": "Tech Solutions SAS",
    "nit": "9001234567",
    "nombre_representante": "Juan Manuel Maturana",
    "tipo_documento": "CC",
    "numero_documento": "1234567890",
    "correo_electronico": "manumaturana204@gmail.com",
    "telefono": "3001234567",
    "direccion": "Carrera 7 #123-45, Bogotá",
    "pais_residencia": "Colombia",
    "ciudad_residencia": "Bogotá",
    "poder_representante_autorizado": "base64_del_archivo_o_url"
  }
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "mensaje": "Solicitud creada exitosamente",
  "data": {
    "solicitud_id": 11,
    "numero_expediente": "EXP-2025-00011",
    "estado": "Solicitud Inicial",
    "servicio": "Búsqueda de Antecedentes",
    "fecha_creacion": "2025-10-27T22:55:00.000Z"
  }
}
```

---

## 🔍 Paso 3: Verificar en la Base de Datos

Ejecuta esta consulta para ver los datos del formulario de la nueva solicitud:

```sql
SELECT 
    id_orden_servicio,
    numero_expediente,
    estado,
    fecha_creacion,
    
    -- Datos del formulario
    tipodepersona AS 'Tipo Persona',
    tipodedocumento AS 'Tipo Doc',
    numerodedocumento AS 'Num Doc',
    nombrecompleto AS 'Nombre Completo',
    correoelectronico AS 'Correo',
    telefono AS 'Teléfono',
    direccion AS 'Dirección',
    nombredelaempresa AS 'Empresa',
    nit AS 'NIT',
    pais,
    ciudad,
    codigo_postal

FROM ordenes_de_servicios
WHERE id_orden_servicio = 11  -- Usa el ID de la solicitud que acabas de crear
ORDER BY fecha_creacion DESC;
```

---

## ✅ Resultado Esperado

Deberías ver algo como:

| ID | Expediente | Estado | Fecha | Tipo Persona | Tipo Doc | Num Doc | Nombre Completo | Correo | Teléfono | Dirección |
|----|------------|--------|-------|--------------|----------|---------|-----------------|--------|----------|-----------|
| 11 | EXP-2025-00011 | Solicitud Inicial | 2025-10-27... | Natural | CC | 1234567890 | Juan Manuel Maturana López | manumaturana204@gmail.com | 3001234567 | Calle 123... |

---

## 🎯 Siguiente Paso

Una vez que crees la solicitud:
1. ✅ Verifica que el email te llegó
2. ✅ Verifica en la BD que los datos del formulario se guardaron
3. ✅ Prueba ver la solicitud con: `GET /api/gestion-solicitudes/mis/:id`

---

## 📊 Consulta para Ver TODAS las Solicitudes (Nuevas y Viejas)

```sql
SELECT 
    id_orden_servicio AS 'ID',
    numero_expediente AS 'Expediente',
    estado AS 'Estado',
    DATE_FORMAT(fecha_creacion, '%d/%m/%Y %H:%i') AS 'Fecha',
    
    -- Indicador de si tiene datos de formulario
    CASE 
        WHEN tipodepersona IS NOT NULL OR nombrecompleto IS NOT NULL 
        THEN '✅ CON DATOS' 
        ELSE '⚠️ VACÍO (Anterior a Oct 2025)' 
    END AS 'Estado Formulario',
    
    -- Datos del formulario (solo si existen)
    tipodepersona AS 'Tipo',
    nombrecompleto AS 'Nombre',
    correoelectronico AS 'Email'

FROM ordenes_de_servicios
ORDER BY fecha_creacion DESC;
```

Esta consulta te mostrará claramente cuáles solicitudes tienen datos del formulario y cuáles son anteriores a la implementación.

---

**¿Listo para crear una solicitud de prueba? 🚀**

