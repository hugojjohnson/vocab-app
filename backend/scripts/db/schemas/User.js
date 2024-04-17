const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    username: { type: String, required: true },
    createdAt: { type: Date, default: () => Date.now(), immutable: true },
    google: String,
    password: String,
})

module.exports = mongoose.model("Users", userSchema)