# 📱 Documentación Frontend: Integración con API - Certificación de Marca

**Endpoint:** `POST /api/gestion-solicitudes/crear/2`  
**Servicio:** Certificación de Marca (Registro de Marca)  
**Versión:** 1.0  
**Fecha:** Enero 2026

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#-1-configuración-inicial)
2. [Autenticación](#-2-autenticación)
3. [Estructura de Datos](#-3-estructura-de-datos)
4. [Validaciones Frontend](#-4-validaciones-frontend)
5. [Manejo de Archivos](#-5-manejo-de-archivos)
6. [Ejemplos de Código](#-6-ejemplos-de-código)
7. [Manejo de Errores](#-7-manejo-de-errores)
8. [Ejemplos Completos](#-8-ejemplos-completos)

---

## 🚀 1. Configuración Inicial

### **1.1. URL Base de la API**

```javascript
// Configuración recomendada (crear archivo config.js)
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    CREAR_SOLICITUD: (servicioId) => `/api/gestion-solicitudes/crear/${servicioId}`,
    CERTIFICACION_MARCA: '/api/gestion-solicitudes/crear/2',
    SERVICIOS: '/api/servicios',
    LOGIN: '/api/usuarios/login'
  }
};
```

### **1.2. Instalación de Dependencias**

```bash
# Si usas axios
npm install axios

# Si usas fetch nativo (no requiere instalación)
# Ya viene incluido en navegadores modernos
```

---

## 🔐 2. Autenticación

### **2.1. Obtener Token JWT**

```javascript
// Ejemplo de login
const login = async (correo, password) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, password })
    });

    const data = await response.json();
    
    if (data.token) {
      // Guardar token en localStorage o contexto
      localStorage.setItem('authToken', data.token);
      return data.token;
    }
    
    throw new Error(data.mensaje || 'Error en login');
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
```

### **2.2. Crear Función Helper para Headers**

```javascript
// helpers/api.js
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};
```

---

## 📊 3. Estructura de Datos

### **3.1. Campos Requeridos por Tipo de Solicitante**

#### **Para Persona Natural:**

```typescript
interface SolicitudCertificacionMarcaNatural {
  // ✅ Campos obligatorios
  tipo_solicitante: "Natural";
  nombres_apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  direccion: string;
  telefono: string;
  correo: string;
  pais: string;
  numero_nit_cedula: string;
  nombre_marca: string;
  tipo_producto_servicio: string;
  logotipo: string; // Base64
  poder_autorizacion: string; // Base64
  
  // ⚠️ Campos opcionales (después del fix del backend)
  ciudad?: string;
  clase_niza?: string;
  
  // ❌ NO enviar estos campos para Natural (después del fix)
  // certificado_camara_comercio?: string;
  // tipo_entidad?: string;
  // razon_social?: string;
  // nit_empresa?: number;
  // representante_legal?: string;
  // direccion_domicilio?: string;
}
```

#### **Para Persona Jurídica:**

```typescript
interface SolicitudCertificacionMarcaJuridica {
  // ✅ Campos obligatorios
  tipo_solicitante: "Jurídica";
  nombres_apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  direccion: string;
  telefono: string;
  correo: string;
  pais: string;
  numero_nit_cedula: string;
  nombre_marca: string;
  tipo_producto_servicio: string;
  logotipo: string; // Base64
  poder_autorizacion: string; // Base64
  
  // ✅ Campos obligatorios solo para Jurídica
  certificado_camara_comercio: string; // Base64
  tipo_entidad: string;
  razon_social: string;
  nit_empresa: number; // 10 dígitos, sin guión
  representante_legal: string;
  direccion_domicilio: string;
  
  // ⚠️ Campos opcionales
  ciudad?: string;
  clase_niza?: string;
}
```

### **3.2. Validaciones de Campos**

```javascript
// Validaciones específicas
const validaciones = {
  tipo_solicitante: {
    valoresPermitidos: ['Natural', 'Jurídica'],
    requerido: true
  },
  nombres_apellidos: {
    minLength: 3,
    maxLength: 100,
    requerido: true
  },
  numero_documento: {
    minLength: 5,
    maxLength: 20,
    requerido: true
  },
  telefono: {
    minLength: 7,
    maxLength: 20,
    requerido: true,
    pattern: /^[0-9+\-\s()]+$/
  },
  correo: {
    requerido: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  nit_empresa: {
    requerido: true, // Solo para Jurídica
    min: 1000000000,
    max: 9999999999,
    digits: 10
  },
  nombre_marca: {
    minLength: 2,
    maxLength: 100,
    requerido: true
  },
  logotipo: {
    requerido: true,
    tiposPermitidos: ['image/jpeg', 'image/jpg', 'image/png'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  poder_autorizacion: {
    requerido: true,
    tipoPermitido: 'application/pdf',
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  certificado_camara_comercio: {
    requerido: true, // Solo para Jurídica
    tipoPermitido: 'application/pdf',
    maxSize: 5 * 1024 * 1024 // 5MB
  }
};
```

---

## ✅ 4. Validaciones Frontend

### **4.1. Función de Validación Completa**

```javascript
// utils/validaciones.js

export const validarSolicitudCertificacionMarca = (formData) => {
  const errores = [];
  const warnings = [];
  
  // Validar tipo_solicitante
  if (!formData.tipo_solicitante || 
      !['Natural', 'Jurídica'].includes(formData.tipo_solicitante)) {
    errores.push({
      campo: 'tipo_solicitante',
      mensaje: 'Debe seleccionar "Natural" o "Jurídica"'
    });
  }
  
  // Validar campos comunes
  if (!formData.nombres_apellidos || formData.nombres_apellidos.trim().length < 3) {
    errores.push({
      campo: 'nombres_apellidos',
      mensaje: 'El nombre completo debe tener al menos 3 caracteres'
    });
  }
  
  if (!formData.numero_documento || formData.numero_documento.trim().length < 5) {
    errores.push({
      campo: 'numero_documento',
      mensaje: 'El número de documento debe tener al menos 5 caracteres'
    });
  }
  
  // Validar email
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.correo || !emailPattern.test(formData.correo)) {
    errores.push({
      campo: 'correo',
      mensaje: 'El correo electrónico no es válido'
    });
  }
  
  // Validar teléfono
  const telefonoPattern = /^[0-9+\-\s()]+$/;
  if (!formData.telefono || !telefonoPattern.test(formData.telefono)) {
    errores.push({
      campo: 'telefono',
      mensaje: 'El teléfono no es válido'
    });
  }
  
  // Validar archivos
  if (!formData.logotipo) {
    errores.push({
      campo: 'logotipo',
      mensaje: 'El logotipo es obligatorio'
    });
  }
  
  if (!formData.poder_autorizacion) {
    errores.push({
      campo: 'poder_autorizacion',
      mensaje: 'El poder de autorización es obligatorio'
    });
  }
  
  // Validaciones condicionales para Jurídica
  if (formData.tipo_solicitante === 'Jurídica') {
    if (!formData.certificado_camara_comercio) {
      errores.push({
        campo: 'certificado_camara_comercio',
        mensaje: 'El certificado de cámara de comercio es obligatorio para persona jurídica'
      });
    }
    
    if (!formData.razon_social || formData.razon_social.trim().length < 2) {
      errores.push({
        campo: 'razon_social',
        mensaje: 'La razón social es obligatoria para persona jurídica'
      });
    }
    
    if (!formData.nit_empresa) {
      errores.push({
        campo: 'nit_empresa',
        mensaje: 'El NIT de empresa es obligatorio para persona jurídica'
      });
    } else {
      const nit = Number(formData.nit_empresa);
      if (isNaN(nit) || nit < 1000000000 || nit > 9999999999) {
        errores.push({
          campo: 'nit_empresa',
          mensaje: 'El NIT debe tener exactamente 10 dígitos (entre 1000000000 y 9999999999)'
        });
      }
    }
    
    if (!formData.representante_legal || formData.representante_legal.trim().length < 3) {
      errores.push({
        campo: 'representante_legal',
        mensaje: 'El representante legal es obligatorio para persona jurídica'
      });
    }
    
    if (!formData.tipo_entidad) {
      errores.push({
        campo: 'tipo_entidad',
        mensaje: 'El tipo de entidad es obligatorio para persona jurídica'
      });
    }
    
    if (!formData.direccion_domicilio) {
      errores.push({
        campo: 'direccion_domicilio',
        mensaje: 'La dirección de domicilio es obligatoria para persona jurídica'
      });
    }
  }
  
  // Validar tamaño total del payload (aprox)
  const payloadSize = JSON.stringify(formData).length;
  const payloadSizeMB = (payloadSize / (1024 * 1024)).toFixed(2);
  
  if (payloadSize > 10 * 1024 * 1024) {
    warnings.push({
      campo: 'payload',
      mensaje: `El tamaño del payload (${payloadSizeMB}MB) es muy grande. Puede causar errores.`
    });
  }
  
  return {
    esValido: errores.length === 0,
    errores,
    warnings
  };
};
```

---

## 📁 5. Manejo de Archivos

### **5.1. Convertir Archivo a Base64**

```javascript
// utils/fileUtils.js

/**
 * Convierte un archivo a base64
 * @param {File} file - Archivo a convertir
 * @param {boolean} includePrefix - Si incluir el prefijo data:image/jpeg;base64,
 * @returns {Promise<string>} - String en base64
 */
export const fileToBase64 = (file, includePrefix = true) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      let base64String = reader.result;
      
      // Si no se quiere el prefijo, removerlo
      if (!includePrefix && base64String.includes(',')) {
        base64String = base64String.split(',')[1];
      }
      
      resolve(base64String);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Valida un archivo antes de convertirlo
 * @param {File} file - Archivo a validar
 * @param {Object} options - Opciones de validación
 * @returns {Object} - { esValido, error }
 */
export const validarArchivo = (file, options = {}) => {
  const {
    tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    maxSize = 5 * 1024 * 1024, // 5MB por defecto
    minSize = 0
  } = options;
  
  // Validar tipo
  if (!tiposPermitidos.includes(file.type)) {
    return {
      esValido: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${tiposPermitidos.join(', ')}`
    };
  }
  
  // Validar tamaño
  if (file.size > maxSize) {
    return {
      esValido: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${(maxSize / (1024 * 1024)).toFixed(2)}MB`
    };
  }
  
  if (file.size < minSize) {
    return {
      esValido: false,
      error: `El archivo es demasiado pequeño. Tamaño mínimo: ${(minSize / 1024).toFixed(2)}KB`
    };
  }
  
  return { esValido: true };
};

/**
 * Procesa múltiples archivos y los convierte a base64
 * @param {FileList|Array} files - Lista de archivos
 * @param {Object} options - Opciones de validación
 * @returns {Promise<Array>} - Array de objetos { file, base64, error }
 */
export const procesarArchivos = async (files, options = {}) => {
  const resultados = [];
  
  for (const file of Array.from(files)) {
    const validacion = validarArchivo(file, options);
    
    if (!validacion.esValido) {
      resultados.push({
        file,
        base64: null,
        error: validacion.error
      });
      continue;
    }
    
    try {
      const base64 = await fileToBase64(file, true);
      resultados.push({
        file,
        base64,
        error: null
      });
    } catch (error) {
      resultados.push({
        file,
        base64: null,
        error: `Error al procesar archivo: ${error.message}`
      });
    }
  }
  
  return resultados;
};
```

### **5.2. Ejemplo de Uso en Componente React**

```jsx
// components/FileUpload.jsx
import { useState } from 'react';
import { fileToBase64, validarArchivo } from '../utils/fileUtils';

const FileUpload = ({ onFileSelected, tipoArchivo = 'image', label }) => {
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  const tiposPermitidos = tipoArchivo === 'image' 
    ? ['image/jpeg', 'image/jpg', 'image/png']
    : ['application/pdf'];
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setArchivo(null);
      setError(null);
      onFileSelected(null);
      return;
    }
    
    // Validar archivo
    const validacion = validarArchivo(file, {
      tiposPermitidos,
      maxSize: 5 * 1024 * 1024 // 5MB
    });
    
    if (!validacion.esValido) {
      setError(validacion.error);
      setArchivo(null);
      onFileSelected(null);
      return;
    }
    
    setError(null);
    setCargando(true);
    
    try {
      const base64 = await fileToBase64(file, true);
      setArchivo(file);
      onFileSelected(base64);
    } catch (err) {
      setError(`Error al procesar archivo: ${err.message}`);
      setArchivo(null);
      onFileSelected(null);
    } finally {
      setCargando(false);
    }
  };
  
  return (
    <div className="file-upload">
      <label>
        {label}
        <input
          type="file"
          accept={tiposPermitidos.join(',')}
          onChange={handleFileChange}
          disabled={cargando}
        />
      </label>
      {archivo && (
        <div className="file-info">
          <p>Archivo: {archivo.name}</p>
          <p>Tamaño: {(archivo.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {cargando && <div>Cargando...</div>}
    </div>
  );
};
```

---

## 💻 6. Ejemplos de Código

### **6.1. Función Principal para Crear Solicitud (Fetch)**

```javascript
// services/solicitudesService.js
import { API_CONFIG } from '../config';
import { getAuthHeaders } from '../helpers/api';

/**
 * Crea una solicitud de certificación de marca
 * @param {Object} formData - Datos del formulario
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const crearSolicitudCertificacionMarca = async (formData) => {
  try {
    // Preparar datos según tipo de solicitante
    const payload = {
      tipo_solicitante: formData.tipo_solicitante,
      nombres_apellidos: formData.nombres_apellidos,
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento,
      direccion: formData.direccion,
      telefono: formData.telefono,
      correo: formData.correo,
      pais: formData.pais || 'Colombia',
      ciudad: formData.ciudad,
      numero_nit_cedula: formData.numero_nit_cedula,
      nombre_marca: formData.nombre_marca,
      tipo_producto_servicio: formData.tipo_producto_servicio,
      clase_niza: formData.clase_niza,
      logotipo: formData.logotipo,
      poder_autorizacion: formData.poder_autorizacion
    };
    
    // Agregar campos específicos para persona jurídica
    if (formData.tipo_solicitante === 'Jurídica') {
      payload.certificado_camara_comercio = formData.certificado_camara_comercio;
      payload.tipo_entidad = formData.tipo_entidad;
      payload.razon_social = formData.razon_social;
      payload.nit_empresa = Number(formData.nit_empresa);
      payload.representante_legal = formData.representante_legal;
      payload.direccion_domicilio = formData.direccion_domicilio || formData.direccion;
    }
    
    // Realizar petición
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CERTIFICACION_MARCA}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      }
    );
    
    // Verificar respuesta
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    throw error;
  }
};
```

### **6.2. Función con Axios**

```javascript
// services/solicitudesService.js (versión con axios)
import axios from 'axios';
import { API_CONFIG } from '../config';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const crearSolicitudCertificacionMarca = async (formData) => {
  try {
    // Preparar payload (igual que en versión fetch)
    const payload = {
      tipo_solicitante: formData.tipo_solicitante,
      nombres_apellidos: formData.nombres_apellidos,
      // ... resto de campos
    };
    
    if (formData.tipo_solicitante === 'Jurídica') {
      payload.certificado_camara_comercio = formData.certificado_camara_comercio;
      // ... campos jurídica
    }
    
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.CERTIFICACION_MARCA,
      payload
    );
    
    return response.data;
    
  } catch (error) {
    if (error.response) {
      // Error de respuesta del servidor
      throw new Error(error.response.data.mensaje || error.response.data.error);
    } else if (error.request) {
      // Error de red
      throw new Error('Error de conexión. Verifica tu internet.');
    } else {
      // Otro error
      throw error;
    }
  }
};
```

### **6.3. Hook Personalizado para React**

```javascript
// hooks/useCrearSolicitud.js
import { useState } from 'react';
import { crearSolicitudCertificacionMarca } from '../services/solicitudesService';
import { validarSolicitudCertificacionMarca } from '../utils/validaciones';

export const useCrearSolicitud = () => {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [solicitud, setSolicitud] = useState(null);
  
  const crearSolicitud = async (formData) => {
    setCargando(true);
    setError(null);
    setSolicitud(null);
    
    try {
      // Validar datos antes de enviar
      const validacion = validarSolicitudCertificacionMarca(formData);
      
      if (!validacion.esValido) {
        throw new Error(
          `Errores de validación:\n${validacion.errores.map(e => `- ${e.mensaje}`).join('\n')}`
        );
      }
      
      // Crear solicitud
      const resultado = await crearSolicitudCertificacionMarca(formData);
      
      setSolicitud(resultado);
      return resultado;
      
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCargando(false);
    }
  };
  
  return {
    crearSolicitud,
    cargando,
    error,
    solicitud
  };
};
```

---

## 🚨 7. Manejo de Errores

### **7.1. Mapeo de Errores HTTP**

```javascript
// utils/errorHandler.js

export const manejarErrorAPI = (error, response) => {
  if (!response) {
    return {
      tipo: 'NETWORK_ERROR',
      mensaje: 'Error de conexión. Verifica tu internet.',
      detalles: error.message
    };
  }
  
  const status = response.status;
  const data = response.data || {};
  
  switch (status) {
    case 400:
      return {
        tipo: 'VALIDATION_ERROR',
        mensaje: data.mensaje || 'Error de validación',
        detalles: data.camposFaltantes || data.detalles,
        camposFaltantes: data.camposFaltantes
      };
    
    case 401:
      return {
        tipo: 'UNAUTHORIZED',
        mensaje: 'No autorizado. Por favor, inicia sesión nuevamente.',
        detalles: data.error
      };
    
    case 403:
      return {
        tipo: 'FORBIDDEN',
        mensaje: 'No tienes permisos para realizar esta acción.',
        detalles: data.mensaje
      };
    
    case 404:
      return {
        tipo: 'NOT_FOUND',
        mensaje: 'El servicio solicitado no existe.',
        detalles: data.error
      };
    
    case 500:
      return {
        tipo: 'SERVER_ERROR',
        mensaje: data.mensaje || 'Error interno del servidor',
        detalles: data.detalles || data.error,
        // Si el error es de payload demasiado grande
        payloadTooLarge: data.detalles?.tipo === 'PayloadTooLarge'
      };
    
    default:
      return {
        tipo: 'UNKNOWN_ERROR',
        mensaje: data.mensaje || 'Error desconocido',
        detalles: data.error || error.message
      };
  }
};
```

### **7.2. Componente de Manejo de Errores**

```jsx
// components/ErrorDisplay.jsx
const ErrorDisplay = ({ error, onClose }) => {
  if (!error) return null;
  
  const getMensajeUsuario = (error) => {
    switch (error.tipo) {
      case 'VALIDATION_ERROR':
        return (
          <div>
            <p><strong>Errores de validación:</strong></p>
            <ul>
              {error.camposFaltantes?.map((campo, index) => (
                <li key={index}>{campo}</li>
              ))}
            </ul>
          </div>
        );
      
      case 'PAYLOAD_TOO_LARGE':
        return (
          <div>
            <p><strong>El archivo es demasiado grande</strong></p>
            <p>Por favor, reduce el tamaño de los archivos o comprime las imágenes.</p>
          </div>
        );
      
      case 'UNAUTHORIZED':
        return (
          <div>
            <p><strong>Sesión expirada</strong></p>
            <p>Por favor, inicia sesión nuevamente.</p>
          </div>
        );
      
      default:
        return <p>{error.mensaje || 'Ha ocurrido un error'}</p>;
    }
  };
  
  return (
    <div className="error-display">
      {getMensajeUsuario(error)}
      {error.detalles && process.env.NODE_ENV === 'development' && (
        <details>
          <summary>Detalles técnicos</summary>
          <pre>{JSON.stringify(error.detalles, null, 2)}</pre>
        </details>
      )}
      {onClose && (
        <button onClick={onClose}>Cerrar</button>
      )}
    </div>
  );
};
```

---

## 📝 8. Ejemplos Completos

### **8.1. Componente React Completo**

```jsx
// components/FormularioCertificacionMarca.jsx
import { useState } from 'react';
import { useCrearSolicitud } from '../hooks/useCrearSolicitud';
import { fileToBase64, validarArchivo } from '../utils/fileUtils';
import FileUpload from './FileUpload';
import ErrorDisplay from './ErrorDisplay';

const FormularioCertificacionMarca = () => {
  const { crearSolicitud, cargando, error, solicitud } = useCrearSolicitud();
  
  const [formData, setFormData] = useState({
    tipo_solicitante: 'Natural',
    nombres_apellidos: '',
    tipo_documento: 'Cédula de Ciudadanía',
    numero_documento: '',
    direccion: '',
    telefono: '',
    correo: '',
    pais: 'Colombia',
    ciudad: '',
    numero_nit_cedula: '',
    nombre_marca: '',
    tipo_producto_servicio: '',
    clase_niza: '',
    logotipo: null,
    poder_autorizacion: null,
    // Campos jurídica
    certificado_camara_comercio: null,
    tipo_entidad: '',
    razon_social: '',
    nit_empresa: '',
    representante_legal: '',
    direccion_domicilio: ''
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (campo, base64) => {
    setFormData(prev => ({
      ...prev,
      [campo]: base64
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const resultado = await crearSolicitud(formData);
      console.log('Solicitud creada:', resultado);
      // Mostrar mensaje de éxito
      alert('¡Solicitud creada exitosamente!');
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      // El error se maneja automáticamente en el hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Certificación de Marca</h2>
      
      {/* Tipo de Solicitante */}
      <div>
        <label>
          Tipo de Solicitante *
          <select
            name="tipo_solicitante"
            value={formData.tipo_solicitante}
            onChange={handleInputChange}
            required
          >
            <option value="Natural">Persona Natural</option>
            <option value="Jurídica">Persona Jurídica</option>
          </select>
        </label>
      </div>
      
      {/* Campos comunes */}
      <div>
        <label>
          Nombres y Apellidos *
          <input
            type="text"
            name="nombres_apellidos"
            value={formData.nombres_apellidos}
            onChange={handleInputChange}
            required
          />
        </label>
      </div>
      
      <div>
        <label>
          Tipo de Documento *
          <select
            name="tipo_documento"
            value={formData.tipo_documento}
            onChange={handleInputChange}
            required
          >
            <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
            <option value="Cédula de Extranjería">Cédula de Extranjería</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </label>
      </div>
      
      <div>
        <label>
          Número de Documento *
          <input
            type="text"
            name="numero_documento"
            value={formData.numero_documento}
            onChange={handleInputChange}
            required
          />
        </label>
      </div>
      
      {/* Más campos comunes... */}
      
      {/* Campos condicionales para Jurídica */}
      {formData.tipo_solicitante === 'Jurídica' && (
        <>
          <div>
            <label>
              Razón Social *
              <input
                type="text"
                name="razon_social"
                value={formData.razon_social}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>
          
          <div>
            <label>
              NIT Empresa *
              <input
                type="number"
                name="nit_empresa"
                value={formData.nit_empresa}
                onChange={handleInputChange}
                min="1000000000"
                max="9999999999"
                required
              />
            </label>
          </div>
          
          <FileUpload
            tipoArchivo="pdf"
            label="Certificado de Cámara de Comercio *"
            onFileSelected={(base64) => handleFileChange('certificado_camara_comercio', base64)}
          />
          
          {/* Más campos jurídica... */}
        </>
      )}
      
      {/* Archivos comunes */}
      <FileUpload
        tipoArchivo="image"
        label="Logotipo *"
        onFileSelected={(base64) => handleFileChange('logotipo', base64)}
      />
      
      <FileUpload
        tipoArchivo="pdf"
        label="Poder de Autorización *"
        onFileSelected={(base64) => handleFileChange('poder_autorizacion', base64)}
      />
      
      {/* Error Display */}
      {error && <ErrorDisplay error={error} />}
      
      {/* Botón Submit */}
      <button type="submit" disabled={cargando}>
        {cargando ? 'Enviando...' : 'Crear Solicitud'}
      </button>
      
      {/* Mensaje de éxito */}
      {solicitud && (
        <div className="success">
          <p>¡Solicitud creada exitosamente!</p>
          <p>ID de solicitud: {solicitud.data?.orden_id}</p>
        </div>
      )}
    </form>
  );
};

export default FormularioCertificacionMarca;
```

### **8.2. Ejemplo con cURL (Testing)**

```bash
# Ejemplo de petición con cURL
curl -X POST "http://localhost:3000/api/gestion-solicitudes/crear/2" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_solicitante": "Natural",
    "nombres_apellidos": "Juan Gómez",
    "tipo_documento": "Cédula de Ciudadanía",
    "numero_documento": "465788",
    "direccion": "CL 56 # 92 - 108 TORRE 37 APTO 9804",
    "telefono": "3001234567",
    "correo": "juan@example.com",
    "pais": "Colombia",
    "ciudad": "Bogotá",
    "numero_nit_cedula": "23456789",
    "nombre_marca": "DEsports",
    "tipo_producto_servicio": "Venta de ropa",
    "clase_niza": "34",
    "logotipo": "data:image/jpeg;base64,...",
    "poder_autorizacion": "data:application/pdf;base64,..."
  }'
```

---

## ✅ Checklist de Implementación

- [ ] Configurar URL base de la API
- [ ] Implementar autenticación con JWT
- [ ] Crear función de validación de formulario
- [ ] Implementar conversión de archivos a base64
- [ ] Crear servicio para llamar al API
- [ ] Implementar manejo de errores
- [ ] Crear componentes de UI para el formulario
- [ ] Probar con persona Natural
- [ ] Probar con persona Jurídica
- [ ] Probar con archivos grandes (>2MB)
- [ ] Manejar errores de validación
- [ ] Manejar errores de red
- [ ] Mostrar mensajes de éxito/error al usuario

---

## 🔗 Referencias

- **Documentación Técnica Backend:** `DOCUMENTACION_TECNICA_ENDPOINT_CERTIFICACION_MARCA.md`
- **API Base URL:** Configurar en variables de entorno
- **Endpoint:** `POST /api/gestion-solicitudes/crear/2`
- **Servicio ID:** 2 (Certificación de Marca)

---

**Última actualización:** Enero 2026  
**Versión:** 1.0

