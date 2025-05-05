const express = require("express");
const router = express.Router();

const {
    createProjectCtrl,
    updateProjectCtrl,
    getProjectsCtrl,
    getProjectCtrl,
    archiveProjectCtrl,
    deleteProjectCtrl,
    listArchivedProjectsCtrl,
    restoreProjectCtrl
} = require("../controllers/project");

const authMiddleware = require("../middleware/session");
const { validatorCreateProject, validatorUpdateProject, validatorGetProject } = require("../validators/project");

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Endpoints para la gestión de proyectos
 */

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags: [Projects]
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
 *               - client
 *             properties:
 *               name:
 *                 type: string
 *               client:
 *                 type: string
 *                 description: ID del cliente asociado
 *     responses:
 *       201:
 *         description: Proyecto creado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post("/", authMiddleware, validatorCreateProject, createProjectCtrl);

/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Actualizar un proyecto existente
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               client:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Proyecto no encontrado
 */
router.put("/:id", authMiddleware, validatorUpdateProject, updateProjectCtrl);

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Listar todos los proyectos del usuario o compañía
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 */
router.get("/", authMiddleware, getProjectsCtrl);

/**
 * @swagger
 * /api/project/{id}:
 *   get:
 *     summary: Obtener un proyecto específico
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
router.get("/:id", authMiddleware, validatorGetProject, getProjectCtrl);

/**
 * @swagger
 * /api/project/{id}/archive:
 *   patch:
 *     summary: Archivar (soft delete) un proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto archivado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.patch("/:id/archive", authMiddleware, validatorGetProject, archiveProjectCtrl);

/**
 * @swagger
 * /api/project/archived/list:
 *   get:
 *     summary: Listar todos los proyectos archivados
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 */
router.get("/archived/list", authMiddleware, listArchivedProjectsCtrl);

/**
 * @swagger
 * /api/project/{id}/restore:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto restaurado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.patch("/:id/restore", authMiddleware, validatorGetProject, restoreProjectCtrl);

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto permanentemente (hard delete)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *     responses:
 *       200:
 *         description: Proyecto eliminado exitosamente
 *       404:
 *         description: Proyecto no encontrado
 */
router.delete("/:id", authMiddleware, validatorGetProject, deleteProjectCtrl);

module.exports = router;
