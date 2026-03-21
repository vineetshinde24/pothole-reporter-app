const express = require('express');
const { getAllPotholes, getPotholeById, getNearbyPotholes } = require('../controllers/potholeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all potholes 
router.get('/', authenticateToken, getAllPotholes);

// Get specific pothole with image
router.get('/:id', authenticateToken, getPotholeById);

// Get nearby potholes (public - for map display)
router.get('/nearby/:lat/:lng', getNearbyPotholes); // No authentication needed

module.exports = router;