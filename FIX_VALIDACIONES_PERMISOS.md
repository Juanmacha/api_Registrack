# ✅ Fix: Validaciones de Permisos

**Fecha:** Enero 2026  
**Error:** `SyntaxError: The requested module '../middlewares/permiso.middleware.js' does not provide an export named 'createPermisoValidation'`

---

## 🐛 Problema

El archivo `src/routes/permiso.routes.js` intentaba importar las siguientes validaciones desde `src/middlewares/permiso.middleware.js`:

- `createPermisoValidation`
- `updatePermisoValidation`
- `idParamValidation`

Pero estas validaciones **no existían** en el archivo. El archivo solo contenía:
- `checkPermiso` - Para validar permisos de acceso
- `checkPermisoMultiple` - Para validar múltiples permisos

---

## ✅ Solución

Se agregaron las validaciones de datos faltantes al archivo `src/middlewares/permiso.middleware.js`, siguiendo el mismo patrón que `privilegio.middleware.js`.

### **Validaciones Agregadas:**

1. **`createPermisoValidation`**
   - Valida que el nombre sea requerido
   - Valida formato: solo letras, guiones bajos, sin espacios
   - Valida longitud: 2-100 caracteres
   - Valida unicidad: no debe existir otro permiso con el mismo nombre

2. **`updatePermisoValidation`**
   - Valida que el ID sea válido
   - Valida que el nombre sea opcional (si se proporciona)
   - Valida formato: solo letras, guiones bajos, sin espacios
   - Valida longitud: 2-100 caracteres
   - Valida unicidad: no debe existir otro permiso con el mismo nombre (excepto el actual)

3. **`idParamValidation`**
   - Valida que el ID sea requerido
   - Valida que el ID sea un número entero mayor que 0

---

## 📝 Cambios Realizados

### **Archivo: `src/middlewares/permiso.middleware.js`**

**Agregado:**
- Import de `express-validator` (`body`, `param`, `validationResult`)
- Import de `PermisoModel` para validaciones de base de datos
- Constante `ONLY_LETTERS_UNDERSCORES` para validar formato de nombres
- Función `handleValidationErrors` para manejar errores de validación
- Validación `createPermisoValidation`
- Validación `updatePermisoValidation`
- Validación `idParamValidation`

**Código agregado:**
```javascript
// =============================================
// VALIDACIONES DE DATOS PARA PERMISOS
// =============================================

const ONLY_LETTERS_UNDERSCORES = /^[A-Za-zÁÉÍÓÚáéíóúÑñ_]+$/;

// Manejar errores de validación
const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

// Validación para crear permiso
export const createPermisoValidation = [
  body('nombre')
    .exists().withMessage('nombre es requerido')
    .bail()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('nombre debe tener 2-100 caracteres')
    .matches(ONLY_LETTERS_UNDERSCORES).withMessage('nombre solo permite letras, guiones bajos y sin espacios')
    .bail()
    .custom(async (value) => {
      const existe = await PermisoModel.findOne({ where: { nombre: value.trim() } });
      if (existe) {
        return Promise.reject('El permiso ya existe');
      }
    }),
  handleValidationErrors,
];

// Validación para actualizar permiso
export const updatePermisoValidation = [
  param('id')
    .exists().withMessage('id es requerido')
    .bail()
    .toInt()
    .isInt({ min: 1 }).withMessage('id inválido'),
  body('nombre')
    .optional()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('nombre debe tener 2-100 caracteres')
    .matches(ONLY_LETTERS_UNDERSCORES).withMessage('nombre solo permite letras, guiones bajos y sin espacios')
    .bail()
    .custom(async (value, { req }) => {
      if (!value) return true;
      const existe = await PermisoModel.findOne({ where: { nombre: value.trim() } });
      if (existe && existe.id_permiso !== parseInt(req.params.id)) {
        return Promise.reject('Ya existe un permiso con este nombre');
      }
    }),
  handleValidationErrors,
];

// Validación para parámetro ID
export const idParamValidation = [
  param('id')
    .exists().withMessage('id es requerido')
    .bail()
    .toInt()
    .isInt({ min: 1 }).withMessage('id inválido'),
  handleValidationErrors,
];
```

---

## ✅ Estado Final

**Archivo `src/middlewares/permiso.middleware.js` ahora exporta:**
- ✅ `checkPermiso` - Validación de permisos de acceso
- ✅ `checkPermisoMultiple` - Validación de múltiples permisos
- ✅ `createPermisoValidation` - Validación de datos para crear permiso
- ✅ `updatePermisoValidation` - Validación de datos para actualizar permiso
- ✅ `idParamValidation` - Validación de parámetro ID

**Archivo `src/routes/permiso.routes.js` ahora puede importar:**
- ✅ `createPermisoValidation` - Para validar datos al crear permiso
- ✅ `updatePermisoValidation` - Para validar datos al actualizar permiso
- ✅ `idParamValidation` - Para validar parámetro ID

---

## 🧪 Validaciones Implementadas

### **1. Crear Permiso (`createPermisoValidation`)**

**Validaciones:**
- ✅ Nombre es requerido
- ✅ Nombre debe ser texto
- ✅ Nombre debe tener 2-100 caracteres
- ✅ Nombre solo permite letras, guiones bajos y sin espacios
- ✅ Nombre no debe existir en la base de datos

**Ejemplo de error:**
```json
{
  "error": "El permiso ya existe"
}
```

---

### **2. Actualizar Permiso (`updatePermisoValidation`)**

**Validaciones:**
- ✅ ID es requerido y debe ser un número entero mayor que 0
- ✅ Nombre es opcional (si se proporciona)
- ✅ Nombre debe ser texto
- ✅ Nombre debe tener 2-100 caracteres
- ✅ Nombre solo permite letras, guiones bajos y sin espacios
- ✅ Nombre no debe existir en la base de datos (excepto el actual)

**Ejemplo de error:**
```json
{
  "error": "Ya existe un permiso con este nombre"
}
```

---

### **3. Validar ID (`idParamValidation`)**

**Validaciones:**
- ✅ ID es requerido
- ✅ ID debe ser un número entero mayor que 0

**Ejemplo de error:**
```json
{
  "error": "id inválido"
}
```

---

## 🔄 Patrón de Validación

Las validaciones siguen el mismo patrón que `privilegio.middleware.js`:

1. **Validación de formato:** Regex para validar caracteres permitidos
2. **Validación de longitud:** Min y max caracteres
3. **Validación de unicidad:** Consulta a la base de datos
4. **Manejo de errores:** Función `handleValidationErrors` centralizada

---

## 📊 Comparación con Privilegios

| Característica | Permisos | Privilegios |
|----------------|----------|-------------|
| **Formato permitido** | Letras, guiones bajos, sin espacios | Letras, espacios |
| **Longitud** | 2-100 caracteres | 2-100 caracteres |
| **Unicidad** | ✅ Validada | ✅ Validada |
| **Validación de ID** | ✅ Implementada | ✅ Implementada |

**Diferencia clave:** Los permisos permiten guiones bajos (`_`) pero no espacios, mientras que los privilegios permiten espacios. Esto es porque los permisos tienen nombres como `gestion_usuarios`, mientras que los privilegios tienen nombres como `crear`.

---

## ✅ Resultado

El servidor ahora puede iniciarse sin errores. Las rutas de permisos están completamente funcionales con validaciones de datos implementadas.

**Endpoints funcionando:**
- ✅ `POST /api/gestion-permisos` - Crear permiso (con validación)
- ✅ `GET /api/gestion-permisos` - Obtener todos los permisos
- ✅ `GET /api/gestion-permisos/:id` - Obtener permiso por ID (con validación de ID)
- ✅ `PUT /api/gestion-permisos/:id` - Actualizar permiso (con validación)
- ✅ `DELETE /api/gestion-permisos/:id` - Eliminar permiso (con validación de ID)

---

**Documento creado:** Enero 2026  
**Versión:** 1.0  
**Estado:** ✅ Error resuelto

