const express = require("express");
const router = express.Router();

const {
    createDeliveryNoteCtrl,
    getDeliveryNotesCtrl,
    getDeliveryNoteCtrl,
    deleteDeliveryNoteCtrl,
    generatePdfCtrl,
    signDeliveryNoteCtrl
} = require("../controllers/deliverynote");

const authMiddleware = require("../middleware/session");
const { uploadMiddlewareMemory } = require("../utils/handleStorage");
const {
    validatorCreateDeliveryNote,
    validatorGetDeliveryNote
} = require("../validators/deliverynote");

/**
 * @swagger
 * tags:
 *   name: DeliveryNotes
 *   description: Endpoints para la gestión de albaranes (Delivery Notes)
 */

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - project
 *               - type
 *             properties:
 *               project:
 *                 type: string
 *                 description: ID del proyecto asociado
 *               type:
 *                 type: string
 *                 enum: [hours, materials]
 *               hours:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     person:
 *                       type: string
 *                     hoursWorked:
 *                       type: number
 *                     description:
 *                       type: string
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     material:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *     responses:
 *       201:
 *         description: Albarán creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post("/", authMiddleware, validatorCreateDeliveryNote, createDeliveryNoteCtrl);

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Listar todos los albaranes del usuario o compañía
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 */
router.get("/", authMiddleware, getDeliveryNotesCtrl);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán específico con detalles completos (populate)
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del albarán
 *     responses:
 *       200:
 *         description: Datos completos del albarán
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/:id", authMiddleware, validatorGetDeliveryNote, getDeliveryNoteCtrl);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Generar y descargar el PDF del albarán
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del albarán
 *     responses:
 *       200:
 *         description: PDF generado y descargado
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/pdf/:id", authMiddleware, validatorGetDeliveryNote, generatePdfCtrl);

/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   post:
 *     summary: Firmar un albarán subiendo la firma (imagen)
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del albarán
 *       - in: formData
 *         name: signature
 *         type: file
 *         required: true
 *         description: Imagen de la firma
 *     responses:
 *       200:
 *         description: Albarán firmado exitosamente
 *       400:
 *         description: No se subió la firma
 *       404:
 *         description: Albarán no encontrado
 */
router.post("/:id/sign", authMiddleware, validatorGetDeliveryNote, uploadMiddlewareMemory.single("signature"), signDeliveryNoteCtrl);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del albarán
 *     responses:
 *       200:
 *         description: Albarán eliminado exitosamente
 *       400:
 *         description: No se puede eliminar un albarán firmado
 *       404:
 *         description: Albarán no encontrado
 */
router.delete("/:id", authMiddleware, validatorGetDeliveryNote, deleteDeliveryNoteCtrl);

module.exports = router;
