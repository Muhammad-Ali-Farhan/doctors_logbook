const express = require('express');
const User = require('../models/User');
const { LogbookCollection } = require('../mongo'); 
const router = express.Router();


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
    
    const user = new User({ username, password });
    await user.save();
    req.session.user = user;
    res.status(201).json({ message: 'User registered' });
});


router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });

    if (user) {
        req.session.user = user;
        return res.redirect("/logbooks");
        
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;
