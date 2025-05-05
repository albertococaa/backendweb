const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

/** Crear proyecto */
const validatorCreateProject = [
    check("name").exists().notEmpty().withMessage("Project name is required"),
    check("description").optional().isString(),
    check("client").exists().notEmpty().isMongoId().withMessage("Client ID is required"),
    (req, res, next) => validateResults(req, res, next),
];

/** Actualizar proyecto */
const validatorUpdateProject = [
    check("id").exists().notEmpty().isMongoId(),
    check("name").optional().isString(),
    check("description").optional().isString(),
    (req, res, next) => validateResults(req, res, next),
];

/** Obtener, archivar, restaurar, eliminar un proyecto */
const validatorGetProject = [
    check("id").exists().notEmpty().isMongoId(),
    (req, res, next) => validateResults(req, res, next),
];

module.exports = {
    validatorCreateProject,
    validatorUpdateProject,
    validatorGetProject,
};
