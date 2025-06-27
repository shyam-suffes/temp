const mongoose = require("mongoose");

let userSchema = mongoose.Schema(
    {
        name: { type: String, default: null },
        game_id:{type:Number,default:null,unique:true},
        email: { type: String, default: null },
        password: { type: String, default: null },
        role: { type: String, enum: ['admin', 'user','subadmin'], default: "user" },
        status: { type: String, enum: ['active', 'blocked', 'deleted','inactive'], default: 'active' },
        gender: { type: String, default: "" },//pi
        imageUrl: { type: String, default: "" },
        OTP: { type: String, default: null },
        OTPExp: { type: Date, default: null },
        authToken: { type: String, default: "" },
        socketId: { type: String, default: null, index: true },
        socketConnectedAt: { type: Date, default: null },
        socketStatus: { type: String, enum: ["online", "offline"], default: "offline" },
    }, { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);