const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
require('dotenv').config();
const router = express.Router();

const jwtSecret = process.env.SECRET; 

router.post('/register', async (req, res) => {
    console.log(req.body)
    try {
        const { nomeCompleto, email, cellulare, password } = req.body;
        let user = new User({ nomeCompleto, email, cellulare, password });
        await user.save();
        const token = jwt.sign({ userId: user.id }, jwtSecret, {});
        res.status(201).send('User registered successfully', user, token);
    } catch (error) {
        console.log(error)
        res.status(400).send(error.message);
    }
});

// Login dell'utente
router.post('/login', async (req, res) => {
    console.log(req.body)
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Login failed');
        }
        const token = jwt.sign({ userId: user.id }, jwtSecret, {});
        res.send({ message: 'User logged in successfully', token, user });
    } catch (error) {
        console.log(error)
        res.status(400).send(error.message);
    }
});

module.exports = router;