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