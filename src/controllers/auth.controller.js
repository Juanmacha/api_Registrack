import { registerUser, loginUser } from '../services/auth.services.js';

export const register = async (req, res) => {
  try {
    const nuevoUsuario = await registerUser(req.body);
    res.status(201).json({ mensaje: 'Usuario registrado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const { usuario, token } = await loginUser(correo, contrasena);
    res.json({ mensaje: 'Login exitoso', token, usuario });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};
