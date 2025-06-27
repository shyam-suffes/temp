const mongoose = require("mongoose");

let schema = mongoose.Schema(
    {
        type: { type: String, enum: ['ABOUT_US', 'TERMS_AND_CONDITION', 'PRIVACY_POLICY'] },
        description: { type: String, default: "" },
        languageCode: { type: String, default: 'en' },
        image: { type: String, default: null },
        status: { type: String, enum: ["active", "deleted"], default: "active" }
    }, { timestamps: true }
);

module.exports = mongoose.model("Page", schema);