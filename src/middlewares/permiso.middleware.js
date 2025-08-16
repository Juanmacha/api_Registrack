// middlewares/permisoValidation.js
import { body, param, validationResult } from 'express-validator';

const ONLY_LETTERS = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

export const createPermisoValidation = [
  body('nombre')
    .exists().withMessage('nombre es requerido')
    .bail()
    .isString().withMessage('nombre debe ser texto')
    .bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('nombre debe tener 2-50 caracteres')
    .matches(ONLY_LETTERS).withMessage('nombre solo permite letras y espacios'),
  handleValidationErrors,
];

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
    .matches(ONLY_LETTERS).withMessage('nombre solo permite letras y espacios'),
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
