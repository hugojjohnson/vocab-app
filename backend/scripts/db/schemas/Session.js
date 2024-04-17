const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.SchemaTypes.ObjectId, required: true },
    active: { type: Boolean, default: true },
    startedAt: { type: Date, default: () => Date.now() },
})

module.exports = mongoose.model("Sessions", sessionSchema)