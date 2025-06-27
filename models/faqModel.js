const mongoose = require("mongoose");

let schema = mongoose.Schema(
    {
        question:             { type: String, default: '' },
        answer:               { type: String, default: '' },
        status:               { type: String, enum: ['active', 'deleted'], default: 'active' },
        languageCode: { type: String, default: 'en' },
    }, { timestamps: true }
);

module.exports = mongoose.model("Faq", schema);