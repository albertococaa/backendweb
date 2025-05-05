const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",  // o "companies" si tienes un modelo de compañías aparte
        required: true
    },
    archived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


module.exports = mongoose.model("clients", ClientSchema);
