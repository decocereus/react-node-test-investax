// const jwt = require('jsonwebtoken');
// require('dotenv').config();
// const { protect, adminOnly } = require("../middleware/authMiddleware");

// General Authentication Middleware
// const protect = (req, res, next) => {
//     const token = req.header("Authorization");
//     if (!token) return res.status(401).json({ message: "Unauthorized access" });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: "Invalid token" });
//     }
// };

// // Admin Authorization Middleware
// const adminOnly = (req, res, next) => {
//     if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
//     next();
// };

// module.exports =  {protect, adminOnly} ;
const express = require("express");
const User = require("../models/User");
const UserLog = require("../models/UserLog");
const bcrypt = require("bcryptjs");
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

const createLogEntry = async (req, user, action, token) => {
    try {
        const ipAddress = getClientIP(req);
        
        const logEntry = new UserLog({
            userId: user._id.toString(),
            username: user.email,
            role: user.role,
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

router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({ fullName, email, password: hashedPassword, role: role || "user" });
        await user.save();

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await createLogEntry(req, user, 'login', token);

        res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });
        
        if(role && user.role != role) {
            return res.status(403).json({message:"Unauthorized login attempt"});
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await createLogEntry(req, user, 'login', token);

        res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.post("/logout", async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await createLogEntry(req, user, 'logout', token);

        res.json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.get("/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
