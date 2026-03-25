const PotholeImage = require('../models/Pothole');

// Get all potholes for current user (Status page)
exports.getAllPotholes = async (req, res) => {
  try {
    const potholes = await PotholeImage.find({ reportedBy: req.user.id })
      .sort({ createdAt: -1 })
      .select('-image');
    res.json(potholes);
  } catch (err) {
    console.error("Error fetching user potholes:", err);
    res.status(500).json({ message: 'Error fetching your potholes' });
  }
};

// Get ALL potholes for map display (no radius filter)
// Capped at 500 to stay within MongoDB Atlas M0 32MB sort memory limit.
// Uses the { createdAt: -1 } index — make sure that index exists in Atlas.
exports.getAllPotholesMap = async (req, res) => {
  try {
    const potholes = await PotholeImage.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .select('-image')                              // never send image binary in list
      .populate('reportedBy', 'username');           // just username for popup
    res.json(potholes);
  } catch (err) {
    console.error("Error fetching all potholes for map:", err);
    res.status(500).json({ message: 'Error fetching potholes' });
  }
};

exports.getPotholeById = async (req, res) => {
  try {
    const pothole = await PotholeImage.findById(req.params.id);
    if (!pothole) return res.status(404).json({ message: 'Pothole not found' });
    res.json(pothole);
  } catch (err) {
    console.error("Error fetching pothole:", err);
    res.status(500).json({ message: 'Error fetching pothole' });
  }
};

// Get nearby potholes (still used after upload to re-center map)
exports.getNearbyPotholes = async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 50000 } = req.query;
    const potholes = await PotholeImage.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .select('-image')
      .limit(100);
    res.json(potholes);
  } catch (err) {
    console.error('Error fetching nearby potholes:', err);
    res.status(500).json({ error: 'Failed to fetch nearby potholes' });
  }
};