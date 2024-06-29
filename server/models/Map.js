const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    chapterTitle: String,
    nodes: [],
    edges: [],
    summary: String,
  });
  
  const MapSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    shared: {
      type: [String],
    },
    chapters: [chapterSchema],
  });

module.exports = mongoose.model('Map', MapSchema);