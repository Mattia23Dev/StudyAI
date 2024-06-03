const express = require('express');
const User = require('../models/User'); 
const { processPDF } = require('../controllers/pdfExt');
const multer = require("multer");
const path = require("path")
require('dotenv').config();
const router = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL);
    try {
        const filePath = req.file.path;
        const structuredText = await processPDF(filePath);
        res.json(structuredText);
    } catch (error) {
        res.status(500).send('Error processing PDF');
    }
});

module.exports = router;