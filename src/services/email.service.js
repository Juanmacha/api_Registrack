import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ---------------------------
// CONFIGURACIÓN DE NODEMAILER
// ---------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // correo desde el .env
    pass: process.env.EMAIL_PASS, // contraseña de aplicación
  },
});

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
  // Configurar el contenido del correo
  const mailOptions = {
    from: `"Soporte Registrack" <${process.env.EMAIL_USER}>`,
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
    console.log(`Código de restablecimiento enviado a: ${to}`);
    return resetCode; // lo devuelves para guardarlo en la BD
  } catch (error) {
    console.error(`Error al enviar el correo a ${to}:`, error);
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
  const mailOptions = {
    from: `"Registrack" <${process.env.EMAIL_USER}>`,
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
    console.error(`❌ Error al enviar email a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// Template para notificar asignación al cliente
export const sendAsignacionCliente = async (clienteEmail, clienteNombre, solicitudData) => {
  const mailOptions = {
    from: `"Registrack" <${process.env.EMAIL_USER}>`,
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
    console.error(`❌ Error al enviar email de asignación a cliente ${clienteEmail}:`, error);
    throw error;
  }
};

// Template para nueva asignación (empleado)
export const sendNuevaAsignacionEmpleado = async (empleadoEmail, empleadoNombre, solicitudData) => {
  const mailOptions = {
    from: `"Registrack" <${process.env.EMAIL_USER}>`,
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
    console.error(`❌ Error al enviar email a empleado ${empleadoEmail}:`, error);
    throw error;
  }
};

// Template para notificar reasignación al empleado anterior
export const sendReasignacionEmpleado = async (empleadoEmail, empleadoNombre, solicitudData) => {
  const mailOptions = {
    from: `"Registrack" <${process.env.EMAIL_USER}>`,
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
  const mailOptions = {
    from: `"Registrack" <${process.env.EMAIL_USER}>`,
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