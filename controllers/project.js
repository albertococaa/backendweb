const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const { projectsModel } = require("../models");

/** Utilidad para obtener un companyId seguro */
const getSafeCompanyId = (user) => {
    if (user.company && user.company._id) {
        return user.company._id;
    } else if (user.company && typeof user.company === "string") {
        return user.company;
    } else {
        return user._id;
    }
};

/** Crear proyecto */
const createProjectCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = getSafeCompanyId(req.user);
        const data = matchedData(req);

        // ✅ Verifica si ya existe el proyecto para ese usuario/compañía
        const exists = await projectsModel.findOne({
            name: data.name,
            client: data.client,
            company: companyId
        });

        if (exists) {
            return handleHttpError(res, "PROJECT_ALREADY_EXISTS", 409);
        }

        const projectData = {
            ...data,
            createdBy: userId,
            company: companyId
        };

        const newProject = await projectsModel.create(projectData);
        res.json(newProject);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_CREATE_PROJECT");
    }
};

/** Actualizar proyecto */
const updateProjectCtrl = async (req, res) => {
    try {
        const { id, ...body } = matchedData(req);
        const updated = await projectsModel.findByIdAndUpdate(id, body, { new: true });
        res.json(updated);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_UPDATE_PROJECT");
    }
};

/** Obtener todos los proyectos */
const getProjectsCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = getSafeCompanyId(req.user);

        const data = await projectsModel.find({
            archived: false,
            $or: [
                { createdBy: userId },
                { company: companyId }
            ]
        }).populate("client"); // opcional: incluir datos del cliente

        res.json(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_GET_PROJECTS");
    }
};

/** Obtener un proyecto */
const getProjectCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const userId = req.user._id;
        const companyId = getSafeCompanyId(req.user);

        const project = await projectsModel.findOne({
            _id: id,
            $or: [
                { createdBy: userId },
                { company: companyId }
            ]
        }).populate("client");

        if (!project) return handleHttpError(res, "PROJECT_NOT_FOUND", 404);
        res.json(project);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_GET_PROJECT");
    }
};

/** Archivar (soft delete) */
const archiveProjectCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const archived = await projectsModel.findByIdAndUpdate(id, { archived: true }, { new: true });
        res.json({ message: "Project archived", project: archived });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_ARCHIVE_PROJECT");
    }
};

/** Listar proyectos archivados */
const listArchivedProjectsCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const companyId = getSafeCompanyId(req.user);

        const data = await projectsModel.find({
            archived: true,
            $or: [
                { createdBy: userId },
                { company: companyId }
            ]
        });
        res.json(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_GET_ARCHIVED_PROJECTS");
    }
};

/** Restaurar proyecto */
const restoreProjectCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const restored = await projectsModel.findByIdAndUpdate(id, { archived: false }, { new: true });
        res.json({ message: "Project restored", project: restored });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_RESTORE_PROJECT");
    }
};

/** Eliminar (hard delete) */
const deleteProjectCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        await projectsModel.findByIdAndDelete(id);
        res.json({ message: "Project deleted" });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_DELETE_PROJECT");
    }
};

module.exports = {
    createProjectCtrl,
    updateProjectCtrl,
    getProjectsCtrl,
    getProjectCtrl,
    archiveProjectCtrl,
    deleteProjectCtrl,
    listArchivedProjectsCtrl,
    restoreProjectCtrl
};
