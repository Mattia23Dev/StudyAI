const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: String,
    nodes: [],
    edges: [],
    summary: String,
  });

const MapSchema = new mongoose.Schema({
  user: {
    type: Object,
    ref: "User",
    required: true
  },
  shared: {
    type: [String],
  },
  topic: [topicSchema],
});

module.exports = mongoose.model('Map', MapSchema);