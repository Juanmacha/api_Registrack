/**
 * Utilidades para transformar datos de roles entre el formato del frontend y la API
 */

// Módulos disponibles en el sistema (basados en la API real)
const MODULOS_DISPONIBLES = [
  'usuarios', 'empleados', 'clientes', 'empresas', 'servicios',
  'solicitudes', 'citas', 'pagos', 'roles', 'permisos', 'privilegios',
  'seguimiento', 'archivos', 'tipo_archivos', 'formularios',
  'detalles_orden', 'detalles_procesos', 'servicios_procesos'
];

// Acciones disponibles para cada módulo
const ACCIONES_DISPONIBLES = ['crear', 'leer', 'actualizar', 'eliminar'];

/**
 * Valida la estructura de permisos del frontend
 * @param {Object} permisos - Objeto de permisos del frontend
 * @throws {Error} Si la estructura no es válida
 */
export const validateFrontendPermissions = (permisos) => {
  console.log('🔍 [Backend] Validando permisos del frontend:', JSON.stringify(permisos, null, 2));
  
  if (typeof permisos !== 'object' || permisos === null) {
    throw new Error('Los permisos deben ser un objeto');
  }
  
  Object.keys(permisos).forEach(modulo => {
    if (!MODULOS_DISPONIBLES.includes(modulo)) {
      throw new Error(`Módulo inválido: ${modulo}. Módulos válidos: ${MODULOS_DISPONIBLES.join(', ')}`);
    }
    
    if (typeof permisos[modulo] !== 'object' || permisos[modulo] === null) {
      throw new Error(`Los permisos del módulo ${modulo} deben ser un objeto`);
    }
    
    Object.keys(permisos[modulo]).forEach(accion => {
      if (!ACCIONES_DISPONIBLES.includes(accion)) {
        throw new Error(`Acción inválida en ${modulo}: ${accion}. Acciones válidas: ${ACCIONES_DISPONIBLES.join(', ')}`);
      }
      
      if (typeof permisos[modulo][accion] !== 'boolean') {
        throw new Error(`El permiso ${modulo}.${accion} debe ser un booleano`);
      }
    });
  });
  
  console.log('✅ [Backend] Permisos del frontend validados correctamente');
};

/**
 * Transforma permisos del frontend al formato de la API
 * @param {Object} permisosFrontend - Permisos en formato del frontend
 * @returns {Object} Objeto con permisos y privilegios para la API
 */
export const transformPermisosToAPI = (permisosFrontend) => {
  console.log('🔄 [Backend] Transformando permisos del frontend:', JSON.stringify(permisosFrontend, null, 2));
  
  // Validar estructura de permisos
  validateFrontendPermissions(permisosFrontend);
  
  const permisos = [];
  const privilegios = [];
  
  MODULOS_DISPONIBLES.forEach(modulo => {
    if (permisosFrontend[modulo] && Object.values(permisosFrontend[modulo]).some(perm => perm === true)) {
      permisos.push(`gestion_${modulo}`);
      
      Object.keys(permisosFrontend[modulo]).forEach(accion => {
        if (permisosFrontend[modulo][accion] === true && !privilegios.includes(accion)) {
          privilegios.push(accion);
        }
      });
    }
  });
  
  const result = { permisos, privilegios };
  console.log('✅ [Backend] Permisos transformados a API:', JSON.stringify(result, null, 2));
  
  return result;
};

/**
 * Transforma un rol de la API al formato del frontend
 * @param {Object} rolAPI - Rol en formato de la API
 * @returns {Object} Rol en formato del frontend
 */
export const transformRoleToFrontend = (rolAPI) => {
  console.log('🔄 [Backend] Transformando rol de API a frontend:', JSON.stringify(rolAPI, null, 2));
  
  const permisos = {};
  
  // Inicializar todos los módulos con permisos en false
  MODULOS_DISPONIBLES.forEach(modulo => {
    permisos[modulo] = {
      crear: false,
      leer: false,
      actualizar: false,
      eliminar: false
    };
  });
  
  // Procesar permisos de la API
  if (rolAPI.permisos && Array.isArray(rolAPI.permisos)) {
    rolAPI.permisos.forEach(perm => {
      const modulo = perm.nombre ? perm.nombre.replace('gestion_', '') : perm.replace('gestion_', '');
      
      if (permisos[modulo] && rolAPI.privilegios && Array.isArray(rolAPI.privilegios)) {
        rolAPI.privilegios.forEach(priv => {
          const accion = priv.nombre || priv;
          if (permisos[modulo].hasOwnProperty(accion)) {
            permisos[modulo][accion] = true;
          }
        });
      }
    });
  }
  
  const result = {
    id: rolAPI.id_rol?.toString() || rolAPI.id?.toString(),
    nombre: rolAPI.nombre ? rolAPI.nombre.charAt(0).toUpperCase() + rolAPI.nombre.slice(1) : rolAPI.nombre,
    estado: rolAPI.estado ? 'Activo' : 'Inactivo',
    permisos: permisos
  };
  
  console.log('✅ [Backend] Rol transformado a frontend:', JSON.stringify(result, null, 2));
  
  return result;
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export const capitalizeFirstLetter = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convierte string de estado a booleano
 * @param {string|boolean} estado - Estado como string o booleano
 * @returns {boolean} Estado como booleano
 */
export const parseEstado = (estado) => {
  if (typeof estado === 'boolean') return estado;
  if (typeof estado === 'string') {
    return estado.toLowerCase() === 'activo' || estado.toLowerCase() === 'true';
  }
  return false;
};

/**
 * Convierte booleano a string de estado
 * @param {boolean} estado - Estado como booleano
 * @returns {string} Estado como string
 */
export const formatEstado = (estado) => {
  return estado ? 'Activo' : 'Inactivo';
};
