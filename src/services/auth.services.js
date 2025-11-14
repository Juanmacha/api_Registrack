import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createUser, findUserByEmail, findRoleByName, findUserByResetToken } from "../repositories/auth.repository.js";
import { Role as Rol } from "../models/index.js";
import { sendPasswordResetEmail, generateResetCode } from "./email.service.js";
import { transformRoleToFrontend } from "../utils/roleTransformations.js";


// Lógica de registro
export const registerUser = async (datos) => {
  // Buscar el rol 'cliente' automáticamente
  const rolCliente = await findRoleByName('cliente');
  if (!rolCliente) {
    throw new Error('El rol cliente no existe en el sistema. Contacte al administrador.');
  }

  const hashedPassword = await bcrypt.hash(datos.contrasena, 10);
  
  // Asignar automáticamente el rol de cliente
  const datosConRol = {
    ...datos,
    contrasena: hashedPassword,
    id_rol: rolCliente.id_rol
  };
  
  return await createUser(datosConRol);
};

// 🔹 Lógica de login
export const loginUser = async (correo, contrasena) => {
  // buscar el usuario incluyendo su rol
  const usuario = await findUserByEmail(correo);
  if (!usuario) {
    // ✅ Usar un error con código específico para mejor manejo
    const error = new Error("Credenciales inválidas");
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Validar que el usuario esté activo
  if (!usuario.estado) {
    const error = new Error("Usuario inactivo");
    error.code = "USER_INACTIVE";
    throw error;
  }

  const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordValida) {
    // ✅ Usar un error con código específico para mejor manejo
    const error = new Error("Credenciales inválidas");
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // asegurarse que el rol está disponible
  const rolUsuario = usuario.rol ? usuario.rol.nombre : null; // 🔹 aquí usamos el alias "rol"
  
  // ✅ Obtener id_rol (disponible directamente en usuario.id_rol o desde usuario.rol.id_rol)
  const idRol = usuario.id_rol || (usuario.rol ? usuario.rol.id_rol : null);

  // ✅ NUEVO: Cargar el rol básico (transformRoleToFrontend obtendrá los permisos desde la tabla intermedia)
  let rolCompleto = null;
  if (idRol) {
    rolCompleto = await Rol.findByPk(idRol, {
      attributes: ['id_rol', 'nombre', 'estado']
    });
  }

  // ✅ NUEVO: Transformar el rol al formato del frontend (con permisos)
  // transformRoleToFrontend obtendrá los permisos desde la tabla rol_permisos_privilegios
  let rolTransformado = null;
  if (rolCompleto) {
    rolTransformado = await transformRoleToFrontend(rolCompleto);
  } else {
    // Si no hay rol, crear un objeto básico
    rolTransformado = {
      id: idRol?.toString() || null,
      nombre: rolUsuario || 'Sin rol',
      estado: 'Activo',
      permisos: {}
    };
  }

  // generar token JWT
  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      rol: rolUsuario,
      id_rol: idRol  // ✅ NUEVO: Incluir id_rol para cargar permisos después
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // devolver datos limpios (sin la contraseña)
  const { contrasena: _, rol: rolOriginal, ...usuarioSinPass } = usuario.toJSON();
  
  // ✅ NUEVO: Agregar el rol transformado (con permisos) al usuario
  return { 
    usuario: {
      ...usuarioSinPass,
      rol: rolTransformado  // ✅ Rol con permisos en formato granular
    }, 
    token 
  };
};

// Lógica para solicitar restablecimiento de contraseña
// Lógica para solicitar restablecimiento de contraseña
// Lógica para solicitar restablecimiento de contraseña
export const handleForgotPassword = async (correo) => {
  const usuario = await findUserByEmail(correo);

  if (!usuario) {
    console.log(`Solicitud de restablecimiento para correo no existente: ${correo}`);
    return;
  }

  // 🔹 Generar código numérico de 6 dígitos
  const resetCode = generateResetCode();

  // Expira en 15 minutos
  const expirationDate = new Date(Date.now() + 15 * 60 * 1000);

  usuario.resetPasswordToken = resetCode;
  usuario.resetPasswordExpires = expirationDate;
  await usuario.save();

  try {
    await sendPasswordResetEmail(usuario.correo, resetCode, usuario.nombre);
  } catch (error) {
    console.error("Error al enviar correo en handleForgotPassword:", error);
  }
};


//  Lógica para restablecer la contraseña
export const handleResetPassword = async (code, newPassword) => {
  // Buscar usuario por el código
  const usuario = await findUserByResetToken(code); // ⚠️ aquí cambia tu repo para que busque por resetPasswordCode

  // Validar que el código sea válido y no haya expirado
  if (!usuario || usuario.resetPasswordExpires < new Date()) {
    throw new Error("Código inválido o expirado. Por favor, solicita un nuevo restablecimiento.");
  }

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar contraseña y limpiar campos del código
  usuario.contrasena = hashedPassword;
  usuario.resetPasswordToken = null;
  usuario.resetPasswordExpires = null;
  await usuario.save();
};



// Lógica para crear usuario con rol específico (solo administradores)
export const createUserWithRole = async (datos) => {
  const { id_rol, ...userData } = datos;
  
  // Validar que se proporcione un rol
  if (!id_rol) {
    throw new Error("El campo id_rol es requerido para crear usuarios por administrador");
  }
  
  // Verificar que el rol existe y esté activo
  const rolExistente = await Rol.findByPk(id_rol);
  if (!rolExistente) {
    throw new Error("El rol especificado no existe");
  }
  
  // ✅ Validar que el rol esté activo (permite cualquier rol existente y activo, no solo los básicos)
  if (rolExistente.estado === false || rolExistente.estado === 0) {
    throw new Error(`El rol "${rolExistente.nombre}" está inactivo. Solo se pueden asignar roles activos a los usuarios.`);
  }
  
  // Verificar duplicados por correo
  const usuarioExistente = await findUserByEmail(userData.correo);
  if (usuarioExistente) {
    throw new Error("Ya existe un usuario con este correo electrónico");
  }
  
  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
  
  // Crear usuario con rol específico
  const nuevoUsuario = await createUser({ 
    ...userData, 
    contrasena: hashedPassword,
    id_rol: id_rol 
  });
  
  // Buscar usuario creado con información del rol
  const usuarioConRol = await findUserByEmail(userData.correo);
  
  // Devolver datos limpios (sin la contraseña)
  const { contrasena: _, ...usuarioSinPass } = usuarioConRol.toJSON();
  
  return usuarioSinPass;
};