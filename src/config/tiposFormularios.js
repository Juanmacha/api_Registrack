/**
 * Configuración de campos obligatorios para cada servicio
 * Solo define qué campos son obligatorios según el servicio seleccionado
 */

export const CAMPOS_OBLIGATORIOS_POR_SERVICIO = {
  // 1. Búsqueda de antecedentes
  "Búsqueda de Antecedentes": [
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nombre_a_buscar",
    "tipo_producto_servicio",
    "logotipo",
  ],

  // 2. Registro de Marca (Certificación de marca)
  "Registro de Marca (Certificación de marca)": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "numero_nit_cedula",
    "nombre_marca",
    "tipo_producto_servicio",
    "logotipo",
    "poder_autorizacion"
    // ✅ Campos condicionales removidos: certificado_camara_comercio, tipo_entidad,
    //    razon_social, nit_empresa, representante_legal, direccion_domicilio
    //    Estos se validarán condicionalmente en el controlador según tipo_solicitante
  ],

  // 3. Renovación de marca
  "Renovación de Marca": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nombre_marca",
    "numero_expediente_marca",
    "poder_autorizacion",
    "certificado_renovacion",
    "logotipo",
    // ✅ Campos condicionales removidos: tipo_entidad, razon_social,
    //    nit_empresa, representante_legal
    //    Estos se validarán condicionalmente en el controlador según tipo_solicitante
  ],

  // 4. Cesión de Marca
  "Cesión de Marca": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nombre_marca",
    "numero_expediente_marca",
    "documento_cesion",
    "poder_autorizacion",
    // Datos del cesionario
    "nombre_razon_social_cesionario",
    "nit_cesionario",
    "representante_legal_cesionario",
    "tipo_documento_cesionario",
    "numero_documento_cesionario",
    "correo_cesionario",
    "telefono_cesionario",
    "direccion_cesionario",
  ],

  // 5. Presentación de Oposición
  "Presentación de Oposición": [
    "tipo_solicitante",
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nit_empresa",
    "nombre_marca",
    "marca_a_oponerse",
    "poder_autorizacion",
    // Campos para persona jurídica
    "tipo_entidad",
    "razon_social",
    "representante_legal",
    "argumentos_respuesta",
    "documentos_oposicion",
  ],

  // 6. Respuesta de Oposición
  "Respuesta de Oposición": [
    "nombres_apellidos",
    "tipo_documento",
    "numero_documento",
    "direccion",
    "telefono",
    "correo",
    "pais",
    "nit_empresa",
    "nombre_marca",
    "numero_expediente_marca",
    "marca_opositora",
    "poder_autorizacion",
    // Campos para persona jurídica
    "razon_social",
    "representante_legal",
  ],

  // 7. Ampliación de Alcance (mantener campos actuales)
  "Ampliación de Alcance": [
    "documento_nit_titular",
    "direccion",
    "ciudad",
    "pais",
    "correo",
    "telefono",
    "numero_registro_existente",
    "nombre_marca",
    "clase_niza_actual",
    "nuevas_clases_niza",
    "descripcion_nuevos_productos_servicios",
    "soportes",
  ],
};

/**
 * Obtiene los campos obligatorios para un servicio específico
 * @param {string} nombreServicio - Nombre del servicio
 * @returns {Array} Lista de campos obligatorios o array vacío si no existe
 */
export function obtenerCamposObligatorios(nombreServicio) {
  return CAMPOS_OBLIGATORIOS_POR_SERVICIO[nombreServicio] || [];
}

/**
 * Valida campos obligatorios con lógica condicional
 * @param {string} nombreServicio - Nombre del servicio
 * @param {Object} datos - Datos del formulario
 * @returns {Object} Resultado de validación
 */
export function validarCamposObligatorios(nombreServicio, datos) {
  const camposBase = obtenerCamposObligatorios(nombreServicio);
  const camposFaltantes = [];
  const errores = [];

  // Validación básica para todos los servicios
    for (const campo of camposBase) {
      if (!datos[campo] || datos[campo].toString().trim() === "") {
        camposFaltantes.push(campo);
      errores.push(
        `El campo '${campo}' es requerido para el servicio '${nombreServicio}'`
      );
    }
  }

  // Validaciones específicas por servicio
  if (nombreServicio === "Registro de Marca (Certificación de marca)") {
    const tipoSolicitante = datos.tipo_solicitante;
    
    if (tipoSolicitante === "Natural") {
      // Validar campos específicos para persona natural
      const camposNatural = ["nombres_apellidos", "numero_documento"];
      for (const campo of camposNatural) {
        if (!datos[campo] || datos[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
          errores.push(`El campo '${campo}' es requerido para persona natural`);
        }
      }
    } else if (tipoSolicitante === "Jurídica") {
      // Validar campos específicos para persona jurídica
      const camposJuridica = ["razon_social", "nit_empresa", "representante_legal"];
      for (const campo of camposJuridica) {
        if (!datos[campo] || datos[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
          errores.push(`El campo '${campo}' es requerido para persona jurídica`);
        }
      }
    }
  }

  if (nombreServicio === "Renovación de Marca") {
    const tipoSolicitante = datos.tipo_solicitante;
    
    if (tipoSolicitante === "Natural") {
      const camposNatural = ["nombres_apellidos", "numero_documento"];
      for (const campo of camposNatural) {
        if (!datos[campo] || datos[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
          errores.push(`El campo '${campo}' es requerido para persona natural`);
        }
      }
    } else if (tipoSolicitante === "Jurídica") {
      const camposJuridica = ["razon_social", "nit_empresa", "representante_legal"];
      for (const campo of camposJuridica) {
          if (!datos[campo] || datos[campo].toString().trim() === "") {
            camposFaltantes.push(campo);
          errores.push(`El campo '${campo}' es requerido para persona jurídica`);
        }
      }
    }
  }

  if (nombreServicio === "Cesión de Marca") {
    // Validar datos del cesionario
    const camposCesionario = [
      "nombre_razon_social_cesionario",
      "nit_cesionario",
      "correo_cesionario",
      "telefono_cesionario"
    ];
    
    for (const campo of camposCesionario) {
      if (!datos[campo] || datos[campo].toString().trim() === "") {
        camposFaltantes.push(campo);
        errores.push(`El campo '${campo}' es requerido para el cesionario`);
      }
    }
  }

  if (nombreServicio === "Presentación de Oposición") {
    const tipoSolicitante = datos.tipo_solicitante;
    
    if (tipoSolicitante === "Natural") {
      const camposNatural = ["nombres_apellidos", "numero_documento"];
      for (const campo of camposNatural) {
        if (!datos[campo] || datos[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
          errores.push(`El campo '${campo}' es requerido para persona natural`);
        }
      }
    } else if (tipoSolicitante === "Jurídica") {
      const camposJuridica = ["razon_social", "nit_empresa", "representante_legal"];
      for (const campo of camposJuridica) {
      if (!datos[campo] || datos[campo].toString().trim() === "") {
        camposFaltantes.push(campo);
          errores.push(`El campo '${campo}' es requerido para persona jurídica`);
        }
      }
    }
  }

  return {
    esValido: camposFaltantes.length === 0,
    camposFaltantes,
    errores,
  };
}

/**
 * Valida si un campo es obligatorio para un servicio específico
 * @param {string} nombreServicio - Nombre del servicio
 * @param {string} nombreCampo - Nombre del campo
 * @returns {boolean} True si el campo es obligatorio
 */
export function esCampoObligatorio(nombreServicio, nombreCampo) {
  const camposObligatorios = obtenerCamposObligatorios(nombreServicio);
  return camposObligatorios.includes(nombreCampo);
}

/**
 * Obtiene todos los servicios con información de campos obligatorios
 * @returns {Array} Lista de servicios con sus configuraciones
 */
export function obtenerServiciosConCamposObligatorios() {
  return Object.keys(CAMPOS_OBLIGATORIOS_POR_SERVICIO).map((nombre) => ({
    nombre,
    campos_obligatorios: CAMPOS_OBLIGATORIOS_POR_SERVICIO[nombre],
    total_campos_obligatorios: CAMPOS_OBLIGATORIOS_POR_SERVICIO[nombre].length,
  }));
}
