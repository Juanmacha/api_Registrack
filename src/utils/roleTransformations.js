/**
 * Utilidades para transformar datos de roles entre el formato del frontend y la API
 */

// Módulos disponibles en el sistema (basados en la API real)
// ✅ Módulos completos: tienen crear, leer, actualizar, eliminar
// ⚠️ Módulos parciales: tienen solo algunas acciones
// ❌ Módulos públicos: no requieren permisos (formularios)
const MODULOS_DISPONIBLES = [
  'usuarios',           // ✅ Completo: crear, leer, actualizar, eliminar
  'empleados',          // ✅ Completo: crear, leer, actualizar, eliminar
  'clientes',           // ✅ Completo: crear, leer, actualizar, eliminar
  'empresas',           // ⚠️ Parcial: crear, leer (falta actualizar, eliminar)
  'servicios',          // ⚠️ Parcial: leer, actualizar (falta crear, eliminar)
  'solicitudes',        // ✅ Completo: crear, leer, actualizar, eliminar
  'citas',              // ✅ Completo: crear, leer, actualizar, eliminar
  'pagos',              // ⚠️ Parcial: crear, leer, actualizar (falta eliminar)
  'roles',              // ✅ Completo: crear, leer, actualizar, eliminar
  'permisos',           // ✅ Completo: crear, leer, actualizar, eliminar
  'privilegios',        // ✅ Completo: crear, leer, actualizar, eliminar
  'seguimiento',        // ✅ Completo: crear, leer, actualizar, eliminar
  'archivos',           // ⚠️ Parcial: crear, leer (falta actualizar, eliminar)
  'tipo_archivos',      // ✅ Completo: crear, leer, actualizar, eliminar
  'solicitud_cita',     // ⚠️ Parcial: crear, leer, actualizar (falta eliminar)
  'detalles_orden',     // ⚠️ Parcial: crear, leer, actualizar (falta eliminar)
  'detalles_procesos',  // ✅ Completo: crear, leer, actualizar, eliminar
  'servicios_procesos', // ⚠️ Parcial: crear, leer, eliminar (falta actualizar)
  'dashboard'           // ⚠️ Parcial: solo leer (correcto, es solo lectura)
  // 'formularios' - ❌ Público, no requiere permisos
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
 * @returns {Object} Objeto con combinaciones específicas de permisos y privilegios
 */
export const transformPermisosToAPI = (permisosFrontend) => {
  console.log('🔄 [Backend] Transformando permisos del frontend:', JSON.stringify(permisosFrontend, null, 2));
  
  // Validar estructura de permisos
  validateFrontendPermissions(permisosFrontend);
  
  // ✅ NUEVO: Crear combinaciones específicas (permiso + privilegio)
  // Formato: [{ permiso: 'gestion_usuarios', privilegio: 'leer' }, ...]
  const combinaciones = [];
  
  MODULOS_DISPONIBLES.forEach(modulo => {
    if (permisosFrontend[modulo]) {
      const nombrePermiso = `gestion_${modulo}`;
      
      // Recorrer cada acción (privilegio) del módulo
      Object.keys(permisosFrontend[modulo]).forEach(accion => {
        // Solo agregar si la acción está en true
        if (permisosFrontend[modulo][accion] === true) {
          combinaciones.push({
            permiso: nombrePermiso,
            privilegio: accion
          });
        }
      });
    }
  });
  
  // Mantener compatibilidad: también devolver arrays de permisos y privilegios únicos
  const permisos = [...new Set(combinaciones.map(c => c.permiso))];
  const privilegios = [...new Set(combinaciones.map(c => c.privilegio))];
  
  const result = { 
    permisos, 
    privilegios,
    combinaciones  // ✅ NUEVO: Combinaciones específicas
  };
  
  console.log('✅ [Backend] Permisos transformados a API:', JSON.stringify(result, null, 2));
  
  return result;
};

/**
 * Transforma un rol de la API al formato del frontend
 * @param {Object} rolAPI - Rol en formato de la API
 * @returns {Object} Rol en formato del frontend
 */
export const transformRoleToFrontend = async (rolAPI) => {
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
  
  // ✅ ESPECIAL: Si es administrador, poner todos los permisos en true
  if (rolAPI.nombre && rolAPI.nombre.toLowerCase() === 'administrador') {
    console.log('👑 [Backend] Rol es administrador - Otorgando todos los permisos');
    MODULOS_DISPONIBLES.forEach(modulo => {
      permisos[modulo] = {
        crear: true,
        leer: true,
        actualizar: true,
        eliminar: true
      };
    });
  } else {
    // Para otros roles, obtener las combinaciones específicas de RolPermisoPrivilegio
    const { RolPermisoPrivilegio, Permiso, Privilegio } = await import('../models/index.js');
    
    if (rolAPI.id_rol) {
      // Obtener todas las combinaciones específicas de este rol (solo IDs)
      const combinaciones = await RolPermisoPrivilegio.findAll({
        where: { id_rol: rolAPI.id_rol },
        attributes: ['id_permiso', 'id_privilegio']
      });
      
      console.log(`📋 [Backend] Combinaciones encontradas para rol ${rolAPI.nombre}:`, combinaciones.length);
      
      // Obtener todos los IDs únicos de permisos y privilegios
      const idsPermisos = [...new Set(combinaciones.map(c => c.id_permiso))];
      const idsPrivilegios = [...new Set(combinaciones.map(c => c.id_privilegio))];
      
      // Obtener los permisos y privilegios por sus IDs
      const permisosData = await Permiso.findAll({
        where: { id_permiso: idsPermisos },
        attributes: ['id_permiso', 'nombre']
      });
      
      const privilegiosData = await Privilegio.findAll({
        where: { id_privilegio: idsPrivilegios },
        attributes: ['id_privilegio', 'nombre']
      });
      
      // Crear mapas para acceso rápido
      const mapaPermisos = {};
      permisosData.forEach(p => {
        mapaPermisos[p.id_permiso] = p.nombre;
      });
      
      const mapaPrivilegios = {};
      privilegiosData.forEach(p => {
        mapaPrivilegios[p.id_privilegio] = p.nombre;
      });
      
      // Procesar cada combinación específica
      combinaciones.forEach(comb => {
        const nombrePermiso = mapaPermisos[comb.id_permiso];
        const nombrePrivilegio = mapaPrivilegios[comb.id_privilegio];
        
        if (nombrePermiso && nombrePrivilegio) {
          // Extraer el módulo del nombre del permiso (ej: "gestion_usuarios" -> "usuarios")
          const modulo = nombrePermiso.replace('gestion_', '');
          
          // Verificar que el módulo existe en MODULOS_DISPONIBLES
          if (MODULOS_DISPONIBLES.includes(modulo) && permisos[modulo]) {
            // Verificar que la acción existe en ACCIONES_DISPONIBLES
            if (ACCIONES_DISPONIBLES.includes(nombrePrivilegio)) {
              permisos[modulo][nombrePrivilegio] = true;
              console.log(`✅ [Backend] Permiso asignado: ${modulo}.${nombrePrivilegio}`);
            }
          }
        }
      });
    }
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
