# 📋 Mapeo Completo de Módulos y Acciones - API Registrack

**Fecha:** Enero 2026  
**Versión:** 1.0  
**Objetivo:** Documentar todos los módulos, endpoints y acciones del proyecto

---

## 📊 Resumen Ejecutivo

### **Total de Módulos:** 20
### **Total de Endpoints:** ~130
### **Acciones Disponibles:** crear, leer, actualizar, eliminar

---

## 🗺️ Mapeo Completo de Módulos y Endpoints

### **1. Módulo: Usuarios** (`gestion_usuarios`)
**Ruta Base:** `/api/usuarios`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/registrar` | POST | crear | ❌ Público | - | Registro público |
| `/login` | POST | - | ❌ Público | - | Autenticación |
| `/forgot-password` | POST | - | ❌ Público | - | Recuperar contraseña |
| `/reset-password` | POST | - | ❌ Público | - | Resetear contraseña |
| `/` | GET | leer | `gestion_usuarios` + `leer` | administrador, empleado | Listar usuarios |
| `/:id` | GET | leer | `gestion_usuarios` + `leer` | administrador, empleado | Ver usuario |
| `/crear` | POST | crear | `gestion_usuarios` + `crear` | administrador | Crear usuario (admin) |
| `/:id` | PUT | actualizar | `gestion_usuarios` + `actualizar` | Todos (validación en controlador) | Actualizar usuario |
| `/cambiar-estado/:id` | PUT | actualizar | `gestion_usuarios` + `actualizar` | administrador | Cambiar estado |
| `/:id` | DELETE | eliminar | `gestion_usuarios` + `eliminar` | administrador, empleado | Eliminar usuario |

**Total Endpoints:** 10  
**Endpoints Protegidos:** 6  
**Endpoints Públicos:** 4

---

### **2. Módulo: Empleados** (`gestion_empleados`)
**Ruta Base:** `/api/gestion-empleados`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | GET | leer | `gestion_empleados` + `leer` | administrador | Listar empleados |
| `/:id` | GET | leer | `gestion_empleados` + `leer` | administrador | Ver empleado |
| `/` | POST | crear | `gestion_empleados` + `crear` | administrador | Crear empleado |
| `/:id` | PUT | actualizar | `gestion_empleados` + `actualizar` | administrador | Actualizar empleado |
| `/:id/estado` | PATCH | actualizar | `gestion_empleados` + `actualizar` | administrador | Cambiar estado |
| `/:id` | DELETE | eliminar | `gestion_empleados` + `eliminar` | administrador | Eliminar empleado |
| `/reporte/excel` | GET | leer | `gestion_empleados` + `leer` | administrador | Reporte Excel |

**Total Endpoints:** 7  
**Endpoints Protegidos:** 7  
**Endpoints Públicos:** 0

---

### **3. Módulo: Clientes** (`gestion_clientes`)
**Ruta Base:** `/api/gestion-clientes`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | GET | leer | `gestion_clientes` + `leer` | administrador, empleado | Listar clientes |
| `/:id` | GET | leer | `gestion_clientes` + `leer` | administrador, empleado, cliente | Ver cliente (cliente ve solo el suyo) |
| `/:id` | PUT | actualizar | `gestion_clientes` + `actualizar` | administrador, empleado | Actualizar cliente |
| `/:id/usuario` | PUT | actualizar | `gestion_clientes` + `actualizar` | administrador, empleado | Actualizar usuario del cliente |
| `/:id/empresa` | PUT | actualizar | `gestion_clientes` + `actualizar` | administrador, empleado | Actualizar empresa del cliente |
| `/:id` | DELETE | eliminar | `gestion_clientes` + `eliminar` | administrador | Eliminar cliente |
| `/reporte/excel` | GET | leer | `gestion_clientes` + `leer` | administrador, empleado | Reporte Excel |

**Total Endpoints:** 7  
**Endpoints Protegidos:** 7  
**Endpoints Públicos:** 0

**Nota:** Cliente puede ver solo su propio registro (validación en controlador).

---

### **4. Módulo: Empresas** (`gestion_empresas`)
**Ruta Base:** `/api/gestion-empresas`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | POST | crear | `gestion_empresas` + `crear` | administrador, empleado | Crear empresa |
| `/:id/clientes` | GET | leer | `gestion_empresas` + `leer` | administrador, empleado | Listar clientes de empresa |
| `/nit/:nit/clientes` | GET | leer | `gestion_empresas` + `leer` | administrador, empleado | Listar clientes por NIT |

**Total Endpoints:** 3  
**Endpoints Protegidos:** 3  
**Endpoints Públicos:** 0

**Nota:** Solo tiene crear y leer. No tiene actualizar ni eliminar (¿faltan?).

---

### **5. Módulo: Solicitudes** (`gestion_solicitudes`)
**Ruta Base:** `/api/gestion-solicitudes`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/crear/:servicio` | POST | crear | `gestion_solicitudes` + `crear` | cliente, administrador, empleado | Crear solicitud |
| `/mias` | GET | leer | `gestion_solicitudes` + `leer` | cliente | Ver mis solicitudes |
| `/` | GET | leer | `gestion_solicitudes` + `leer` | administrador, empleado | Listar todas las solicitudes |
| `/buscar` | GET | leer | `gestion_solicitudes` + `leer` | administrador, empleado | Buscar solicitudes |
| `/:id` | GET | leer | `gestion_solicitudes` + `leer` | administrador, empleado | Ver detalle solicitud |
| `/editar/:id` | PUT | actualizar | `gestion_solicitudes` + `actualizar` | administrador, empleado | Editar solicitud |
| `/anular/:id` | PUT | eliminar | `gestion_solicitudes` + `eliminar` | administrador, empleado | Anular solicitud |
| `/:id/estados-disponibles` | GET | leer | `gestion_solicitudes` + `leer` | administrador, empleado | Estados disponibles |
| `/:id/estado-actual` | GET | leer | `gestion_solicitudes` + `leer` | administrador, empleado | Estado actual |
| `/mis/:id/estados-disponibles` | GET | leer | `gestion_solicitudes` + `leer` | cliente | Estados disponibles (cliente) |
| `/mis/:id/estado-actual` | GET | leer | `gestion_solicitudes` + `leer` | cliente | Estado actual (cliente) |
| `/asignar-empleado/:id` | PUT | actualizar | `gestion_solicitudes` + `actualizar` | administrador, empleado | Asignar empleado |
| `/mis/:id/empleado-asignado` | GET | leer | `gestion_solicitudes` + `leer` | cliente | Ver empleado asignado |
| `/:id/descargar-archivos` | GET | leer | `gestion_solicitudes` + `leer` | administrador, empleado, cliente | Descargar archivos ZIP |

**Total Endpoints:** 14  
**Endpoints Protegidos:** 14  
**Endpoints Públicos:** 0

**Nota:** Cliente puede crear y ver solo sus propias solicitudes (validación en controlador).

---

### **6. Módulo: Citas** (`gestion_citas`)
**Ruta Base:** `/api/gestion-citas`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | GET | leer | `gestion_citas` + `leer` | administrador, empleado, cliente | Listar citas |
| `/` | POST | crear | `gestion_citas` + `crear` | administrador, empleado, cliente | Crear cita |
| `/:id/reprogramar` | PUT | actualizar | `gestion_citas` + `actualizar` | administrador, empleado, cliente | Reprogramar cita |
| `/:id/anular` | PUT | eliminar | `gestion_citas` + `eliminar` | administrador, empleado, cliente | Anular cita |
| `/:id/finalizar` | PUT | actualizar | `gestion_citas` + `actualizar` | administrador, empleado | Finalizar cita |
| `/reporte/excel` | GET | leer | `gestion_citas` + `leer` | administrador, empleado | Reporte Excel |
| `/desde-solicitud` | POST | crear | `gestion_citas` + `crear` | administrador, empleado | Crear cita desde solicitud |
| `/solicitud/:idSolicitud` | GET | leer | `gestion_citas` + `leer` | administrador, empleado | Ver citas de solicitud |
| `/buscar-usuario/:documento` | GET | leer | `gestion_citas` + `leer` | administrador, empleado | Buscar usuario por documento |

**Total Endpoints:** 9  
**Endpoints Protegidos:** 9  
**Endpoints Públicos:** 0

**Nota:** Cliente puede crear y ver solo sus propias citas (validación en controlador).

---

### **7. Módulo: Pagos** (`gestion_pagos`)
**Ruta Base:** `/api/gestion-pagos`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | GET | leer | `gestion_pagos` + `leer` | administrador, empleado | Listar pagos |
| `/:id` | GET | leer | `gestion_pagos` + `leer` | administrador, empleado | Ver pago |
| `/` | POST | crear | `gestion_pagos` + `crear` | administrador, empleado | Crear pago |
| `/reporte/excel` | GET | leer | `gestion_pagos` + `leer` | administrador, empleado | Reporte Excel |
| `/:id/comprobante` | GET | leer | `gestion_pagos` + `leer` | administrador, empleado, cliente | Ver comprobante |
| `/process-mock` | POST | crear | `gestion_pagos` + `crear` | administrador, empleado, cliente | Procesar pago mock |
| `/simular` | POST | crear | `gestion_pagos` + `crear` | administrador, empleado | Simular pago |
| `/:id/verify-manual` | POST | actualizar | `gestion_pagos` + `actualizar` | administrador | Verificar pago manual |
| `/:id/comprobante/download` | GET | leer | `gestion_pagos` + `leer` | administrador, empleado, cliente | Descargar comprobante |

**Total Endpoints:** 9  
**Endpoints Protegidos:** 9  
**Endpoints Públicos:** 0

**Nota:** Cliente puede ver comprobantes y procesar pagos (validación en controlador).

---

### **8. Módulo: Seguimiento** (`gestion_seguimiento`)
**Ruta Base:** `/api/seguimiento`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/historial/:idOrdenServicio` | GET | leer | `gestion_seguimiento` + `leer` | administrador, empleado | Ver historial |
| `/crear` | POST | crear | `gestion_seguimiento` + `crear` | administrador, empleado | Crear seguimiento |
| `/:id` | GET | leer | `gestion_seguimiento` + `leer` | administrador, empleado | Ver seguimiento |
| `/:id` | PUT | actualizar | `gestion_seguimiento` + `actualizar` | administrador, empleado | Actualizar seguimiento |
| `/:id` | DELETE | eliminar | `gestion_seguimiento` + `eliminar` | administrador, empleado | Eliminar seguimiento |
| `/buscar/:idOrdenServicio` | GET | leer | `gestion_seguimiento` + `leer` | administrador, empleado | Buscar por título |
| `/:idOrdenServicio/estados-disponibles` | GET | leer | `gestion_seguimiento` + `leer` | administrador, empleado | Estados disponibles |

**Total Endpoints:** 7  
**Endpoints Protegidos:** 7  
**Endpoints Públicos:** 0

---

### **9. Módulo: Servicios** (`gestion_servicios`)
**Ruta Base:** `/api/servicios`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | GET | leer | ❌ Público | - | Listar servicios (público) |
| `/buscar` | GET | leer | ❌ Público | - | Buscar servicios (público) |
| `/admin/todos` | GET | leer | `gestion_servicios` + `leer` | administrador | Ver todos (incluyendo ocultos) |
| `/:id` | GET | leer | ❌ Público | - | Ver servicio (público) |
| `/:id/detalle` | GET | leer | ❌ Público | - | Ver detalle (público) |
| `/:id` | PUT | actualizar | `gestion_servicios` + `actualizar` | administrador, empleado | Actualizar servicio |
| `/:id/ocultar` | PATCH | actualizar | `gestion_servicios` + `actualizar` | administrador | Ocultar servicio |
| `/:id/publicar` | PATCH | actualizar | `gestion_servicios` + `actualizar` | administrador | Publicar servicio |
| `/:idServicio/procesos` | GET | leer | ❌ Público | - | Ver procesos (público) |
| `/:idServicio/procesos` | PUT | actualizar | `gestion_servicios` + `actualizar` | administrador | Actualizar procesos |

**Total Endpoints:** 10  
**Endpoints Protegidos:** 5  
**Endpoints Públicos:** 5

**Nota:** La mayoría de endpoints son públicos (consultar servicios). Solo actualizar/ocultar/publicar requieren permisos.

---

### **10. Módulo: Dashboard** (`gestion_dashboard`)
**Ruta Base:** `/api/dashboard`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/ingresos` | GET | leer | `gestion_dashboard` + `leer` | administrador | Análisis de ingresos |
| `/servicios` | GET | leer | `gestion_dashboard` + `leer` | administrador | Resumen de servicios |
| `/resumen` | GET | leer | `gestion_dashboard` + `leer` | administrador | Resumen general |
| `/pendientes` | GET | leer | `gestion_dashboard` + `leer` | administrador | Servicios pendientes |
| `/inactivas` | GET | leer | `gestion_dashboard` + `leer` | administrador | Solicitudes inactivas |
| `/renovaciones-proximas` | GET | leer | `gestion_dashboard` + `leer` | administrador, empleado | Renovaciones próximas |
| `/renovaciones-proximas/test-alertas` | POST | - | `gestion_dashboard` + `leer` | administrador | Probar alertas |
| `/periodos` | GET | leer | `gestion_dashboard` + `leer` | administrador | Períodos disponibles |

**Total Endpoints:** 8  
**Endpoints Protegidos:** 8  
**Endpoints Públicos:** 0

**Nota:** Solo lectura. No tiene crear, actualizar ni eliminar.

---

### **11. Módulo: Roles** (`gestion_roles`)
**Ruta Base:** `/api/gestion-roles`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | GET | leer | `gestion_roles` + `leer` | administrador | Listar roles |
| `/` | POST | crear | `gestion_roles` + `crear` | administrador | Crear rol |
| `/:id` | GET | leer | `gestion_roles` + `leer` | administrador | Ver rol |
| `/:id` | PUT | actualizar | `gestion_roles` + `actualizar` | administrador | Actualizar rol |
| `/:id/state` | PATCH | actualizar | `gestion_roles` + `actualizar` | administrador | Cambiar estado |
| `/:id` | DELETE | eliminar | `gestion_roles` + `eliminar` | administrador | Eliminar rol |

**Total Endpoints:** 6  
**Endpoints Protegidos:** 6  
**Endpoints Públicos:** 0

---

### **12. Módulo: Permisos** (`gestion_permisos`)
**Ruta Base:** `/api/gestion-permisos`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | POST | crear | `gestion_permisos` + `crear` | administrador | Crear permiso |
| `/` | GET | leer | `gestion_permisos` + `leer` | administrador | Listar permisos |
| `/:id` | GET | leer | `gestion_permisos` + `leer` | administrador | Ver permiso |
| `/:id` | PUT | actualizar | `gestion_permisos` + `actualizar` | administrador | Actualizar permiso |
| `/:id` | DELETE | eliminar | `gestion_permisos` + `eliminar` | administrador | Eliminar permiso |

**Total Endpoints:** 5  
**Endpoints Protegidos:** 5  
**Endpoints Públicos:** 0

---

### **13. Módulo: Privilegios** (`gestion_privilegios`)
**Ruta Base:** `/api/gestion-privilegios`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | POST | crear | `gestion_privilegios` + `crear` | administrador | Crear privilegio |
| `/` | GET | leer | `gestion_privilegios` + `leer` | administrador | Listar privilegios |
| `/:id` | GET | leer | `gestion_privilegios` + `leer` | administrador | Ver privilegio |
| `/:id` | PUT | actualizar | `gestion_privilegios` + `actualizar` | administrador | Actualizar privilegio |
| `/:id` | DELETE | eliminar | `gestion_privilegios` + `eliminar` | administrador | Eliminar privilegio |

**Total Endpoints:** 5  
**Endpoints Protegidos:** 5  
**Endpoints Públicos:** 0

---

### **14. Módulo: Archivos** (`gestion_archivos`)
**Ruta Base:** `/api/gestion-archivos`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/upload` | POST | crear | `gestion_archivos` + `crear` | administrador, empleado, cliente | Subir archivo |
| `/:id/descargar` | GET | leer | `gestion_archivos` + `leer` | administrador, empleado, cliente | Descargar archivo |
| `/cliente/:idCliente` | GET | leer | `gestion_archivos` + `leer` | administrador, empleado, cliente | Listar archivos de cliente |

**Total Endpoints:** 3  
**Endpoints Protegidos:** 3  
**Endpoints Públicos:** 0

**Nota:** Solo tiene crear y leer. No tiene actualizar ni eliminar (¿faltan?).

---

### **15. Módulo: Tipo Archivos** (`gestion_tipo_archivos`)
**Ruta Base:** `/api/gestion-tipo-archivos`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | GET | leer | `gestion_tipo_archivos` + `leer` | administrador, empleado | Listar tipos |
| `/` | POST | crear | `gestion_tipo_archivos` + `crear` | administrador, empleado | Crear tipo |
| `/:id` | PUT | actualizar | `gestion_tipo_archivos` + `actualizar` | administrador, empleado | Actualizar tipo |
| `/:id` | DELETE | eliminar | `gestion_tipo_archivos` + `eliminar` | administrador | Eliminar tipo |

**Total Endpoints:** 4  
**Endpoints Protegidos:** 4  
**Endpoints Públicos:** 0

---

### **16. Módulo: Solicitud Cita** (`gestion_solicitud_cita`)
**Ruta Base:** `/api/gestion-solicitud-cita`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/` | POST | crear | `gestion_solicitud_cita` + `crear` | cliente | Crear solicitud de cita |
| `/mis-solicitudes` | GET | leer | `gestion_solicitud_cita` + `leer` | cliente | Ver mis solicitudes |
| `/` | GET | leer | `gestion_solicitud_cita` + `leer` | administrador, empleado | Listar solicitudes |
| `/:id/gestionar` | PUT | actualizar | `gestion_solicitud_cita` + `actualizar` | administrador, empleado | Gestionar solicitud |

**Total Endpoints:** 4  
**Endpoints Protegidos:** 4  
**Endpoints Públicos:** 0

**Nota:** Cliente puede crear y ver solo sus propias solicitudes.

---

### **17. Módulo: Detalle Orden** (`gestion_detalles_orden`)
**Ruta Base:** `/api/detalles-orden`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/orden/:idOrden` | GET | leer | `gestion_detalles_orden` + `leer` | administrador, empleado, cliente | Ver detalles de orden |
| `/orden/:idOrden` | POST | crear | `gestion_detalles_orden` + `crear` | administrador, empleado | Crear detalle |
| `/:id/estado` | PUT | actualizar | `gestion_detalles_orden` + `actualizar` | administrador, empleado | Actualizar estado |

**Total Endpoints:** 3  
**Endpoints Protegidos:** 3  
**Endpoints Públicos:** 0

**Nota:** Cliente puede ver solo detalles de sus propias órdenes.

---

### **18. Módulo: Detalle Proceso** (`gestion_detalles_procesos`)
**Ruta Base:** `/api/detalles-procesos`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/detalle/:idDetalle` | GET | leer | `gestion_detalles_procesos` + `leer` | administrador, empleado, cliente | Ver procesos de detalle |
| `/detalle/:idDetalle` | POST | crear | `gestion_detalles_procesos` + `crear` | administrador, empleado | Crear proceso |
| `/:id` | PUT | actualizar | `gestion_detalles_procesos` + `actualizar` | administrador, empleado | Actualizar proceso |
| `/:id` | DELETE | eliminar | `gestion_detalles_procesos` + `eliminar` | administrador, empleado | Eliminar proceso |

**Total Endpoints:** 4  
**Endpoints Protegidos:** 4  
**Endpoints Públicos:** 0

**Nota:** Cliente puede ver solo procesos de sus propias órdenes.

---

### **19. Módulo: Servicio Proceso** (`gestion_servicios_procesos`)
**Ruta Base:** `/api/gestion-servicios-procesos`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/:idServicio/procesos` | GET | leer | `gestion_servicios_procesos` + `leer` | administrador, empleado, cliente | Ver procesos de servicio |
| `/:idServicio/procesos` | POST | crear | `gestion_servicios_procesos` + `crear` | administrador, empleado | Agregar proceso |
| `/:idServicio/procesos/:idProceso` | DELETE | eliminar | `gestion_servicios_procesos` + `eliminar` | administrador, empleado | Eliminar proceso |

**Total Endpoints:** 3  
**Endpoints Protegidos:** 3  
**Endpoints Públicos:** 0

**Nota:** Cliente puede ver solo procesos de servicios.

---

### **20. Módulo: Formularios Dinámicos** (`gestion_formularios`)
**Ruta Base:** `/api/formularios-dinamicos`

| Endpoint | Método | Acción | Permiso Requerido | Roles Actuales | Notas |
|----------|--------|--------|-------------------|----------------|-------|
| `/validar/:idServicio` | POST | - | ❌ Público | - | Validar formulario |
| `/servicios` | GET | leer | ❌ Público | - | Listar servicios con validación |
| `/verificar/:nombreServicio/:nombreCampo` | GET | leer | ❌ Público | - | Verificar campo obligatorio |
| `/campos/:nombreServicio` | GET | leer | ❌ Público | - | Obtener campos obligatorios |
| `/configuracion` | GET | leer | ❌ Público | - | Obtener configuración |

**Total Endpoints:** 5  
**Endpoints Protegidos:** 0  
**Endpoints Públicos:** 5

**Nota:** Todos los endpoints son públicos (no requieren autenticación). No se incluirá en el sistema de permisos.

---

## 📊 Resumen por Módulo

| # | Módulo | Endpoints | Protegidos | Públicos | Acciones Disponibles |
|---|--------|-----------|------------|----------|---------------------|
| 1 | **usuarios** | 10 | 6 | 4 | crear, leer, actualizar, eliminar |
| 2 | **empleados** | 7 | 7 | 0 | crear, leer, actualizar, eliminar |
| 3 | **clientes** | 7 | 7 | 0 | crear, leer, actualizar, eliminar |
| 4 | **empresas** | 3 | 3 | 0 | crear, leer (❌ falta actualizar, eliminar) |
| 5 | **solicitudes** | 14 | 14 | 0 | crear, leer, actualizar, eliminar |
| 6 | **citas** | 9 | 9 | 0 | crear, leer, actualizar, eliminar |
| 7 | **pagos** | 9 | 9 | 0 | crear, leer, actualizar (❌ falta eliminar) |
| 8 | **seguimiento** | 7 | 7 | 0 | crear, leer, actualizar, eliminar |
| 9 | **servicios** | 10 | 5 | 5 | leer, actualizar (❌ falta crear, eliminar) |
| 10 | **dashboard** | 8 | 8 | 0 | leer (❌ solo lectura, no tiene crear/actualizar/eliminar) |
| 11 | **roles** | 6 | 6 | 0 | crear, leer, actualizar, eliminar |
| 12 | **permisos** | 5 | 5 | 0 | crear, leer, actualizar, eliminar |
| 13 | **privilegios** | 5 | 5 | 0 | crear, leer, actualizar, eliminar |
| 14 | **archivos** | 3 | 3 | 0 | crear, leer (❌ falta actualizar, eliminar) |
| 15 | **tipo_archivos** | 4 | 4 | 0 | crear, leer, actualizar, eliminar |
| 16 | **solicitud_cita** | 4 | 4 | 0 | crear, leer, actualizar (❌ falta eliminar) |
| 17 | **detalles_orden** | 3 | 3 | 0 | crear, leer, actualizar (❌ falta eliminar) |
| 18 | **detalles_procesos** | 4 | 4 | 0 | crear, leer, actualizar, eliminar |
| 19 | **servicios_procesos** | 3 | 3 | 0 | crear, leer, eliminar (❌ falta actualizar) |
| 20 | **formularios** | 5 | 0 | 5 | ❌ Público (no se incluye en permisos) |

**Total:** 20 módulos, ~130 endpoints

---

## 🔍 Análisis de Módulos en `roleTransformations.js`

### **Módulos Definidos Actualmente:**
```javascript
const MODULOS_DISPONIBLES = [
  'usuarios', 'empleados', 'clientes', 'empresas', 'servicios',
  'solicitudes', 'citas', 'pagos', 'roles', 'permisos', 'privilegios',
  'seguimiento', 'archivos', 'tipo_archivos', 'formularios',
  'detalles_orden', 'detalles_procesos', 'servicios_procesos'
];
```

### **Módulos Reales en el Proyecto:**
1. ✅ `usuarios` - Existe
2. ✅ `empleados` - Existe
3. ✅ `clientes` - Existe
4. ✅ `empresas` - Existe
5. ✅ `servicios` - Existe
6. ✅ `solicitudes` - Existe
7. ✅ `citas` - Existe
8. ✅ `pagos` - Existe
9. ✅ `roles` - Existe
10. ✅ `permisos` - Existe
11. ✅ `privilegios` - Existe
12. ✅ `seguimiento` - Existe
13. ✅ `archivos` - Existe
14. ✅ `tipo_archivos` - Existe
15. ⚠️ `formularios` - Existe pero es público (no requiere permisos)
16. ✅ `detalles_orden` - Existe
17. ✅ `detalles_procesos` - Existe
18. ✅ `servicios_procesos` - Existe
19. ❌ **FALTA:** `dashboard` - Existe pero no está en la lista
20. ❌ **FALTA:** `solicitud_cita` - Existe pero no está en la lista

---

## ✅ Correcciones Necesarias

### **1. Agregar Módulos Faltantes a `roleTransformations.js`**

**Módulos a Agregar:**
- `dashboard` - Módulo de dashboard administrativo
- `solicitud_cita` - Módulo de solicitudes de cita (diferente de solicitudes)

**Módulos a Considerar:**
- `formularios` - Actualmente público, pero podría requerir permisos en el futuro

---

### **2. Módulos con Acciones Faltantes**

#### **Empresas** (`gestion_empresas`)
- ❌ Falta: `actualizar` (PUT `/:id`)
- ❌ Falta: `eliminar` (DELETE `/:id`)

#### **Archivos** (`gestion_archivos`)
- ❌ Falta: `actualizar` (PUT `/:id`)
- ❌ Falta: `eliminar` (DELETE `/:id`)

#### **Pagos** (`gestion_pagos`)
- ❌ Falta: `eliminar` (DELETE `/:id`) - ¿Se deben poder eliminar pagos?

#### **Servicios** (`gestion_servicios`)
- ❌ Falta: `crear` (POST `/`) - ¿Se deben poder crear servicios?
- ❌ Falta: `eliminar` (DELETE `/:id`) - ¿Se deben poder eliminar servicios?

#### **Dashboard** (`gestion_dashboard`)
- ⚠️ Solo tiene `leer` - Esto es correcto (solo lectura)

#### **Solicitud Cita** (`gestion_solicitud_cita`)
- ❌ Falta: `eliminar` (DELETE `/:id`) - ¿Se deben poder eliminar solicitudes de cita?

#### **Detalle Orden** (`gestion_detalles_orden`)
- ❌ Falta: `eliminar` (DELETE `/:id`) - ¿Se deben poder eliminar detalles?

#### **Servicio Proceso** (`gestion_servicios_procesos`)
- ❌ Falta: `actualizar` (PUT `/:id`) - ¿Se deben poder actualizar procesos?

---

## 📝 Mapeo Final de Permisos

### **Módulos que Requieren Permisos Granulares:**

| Módulo | Crear | Leer | Actualizar | Eliminar | Notas |
|--------|-------|------|------------|----------|-------|
| **usuarios** | ✅ | ✅ | ✅ | ✅ | Completo |
| **empleados** | ✅ | ✅ | ✅ | ✅ | Completo |
| **clientes** | ✅ | ✅ | ✅ | ✅ | Completo |
| **empresas** | ✅ | ✅ | ⚠️ | ⚠️ | Falta actualizar/eliminar |
| **solicitudes** | ✅ | ✅ | ✅ | ✅ | Completo |
| **citas** | ✅ | ✅ | ✅ | ✅ | Completo |
| **pagos** | ✅ | ✅ | ✅ | ⚠️ | Falta eliminar |
| **seguimiento** | ✅ | ✅ | ✅ | ✅ | Completo |
| **servicios** | ⚠️ | ✅ | ✅ | ⚠️ | Falta crear/eliminar (¿necesarios?) |
| **dashboard** | ❌ | ✅ | ❌ | ❌ | Solo lectura (correcto) |
| **roles** | ✅ | ✅ | ✅ | ✅ | Completo |
| **permisos** | ✅ | ✅ | ✅ | ✅ | Completo |
| **privilegios** | ✅ | ✅ | ✅ | ✅ | Completo |
| **archivos** | ✅ | ✅ | ⚠️ | ⚠️ | Falta actualizar/eliminar |
| **tipo_archivos** | ✅ | ✅ | ✅ | ✅ | Completo |
| **solicitud_cita** | ✅ | ✅ | ✅ | ⚠️ | Falta eliminar |
| **detalles_orden** | ✅ | ✅ | ✅ | ⚠️ | Falta eliminar |
| **detalles_procesos** | ✅ | ✅ | ✅ | ✅ | Completo |
| **servicios_procesos** | ✅ | ✅ | ⚠️ | ✅ | Falta actualizar |
| **formularios** | ❌ | ❌ | ❌ | ❌ | Público (no requiere permisos) |

---

## 🎯 Recomendaciones

### **1. Actualizar `roleTransformations.js`**

Agregar módulos faltantes:
```javascript
const MODULOS_DISPONIBLES = [
  'usuarios', 'empleados', 'clientes', 'empresas', 'servicios',
  'solicitudes', 'citas', 'pagos', 'roles', 'permisos', 'privilegios',
  'seguimiento', 'archivos', 'tipo_archivos', 'formularios',
  'detalles_orden', 'detalles_procesos', 'servicios_procesos',
  'dashboard',        // ← NUEVO
  'solicitud_cita'    // ← NUEVO
];
```

### **2. Considerar Acciones Faltantes**

**Opciones:**
- **Opción A:** Implementar acciones faltantes (actualizar/eliminar para empresas, archivos, etc.)
- **Opción B:** Dejar como están (no todas las entidades necesitan todas las acciones)
- **Opción C:** Documentar qué acciones están disponibles y cuáles no

**Recomendación:** Opción C (documentar) - No todas las entidades necesitan todas las acciones.

### **3. Módulos Públicos**

**Formularios Dinámicos:**
- Actualmente público (no requiere autenticación)
- **Recomendación:** Mantener público (son validaciones, no requieren permisos)

---

## ✅ Checklist de Módulos para Implementación

### **Módulos Listos para Implementación (Tienen todas las acciones):**
- ✅ usuarios
- ✅ empleados
- ✅ clientes
- ✅ solicitudes
- ✅ citas
- ✅ seguimiento
- ✅ roles
- ✅ permisos
- ✅ privilegios
- ✅ tipo_archivos
- ✅ detalles_procesos

### **Módulos con Acciones Parciales (Implementar solo las disponibles):**
- ⚠️ empresas (crear, leer)
- ⚠️ pagos (crear, leer, actualizar)
- ⚠️ servicios (leer, actualizar)
- ⚠️ dashboard (solo leer)
- ⚠️ archivos (crear, leer)
- ⚠️ solicitud_cita (crear, leer, actualizar)
- ⚠️ detalles_orden (crear, leer, actualizar)
- ⚠️ servicios_procesos (crear, leer, eliminar)

### **Módulos Públicos (No Requieren Permisos):**
- ❌ formularios (público)

---

## 📋 Módulos Actualizados para `roleTransformations.js`

```javascript
// Módulos disponibles en el sistema (basados en la API real)
const MODULOS_DISPONIBLES = [
  'usuarios',           // ✅ Completo
  'empleados',          // ✅ Completo
  'clientes',           // ✅ Completo
  'empresas',           // ⚠️ Parcial (crear, leer)
  'servicios',          // ⚠️ Parcial (leer, actualizar)
  'solicitudes',        // ✅ Completo
  'citas',              // ✅ Completo
  'pagos',              // ⚠️ Parcial (crear, leer, actualizar)
  'roles',              // ✅ Completo
  'permisos',           // ✅ Completo
  'privilegios',        // ✅ Completo
  'seguimiento',        // ✅ Completo
  'archivos',           // ⚠️ Parcial (crear, leer)
  'tipo_archivos',      // ✅ Completo
  'solicitud_cita',     // ⚠️ Parcial (crear, leer, actualizar) - NUEVO
  'detalles_orden',     // ⚠️ Parcial (crear, leer, actualizar)
  'detalles_procesos',  // ✅ Completo
  'servicios_procesos', // ⚠️ Parcial (crear, leer, eliminar)
  'dashboard'           // ⚠️ Parcial (solo leer) - NUEVO
  // 'formularios' - Público, no se incluye
];
```

---

## 🚀 Próximos Pasos

1. **Actualizar `roleTransformations.js`** con módulos faltantes
2. **Documentar acciones disponibles** por módulo
3. **Implementar permisos** solo para acciones que existen
4. **Considerar acciones faltantes** según necesidades del negocio

---

**Documento creado:** Enero 2026  
**Última actualización:** Enero 2026  
**Versión:** 1.0

