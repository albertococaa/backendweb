const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const { clientsModel } = require("../models");

/** Crear un cliente */


const createClientCtrl = async (req, res) => {
    try {
        const data = matchedData(req);

        // ✅ Debug para ver qué tiene req.user
        console.log("REQ.USER:", req.user);

        // ✅ Lógica segura para obtener el companyId
        let companyId;

        if (req.user.company && req.user.company._id) {
            // Si company es un objeto con _id (por ejemplo: { _id: "662abc..." })
            companyId = req.user.company._id;
        } else if (req.user.company && typeof req.user.company === "string") {
            // Si company ya es un string (ObjectId)
            companyId = req.user.company;
        } else {
            // Por defecto, usamos el _id del propio usuario
            companyId = req.user._id;
        }

        // ✅ Chequeamos si ya existe ese cliente para la misma compañía
        const existsClient = await clientsModel.findOne({
            name: data.name,
            company: companyId
        });

        if (existsClient) {
            return handleHttpError(res, "CLIENT_ALREADY_EXISTS", 409);
        }

        // ✅ Creamos el cliente nuevo
        const newClient = await clientsModel.create({
            ...data,
            company: companyId,
            createdBy: req.user._id
        });

        res.status(201).json(newClient);

    } catch (err) {
        console.log("ERROR CREATE CLIENT:", err);
        handleHttpError(res, "ERROR_CREATING_CLIENT");
    }
};


/** Actualizar cliente */
const updateClientCtrl = async (req, res) => {
    try {
        const { id, ...body } = matchedData(req);
        const updated = await clientsModel.findByIdAndUpdate(id, body, { new: true });
        res.json(updated);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_UPDATE_CLIENT");
    }
};

/** Obtener todos los clientes (usuario + su empresa) */
const getClientsCtrl = async (req, res) =>  {
    try {
        console.log("REQ.USER:", req.user);  // 👀 Debug para ver qué llega

        let companyId;

        if (req.user.company && req.user.company._id) {
            companyId = req.user.company._id;
        } else if (req.user.company && typeof req.user.company === "string") {
            companyId = req.user.company;
        } else {
            companyId = req.user._id;
        }

        const clients = await clientsModel.find({
            company: companyId,
            archived: false
        });

        res.json(clients);

    } catch (err) {
        console.log("ERROR GET CLIENTS:", err);
        handleHttpError(res, "ERROR_GET_CLIENTS");
    }
};

/** Obtener un cliente concreto */
const getClientCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const userId = req.user._id;

        let companyId;
        if (req.user.company && req.user.company._id) {
            companyId = req.user.company._id;
        } else if (req.user.company && typeof req.user.company === "string") {
            companyId = req.user.company;
        } else {
            companyId = req.user._id;
        }

        const client = await clientsModel.findOne({
            _id: id,
            $or: [
                { createdBy: userId },
                { company: companyId }
            ]
        });

        if (!client) return handleHttpError(res, "CLIENT_NOT_FOUND", 404);
        res.json(client);
    } catch (err) {
        console.log("ERROR GET CLIENT:", err);
        handleHttpError(res, "ERROR_GET_CLIENT");
    }
};


/** Archivar (soft delete) */
const archiveClientCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const archived = await clientsModel.findByIdAndUpdate(id, { archived: true }, { new: true });
        res.json({ message: "Client archived", client: archived });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_ARCHIVE_CLIENT");
    }
};

/** Listar clientes archivados */
const listArchivedClientsCtrl = async (req, res) => {
    try {
        const userId = req.user._id;

        // ✅ Aplicamos la lógica segura para obtener companyId
        let companyId;
        if (req.user.company && req.user.company._id) {
            companyId = req.user.company._id;
        } else if (req.user.company && typeof req.user.company === "string") {
            companyId = req.user.company;
        } else {
            companyId = req.user._id;
        }

        const data = await clientsModel.find({
            archived: true,
            $or: [
                { createdBy: userId },
                { company: companyId }
            ]
        });
        res.json(data);
    } catch (err) {
        console.log("ERROR_GET_ARCHIVED_CLIENTS:", err);
        handleHttpError(res, "ERROR_GET_ARCHIVED_CLIENTS");
    }
};


/** Restaurar un cliente archivado */
const restoreClientCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const restored = await clientsModel.findByIdAndUpdate(id, { archived: false }, { new: true });
        res.json({ message: "Client restored", client: restored });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_RESTORE_CLIENT");
    }
};

/** Eliminar (hard delete) */
const deleteClientCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        await clientsModel.findByIdAndDelete(id);
        res.json({ message: "Client deleted" });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_DELETE_CLIENT");
    }
};

module.exports = {
    createClientCtrl,
    updateClientCtrl,
    getClientsCtrl,
    getClientCtrl,
    archiveClientCtrl,
    deleteClientCtrl,
    listArchivedClientsCtrl,
    restoreClientCtrl
};
