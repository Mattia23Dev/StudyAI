const express = require('express');
const User = require('../models/User'); 
const { processPDF, analyzeAndStructureText } = require('../controllers/pdfExt');
const multer = require("multer");
const path = require("path");
const Map = require('../models/Map');
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


async function saveMap(userId, analyses) {
    const topics = analyses.map(analysis => ({
      name: analysis.chapter,
      chapters: [
        {
          chapterTitle: analysis.chapter,
          nodes: analysis.structuredText.nodes,
          edges: analysis.structuredText.edges,
        }
      ],
      summary: `Summary of ${analysis.chapter}`,
    }));
  
    const newMap = new Map({
      user: userId,
      shared: [],
      chapters: topics,
    });
  
    await newMap.save();
  }
  
router.post('/analyze-text', async (req, res) => {
    const { chapterTexts, userId } = req.body;
    console.log(chapterTexts)
    try {
      const analyses = await Promise.all(
        Object.entries(chapterTexts).map(async ([chapter, text]) => {
          const structuredText = await analyzeAndStructureText(text);
          return { chapter, structuredText };
        })
      );
  
      console.log(analyses)
      await saveMap(userId, analyses);
      res.json({ analyses });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).send('Error processing request');
    }
  });

module.exports = router;