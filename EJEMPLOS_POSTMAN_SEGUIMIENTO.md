# 📋 Ejemplos Postman - Sistema de Seguimiento

## 🔐 Paso 1: Login

### Login como Administrador
```http
POST http://localhost:3000/api/usuarios/login
Content-Type: application/json

{
  "correo": "admin@registrack.com",
  "password": "Admin123!"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Admin",
    "rol": "administrador"
  }
}
```

📌 **Guarda el `token` para usarlo en los siguientes requests**

---

## 🔍 Paso 2: Obtener Estados Disponibles de una Solicitud

Primero, necesitas saber qué estados puede tener una solicitud específica.

```http
GET http://localhost:3000/api/seguimiento/:idOrdenServicio/estados-disponibles
Authorization: Bearer {tu_token}
```

**Ejemplo real:**
```http
GET http://localhost:3000/api/seguimiento/1/estados-disponibles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "orden_servicio_id": 1,
    "servicio": "Registro de Marca",
    "estado_actual": "Verificación de Documentos",
    "estados_disponibles": [
      {
        "id": 1,
        "nombre": "Verificación de Documentos",
        "descripcion": "Documentos en revisión",
        "order_number": 1,
        "status_key": "verificacion"
      },
      {
        "id": 2,
        "nombre": "Publicación en Gaceta",
        "descripcion": "Esperando publicación oficial",
        "order_number": 2,
        "status_key": "publicacion"
      },
      {
        "id": 3,
        "nombre": "Examen de Oposición",
        "descripcion": "Período de oposición abierto",
        "order_number": 3,
        "status_key": "oposicion"
      }
    ]
  }
}
```

---

## ➕ Paso 3: Crear Seguimiento Normal (Sin Cambio de Estado)

Para agregar un comentario, observación o documentación sin cambiar el estado:

```http
POST http://localhost:3000/api/seguimiento/crear
Authorization: Bearer {tu_token}
Content-Type: application/json

{
  "id_orden_servicio": 1,
  "titulo": "Documentos recibidos",
  "descripcion": "Se recibió toda la documentación requerida para el trámite",
  "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf,https://ejemplo.com/docs/poder.pdf"
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Registro de seguimiento creado exitosamente.",
  "seguimiento": {
    "id_seguimiento": 5,
    "id_orden_servicio": 1,
    "titulo": "Documentos recibidos",
    "descripcion": "Se recibió toda la documentación requerida para el trámite",
    "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf,https://ejemplo.com/docs/poder.pdf",
    "fecha_registro": "2025-11-01T10:30:00.000Z",
    "registrado_por": 1
  }
}
```

---

## 🔄 Paso 4: Crear Seguimiento con Cambio de Estado

Para avanzar el estado de la solicitud (ejemplo: de "Verificación de Documentos" a "Publicación en Gaceta"):

```http
POST http://localhost:3000/api/seguimiento/crear
Authorization: Bearer {tu_token}
Content-Type: application/json

{
  "id_orden_servicio": 1,
  "titulo": "Cambio de estado - Publicación en Gaceta",
  "descripcion": "Documentos aprobados, solicitud pasa a publicación oficial",
  "nuevo_proceso": "Publicación en Gaceta",
  "observaciones": "No se presentaron observaciones, todo correcto"
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Registro de seguimiento creado exitosamente.",
  "seguimiento": {
    "id_seguimiento": 6,
    "id_orden_servicio": 1,
    "titulo": "Cambio de estado - Publicación en Gaceta",
    "descripcion": "Documentos aprobados, solicitud pasa a publicación oficial",
    "nuevo_estado": "Publicación en Gaceta",
    "observaciones": "No se presentaron observaciones, todo correcto",
    "estado_anterior": "Verificación de Documentos",
    "fecha_registro": "2025-11-01T10:45:00.000Z",
    "registrado_por": 1,
    "cambio_proceso": {
      "proceso_anterior": "Verificación de Documentos",
      "nuevo_proceso": "Publicación en Gaceta",
      "fecha_cambio": "2025-11-01T10:45:00.000Z"
    }
  }
}
```

⚠️ **Nota:** Se enviará un email automático al cliente notificando el cambio de estado.

---

## 📜 Paso 5: Ver Historial Completo de Seguimiento

Para ver todos los registros de seguimiento de una solicitud:

```http
GET http://localhost:3000/api/seguimiento/historial/:idOrdenServicio
Authorization: Bearer {tu_token}
```

**Ejemplo real:**
```http
GET http://localhost:3000/api/seguimiento/historial/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta esperada:**
```json
[
  {
      "id_seguimiento": 1,
      "id_orden_servicio": 1,
      "titulo": "Solicitud creada",
      "descripcion": "Solicitud de registro de marca creada por el cliente",
      "documentos_adjuntos": null,
      "fecha_registro": "2025-10-20T08:00:00.000Z",
      "registrado_por": 2,
      "usuario_registro": {
        "nombre": "Admin",
        "apellido": "Usuario",
        "correo": "admin@registrack.com"
      }
    },
    {
      "id_seguimiento": 2,
      "id_orden_servicio": 1,
      "titulo": "Documentos recibidos",
      "descripcion": "Se recibió toda la documentación requerida",
      "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf",
      "fecha_registro": "2025-10-21T10:30:00.000Z",
      "registrado_por": 1,
      "usuario_registro": {
        "nombre": "Juan",
        "apellido": "Pérez",
        "correo": "juan@ejemplo.com"
      },
      "nuevo_estado": "Verificación de Documentos",
      "estado_anterior": null
    },
    {
      "id_seguimiento": 3,
      "id_orden_servicio": 1,
      "titulo": "Cambio de estado - Publicación en Gaceta",
      "descripcion": "Documentos aprobados, solicitud pasa a publicación oficial",
      "fecha_registro": "2025-11-01T10:45:00.000Z",
      "registrado_por": 1,
      "usuario_registro": {
        "nombre": "Juan",
        "apellido": "Pérez",
        "correo": "juan@ejemplo.com"
      },
      "estado_anterior": "Verificación de Documentos",
      "nuevo_estado": "Publicación en Gaceta"
    }
  ]
```

---

## 🔎 Paso 6: Buscar Seguimientos por Título

```http
GET http://localhost:3000/api/seguimiento/buscar/:idOrdenServicio?titulo={titulo_buscar}
Authorization: Bearer {tu_token}
```

**Ejemplo real:**
```http
GET http://localhost:3000/api/seguimiento/buscar/1?titulo=Documentos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta esperada:**
```json
[
  {
    "id_seguimiento": 2,
    "titulo": "Documentos recibidos",
    "descripcion": "Se recibió toda la documentación requerida",
    "fecha_registro": "2025-10-21T10:30:00.000Z",
    "usuario_registro": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@ejemplo.com"
    }
  }
]
```

---

## ✏️ Paso 7: Actualizar un Seguimiento Existente

```http
PUT http://localhost:3000/api/seguimiento/:id
Authorization: Bearer {tu_token}
Content-Type: application/json

{
  "titulo": "Documentos recibidos - Actualizado",
  "descripcion": "Se recibió toda la documentación y fue verificada correctamente",
  "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf,https://ejemplo.com/docs/poder.pdf,https://ejemplo.com/docs/declaracion.pdf"
}
```

**Ejemplo real:**
```http
PUT http://localhost:3000/api/seguimiento/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "titulo": "Documentos recibidos - Actualizado",
  "descripcion": "Se recibió toda la documentación y fue verificada correctamente"
}
```

**Respuesta esperada:**
```json
{
  "mensaje": "Seguimiento actualizado exitosamente.",
  "seguimiento": {
    "id_seguimiento": 5,
    "titulo": "Documentos recibidos - Actualizado",
    "descripcion": "Se recibió toda la documentación y fue verificada correctamente"
  }
}
```

---

## 🗑️ Paso 8: Eliminar un Seguimiento

```http
DELETE http://localhost:3000/api/seguimiento/:id
Authorization: Bearer {tu_token}
```

**Ejemplo real:**
```http
DELETE http://localhost:3000/api/seguimiento/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta esperada:**
```json
{
  "mensaje": "Seguimiento eliminado exitosamente."
}
```

---

## 📌 Paso 9: Ver un Seguimiento Específico por ID

```http
GET http://localhost:3000/api/seguimiento/:id
Authorization: Bearer {tu_token}
```

**Ejemplo real:**
```http
GET http://localhost:3000/api/seguimiento/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta esperada:**
```json
{
  "id_seguimiento": 5,
  "id_orden_servicio": 1,
  "titulo": "Documentos recibidos",
  "descripcion": "Se recibió toda la documentación requerida para el trámite",
  "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf",
  "fecha_registro": "2025-10-21T10:30:00.000Z",
  "registrado_por": 1,
  "usuario_registro": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@ejemplo.com"
  },
  "orden_servicio": {
    "numero_expediente": "2025-001",
    "estado": "Verificación de Documentos"
  },
  "nuevo_estado": "Verificación de Documentos",
  "estado_anterior": null
}
```

---

## 📊 Ejemplos de Estados por Tipo de Servicio

### Registro de Marca
1. **Verificación de Documentos**
2. **Publicación en Gaceta**
3. **Examen de Oposición**
4. **Resolución de Concesión**
5. **Registro Finalizado**

### Renovación de Marca
1. **Verificación de Documentos**
2. **Pago de Tasas**
3. **Renovación Aprobada**
4. **Registro Renovado**

### Oposición de Marca
1. **Recepción de Oposición**
2. **Análisis de Argumentos**
3. **Solicitud de Contestación**
4. **Resolución de Oposición**

---

## ⚠️ Errores Comunes

### Error 401 - No autenticado
```json
{
  "mensaje": "Token no proporcionado o inválido."
}
```
**Solución:** Verifica que estés enviando el token en el header `Authorization: Bearer {token}`

### Error 403 - Sin permisos
```json
{
  "mensaje": "No tienes permisos para acceder a este recurso."
}
```
**Solución:** Debes estar logueado como `administrador` o `empleado`. Los clientes solo pueden ver sus propias solicitudes.

### Error 400 - Estado no válido
```json
{
  "mensaje": "El proceso \"Estado Incorrecto\" no es válido para este servicio. Procesos disponibles: Verificación de Documentos, Publicación en Gaceta, Examen de Oposición"
}
```
**Solución:** Primero consulta los estados disponibles con `GET /api/seguimiento/:idOrdenServicio/estados-disponibles`

### Error 404 - Orden no encontrada
```json
{
  "mensaje": "Orden de servicio no encontrada"
}
```
**Solución:** Verifica que el `id_orden_servicio` sea correcto.

---

## 🎯 Flujo de Trabajo Recomendado

1. **Login** → Obtén token
2. **Ver Estados Disponibles** → Consulta qué estados puede tener la solicitud
3. **Ver Historial** → Revisa el historial completo de la solicitud
4. **Crear Seguimiento** → Agrega comentario o cambia estado
5. **Ver Historial Actualizado** → Confirma que el cambio se registró

---

## 📝 Notas Importantes

- ✅ Todos los endpoints requieren autenticación (JWT)
- ✅ Solo `administrador` y `empleado` pueden crear/editar seguimientos
- ✅ Los `clientes` pueden ver seguimientos de sus propias solicitudes
- ✅ Al cambiar estado, se envía email automático al cliente
- ✅ El campo `registrado_por` se asigna automáticamente desde el token
- ✅ Los documentos adjuntos deben ser URLs válidas separadas por comas
- ✅ El título no puede exceder 200 caracteres

