# 📮 Ejemplos de Postman - Gestión de Roles y Permisos

**Fecha:** Enero 2026  
**Base URL:** `http://localhost:3000/api/gestion-roles`  
**Autenticación:** Bearer Token (JWT)

---

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Obtener Todos los Roles](#1-obtener-todos-los-roles)
3. [Obtener un Rol por ID](#2-obtener-un-rol-por-id)
4. [Crear un Rol con Permisos](#3-crear-un-rol-con-permisos)
5. [Actualizar un Rol](#4-actualizar-un-rol)
6. [Eliminar Permisos de un Rol](#5-eliminar-permisos-de-un-rol)
7. [Cambiar Estado de un Rol](#6-cambiar-estado-de-un-rol)
8. [Eliminar un Rol](#7-eliminar-un-rol)
9. [Crear Usuario como Administrador](#8-crear-usuario-como-administrador)
10. [Ejemplos de Casos de Error](#8-ejemplos-de-casos-de-error)

---

## 🔐 Autenticación

### **Paso 1: Obtener Token JWT**

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "correo": "admin@example.com",
  "contrasena": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Admin",
      "apellido": "Usuario",
      "correo": "admin@example.com",
      "rol": "administrador",
      "id_rol": 2
    }
  }
}
```

**Nota:** Usa el `token` en el header `Authorization: Bearer <token>` para todas las siguientes peticiones.

---

## 1. Obtener Todos los Roles

### **GET** `/api/gestion-roles`

**Descripción:** Obtiene todos los roles con sus permisos y privilegios.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nombre": "Cliente",
      "estado": "Activo",
      "permisos": {
        "usuarios": {
          "crear": false,
          "leer": false,
          "actualizar": false,
          "eliminar": false
        },
        "solicitudes": {
          "crear": true,
          "leer": true,
          "actualizar": false,
          "eliminar": false
        }
      }
    },
    {
      "id": "2",
      "nombre": "Administrador",
      "estado": "Activo",
      "permisos": {
        "usuarios": {
          "crear": true,
          "leer": true,
          "actualizar": true,
          "eliminar": true
        },
        "solicitudes": {
          "crear": true,
          "leer": true,
          "actualizar": true,
          "eliminar": true
        }
      }
    },
    {
      "id": "3",
      "nombre": "Empleado",
      "estado": "Activo",
      "permisos": {
        "usuarios": {
          "crear": false,
          "leer": true,
          "actualizar": false,
          "eliminar": false
        },
        "solicitudes": {
          "crear": false,
          "leer": true,
          "actualizar": true,
          "eliminar": false
        }
      }
    }
  ]
}
```

---

## 2. Obtener un Rol por ID

### **GET** `/api/gestion-roles/:id`

**Descripción:** Obtiene un rol específico por su ID con todos sus permisos y privilegios.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID del rol (ej: `3`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "nombre": "Empleado",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "solicitudes": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "citas": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "seguimiento": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "dashboard": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Rol no encontrado",
  "details": {
    "id": "999"
  }
}
```

---

## 3. Crear un Rol con Permisos

### **POST** `/api/gestion-roles`

**Descripción:** Crea un nuevo rol con permisos y privilegios específicos. **IMPORTANTE:** El ejemplo incluye TODOS los módulos disponibles en el sistema (19 módulos).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### **Ejemplo 1: Rol Completo con Todos los Módulos (Empleado Avanzado)**

**Body:**
```json
{
  "nombre": "empleado_avanzado",
  "estado": true,
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "empresas": {
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "archivos": {
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitud_cita": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "dashboard": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

### **Ejemplo 2: Rol Básico (Solo Lectura)**

**Body:**
```json
{
  "nombre": "empleado_lector",
  "estado": true,
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "empresas": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "citas": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "pagos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitud_cita": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "dashboard": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

### **Ejemplo 3: Rol Especializado (Solo Citas y Solicitudes)**

**Body:**
```json
{
  "nombre": "empleado_atencion_cliente",
  "estado": true,
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "empresas": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "archivos": {
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "solicitud_cita": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": false,
      "leer": false,
      "actualizar": false,
      "eliminar": false
    },
    "dashboard": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**Response (201 Created - Ejemplo 1):**
```json
{
  "success": true,
  "data": {
    "id": "4",
    "nombre": "Empleado_avanzado",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "empleados": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "clientes": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "empresas": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "servicios": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "solicitudes": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "citas": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "pagos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "roles": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "permisos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "privilegios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "seguimiento": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "archivos": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "tipo_archivos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "solicitud_cita": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "detalles_orden": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "detalles_procesos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "servicios_procesos": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "dashboard": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

**Nota:** La respuesta incluye TODOS los módulos disponibles (19 módulos) con sus respectivos permisos.

**Response (400 Bad Request - Validación):**
```json
{
  "success": false,
  "error": "El nombre del rol es obligatorio y debe ser un string"
}
```

---

## 4. Actualizar un Rol

### **PUT** `/api/gestion-roles/:id`

**Descripción:** Actualiza un rol existente. Puedes actualizar nombre, estado y/o permisos.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID del rol (ej: `4`)

### **Ejemplo 1: Actualizar Solo el Nombre**

**Body:**
```json
{
  "nombre": "empleado_lector_actualizado"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Empleado_lector_actualizado",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

### **Ejemplo 2: Actualizar Solo el Estado**

**Body:**
```json
{
  "estado": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Empleado_lector",
    "estado": "Inactivo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

### **Ejemplo 3: Actualizar Solo los Permisos**

**Body:**
```json
{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Empleado_lector",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "empleados": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "clientes": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "empresas": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "servicios": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "solicitudes": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "citas": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "pagos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "roles": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "permisos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "privilegios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "seguimiento": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "archivos": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "tipo_archivos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "solicitud_cita": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "detalles_orden": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "detalles_procesos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "servicios_procesos": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "dashboard": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

**Nota:** La respuesta incluye TODOS los módulos disponibles (19 módulos) con sus respectivos permisos.

### **Ejemplo 4: Actualizar Todo (Nombre, Estado y Permisos - Todos los Módulos)**

**Body:**
```json
{
  "nombre": "empleado_avanzado",
  "estado": true,
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "empleados": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "clientes": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "empresas": {
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "servicios": {
      "crear": false,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "solicitudes": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "pagos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "roles": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "permisos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "privilegios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "seguimiento": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "archivos": {
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "tipo_archivos": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitud_cita": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_orden": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "detalles_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    },
    "servicios_procesos": {
      "crear": true,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "dashboard": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Empleado_avanzado",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "empleados": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "clientes": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "empresas": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "servicios": {
        "crear": false,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "solicitudes": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "citas": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "pagos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "roles": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "permisos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "privilegios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "seguimiento": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "archivos": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "tipo_archivos": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "solicitud_cita": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "detalles_orden": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "detalles_procesos": {
        "crear": true,
        "leer": true,
        "actualizar": true,
        "eliminar": false
      },
      "servicios_procesos": {
        "crear": true,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      },
      "dashboard": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

**Nota:** La respuesta incluye TODOS los módulos disponibles (19 módulos) con sus respectivos permisos.

---

## 5. Eliminar Permisos de un Rol

### **PUT** `/api/gestion-roles/:id`

**Descripción:** Elimina todos los permisos de un rol enviando un objeto vacío en `permisos`.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID del rol (ej: `4`)

**Body:**
```json
{
  "permisos": {}
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "id": "4",
    "nombre": "Empleado_lector",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      },
      "solicitudes": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      },
      "citas": {
        "crear": false,
        "leer": false,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

**Nota:** Todos los permisos quedan en `false`. El rol queda sin permisos asignados.

---

## 6. Cambiar Estado de un Rol

### **PATCH** `/api/gestion-roles/:id/state`

**Descripción:** Cambia el estado de un rol (activo/inactivo).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID del rol (ej: `4`)

### **Ejemplo 1: Desactivar un Rol**

**Body:**
```json
{
  "estado": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "4",
    "nombre": "Empleado_lector",
    "estado": "Inactivo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

### **Ejemplo 2: Activar un Rol**

**Body:**
```json
{
  "estado": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "4",
    "nombre": "Empleado_lector",
    "estado": "Activo",
    "permisos": {
      "usuarios": {
        "crear": false,
        "leer": true,
        "actualizar": false,
        "eliminar": false
      }
    }
  }
}
```

---

## 7. Eliminar un Rol

### **DELETE** `/api/gestion-roles/:id`

**Descripción:** Elimina un rol. No se puede eliminar roles básicos (cliente, administrador, empleado) ni roles con usuarios asignados.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**URL Parameters:**
- `id`: ID del rol (ej: `4`)

**Response (200 OK - Rol Eliminado):**
```json
{
  "success": true,
  "message": "Rol eliminado correctamente",
  "data": {
    "id_rol": 4,
    "nombre": "empleado_lector"
  }
}
```

---

## 8. Ejemplos de Casos de Error

### **Error 1: Intentar Eliminar un Rol Básico**

**Request:**
```
DELETE /api/gestion-roles/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "No se puede eliminar el rol \"administrador\" porque es un rol básico del sistema",
  "detalles": {
    "rol": "administrador",
    "roles_basicos": ["cliente", "administrador", "empleado"],
    "mensaje": "Los roles básicos (cliente, administrador, empleado) no pueden ser eliminados por seguridad del sistema."
  }
}
```

### **Error 2: Intentar Eliminar un Rol con Usuarios Asignados**

**Request:**
```
DELETE /api/gestion-roles/4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "No se puede eliminar el rol \"empleado_lector\" porque está siendo usado por 5 usuario(s)",
  "detalles": {
    "rol": "empleado_lector",
    "id_rol": 4,
    "usuarios_asignados": 5,
    "mensaje": "Debes reasignar los usuarios a otro rol antes de eliminar este rol.",
    "accion_requerida": "Reasigna los usuarios a otro rol y luego intenta eliminar este rol nuevamente."
  }
}
```

### **Error 3: Rol No Encontrado**

**Request:**
```
GET /api/gestion-roles/999
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Rol no encontrado",
  "details": {
    "id": "999"
  }
}
```

### **Error 4: Sin Permisos (403 Forbidden)**

**Request:**
```
POST /api/gestion-roles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nombre": "nuevo_rol",
  "permisos": {}
}
```

**Response (403 Forbidden):**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para crear en gestion_roles",
  "permiso_requerido": "gestion_roles",
  "privilegio_requerido": "crear",
  "rol": "empleado",
  "id_rol": 3,
  "detalles": "Tu rol no tiene esta combinación específica de permiso y privilegio asignada. Contacta al administrador para obtener los permisos necesarios."
}
```

### **Error 5: Validación de Datos (400 Bad Request)**

**Request:**
```
POST /api/gestion-roles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nombre": "",
  "permisos": {}
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "El nombre del rol es obligatorio y debe ser un string"
}
```

### **Error 6: Token Inválido (401 Unauthorized)**

**Request:**
```
GET /api/gestion-roles
Authorization: Bearer token_invalido
```

**Response (401 Unauthorized):**
```json
{
  "mensaje": "Token inválido"
}
```

---

## 🔄 Flujo Completo de Ejemplo

### **Paso 1: Crear un Rol**

**Request:**
```
POST /api/gestion-roles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "nombre": "empleado_lector",
  "estado": true,
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    }
  }
}
```

**Response:** Rol creado con ID `4`

---

### **Paso 2: Ver el Rol Creado**

**Request:**
```
GET /api/gestion-roles/4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** Rol con permisos asignados

---

### **Paso 3: Actualizar los Permisos del Rol**

**Request:**
```
PUT /api/gestion-roles/4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "permisos": {
    "usuarios": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "solicitudes": {
      "crear": false,
      "leer": true,
      "actualizar": false,
      "eliminar": false
    },
    "citas": {
      "crear": true,
      "leer": true,
      "actualizar": true,
      "eliminar": false
    }
  }
}
```

**Response:** Rol actualizado con nuevos permisos

---

### **Paso 4: Eliminar Todos los Permisos del Rol**

**Request:**
```
PUT /api/gestion-roles/4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "permisos": {}
}
```

**Response:** Rol sin permisos (todos en `false`)

---

### **Paso 5: Desactivar el Rol**

**Request:**
```
PATCH /api/gestion-roles/4/state
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "estado": false
}
```

**Response:** Rol desactivado

---

### **Paso 6: Eliminar el Rol**

**Request:**
```
DELETE /api/gestion-roles/4
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** Rol eliminado correctamente

---

## 📝 Notas Importantes

### **1. Autenticación:**
- Todos los endpoints requieren autenticación con token JWT
- El token se obtiene mediante `POST /api/auth/login`
- El token debe incluirse en el header `Authorization: Bearer <token>`

### **2. Permisos:**
- Solo usuarios con rol `administrador` o con permiso `gestion_roles` pueden gestionar roles
- El administrador tiene bypass automático (no requiere permisos específicos)
- Otros roles requieren permisos específicos (`gestion_roles` + `crear/leer/actualizar/eliminar`)

### **3. Validaciones:**
- No se pueden eliminar roles básicos: `cliente`, `administrador`, `empleado`
- No se pueden eliminar roles con usuarios asignados
- Los permisos deben ser un objeto con módulos y acciones
- Las acciones deben ser booleanos (`true`/`false`)

### **4. Formato de Permisos:**
- Los permisos se envían en formato granular (módulo + acción)
- Ejemplo: `{ "usuarios": { "leer": true, "crear": false } }`
- Para eliminar todos los permisos, enviar `{ "permisos": {} }`

### **5. Estados:**
- `true` = Activo
- `false` = Inactivo
- Se puede enviar como booleano o string (`"Activo"`/`"Inactivo"`)

---

## 🧪 Colección de Postman

### **Variables de Entorno:**

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `base_url` | `http://localhost:3000` | URL base de la API |
| `token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Token JWT (se actualiza después del login) |
| `rol_id` | `4` | ID del rol para pruebas |

### **Pre-request Script (Login):**
```javascript
// Guardar el token después del login
pm.environment.set("token", pm.response.json().data.token);
```

### **Tests (Validaciones):**
```javascript
// Verificar que la respuesta sea exitosa
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Verificar que la respuesta tenga la estructura correcta
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.eql(true);
});
```

---

## 📚 Referencias

- **Documentación de API:** Ver `README.md`
- **Funcionalidades de Roles:** Ver `RESPUESTA_FUNCIONALIDADES_ROLES.md`
- **Sistema de Permisos:** Ver `GUIA_SISTEMA_ROLES_PERMISOS_PRIVILEGIOS.md`

---

## 8. Crear Usuario como Administrador

### **POST** `/api/usuarios/crear`

**Descripción:** Crea un nuevo usuario con un rol específico. **Solo administradores** pueden crear usuarios. El usuario autenticado debe tener el permiso `gestion_usuarios` + `crear`.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Permiso Requerido:** `gestion_usuarios` + `crear`

---

### **Ejemplo 1: Crear Usuario Cliente**

**Body:**
```json
{
  "tipo_documento": "CC",
  "documento": "1234567890",
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan.perez@example.com",
  "contrasena": "Password123!",
  "telefono": "3001234567",
  "id_rol": 1
}
```

**Response (201 Created):**
```json
{
  "mensaje": "Usuario creado exitosamente por administrador",
  "usuario": {
    "id_usuario": 15,
    "tipo_documento": "CC",
    "documento": "1234567890",
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan.perez@example.com",
    "telefono": "3001234567",
    "id_rol": 1,
    "estado": true,
    "created_at": "2026-01-15T10:30:00.000Z",
    "updated_at": "2026-01-15T10:30:00.000Z"
  }
}
```

---

### **Ejemplo 1.1: Crear Usuario con Rol Personalizado**

**Body:**
```json
{
  "tipo_documento": "CC",
  "documento": "9065478345",
  "nombre": "KIKO",
  "apellido": "Pérez",
  "correo": "kiko.perez@example.com",
  "contrasena": "Password123!",
  "telefono": "3001234567",
  "id_rol": 11
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "mensaje": "Usuario creado exitosamente por administrador",
  "usuario": {
    "id_usuario": 19,
    "tipo_documento": "CC",
    "documento": "9065478345",
    "nombre": "KIKO",
    "apellido": "Pérez",
    "correo": "kiko.perez@example.com",
    "telefono": "3001234567",
    "id_rol": 11,
    "estado": true,
    "created_at": "2026-01-15T11:00:00.000Z",
    "updated_at": "2026-01-15T11:00:00.000Z"
  }
}
```

**Nota:** Este ejemplo usa un rol personalizado (`id_rol: 11`, por ejemplo "empleado_avanzado"). El rol debe existir en la base de datos y estar activo.

---

### **Ejemplo 2: Crear Usuario Empleado (Rol Básico)**

**Body:**
```json
{
  "tipo_documento": "CC",
  "documento": "9876543210",
  "nombre": "María",
  "apellido": "González",
  "correo": "maria.gonzalez@example.com",
  "contrasena": "SecurePass456!",
  "telefono": "3009876543",
  "id_rol": 3
}
```

**Response (201 Created):**
```json
{
  "mensaje": "Usuario creado exitosamente por administrador",
  "usuario": {
    "id_usuario": 16,
    "tipo_documento": "CC",
    "documento": "9876543210",
    "nombre": "María",
    "apellido": "González",
    "correo": "maria.gonzalez@example.com",
    "telefono": "3009876543",
    "id_rol": 3,
    "estado": true,
    "created_at": "2026-01-15T10:35:00.000Z",
    "updated_at": "2026-01-15T10:35:00.000Z"
  }
}
```

**Nota:** Después de crear un usuario empleado, es necesario crear el registro en la tabla `empleados` asociado a este usuario (esto se hace mediante el endpoint de gestión de empleados).

---

### **Ejemplo 3: Crear Usuario Administrador**

**Body:**
```json
{
  "tipo_documento": "CC",
  "documento": "5555555555",
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "correo": "carlos.rodriguez@example.com",
  "contrasena": "AdminPass789!",
  "telefono": "3005555555",
  "id_rol": 2
}
```

**Response (201 Created):**
```json
{
  "mensaje": "Usuario creado exitosamente por administrador",
  "usuario": {
    "id_usuario": 17,
    "tipo_documento": "CC",
    "documento": "5555555555",
    "nombre": "Carlos",
    "apellido": "Rodríguez",
    "correo": "carlos.rodriguez@example.com",
    "telefono": "3005555555",
    "id_rol": 2,
    "estado": true,
    "created_at": "2026-01-15T10:40:00.000Z",
    "updated_at": "2026-01-15T10:40:00.000Z"
  }
}
```

---

### **Ejemplo 4: Crear Usuario sin Teléfono (Opcional)**

**Body:**
```json
{
  "tipo_documento": "CE",
  "documento": "1122334455",
  "nombre": "Ana",
  "apellido": "Martínez",
  "correo": "ana.martinez@example.com",
  "contrasena": "AnaPass123!",
  "id_rol": 1
}
```

**Response (201 Created):**
```json
{
  "mensaje": "Usuario creado exitosamente por administrador",
  "usuario": {
    "id_usuario": 18,
    "tipo_documento": "CE",
    "documento": "1122334455",
    "nombre": "Ana",
    "apellido": "Martínez",
    "correo": "ana.martinez@example.com",
    "telefono": null,
    "id_rol": 1,
    "estado": true,
    "created_at": "2026-01-15T10:45:00.000Z",
    "updated_at": "2026-01-15T10:45:00.000Z"
  }
}
```

---

### **Campos Requeridos y Validaciones**

| Campo | Tipo | Requerido | Validaciones | Ejemplo |
|-------|------|-----------|--------------|---------|
| `tipo_documento` | string | ✅ Sí | CC, CE, TI, RC, NIT, PAS | `"CC"` |
| `documento` | string/number | ✅ Sí | 6-10 dígitos, único | `"1234567890"` |
| `nombre` | string | ✅ Sí | 2-50 caracteres | `"Juan"` |
| `apellido` | string | ✅ Sí | 2-50 caracteres | `"Pérez"` |
| `correo` | string | ✅ Sí | Email válido, único | `"juan@example.com"` |
| `contrasena` | string | ✅ Sí | Min 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial | `"Password123!"` |
| `id_rol` | number | ✅ Sí | Cualquier ID de rol existente y activo (ej: 1, 2, 3, 11, etc.) | `1` o `11` |
| `telefono` | string | ❌ No | 7-20 caracteres, opcional | `"3001234567"` |

---

### **Roles Disponibles**

**Roles Básicos del Sistema:**
| id_rol | Nombre | Descripción |
|--------|--------|-------------|
| `1` | `cliente` | Cliente externo con acceso a sus propios datos |
| `2` | `administrador` | Administrador del sistema con acceso completo |
| `3` | `empleado` | Empleado de la empresa con acceso limitado |

**Roles Personalizados:**
- Puedes crear roles personalizados mediante el endpoint `/api/gestion-roles`
- Cualquier rol existente y **activo** en la base de datos puede ser asignado a un usuario
- Ejemplo: Si creaste un rol "empleado_avanzado" con `id_rol: 11`, puedes usar `id_rol: 11` al crear el usuario

**Nota:** Solo se pueden asignar roles que:
- ✅ Existan en la base de datos
- ✅ Estén activos (`estado: true`)
- ✅ Tengan permisos y privilegios asignados (si aplica)

---

### **Validaciones de Contraseña**

La contraseña debe cumplir los siguientes requisitos:
- ✅ Mínimo 8 caracteres
- ✅ Al menos una letra mayúscula
- ✅ Al menos un número
- ✅ Al menos un carácter especial (`!@#$%^&*()_+-=[]{}|;':"\\|,.<>/?`)

**Ejemplos de contraseñas válidas:**
- ✅ `Password123!`
- ✅ `SecurePass456@`
- ✅ `Admin789#`
- ✅ `MyPass2024$`

**Ejemplos de contraseñas inválidas:**
- ❌ `password123` (falta mayúscula y carácter especial)
- ❌ `PASSWORD123!` (solo mayúsculas, falta minúscula)
- ❌ `Password!` (falta número)
- ❌ `Pass123` (menos de 8 caracteres)

---

### **Tipos de Documento Válidos**

| Tipo | Descripción |
|------|-------------|
| `CC` | Cédula de Ciudadanía |
| `CE` | Cédula de Extranjería |
| `TI` | Tarjeta de Identidad |
| `RC` | Registro Civil |
| `NIT` | Número de Identificación Tributaria |
| `PAS` | Pasaporte |

---

### **Errores Comunes**

#### **Error 400: Campo Faltante**
```json
{
  "mensaje": "Todos los campos son obligatorios (tipo_documento, documento, nombre, apellido, correo, contrasena, id_rol)"
}
```

#### **Error 400: Correo Ya Registrado**
```json
{
  "mensaje": "El correo ya está registrado"
}
```

#### **Error 400: Documento Ya Registrado**
```json
{
  "mensaje": "El documento ya está registrado"
}
```

#### **Error 400: Contraseña Inválida**
```json
{
  "mensaje": "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un carácter especial"
}
```

#### **Error 400: Rol Inactivo**
```json
{
  "success": false,
  "mensaje": "El rol especificado está inactivo",
  "campo": "id_rol",
  "valor": 11,
  "rol_encontrado": "empleado_avanzado",
  "estado": "inactivo",
  "detalles": "Solo se pueden asignar roles activos a los usuarios. Active el rol primero si desea usarlo."
}
```

#### **Error 400: Rol No Existe**
```json
{
  "success": false,
  "mensaje": "El rol especificado no existe",
  "campo": "id_rol",
  "valor": 99,
  "detalles": "El rol con este ID no existe en la base de datos. Verifique el ID del rol."
}
```

#### **Error 403: Sin Permisos**
```json
{
  "success": false,
  "mensaje": "No tienes permiso para crear en gestion_usuarios",
  "permiso_requerido": "gestion_usuarios",
  "privilegio_requerido": "crear",
  "rol": "empleado",
  "id_rol": 3,
  "detalles": "Tu rol no tiene esta combinación específica de permiso y privilegio asignada. Contacta al administrador para obtener los permisos necesarios."
}
```

#### **Error 401: Token Inválido o Faltante**
```json
{
  "mensaje": "Token requerido"
}
```
```json
{
  "mensaje": "Token inválido"
}
```

---

### **Notas Importantes**

1. **Permisos Requeridos:**
   - El usuario autenticado debe tener el permiso `gestion_usuarios` + `crear`
   - Solo los administradores tienen acceso total por defecto
   - Los empleados pueden tener este permiso si se les asigna

2. **Roles Válidos:**
   - ✅ Se pueden crear usuarios con **cualquier rol** que exista en la base de datos y esté activo
   - ✅ Esto incluye los roles básicos (`cliente`, `empleado`, `administrador`) y roles personalizados
   - ✅ El `id_rol` debe existir en la base de datos
   - ✅ El rol debe estar activo (`estado: true`)
   - ✅ Los roles personalizados creados mediante `/api/gestion-roles` pueden ser asignados a usuarios

3. **Campos Únicos:**
   - El `correo` debe ser único en el sistema
   - El `documento` debe ser único en el sistema

4. **Creación de Empleados:**
   - Después de crear un usuario con rol `empleado`, es necesario crear el registro en la tabla `empleados`
   - Esto se hace mediante el endpoint de gestión de empleados (`POST /api/gestion-empleados`)

5. **Creación de Clientes:**
   - Después de crear un usuario con rol `cliente`, puede ser necesario crear el registro en la tabla `clientes`
   - Esto se hace mediante el endpoint de gestión de clientes o durante la creación de una solicitud

6. **Teléfono Opcional:**
   - El campo `telefono` es opcional
   - Si se proporciona, debe tener entre 7 y 20 caracteres
   - Se aceptan formatos con espacios, guiones, paréntesis (ej: `300-123-4567`, `(300) 123-4567`)

---

**Documento creado:** Enero 2026  
**Versión:** 1.1  
**Estado:** ✅ Completo y listo para usar

