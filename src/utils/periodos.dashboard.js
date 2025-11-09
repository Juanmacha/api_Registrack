// src/utils/periodos.dashboard.js

/**
 * Configuración de períodos disponibles para el dashboard
 */
export const PERIODOS_DISPONIBLES = {
  '1mes': {
    meses: 1,
    label: '1 Mes',
    tipo: 'corto',
    descripcion: 'Último mes'
  },
  '3meses': {
    meses: 3,
    label: '3 Meses',
    tipo: 'corto',
    descripcion: 'Último trimestre'
  },
  '6meses': {
    meses: 6,
    label: '6 Meses',
    tipo: 'medio',
    descripcion: 'Último semestre'
  },
  '12meses': {
    meses: 12,
    label: '12 Meses',
    tipo: 'medio',
    descripcion: 'Último año'
  },
  '18meses': {
    meses: 18,
    label: '18 Meses',
    tipo: 'medio',
    descripcion: 'Últimos 18 meses'
  },
  '2anos': {
    meses: 24,
    label: '2 Años',
    tipo: 'largo',
    descripcion: 'Últimos 2 años'
  },
  '3anos': {
    meses: 36,
    label: '3 Años',
    tipo: 'largo',
    descripcion: 'Últimos 3 años'
  },
  '5anos': {
    meses: 60,
    label: '5 Años',
    tipo: 'largo',
    descripcion: 'Últimos 5 años'
  },
  'todo': {
    meses: null,
    label: 'Todos',
    tipo: 'completo',
    descripcion: 'Todos los datos disponibles'
  },
  'custom': {
    meses: null,
    label: 'Personalizado',
    tipo: 'custom',
    descripcion: 'Rango de fechas personalizado'
  }
};

/**
 * Período por defecto
 */
export const PERIODO_DEFECTO = '12meses';

/**
 * Validar si un período es válido
 * @param {string} periodo - Período a validar
 * @returns {boolean} - true si es válido, false en caso contrario
 */
export function validarPeriodo(periodo) {
  return periodo && PERIODOS_DISPONIBLES.hasOwnProperty(periodo);
}

/**
 * Obtener período válido o retornar el por defecto
 * @param {string} periodo - Período a validar
 * @returns {string} - Período válido
 */
export function obtenerPeriodoValido(periodo) {
  if (validarPeriodo(periodo)) {
    return periodo;
  }
  console.warn(`⚠️ Período inválido: ${periodo}. Usando período por defecto: ${PERIODO_DEFECTO}`);
  return PERIODO_DEFECTO;
}

/**
 * Calcular rango de fechas según período
 * @param {string} periodo - Período seleccionado
 * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD) para periodo custom (opcional)
 * @param {string} fechaFin - Fecha fin (YYYY-MM-DD) para periodo custom (opcional)
 * @returns {{inicio: string | null, fin: string | null}} - Objeto con fecha inicio y fin
 */
export function calcularRangoFechas(periodo, fechaInicio = null, fechaFin = null) {
  // Validar y normalizar período
  const periodoValido = obtenerPeriodoValido(periodo);
  const config = PERIODOS_DISPONIBLES[periodoValido];

  // Si es "todo", no aplicar filtro de fecha
  if (periodoValido === 'todo') {
    return {
      inicio: null,
      fin: null
    };
  }

  // Si es "custom", usar las fechas proporcionadas
  if (periodoValido === 'custom' && fechaInicio && fechaFin) {
    // Validar formato de fechas
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
      console.warn('⚠️ Fechas inválidas en período custom. Usando período por defecto.');
      periodo = PERIODO_DEFECTO;
    } else if (fechaInicioDate > fechaFinDate) {
      console.warn('⚠️ Fecha inicio mayor que fecha fin. Intercambiando fechas.');
      return {
        inicio: fechaFin,
        fin: fechaInicio
      };
    } else {
      return {
        inicio: fechaInicio,
        fin: fechaFin
      };
    }
  }

  // Si es custom sin fechas válidas, usar período por defecto
  if (periodoValido === 'custom') {
    console.warn('⚠️ Período custom sin fechas válidas. Usando período por defecto.');
    periodo = PERIODO_DEFECTO;
  }

  // Calcular fechas según meses
  const hoy = new Date();
  const fechaInicioCalc = new Date(hoy);
  
  // Restar meses
  fechaInicioCalc.setMonth(hoy.getMonth() - config.meses);
  
  // Formatear fechas (YYYY-MM-DD)
  const inicio = fechaInicioCalc.toISOString().split('T')[0];
  const fin = hoy.toISOString().split('T')[0];

  return {
    inicio,
    fin
  };
}

/**
 * Obtener lista de períodos disponibles para el frontend
 * @returns {Array} - Lista de períodos con información completa
 */
export function obtenerPeriodosDisponibles() {
  return Object.keys(PERIODOS_DISPONIBLES)
    .filter(key => key !== 'custom') // Excluir custom de la lista (se maneja de forma especial)
    .map(key => ({
      value: key,
      label: PERIODOS_DISPONIBLES[key].label,
      tipo: PERIODOS_DISPONIBLES[key].tipo,
      descripcion: PERIODOS_DISPONIBLES[key].descripcion
    }));
}

/**
 * Obtener períodos disponibles agrupados por tipo
 * @returns {Object} - Objeto con períodos agrupados por tipo
 */
export function obtenerPeriodosAgrupados() {
  const periodos = obtenerPeriodosDisponibles();
  
  return {
    cortos: periodos.filter(p => p.tipo === 'corto'),
    medianos: periodos.filter(p => p.tipo === 'medio'),
    largos: periodos.filter(p => p.tipo === 'largo'),
    completo: periodos.filter(p => p.tipo === 'completo')
  };
}

