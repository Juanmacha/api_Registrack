import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------
// CONFIGURACIÓN DE NODEMAILER
// ---------------------------
// Validar variables de entorno
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error('❌ ERROR: Variables de entorno EMAIL_USER o EMAIL_PASS no están definidas');
  console.error('   Por favor, verifica tu archivo .env');
}

// Configuración adaptativa según el entorno
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
const isRender = process.env.RENDER === 'true' || process.env.RENDER;

// Timeouts más largos para producción/Render (mayor latencia)
const connectionTimeout = isProduction ? 30000 : 10000; // 30s en producción, 10s en desarrollo
const socketTimeout = isProduction ? 60000 : 30000; // 60s en producción, 30s en desarrollo
const greetingTimeout = isProduction ? 20000 : 10000; // 20s en producción, 10s en desarrollo

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser, // correo desde el .env
    pass: emailPass, // contraseña de aplicación
  },
  // Configuración de timeout y conexión mejorada (adaptativa)
  connectionTimeout: connectionTimeout,
  socketTimeout: socketTimeout,
  greetingTimeout: greetingTimeout,
  pool: true, // Usar pool de conexiones para mejor rendimiento
  maxConnections: 5, // Máximo de conexiones simultáneas
  maxMessages: 100, // Máximo de mensajes por conexión
  rateDelta: 1000, // Ventana de tiempo para rate limiting
  rateLimit: 14, // Máximo de emails por rateDelta (Gmail permite ~14 emails/segundo)
  // Configuración adicional para Render/producción
  ...(isProduction && {
    // En producción, usar más reintentos
    logger: false, // Desactivar logs verbose en producción
    debug: false, // Desactivar debug en producción
  }),
});

// Verificar conexión del transporter al inicializar (NO BLOQUEANTE)
// En Render/producción, la verificación puede fallar por timeout pero no debe detener el servidor
const verifyEmailConnection = () => {
  const timeout = setTimeout(() => {
    console.warn('⚠️ [EMAIL] Verificación de conexión tardando más de lo esperado...');
    console.warn('   Esto es normal en Render/producción. Los emails funcionarán cuando se necesiten.');
  }, isProduction ? 5000 : 3000);

  transporter.verify((error, success) => {
    clearTimeout(timeout);
    
    if (error) {
      // En producción, no fallar si es solo un timeout
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
        console.warn('⚠️ [EMAIL] Timeout al verificar conexión (normal en Render/producción)');
        console.warn('   Los emails se enviarán cuando se necesiten. La verificación puede tardar más en producción.');
        console.warn(`   Email configurado: ${emailUser}`);
        
        if (isRender) {
          console.warn('   💡 En Render, la verificación puede fallar por timeout pero los emails funcionarán.');
          console.warn('   💡 Verifica que EMAIL_USER y EMAIL_PASS estén correctamente configurados en las variables de entorno.');
        }
      } else {
        console.error('❌ [EMAIL] Error verificando configuración de email:', error.message);
        console.error('   Código de error:', error.code);
        console.error('   Por favor, verifica:');
        console.error('   1. Que EMAIL_USER y EMAIL_PASS estén correctamente definidos en .env');
        console.error('   2. Que uses una contraseña de aplicación de Gmail (no tu contraseña normal)');
        console.error('   3. Que tengas 2FA habilitado en tu cuenta de Gmail');
        console.error('   4. Que la contraseña de aplicación no haya expirado');
      }
    } else {
      console.log('✅ [EMAIL] Configuración de email verificada correctamente');
      console.log(`   Email remitente: ${emailUser}`);
      console.log(`   Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
      if (isRender) {
        console.log('   Plataforma: Render');
      }
    }
  });
};

// Ejecutar verificación en background (no bloquea el inicio del servidor)
// Usar setTimeout para no bloquear el inicio
setTimeout(() => {
  verifyEmailConnection();
}, 1000); // Esperar 1 segundo después del inicio para verificar

// ---------------------------
// FUNCIÓN AUXILIAR PARA VALIDAR EMAIL
// ---------------------------
// Función auxiliar para validar email
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// ---------------------------
// FUNCIÓN PARA GENERAR CÓDIGO
// ---------------------------
// FUNCIÓN PARA GENERAR CÓDIGO SOLO NUMÉRICO DE 6 DÍGITOS
// email.service.js
export function generateResetCode(length = 6) {
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}



// --------------------------------------
// FUNCIÓN PARA ENVIAR EL CORREO AL USUARIO
// --------------------------------------
export const sendPasswordResetEmail = async (to, resetCode, userName) => {
  // Validar email antes de intentar enviar
  if (!isValidEmail(to)) {
    console.error(`❌ Email inválido para recuperación de contraseña: ${to}`);
    throw new Error(`Email inválido: ${to}`);
  }

  if (!emailUser) {
    console.error('❌ EMAIL_USER no está definido en las variables de entorno');
    throw new Error('Configuración de email no disponible');
  }

  // Configurar el contenido del correo
  const mailOptions = {
    from: `"Soporte Registrack" <${emailUser}>`,
    to,
    subject: "Código de verificación para restablecer tu contraseña",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <!-- Navbar -->
      <div style="background-color: #007bff; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold; border-radius: 5px 5px 0 0;">
        🔐 Registrack - Verificación de seguridad
      </div>

      <!-- Contenido principal -->
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        
        <h2 style="color: #333;">Hola ${userName},</h2>
        <p style="color: #555; font-size: 15px;">
          Has solicitado restablecer tu contraseña en 
          <strong style="color: #007bff;">Registrack</strong>.
        </p>
        <p style="color: #555; font-size: 15px;">
          Usa el siguiente código de verificación para continuar con el proceso. 
          Este código es válido por <strong>15 minutos</strong>.
        </p>

        <!-- Código -->
        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 22px; color: #212529; text-align: center; letter-spacing: 3px;">
          ${resetCode}
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #777; font-size: 13px; text-align: center;">
          Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 10px;">
          ¡Gracias por confiar en nosotros! <br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Código de restablecimiento enviado a: ${to}`);
    return resetCode; // lo devuelves para guardarlo en la BD
  } catch (error) {
    console.error(`❌ Error al enviar el correo a ${to}:`, error.message);
    console.error(`   Código de error: ${error.code}`);
    throw new Error("No se pudo enviar el correo de restablecimiento.");
  }
};



// ---------------------------
// EJEMPLO DE USO
// ---------------------------
// (En tu controlador o endpoint)
async function requestPasswordReset(email, userName) {
  const code = await sendPasswordResetEmail(email, userName);

  // Guardar en la BD (ejemplo en memoria, deberías usar MongoDB, MySQL, etc.)
  const resetData = {
    email,
    code,
    expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutos
  };

  console.log("Guardado en la BD temporal:", resetData);
  return resetData;
}

// ---------------------------
// EJEMPLO DE VALIDACIÓN DEL CÓDIGO
// ---------------------------
function validateResetCode(inputCode, savedCode, expiresAt) {
  if (Date.now() > expiresAt) {
    return { valid: false, message: "El código ha expirado" };
  }
  if (inputCode !== savedCode) {
    return { valid: false, message: "El código no es correcto" };
  }
  return { valid: true, message: "Código válido, puedes restablecer la contraseña" };
}

// ---------------------------
// NUEVAS FUNCIONES PARA NOTIFICACIONES DE SOLICITUDES
// ---------------------------

// Template para nueva solicitud (cliente)
export const sendNuevaSolicitudCliente = async (clienteEmail, clienteNombre, solicitudData) => {
  // Validar email antes de intentar enviar
  if (!isValidEmail(clienteEmail)) {
    console.error(`❌ Email inválido para enviar a cliente: ${clienteEmail}`);
    throw new Error(`Email inválido: ${clienteEmail}`);
  }

  // Validar que EMAIL_USER esté definido
  if (!emailUser) {
    console.error('❌ EMAIL_USER no está definido en las variables de entorno');
    throw new Error('Configuración de email no disponible');
  }

  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "✅ Solicitud Creada Exitosamente - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #007bff; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        🎉 ¡Solicitud Creada Exitosamente!
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555; font-size: 15px;">Tu solicitud ha sido creada y está siendo procesada:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Solicitud</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID:</strong> ${solicitudData.orden_id}</li>
            <li style="margin: 10px 0;"><strong>Servicio:</strong> ${solicitudData.servicio_nombre}</li>
            <li style="margin: 10px 0;"><strong>Estado:</strong> ${solicitudData.estado_actual}</li>
            <li style="margin: 10px 0;"><strong>Empleado Asignado:</strong> ${solicitudData.empleado_nombre}</li>
            <li style="margin: 10px 0;"><strong>Fecha:</strong> ${solicitudData.fecha_creacion}</li>
          </ul>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>📋 Próximo paso:</strong> Un administrador revisará tu solicitud y te asignará un empleado encargado. 
            Recibirás una notificación cuando esto suceda.
          </p>
        </div>
        
        <p style="color: #555; font-size: 15px;">Puedes consultar el estado en cualquier momento en nuestra plataforma.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Gracias por confiar en nosotros!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de nueva solicitud enviado a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email a cliente ${clienteEmail}:`, error.message);
    console.error(`   Código de error: ${error.code}`);
    console.error(`   Detalles completos:`, error);
    throw error;
  }
};

// Template para notificar asignación al cliente
export const sendAsignacionCliente = async (clienteEmail, clienteNombre, solicitudData) => {
  // Validar email antes de intentar enviar
  if (!isValidEmail(clienteEmail)) {
    console.error(`❌ Email inválido para enviar asignación a cliente: ${clienteEmail}`);
    throw new Error(`Email inválido: ${clienteEmail}`);
  }

  if (!emailUser) {
    console.error('❌ EMAIL_USER no está definido en las variables de entorno');
    throw new Error('Configuración de email no disponible');
  }

  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "👤 Empleado Asignado a tu Solicitud - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #28a745; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        👤 Empleado Asignado
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555; font-size: 15px;">Se ha asignado un empleado a tu solicitud:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Asignación</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Solicitud:</strong> ${solicitudData.orden_id}</li>
            <li style="margin: 10px 0;"><strong>Servicio:</strong> ${solicitudData.servicio_nombre}</li>
            <li style="margin: 10px 0;"><strong>Empleado Asignado:</strong> ${solicitudData.empleado_nombre}</li>
            <li style="margin: 10px 0;"><strong>Email del Empleado:</strong> ${solicitudData.empleado_correo}</li>
            <li style="margin: 10px 0;"><strong>Estado Actual:</strong> ${solicitudData.estado_actual}</li>
          </ul>
        </div>
        
        <p style="color: #555; font-size: 15px;">Tu empleado asignado se pondrá en contacto contigo pronto para continuar con el proceso.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Gracias por tu paciencia!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de asignación enviado a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de asignación a cliente ${clienteEmail}:`, error.message);
    console.error(`   Código de error: ${error.code}`);
    throw error;
  }
};

// Template para nueva asignación (empleado)
export const sendNuevaAsignacionEmpleado = async (empleadoEmail, empleadoNombre, solicitudData) => {
  // Validar email antes de intentar enviar
  if (!isValidEmail(empleadoEmail)) {
    console.error(`❌ Email inválido para enviar asignación a empleado: ${empleadoEmail}`);
    throw new Error(`Email inválido: ${empleadoEmail}`);
  }

  if (!emailUser) {
    console.error('❌ EMAIL_USER no está definido en las variables de entorno');
    throw new Error('Configuración de email no disponible');
  }

  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: empleadoEmail,
    subject: "📋 Nueva Solicitud Asignada - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #28a745; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        📋 Nueva Solicitud Asignada
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${empleadoNombre},</h2>
        <p style="color: #555; font-size: 15px;">Se te ha asignado una nueva solicitud:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Solicitud</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID:</strong> ${solicitudData.orden_id}</li>
            <li style="margin: 10px 0;"><strong>Servicio:</strong> ${solicitudData.servicio_nombre}</li>
            <li style="margin: 10px 0;"><strong>Cliente:</strong> ${solicitudData.cliente_nombre}</li>
            <li style="margin: 10px 0;"><strong>Email del Cliente:</strong> ${solicitudData.cliente_correo}</li>
            <li style="margin: 10px 0;"><strong>Estado:</strong> ${solicitudData.estado_actual}</li>
            <li style="margin: 10px 0;"><strong>Fecha:</strong> ${solicitudData.fecha_creacion}</li>
          </ul>
        </div>
        
        <p style="color: #555; font-size: 15px;">Por favor, inicia el proceso de revisión y contacta al cliente.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Gracias por tu dedicación!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de nueva asignación enviado a empleado: ${empleadoEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email a empleado ${empleadoEmail}:`, error.message);
    console.error(`   Código de error: ${error.code}`);
    throw error;
  }
};

// Template para notificar reasignación al empleado anterior
export const sendReasignacionEmpleado = async (empleadoEmail, empleadoNombre, solicitudData) => {
  // Validar email antes de intentar enviar
  if (!isValidEmail(empleadoEmail)) {
    console.error(`❌ Email inválido para enviar reasignación a empleado: ${empleadoEmail}`);
    throw new Error(`Email inválido: ${empleadoEmail}`);
  }

  if (!emailUser) {
    console.error('❌ EMAIL_USER no está definido en las variables de entorno');
    throw new Error('Configuración de email no disponible');
  }

  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: empleadoEmail,
    subject: "🔄 Solicitud Reasignada - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #ffc107; padding: 15px; text-align: center; color: #212529; font-size: 20px; font-weight: bold;">
        🔄 Solicitud Reasignada
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${empleadoNombre},</h2>
        <p style="color: #555; font-size: 15px;">La siguiente solicitud ha sido reasignada a otro empleado:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Reasignación</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Solicitud:</strong> ${solicitudData.orden_id}</li>
            <li style="margin: 10px 0;"><strong>Servicio:</strong> ${solicitudData.servicio_nombre}</li>
            <li style="margin: 10px 0;"><strong>Nuevo Empleado:</strong> ${solicitudData.nuevo_empleado}</li>
          </ul>
        </div>
        
        <p style="color: #555; font-size: 15px;">Ya no eres responsable de esta solicitud.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Gracias por tu trabajo!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de reasignación enviado a empleado: ${empleadoEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de reasignación a empleado ${empleadoEmail}:`, error);
    throw error;
  }
};

// Template para notificar cambio de estado al cliente
export const sendCambioEstadoCliente = async (clienteEmail, clienteNombre, solicitudData) => {
  // Validar email antes de intentar enviar
  if (!isValidEmail(clienteEmail)) {
    console.error(`❌ Email inválido para enviar cambio de estado a cliente: ${clienteEmail}`);
    throw new Error(`Email inválido: ${clienteEmail}`);
  }

  if (!emailUser) {
    console.error('❌ EMAIL_USER no está definido en las variables de entorno');
    throw new Error('Configuración de email no disponible');
  }

  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "📊 Estado de Solicitud Actualizado - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #17a2b8; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        📊 Estado Actualizado
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555; font-size: 15px;">El estado de tu solicitud ha sido actualizado:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Cambio</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Solicitud:</strong> ${solicitudData.orden_id}</li>
            <li style="margin: 10px 0;"><strong>Servicio:</strong> ${solicitudData.servicio_nombre}</li>
            <li style="margin: 10px 0;"><strong>Estado Anterior:</strong> ${solicitudData.estado_anterior}</li>
            <li style="margin: 10px 0;"><strong>Nuevo Estado:</strong> ${solicitudData.nuevo_estado}</li>
            <li style="margin: 10px 0;"><strong>Fecha de Cambio:</strong> ${solicitudData.fecha_cambio}</li>
            ${solicitudData.comentarios ? `<li style="margin: 10px 0;"><strong>Comentarios:</strong> ${solicitudData.comentarios}</li>` : ''}
          </ul>
        </div>
        
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="color: #155724; margin: 0; font-size: 14px;">
            <strong>📈 Progreso:</strong> Tu solicitud está avanzando en el proceso. 
            ${solicitudData.nuevo_estado === 'Aprobación Final' ? '¡Está cerca de completarse!' : 'Te mantendremos informado de cualquier actualización.'}
          </p>
        </div>
        
        <p style="color: #555; font-size: 15px;">Puedes consultar el estado completo en cualquier momento en nuestra plataforma.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Gracias por tu paciencia!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de cambio de estado enviado a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de cambio de estado a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// EMAIL: ANULACIÓN DE SOLICITUD (CLIENTE)
// ---------------------------
export const sendAnulacionSolicitudCliente = async (clienteEmail, clienteNombre, solicitudData) => {
  const mailOptions = {
    from: `"Registrack - Notificaciones" <${emailUser}>`,
    to: clienteEmail,
    subject: `❌ Solicitud Anulada - Orden #${solicitudData.orden_id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            padding: 30px; 
          }
          .info-box { 
            background: #f8f9fa; 
            padding: 20px; 
            margin: 20px 0; 
            border-left: 4px solid #dc3545;
            border-radius: 4px;
          }
          .info-box h3 {
            margin-top: 0;
            color: #dc3545;
            font-size: 16px;
          }
          .info-box p {
            margin: 8px 0;
            color: #555;
          }
          .info-box strong {
            color: #333;
          }
          .alert-box {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .alert-box p {
            margin: 0;
            color: #856404;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f8f9fa;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #dee2e6;
          }
          .footer p {
            margin: 5px 0;
          }
          .divider {
            height: 1px;
            background: #dee2e6;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Solicitud Anulada</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 16px;">Estimado/a <strong>${clienteNombre}</strong>,</p>
            
            <p>Le informamos que su solicitud ha sido <strong style="color: #dc3545;">anulada</strong> por nuestro equipo administrativo.</p>
            
            <div class="info-box">
              <h3>📋 Detalles de la Solicitud</h3>
              <p><strong>Orden ID:</strong> #${solicitudData.orden_id}</p>
              <p><strong>Expediente:</strong> ${solicitudData.numero_expediente || 'Pendiente de asignación'}</p>
              <p><strong>Servicio:</strong> ${solicitudData.servicio_nombre}</p>
              <p><strong>Fecha de Anulación:</strong> ${new Date(solicitudData.fecha_anulacion).toLocaleString('es-CO', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            
            <div class="info-box">
              <h3>📝 Motivo de la Anulación</h3>
              <p style="font-style: italic; color: #555;">${solicitudData.motivo_anulacion}</p>
            </div>

            <div class="alert-box">
              <p><strong>⚠️ Importante:</strong> Esta solicitud ha sido cancelada y no se continuará con el proceso. Si tiene alguna pregunta o desea iniciar una nueva solicitud, no dude en contactarnos.</p>
            </div>
            
            <div class="divider"></div>
            
            <p style="margin-top: 20px;">Si considera que esta anulación es un error o necesita más información, puede:</p>
            <ul style="color: #555;">
              <li>Responder a este correo</li>
              <li>Contactar con nuestro equipo de soporte</li>
              <li>Visitar nuestra plataforma para más detalles</li>
            </ul>
            
            <p style="margin-top: 30px;"><strong>Atentamente,</strong><br>
            <span style="color: #dc3545; font-weight: 600;">Equipo de Registrack</span></p>
          </div>
          
          <div class="footer">
            <p>📧 Este es un correo automático, por favor no responder directamente.</p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Registrack - Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de anulación enviado a cliente: ${clienteEmail}`);
    
    // Opcional: Registrar notificación en BD
    const Notificacion = (await import('../models/Notificacion.js')).default;
    await Notificacion.create({
      id_orden_servicio: solicitudData.orden_id,
      tipo_notificacion: 'anulacion_solicitud',
      destinatario_email: clienteEmail,
      asunto: mailOptions.subject,
      contenido: mailOptions.html,
      estado_envio: 'enviado'
    }).catch(err => console.error('Error al registrar notificación:', err));
    
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de anulación a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// EMAIL: ANULACIÓN DE SOLICITUD (EMPLEADO)
// ---------------------------
export const sendAnulacionSolicitudEmpleado = async (empleadoEmail, empleadoNombre, solicitudData) => {
  const mailOptions = {
    from: `"Registrack - Notificaciones" <${emailUser}>`,
    to: empleadoEmail,
    subject: `⚠️ Solicitud Anulada - Orden #${solicitudData.orden_id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 600px; 
            margin: 20px auto; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); 
            color: #000; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .content { 
            padding: 30px; 
          }
          .info-box { 
            background: #fff8e1; 
            padding: 20px; 
            margin: 20px 0; 
            border-left: 4px solid #ffc107;
            border-radius: 4px;
          }
          .info-box h3 {
            margin-top: 0;
            color: #ff9800;
            font-size: 16px;
          }
          .info-box p {
            margin: 8px 0;
            color: #555;
          }
          .info-box strong {
            color: #333;
          }
          .alert-box {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .alert-box p {
            margin: 0;
            color: #1565c0;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            background: #f8f9fa;
            color: #666;
            font-size: 14px;
            border-top: 1px solid #dee2e6;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Solicitud Anulada</h1>
          </div>
          
          <div class="content">
            <p style="font-size: 16px;">Hola <strong>${empleadoNombre}</strong>,</p>
            
            <p>Te informamos que una solicitud que tenías asignada ha sido <strong style="color: #ff9800;">anulada</strong> por el equipo administrativo.</p>
            
            <div class="info-box">
              <h3>📋 Detalles de la Solicitud</h3>
              <p><strong>Orden ID:</strong> #${solicitudData.orden_id}</p>
              <p><strong>Servicio:</strong> ${solicitudData.servicio_nombre}</p>
            </div>
            
            <div class="info-box">
              <h3>📝 Motivo de Anulación</h3>
              <p style="font-style: italic;">${solicitudData.motivo_anulacion}</p>
            </div>

            <div class="alert-box">
              <p><strong>ℹ️ Acción Requerida:</strong> Ya no necesitas continuar trabajando en esta solicitud. Puedes enfocar tus esfuerzos en otras solicitudes pendientes.</p>
            </div>
            
            <p style="margin-top: 30px;">Si tienes alguna duda sobre esta anulación, puedes contactar con el equipo administrativo.</p>
            
            <p style="margin-top: 30px;"><strong>Saludos,</strong><br>
            <span style="color: #ff9800; font-weight: 600;">Sistema Registrack</span></p>
          </div>
          
          <div class="footer">
            <p>📧 Notificación automática del sistema</p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Registrack</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de anulación enviado a empleado: ${empleadoEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de anulación a empleado ${empleadoEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// EMAIL: CONFIRMACIÓN DE PAGO
// ---------------------------
export const sendPaymentConfirmationEmail = async (clienteEmail, clienteNombre, paymentData, comprobanteUrl) => {
  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "✅ Pago Confirmado - Comprobante de Pago",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #28a745; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0;">✅ Pago Confirmado</h1>
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px;">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555;">Tu pago ha sido confirmado exitosamente:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles del Pago</h3>
          <p style="margin: 8px 0;"><strong>Monto:</strong> $${parseFloat(paymentData.monto).toLocaleString('es-CO')}</p>
          <p style="margin: 8px 0;"><strong>Método:</strong> ${paymentData.metodo_pago}</p>
          <p style="margin: 8px 0;"><strong>ID de Transacción:</strong> ${paymentData.transaction_id || 'N/A'}</p>
          <p style="margin: 8px 0;"><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">${paymentData.estado}</span></p>
          <p style="margin: 8px 0;"><strong>Fecha:</strong> ${new Date(paymentData.created_at).toLocaleString('es-CO')}</p>
        </div>
        
        ${comprobanteUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${comprobanteUrl}" 
             style="background-color: #28a745; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;
                    font-weight: bold;">
            📄 Descargar Comprobante
          </a>
        </div>
        ` : ''}
        
        ${paymentData.gateway === 'mock' ? `
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Nota:</strong> Este es un pago simulado para pruebas. No hay dinero real involucrado.
          </p>
        </div>
        ` : ''}
        
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          Gracias por tu confianza<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmación de pago enviado a: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de confirmación a ${clienteEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// EMAILS: ALERTAS DE RENOVACIÓN
// ---------------------------

// Email a empleado asignado
export const sendRenovationAlertEmpleado = async (empleadoEmail, nombreEmpleado, datosMarca) => {
  const mailOptions = {
    from: `"Registrack - Alertas" <${emailUser}>`,
    to: empleadoEmail,
    subject: `⚠️ ALERTA: Marca Próxima a Vencer - ${datosMarca.empresa}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .alert-box { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
        .alert-box h3 { margin-top: 0; color: #856404; }
        .alert-box p { margin: 8px 0; color: #856404; }
        .info-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #ff6b6b; border-radius: 4px; }
        .info-box p { margin: 5px 0; color: #555; }
        .info-box strong { color: #333; }
        .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; border-top: 1px solid #dee2e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Alerta: Marca Próxima a Vencer</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px;">Estimado/a <strong>${nombreEmpleado || 'Encargado'}</strong>,</p>
          <p>Le informamos que la marca <strong>${datosMarca.empresa}</strong> (Expediente: ${datosMarca.numero_expediente}) está próxima a vencer.</p>
          
          <div class="alert-box">
            <h3>📊 Detalles de Vencimiento</h3>
            <p><strong>Fecha de Finalización:</strong> ${datosMarca.fecha_finalizacion}</p>
            <p><strong>Fecha de Vencimiento:</strong> ${datosMarca.fecha_vencimiento}</p>
            <p><strong>Días Restantes:</strong> ${datosMarca.dias_restantes}</p>
            <p><strong>Nivel de Urgencia:</strong> ${datosMarca.nivel_urgencia.toUpperCase()}</p>
          </div>

          <div class="info-box">
            <p><strong>👤 Cliente:</strong> ${datosMarca.titular_nombre}</p>
            <p><strong>📧 Email:</strong> ${datosMarca.titular_email || 'No disponible'}</p>
          </div>
          
          <p>Por favor, contacte al cliente para iniciar el proceso de renovación y evitar la pérdida de la marca.</p>
          
          <p style="margin-top: 30px;"><strong>Atentamente,</strong><br>
          <span style="color: #ff6b6b; font-weight: 600;">Sistema Registrack</span></p>
        </div>
        <div class="footer">
          <p>📧 Este es un correo automático del sistema de alertas</p>
          <p>&copy; ${new Date().getFullYear()} Registrack</p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Alerta de renovación enviada a empleado: ${empleadoEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar alerta a empleado ${empleadoEmail}:`, error);
    throw error;
  }
};

// Email a cliente titular
export const sendRenovationAlertCliente = async (clienteEmail, nombreCliente, datosMarca) => {
  const mailOptions = {
    from: `"Registrack - Recordatorios" <${emailUser}>`,
    to: clienteEmail,
    subject: `⏰ Recordatorio: Su marca vence pronto - ${datosMarca.empresa}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .alert-box { background: #d1ecf1; padding: 20px; border-left: 4px solid #0dcaf0; margin: 20px 0; border-radius: 4px; }
        .alert-box h3 { margin-top: 0; color: #0c5460; }
        .alert-box p { margin: 8px 0; color: #0c5460; }
        .info-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #17a2b8; border-radius: 4px; }
        .info-box p { margin: 5px 0; color: #555; }
        .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; border-top: 1px solid #dee2e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Recordatorio: Su Marca Vence Pronto</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px;">Estimado/a <strong>${nombreCliente || 'Cliente'}</strong>,</p>
          <p>Nos dirigimos a usted para informarle que su marca comercial <strong>${datosMarca.empresa}</strong> (Expediente: ${datosMarca.numero_expediente}) está próxima a vencer.</p>
          
          <div class="alert-box">
            <h3>📅 Detalles de Su Marca</h3>
            <p><strong>Fecha de Finalización:</strong> ${datosMarca.fecha_finalizacion}</p>
            <p><strong>Fecha de Vencimiento:</strong> ${datosMarca.fecha_vencimiento}</p>
            <p><strong>Días Restantes:</strong> ${datosMarca.dias_restantes}</p>
          </div>

          <p style="color: #555; font-size: 15px;">Es importante renovar su marca para mantener la protección legal vigente. No dude en contactarnos para iniciar el proceso de renovación.</p>
          
          <p style="margin-top: 30px;"><strong>Equipo Registrack</strong></p>
        </div>
        <div class="footer">
          <p>📧 Este es un correo automático del sistema de recordatorios</p>
          <p>&copy; ${new Date().getFullYear()} Registrack - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Alerta de renovación enviada a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar alerta a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// Email resumen a administradores
export const sendRenovationAlertAdmin = async (adminEmail, datosResumen) => {
  const mailOptions = {
    from: `"Registrack - Alertas Admin" <${emailUser}>`,
    to: adminEmail,
    subject: `📢 Alerta Global: ${datosResumen.total} Marca(s) Próxima(s) a Vencer`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .summary-box { background: #fff; border: 2px solid #ff6b6b; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .summary-box h2 { margin-top: 0; color: #ff6b6b; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #ff6b6b; color: white; }
        tr:hover { background-color: #f5f5f5; }
        .critico { background-color: #ffebee; }
        .alto { background-color: #fff3e0; }
        .medio { background-color: #fff9c4; }
        .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; border-top: 1px solid #dee2e6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 Alerta Global de Renovaciones</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px;">Estimado/a <strong>Administrador</strong>,</p>
          <p>Se han detectado <strong>${datosResumen.total}</strong> marca(s) próxima(s) a vencer:</p>
          
          <div class="summary-box">
            <h2>📊 Resumen por Urgencia</h2>
            <p><strong>🔴 Crítico (≤15 días):</strong> ${datosResumen.por_urgencia.critico}</p>
            <p><strong>🟠 Alto (≤30 días):</strong> ${datosResumen.por_urgencia.alto}</p>
            <p><strong>🟡 Medio (≤60 días):</strong> ${datosResumen.por_urgencia.medio}</p>
            <p><strong>⚪ Bajo (>60 días):</strong> ${datosResumen.por_urgencia.bajo}</p>
          </div>

          ${datosResumen.marcas.length > 0 ? `
          <h3>📋 Detalles de Marcas</h3>
          <table>
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Empresa</th>
                <th>Vencimiento</th>
                <th>Días Restantes</th>
                <th>Urgencia</th>
              </tr>
            </thead>
            <tbody>
              ${datosResumen.marcas.map(m => `
                <tr class="${m.nivel_urgencia}">
                  <td>${m.numero_expediente}</td>
                  <td>${m.empresa}</td>
                  <td>${m.fecha_vencimiento}</td>
                  <td>${m.dias_restantes}</td>
                  <td>${m.nivel_urgencia.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ` : ''}
          
          <p style="margin-top: 30px;"><strong>Acción Requerida:</strong> Revise y coordine con los empleados asignados para contactar a los clientes.</p>
          
          <p style="margin-top: 30px;"><strong>Atentamente,</strong><br>
          <span style="color: #ff6b6b; font-weight: 600;">Sistema de Alertas Registrack</span></p>
        </div>
        <div class="footer">
          <p>📧 Este es un correo automático del sistema de alertas administrativas</p>
          <p>&copy; ${new Date().getFullYear()} Registrack</p>
        </div>
      </div>
    </body>
    </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Alerta resumen enviada a administrador: ${adminEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar alerta resumen a admin ${adminEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// FUNCIONES PARA NOTIFICACIONES DE CITAS
// ---------------------------

// Email al cliente sobre cita programada
export const sendCitaProgramadaCliente = async (clienteEmail, clienteNombre, citaData) => {
  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "📅 Cita Programada - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #007bff; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        📅 Cita Programada
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555; font-size: 15px;">Te informamos que se ha programado una cita para tu solicitud:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Cita</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Solicitud:</strong> ${citaData.solicitud_id}</li>
            <li style="margin: 10px 0;"><strong>Servicio:</strong> ${citaData.servicio}</li>
            <li style="margin: 10px 0;"><strong>Fecha:</strong> ${citaData.fecha}</li>
            <li style="margin: 10px 0;"><strong>Hora:</strong> ${citaData.hora_inicio} - ${citaData.hora_fin}</li>
            <li style="margin: 10px 0;"><strong>Modalidad:</strong> ${citaData.modalidad}</li>
            ${citaData.empleado_nombre ? `<li style="margin: 10px 0;"><strong>Empleado:</strong> ${citaData.empleado_nombre}</li>` : ''}
            ${citaData.observacion ? `<li style="margin: 10px 0;"><strong>Observación:</strong> ${citaData.observacion}</li>` : ''}
          </ul>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>⏰ Recordatorio:</strong> ${citaData.modalidad === 'Presencial' ? 'Te esperamos en nuestras oficinas' : 'Te enviaremos el enlace de la videollamada un día antes de la cita'}.
          </p>
        </div>
        
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="color: #721c24; margin: 0; font-size: 14px;">
            <strong>⚠️ Importante:</strong> Si no puedes presentarte a la cita, por favor comunícate con nosotros con anticipación para cancelarla o reprogramarla.
          </p>
        </div>
        
        <p style="color: #555; font-size: 15px;">Si necesitas reprogramar tu cita, por favor contáctanos con anticipación.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Estamos aquí para ayudarte!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de cita programada enviado a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de cita a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// Email al empleado sobre cita programada
export const sendCitaProgramadaEmpleado = async (empleadoEmail, empleadoNombre, citaData) => {
  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: empleadoEmail,
    subject: "📅 Nueva Cita Programada - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #28a745; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        📅 Nueva Cita Programada
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${empleadoNombre},</h2>
        <p style="color: #555; font-size: 15px;">Se ha programado una nueva cita que te ha sido asignada:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Cita</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Solicitud:</strong> ${citaData.solicitud_id}</li>
            <li style="margin: 10px 0;"><strong>Servicio:</strong> ${citaData.servicio}</li>
            <li style="margin: 10px 0;"><strong>Cliente:</strong> ${citaData.cliente_nombre}</li>
            <li style="margin: 10px 0;"><strong>Email del Cliente:</strong> ${citaData.cliente_email}</li>
            <li style="margin: 10px 0;"><strong>Fecha:</strong> ${citaData.fecha}</li>
            <li style="margin: 10px 0;"><strong>Hora:</strong> ${citaData.hora_inicio} - ${citaData.hora_fin}</li>
            <li style="margin: 10px 0;"><strong>Modalidad:</strong> ${citaData.modalidad}</li>
            ${citaData.observacion ? `<li style="margin: 10px 0;"><strong>Observación:</strong> ${citaData.observacion}</li>` : ''}
          </ul>
        </div>
        
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="color: #721c24; margin: 0; font-size: 14px;">
            <strong>⚠️ Importante:</strong> Si no puedes presentarte a la cita, por favor comunícate con nosotros con anticipación para cancelarla o reprogramarla.
          </p>
        </div>
        
        <p style="color: #555; font-size: 15px;">Por favor, prepárate para esta cita y asegúrate de tener toda la información relevante.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Gracias por tu compromiso!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de cita programada enviado a empleado: ${empleadoEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de cita a empleado ${empleadoEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// EMAIL: SOLICITUD DE CITA CREADA (CLIENTE)
// ---------------------------
export const sendSolicitudCitaCreada = async (clienteEmail, clienteNombre, solicitudData) => {
  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "📅 Solicitud de Cita Creada - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #007bff; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        📅 Solicitud de Cita Creada
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555; font-size: 15px;">Hemos recibido tu solicitud de cita. Los detalles son los siguientes:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Solicitud</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Solicitud:</strong> ${solicitudData.solicitud_id}</li>
            <li style="margin: 10px 0;"><strong>Tipo:</strong> ${solicitudData.tipo}</li>
            <li style="margin: 10px 0;"><strong>Fecha:</strong> ${solicitudData.fecha}</li>
            <li style="margin: 10px 0;"><strong>Hora:</strong> ${solicitudData.hora}</li>
            <li style="margin: 10px 0;"><strong>Modalidad:</strong> ${solicitudData.modalidad}</li>
            ${solicitudData.descripcion ? `<li style="margin: 10px 0;"><strong>Descripción:</strong> ${solicitudData.descripcion}</li>` : ''}
          </ul>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>⏳ Estado:</strong> Tu solicitud está <strong>pendiente de aprobación</strong>. Un administrador revisará tu solicitud y te notificará la decisión.
          </p>
        </div>
        
        <p style="color: #555; font-size: 15px;">Recibirás una notificación cuando tu solicitud sea aprobada o rechazada.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Gracias por confiar en nosotros!<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de solicitud de cita creada enviado a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de solicitud de cita a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// EMAIL: SOLICITUD DE CITA APROBADA (CLIENTE)
// ---------------------------
export const sendSolicitudCitaAprobada = async (clienteEmail, clienteNombre, citaData) => {
  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "✅ Solicitud de Cita Aprobada - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #28a745; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        ✅ ¡Solicitud de Cita Aprobada!
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555; font-size: 15px;">¡Excelente noticia! Tu solicitud de cita ha sido aprobada:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Cita</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Cita:</strong> ${citaData.cita_id}</li>
            <li style="margin: 10px 0;"><strong>Tipo:</strong> ${citaData.tipo}</li>
            <li style="margin: 10px 0;"><strong>Fecha:</strong> ${citaData.fecha}</li>
            <li style="margin: 10px 0;"><strong>Hora:</strong> ${citaData.hora_inicio} - ${citaData.hora_fin}</li>
            <li style="margin: 10px 0;"><strong>Modalidad:</strong> ${citaData.modalidad}</li>
            ${citaData.empleado_nombre ? `<li style="margin: 10px 0;"><strong>Empleado:</strong> ${citaData.empleado_nombre}</li>` : ''}
            ${citaData.observacion_admin ? `<li style="margin: 10px 0;"><strong>Observaciones:</strong> ${citaData.observacion_admin}</li>` : ''}
          </ul>
        </div>
        
        <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="color: #155724; margin: 0; font-size: 14px;">
            <strong>✅ Estado:</strong> Tu cita está <strong>programada y confirmada</strong>.
            ${citaData.modalidad === 'Presencial' ? 'Te esperamos en nuestras oficinas.' : 'Te enviaremos el enlace de la videollamada un día antes de la cita.'}
          </p>
        </div>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>📞 Importante:</strong> Si deseas <strong>anular o reprogramar</strong> tu cita, por favor comunícate con las oficinas de Certimarcas con anticipación. Estaremos encantados de ayudarte a encontrar un nuevo horario que se ajuste a tus necesidades.
          </p>
        </div>
        
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          ¡Te esperamos!<br>
          <em>El equipo de Registrack - Certimarcas</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de solicitud de cita aprobada enviado a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de solicitud de cita aprobada a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// ---------------------------
// EMAIL: SOLICITUD DE CITA RECHAZADA (CLIENTE)
// ---------------------------
export const sendSolicitudCitaRechazada = async (clienteEmail, clienteNombre, solicitudData) => {
  const mailOptions = {
    from: `"Registrack" <${emailUser}>`,
    to: clienteEmail,
    subject: "❌ Solicitud de Cita Rechazada - Registrack",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 0; margin: 0;">
      <div style="background-color: #dc3545; padding: 15px; text-align: center; color: white; font-size: 20px; font-weight: bold;">
        ❌ Solicitud de Cita Rechazada
      </div>
      <div style="background-color: #ffffff; max-width: 600px; margin: 20px auto; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Hola ${clienteNombre},</h2>
        <p style="color: #555; font-size: 15px;">Lamentamos informarte que tu solicitud de cita ha sido rechazada:</p>
        
        <div style="background-color: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Detalles de la Solicitud</h3>
          <ul style="color: #555; list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>ID Solicitud:</strong> ${solicitudData.solicitud_id}</li>
            <li style="margin: 10px 0;"><strong>Tipo:</strong> ${solicitudData.tipo}</li>
            <li style="margin: 10px 0;"><strong>Fecha:</strong> ${solicitudData.fecha}</li>
            <li style="margin: 10px 0;"><strong>Hora:</strong> ${solicitudData.hora}</li>
            <li style="margin: 10px 0;"><strong>Modalidad:</strong> ${solicitudData.modalidad}</li>
          </ul>
        </div>
        
        ${solicitudData.observacion_admin ? `
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="color: #721c24; margin: 0; font-size: 14px;">
            <strong>📝 Observaciones:</strong> ${solicitudData.observacion_admin}
          </p>
        </div>
        ` : ''}
        
        <p style="color: #555; font-size: 15px;">Puedes crear una nueva solicitud de cita en otro horario si lo deseas.</p>
        <p style="color: #777; font-size: 13px; text-align: center; margin-top: 30px;">
          Para más información, contáctanos.<br>
          <em>El equipo de Registrack</em>
        </p>
      </div>
    </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de solicitud de cita rechazada enviado a cliente: ${clienteEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error al enviar email de solicitud de cita rechazada a cliente ${clienteEmail}:`, error);
    throw error;
  }
};