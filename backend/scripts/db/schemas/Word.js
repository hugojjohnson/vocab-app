const mongoose = require("mongoose");

const unknownWordSchema = new mongoose.Schema({
    value: { type: String, required: true },
    learned: { type: Boolean, default: false },
    dateLearned: Date
})

const wordListSchema = new mongoose.Schema({
    user: { type: mongoose.SchemaTypes.ObjectId, required: true },
    unknown: [unknownWordSchema],
    known: [String]
})

module.exports = mongoose.model("Words", wordListSchema)