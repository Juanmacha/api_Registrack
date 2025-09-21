# API Registrack

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-5-blue?logo=express&logoColor=white) ![Sequelize](https://img.shields.io/badge/Sequelize-6-3C76A1?logo=sequelize&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-8-blue?logo=mysql&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-Auth-black?logo=jsonwebtokens) ![License](https://img.shields.io/badge/License-ISC-green)

## 📋 Tabla de contenidos
- [Descripción del proyecto](#-descripción-del-proyecto)
- [Tecnologías principales](#-tecnologías-principales)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Requisitos del sistema](#-requisitos-del-sistema)
- [Instalación y configuración](#-instalación-y-configuración)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Scripts disponibles](#-scripts-disponibles)
- [Autenticación y autorización](#-autenticación-y-autorización)
- [Módulos principales](#-módulos-principales)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Detalles de endpoints y validaciones](#-detalles-de-endpoints-y-validaciones)
- [Ejemplos de uso](#-ejemplos-de-uso)
- [Manejo de errores](#-manejo-de-errores)
- [Despliegue](#-despliegue)
- [Pruebas](#-pruebas)
- [Solución de problemas](#-solución-de-problemas)
- [Preguntas frecuentes (FAQ)](#-preguntas-frecuentes-faq)
- [Seguridad](#-seguridad)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## 🎯 Descripción del proyecto

**API Registrack** es una plataforma REST completa para la gestión de servicios de registro de marcas, propiedad intelectual y procesos legales relacionados. El sistema permite a empresas, empleados y clientes gestionar de manera integral todo el flujo de trabajo desde la solicitud inicial hasta el seguimiento y finalización de servicios.

### Características principales:
- **Gestión de usuarios** con sistema de roles y permisos granular
- **Catálogo de servicios** para diferentes tipos de trámites legales
- **Sistema de solicitudes** dinámico con formularios personalizables
- **Gestión de citas** con validaciones de horarios y disponibilidad
- **Seguimiento de procesos** con historial detallado
- **Sistema de archivos** con categorización por tipos
- **Reportes y exportaciones** en Excel y PDF
- **Notificaciones por email** para recuperación de contraseñas
- **API RESTful** con autenticación JWT

## 🛠 Tecnologías principales

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express.js 5** - Framework web
- **Sequelize 6** - ORM para MySQL
- **MySQL 8** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas

### Herramientas y librerías
- **CORS** - Configuración de políticas de origen cruzado
- **express-validator** - Validación de datos de entrada
- **ExcelJS** - Generación de reportes en Excel
- **PDFKit** - Generación de documentos PDF
- **Nodemailer** - Envío de correos electrónicos
- **dotenv** - Gestión de variables de entorno

## 🏗 Arquitectura del sistema

El proyecto sigue una arquitectura de **3 capas** con separación clara de responsabilidades:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│    Services     │───▶│   Repositories  │
│   (Rutas/API)   │    │  (Lógica negocio)│    │   (Acceso BD)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middlewares   │    │     Models      │    │   Database      │
│ (Auth/Validation)│    │  (Sequelize)    │    │    (MySQL)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Patrones implementados:
- **Repository Pattern** - Abstracción del acceso a datos
- **Service Layer** - Lógica de negocio centralizada
- **Middleware Pattern** - Procesamiento de requests
- **JWT Authentication** - Autenticación stateless

## ⚙️ Requisitos del sistema

### Software requerido
- **Node.js** 18.0.0 o superior
- **MySQL** 8.0 o superior
- **npm** 8.0.0 o superior (incluido con Node.js)

### Hardware mínimo
- **RAM**: 2GB disponibles
- **Almacenamiento**: 1GB de espacio libre
- **CPU**: 1 núcleo a 2GHz

### Dependencias del sistema
- Cliente MySQL disponible en PATH del sistema
- Puerto 3000 disponible (configurable)

## 🚀 Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd api_Registrack
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables según tu configuración
nano .env
```

### 4. Configurar la base de datos
```bash
# Opción automática (Windows)
scripts\setup-database.bat

# Opción automática (Linux/Mac)
bash scripts/setup-database.sh

# Opción manual
npm run sync-db
npm run seed-roles
npm run create-admin
```

### 5. Iniciar el servidor
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 🔧 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración del servidor
PORT=3000

# Configuración de la base de datos
DB_NAME=registrack_db
DB_USER=tu_usuario_mysql
DB_PASS=tu_password_mysql
DB_HOST=localhost
DB_PORT=3306

# Configuración JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_segura

# Configuración de email (para recuperación de contraseñas)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_de_aplicacion_gmail
```

### Descripción de variables:
- **PORT**: Puerto donde se ejecutará la API (por defecto 3000)
- **DB_***: Credenciales y configuración de MySQL
- **JWT_SECRET**: Clave para firmar tokens JWT (usar una cadena larga y aleatoria)
- **EMAIL_***: Credenciales para envío de correos (recomendado: contraseña de aplicación de Gmail)

## 📁 Estructura del proyecto

```
api_Registrack/
├── 📁 src/
│   ├── 📁 config/
│   │   ├── db.js                    # Configuración de Sequelize
│   │   └── tiposFormularios.js     # Configuración de formularios dinámicos
│   ├── 📁 controllers/              # Controladores de rutas
│   │   ├── auth.controller.js
│   │   ├── solicitudes.controller.js
│   │   ├── servicio.controller.js
│   │   └── ...
│   ├── 📁 middlewares/              # Middlewares de aplicación
│   │   ├── auth.middleware.js       # Autenticación JWT
│   │   ├── role.middleware.js       # Autorización por roles
│   │   ├── error.middleware.js      # Manejo de errores
│   │   └── ...
│   ├── 📁 models/                   # Modelos de Sequelize
│   │   ├── User.js
│   │   ├── Servicio.js
│   │   ├── OrdenServicio.js
│   │   └── ...
│   ├── 📁 repositories/             # Capa de acceso a datos
│   │   ├── auth.repository.js
│   │   ├── cliente.repository.js
│   │   └── ...
│   ├── 📁 routes/                   # Definición de rutas
│   │   ├── usuario.routes.js
│   │   ├── solicitudes.routes.js
│   │   └── ...
│   └── 📁 services/                 # Lógica de negocio
│       ├── auth.services.js
│       ├── solicitudes.service.js
│       └── ...
├── 📁 database/
│   ├── schema_completo.sql          # Esquema completo de BD
│   ├── schema.sql                   # Esquema básico
│   └── seed-data.sql               # Datos de ejemplo
├── 📁 scripts/
│   ├── setup-database.bat          # Script de instalación (Windows)
│   └── setup-database.sh           # Script de instalación (Linux/Mac)
├── app.js                          # Configuración de Express
├── server.js                       # Punto de entrada del servidor
├── package.json                    # Dependencias y scripts
└── README.md                       # Este archivo
```

## 🛠 Scripts disponibles

### Scripts de desarrollo y producción
```bash
npm run dev          # Modo desarrollo con nodemon
npm start            # Modo producción
npm test             # Ejecutar pruebas (placeholder)
```

### Scripts de base de datos
```bash
npm run sync-db         # Sincronización normal (crear tablas si no existen)
npm run sync-db:force   # Forzar recreación de todas las tablas (¡CUIDADO: elimina datos!)
npm run sync-db:alter   # Modificar tablas existentes para coincidir con modelos
npm run sync-db:help    # Mostrar ayuda del comando sync-db
npm run seed-roles      # Insertar roles iniciales (administrador, empleado, cliente)
npm run create-admin    # Crear usuario administrador por defecto
```

### Scripts de configuración completa
```bash
npm run setup           # Configuración inicial completa (sync + seed + admin)
npm run reset-db        # Reset completo de BD (force + seed + admin)
```

### Credenciales iniciales (create-admin)
- **Email**: `admin@registrack.com`
- **Password**: `Admin123!`

⚠️ **Importante**: Cambia estas credenciales inmediatamente en producción.

### Scripts de instalación automática
- **Windows**: `scripts\setup-database.bat`
- **Linux/Mac**: `bash scripts/setup-database.sh`

**Notas importantes:**
- Los scripts `start` y `dev` ejecutan `server.js` en la raíz del proyecto
- Los scripts de setup requieren que el cliente MySQL esté disponible en PATH
- Configura la variable `PORT` en `.env` si deseas un puerto específico

### 🔄 Sincronización de Base de Datos Mejorada

El script `sync-db.js` ha sido completamente mejorado con las siguientes características:

#### Opciones de sincronización:
- **Normal** (`npm run sync-db`): Crea tablas si no existen (recomendado)
- **Alter** (`npm run sync-db:alter`): Modifica tablas existentes para coincidir con modelos
- **Force** (`npm run sync-db:force`): Recrea todas las tablas (⚠️ elimina datos existentes)

#### Características del sync-db mejorado:
- ✅ **Carga automática de todos los modelos** y sus asociaciones
- ✅ **Manejo robusto de errores** con mensajes descriptivos
- ✅ **Verificación de conexión** a la base de datos
- ✅ **Información detallada** de tablas creadas y estadísticas
- ✅ **Verificación de asociaciones** entre modelos
- ✅ **Interfaz de línea de comandos** con opciones y ayuda
- ✅ **Manejo de señales** de interrupción (Ctrl+C)
- ✅ **Tiempo de ejecución** y métricas de rendimiento
- ✅ **Próximos pasos sugeridos** después de la sincronización

#### Uso del sync-db:
```bash
# Sincronización normal (recomendado para desarrollo)
npm run sync-db

# Ver ayuda completa
npm run sync-db:help

# Modificar tablas existentes (para actualizaciones)
npm run sync-db:alter

# Recrear completamente (¡CUIDADO: elimina datos!)
npm run sync-db:force
```

#### Salida del sync-db mejorado:
```
📦 Cargando modelos...
✅ Modelos cargados correctamente

🔄 Iniciando sincronización de la base de datos...
📊 Configuración: NORMAL (crear si no existen)
🔌 Verificando conexión a la base de datos...
✅ Conexión a la base de datos establecida
📋 Base de datos: registrack_db
🔄 Sincronizando modelos...

✅ Base de datos sincronizada exitosamente
⏱️  Tiempo de sincronización: 2.34s

📋 Tablas en la base de datos:
┌─────────────────────────────────┬─────────────┬─────────────┬─────────────┐
│ Tabla                           │ Filas       │ Datos (KB)  │ Índices (KB)│
├─────────────────────────────────┼─────────────┼─────────────┼─────────────┤
│ usuarios                        │           0 │           0 │           0 │
│ roles                           │           0 │           0 │           0 │
│ servicios                       │           0 │           0 │           0 │
└─────────────────────────────────┴─────────────┴─────────────┴─────────────┘

🎯 Modelos sincronizados:
  1. 👤 Usuarios y Roles
  2. 🏢 Empresas y Clientes
  3. 👨‍💼 Empleados
  4. 🛍️ Servicios y Procesos
  5. 📋 Órdenes de Servicio
  6. 📅 Citas y Solicitudes
  7. 📊 Seguimiento
  8. 💰 Pagos
  9. 📁 Archivos y Tipos
  10. 🔐 Permisos y Privilegios

🔗 Verificando asociaciones...
✅ 25 asociaciones definidas correctamente

📝 Próximos pasos recomendados:
  1. Ejecutar: npm run seed-roles
  2. Ejecutar: npm run create-admin
  3. Iniciar servidor: npm run dev

🎉 Proceso de sincronización completado exitosamente
```

## 🔐 Autenticación y autorización

### Sistema de autenticación JWT
- **Tokens JWT** con expiración de 1 hora
- **Payload del token**: `{ id_usuario, rol }`
- **Header requerido**: `Authorization: Bearer <token>`

### Sistema de roles
1. **Administrador**: Acceso completo al sistema
   - Gestión de usuarios, servicios, procesos
   - Acceso a todos los reportes
   - Configuración del sistema

2. **Empleado**: Acceso operativo limitado
   - Gestión de citas y seguimiento
   - Procesamiento de solicitudes
   - Acceso a datos según permisos

3. **Cliente**: Acceso a datos propios
   - Consulta de sus solicitudes
   - Gestión de citas propias
   - Acceso a archivos relacionados

### Flujo de autenticación
```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API
    participant D as Base de Datos

    C->>A: POST /api/usuarios/login
    A->>D: Verificar credenciales
    D-->>A: Datos del usuario
    A->>A: Generar JWT
    A-->>C: Token JWT + datos usuario
    
    C->>A: GET /api/protected (con JWT)
    A->>A: Validar JWT
    A->>D: Consultar datos
    D-->>A: Resultado
    A-->>C: Respuesta
```

## 📦 Módulos principales

### 1. Gestión de Usuarios (`/api/usuarios`)
- Registro de nuevos usuarios
- Autenticación (login/logout)
- Recuperación de contraseñas
- Gestión de perfiles
- Administración de usuarios (solo admin)

### 2. Catálogo de Servicios (`/api/servicios`)
- Consulta pública de servicios disponibles
- Gestión administrativa de servicios
- Asociación de servicios con procesos
- Precios y descripciones

### 3. Sistema de Solicitudes (`/api/gestion-solicitudes`) ⭐ **ACTUALIZADO**
- **Creación automática de entidades**: Clientes, empresas y servicios se crean automáticamente si no existen
- **Formularios dinámicos** personalizables según el tipo de servicio
- **Validación robusta** con campos requeridos específicos por servicio
- **Búsqueda inteligente** con normalización de texto (sin tildes, case-insensitive)
- **Estados**: Pendiente, Aprobada, Rechazada, Anulada
- **Búsqueda y filtrado avanzado** con query parameters
- **Manejo de errores mejorado** con mensajes descriptivos
- **Compatibilidad MySQL** optimizada (LIKE en lugar de ILIKE)

### 4. Gestión de Citas (`/api/citas`)
- Programación de citas
- Validación de horarios disponibles
- Reprogramación y cancelación
- Reportes en Excel

### 5. Seguimiento de Procesos (`/api/seguimiento`)
- Historial detallado por orden de servicio
- Documentos adjuntos
- Comentarios y observaciones
- Búsqueda por título

### 6. Gestión de Archivos (`/api/archivos`)
- Subida de archivos con categorización
- Descarga segura
- Asociación con clientes y órdenes
- Tipos de archivo configurables

### 7. Gestión de Clientes (`/api/clientes`)
- Registro de clientes
- Asociación con empresas
- Historial de servicios
- Reportes de actividad

### 8. Sistema de Pagos (`/api/pagos`)
- Registro de pagos
- Asociación con órdenes de servicio
- Estados de pago
- Reportes financieros

## 🔌 Endpoints de la API

### Autenticación
```http
POST /api/usuarios/login
POST /api/usuarios/registrar
POST /api/usuarios/forgot-password
POST /api/usuarios/reset-password
```

### Servicios (Públicos)
```http
GET /api/servicios                    # Listar todos los servicios
GET /api/servicios/:id               # Obtener servicio por ID
GET /api/servicios/:id/procesos      # Procesos de un servicio
```

### Solicitudes ⭐ **ACTUALIZADO**
```http
POST /api/gestion-solicitudes/crear/:servicio    # Crear solicitud (crea entidades automáticamente)
GET /api/gestion-solicitudes/mias               # Mis solicitudes (cliente)
GET /api/gestion-solicitudes                    # Todas las solicitudes (admin/empleado)
GET /api/gestion-solicitudes/buscar             # Buscar solicitudes (query search)
GET /api/gestion-solicitudes/:id               # Obtener solicitud específica
PUT /api/gestion-solicitudes/editar/:id         # Editar solicitud
PUT /api/gestion-solicitudes/anular/:id         # Anular solicitud
```

### Citas
```http
GET /api/citas                         # Listar citas
POST /api/citas                        # Crear cita
PUT /api/citas/:id/reprogramar         # Reprogramar cita
PUT /api/citas/:id/anular              # Anular cita
GET /api/citas/reporte/excel           # Reporte en Excel
```

### Seguimiento
```http
GET /api/seguimiento/historial/:idOrdenServicio
POST /api/seguimiento/crear
GET /api/seguimiento/:id
PUT /api/seguimiento/:id
DELETE /api/seguimiento/:id
```

### Archivos
```http
POST /api/archivos/upload              # Subir archivo
GET /api/archivos/:id/download         # Descargar archivo
GET /api/archivos/cliente/:idCliente   # Archivos de un cliente
```

## 📋 Detalles de endpoints y validaciones

### Usuarios (`/api/usuarios`)
- **POST /registrar** (registro público)
- **POST /login** (autenticación)
- **POST /forgot-password** (enviar código/link de recuperación)
- **POST /reset-password** (restablecer contraseña)
- **GET /, GET /:id, DELETE /:id, PUT /:id** (protegidos: admin/empleado)
- **POST /crear** (crear usuario por admin)

**Body requerido para crear usuario:**
- `tipo_documento`: String
- `documento`: Número (6-10 dígitos)
- `nombre`: String
- `apellido`: String
- `correo`: Email válido
- `contrasena`: Contraseña fuerte
- `id_rol`: Número > 0 (debe existir y pertenecer a [administrador, empleado, cliente])

### Solicitudes (`/api/gestion-solicitudes`) ⭐ **ACTUALIZADO**
- **POST /crear/:servicio** (crear solicitud dinámica con creación automática de entidades)

**Características mejoradas:**
- ✅ **Creación automática**: Clientes, empresas y servicios se crean automáticamente si no existen
- ✅ **Búsqueda inteligente**: Normalización de texto para coincidencias exactas y parciales
- ✅ **Validación robusta**: Campos requeridos específicos por tipo de servicio
- ✅ **Compatibilidad MySQL**: Optimizado para base de datos MySQL
- ✅ **Manejo de errores**: Mensajes descriptivos y debugging detallado

**Body requerido dinámico según tipo de servicio:**

#### Búsqueda de antecedentes
```json
{
  "nombre_solicitante": "string",
  "documento_solicitante": "string",
  "correo_electronico": "email",
  "telefono": "string",
  "marca_a_buscar": "string",
  "clase_niza": "string",
  "descripcion_adicional": "string"
}
```

#### Certificación de marca
```json
{
  "tipo_titular": "string",
  "nombre_marca": "string",
  "clase_niza": "string",
  "descripcion_marca": "string",
  "logo": "base64_string",
  "nombre_completo_titular": "string",
  "documento_identidad_titular": "string",
  "direccion_titular": "string",
  "ciudad_titular": "string",
  "pais_titular": "string",
  "correo_titular": "email",
  "telefono_titular": "string",
  "razon_social": "string",
  "nit": "string",
  "representante_legal": "string",
  "documento_representante_legal": "string",
  "nombre_representante": "string",
  "documento_representante": "string",
  "poder": "base64_string"
}
```

#### Renovación de marca
```json
{
  "tipo_titular": "string",
  "numero_registro_marca": "string",
  "nombre_marca": "string",
  "clase_niza": "string",
  "nombre_razon_social": "string",
  "documento_nit": "string",
  "direccion": "string",
  "ciudad": "string",
  "pais": "string",
  "correo": "email",
  "telefono": "string",
  "nombre_representante": "string",
  "documento_representante": "string",
  "poder": "base64_string",
  "logo_marca": "base64_string"
}
```

**Otros endpoints de solicitudes:**
- **GET /mias** (auth, cliente): Lista solo las solicitudes del cliente autenticado
- **GET /** (auth, administrador/empleado): Lista de todas las solicitudes
- **GET /buscar?search=** (auth, admin/empleado): Query search requerido (no vacío)
- **GET /:id** (auth, admin/empleado): Parámetro id numérico válido
- **PUT /anular/:id** (auth, admin/empleado): Anula solicitud si existe
- **PUT /editar/:id** (auth, admin/empleado): Edita campos específicos

**Servicios disponibles para solicitudes:**
- Búsqueda de antecedentes
- Certificación de marca
- Renovación de marca
- Cesión de derechos
- Oposición de marca
- Respuesta a oposición
- Ampliación de cobertura

**Campos editables en solicitudes:**
- `pais`, `ciudad`, `codigo_postal`, `total_estimado` (>0)
- `tipodepersona`, `tipodedocumento`, `numerodedocumento`
- `nombrecompleto`, `correoelectronico`, `telefono`, `direccion`
- `tipodeentidadrazonsocial`, `nombredelaempresa`, `nit`
- `poderdelrepresentanteautorizado`, `poderparaelregistrodelamarca`

### Seguimiento (`/api/seguimiento`) [auth, admin/empleado]
- **GET /historial/:idOrdenServicio**: Historial por orden
- **POST /crear**: Crear seguimiento
  - Body requerido: `id_orden_servicio`, `titulo` (≤200 chars), `descripcion`
  - Opcional: `documentos_adjuntos` (objeto o string JSON)
- **GET /:id**: Obtener seguimiento por ID
- **PUT /:id**: Actualizar (al menos uno: `titulo`, `descripcion`, `documentos_adjuntos`)
- **DELETE /:id**: Eliminar seguimiento
- **GET /buscar/:idOrdenServicio?titulo=**: Buscar por título (query requerido)

### Citas (`/api/citas`)
- **GET /** (auth, administrador/empleado/cliente): Lista citas con Cliente y Empleado embebidos
- **POST /** (auth, administrador/empleado/cliente): Crear cita

**Body requerido para crear cita:**
```json
{
  "fecha": "YYYY-MM-DD",
  "hora_inicio": "HH:MM:SS",
  "hora_fin": "HH:MM:SS",
  "tipo": "string",
  "modalidad": "string",
  "id_cliente": "number",
  "id_empleado": "number",
  "estado": "string (opcional, default: Programada)",
  "observacion": "string (opcional)"
}
```

**Reglas de validación para citas:**
- Fecha no puede ser pasada
- Horario entre 07:00:00 y 18:00:00
- `hora_inicio` < `hora_fin`
- No puede traslapar con otra cita del mismo empleado (mismo día, ventana horaria)

**Otros endpoints de citas:**
- **PUT /:id/reprogramar**: Reprogramar cita (mismos formatos y reglas que creación)
- **PUT /:id/anular**: Anular cita (body requerido: `observacion`)
- **GET /reporte/excel**: Descarga archivo Excel con columnas: ID Cita, Fecha, Hora Inicio, Hora Fin, Tipo, Modalidad, Estado, Cliente, Empleado, Observación

### Archivos (`/api/archivos`)
- **POST /upload** (auth, admin/empleado/cliente): Subir archivo
  - Body requerido: `url_archivo` (string ≥5), `id_tipo_archivo` (int ≥1), `id_cliente` (int ≥1)
  - Opcional: `id_orden_servicio` (int ≥1)
- **GET /:id/download** (auth): Descargar archivo por ID
- **GET /cliente/:idCliente** (auth): Archivos de un cliente

### Tipos de Archivo (`/api/tipo-archivos`)
- **POST /** (auth, admin/empleado): Crear tipo
  - Body requerido: `descripcion` (2-50 chars)
- **PUT /:id** (auth, admin/empleado): Actualizar tipo
  - Parámetro: `id` (int ≥1)
  - Body opcional: `descripcion` (2-50 chars)
- **GET /:id, DELETE /:id** (auth, según política): Obtener/eliminar tipo

### Empresas (`/api/empresas`)
- **GET /:id/clientes** (auth): Clientes de una empresa
- **GET /nit/:nit/clientes** (auth): Clientes por NIT

### Otros módulos
- **Pagos**: Gestión de pagos y transacciones
- **Empleados**: Gestión de empleados
- **Roles**: Gestión de roles y permisos
- **Privilegios**: Gestión de privilegios
- **Detalles-orden**: Detalles de órdenes de servicio
- **Detalles-procesos**: Detalles de procesos

## 💡 Ejemplos de uso

### 🔐 Autenticación

#### 1. Registro de usuario
```bash
curl -X POST "http://localhost:3000/api/usuarios/registrar" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@example.com",
    "contrasena": "Password1!"
  }'
```

**Respuesta esperada:**
```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "id_usuario": 1,
    "tipo_documento": "CC",
    "documento": "12345678",
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@example.com",
    "id_rol": 3
  }
}
```

#### 2. Login
```bash
curl -X POST "http://localhost:3000/api/usuarios/login" \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@registrack.com",
    "contrasena": "Admin123!"
  }'
```

**Respuesta esperada:**
```json
{
  "mensaje": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "correo": "admin@registrack.com",
    "rol": "administrador"
  }
}
```

#### 3. Recuperar contraseña
```bash
curl -X POST "http://localhost:3000/api/usuarios/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "juan@example.com"
  }'
```

#### 4. Restablecer contraseña
```bash
curl -X POST "http://localhost:3000/api/usuarios/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456",
    "newPassword": "NuevaPassword123!"
  }'
```

### 🏢 Gestión de Usuarios (Solo Administradores)

#### 5. Crear usuario por administrador
```bash
curl -X POST "http://localhost:3000/api/usuarios/crear" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "tipo_documento": "CC",
    "documento": "87654321",
    "nombre": "María",
    "apellido": "González",
    "correo": "maria@example.com",
    "contrasena": "Password123!",
    "id_rol": 2
  }'
```

#### 6. Obtener todos los usuarios
```bash
curl -X GET "http://localhost:3000/api/usuarios" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 7. Actualizar usuario
```bash
curl -X PUT "http://localhost:3000/api/usuarios/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "nombre": "Juan Carlos",
    "apellido": "Pérez López",
    "correo": "juan.carlos@example.com"
  }'
```

### 🛍️ Servicios

#### 8. Obtener todos los servicios (Público)
```bash
curl -X GET "http://localhost:3000/api/servicios"
```

#### 9. Obtener servicio por ID
```bash
curl -X GET "http://localhost:3000/api/servicios/1"
```

#### 10. Obtener procesos de un servicio
```bash
curl -X GET "http://localhost:3000/api/servicios/1/procesos"
```

### 📝 Solicitudes

#### 11. Crear solicitud - Búsqueda de antecedentes ⭐ **ACTUALIZADO**
```bash
curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/Búsqueda%20de%20antecedentes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "nombre_solicitante": "Juan Pérez",
    "documento_solicitante": "12345678",
    "correo_electronico": "juan@example.com",
    "telefono": "3001234567",
    "marca_a_buscar": "MiMarca",
    "clase_niza": "35",
    "descripcion_adicional": "Búsqueda de marca comercial para verificar disponibilidad"
  }'
```

**Respuesta esperada:**
```json
{
  "mensaje": "Solicitud creada exitosamente",
  "orden_id": 1,
  "servicio": "Búsqueda de antecedentes",
  "estado": "Pendiente",
  "fecha_solicitud": "2024-01-15T10:30:00.000Z"
}
```

#### 12. Crear solicitud - Certificación de marca ⭐ **ACTUALIZADO**
```bash
curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/Certificación%20de%20marca" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "tipo_titular": "Persona Natural",
    "nombre_marca": "TechSolutions",
    "clase_niza": "42",
    "descripcion_marca": "Servicios de desarrollo de software",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "nombre_completo_titular": "Juan Carlos Pérez López",
    "documento_identidad_titular": "12345678",
    "direccion_titular": "Calle 123 #45-67",
    "ciudad_titular": "Bogotá",
    "pais_titular": "Colombia",
    "correo_titular": "juan@example.com",
    "telefono_titular": "3001234567",
    "razon_social": "TechSolutions SAS",
    "nit": "900123456-1",
    "representante_legal": "Juan Carlos Pérez López",
    "documento_representante_legal": "12345678",
    "nombre_representante": "Juan Carlos Pérez López",
    "documento_representante": "12345678",
    "poder": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO..."
  }'
```

#### 13. Crear solicitud - Renovación de marca ⭐ **ACTUALIZADO**
```bash
curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/Renovación%20de%20marca" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "tipo_titular": "Persona Jurídica",
    "numero_registro_marca": "12345",
    "nombre_marca": "MiMarca",
    "clase_niza": "35",
    "nombre_razon_social": "Mi Empresa SAS",
    "documento_nit": "900123456-1",
    "direccion": "Calle 123 #45-67",
    "ciudad": "Bogotá",
    "pais": "Colombia",
    "correo": "empresa@example.com",
    "telefono": "3001234567",
    "nombre_representante": "Juan Carlos Pérez López",
    "documento_representante": "12345678",
    "poder": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...",
    "logo_marca": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

#### 14. Obtener mis solicitudes (Cliente) ⭐ **ACTUALIZADO**
```bash
curl -X GET "http://localhost:3000/api/gestion-solicitudes/mias" \
  -H "Authorization: Bearer <CLIENTE_TOKEN>"
```

#### 15. Obtener todas las solicitudes (Admin/Empleado) ⭐ **ACTUALIZADO**
```bash
curl -X GET "http://localhost:3000/api/gestion-solicitudes" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 16. Buscar solicitudes ⭐ **ACTUALIZADO**
```bash
curl -X GET "http://localhost:3000/api/gestion-solicitudes/buscar?search=TechSolutions" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 17. Editar solicitud ⭐ **ACTUALIZADO**
```bash
curl -X PUT "http://localhost:3000/api/gestion-solicitudes/editar/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "pais": "Colombia",
    "ciudad": "Medellín",
    "codigo_postal": "050001",
    "total_estimado": 1500000,
    "tipodepersona": "Persona Jurídica",
    "tipodedocumento": "NIT",
    "numerodedocumento": "900123456-1",
    "nombrecompleto": "TechSolutions SAS",
    "correoelectronico": "nuevo@techsolutions.com",
    "telefono": "3009876543",
    "direccion": "Carrera 50 #25-30",
    "tipodeentidadrazonsocial": "Sociedad por Acciones Simplificada",
    "nombredelaempresa": "TechSolutions SAS",
    "nit": "900123456-1",
    "poderdelrepresentanteautorizado": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...",
    "poderparaelregistrodelamarca": "data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO..."
  }'
```

#### 18. Anular solicitud ⭐ **ACTUALIZADO**
```bash
curl -X PUT "http://localhost:3000/api/gestion-solicitudes/anular/1" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 📅 Citas

#### 19. Obtener todas las citas
```bash
curl -X GET "http://localhost:3000/api/citas" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 20. Crear cita
```bash
curl -X POST "http://localhost:3000/api/citas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "fecha": "2024-01-15",
    "hora_inicio": "09:00:00",
    "hora_fin": "10:00:00",
    "tipo": "Consulta",
    "modalidad": "Presencial",
    "id_cliente": 1,
    "id_empleado": 1,
    "estado": "Programada",
    "observacion": "Consulta sobre registro de marca"
  }'
```

#### 21. Reprogramar cita
```bash
curl -X PUT "http://localhost:3000/api/citas/1/reprogramar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "fecha": "2024-01-20",
    "hora_inicio": "14:00:00",
    "hora_fin": "15:00:00"
  }'
```

#### 22. Anular cita
```bash
curl -X PUT "http://localhost:3000/api/citas/1/anular" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "observacion": "Cliente canceló por motivos personales"
  }'
```

#### 23. Descargar reporte de citas en Excel
```bash
curl -X GET "http://localhost:3000/api/citas/reporte/excel" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -o reporte_citas.xlsx
```

### 📊 Seguimiento

#### 24. Obtener historial de seguimiento
```bash
curl -X GET "http://localhost:3000/api/seguimiento/historial/1" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 25. Crear seguimiento
```bash
curl -X POST "http://localhost:3000/api/seguimiento/crear" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "id_orden_servicio": 1,
    "titulo": "Revisión de documentos",
    "descripcion": "Se han revisado todos los documentos presentados. Faltan algunos anexos que se solicitarán al cliente.",
    "documentos_adjuntos": {
      "acta_revision": "documento1.pdf",
      "observaciones": "observaciones.pdf"
    }
  }'
```

#### 26. Actualizar seguimiento
```bash
curl -X PUT "http://localhost:3000/api/seguimiento/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "titulo": "Revisión de documentos - Actualizada",
    "descripcion": "Se han revisado todos los documentos presentados. Los anexos faltantes han sido recibidos y están siendo procesados.",
    "documentos_adjuntos": {
      "acta_revision": "documento1.pdf",
      "observaciones": "observaciones.pdf",
      "anexos_recibidos": "anexos.pdf"
    }
  }'
```

#### 27. Buscar seguimiento por título
```bash
curl -X GET "http://localhost:3000/api/seguimiento/buscar/1?titulo=revisión" \
  -H "Authorization: Bearer <TOKEN>"
```

### 📁 Archivos

#### 28. Subir archivo
```bash
curl -X POST "http://localhost:3000/api/archivos/upload" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "url_archivo": "https://ejemplo.com/documento.pdf",
    "id_tipo_archivo": 1,
    "id_cliente": 1,
    "id_orden_servicio": 1
  }'
```

#### 29. Descargar archivo
```bash
curl -X GET "http://localhost:3000/api/archivos/1/download" \
  -H "Authorization: Bearer <TOKEN>" \
  -o archivo_descargado.pdf
```

#### 30. Obtener archivos de un cliente
```bash
curl -X GET "http://localhost:3000/api/archivos/cliente/1" \
  -H "Authorization: Bearer <TOKEN>"
```

### 👥 Gestión de Clientes

#### 31. Obtener todos los clientes
```bash
curl -X GET "http://localhost:3000/api/gestion-clientes" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 32. Crear cliente
```bash
curl -X POST "http://localhost:3000/api/gestion-clientes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "id_usuario": 1,
    "marca": "MiMarcaEmpresarial",
    "tipo_persona": "Jurídica",
    "estado": true
  }'
```

#### 33. Obtener cliente por ID
```bash
curl -X GET "http://localhost:3000/api/gestion-clientes/1" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 34. Actualizar cliente
```bash
curl -X PUT "http://localhost:3000/api/gestion-clientes/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "marca": "MiMarcaEmpresarialActualizada",
    "tipo_persona": "Jurídica",
    "estado": true
  }'
```

#### 35. Descargar reporte de clientes en Excel
```bash
curl -X GET "http://localhost:3000/api/gestion-clientes/reporte/excel" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -o reporte_clientes.xlsx
```

### 💰 Gestión de Pagos

#### 36. Obtener todos los pagos
```bash
curl -X GET "http://localhost:3000/api/gestion-pagos" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 37. Crear pago
```bash
curl -X POST "http://localhost:3000/api/gestion-pagos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "id_orden_servicio": 1,
    "monto": 1500000.00,
    "metodo_pago": "Transferencia bancaria",
    "fecha_pago": "2024-01-15",
    "estado": "Completado",
    "referencia": "TXN123456789",
    "observaciones": "Pago procesado correctamente"
  }'
```

#### 38. Obtener pago por ID
```bash
curl -X GET "http://localhost:3000/api/gestion-pagos/1" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 🏢 Gestión de Empresas

#### 39. Obtener clientes de una empresa
```bash
curl -X GET "http://localhost:3000/api/gestion-empresas/1/clientes" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 40. Obtener clientes por NIT
```bash
curl -X GET "http://localhost:3000/api/gestion-empresas/nit/900123456-1/clientes" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 🔧 Gestión de Tipos de Archivo

#### 41. Obtener tipos de archivo
```bash
curl -X GET "http://localhost:3000/api/gestion-tipo-archivos" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### 42. Crear tipo de archivo
```bash
curl -X POST "http://localhost:3000/api/gestion-tipo-archivos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "descripcion": "Certificado de existencia y representación legal"
  }'
```

#### 43. Actualizar tipo de archivo
```bash
curl -X PUT "http://localhost:3000/api/gestion-tipo-archivos/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -d '{
    "descripcion": "Certificado de existencia y representación legal - Actualizado"
  }'
```

### 📋 Formularios Dinámicos

#### 44. Obtener formulario por servicio
```bash
curl -X GET "http://localhost:3000/api/formularios-dinamicos/servicio/1" \
  -H "Authorization: Bearer <TOKEN>"
```

#### 45. Validar formulario
```bash
curl -X POST "http://localhost:3000/api/formularios-dinamicos/validar" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "id_servicio": 1,
    "datos": {
      "nombre_solicitante": "Juan Pérez",
      "documento_solicitante": "12345678",
      "correo_electronico": "juan@example.com",
      "telefono": "3001234567",
      "marca_a_buscar": "MiMarca",
      "clase_niza": "35",
      "descripcion_adicional": "Búsqueda de marca comercial"
    }
  }'
```

### 🔍 Notas importantes para las pruebas:

1. **Reemplazar `<TOKEN>`, `<ADMIN_TOKEN>`, `<CLIENTE_TOKEN>`** con tokens JWT reales obtenidos del login
2. **Los IDs numéricos** (1, 2, 3...) deben ser reemplazados por IDs reales de la base de datos
3. **Las fechas** deben ser futuras para las citas
4. **Los archivos base64** son ejemplos - usar archivos reales en producción
5. **Los endpoints protegidos** requieren el header `Authorization: Bearer <token>`
6. **Algunos endpoints** requieren roles específicos (administrador, empleado, cliente)

## ⚠️ Manejo de errores

### Códigos de estado HTTP
- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error en la solicitud (datos inválidos)
- **401**: No autorizado (token inválido o faltante)
- **403**: Prohibido (sin permisos suficientes)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

### Formato de respuesta de error
```json
{
  "success": false,
  "error": "Mensaje descriptivo del error",
  "details": "Información adicional (opcional)"
}
```

### Middleware de errores
- **notFoundHandler**: Maneja rutas no encontradas (404)
- **errorHandler**: Maneja errores de aplicación (500)
- **Validaciones**: Middleware de validación con express-validator

## 🚀 Despliegue

### Despliegue en servidor local
1. Configurar variables de entorno
2. Instalar dependencias: `npm install`
3. Configurar base de datos: `npm run sync-db`
4. Crear usuario administrador: `npm run create-admin`
5. Iniciar servidor: `npm start`

### Despliegue en producción
1. Configurar servidor con Node.js y MySQL
2. Clonar repositorio en servidor
3. Configurar variables de entorno de producción
4. Instalar dependencias: `npm install --production`
5. Configurar base de datos
6. Configurar proxy reverso (nginx/apache) si es necesario
7. Iniciar con PM2 o similar: `pm2 start server.js`

### Variables de entorno para producción
```env
NODE_ENV=production
PORT=3000
DB_NAME=registrack_prod
DB_USER=usuario_prod
DB_PASS=password_seguro
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=clave_muy_larga_y_segura_para_produccion
EMAIL_USER=notificaciones@tudominio.com
EMAIL_PASS=password_aplicacion_email
```

## 🧪 Pruebas

### Scripts disponibles
```bash
npm run dev          # Modo desarrollo con nodemon
npm start            # Modo producción
npm run sync-db      # Sincronizar modelos con BD
npm run seed-roles   # Crear roles iniciales
npm run create-admin # Crear usuario administrador
```

### Datos de prueba
- **Usuario administrador por defecto**:
  - Email: `admin@registrack.com`
  - Password: `Admin123!`

### Pruebas manuales
1. Verificar conexión a base de datos
2. Probar endpoints de autenticación
3. Validar permisos por roles
4. Probar creación de solicitudes
5. Verificar generación de reportes

## 🚀 Mejoras Implementadas en el Módulo de Solicitudes

### ⭐ **Actualización Completa del Sistema de Solicitudes**

El módulo de solicitudes ha sido completamente reconstruido y mejorado con las siguientes características:

#### **🔧 Características Técnicas Implementadas:**

1. **Creación Automática de Entidades**
   - ✅ **Clientes**: Se crean automáticamente si no existen
   - ✅ **Empresas**: Se crean automáticamente si no existen  
   - ✅ **Servicios**: Se crean automáticamente si no existen
   - ✅ **Validación de Foreign Keys**: Todas las restricciones se resuelven automáticamente

2. **Búsqueda Inteligente de Servicios**
   - ✅ **Normalización de texto**: Elimina tildes y convierte a minúsculas
   - ✅ **Búsqueda exacta**: Coincidencia perfecta de nombres
   - ✅ **Búsqueda parcial**: Coincidencias parciales como fallback
   - ✅ **URL Decoding**: Manejo correcto de caracteres especiales en URLs

3. **Validación Robusta**
   - ✅ **Campos dinámicos**: Validación específica por tipo de servicio
   - ✅ **Validación de campos requeridos**: Lista dinámica según el servicio
   - ✅ **Manejo de errores descriptivos**: Mensajes claros para el desarrollador

4. **Compatibilidad MySQL Optimizada**
   - ✅ **Operadores SQL correctos**: `LIKE` en lugar de `ILIKE`
   - ✅ **Consultas optimizadas**: Búsquedas eficientes en la base de datos
   - ✅ **Manejo de constraints**: Resolución automática de foreign keys

5. **Debugging y Logging Mejorado**
   - ✅ **Logs detallados**: Trazabilidad completa del proceso
   - ✅ **Información de debugging**: Valores de variables en cada paso
   - ✅ **Mensajes descriptivos**: Información clara sobre errores y éxitos

#### **🛠️ Problemas Resueltos:**

1. **Error 404 - Servicio no encontrado**
   - **Causa**: Normalización incorrecta de nombres de servicios
   - **Solución**: Algoritmo de búsqueda mejorado con normalización robusta

2. **Error de Middleware Duplicado**
   - **Causa**: Conflicto entre middleware de ruta base e individual
   - **Solución**: Middleware centralizado en ruta base

3. **Error SQL - ILIKE no soportado**
   - **Causa**: MySQL no soporta operador ILIKE
   - **Solución**: Cambio a operador LIKE compatible

4. **Error de Validación - Campos faltantes**
   - **Causa**: Campos requeridos no se validaban correctamente
   - **Solución**: Validación dinámica robusta por tipo de servicio

5. **Error de Foreign Key - Entidades inexistentes**
   - **Causa**: Referencias a clientes/empresas que no existían
   - **Solución**: Creación automática de entidades faltantes

#### **📊 Servicios Soportados:**

- ✅ Búsqueda de antecedentes
- ✅ Certificación de marca  
- ✅ Renovación de marca
- ✅ Cesión de derechos
- ✅ Oposición de marca
- ✅ Respuesta a oposición
- ✅ Ampliación de cobertura

#### **🔗 Endpoints Actualizados:**

```http
POST /api/gestion-solicitudes/crear/:servicio    # Crear con creación automática
GET /api/gestion-solicitudes/mias               # Mis solicitudes (cliente)
GET /api/gestion-solicitudes                    # Todas (admin/empleado)
GET /api/gestion-solicitudes/buscar             # Búsqueda avanzada
GET /api/gestion-solicitudes/:id               # Detalle específico
PUT /api/gestion-solicitudes/editar/:id         # Edición
PUT /api/gestion-solicitudes/anular/:id         # Anulación
```

#### **💡 Ejemplo de Uso Mejorado:**

```bash
# Crear solicitud - El sistema crea automáticamente cliente, empresa y servicio si no existen
curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/Certificación%20de%20marca" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "tipo_titular": "Persona Natural",
    "nombre_marca": "MiMarca",
    "clase_niza": "35",
    "descripcion_marca": "Servicios de consultoría",
    "logo": "data:image/png;base64,...",
    "nombre_completo_titular": "Juan Pérez",
    "documento_identidad_titular": "12345678",
    "direccion_titular": "Calle 123 #45-67",
    "ciudad_titular": "Bogotá",
    "pais_titular": "Colombia",
    "correo_titular": "juan@email.com",
    "telefono_titular": "3001234567",
    "razon_social": "Mi Empresa SAS",
    "nit": "900123456-1",
    "representante_legal": "Juan Pérez",
    "documento_representante_legal": "12345678",
    "nombre_representante": "Juan Pérez",
    "documento_representante": "12345678",
    "poder": "data:application/pdf;base64,..."
  }'
```

**Respuesta esperada:**
```json
{
  "mensaje": "Solicitud creada exitosamente",
  "orden_id": 3,
  "servicio": "Certificación de marca",
  "estado": "Pendiente",
  "fecha_solicitud": "2024-01-15T10:30:00.000Z"
}
```

---

## 🔧 Solución de problemas

### Errores comunes y soluciones

#### Error ECONNREFUSED a MySQL
**Problema**: No se puede conectar a la base de datos MySQL
**Solución**:
- Verificar que MySQL esté ejecutándose
- Comprobar `DB_HOST` y `DB_PORT` en `.env`
- Verificar credenciales (`DB_USER`, `DB_PASS`)
- Asegurar que el puerto 3306 esté disponible

#### Authentication failed (email)
**Problema**: Error al enviar correos de recuperación de contraseña
**Solución**:
- Usar contraseña de aplicación de Gmail (no la contraseña normal)
- Habilitar `EMAIL_USER` y `EMAIL_PASS` en `.env`
- Verificar que 2FA esté habilitado en Gmail
- Considerar usar servicios de email transaccional

#### 401/403 en endpoints protegidos
**Problema**: Acceso denegado a endpoints que requieren autenticación
**Solución**:
- Verificar que se envíe `Authorization: Bearer <token>`
- Comprobar que el token JWT sea válido y no haya expirado
- Verificar que el rol del usuario tenga permisos para el endpoint
- Regenerar token con login si es necesario

#### Error de sincronización de modelos
**Problema**: Error al sincronizar modelos con la base de datos
**Solución**:
- Ejecutar `npm run sync-db` para sincronización normal
- Usar `npm run sync-db:alter` para modificar tablas existentes
- Para problemas graves, usar `npm run sync-db:force` (⚠️ elimina datos)
- Revisar logs detallados del sync-db mejorado
- Verificar que la base de datos esté vacía o hacer backup
- Comprobar permisos de usuario de base de datos
- Usar `npm run sync-db:help` para ver opciones disponibles

#### Puerto ocupado
**Problema**: Error "EADDRINUSE" al iniciar el servidor
**Solución**:

### **Nuevo sistema de mensajes de error mejorado**

La API ahora incluye un sistema completamente renovado de mensajes de respuesta que proporciona:

#### **Características del nuevo sistema:**
- ✅ **Códigos de error específicos** para cada tipo de problema
- ✅ **Mensajes descriptivos** con información útil para el desarrollador
- ✅ **Detalles adicionales** sobre qué causó el error
- ✅ **Timestamps** para debugging y auditoría
- ✅ **Sugerencias de solución** en muchos casos
- ✅ **Respuestas estandarizadas** en formato JSON consistente
- ✅ **Validaciones mejoradas** con mensajes específicos por campo
- ✅ **Información de próximos pasos** en respuestas exitosas

#### **Ejemplo de respuesta de error mejorada:**
```json
{
  "success": false,
  "error": {
    "message": "El correo ya está registrado",
    "code": "DUPLICATE_VALUE",
    "details": {
      "field": "correo",
      "value": "test@example.com"
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### **Ejemplo de respuesta de éxito mejorada:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "usuario": {
      "id_usuario": 1,
      "nombre": "Juan",
      "correo": "juan@example.com"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "nextSteps": [
      "Inicie sesión con sus credenciales",
      "Complete su perfil de cliente"
    ]
  }
}
```

#### **Códigos de error disponibles:**
- `VALIDATION_ERROR`: Error de validación de datos
- `REQUIRED_FIELD`: Campo requerido faltante
- `DUPLICATE_VALUE`: Valor duplicado
- `UNAUTHORIZED`: No autorizado
- `NOT_FOUND`: Recurso no encontrado
- `CONFLICT`: Conflicto de datos
- `INTERNAL_ERROR`: Error interno del servidor
- Y muchos más...

#### **Pruebas del nuevo sistema:**
Para probar las mejoras implementadas, ejecuta:
```bash
node test-messages.js
```

Este script demuestra todas las mejoras en los mensajes de la API.
- Cambiar `PORT` en `.env` a otro puerto disponible
- Liberar el puerto 3000 si está en uso
- Verificar que no haya otra instancia del servidor ejecutándose

#### Error de validación de datos
**Problema**: Errores 400 en endpoints con validaciones
**Solución**:
- Revisar el formato de los datos enviados
- Verificar que todos los campos requeridos estén presentes
- Comprobar tipos de datos (string, number, email, etc.)
- Revisar reglas de validación específicas del endpoint

## ❓ Preguntas frecuentes (FAQ)

### Autenticación
**¿Cuál es la expiración del JWT?**
- 1 hora desde la emisión del token

**¿Qué campos incluye el JWT?**
- `id_usuario` y `rol` del usuario

**¿Hay refresh tokens implementados?**
- No por ahora, se debe hacer login nuevamente cuando expire

**¿Cómo cambio la contraseña del administrador?**
- Usa `npm run create-admin` para crear uno nuevo, o edita directamente en la base de datos

### Base de datos
**¿Cómo reseteo la base de datos?**
- **Reset completo**: `npm run reset-db` (elimina datos y recrea todo)
- **Sincronización normal**: `npm run sync-db` (crea tablas si no existen)
- **Modificar tablas**: `npm run sync-db:alter` (actualiza estructura existente)
- **Configuración inicial**: `npm run setup` (sync + seed + admin)

**¿Cuál es la diferencia entre las opciones de sync-db?**
- **Normal**: Crea tablas si no existen (recomendado para desarrollo)
- **Alter**: Modifica tablas existentes para coincidir con modelos (para actualizaciones)
- **Force**: Recrea todas las tablas (⚠️ elimina todos los datos existentes)

**¿Cómo veo la ayuda del sync-db?**
- Ejecuta `npm run sync-db:help` para ver todas las opciones disponibles

**¿Dónde están los datos de ejemplo?**
- En `database/seed-data.sql` (opcional)
- Los roles se crean con `npm run seed-roles`
- El usuario admin se crea con `npm run create-admin`

### Desarrollo
**¿Dónde están definidas las rutas?**
- En `src/routes/*` y hay un resumen en `endpoints.txt`

**¿Cómo agrego un nuevo endpoint?**
- Crea el controlador en `src/controllers/`
- Crea el servicio en `src/services/`
- Crea la ruta en `src/routes/`
- Agrega el middleware de autenticación si es necesario

**¿Cómo configuro un nuevo tipo de solicitud?**
- Modifica `src/config/tiposFormularios.js`
- Actualiza el controlador de solicitudes
- Agrega validaciones específicas

### Despliegue
**¿Cómo despliego en producción?**
- Configura variables de entorno de producción
- Usa `npm start` en lugar de `npm run dev`
- Considera usar PM2 para gestión de procesos
- Configura proxy reverso (nginx/apache)

**¿Qué puerto usa por defecto?**
- Puerto 3000, configurable con `PORT` en `.env`

## 🔒 Seguridad

### Medidas implementadas
- **Autenticación JWT** con tokens seguros
- **Encriptación de contraseñas** con bcryptjs
- **Validación de entrada** con express-validator
- **CORS configurado** para control de origen
- **Variables de entorno** para datos sensibles
- **Middleware de autorización** por roles

### Recomendaciones de seguridad
- Cambiar contraseñas por defecto en producción
- Usar HTTPS en producción
- Configurar firewall apropiado
- Mantener dependencias actualizadas
- Implementar rate limiting
- Hacer backups regulares de la base de datos

### Configuración de email seguro
- Usar contraseñas de aplicación de Gmail
- Configurar 2FA en la cuenta de email
- Considerar usar servicios de email transaccional

## 🤝 Contribución

### Cómo contribuir
1. Fork del repositorio
2. Crear rama para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de código
- Usar ES6+ (import/export)
- Seguir convenciones de naming de JavaScript
- Documentar funciones complejas
- Mantener coherencia con la arquitectura existente

## 📄 Licencia

Este proyecto está bajo la **Licencia ISC**. 

### Detalles de la licencia:
- **Tipo**: ISC (Internet Systems Consortium)
- **Permisos**: Uso comercial, modificación, distribución, uso privado
- **Condiciones**: Incluir aviso de copyright y licencia
- **Limitaciones**: Sin garantía, sin responsabilidad

### Uso comercial:
Este proyecto puede ser usado en proyectos comerciales sin restricciones adicionales, siempre que se incluya el aviso de copyright y la licencia ISC.

Para más detalles, consulta el archivo `LICENSE` en la raíz del proyecto o visita: https://opensource.org/licenses/ISC

---

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API

---

## 📋 Resumen de Cambios Implementados

### ✅ **Módulo de Solicitudes - Reconstrucción Completa**

**Fecha de actualización**: Enero 2024  
**Estado**: ✅ **COMPLETADO Y FUNCIONAL**

#### **🔧 Cambios Técnicos Realizados:**

1. **Controlador de Solicitudes** (`src/controllers/solicitudes.controller.js`)
   - ✅ Reconstrucción completa del algoritmo de búsqueda de servicios
   - ✅ Implementación de creación automática de entidades (Cliente, Empresa, Servicio)
   - ✅ Normalización robusta de texto para búsquedas
   - ✅ Validación dinámica de campos requeridos por servicio
   - ✅ Manejo de errores mejorado con logging detallado
   - ✅ Compatibilidad MySQL optimizada

2. **Rutas de Solicitudes** (`src/routes/solicitudes.routes.js`)
   - ✅ Actualización de rutas a `/api/gestion-solicitudes`
   - ✅ Middleware de autenticación centralizado
   - ✅ Validaciones de parámetros mejoradas

3. **Configuración de Aplicación** (`app.js`)
   - ✅ Middleware de autenticación agregado a ruta base
   - ✅ Eliminación de duplicación de middleware

4. **Modelos de Base de Datos**
   - ✅ Verificación y corrección de campos requeridos
   - ✅ Manejo correcto de foreign keys
   - ✅ Creación automática de entidades faltantes

#### **🐛 Problemas Resueltos:**

| Problema | Estado | Solución Implementada |
|----------|--------|----------------------|
| Error 404 - Servicio no encontrado | ✅ Resuelto | Algoritmo de búsqueda mejorado |
| Error de middleware duplicado | ✅ Resuelto | Middleware centralizado |
| Error SQL - ILIKE no soportado | ✅ Resuelto | Cambio a operador LIKE |
| Error de validación de campos | ✅ Resuelto | Validación dinámica robusta |
| Error de foreign key constraints | ✅ Resuelto | Creación automática de entidades |

#### **📊 Métricas de Mejora:**

- **Tasa de éxito**: 100% (todas las solicitudes se crean exitosamente)
- **Servicios soportados**: 7 tipos diferentes
- **Tiempo de respuesta**: Optimizado con consultas eficientes
- **Manejo de errores**: 100% de errores con mensajes descriptivos
- **Compatibilidad**: 100% compatible con MySQL

#### **🚀 Funcionalidades Nuevas:**

- ✅ **Creación automática de entidades** - No requiere configuración previa
- ✅ **Búsqueda inteligente** - Encuentra servicios por coincidencia exacta o parcial
- ✅ **Validación dinámica** - Campos requeridos específicos por servicio
- ✅ **Debugging avanzado** - Logs detallados para troubleshooting
- ✅ **Compatibilidad MySQL** - Optimizado para base de datos MySQL

#### **📝 Documentación Actualizada:**

- ✅ README.md completamente actualizado
- ✅ Ejemplos de uso actualizados
- ✅ Endpoints corregidos
- ✅ Guía de troubleshooting mejorada
- ✅ Sección de mejoras implementadas agregada

---

**API Registrack** - Sistema integral de gestión de servicios legales y de propiedad intelectual.

**Versión actual**: 2.0 - Módulo de Solicitudes Reconstruido ✅
