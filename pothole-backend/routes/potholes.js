const express = require('express');
const {
  getAllPotholes,
  getAllPotholesMap,
  getPotholeById,
  getNearbyPotholes,
} = require('../controllers/potholeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All potholes for map — public, no auth needed, capped at 500
// IMPORTANT: this must be defined before /:id so Express doesn't treat
// the string "all" as a MongoDB ObjectId and throw a CastError
router.get('/all', getAllPotholesMap);

// Get all potholes for current logged-in user (Status page)
router.get('/', authenticateToken, getAllPotholes);

// Get nearby potholes — public, used after upload to refresh local area
router.get('/nearby/:lat/:lng', getNearbyPotholes);

// Get specific pothole with image (authenticated — image is sensitive)
router.get('/:id', authenticateToken, getPotholeById);

module.exports = router;