// server/routes/userRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    try {
        await user.save();
        res.status(201).json({ message: "User registered" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
    res.json({ token });
});

module.exports = router;
