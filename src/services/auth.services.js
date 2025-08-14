import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../repositories/auth.repository.js';

// Lógica de registro
export const registerUser = async (datos) => {
  const hashedPassword = await bcrypt.hash(datos.contrasena, 10);
  return await createUser({ ...datos, contrasena: hashedPassword });
};

// Lógica de login
export const loginUser = async (correo, contrasena) => {
  const usuario = await findUserByEmail(correo);
  if (!usuario) {
    throw new Error('Usuario no encontrado');
  }

  const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!passwordValida) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    { id_usuario: usuario.id_usuario, id_rol: usuario.id_rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { usuario, token };
};
