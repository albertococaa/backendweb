const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    archived: {
        type: Boolean,
        default: false,
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "clients",
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model("projects", ProjectSchema);
