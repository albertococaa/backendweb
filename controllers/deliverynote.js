const { matchedData } = require("express-validator");
const { handleHttpError } = require("../utils/handleError");
const { deliveryNotesModel, projectsModel, clientsModel, usersModel } = require("../models");
const { uploadToPinata } = require("../utils/handleUploadIPFS");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/** Crear albarán */
const createDeliveryNoteCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = matchedData(req);

        const deliveryNoteData = {
            ...data,
            createdBy: userId
        };

        const newNote = await deliveryNotesModel.create(deliveryNoteData);
        res.json(newNote);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_CREATE_DELIVERYNOTE");
    }
};

/** Listar albaranes */
const getDeliveryNotesCtrl = async (req, res) => {
    try {
        const userId = req.user._id;
        const company = req.user.company || null;
        const data = await deliveryNotesModel.find({
            archived: false,
            $or: [
                { createdBy: userId },
                { company: company }
            ]
        });
        res.json(data);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_GET_DELIVERYNOTES");
    }
};

/** Obtener albarán con populate */
const getDeliveryNoteCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const userId = req.user._id;

        const note = await deliveryNotesModel.findOne({
            _id: id,
            createdBy: userId
        })
        .populate("project")
        .populate({
            path: "project",
            populate: { path: "client" }
        });

        if (!note) return handleHttpError(res, "DELIVERYNOTE_NOT_FOUND", 404);
        res.json(note);
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_GET_DELIVERYNOTE");
    }
};

/** Generar PDF (simple con PDFKit) */
const generatePdfCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const note = await deliveryNotesModel.findById(id)
            .populate("project")
            .populate({
                path: "project",
                populate: { path: "client" }
            })
            .populate("createdBy");

        if (!note) return handleHttpError(res, "DELIVERYNOTE_NOT_FOUND", 404);

        const doc = new PDFDocument();
        const filename = `deliverynote-${note._id}.pdf`;
        const filePath = path.join(__dirname, `../storage/${filename}`);
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        doc.fontSize(20).text("Albarán", { align: "center" });
        doc.moveDown();
        doc.text(`Usuario: ${note.createdBy.email}`);
        doc.text(`Cliente: ${note.project.client.name}`);
        doc.text(`Proyecto: ${note.project.name}`);
        doc.text(`Tipo: ${note.type}`);
        doc.moveDown();

        if (note.hours.length > 0) {
            doc.text("Horas:");
            note.hours.forEach(h => {
                doc.text(`- ${h.person} (${h.hoursWorked} horas): ${h.description}`);
            });
        }

        if (note.materials.length > 0) {
            doc.text("Materiales:");
            note.materials.forEach(m => {
                doc.text(`- ${m.material} (${m.quantity} ${m.unit})`);
            });
        }

        if (note.signed) {
            doc.moveDown();
            doc.text(`Firmado: Sí`);
            if (note.signatureUrl) {
                doc.text(`Firma: ${note.signatureUrl}`);
            }
        } else {
            doc.text("Firmado: No");
        }

        doc.end();

        writeStream.on("finish", () => {
            res.download(filePath, filename, () => {
           //     fs.unlinkSync(filePath); // eliminar después de enviar
            });
        });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_GENERATE_PDF");
    }
};

/** Firmar albarán */
const signDeliveryNoteCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const note = await deliveryNotesModel.findById(id);
        if (!note) return handleHttpError(res, "DELIVERYNOTE_NOT_FOUND", 404);

        if (!req.file) return handleHttpError(res, "NO_SIGNATURE_UPLOADED", 400);

        // Subir firma a IPFS
        const result = await uploadToPinata(req.file.buffer, req.file.originalname);
        const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

        // Marcar como firmado
        note.signed = true;
        note.signatureUrl = url;

        await note.save();

        res.json({ message: "Albarán firmado", deliveryNote: note });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_SIGN_DELIVERYNOTE");
    }
};

/** Eliminar (solo si no está firmado) */
const deleteDeliveryNoteCtrl = async (req, res) => {
    try {
        const { id } = matchedData(req);
        const note = await deliveryNotesModel.findById(id);
        if (!note) return handleHttpError(res, "DELIVERYNOTE_NOT_FOUND", 404);

        if (note.signed) {
            return handleHttpError(res, "CANNOT_DELETE_SIGNED_NOTE", 400);
        }

        await deliveryNotesModel.findByIdAndDelete(id);
        res.json({ message: "Albarán eliminado" });
    } catch (err) {
        console.log(err);
        handleHttpError(res, "ERROR_DELETE_DELIVERYNOTE");
    }
};

module.exports = {
    createDeliveryNoteCtrl,
    getDeliveryNotesCtrl,
    getDeliveryNoteCtrl,
    generatePdfCtrl,
    signDeliveryNoteCtrl,
    deleteDeliveryNoteCtrl
};
