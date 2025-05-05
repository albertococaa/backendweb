const mongoose = require("mongoose");

const DeliveryNoteSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["hours", "materials"],
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    hours: [
        {
            person: String,
            description: String,
            hoursWorked: Number,
            date: Date,
        }
    ],
    materials: [
        {
            material: String,
            quantity: Number,
            unit: String,
            date: Date,
        }
    ],
    signed: {
        type: Boolean,
        default: false,
    },
    signatureUrl: {
        type: String,
    },
    pdfUrl: {
        type: String,
    },
    archived: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("deliverynotes", DeliveryNoteSchema);
