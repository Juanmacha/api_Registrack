// middlewares/privilegioValidation.js
import { body, param, validationResult } from 'express-validator';
import Privilegio from '../models/Privilegio.js';

const ONLY_LETTERS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

// Ahora solo devuelve { error: "mensaje" }
const handleValidationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
};

export const createPrivilegioValidation = [
  body('nombre')
    .exists().withMessage('nombre es requerido')
    .bail()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('nombre debe tener 2-100 caracteres')
    .matches(ONLY_LETTERS).withMessage('nombre solo permite letras y espacios')
    .bail()
    .custom(async (value) => {
      const existe = await Privilegio.findOne({ where: { nombre: value.trim() } });
      if (existe) {
        return Promise.reject('El privilegio ya existe');
      }
    }),
  handleValidationErrors,
];

export const updatePrivilegioValidation = [
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
    .isLength({ min: 2, max: 100 }).withMessage('nombre debe tener 2-100 caracteres')
    .matches(ONLY_LETTERS).withMessage('nombre solo permite letras y espacios')
    .bail()
    .custom(async (value, { req }) => {
      if (!value) return true;
      const existe = await Privilegio.findOne({ where: { nombre: value.trim() } });
      if (existe && existe.id_privilegio !== parseInt(req.params.id)) {
        return Promise.reject('Ya existe un privilegio con este nombre');
      }
    }),
  handleValidationErrors,
];

export const idParamValidation = [
  param('id')
    .exists().withMessage('id es requerido')
    .bail()
    .toInt()
    .isInt({ min: 1 }).withMessage('id inválido'),
  handleValidationErrors,
];
