const express = require("express");
const router = express.Router();

const {
    createClientCtrl,
    updateClientCtrl,
    getClientsCtrl,
    getClientCtrl,
    archiveClientCtrl,
    deleteClientCtrl,
    listArchivedClientsCtrl,
    restoreClientCtrl
} = require("../controllers/client");

const authMiddleware = require("../middleware/session");
const { validatorCreateClient, validatorUpdateClient, validatorGetClient } = require("../validators/client");

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Endpoints para gestionar clientes
 */

/**
 * @swagger
 * /api/client:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post("/", authMiddleware, validatorCreateClient, createClientCtrl);

/**
 * @swagger
 * /api/client/{id}:
 *   put:
 *     summary: Actualizar un cliente existente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Cliente no encontrado
 */
router.put("/:id", authMiddleware, validatorUpdateClient, updateClientCtrl);

/**
 * @swagger
 * /api/client:
 *   get:
 *     summary: Obtener todos los clientes del usuario o compañía
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get("/", authMiddleware, getClientsCtrl);

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Obtener un cliente específico
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Datos del cliente
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", authMiddleware, validatorGetClient, getClientCtrl);

/**
 * @swagger
 * /api/client/{id}/archive:
 *   patch:
 *     summary: Archivar (soft delete) un cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente archivado exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
router.patch("/:id/archive", authMiddleware, validatorGetClient, archiveClientCtrl);

/**
 * @swagger
 * /api/client/archived/list:
 *   get:
 *     summary: Listar todos los clientes archivados
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get("/archived/list", authMiddleware, listArchivedClientsCtrl);

/**
 * @swagger
 * /api/client/{id}/restore:
 *   patch:
 *     summary: Restaurar un cliente archivado
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente restaurado exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
router.patch("/:id/restore", authMiddleware, validatorGetClient, restoreClientCtrl);

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Eliminar (hard delete) un cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *       404:
 *         description: Cliente no encontrado
 */
router.delete("/:id", authMiddleware, validatorGetClient, deleteClientCtrl);

module.exports = router;
