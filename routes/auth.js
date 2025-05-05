const express = require("express");
const router = express.Router();

const { 
  registerCtrl, 
  loginCtrl, 
  validateEmailCtrl, 
  getUserCtrl, 
  deleteUserCtrl, 
  onboardingCtrl, 
  resetPasswordCtrl,
  uploadLogoCtrl,
  inviteGuestCtrl,
  updateUserRole
} = require("../controllers/auth");

const { send } = require("../controllers/mail")

const { 
  validatorRegister, 
  validatorLogin, 
  validatorMail, 
  validatorOnboarding, 
  validatorResetPassword,
  validatorInvite,
} = require("../validators/auth");

const authMiddleware = require("../middleware/session");
const checkRol = require("../middleware/rol");
const { uploadMiddlewareMemory } = require("../utils/handleStorage");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 */
router.post("/register", validatorRegister, registerCtrl, send);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve un token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post("/login", validatorLogin, loginCtrl);

/**
 * @swagger
 * /auth/validate-email:
 *   post:
 *     summary: Valida el email del usuario con un código recibido
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email validado correctamente
 */
router.post("/validate-email", authMiddleware, validatorMail, validateEmailCtrl);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtiene los datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get("/me", authMiddleware, getUserCtrl);

/**
 * @swagger
 * /auth/onboarding:
 *   put:
 *     summary: Completa o actualiza los datos personales y de compañía
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               nif:
 *                 type: string
 *               company:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   cif:
 *                     type: string
 *                   address:
 *                     type: string
 *     responses:
 *       200:
 *         description: Onboarding completado
 */
router.put("/onboarding", authMiddleware, validatorOnboarding, onboardingCtrl);

/**
 * @swagger
 * /auth:
 *   delete:
 *     summary: Elimina la cuenta del usuario (soft o hard delete)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: soft
 *         in: query
 *         schema:
 *           type: boolean
 *         description: Indica si la eliminación es lógica (por defecto true)
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 */
router.delete("/", authMiddleware, checkRol(["admin", "user"]), deleteUserCtrl);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Cambia la contraseña del usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 */
router.post("/reset-password", validatorResetPassword, resetPasswordCtrl);

/**
 * @swagger
 * /auth/logo:
 *   patch:
 *     summary: Sube el logo del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo subido correctamente
 */
router.patch("/logo", authMiddleware, uploadMiddlewareMemory.single("logo"), uploadLogoCtrl);

/**
 * @swagger
 * /auth/invite:
 *   post:
 *     summary: Invita a otro usuario como guest
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invitación enviada correctamente
 */
router.post("/invite", authMiddleware, checkRol(["admin"]), validatorInvite, inviteGuestCtrl);

/**
 * @swagger
 * /auth/{id}:
 *   patch:
 *     summary: Actualiza el rol de un usuario (por ID)
 *     tags: [Auth]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente
 */
router.patch("/:id", updateUserRole);

module.exports = router;
