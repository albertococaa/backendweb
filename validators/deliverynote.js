const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

/** Crear albarán */
const validatorCreateDeliveryNote = [
    check("type").exists().notEmpty().isIn(["hours", "materials"]),
    check("project").exists().notEmpty().isMongoId(),
    check("hours").optional().isArray(),
    check("hours.*.person").optional().isString(),
    check("hours.*.description").optional().isString(),
    check("hours.*.hoursWorked").optional().isNumeric(),
    check("materials").optional().isArray(),
    check("materials.*.material").optional().isString(),
    check("materials.*.quantity").optional().isNumeric(),
    check("materials.*.unit").optional().isString(),
    (req, res, next) => validateResults(req, res, next),
];

/** Obtener, firmar, borrar */
const validatorGetDeliveryNote = [
    check("id").exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next),
];

module.exports = {
    validatorCreateDeliveryNote,
    validatorGetDeliveryNote
};
