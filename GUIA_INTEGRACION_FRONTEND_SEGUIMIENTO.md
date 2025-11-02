# 🚀 Guía de Integración Frontend - Módulo de Seguimiento

## 📋 Índice
1. [Configuración Base](#configuración-base)
2. [Endpoints Disponibles](#endpoints-disponibles)
3. [Casos de Uso Comunes](#casos-de-uso-comunes)
4. [Ejemplos de Código](#ejemplos-de-código)
5. [Manejo de Errores](#manejo-de-errores)
6. [Estructura de Datos](#estructura-de-datos)

---

## ⚙️ Configuración Base

### URL Base
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### Headers Requeridos
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Token obtenido del login
};
```

### Roles Permitidos
- ✅ **Administrador**: Acceso completo a todos los endpoints
- ✅ **Empleado**: Acceso completo a todos los endpoints
- ❌ **Cliente**: Sin acceso directo (ver seguimiento desde solicitudes)

---

## 🔗 Endpoints Disponibles

### 1. Ver Historial de Seguimiento
```javascript
GET /api/seguimiento/historial/:idOrdenServicio
```

**Descripción:** Obtiene todo el historial de seguimientos de una solicitud.

**Parámetros:**
- `idOrdenServicio` (path): ID de la orden de servicio

**Respuesta:**
```javascript
[
  {
    "id_seguimiento": 1,
    "id_orden_servicio": 123,
    "titulo": "Solicitud creada",
    "descripcion": "Solicitud de registro de marca creada por el cliente",
    "documentos_adjuntos": null,
    "fecha_registro": "2024-01-15T08:00:00.000Z",
    "registrado_por": 2,
    "nuevo_estado": null,
    "estado_anterior": null,
    "usuario_registro": {
      "nombre": "Admin",
      "apellido": "Usuario",
      "correo": "admin@registrack.com"
    }
  }
]
```

---

### 2. Crear Seguimiento

#### A) Sin Cambio de Estado
```javascript
POST /api/seguimiento/crear
```

**Body:**
```javascript
{
  "id_orden_servicio": 123,
  "titulo": "Documentos recibidos",
  "descripcion": "Se recibió toda la documentación requerida",
  "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf" // Opcional
}
```

#### B) Con Cambio de Estado
```javascript
POST /api/seguimiento/crear
```

**Body:**
```javascript
{
  "id_orden_servicio": 123,
  "titulo": "Avance en el proceso",
  "descripcion": "Se han recibido todos los documentos necesarios",
  "nuevo_proceso": "Verificación de Documentos", // ⚠️ NOMBRE exacto del estado
  "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf" // Opcional
}
```

**⚠️ IMPORTANTE:** El campo `nuevo_proceso` debe contener el **nombre exacto** del estado (obtenido desde `/estados-disponibles`).

**Respuesta:**
```javascript
{
  "mensaje": "Registro de seguimiento creado exitosamente.",
  "seguimiento": {
    "id_seguimiento": 456,
    "id_orden_servicio": 123,
    "titulo": "Avance en el proceso",
    "descripcion": "Se han recibido todos los documentos necesarios",
    "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf",
    "fecha_registro": "2024-01-15T11:00:00.000Z",
    "registrado_por": 1,
    "nuevo_estado": "Verificación de Documentos",
    "estado_anterior": "Solicitud Inicial",
    "cambio_proceso": {
      "proceso_anterior": "Solicitud Inicial",
      "nuevo_proceso": "Verificación de Documentos",
      "fecha_cambio": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

---

### 3. Obtener Estados Disponibles
```javascript
GET /api/seguimiento/:idOrdenServicio/estados-disponibles
```

**Descripción:** Obtiene los estados válidos para una solicitud según su servicio.

**Respuesta:**
```javascript
{
  "success": true,
  "data": {
    "orden_servicio_id": 123,
    "servicio": "Registro de Marca",
    "estado_actual": "Solicitud Inicial",
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
      }
    ]
  }
}
```

---

### 4. Ver Seguimiento Específico
```javascript
GET /api/seguimiento/:id
```

**Descripción:** Obtiene un seguimiento por su ID.

**Respuesta:**
```javascript
{
  "id_seguimiento": 1,
  "id_orden_servicio": 123,
  "titulo": "Documentos recibidos",
  "descripcion": "Se recibió toda la documentación requerida",
  "documentos_adjuntos": "https://ejemplo.com/docs/comprobante.pdf",
  "fecha_registro": "2024-01-16T10:30:00.000Z",
  "registrado_por": 1,
  "usuario_registro": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan@ejemplo.com"
  },
  "orden_servicio": {
    "id_orden_servicio": 123,
    "numero_expediente": "EXP-2024-001",
    "estado": "Verificación de Documentos"
  }
}
```

---

### 5. Actualizar Seguimiento
```javascript
PUT /api/seguimiento/:id
```

**Body (al menos uno requerido):**
```javascript
{
  "titulo": "Documentos completos recibidos", // Opcional
  "descripcion": "Actualizado: Se verificó la completitud", // Opcional
  "documentos_adjuntos": "https://ejemplo.com/nuevos-docs.pdf" // Opcional
}
```

---

### 6. Eliminar Seguimiento
```javascript
DELETE /api/seguimiento/:id
```

**Respuesta:**
```javascript
{
  "mensaje": "Seguimiento eliminado exitosamente"
}
```

---

### 7. Buscar por Título
```javascript
GET /api/seguimiento/buscar/:idOrdenServicio?titulo=documento
```

**Respuesta:**
```javascript
[
  {
    "id_seguimiento": 2,
    "titulo": "Documentos recibidos",
    "descripcion": "Se recibió toda la documentación requerida",
    "fecha_registro": "2024-01-16T10:30:00.000Z",
    "usuario_registro": {
      "nombre": "Juan",
      "apellido": "Pérez",
      "correo": "juan@ejemplo.com"
    }
  }
]
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Mostrar Historial de Seguimiento

**Escenario:** El usuario quiere ver el historial completo de una solicitud.

```javascript
async function obtenerHistorial(ordenId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/seguimiento/historial/${ordenId}`,
      {
        method: 'GET',
        headers: headers
      }
    );
    
    if (!response.ok) throw new Error('Error al obtener historial');
    
    const historial = await response.json();
    return historial;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
const historial = await obtenerHistorial(123);
```

---

### Caso 2: Cargar Estados Disponibles en un Select

**Escenario:** Necesitas llenar un dropdown con los estados válidos.

```javascript
async function obtenerEstadosDisponibles(ordenId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/seguimiento/${ordenId}/estados-disponibles`,
      {
        method: 'GET',
        headers: headers
      }
    );
    
    if (!response.ok) throw new Error('Error al obtener estados');
    
    const data = await response.json();
    
    // Ejemplo React
    const [estados, setEstados] = useState([]);
    const [estadoActual, setEstadoActual] = useState('');
    
    useEffect(() => {
      if (data.success) {
        setEstados(data.data.estados_disponibles);
        setEstadoActual(data.data.estado_actual);
      }
    }, [data]);
    
    return {
      estados: data.data.estados_disponibles,
      estadoActual: data.data.estado_actual
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

### Caso 3: Agregar Comentario Sin Cambiar Estado

**Escenario:** El usuario agrega una nota o comentario sin avanzar el proceso.

```javascript
async function agregarComentario(ordenId, titulo, descripcion, documentos = null) {
  try {
    const body = {
      id_orden_servicio: ordenId,
      titulo: titulo,
      descripcion: descripcion
    };
    
    if (documentos) {
      body.documentos_adjuntos = documentos;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/seguimiento/crear`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) throw new Error('Error al crear seguimiento');
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
await agregarComentario(
  123,
  'Documentos recibidos',
  'Se recibió la documentación del cliente'
);
```

---

### Caso 4: Avanzar Estado de Solicitud

**Escenario:** El usuario quiere cambiar el estado de una solicitud.

```javascript
async function cambiarEstado(ordenId, nuevoEstado, titulo, descripcion, documentos = null) {
  try {
    // Primero, verificar que el estado sea válido
    const estadosResponse = await fetch(
      `${API_BASE_URL}/seguimiento/${ordenId}/estados-disponibles`,
      {
        method: 'GET',
        headers: headers
      }
    );
    
    const estadosData = await estadosResponse.json();
    const estadoValido = estadosData.data.estados_disponibles.find(
      e => e.nombre === nuevoEstado
    );
    
    if (!estadoValido) {
      throw new Error('El estado especificado no es válido para esta solicitud');
    }
    
    // Crear seguimiento con cambio de estado
    const body = {
      id_orden_servicio: ordenId,
      titulo: titulo,
      descripcion: descripcion,
      nuevo_proceso: nuevoEstado // ⚠️ Debe ser el nombre exacto
    };
    
    if (documentos) {
      body.documentos_adjuntos = documentos;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/seguimiento/crear`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) throw new Error('Error al cambiar estado');
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
await cambiarEstado(
  123,
  'Verificación de Documentos',
  'Avance en el proceso',
  'Se han recibido todos los documentos necesarios'
);
```

---

### Caso 5: Formulario Completo con Validaciones

**Escenario:** Formulario React completo con validación de estados.

```javascript
import React, { useState, useEffect } from 'react';

function FormularioSeguimiento({ ordenId }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [documentos, setDocumentos] = useState('');
  const [cambiarEstado, setCambiarEstado] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [estadoActual, setEstadoActual] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar estados al montar el componente
  useEffect(() => {
    cargarEstados();
  }, [ordenId]);

  const cargarEstados = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/seguimiento/${ordenId}/estados-disponibles`,
        {
          method: 'GET',
          headers: headers
        }
      );
      const data = await response.json();
      if (data.success) {
        setEstadosDisponibles(data.data.estados_disponibles);
        setEstadoActual(data.data.estado_actual);
      }
    } catch (error) {
      console.error('Error al cargar estados:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const body = {
        id_orden_servicio: ordenId,
        titulo: titulo,
        descripcion: descripcion
      };

      if (documentos) {
        body.documentos_adjuntos = documentos;
      }

      // Solo incluir nuevo_proceso si el usuario marcó cambiarEstado
      if (cambiarEstado && estadoSeleccionado) {
        body.nuevo_proceso = estadoSeleccionado;
      }

      const response = await fetch(
        `${API_BASE_URL}/seguimiento/crear`,
        {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear seguimiento');
      }

      const result = await response.json();
      
      // Éxito: mostrar mensaje y limpiar formulario
      alert('Seguimiento creado exitosamente');
      setTitulo('');
      setDescripcion('');
      setDocumentos('');
      setCambiarEstado(false);
      setEstadoSeleccionado('');
      
      // Actualizar lista si es necesario
      // onSeguimientoCreado(result);

    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar Seguimiento</h2>
      
      {/* Estado Actual */}
      <div>
        <label>Estado Actual:</label>
        <span style={{ fontWeight: 'bold' }}>{estadoActual}</span>
      </div>

      {/* Título */}
      <div>
        <label>Título:</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      {/* Descripción */}
      <div>
        <label>Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
      </div>

      {/* Documentos Adjuntos */}
      <div>
        <label>Documentos Adjuntos (URLs separadas por comas):</label>
        <input
          type="text"
          value={documentos}
          onChange={(e) => setDocumentos(e.target.value)}
          placeholder="https://ejemplo.com/doc1.pdf,https://ejemplo.com/doc2.pdf"
        />
      </div>

      {/* Opción de Cambiar Estado */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={cambiarEstado}
            onChange={(e) => setCambiarEstado(e.target.checked)}
          />
          Cambiar estado de la solicitud
        </label>
      </div>

      {/* Select de Estados (solo si cambiarEstado está marcado) */}
      {cambiarEstado && (
        <div>
          <label>Nuevo Estado:</label>
          <select
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
            required
          >
            <option value="">Seleccione un estado</option>
            {estadosDisponibles.map((estado) => (
              <option key={estado.id} value={estado.nombre}>
                {estado.nombre} - {estado.descripcion}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Seguimiento'}
      </button>
    </form>
  );
}

export default FormularioSeguimiento;
```

---

### Caso 6: Vista de Timeline/Historial

**Escenario:** Mostrar el historial como una línea de tiempo.

```javascript
import React, { useState, useEffect } from 'react';

function TimelineSeguimientos({ ordenId }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHistorial();
  }, [ordenId]);

  const cargarHistorial = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/seguimiento/historial/${ordenId}`,
        {
          method: 'GET',
          headers: headers
        }
      );
      
      if (!response.ok) throw new Error('Error al cargar historial');
      
      const data = await response.json();
      setHistorial(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="timeline">
      <h2>Historial de Seguimiento</h2>
      {historial.length === 0 ? (
        <p>No hay seguimientos registrados</p>
      ) : (
        historial.map((item, index) => (
          <div key={item.id_seguimiento} className="timeline-item">
            {/* Indicador de cambio de estado */}
            {item.nuevo_estado && (
              <div className="badge badge-success">
                {item.estado_anterior} → {item.nuevo_estado}
              </div>
            )}
            
            <h4>{item.titulo}</h4>
            <p>{item.descripcion}</p>
            
            {/* Documentos adjuntos */}
            {item.documentos_adjuntos && (
              <div className="documentos">
                <strong>Documentos:</strong>
                <ul>
                  {item.documentos_adjuntos.split(',').map((url, i) => (
                    <li key={i}>
                      <a href={url.trim()} target="_blank" rel="noopener noreferrer">
                        Ver documento {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Información del usuario */}
            <div className="meta">
              <span>
                Por: {item.usuario_registro?.nombre}{' '}
                {item.usuario_registro?.apellido}
              </span>
              <span>
                {new Date(item.fecha_registro).toLocaleString('es-ES')}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TimelineSeguimientos;
```

---

## ⚠️ Manejo de Errores

### Errores Comunes

#### 1. Estado Inválido (400)
```javascript
{
  "error": "El proceso 'Estado Inexistente' no existe en el servicio"
}
```
**Solución:** Verificar que el estado existe usando `/estados-disponibles`.

#### 2. Solicitud No Encontrada (404)
```javascript
{
  "error": "No se encontró ninguna orden de servicio con ese ID"
}
```
**Solución:** Verificar que el ID de la orden sea correcto.

#### 3. Sin Permisos (401/403)
```javascript
{
  "error": "No autorizado"
}
```
**Solución:** Verificar que el token sea válido y el usuario tenga permisos.

#### 4. Campos Faltantes (400)
```javascript
{
  "error": "El campo 'titulo' es requerido"
}
```
**Solución:** Asegurar que todos los campos requeridos estén presentes.

---

### Función Genérica de Manejo de Errores

```javascript
async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    // Si la respuesta no es exitosa, intentar parsear el error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Re-lanzar el error para que el componente pueda manejarlo
    console.error('Error en fetch:', error);
    throw error;
  }
}

// Uso
try {
  const data = await fetchWithErrorHandling(
    `${API_BASE_URL}/seguimiento/historial/${ordenId}`,
    { method: 'GET', headers: headers }
  );
  // Procesar data
} catch (error) {
  // Mostrar mensaje al usuario
  setError(error.message);
}
```

---

## 📊 Estructura de Datos

### Objeto Seguimiento Completo

```typescript
interface Seguimiento {
  id_seguimiento: number;
  id_orden_servicio: number;
  titulo: string; // Máximo 200 caracteres
  descripcion: string;
  documentos_adjuntos: string | null; // URLs separadas por comas
  fecha_registro: string; // ISO 8601
  registrado_por: number; // ID del usuario
  nuevo_estado: string | null; // Nombre del nuevo estado
  estado_anterior: string | null; // Nombre del estado anterior
  usuario_registro?: {
    nombre: string;
    apellido: string;
    correo: string;
  };
  orden_servicio?: {
    id_orden_servicio: number;
    numero_expediente: string;
    estado: string;
  };
  cambio_proceso?: {
    proceso_anterior: string;
    nuevo_proceso: string;
    fecha_cambio: string;
  };
}
```

### Objeto Estado Disponible

```typescript
interface EstadoDisponible {
  id: number;
  nombre: string; // ⚠️ Usar este valor en nuevo_proceso
  descripcion: string | null;
  order_number: number;
  status_key: string;
}
```

---

## 🔍 Testing

### Ejemplo con Jest/Vitest

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Módulo de Seguimiento', () => {
  let token;
  
  beforeEach(async () => {
    // Login antes de cada test
    const loginResponse = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo: 'admin@registrack.com',
        password: 'Admin123!'
      })
    });
    const loginData = await loginResponse.json();
    token = loginData.token;
  });

  it('debería obtener el historial de seguimiento', async () => {
    const response = await fetch(
      'http://localhost:3000/api/seguimiento/historial/1',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('debería crear un seguimiento sin cambio de estado', async () => {
    const response = await fetch(
      'http://localhost:3000/api/seguimiento/crear',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_orden_servicio: 1,
          titulo: 'Test de seguimiento',
          descripcion: 'Descripción de prueba'
        })
      }
    );
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.mensaje).toContain('exitosamente');
  });
});
```

---

## 📝 Resumen Rápido

### Flujo Recomendado

1. **Login** → Obtener token
2. **Cargar Estados** → `GET /seguimiento/:id/estados-disponibles`
3. **Mostrar Historial** → `GET /seguimiento/historial/:id`
4. **Crear Seguimiento** → `POST /seguimiento/crear`
   - Con `nuevo_proceso` si se quiere cambiar estado
   - Sin `nuevo_proceso` si solo se agrega comentario

### Validaciones Importantes

- ✅ Verificar que el estado existe antes de usarlo
- ✅ El título es obligatorio (máx 200 caracteres)
- ✅ La descripción es obligatoria
- ✅ Los documentos se separan por comas
- ✅ El token debe ser válido y no expirado

### Notas de Seguridad

- 🔒 Todos los endpoints requieren autenticación
- 🔒 Los clientes NO tienen acceso directo al módulo
- 🔒 Solo administradores y empleados pueden crear seguimientos
- 🔒 Los cambios de estado envían emails automáticamente

---

## 🆘 Soporte

¿Necesitas ayuda? Revisa:
- 📄 [README.md](README.md) - Documentación general
- 📋 [EJEMPLOS_POSTMAN_SEGUIMIENTO.md](EJEMPLOS_POSTMAN_SEGUIMIENTO.md) - Ejemplos Postman detallados
- 🐛 **Logs del servidor** para ver errores específicos

---

**Última actualización:** 1 de Noviembre de 2025

