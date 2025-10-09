import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Verificando configuración de email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'DEFINIDO' : 'NO DEFINIDO');

// Configurar transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Función para probar conexión
async function testEmailConnection() {
  try {
    console.log('🔄 Probando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión exitosa con Gmail');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

// Función para enviar email de prueba
async function sendTestEmail() {
  const mailOptions = {
    from: `"Registrack Test" <${process.env.EMAIL_USER}>`,
    to: 'manumaturana204@gmail.com',
    subject: '🧪 Prueba de Email - Registrack',
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
      <div style="background-color: #007bff; padding: 15px; text-align: center; color: white; border-radius: 5px;">
        <h1>🧪 Prueba de Email</h1>
      </div>
      <div style="background-color: white; padding: 20px; margin-top: 20px; border-radius: 5px;">
        <h2>¡Hola Manuel!</h2>
        <p>Este es un email de prueba para verificar que el sistema de notificaciones funciona correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Estado:</strong> ✅ Sistema de email funcionando</p>
      </div>
    </div>
    `
  };

  try {
    console.log('📧 Enviando email de prueba...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    return false;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('\n🚀 INICIANDO PRUEBAS DE EMAIL\n');
  
  // Verificar variables de entorno
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ ERROR: Variables de entorno EMAIL_USER y EMAIL_PASS no están definidas');
    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Crea un archivo .env en la raíz del proyecto');
    console.log('2. Agrega las siguientes líneas:');
    console.log('   EMAIL_USER=manumaturana204@gmail.com');
    console.log('   EMAIL_PASS=tu_password_de_aplicacion_gmail');
    console.log('3. Para obtener la contraseña de aplicación:');
    console.log('   - Ve a tu cuenta de Google');
    console.log('   - Seguridad > Verificación en 2 pasos');
    console.log('   - Contraseñas de aplicaciones');
    console.log('   - Genera una nueva contraseña para "Registrack"');
    return;
  }

  // Probar conexión
  const connectionOk = await testEmailConnection();
  if (!connectionOk) {
    console.log('\n❌ No se puede continuar sin conexión');
    return;
  }

  // Enviar email de prueba
  const emailOk = await sendTestEmail();
  if (emailOk) {
    console.log('\n🎉 ¡Sistema de email funcionando correctamente!');
  } else {
    console.log('\n❌ Error en el envío de emails');
  }
}

runTests();
