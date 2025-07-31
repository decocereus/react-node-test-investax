const mongoose = require('mongoose');

const UserLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], required: true },
    action: { type: String, enum: ["login", "logout"], required: true },
    loginTime: { type: Date, required: false },
    logoutTime: { type: Date, default: null },
    ipAddress: { type: String, required: true },
    tokenName: { type: String, required: true },
    userAgent: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('UserLog', UserLogSchema); 