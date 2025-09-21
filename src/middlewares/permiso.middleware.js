// middlewares/permisoValidation.js
import { body, param, validationResult } from 'express-validator';
import { Sequelize } from 'sequelize';
import Permiso from '../models/Permiso.js';

const ONLY_LETTERS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
const sequelize = Permiso.sequelize; // Obtenemos la instancia de Sequelize

//  Manejo de errores: devuelve solo msg
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const simplifiedErrors = errors.array().map(e => ({ msg: e.msg }));
    return res.status(400).json({ errors: simplifiedErrors });
  }
  next();
};

//  Crear permiso
export const createPermisoValidation = [
  body('nombre')
    .exists().withMessage('nombre es requerido')
    .bail()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('nombre debe tener 2-50 caracteres')
    .matches(ONLY_LETTERS).withMessage('nombre solo permite letras y espacios')
    .bail()
    .custom(async (value) => {
      const nombreNormalized = value.trim().toLowerCase();
      const existe = await Permiso.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('nombre')),
          nombreNormalized
        )
      });
      if (existe) throw new Error('El permiso ya existe');
      return true;
    }),
  handleValidationErrors,
];

//  Actualizar permiso
export const updatePermisoValidation = [
  param('id')
    .exists().withMessage('id es requerido')
    .bail()
    .toInt()
    .isInt({ min: 1 }).withMessage('id inválido'),
  body('nombre')
    .optional()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('nombre debe tener 2-50 caracteres')
    .matches(ONLY_LETTERS).withMessage('nombre solo permite letras y espacios')
    .bail()
    .custom(async (value, { req }) => {
      if (!value) return true;
      const nombreNormalized = value.trim().toLowerCase();
      const existe = await Permiso.findOne({
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('nombre')),
          nombreNormalized
        )
      });
      if (existe && existe.id_permiso !== Number(req.params.id)) {
        throw new Error('El permiso ya existe');
      }
      return true;
    }),
  handleValidationErrors,
];

//  Validación de ID
export const idParamValidation = [
  param('id')
    .exists().withMessage('id es requerido')
    .bail()
    .toInt()
    .isInt({ min: 1 }).withMessage('id inválido'),
  handleValidationErrors,
];
