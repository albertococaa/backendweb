const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

// Registro de usuario
const validatorRegister = [
  check("email").exists().notEmpty().isEmail(),
  check("password").exists().notEmpty().isLength({ min: 8, max: 16 }),
  (req, res, next) => validateResults(req, res, next),
];

// Login de usuario
const validatorLogin = [
  check("email").exists().notEmpty().isEmail(),
  check("password").exists().notEmpty().isLength({ min: 8, max: 16 }),
  (req, res, next) => validateResults(req, res, next),
];

// Validación del código de verificación por email
const validatorMail = [
    check("code").exists().notEmpty().isLength({ min: 6, max: 6 }).isNumeric(),
    (req, res, next) => validateResults(req, res, next),
  ];
  
// Onboarding: datos personales y de empresa
const validatorOnboarding = [
  check("name").optional().notEmpty(),
  check("surname").optional().notEmpty(),
  check("nif").optional().notEmpty(),
  check("company.name").optional().notEmpty(),
  check("company.cif").optional().notEmpty(),
  check("company.address").optional().notEmpty(),
  (req, res, next) => validateResults(req, res, next),
];

// Recuperación de contraseña
const validatorResetPassword = [
  check("email").exists().notEmpty().isEmail(),
  check("newPassword").exists().notEmpty().isLength({ min: 8, max: 32 }),
  (req, res, next) => validateResults(req, res, next),
];

const validatorInvite = [
  check("email").exists().notEmpty().isEmail(),
  (req, res, next) => validateResults(req, res, next),
];

module.exports = {
  validatorRegister,
  validatorLogin,
  validatorMail,
  validatorOnboarding,
  validatorResetPassword,
  validatorInvite,
};
