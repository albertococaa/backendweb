const { matchedData } = require("express-validator");
const { tokenSign } = require("../utils/handleJwt");
const { encrypt, compare } = require("../utils/handlePassword");
const { handleHttpError } = require("../utils/handleError");
const { usersModel } = require("../models");
const { sendEmail } = require("../utils/handleEmail");
const { uploadToPinata } = require("../utils/handleUploadIPFS");
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

/** Registro de usuario */
const registerCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    const password = await encrypt(req.password);
    const body = {
      ...req,
      password,
      code: verificationCode  
    };
    const dataUser = await usersModel.create(body);
    dataUser.set("password", undefined, { strict: false });

    sendEmail({
      subject: "Verificación de Email",
      text: `Tu código de verificación es: ${verificationCode}`,
      from: process.env.EMAIL,
      to: req.email,
    });

    const data = {
      token: await tokenSign(dataUser),
      user: dataUser,
    };
    res.send(data);
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_REGISTER_USER");
  }
};

/** Login de usuario */
const loginCtrl = async (req, res) => {
  try {
    req = matchedData(req);
    const user = await usersModel.findOne({ email: req.email }).select("password name role email status");

    if (!user) return handleHttpError(res, "USER_NOT_EXISTS", 404);

    const hashPassword = user.password;
    const check = await compare(req.password, hashPassword);

    if (!check) return handleHttpError(res, "INVALID_PASSWORD", 401);

    user.set("password", undefined, { strict: false });
    const data = {
      token: await tokenSign(user),
      user,
    };

    res.send(data);
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_LOGIN_USER");
  }
};

/** Validación de email */
const validateEmailCtrl = async (req, res) => {
  try {
    const { code } = matchedData(req);
    const userId = req.user._id;
    const user = await usersModel.findById(userId);

    if (!user || user.code !== code) return handleHttpError(res, "INVALID_CODE", 400);

    user.status = "validated";
    user.code = null;
    await user.save();

    res.json({ message: "Email validated successfully" });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_VALIDATE_EMAIL");
  }
};

/** Obtener usuario desde el token JWT */
const getUserCtrl = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await usersModel.findById(userId).select("-password");
    if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);
    res.json(user);
  } catch (err) {
    handleHttpError(res, "ERROR_GET_USER");
  }
};

/** Eliminar usuario (soft o hard delete) */
const deleteUserCtrl = async (req, res) => {
  try {
    const userId = req.user._id;
    const softDelete = req.query.soft !== "false";
    if (softDelete) {
      await usersModel.findByIdAndUpdate(userId, { status: "deleted" });
    } else {
      await usersModel.findByIdAndDelete(userId);
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    handleHttpError(res, "ERROR_DELETE_USER");
  }
};

/** Onboarding */
const onboardingCtrl = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = matchedData(req);
    const user = await usersModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    handleHttpError(res, "ERROR_ONBOARDING");
  }
};

/** Recuperación de contraseña */
const resetPasswordCtrl = async (req, res) => {
  try {
    const { email, newPassword } = matchedData(req);
    const user = await usersModel.findOne({ email });
    if (!user) return handleHttpError(res, "USER_NOT_FOUND", 404);

    user.password = await encrypt(newPassword);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    handleHttpError(res, "ERROR_RESET_PASSWORD");
  }
};

/** Subida de logo del usuario a IPFS */
const uploadLogoCtrl = async (req, res) => {
  try {
    const userId = req.user._id;
    const file = req.file;
    if (!file) return handleHttpError(res, "NO_FILE_UPLOADED", 400);

    if (file.size > 2 * 1024 * 1024) {
      return handleHttpError(res, "LOGO_TOO_LARGE", 400);
    }

    const result = await uploadToPinata(file.buffer, file.originalname);
    const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

    const user = await usersModel.findByIdAndUpdate(userId, { logo: url }, { new: true }).select("-password");
    res.json({ message: "Logo actualizado", logoUrl: url, user });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_UPLOAD_LOGO");
  }
};

const inviteGuestCtrl = async (req, res) => {
  try {
    const { email } = matchedData(req);
    const exists = await usersModel.findOne({ email });
    if (exists) return handleHttpError(res, "EMAIL_ALREADY_EXISTS", 409);

    const tempPassword = await encrypt("invitadoTemp123");

    const guest = await usersModel.create({
      email,
      role: "guest",
      status: "pending",
      code: verificationCode,
      password: tempPassword
    });
    guest.set("password", undefined, { strict: false });

    await sendEmail({
      subject: "Invitación a la compañía",
      text: `Has sido invitado. Código de validación: ${verificationCode}`,
      from: process.env.EMAIL,
      to: email,
    });

    res.json({ message: "Invitación enviada", guest });
  } catch (err) {
    console.log(err);
    handleHttpError(res, "ERROR_INVITE_GUEST");
  }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params; // ID del usuario que queremos modificar
        const { role } = req.body; // Nuevo rol que queremos asignar

        // Verificamos que el nuevo rol sea válido (opcional)
        const validRoles = ["admin", "user"];
        if (!validRoles.includes(role)) {
            return handleHttpError(res, "INVALID_ROLE", 400);
        }

        // Buscamos el usuario en la base de datos
        const user = await usersModel.findById(id);
        if (!user) {
            return handleHttpError(res, "USER_NOT_FOUND", 404);
        }

        // Actualizamos el rol del usuario
        user.role = role;
        await user.save();

        res.send({ message: "User role cambiado a admin", user });
    } catch (err) {
        console.error(err);
        handleHttpError(res, "ERROR_UPDATING_ROLE");
    }
};


module.exports = {
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
};
