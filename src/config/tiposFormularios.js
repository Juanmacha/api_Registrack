/**
 * Configuración de campos obligatorios para cada servicio
 * Solo define qué campos son obligatorios según el servicio seleccionado
 */

export const CAMPOS_OBLIGATORIOS_POR_SERVICIO = {
  // 1. Búsqueda de antecedentes
  "busqueda-antecedentes": [
    "nombre_solicitante",
    "documento_solicitante",
    "correo_electronico",
    "telefono",
    "marca_buscar",
    "clase_niza",
    "descripcion_adicional",
  ],

  // 2. Certificación de marca - CAMPOS BASE + CONDICIONALES
  "certificacion-marca": [
    "tipo_titular",
    "nombre_marca",
    "clase_niza",
    "descripcion_marca",
    "logo",
  ],

  // 3. Renovación de marca
  "renovacion-marca": [
    "tipo_titular",
    "numero_registro_marca",
    "nombre_marca",
    "clase_niza",
    "titular_nombre_razon_social",
    "titular_documento_nit",
    "titular_direccion",
    "titular_ciudad",
    "titular_pais",
    "titular_correo",
    "titular_telefono",
    "actua_como_representante",
    "nombre_representante",
    "documento_representante",
    "poder",
    "logo_marca",
  ],

  // 4. Cesión de derechos
  "cesion-derechos": [
    "documento_nit_titular_actual",
    "documento_nit_nuevo_titular",
    "direccion_nuevo_titular",
    "correo_nuevo_titular",
    "telefono_nuevo_titular",
    "numero_registro_marca",
    "clase_niza",
    "nombre_marca",
    "documento_cesion",
  ],

  // 5. Oposición
  oposicion: [
    "nombre_opositor",
    "documento_nit_opositor",
    "direccion",
    "ciudad",
    "pais",
    "correo",
    "telefono",
    "marca_conflicto",
    "numero_solicitud_opuesta",
    "clase_niza",
    "argumentos_oposicion",
    "soportes",
  ],

  // 6. Respuesta a oposición
  "respuesta-oposicion": [
    "nombre_titular_responde",
    "documento_nit_titular",
    "direccion",
    "ciudad",
    "pais",
    "correo",
    "telefono",
    "numero_solicitud_registro_oposicion",
    "clase_niza",
    "argumentos_respuesta",
    "soportes",
  ],

  // 7. Ampliación de cobertura
  "ampliacion-cobertura": [
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
 * Valida campos obligatorios con lógica condicional para certificación
 * @param {string} nombreServicio - Nombre del servicio
 * @param {Object} datos - Datos del formulario
 * @returns {Object} Resultado de validación
 */
export function validarCamposObligatorios(nombreServicio, datos) {
  const camposBase = obtenerCamposObligatorios(nombreServicio);
  const camposFaltantes = [];
  const errores = [];

  // Para certificación, validar campos condicionales
  if (nombreServicio === "certificacion-marca") {
    // Validar campos base
    for (const campo of camposBase) {
      if (!datos[campo] || datos[campo].toString().trim() === "") {
        camposFaltantes.push(campo);
        errores.push(`El campo '${campo}' es requerido`);
      }
    }

    // Validar campos según tipo de titular
    const tipoTitular = datos.tipo_titular;

    if (tipoTitular === "natural") {
      const camposNatural = [
        "titular_persona_natural_nombre",
        "titular_persona_natural_documento",
        "titular_persona_natural_direccion",
        "titular_persona_natural_ciudad",
        "titular_persona_natural_pais",
        "titular_persona_natural_correo",
        "titular_persona_natural_telefono",
      ];

      for (const campo of camposNatural) {
        if (!datos[campo] || datos[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
          errores.push(`El campo '${campo}' es requerido para persona natural`);
        }
      }
    } else if (tipoTitular === "juridica") {
      const camposJuridica = [
        "titular_persona_juridica_razon_social",
        "titular_persona_juridica_nit",
      ];

      for (const campo of camposJuridica) {
        if (!datos[campo] || datos[campo].toString().trim() === "") {
          camposFaltantes.push(campo);
          errores.push(
            `El campo '${campo}' es requerido para persona jurídica`
          );
        }
      }

      // Si actúa como representante, validar campos adicionales
      if (datos.actua_como_representante === true) {
        const camposRepresentante = [
          "representante_legal_documento",
          "nombre_representante",
          "documento_representante",
          "poder",
        ];

        for (const campo of camposRepresentante) {
          if (!datos[campo] || datos[campo].toString().trim() === "") {
            camposFaltantes.push(campo);
            errores.push(
              `El campo '${campo}' es requerido cuando actúa como representante`
            );
          }
        }
      }
    }
  } else {
    // Para otros servicios, validación normal
    for (const campo of camposBase) {
      if (!datos[campo] || datos[campo].toString().trim() === "") {
        camposFaltantes.push(campo);
        errores.push(
          `El campo '${campo}' es requerido para el servicio '${nombreServicio}'`
        );
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
