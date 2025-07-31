const express = require("express");
const UserLog = require("../models/UserLog");
const jwt = require("jsonwebtoken");

const router = express.Router();

const getClientIP = (req) => {
    return req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip ||
           'Unknown';
};

const createLogEntry = async (req, action, token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const ipAddress = getClientIP(req);
        
        const logEntry = new UserLog({
            userId: decoded.userId,
            username: req.body.email || 'unknown',
            role: decoded.role,
            action: action,
            loginTime: action === 'login' ? new Date() : null,
            logoutTime: action === 'logout' ? new Date() : null,
            ipAddress: ipAddress,
            tokenName: token.substring(0, 20) + '...',
            userAgent: req.headers['user-agent']
        });
        
        await logEntry.save();
        return logEntry;
    } catch (error) {
        console.error('Error creating log entry:', error);
        throw error;
    }
};

router.post("/login", async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            await createLogEntry(req, 'login', token);
        }
        res.status(200).json({ message: "Login logged successfully" });
    } catch (error) {
        console.error('Error logging login:', error);
        res.status(500).json({ message: "Failed to log login" });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
            await createLogEntry(req, 'logout', token);
        }
        res.status(200).json({ message: "Logout logged successfully" });
    } catch (error) {
        console.error('Error logging logout:', error);
        res.status(500).json({ message: "Failed to log logout" });
    }
});

router.get("/", async (req, res) => {
    try {
        const logs = await UserLog.find().sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLog = await UserLog.findByIdAndDelete(id);
        
        if (!deletedLog) {
            return res.status(404).json({ message: "Log not found" });
        }
        
        res.json({ message: "Log deleted successfully" });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ message: "Failed to delete log" });
    }
});

module.exports = router; 