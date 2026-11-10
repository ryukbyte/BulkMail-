
const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },

    body: {
        type: String,
        required: true
    },

    recipients: {
        type: [String],
        required: true
    },

    status: {
        type: String,
        default: "Pending"
    }

}, {
    timestamps: true
});

const Email = mongoose.model("Email", emailSchema);

module.exports = Email;

