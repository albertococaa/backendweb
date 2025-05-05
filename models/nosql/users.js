const mongoose = require("mongoose");

const UserScheme = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    surname: {
      type: String,
    },
    nif: {
      type: String,
    },
    company: {
      name: String,
      cif: String,
      address: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: ["pending", "validated", "deleted"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["user", "admin", "guest"],
      default: "user",
    },
    code: {
      type: String,
    },
    attempts: {
      type: Number,
      default: 3,
    },
    logo: {
      type: String, // URL del logo
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("users", UserScheme);