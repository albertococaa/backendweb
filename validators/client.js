const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

/** Crear cliente */
const validatorCreateClient = [
    check("name").exists().notEmpty().withMessage("Name is required"),
    check("contactEmail").optional().isEmail().withMessage("Invalid email format"),
    check("phone").optional().isString(),
    check("address").optional().isString(),
    (req, res, next) => validateResults(req, res, next),
];

/** Actualizar cliente */
const validatorUpdateClient = [
    check("id").exists().notEmpty().isMongoId(),
    check("name").optional().isString(),
    check("contactEmail").optional().isEmail(),
    check("phone").optional().isString(),
    check("address").optional().isString(),
    (req, res, next) => validateResults(req, res, next),
];

/** Obtener, archivar, restaurar, eliminar un cliente */
const validatorGetClient = [
    check("id").exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next),
];

module.exports = {
    validatorCreateClient,
    validatorUpdateClient,
    validatorGetClient,
};
