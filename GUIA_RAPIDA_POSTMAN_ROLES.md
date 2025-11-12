# 🚀 Guía Rápida - Postman para Roles y Permisos

**Fecha:** Enero 2026  
**Tiempo estimado:** 5 minutos

---

## 📥 Paso 1: Importar la Colección

### **Opción 1: Importar desde Archivo JSON**

1. Abre Postman
2. Haz clic en **Import** (esquina superior izquierda)
3. Selecciona **File** → **Upload Files**
4. Busca y selecciona: `POSTMAN_COLLECTION_ROLES_PERMISOS.json`
5. Haz clic en **Import**

### **Opción 2: Importar desde URL (si está en un repositorio)**

1. Abre Postman
2. Haz clic en **Import**
3. Selecciona **Link**
4. Pega la URL del archivo JSON
5. Haz clic en **Import**

---

## ⚙️ Paso 2: Configurar Variables de Entorno

### **Crear un Entorno en Postman:**

1. Haz clic en **Environments** (esquina superior izquierda)
2. Haz clic en **+** para crear un nuevo entorno
3. Nombra el entorno: `Registrack Local`
4. Agrega las siguientes variables:

| Variable | Valor Inicial | Descripción |
|----------|---------------|-------------|
| `base_url` | `http://localhost:3000` | URL base de la API |
| `token` | (vacío) | Token JWT (se llena automáticamente después del login) |
| `rol_id` | (vacío) | ID del rol para pruebas (se llena automáticamente después de crear un rol) |

5. Haz clic en **Save**

---

## 🔐 Paso 3: Obtener Token de Autenticación

### **Ejecutar el Login:**

1. Selecciona el entorno `Registrack Local`
2. Ve a la carpeta **Autenticación** → **Login**
3. **Modifica el Body** con tus credenciales:
   ```json
   {
     "correo": "admin@example.com",
     "contrasena": "tu_contraseña"
   }
   ```
4. Haz clic en **Send**
5. El token se guardará automáticamente en la variable `token`

**Nota:** El script de test automáticamente guarda el token en la variable de entorno.

---

## 🧪 Paso 4: Probar los Endpoints

### **Flujo Recomendado:**

1. **Obtener Todos los Roles**
   - Ve a **Roles** → **Obtener Todos los Roles**
   - Haz clic en **Send**
   - Verifica que obtengas la lista de roles

2. **Crear un Rol**
   - Ve a **Roles** → **Crear Rol**
   - **Modifica el Body** si es necesario
   - Haz clic en **Send**
   - El `rol_id` se guardará automáticamente

3. **Obtener el Rol Creado**
   - Ve a **Roles** → **Obtener Rol por ID**
   - El `id` ya está configurado automáticamente
   - Haz clic en **Send**

4. **Actualizar el Rol**
   - Ve a **Roles** → **Actualizar Rol (Permisos)**
   - **Modifica el Body** con los nuevos permisos
   - Haz clic en **Send**

5. **Eliminar Permisos del Rol**
   - Ve a **Roles** → **Eliminar Permisos del Rol**
   - El body ya está configurado con `{ "permisos": {} }`
   - Haz clic en **Send**

6. **Eliminar el Rol**
   - Ve a **Roles** → **Eliminar Rol**
   - Haz clic en **Send**
   - Verifica que el rol se elimine correctamente

---

## 📋 Endpoints Disponibles

### **Autenticación:**
- ✅ **Login** - Obtener token JWT

### **Roles:**
- ✅ **Obtener Todos los Roles** - Lista todos los roles
- ✅ **Obtener Rol por ID** - Obtiene un rol específico
- ✅ **Crear Rol** - Crea un nuevo rol con permisos
- ✅ **Actualizar Rol (Nombre)** - Actualiza solo el nombre
- ✅ **Actualizar Rol (Estado)** - Actualiza solo el estado
- ✅ **Actualizar Rol (Permisos)** - Actualiza solo los permisos
- ✅ **Actualizar Rol (Todo)** - Actualiza nombre, estado y permisos
- ✅ **Eliminar Permisos del Rol** - Elimina todos los permisos
- ✅ **Cambiar Estado del Rol** - Cambia el estado (activo/inactivo)
- ✅ **Eliminar Rol** - Elimina un rol

### **Errores:**
- ✅ **Error - Eliminar Rol Básico** - Intenta eliminar un rol básico
- ✅ **Error - Rol No Encontrado** - Intenta obtener un rol que no existe
- ✅ **Error - Sin Permisos** - Intenta crear un rol sin permisos

---

## 🔧 Configuración Avanzada

### **Variables Automáticas:**

La colección incluye scripts que automáticamente:
- ✅ Guardan el `token` después del login
- ✅ Guardan el `rol_id` después de crear un rol

### **Tests Automáticos:**

Cada endpoint incluye tests que verifican:
- ✅ Status code correcto
- ✅ Estructura de respuesta válida
- ✅ Campos requeridos presentes

---

## 🐛 Solución de Problemas

### **Error: "Token inválido"**
**Solución:**
1. Verifica que hayas ejecutado el **Login** primero
2. Verifica que el token se haya guardado en la variable `token`
3. Verifica que el token no haya expirado (válido por 1 hora)

### **Error: "No tienes permiso"**
**Solución:**
1. Verifica que el usuario tenga el rol `administrador`
2. O verifica que el usuario tenga el permiso `gestion_roles` + `crear/leer/actualizar/eliminar`

### **Error: "Rol no encontrado"**
**Solución:**
1. Verifica que el `rol_id` sea correcto
2. Verifica que el rol exista en la base de datos
3. Ejecuta **Obtener Todos los Roles** para ver los IDs disponibles

### **Error: "No se puede eliminar el rol"**
**Solución:**
1. Verifica que el rol no sea un rol básico (`cliente`, `administrador`, `empleado`)
2. Verifica que el rol no tenga usuarios asignados
3. Reasigna los usuarios a otro rol antes de eliminar

---

## 📚 Documentación Adicional

- **Ejemplos Detallados:** Ver `POSTMAN_EJEMPLOS_ROLES_PERMISOS.md`
- **Funcionalidades:** Ver `RESPUESTA_FUNCIONALIDADES_ROLES.md`
- **Sistema de Permisos:** Ver `GUIA_SISTEMA_ROLES_PERMISOS_PRIVILEGIOS.md`

---

## ✅ Checklist de Pruebas

- [ ] Importar la colección de Postman
- [ ] Configurar variables de entorno
- [ ] Ejecutar login y verificar que el token se guarde
- [ ] Obtener todos los roles
- [ ] Crear un rol nuevo
- [ ] Obtener el rol creado por ID
- [ ] Actualizar el nombre del rol
- [ ] Actualizar el estado del rol
- [ ] Actualizar los permisos del rol
- [ ] Eliminar todos los permisos del rol
- [ ] Cambiar el estado del rol
- [ ] Eliminar el rol
- [ ] Probar casos de error (eliminar rol básico, rol no encontrado, etc.)

---

## 🎯 Ejemplo Rápido

### **1. Login:**
```
POST /api/auth/login
Body: { "correo": "admin@example.com", "contrasena": "password123" }
```

### **2. Crear Rol:**
```
POST /api/gestion-roles
Body: {
  "nombre": "empleado_lector",
  "estado": true,
  "permisos": {
    "usuarios": { "leer": true },
    "solicitudes": { "leer": true }
  }
}
```

### **3. Ver Rol:**
```
GET /api/gestion-roles/4
```

### **4. Actualizar Permisos:**
```
PUT /api/gestion-roles/4
Body: {
  "permisos": {
    "usuarios": { "leer": true, "crear": false },
    "citas": { "crear": true, "leer": true }
  }
}
```

### **5. Eliminar Rol:**
```
DELETE /api/gestion-roles/4
```

---

**Documento creado:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Listo para usar

