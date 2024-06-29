const Map = require("../models/Map");

const getMapsByUserId = async (req, res) => {
  const userId = req.params.id;
  try {
    const maps = await Map.find({ user: userId });

    res.json(maps);
  } catch (error) {
    console.error('Error fetching maps:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMapsByUserId,
};