import { Op } from "sequelize";
import User from "../models/user.js";
import { Rol } from "../models/user_rol.js";

// Middleware para validar creación de usuario por administrador
export const validarCrearUsuarioPorAdmin = async (req, res, next) => {
  try {
    console.log('🔍 [Validación] Validando creación de usuario por administrador');
    console.log('🔍 [Validación] Body recibido:', {
      tipo_documento: req.body.tipo_documento,
      documento: req.body.documento ? '***' : undefined,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      correo: req.body.correo,
      contrasena: req.body.contrasena ? '***' : undefined,
      id_rol: req.body.id_rol,
      telefono: req.body.telefono
    });
    
    const {
      tipo_documento,
      documento,
      nombre,
      apellido,
      correo,
      contrasena,
      id_rol,
    } = req.body;

    // Validar campos obligatorios (incluyendo id_rol)
    const camposFaltantes = [];
    if (!tipo_documento) camposFaltantes.push('tipo_documento');
    if (!documento) camposFaltantes.push('documento');
    if (!nombre) camposFaltantes.push('nombre');
    if (!apellido) camposFaltantes.push('apellido');
    if (!correo) camposFaltantes.push('correo');
    if (!contrasena) camposFaltantes.push('contrasena');
    if (!id_rol) camposFaltantes.push('id_rol');
    
    if (camposFaltantes.length > 0) {
      console.log('❌ [Validación] Campos faltantes:', camposFaltantes);
      return res.status(400).json({
        success: false,
        mensaje: "Campos obligatorios faltantes",
        campos_faltantes: camposFaltantes,
        mensaje_completo: `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}`
      });
    }

    // Validar documento entre 6 y 10 dígitos
    const documentoStr = documento.toString();
    if (!/^\d{6,10}$/.test(documentoStr)) {
      console.log('❌ [Validación] Documento inválido:', documentoStr);
      return res.status(400).json({ 
        success: false,
        mensaje: "El documento debe tener entre 6 y 10 números",
        campo: 'documento',
        valor: documentoStr,
        formato_esperado: '6-10 dígitos numéricos'
      });
    }

    // Validar correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      console.log('❌ [Validación] Correo inválido:', correo);
      return res.status(400).json({ 
        success: false,
        mensaje: "El correo no es válido",
        campo: 'correo',
        valor: correo,
        formato_esperado: 'email@dominio.com'
      });
    }

    // Validar contraseña segura
    if (
      !/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}/.test(
        contrasena
      )
    ) {
      console.log('❌ [Validación] Contraseña no cumple requisitos');
      return res.status(400).json({
        success: false,
        mensaje: "La contraseña no cumple con los requisitos de seguridad",
        campo: 'contrasena',
        requisitos: [
          'Mínimo 8 caracteres',
          'Al menos una letra mayúscula',
          'Al menos un número',
          'Al menos un carácter especial (!@#$%^&*()_+-=[]{}|;\':"\\|,.<>/?'
        ]
      });
    }

    // Validar que el correo no exista
    console.log('🔍 [Validación] Verificando si el correo existe:', correo);
    const existeCorreo = await User.findOne({ where: { correo } });
    if (existeCorreo) {
      console.log('❌ [Validación] Correo ya existe:', correo);
      return res.status(400).json({ 
        success: false,
        mensaje: "El correo ya está registrado",
        campo: 'correo',
        valor: correo
      });
    }

    // Validar que el documento no exista
    console.log('🔍 [Validación] Verificando si el documento existe:', documentoStr);
    const existeDocumento = await User.findOne({ where: { documento: documentoStr } });
    if (existeDocumento) {
      console.log('❌ [Validación] Documento ya existe:', documentoStr);
      return res.status(400).json({ 
        success: false,
        mensaje: "El documento ya está registrado",
        campo: 'documento',
        valor: documentoStr
      });
    }

    // Validar que el rol exista y esté activo
    console.log('🔍 [Validación] Verificando rol:', id_rol);
    const idRolNum = typeof id_rol === 'string' ? parseInt(id_rol) : id_rol;
    if (isNaN(idRolNum) || idRolNum <= 0) {
      console.log('❌ [Validación] ID de rol inválido:', id_rol);
      return res.status(400).json({
        success: false,
        mensaje: "El id_rol debe ser un número válido mayor a 0",
        campo: 'id_rol',
        valor: id_rol
      });
    }
    
    const rolValido = await Rol.findByPk(idRolNum);
    if (!rolValido) {
      console.log('❌ [Validación] Rol no encontrado:', idRolNum);
      return res.status(400).json({ 
        success: false,
        mensaje: "El rol especificado no existe",
        campo: 'id_rol',
        valor: idRolNum,
        detalles: "El rol con este ID no existe en la base de datos. Verifique el ID del rol."
      });
    }

    // ✅ Validar que el rol esté activo (permite cualquier rol existente y activo)
    if (rolValido.estado === false || rolValido.estado === 0) {
      console.log('❌ [Validación] Rol inactivo:', rolValido.nombre);
      return res.status(400).json({
        success: false,
        mensaje: "El rol especificado está inactivo",
        campo: 'id_rol',
        valor: idRolNum,
        rol_encontrado: rolValido.nombre,
        estado: 'inactivo',
        detalles: "Solo se pueden asignar roles activos a los usuarios. Active el rol primero si desea usarlo."
      });
    }

    console.log('✅ [Validación] Rol válido y activo:', rolValido.nombre, '(ID:', idRolNum, ')');

    console.log('✅ [Validación] Validación exitosa, pasando al siguiente middleware');
    next();
  } catch (error) {
    console.error('❌ [Validación] Error en validarCrearUsuarioPorAdmin:', error);
    return res.status(500).json({
      success: false,
      mensaje: "Error en la validación",
      error: error.message,
      detalles: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
