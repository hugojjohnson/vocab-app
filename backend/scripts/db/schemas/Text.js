const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
    user: { type: mongoose.SchemaTypes.ObjectId, required: true },
    dateAdded: { type: Date, default: () => Date.now() },
    language: { type: String, required: true },
    title: { type: String, required: true },
    value: { type: String, required: true },
})

module.exports = mongoose.model("Texts", textSchema)