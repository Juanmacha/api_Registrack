/**
 * Utilidades para validación de contraseñas
 * 
 * Incluye:
 * - Validación de contraseñas comunes
 * - Validación de fortaleza
 * - Lista de contraseñas prohibidas
 */

/**
 * Lista de contraseñas comunes que están prohibidas
 * Basada en las contraseñas más comunes según estudios de seguridad
 */
const CONTRASEÑAS_COMUNES = [
  '123456',
  'password',
  '123456789',
  '12345678',
  '12345',
  '1234567',
  '1234567890',
  'qwerty',
  'abc123',
  '111111',
  '123123',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '12345678910',
  'password1',
  'qwerty123',
  'admin123',
  'root',
  'toor',
  'pass',
  'test',
  'guest',
  'info',
  'adm',
  'mysql',
  'user',
  'administrator',
  'oracle',
  'ftp',
  'pi',
  'puppet',
  'ansible',
  'ec2-user',
  'vagrant',
  'azureuser',
  '1234',
  '123',
  '1234567890123456',
  'password123',
  '123456789a',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  'iloveyou',
  'princess',
  'rockyou',
  '123qwe',
  '000000',
  'qwertyui',
  'qwerty123456',
  '1q2w3e4r',
  '1qaz2wsx',
  'qazwsx',
  'password12',
  'password123',
  'welcome123',
  'admin123456',
  'root123',
  'toor123',
  'pass123',
  'test123',
  'guest123'
];

/**
 * Valida que la contraseña no sea una contraseña común
 * @param {string} contraseña - Contraseña a validar
 * @returns {Object|null} - Error object si es común, null si es válida
 */
export const validarContraseñaComun = (contraseña) => {
  if (!contraseña || typeof contraseña !== 'string') {
    return {
      success: false,
      message: 'La contraseña es requerida',
      code: 'PASSWORD_REQUIRED'
    };
  }

  const contraseñaLower = contraseña.toLowerCase().trim();
  
  if (CONTRASEÑAS_COMUNES.includes(contraseñaLower)) {
    return {
      success: false,
      message: 'La contraseña es demasiado común y no es segura. Por favor, elija una contraseña más segura.',
      code: 'COMMON_PASSWORD',
      details: 'Esta contraseña está en la lista de contraseñas más comunes y es vulnerable a ataques. Por favor, use una contraseña única y segura.',
      sugerencias: [
        'Use al menos 8 caracteres',
        'Combine letras mayúsculas y minúsculas',
        'Incluya números y caracteres especiales',
        'Evite palabras comunes o patrones simples',
        'Use una frase única o combinación de palabras'
      ]
    };
  }

  return null; // Contraseña no es común
};

/**
 * Valida la fortaleza de la contraseña
 * @param {string} contraseña - Contraseña a validar
 * @returns {Object|null} - Error object si no cumple requisitos, null si es válida
 */
export const validarFortalezaContraseña = (contraseña) => {
  if (!contraseña || typeof contraseña !== 'string') {
    return {
      success: false,
      message: 'La contraseña es requerida',
      code: 'PASSWORD_REQUIRED'
    };
  }

  // Validar longitud mínima
  if (contraseña.length < 8) {
    return {
      success: false,
      message: 'La contraseña debe tener mínimo 8 caracteres',
      code: 'PASSWORD_TOO_SHORT',
      minLength: 8,
      actualLength: contraseña.length
    };
  }

  // Validar longitud máxima (prevenir DoS)
  if (contraseña.length > 128) {
    return {
      success: false,
      message: 'La contraseña no puede exceder 128 caracteres',
      code: 'PASSWORD_TOO_LONG',
      maxLength: 128,
      actualLength: contraseña.length
    };
  }

  // Validar que tenga al menos una mayúscula
  if (!/[A-Z]/.test(contraseña)) {
    return {
      success: false,
      message: 'La contraseña debe contener al menos una letra mayúscula',
      code: 'PASSWORD_NO_UPPERCASE',
      requisitos: ['Al menos una letra mayúscula (A-Z)']
    };
  }

  // Validar que tenga al menos un número
  if (!/\d/.test(contraseña)) {
    return {
      success: false,
      message: 'La contraseña debe contener al menos un número',
      code: 'PASSWORD_NO_NUMBER',
      requisitos: ['Al menos un número (0-9)']
    };
  }

  // Validar que tenga al menos un carácter especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña)) {
    return {
      success: false,
      message: 'La contraseña debe contener al menos un carácter especial',
      code: 'PASSWORD_NO_SPECIAL',
      requisitos: ['Al menos un carácter especial (!@#$%^&*()_+-=[]{}|;\':"\\,.<>/?']
    };
  }

  return null; // Contraseña cumple todos los requisitos
};

/**
 * Valida completamente una contraseña (común + fortaleza)
 * @param {string} contraseña - Contraseña a validar
 * @returns {Object|null} - Error object si no es válida, null si es válida
 */
export const validarContraseñaCompleta = (contraseña) => {
  // Primero validar que no sea común
  const errorComun = validarContraseñaComun(contraseña);
  if (errorComun) {
    return errorComun;
  }

  // Luego validar fortaleza
  const errorFortaleza = validarFortalezaContraseña(contraseña);
  if (errorFortaleza) {
    return errorFortaleza;
  }

  return null; // Contraseña válida
};

/**
 * Calcula la fortaleza de la contraseña (0-100)
 * @param {string} contraseña - Contraseña a evaluar
 * @returns {Object} - Objeto con score y nivel de fortaleza
 */
export const calcularFortalezaContraseña = (contraseña) => {
  if (!contraseña || contraseña.length === 0) {
    return {
      score: 0,
      nivel: 'Muy Débil',
      porcentaje: 0
    };
  }

  let score = 0;

  // Longitud (máximo 30 puntos)
  if (contraseña.length >= 8) score += 10;
  if (contraseña.length >= 12) score += 10;
  if (contraseña.length >= 16) score += 10;

  // Complejidad (máximo 40 puntos)
  if (/[a-z]/.test(contraseña)) score += 5; // Minúsculas
  if (/[A-Z]/.test(contraseña)) score += 10; // Mayúsculas
  if (/\d/.test(contraseña)) score += 10; // Números
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña)) score += 15; // Especiales

  // Variedad (máximo 30 puntos)
  const caracteresUnicos = new Set(contraseña).size;
  if (caracteresUnicos >= contraseña.length * 0.5) score += 15; // Buena variedad
  if (caracteresUnicos >= contraseña.length * 0.7) score += 15; // Excelente variedad

  // Determinar nivel
  let nivel = 'Muy Débil';
  if (score >= 70) nivel = 'Muy Fuerte';
  else if (score >= 50) nivel = 'Fuerte';
  else if (score >= 30) nivel = 'Media';
  else if (score >= 15) nivel = 'Débil';

  return {
    score,
    nivel,
    porcentaje: score,
    maxScore: 100
  };
};

